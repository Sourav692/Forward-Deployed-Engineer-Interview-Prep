# Enterprise RAG on a Governed Lakehouse

*Buying the platform removes most of the code to write and defend, but the one gap it leaves in access control decides the whole physical design.*

On a lakehouse, most of a hand-built enterprise RAG system becomes platform primitives, while the permission policy stays yours. Buy the undifferentiated layers, build the customer-specific logic, and design around the one fact the platform will not do for you: the vector index does not enforce row-level security.

**Objectives:**

- decide what to build and what to buy across an AI platform stack;
- explain the two Vector Search facts and the forced two-object design they create;
- enforce access in two layers, with on-behalf-of-user identity making the second one real;
- test the enforcement point with a SQL assertion and name the honest trade-offs.

---

## Buy the Undifferentiated Layers

The principle is simple: buy the undifferentiated layers and build the customer-specific logic.

| Layer | Default | Build only when |
|---|---|---|
| Identity and login | The customer's own identity provider | Never; someone already owns this solved problem |
| Secrets storage | A managed vault | Almost never; "we built our own" security infrastructure is a red flag |
| Search and vector index | A managed search product | Self-host only at very large scale, or when data legally cannot leave an environment |
| Monitoring | An existing, standards-compatible platform | A thin custom layer for missing domain fields, on top, not instead |
| Permission rules, retrieval tuning, prompt design, the customer's workflows | Always build | These encode the customer's data, policy and process |

The line is not "build everything to prove capability" or "buy everything to move fast". It is whether a component encodes something specific to this customer's business.

## Map the Hand-Built System to Primitives

The handbook first built enterprise RAG by hand: a policy engine, an identity file, a BM25 index, a reranker, a trace layer and an evaluation harness. On Databricks most of it maps to a primitive.

| Hand-built | Databricks primitive |
|---|---|
| ACL manifest synced into a SQLite catalogue | Delta columns in Unity Catalog |
| The Python rules engine | Unity Catalog row filters and column masks (SQL functions) |
| A JSON file of personas | SCIM groups and `is_account_group_member()` |
| A post-retrieval re-check in Python | Unity Catalog enforcing the row filter, on behalf of the user |
| A PII redaction regex | A Unity Catalog column mask |
| ChromaDB | Mosaic AI Vector Search (Delta Sync index) |
| BM25 plus hand-written fusion | `query_type="HYBRID"` |
| An LLM reranker | `databricks_reranker`, which reranks the top 50 |
| External embeddings | `databricks-gte-large-en`, computed by the platform |
| A LangGraph script | LangGraph inside Mosaic AI Agent Framework |
| A custom trace module | MLflow Tracing into Unity Catalog tables |
| The evaluation harness | `mlflow.genai.evaluate()` with custom scorers |
| "Who read what?" and cost attribution | `system.access.audit` and `system.billing.usage` |

## Design Around the Two Facts

**Fact 1: Vector Search does not enforce Unity Catalog row filters or column masks.** The documentation says row and column permissions are not supported, and suggests application-level ACLs through the filter API.

**Fact 2: a Delta Sync index will not even build on a governed table.** This is not on the limitations page; it was found by trying. With a row filter attached to the chunks table, index creation fails with an error that the table cannot have both row or column security and online materialised views.

Fact 1 alone would let the naive design be built and merely be insecure. Fact 2 stops it building at all. The reason is that the index is a derived copy. The sync pipeline reads the source table with its own identity and writes vectors into a serving system with no concept of users. There is no query-time user against whom to evaluate group membership.

An operational trap surfaced the same way. `CREATE OR REPLACE TABLE` does not detach an attached row filter or mask. A half-finished run leaves the table permanently un-indexable until the filter and mask are dropped. Make setup idempotent.

## Split the Data Into Two Objects

The forced design has two objects.

```
   kb.chunks            UNGOVERNED base table, SELECT granted ONLY to the sync principal
      ├──────────>       VECTOR SEARCH INDEX      layer ①: ACL applied by the query filter
      └──────────>       kb.chunks_secure         GOVERNED dynamic view, SELECT for humans and agents
                                                  layer ②: ACL and PII masking by Unity Catalog
```

Because the base table carries no policies, granting anyone `SELECT` on it bypasses the whole access model. Locking it to the pipeline identity is load-bearing, not hygiene.

```sql
REVOKE SELECT ON TABLE kb.chunks        FROM `analysts`;
GRANT  SELECT ON VIEW  kb.chunks_secure TO   `analysts`;
```

A dynamic view carries the row rules and the column masking in one object. Here it is the only mechanism that coexists with the index.

## Enforce in Two Layers That Do Not Trust Each Other

**Layer 1 is the Vector Search filter.** It is compiled from the caller's groups and passed on every query, so unauthorised vectors are never scored or returned. It is an optimisation and a first line of defence.

**Layer 2 re-reads the returned chunk IDs from the governed view, on behalf of the user.** Unity Catalog applies the row filter and column mask itself. This is the authoritative decision.

