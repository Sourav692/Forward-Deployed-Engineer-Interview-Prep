# Access-Controlled RAG on Databricks

*Letting the platform enforce access deletes code that had to be proven correct, but the vector index sits outside that enforcement and forces a split design.*

◷ 16 min

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

## Test Leaks Where Enforcement Happens

Evaluation keeps three families: retrieval, generation and security. Security is a gate, not a metric.

```python
@scorer
def no_leak(inputs, outputs, expectations):
    leaked = set(expectations["forbidden_docs"]) & set(outputs["retrieved_doc_ids"])
    return {"value": 0.0 if leaked else 1.0}

mlflow.genai.evaluate(data=uc_dataset, predict_fn=ask_as_user,
                      scorers=[Correctness(), RetrievalGroundedness(), no_leak])
```

Never gate a release on an LLM judge. `Correctness` varies run to run, while `no_leak` is set arithmetic. In the platform-agnostic build, a security case flapped because the sufficiency verdict came from an LLM. There were zero leaks either way, but a flaky alarm trains people to ignore alarms.

On Databricks, the leak test does not even need the agent. It is a SQL assertion against the governed view, run as the Tier-1 identity, and it must return 0.

```sql
SELECT count(*) FROM kb.chunks_secure WHERE doc_id = 'CT-VTX-001';
```

That tests the enforcement point itself, not the code's use of it. Measure what reaches the model, not what the index proposed. Layer 1 overshoots by design, because embargo and need-to-know cannot be pushed into the index. Measuring the wrong layer produced 6 false leaks the first time. If pressed on evaluation maturity, mention MemAlign, which aligns a judge to SME labels through a labelling session, and `optimize_prompts()` with GEPA.

## Observe, Isolate Tenants, and Fail Closed

Observability is mostly free.

| Question | Answered by |
|---|---|
| Why was this answer wrong? | MLflow Traces: spans, retrieved IDs, prompt version, tokens |
| Did this user ever read that document? | `system.access.audit` |
| Which tenant is burning budget? | `system.billing.usage` |
| What feeds this table? | `system.access.table_lineage` |

Volunteer the gap. `system.access.audit` covers the Delta read, but a Vector Search query is not a Unity Catalog table read, so it does not land there. Because layer 2 re-reads everything from the governed table, the audit trail is complete for anything the user actually saw. Log the index's raw return separately anyway. Rows the index returned that the view then dropped are the staleness signal, and on Databricks that becomes an alertable metric.

For multi-tenancy, use a catalog per tenant, which is a hard boundary and the natural unit for residency and CMEK. Add a `tenant_id` predicate in the row filter too, for defence in depth. Per-tenant AI Gateway rate limits handle noisy neighbours, and tagged endpoints and warehouses let billing attribute cost per tenant.

The failure table follows the platform-agnostic one with Databricks names. The model endpoint falls back through AI Gateway. A down Vector Search endpoint falls back to keyword search over the governed view, flagged as degraded. A lagging sync serves what is fresh, and layer 2 keeps it safe, just less complete. One row is different in kind. If the SQL warehouse or Unity Catalog is unavailable, fail closed and refuse. Never serve layer 1's results because layer 2 is down; that is a leak with a good excuse.

Scale and cost change shape. Delta Sync is incremental through Change Data Feed, so only changed chunks re-embed. Decouple ACL updates from content updates: a permission change is a cheap column write, while a content change means re-embedding. Storage-Optimized scales past 1B vectors with index sync ~20× faster than Standard. Cost shifts from per-token to per-hour, because endpoints and warehouses bill while provisioned. At low volume that can cost more than a DIY stack; at enterprise volume it is dramatically cheaper.

## Separate What Ran From What Was Designed

"I designed this" and "I ran this" are different claims, and interviewers hear the difference. The reference build ran against a live workspace with a Unity Catalog metastore, a serverless SQL warehouse and an existing Vector Search endpoint. Its notebook ran end to end on serverless in ~12 minutes, built the index and passed its own leak gate.

On that workspace, the seven-rule policy was enforced: Tier-1 saw 2 of 8 rows, and the contract, post-mortem, pricing policy and advisory each returned zero. The index-and-governance conflict was confirmed by hitting it. A clearance change with no DDL and no reindex surfaced restricted rows on the next query. The embargo held even at restricted clearance with the right compartment. External principals were blocked from commercial sources despite maximum clearance. The column mask redacted only where `contains_pii` was true.

