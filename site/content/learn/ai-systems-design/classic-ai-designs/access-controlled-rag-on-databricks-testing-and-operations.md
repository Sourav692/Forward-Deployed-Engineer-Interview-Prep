# Access-Controlled RAG on Databricks: Testing and Operations

## Test Leaks Where Enforcement Happens

For Meridian's support assistant, evaluation must cover retrieval, generation, and security. Zero observed leaks is a release gate, not proof against every possible disclosure.

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

Platform logs help, but application correlation, redaction, retention, and access still need design.

| Question | Answered by |
|---|---|
| Why was this answer wrong? | MLflow Traces: spans, retrieved IDs, prompt version, tokens |
| Did this user ever read that document? | `system.access.audit` |
| Which tenant is burning budget? | `system.billing.usage` |
| What feeds this table? | `system.access.table_lineage` |

Volunteer the gap. `system.access.audit` covers the Delta read, but a Vector Search query is not a Unity Catalog table read, so it does not land there. Because layer 2 re-reads everything from the governed table, the governed read has an audit trail. Correlate it with model inputs, returned citations, cache hits, and the application response; SQL logs alone do not prove what was displayed. Log the index's raw return separately anyway. Rows the index returned that the view then dropped are the staleness signal, and on Databricks that becomes an alertable metric.

For multi-tenancy, use a catalog per tenant, with explicit grants, workspace placement, and customer-managed encryption keys (CMEK) where required. A catalog name alone is neither isolation nor residency. Add a `tenant_id` predicate in the row filter too, for defence in depth. Per-tenant AI Gateway rate limits handle noisy neighbours, and tagged endpoints and warehouses let billing attribute cost per tenant.

The failure table follows the platform-agnostic one with Databricks names. The model endpoint falls back through AI Gateway. A down Vector Search endpoint falls back to keyword search over the governed view, flagged as degraded. A lagging sync serves what is fresh, and layer 2 keeps it safe, just less complete. One row is different in kind. If the SQL warehouse or Unity Catalog is unavailable, fail closed and refuse. Never serve layer 1's results because layer 2 is down; that is a leak with a good excuse.

Scale and cost change shape. Delta Sync uses Change Data Feed for incremental updates. Verify when the configured embedding pipeline recomputes vectors. Decouple ACL updates from content updates: a permission change is a cheap column write, while a content change means re-embedding. The reference sizes Storage-Optimized beyond 1B vectors; verify current limits for the configured dimensions. Cost shifts from per-token to per-hour, because endpoints and warehouses bill while provisioned. The source reports ~20× faster index sync and lower cost at scale for Storage-Optimized. These are reference comparisons, not guarantees. Benchmark the workload and account for provisioned idle cost.

## Separate What Ran From What Was Designed

"I designed this" and "I ran this" are different claims, and interviewers hear the difference. The supplied source reports a build against a live workspace with a Unity Catalog metastore, a serverless SQL warehouse and an existing Vector Search endpoint. Its notebook ran end to end on serverless in ~12 minutes, built the index and passed its own leak gate.

On that workspace, the seven-rule policy was enforced: Tier-1 saw 2 of 8 rows, and the contract, post-mortem, pricing policy and advisory each returned zero. The index-and-governance conflict was confirmed by hitting it. A clearance change with no DDL and no reindex surfaced restricted rows on the next query. The embargo held even at restricted clearance with the right compartment. External principals were blocked from commercial sources despite maximum clearance. The column mask redacted only where `contains_pii` was true.

Vector Search ABAC filters matched exactly for 6 personas, including a cross-tenant principal returning zero rows despite every group and top clearance. Hybrid search and the dictionary operators `=`, `IN`, `>=` and `NOT` worked, and SQL-string filters were correctly rejected on a Standard endpoint.

Two things were not verified. The managed reranker accepted the parameter shape, but the workspace reported a configuration preventing access to the reranker model. Treat its availability as something to confirm per workspace. The source did not run its on-behalf-of-user path, which it described as preview and admin-enabled. The design depends on verifying that path in the target hosting environment. Being precise about that line is worth more than pretending everything is battle-tested.

## Worked Example: A Tier-1 Agent Asks About Vertex

> **Added production guidance:** these clarification and payload examples are illustrative. No Databricks workspace was queried during this editorial pass.

### Confirm the Principal and Incident

Ask: "Which Vertex incident? Is this the support explanation or a contractual credit question?" Resolve tenant and account groups from trusted identity. Confirm token scope before any governed read.

### Follow the Governed Evidence

