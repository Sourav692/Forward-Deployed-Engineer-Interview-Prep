# Access-Controlled RAG on Databricks

*Letting the platform enforce access deletes code that had to be proven correct, but the vector index sits outside that enforcement and forces a split design.*

On Databricks, most access control is Unity Catalog's job, not application code's. Two Vector Search facts decide the whole physical architecture, so lead with them and reuse the platform-agnostic design from [Access-Controlled Enterprise RAG](/learn/ai-systems-design/classic-ai-designs/access-controlled-enterprise-rag) for everything else.

**Objectives:**

- state the two Vector Search governance facts and the table-and-view split they force;
- write the access policy as a Unity Catalog row filter or view with a column mask;
- encode group membership for index filters and choose the endpoint type;
- carry the user's identity to the governed read, and test leaks with a SQL assertion;
- name what was verified on a live workspace and what was not.

---

## Plant the Hook in the Framing Sentence

Use this version when the interviewer is a Databricks customer or asks how the design runs on their stack. The persona table, the scope and the generic failure table are the same as in [Access-Controlled Enterprise RAG](/learn/ai-systems-design/classic-ai-designs/access-controlled-enterprise-rag). The framing sentence changes its ending. On Databricks, most of the access work is Unity Catalog's job rather than ours, with two specific exceptions that decide the physical architecture.

That last clause plants a hook. It signals knowledge of the sharp edge before anyone asks. The time plan shifts to match: 15–35 minutes go to the two Vector Search facts and the two-layer answer.

Add four Databricks-specific clarifying questions. Is Unity Catalog already the governance boundary, or is data still in a Hive metastore and external systems? If not, that migration is the first project, not the RAG. Are groups SCIM-synced from Okta or Entra? Hand-managed workspace groups break live revocation. Must source-system permissions be mirrored per document, or is a coarser model acceptable? Finally, is serverless available, and in which cloud and region? Residency is both a row-filter rule and a workspace-placement decision.

## Lead With the Two Vector Search Facts

Draw the naive design first, then break it. The naive claim is that Unity Catalog governs the table, so the index is governed too. It is not.

First fact: Databricks Vector Search does not enforce Unity Catalog row filters or column masks. The documentation says row- and column-level permissions are not supported, and points to application-level ACLs through the filter API. The index is a derived copy. The sync pipeline reads with its own identity and writes into a serving system with no concept of end users. With no query-time principal, `is_account_group_member()` has nobody to evaluate.

Second fact, found by building it rather than in the limitations page: the index cannot even be created on a governed table. It fails at creation.

```
BadRequest: Table main.meridian_rag.chunks cannot have both
            row/column security and online materialized views.
```

So the naive design is not only insecure; it does not build. Pause on this. It is specific, counter-intuitive and verifiable, and most candidates get it wrong.

## Split the Base Table From the Governed View

The platform forces a physical split.

```
   kb.chunks              UNGOVERNED base table
      |                   SELECT granted ONLY to the sync service principal
      |
      +--------------->   VECTOR SEARCH INDEX   (Delta Sync reads this)
      |                   layer 1 - ACL applied by the query filter
      |
      +--------------->   kb.chunks_secure      GOVERNED dynamic view
                          SELECT granted to humans and agents
                          layer 2 - UC enforces ACL + PII masking
```

Because the base table carries no policies, granting anyone `SELECT` on it bypasses the whole access model. Locking it to the pipeline identity stops being hygiene and becomes load-bearing. Write that rule down and audit it.

> **Warning: `CREATE OR REPLACE TABLE` does not detach an attached row filter.** A half-finished setup run can leave the table permanently un-indexable until the filter or the schema is dropped. Make the setup idempotent.

## Let Unity Catalog Be the Second Layer

The two-layer answer from the platform-agnostic design survives, but layer 2 changes owner. Layer 1 is the Vector Search filter. It runs as the service principal, compiled from the caller's groups and passed on every query. Unauthorised vectors are never scored, so it is an optimisation and a first line of defence.

Layer 2 re-reads the returned chunk IDs from the governed view, on behalf of the user. Unity Catalog applies the row filter and column mask itself, and that is the authoritative decision. The text that reaches the model is what layer 2 returned, never what the index returned.

Layer 2 is not application code; it is the same engine that governs every dashboard in the company. The platform-agnostic build had to write that post-check in Python and prove it with tests. Here that code is deleted and the platform enforces it. That is the argument for building on Databricks rather than beside it.

## Write the Policy Once, in SQL

The same seven rules become one SQL function. On any governed table that is not an index source, attach it with `SET ROW FILTER`. On the index source, the same predicate must live in a view, because of the second fact.

