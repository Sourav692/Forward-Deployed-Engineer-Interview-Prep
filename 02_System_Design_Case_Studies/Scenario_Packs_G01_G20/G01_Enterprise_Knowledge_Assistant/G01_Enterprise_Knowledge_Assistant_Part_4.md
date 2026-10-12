# Enterprise Knowledge Assistant with Permission-Aware RAG, part 4

## 13. Say What Changes on Databricks

The design is the same on the Lakehouse; what changes is the deep dive, and it opens with a trap most candidates fall into. Draw the wrong design first, then break it.

```
   ✗  "UC governs the table, so the index is governed too"

      governed Delta table ──sync──> AI Search ──query──> every row, to everyone
         (row filter)                (row filter LOST)
```

Two facts, not one. First, Databricks AI Search (formerly Vector Search) does not enforce Unity Catalog row filters or column masks. The docs say so:

> *"Row and column level permissions are not supported. However, you can implement your own application level ACLs using the filter API."*

The index is a derived copy. The sync pipeline reads with its own identity and writes into a serving system with no concept of the caller. So there is no query-time principal for `is_account_group_member()` to evaluate. Second, and the docs now say this too, the index cannot even be created on a governed table:

```
BadRequest: Table main.meridian_rag.chunks cannot have both
            row/column security and online materialized views.
```

So the naive design is not just insecure, it does not build. The platform forces a physical split.

```
   kb.chunks              UNGOVERNED base table
      |                   SELECT granted ONLY to the sync service principal
      |
      +--------------->   AI SEARCH INDEX       (Delta Sync reads this)
      |                   layer 1 - ACL applied by the query filter
      |
      +--------------->   kb.chunks_secure      GOVERNED dynamic view
                          SELECT granted to humans and agents
                          layer 2 - UC enforces ACL + PII masking
```

Because the base table carries no policy, granting anyone `SELECT` on it bypasses the whole access model. Locking it to the pipeline identity stops being hygiene and becomes load-bearing. Write it down and audit it. One smaller gotcha costs an afternoon. `CREATE OR REPLACE TABLE` does not detach an attached row filter, so a half-finished run leaves the table un-indexable until the filter or the schema is dropped. That is why the setup is idempotent.

The two layers map directly. Layer 1 is the AI Search filter compiled from the caller's groups and passed on every query as the service principal, so unauthorised vectors are never scored. Layer 2 re-reads the returned chunk IDs from the governed view on behalf of the user (OBO is Public Preview in 2026), and the view's row predicate and PII mask are evaluated as that user.

```
  ① AI SEARCH FILTER              — runs as the service principal
     compiled from the caller's groups, passed on every single query
     → unauthorised vectors are never scored
     → an OPTIMISATION and a first line of defence
                    │  chunk_ids + ranking
                    v
  ② RE-READ FROM THE GOVERNED VIEW, AS THE USER   — on-behalf-of-user
     → the view's row predicate and PII mask run as the user
     → THIS is the authoritative decision
``` Layer 2 is not application code. It is the same engine that governs every dashboard in the company. The text that reaches the model is what came back from layer 2, never what the index returned. In the platform-agnostic build that post-check was Python that had to be proven correct with tests. Here that code is deleted and the platform enforces it. That is the argument for building on Databricks rather than beside it.

The policy is the same seven rules in SQL. On the index source table it must be a view, because of the second fact; `SET ROW FILTER` remains right on any governed table that is not an index source.

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

Seven rules in one object govern every reader of it, the agent, a notebook, a dashboard and a SQL query, not only callers who go through the application. PII is masked by the view's `CASE` keyed on `is_account_group_member('pii_readers')`, and not `ai_mask`, which is an AI transform rather than an access-control primitive. Live revocation is free, because `is_account_group_member()` reads SCIM-synced account groups, so a removal in Okta takes effect on the first query after the SCIM push reaches Databricks, with no reindex.

Encoding the ACL for the index filter is the gotcha to volunteer. AI Search filters work on scalar columns, struct fields and map values, with no array-containment operator, so `allowed_groups ARRAY<STRING>` cannot be filtered directly. The default encoding is one boolean column per group; the alternative fans out one row per chunk and group, which multiplies vectors, the expensive thing.

```
A. One BOOLEAN column per group  ← default (bounded group set)
   "tenant_id='meridian' AND sensitivity_lvl<=2 AND region IN ('GLOBAL','EU')
    AND (grp_public=true OR grp_support_t3=true OR grp_engineering=true)"

B. Fan out one row per (chunk, group), filter group_id IN (...)
   unbounded groups, but multiplies VECTORS — the expensive thing
```

The war story is the positional OR. On a Standard endpoint the filters are dictionaries and the multi-column OR takes an array with one element per clause, not a scalar.

```python
{"grp_a OR grp_b": True}          # 400: "input must be an array"
{"grp_a OR grp_b": [True]}        # 400: "length of value != number of clauses"
{"grp_a OR grp_b": [True, True]}  # ✅  grp_a = true OR grp_b = true
```

So the clause and its value array are built from the same list, so they cannot drift. It is one more reason to choose Storage-Optimized, whose filter is a SQL string that means exactly what it looks like.

|          | Standard   | Storage-Optimized (choose) |
| -------- | ---------- | -------------------------- |
| latency  | 20–50 ms  | 300–500 ms                |
| capacity | ~320M      | 1B+                        |
| cost     | higher     | ~7× lower                 |
| filters  | dictionary | SQL string                 |

