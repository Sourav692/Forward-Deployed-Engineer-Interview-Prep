# Access-Controlled RAG on Databricks: Testing and Operations

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