A Tier-1 support agent asks in the app. The handler builds a Vector Search filter from their groups, such as `grp_public` and the Tier-1 support group, and calls `similarity_search` for candidate IDs. Reranking waits for authorised text. The index runs as the service principal and returns ranked chunk IDs, possibly including some the agent may not see.

The handler then reads those IDs from `kb.chunks_secure` with the agent's forwarded token. Unity Catalog evaluates the row filter as that user. The contract, post-mortem, pricing policy and advisory drop out, and any PII in what remains is masked. Only that result reaches the model, and the answer is the platform backlog.

The rows dropped between index and view are logged as the staleness signal, and the MLflow trace records the run. Application code still validates scope and selects the governed read; Unity Catalog evaluates that read as the user. The physical split, forced by two platform facts, is what made that possible.

### Trace the Two Results

```json
{
  "trusted_scope": {"tenant": "meridian", "persona": "tier-1"},
  "index_candidate_ids": ["chunk-public", "chunk-contract"],
  "governed_result_ids": ["chunk-public"],
  "model_context_ids": ["chunk-public"],
  "credit_action": "not_supported"
}
```

Log the candidate-to-governed difference in a protected trace. Do not reveal denied IDs in the customer response.

### Handle a Missing Authority

| Situation | Response |
| --- | --- |
| User token missing or wrong principal | Refuse; do not substitute the service identity. |
| SQL warehouse or policy authority unavailable | Refuse; never send raw index text to the model. |
| Membership changed but index is stale | Governed read applies current effective policy; monitor propagation. |

### Explain the Design in 60 Seconds

> "I'd reuse the permission-aware RAG design and make Unity Catalog the authority for the final read. The search index would return filtered candidate IDs, not trusted answer text. A governed view would re-read those IDs as the signed-in user, applying access rules and redaction. Only that result could reach reranking and generation.
>
> I'd restrict the base table, validate user credentials at request time, and test the same document as different personas. If the governed read failed, the assistant would refuse. I'd correlate search, SQL, model, and response traces. Endpoint cost, filter syntax, identity propagation, and managed features would be verified in the target environment rather than assumed from the reference build."

## Close on Unity Catalog and SCIM

Summarise in three sentences. This is multi-source RAG on the Lakehouse, with Unity Catalog as the authority on access. A compiled ACL filter makes Vector Search cheap, and an on-behalf-of-user re-read from the governed view makes it correct. Hybrid retrieval is managed; reranking must use only governed text. Trace each run and gate releases on deterministic security assertions.

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
- The index does not enforce source row filters or masks; the reference also observed a governed-source creation conflict.
- Keep an ungoverned base table locked to the sync principal and a governed view for every human and agent.
- Layer 1 is the index filter; layer 2 is Unity Catalog on a re-read as the user, and only layer 2's text reaches the model.
- Governed SQL owns access and masking; `ai_mask` is not access control. Verify SCIM propagation and revocation latency.
- Encode groups as boolean columns and beware the Standard endpoint's positional OR.
- Compare endpoint cost and filter syntax; rerank only after the governed user read.
- On-behalf-of-user identity makes layer 2 real; verify the hosting-specific setup and effective principal.
- Gate on a deterministic leak check, ideally a SQL assertion against the governed view.
- Log index-versus-view drops as staleness, isolate tenants by catalog, and fail closed if Unity Catalog is down.
- State plainly what ran on a live workspace and what did not.
- Close on Unity Catalog and SCIM as week-one work.

## Check Yourself

1. **Why can the index not simply read the governed table?**
   The index does not enforce source row filters or masks. The supplied build also recorded a creation conflict; revalidate the target configuration.

2. **What happens if someone is granted `SELECT` on the ungoverned base table?**
   They bypass the entire access model, because that table carries no policies. Locking it to the sync principal is load-bearing.

3. **What should the system do if the SQL warehouse is down but Vector Search is up?**
   Fail closed and refuse. Serving layer 1's results without layer 2 is a leak with a good excuse.

4. **Which text may reach reranking and generation?**
   Only text returned by the governed read as the signed-in user, never raw index content.

5. **What if the user token is absent?**
   Refuse. Do not silently fall back to a service identity with broader access.

6. **Does a group removal upstream guarantee immediate revocation?**
   No. Verify identity propagation, effective policy state, token freshness, and scoped caches.

7. **Are source latency and price comparisons current benchmarks?**
   No. They are historical reference comparisons; measure the target configuration.

8. **Was the reference workspace rerun for this rewrite?**
   No. Historical results remain source reports; the new trace is illustrative.

9. **Why is a non-empty SQL test result not enough?**
   Run it as the intended principal, assert the expected visibility, and also verify what reaches the model and response.