300 to 500 ms of retrieval is a small slice next to 2 to 3 seconds of generation, and a SQL-string access predicate is reviewable by a security person, which is worth real money. Hybrid search and reranking are one parameter each, which deletes the hand-rolled BM25 subsystem and its worst limitation, the per-request lexical index over the authorised pool.

```python
# pip install databricks-ai-search  (replaces the deprecated databricks-vectorsearch)
from databricks.ai_search.reranker import DatabricksReranker

index.similarity_search(
    query_text=q,
    query_type="HYBRID",              # dense + BM25, managed
    filters=acl_filter,               # ← layer 1, on every call
    reranker=DatabricksReranker(columns_to_rerank=["title", "content"]),
    num_results=20)
```

Multi-Query, HyDE, decomposition and the RRF across generated queries stay in agent code, because they are orchestration patterns rather than retrieval infrastructure. Two more lines belong on the board. Never gate a release on an LLM judge; on Databricks the leak test is a SQL assertion that tests the enforcement point rather than the application. And layer 1 overshooting is by design, since embargo and need-to-know cannot be pushed into the index. So the gate measures what reaches the model, not what the index proposed. When this was built, measuring the wrong layer gave six false leaks on the first run.

Be precise about what was actually run, because "I designed this" and "I ran this" sound different to an interviewer. Everything below ran against a live workspace with a Unity Catalog metastore, a serverless SQL warehouse and an existing AI Search endpoint, with all test objects dropped afterwards.

- The whole notebook end to end in about 12 minutes, building the index and passing its own leak gate.
- The seven-rule policy enforced: Tier-1 saw 2 of 8 rows; the contract, post-mortem, pricing policy and advisory all returned `count(*) = 0`.
- The index-versus-governance conflict, confirmed by hitting it.
- A clearance change taking effect on the next query with no DDL and no reindex.
- The embargo holding even at restricted clearance with the right compartment, because `current_date()` is evaluated per query.
- The external-principal rule blocking commercial sources at maximum clearance.
- The column mask redacting where `contains_pii = true` and not otherwise.
- Six personas matching six ABAC filters exactly, including a cross-tenant principal with every group and top clearance returning zero rows.
- Hybrid search plus the dictionary operators `=`, `IN`, `>=` and `NOT` confirmed; SQL-string filters correctly rejected on a Standard endpoint.

Two things were not verified end to end, and say so. The managed reranker was refused by the workspace with *"a workspace-level configuration is preventing us from accessing the reranker model"*. On-behalf-of-user auth is public preview and needs an admin to enable.

Ask a Databricks interviewer three things. Is Unity Catalog the governance boundary today, or does Hive metastore remain to migrate? Are account groups SCIM-synced or managed in-workspace, which decides whether live revocation works? How faithfully must source-system permissions be mirrored per document? The artefact to bring is the persona-by-document visibility matrix, generated by running the same `SELECT count(*) FROM kb.chunks_secure` as each identity.

## 14. Tell It as Something Built

For "tell me about something you built", the same system is a story, and the beats stand alone so they can be played in whatever order the conversation goes. Lead with one sentence and then stop talking; the next question chooses the next beat.

> *"I built an enterprise AI search system where the hardest part wasn't finding the right answer. It was that the same question needed a different correct answer depending on who was asking, and I wanted to prove that boundary never breaks, not just hope it doesn't."*

The business-problem beat is the persona table in plain words. A support platform where a Tier-1 agent, an account manager, an engineer and an outside contractor use one assistant, and each may see a different slice of the same customer's data. The account manager gets the contract terms without the root cause. The engineer gets the root cause without the contract terms. The contractor gets nothing. One wrong answer is a data leak. The bridge to technical is that it is an access-control problem before it is an AI problem, which is where the design effort went.

The two-checkpoint beat explains the layers without a term. A fast checkpoint at the door gets a request into the right neighbourhood of documents. A slower, careful one runs right before anything is handed over, because permissions may have changed in the gap. Most systems build the first and hope nothing changes. This one assumed it would.

The trust beat tells three mistakes, because that is more informative than a story where nothing went wrong. The system once accused itself of leaking a document to someone who was allowed to see it, because the test data was mislabelled. A security rule was found that no test exercised, because a stricter rule kept masking it. And one check passed or failed almost at random, because the AI's own judgement had been allowed to decide something security-critical. The security decision was pulled apart to always be a hard rule and never a model's mood.

The platform beat is the Databricks finding, generalised. A search index built from governed data does not inherit the data's governance, because it is a copy. A revocation in the source does not reach the index downstream, so the check has to happen again, live, at query time. That is true of any architecture where a vector index sits next to but separate from operational data.

Deploy the limitations beat before being asked. The test set in that build is 22 documents. At that size almost every retrieval strategy scores well, so the differences between the six strategies benchmarked are mostly noise. Dense retrieval would be the right production choice for a corpus this small. What the size does not weaken is the zero-leak guarantee and the testing discipline behind it. For a real customer the corpus would be larger and tiered. The storage-isolation strategy would be designed for tenant growth up front, and the scale caveat instrumented from day one.

Close on whichever thread the conversation ended on. On trust: an FDE's job is turning a technical guarantee into something a customer's security team can sign off on. On platforms: never assume a guarantee travels between systems until it has been verified on their specific platform. On limitations: better to say exactly where the edges of what has been proven are than to let them be found later.
