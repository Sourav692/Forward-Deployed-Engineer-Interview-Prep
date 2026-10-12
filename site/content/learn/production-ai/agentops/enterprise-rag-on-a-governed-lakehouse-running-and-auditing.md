# Enterprise RAG on a Governed Lakehouse: Running and Auditing

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