```sql
CREATE OR REPLACE FUNCTION security.chunk_row_filter(
  tenant_id STRING, sensitivity_lvl INT, region STRING,
  need_to_know STRING, valid_from DATE, valid_until DATE, source_system STRING)
RETURN is_account_group_member('kb_admins')
    OR EXISTS (SELECT 1 FROM security.user_entitlements e
               WHERE e.user_email = current_user()
                 AND tenant_id = 'meridian'                              -- tenant
                 AND sensitivity_lvl <= e.clearance_lvl                  -- clearance
                 AND (region = 'GLOBAL' OR region = e.region)            -- residency
                 AND (valid_from IS NULL OR valid_from <= current_date())-- embargo
                 AND (need_to_know IS NULL OR need_to_know = e.compartment)
                 AND (NOT e.is_external OR source_system NOT IN ('contract','pricing')));

-- on a table that is NOT a vector index source:
ALTER TABLE kb.chunks_governed SET ROW FILTER security.chunk_row_filter ON (...);

-- on the index source, the same predicate goes in a view instead:
CREATE OR REPLACE VIEW kb.chunks_secure AS
SELECT chunk_id, doc_id,
       CASE WHEN NOT contains_pii THEN content
            WHEN is_account_group_member('pii_readers') THEN content
            ELSE regexp_replace(content,'[\w.+-]+@[\w-]+\.[\w.-]+','[REDACTED_EMAIL]')
       END AS content
FROM kb.chunks c WHERE EXISTS ( ...the seven rules... );
```

One object holds seven rules and governs every reader: the agent, a notebook, a dashboard and a SQL query. It does not only protect callers who go through application code.

PII becomes a column mask keyed on `is_account_group_member('pii_readers')`. Draw the distinction for anyone who knows the platform. A Unity Catalog column mask is an access-control primitive. `ai_mask` is an AI transform, and it should never sit between a user and PII.

Live revocation takes one sentence. `is_account_group_member()` reads SCIM-synced account groups, so removing someone in Okta takes effect on their next query, with no reindex, cache bust or code.

## Encode Groups for the Index Filter

Vector Search filters work on scalar columns. There is no documented array-containment operator, so an `allowed_groups ARRAY<STRING>` column cannot be filtered directly. Pick one of two encodings out loud.

| Encoding | How | Cost |
|---|---|---|
| One boolean column per group (default for a bounded group set) | `tenant_id='meridian' AND sensitivity_lvl<=2 AND region IN ('GLOBAL','EU') AND (grp_public=true OR grp_support_t3=true OR grp_engineering=true)` | A column per group |
| One row per chunk and group | Filter `group_id IN (...)` | Handles unbounded groups, but multiplies vectors, the expensive thing |

The reference build hit a gotcha worth telling. On a Standard endpoint, filters are dictionaries, and a multi-column OR is positional. Its value must be an array with one element per OR clause.

```python
{"grp_a OR grp_b": True}          # 400: "input must be an array"
{"grp_a OR grp_b": [True]}        # 400: "length of value != number of clauses"
{"grp_a OR grp_b": [True, True]}  # works: grp_a = true OR grp_b = true
```

The array must be regenerated whenever the caller's group count changes. Build the clause and its value array from the same list so they cannot drift.

## Choose the Storage-Optimized Endpoint

That gotcha is one more reason to choose Storage-Optimized. Its filter is a SQL string, so `(grp_a = true OR grp_b = true)` means exactly what it looks like.

| | Standard | Storage-Optimized (choose) |
|---|---|---|
| Latency | 20–50 ms | 300–500 ms |
| Capacity | ~320M | 1B+ |
| Cost | Higher | ~7× lower |
| Filters | Dictionary | SQL string |

Retrieval of 300–500 ms is invisible next to a 2-second generation. A SQL-string filter also makes the access predicate reviewable by a security person, which is worth real money.

Retrieval itself shrinks to parameters. Hybrid search is one parameter, replacing a hand-rolled BM25 index. It also removes the worst limitation of the platform-agnostic build, the per-request lexical index over the authorised pool. Reranking is another parameter: the managed reranker takes the top ~50 before returning the top-k.

```python
index.similarity_search(
    query_text=q,
    query_type="HYBRID",              # dense + BM25, managed
    filters=acl_filter,               # layer 1, on every call
    reranker={"model": "databricks_reranker",
              "parameters": {"columns_to_rerank": ["title", "content"]}},
    num_results=20)
```

Multi-query, HyDE, decomposition and RRF across generated queries stay in agent code. Those are orchestration patterns, not retrieval infrastructure.

## Carry the User's Identity to the Governed Read

Layer 2 is only real if the read runs as the user. The app or agent endpoint receives credentials that Databricks downscopes to declared scopes and forwards as `x-forwarded-access-token`. Call `get_user_workspace_client()` inside the request handler, never at startup. The SQL warehouse then reads `kb_chunks_secure`, and Unity Catalog applies the row filter and mask.

Name the caveats unprompted; they are credibility, not weakness. On-behalf-of-user auth for agent endpoints is public preview, and an admin must enable it. Token refresh can lag ~5 minutes. And the token exists only at request time.