In the hand-built version, Layer 2 was code that had to be proven correct with tests. Here it is Unity Catalog, the engine that already governs every dashboard and notebook in the company. The text sent to the model always comes from Layer 2, never from the index. The index supplies candidate IDs and ranking; the governed view supplies content the user may read.

Enforcement order changes slightly. By hand, enforcement ran before reranking. Here Layer 1 precedes the reranker and Layer 2 follows it. Anything Layer 2 drops leaves a gap in the context, which is the right failure direction: material vanishes rather than leaks.

## Lay the Data Out as a Medallion

Bronze holds raw documents in a Unity Catalog volume with source metadata in Delta; PDFs go through `ai_parse_document`. Only admins read it.

Silver holds one row per chunk, and the ACL columns live here: `tenant_id`, `source_system`, `sensitivity` and `sensitivity_lvl`, `region`, `contains_pii`, `need_to_know` and validity dates. It also holds one BOOLEAN per group, such as `grp_public` and `grp_support_t3`. Change data feed is on, which tells the index what changed and makes incremental re-embedding cheap.

Gold holds the Vector Search index and the governed view. It must be a view, not a filter on the base table, because of Fact 2.

## Encode Groups So the Index Can Filter

Vector Search filters work on scalar columns. There is no array-containment operator, so an `allowed_groups` array cannot be filtered directly. One BOOLEAN column per group works when the group set is bounded, tens rather than thousands.

```python
# Storage-Optimized endpoint: SQL-string filters
filters = ("tenant_id = 'meridian' AND sensitivity_lvl <= 2 "
           "AND region IN ('GLOBAL', 'EU') "
           "AND (grp_public = true OR grp_support_t3 = true OR grp_engineering = true)")
```

Standard endpoints take dictionary filters, and their multi-column `OR` is positional. That cost two failed runs against a live index. The value must be an array with exactly one element per OR clause.

```
{"grp_a OR grp_b": [True, True]}   ->  grp_a = True OR grp_b = True   ✅
{"grp_a OR grp_b": True}           ->  400: "input must be an array"   ❌
{"grp_a OR grp_b": [True]}         ->  400: length does not match the clauses ❌
```

Generate the clause and the array from one list so they cannot drift. The alternative, one row per chunk and group, supports unbounded groups but multiplies vectors, the expensive thing. Use it only when group count breaks the BOOLEAN encoding.

| | Standard endpoint | Storage-Optimized endpoint |
|---|---|---|
| Latency | 20–50 ms | 300–500 ms |
| Capacity | ~320M vectors | 1B+ |
| Cost | Higher | ~7× lower |
| Filters | Dictionary | SQL string, reviewable by a security person |

For an internal assistant where a 2 s generation dominates, 300 to 500 ms of retrieval is invisible. Choose Storage-Optimized and spend the savings on reranking.

## Write the Policy Once, in SQL

The governed layer reads an entitlements table, not hard-coded groups. The whole policy becomes one SQL function. It checks admin bypass, then six rules for the current user: tenant isolation, a clearance ladder, data residency, embargo and expiry evaluated at query time, need-to-know compartments, and a block on commercial sources for external users. On governed tables that are not the index source, attach it as a row filter. For the index source, the same predicate sits in the secure view's `WHERE`, beside the PII mask.

The policy now protects the table for every reader: the agent, a notebook, a dashboard and the SQL editor. By hand, it only protected callers who went through the application code.

PII becomes a column mask: a `regexp_replace` on content when `contains_pii` is set and the caller is not a PII reader. A column mask is a deterministic governance policy. An AI masking function must never be what stands between a user and PII. One gotcha carries over from the hand-built version: a `\w` inside a Spark SQL string dies silently in the escaping chain. Use explicit character ranges and assert on real data.

Group membership comes from SCIM-synced account groups, so the identity provider stays the source of truth. Live revocation is free: remove someone in the identity provider, SCIM syncs, and the next query drops those rows. There is no reindex, no cache and no code.

## Run the Query as the User

Layer 2 means something only if the query runs as the user.

| | Service-principal auth | On-behalf-of-user (OBO) |
|---|---|---|
| Identity used | One shared principal | The actual end user |
| Row filters and masks | The principal's own access | Enforced automatically |
| Use when | Everyone sees the same data | Access differs per user |

The user calls a Databricks App or agent endpoint. Databricks down-scopes the user's credentials to the declared scopes and forwards them as a token header. Agent code creates the user's workspace client inside the request handler, not at startup. The query on the secure view then runs as the user. Declare only the SQL and serving scopes.

State the caveats. OBO for agent serving endpoints is in public preview and needs admin enablement. Token forwarding can take up to about 5 minutes to reflect a permission refresh. The token exists only at request time.

The Vector Search query itself still runs as the service principal, because the index has no user-level security. That is why Layer 1 is only a filter and Layer 2 is the authority. Relying on the index query alone is a bug.

## Retrieve, Evaluate, and Audit on the Platform