Vector Search ABAC filters matched exactly for 6 personas, including a cross-tenant principal returning zero rows despite every group and top clearance. Hybrid search and the dictionary operators `=`, `IN`, `>=` and `NOT` worked, and SQL-string filters were correctly rejected on a Standard endpoint.

Two things were not verified. The managed reranker accepted the parameter shape, but the workspace reported a configuration preventing access to the reranker model. Treat its availability as something to confirm per workspace. On-behalf-of-user auth, public preview and admin-enabled, was read carefully but not run, although the design depends on it. Being precise about that line is worth more than pretending everything is battle-tested.

## Worked Example: A Tier-1 Agent Asks About Vertex

A Tier-1 support agent asks in the app. The handler builds a Vector Search filter from their groups, such as `grp_public` and the Tier-1 support group, and calls `similarity_search` with hybrid and reranking. The index runs as the service principal and returns ranked chunk IDs, possibly including some the agent may not see.

The handler then reads those IDs from `kb.chunks_secure` with the agent's forwarded token. Unity Catalog evaluates the row filter as that user. The contract, post-mortem, pricing policy and advisory drop out, and any PII in what remains is masked. Only that result reaches the model, and the answer is the platform backlog.

The rows dropped between index and view are logged as the staleness signal, and the MLflow trace records the run. Nothing in the flow depended on application code making the access decision. The physical split, forced by two platform facts, is what made that possible.

## Close on Unity Catalog and SCIM

Summarise in three sentences. This is multi-source RAG on the Lakehouse, with Unity Catalog as the authority on access. A compiled ACL filter makes Vector Search cheap, and an on-behalf-of-user re-read from the governed view makes it correct. Hybrid retrieval and reranking are managed, the agent is traced and registered, and every release is gated on a deterministic zero-leak assertion.

| Decision | Chose | Would revisit if |
|---|---|---|
| Two-layer enforcement | Vector Search filter plus OBO governed re-read | Vector Search ships real row-level security; then collapse to one layer |
| Storage-Optimized endpoint | Yes: cost and SQL filters | A sub-100 ms interactive SLA; then Standard |
| Boolean column per group | Yes: bounded group set | Thousands of groups; then fan-out rows or a per-request authorisation service |
| Catalog per tenant | Yes | Hundreds of small tenants; then schema per tenant plus a row filter |

The forward-deployed close changes too. Week one is getting Unity Catalog and SCIM right, landing one source, writing the row filter, and proving the model for three personas with SQL assertions. If Unity Catalog and SCIM are not in place, that is the project, and saying so on day one beats discovering it in week three. The artefact to bring is a persona-by-document visibility matrix from running the same `SELECT count(*)` as each identity, with every cell decided by Unity Catalog.

---

## Key Takeaways

- Reuse the platform-agnostic design, but end the framing on the two Databricks exceptions and add four platform questions.
- Vector Search does not enforce row filters or column masks, and an index cannot be built on a governed table.
- Keep an ungoverned base table locked to the sync principal and a governed view for every human and agent.
- Layer 1 is the index filter; layer 2 is Unity Catalog on a re-read as the user, and only layer 2's text reaches the model.
- One SQL function holds the seven rules; PII is a column mask, not `ai_mask`; SCIM gives live revocation.
- Encode groups as boolean columns and beware the Standard endpoint's positional OR.
- Choose Storage-Optimized for cost and SQL-string filters; hybrid and reranking become parameters.
- On-behalf-of-user identity makes layer 2 real; name its preview status and refresh lag.
- Gate on a deterministic leak check, ideally a SQL assertion against the governed view.
- Log index-versus-view drops as staleness, isolate tenants by catalog, and fail closed if Unity Catalog is down.
- State plainly what ran on a live workspace and what did not.
- Close on Unity Catalog and SCIM as week-one work.

## Check Yourself

1. **Why can the index not simply read the governed table?**
   Vector Search does not enforce row filters or masks, and creating a Delta Sync index on a table with row or column security fails outright.

2. **What happens if someone is granted `SELECT` on the ungoverned base table?**
   They bypass the entire access model, because that table carries no policies. Locking it to the sync principal is load-bearing.

3. **What should the system do if the SQL warehouse is down but Vector Search is up?**
   Fail closed and refuse. Serving layer 1's results without layer 2 is a leak with a good excuse.