One `similarity_search` call with `query_type="HYBRID"`, the ACL filter and the managed reranker replaces the BM25 index, the fusion code and the per-request lexical index rebuild that limited the hand-built version at scale. Multi-query, HyDE and decomposition stay in agent code, as prompt-and-orchestration patterns. The agent runs inside Mosaic AI Agent Framework, is registered in Unity Catalog and is served behind a Databricks App. Who can deploy the agent is then governed by the same permission system as who can read a table.

The leak gate is a custom deterministic scorer, `no_leak`, that checks whether any forbidden document was retrieved or cited. Correctness and groundedness judges vary run to run; `no_leak` is set arithmetic and does not. Only the deterministic scorer blocks a deploy. The leak test can also be a plain SQL assertion against the governed view, run as the persona. For example, `SELECT count(*) FROM kb.chunks_secure WHERE doc_id = 'CT-VTX-001'` must return 0. That tests the enforcement point itself, not the application's use of it.

Observability splits by question. MLflow traces explain wrong answers. `system.access.audit` shows who read what. `system.billing.usage` shows spend. Table lineage shows what feeds a table. One gap remains honest: the audit table covers Delta reads, and a Vector Search query is not one. Layer 2 re-reads every candidate, so the trail covers everything the user saw. Still, log what the index returned before enforcement into your own Delta audit table. Rows returned by the index and dropped by the view are the filter-disagreement signal, now a metric to alert on.

For multi-tenancy, a catalogue per tenant with an index per tenant is the hard boundary and the default for regulated customers. Combine it with a row-level `tenant_id` filter for defence in depth. Add per-tenant gateway rate limits and tag endpoints and warehouses for cost attribution.

## Weigh the Trade-Offs Honestly

The platform version is genuinely better in several ways. The platform enforces access at the table, for every consumer. SCIM gives live revocation without code. Managed hybrid search and reranking remove the worst scaling limit. Audit, lineage and cost come from systems the security team already trusts. One governance model covers data, models, prompts and evaluation sets.

Some things need care. The Vector Search ACL gap is a real trap, and the first thing to tell anyone building this. OBO is in preview. The index is eventually consistent with the governed table: a newly restricted document can stay in the index until the next sync. That is why Layer 2 is non-negotiable rather than belt-and-braces. The BOOLEAN-per-group encoding means a schema change whenever a group appears. Cost shifts from per token to per hour. At low volume, serverless everything can cost more than the open-source build; at enterprise volume it is much cheaper, and someone else runs it.

> **Warning: a passing index filter is not a security test.** Querying the index without a filter as a Tier-3 engineer returned two documents the row filter forbids. Only the governed-view re-read stops them. Test Layer 2, not just Layer 1.

## Worked Example: What the Live Run Proved

Everything below was executed against a live workspace. The seven-rule row filter compiled and attached. A Tier-1 user saw 2 of 5 rows. Contract and post-mortem documents returned a count of 0. A clearance change took effect on the next query with no DDL and no reindex. An embargoed advisory stayed hidden even at restricted clearance with the right compartment. The column mask redacted the same column in one row and left it untouched in another, in the same query.

On Vector Search, ABAC filters returned exactly the right set for all 6 personas. That included a cross-tenant principal with every group and top clearance, which got zero rows. The run also corrected the documentation: the multi-column `OR` is positional. The managed reranker's parameters were accepted, but the workspace returned a configuration error, so it stays unverified end to end.

The notebook then broke Layer 1 on purpose. Unity Catalog dropped `CT-VTX-001`, `PR-002` and `SA-2026-07` at Layer 2, and the release gate reported 0 leaks reaching the model. Layer 1 overshoots by design, because embargo and need-to-know cannot be pushed into the index filter; Layer 2 stops what it lets through. The run also found that a ready index can briefly report "not ready" between syncs, so treat that as retryable with backoff.

---

## Key Takeaways

- Buy identity, secrets, search and monitoring; build the permission rules, retrieval tuning, prompts and workflows.
- Vector Search does not enforce row filters and will not index a governed table, which forces an ungoverned base table locked to the sync principal plus a governed dynamic view.
- Layer 1 filters the index for speed; Layer 2 re-reads candidates from the governed view as the user and is the authority.
- Encode groups as BOOLEAN columns, prefer Storage-Optimized endpoints with SQL filters, and mind the positional `OR`.
- Write the policy once as SQL, mask PII deterministically, and let SCIM give live revocation.
- On-behalf-of-user identity makes Layer 2 real; the index query still runs as the service principal.
- Gate deploys on deterministic `no_leak` and SQL assertions, log index results for audit, and state the eventual-consistency trade-off.

## Check Yourself

1. **Why is locking the base table to the sync principal load-bearing rather than hygiene?**
   The base table carries no policies, so anyone with `SELECT` on it bypasses the whole access model.

2. **Why is `no_leak` the only scorer allowed to block a deploy?**
   It is deterministic set arithmetic. The correctness and groundedness judges vary from run to run, so they cannot be a hard gate.

3. **Which trade-off makes Layer 2 non-negotiable?**
   The index is eventually consistent with the governed table, so a newly restricted document can stay in the index until the next sync.

