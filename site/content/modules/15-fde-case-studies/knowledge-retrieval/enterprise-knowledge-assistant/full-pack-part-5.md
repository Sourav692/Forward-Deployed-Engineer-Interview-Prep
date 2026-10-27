# Enterprise Knowledge Assistant with Permission-Aware RAG, part 5

## 14. Answer the Cost Pivot in Ten Minutes

The interviewer's pivot after a good design is "now it has to run under a strict budget". Here it arrives as a legal team wanting RAG over contracts and policies, with a strict budget, mandatory citations and a latency target under 8 seconds. Answer it right after the design, in the same sitting, using the same architecture.

|                       |                                                                                                                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ask                   | Who are the users: lawyers, sales, procurement, execs? Which documents are authoritative and how are permissions represented? What risk level is acceptable for legal interpretation? Are the latency and cost ceilings contractual? Is human review required for external-facing language? |
| Dominant driver       | Input tokens: the whole corpus stuffed into long context, plus an unconditional rerank                                                                                                                                                                                                      |
| Weak move             | The strongest model with all documents in a long context window on every request                                                                                                                                                                                                            |
| Strong move           | Permission-aware RAG with metadata filters, calibrated top-k, citation enforcement and model routing. Simple clause lookups go to a mid-tier model; high-risk synthesis escalates. Rerank only ambiguous queries                                                                            |
| Path                  | auth → tenant/ACL filters → hybrid retrieval → optional rerank → compressed evidence → answer with citations → audit log                                                                                                                                                              |
| Trade-offs            | The cost limit forces top-k tuning and routing; legal quality forces citations and escalation; the latency target rules out unconditional heavy reranking                                                                                                                                   |
| Metrics that prove it | Recall@k, citation correctness, cost per request, retrieval latency, model latency, human escalation rate                                                                                                                                                                                   |
| Recommendation        | Pilot with a limited document set, define the high-risk categories, instrument cost and latency from day one                                                                                                                                                                                |

**100 ms pivot** ("naive RAG is 1.5 s"): generation cannot be on the hot path. Slice the 1.5 s, then remove stages. Cache query embeddings and retrieval on tenant + permission signature + index version. Semantic cache returns a previously verified, permission-checked answer. Pre-filter inside search. Skip rerank on cache hits and high-confidence single-source matches. Stream the first token; precompute the head of the query distribution off-path. 100 ms is a search product with a cached-answer layer, not chat. Metrics: first byte, cache hit rate by tenant, leak count stays 0 — a cache is one of the easiest places to leak across permissions.

**Sixty-second budget line:** citations and escalation for legal quality, top-k and routing for budget, no heavy rerank on every query for the 8 s target. Pilot a limited corpus with cost instrumented from day one. Order: measure → route → bound → cache safely (tenant, permission, version in the key).

## 15. Debug the Incidents on This Design

Incidents and production scenarios on this system are not new designs; they are questions about where the design would have caught the failure. Answer each as detect, contain, root cause, prevent, and point at the section that answers it.

| #   | Case                                                            | Answer from                                                                                                                                |
| --- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 86  | Incident: stale index gives a wrong prior-auth policy answer    | Section 9's missed-deletion replay, the reconciliation drill, the freshness-lag metric                                                     |
| 93  | Incident: prompt injection from a retrieved Confluence page     | Section 7, the LLM is never the enforcement point; retrieved content is evidence, never instructions; the tool gateway blocks exfiltration |
| 94  | Incident: embedding-model change degrades recall (vector drift) | Section 12's re-indexing answer: versioned index, offline eval, staged cutover, rollback                                                   |
| 106 | retrieval became slow after adding more documents         | Section 3's envelope and section 9's scale rules: partition by tenant, ACL pre-filter, top-k discipline                                    |
| 111 | vector database query latency increased                   | Filters and index type, warm caches, over-retrieval caps                                                                                   |
| 112 | reranker improved quality but doubled latency             | Section 14's lever: rerank only ambiguous queries, a smaller candidate set, a cheaper reranker                                             |
| 117 | long context window caused poor performance               | Section 8's rule: a tight candidate set beats prompt stuffing; compress evidence                                                           |

---

## Level calibration

On this design the levels separate on how far the permission boundary reaches beyond the query path, not on how clever the retrieval is.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Partitions by tenant and pre-filters inside hybrid search, re-checks policy live before generation, reranks 20 to 6 after enforcement and abstains on weak evidence. Authorisation fails closed; everything else degrades. | The ingest half and the proof: how each source's ACLs get translated, how a missed deletion is caught, and what shows zero leaks before release. |
| Staff | Adds the ACL normaliser that refuses anything without a usable ACL, tombstones and reconciliation for missed deletes, and a leak suite Security owns as the release gate. Rolls out one corpus at a time, with an owner and a rollback trigger per source. | What happens as sources, tenants and pivots multiply: index and embedding migrations, cost per answer at 100 QPS peak, and whether governance survives a copied index. |
| Principal | Makes permission translation a platform contract every connector meets, and versions the index so a chunking or embedding change is a staged cutover with rollback. Keeps the legal cost pivot and the 100 ms pivot on the same trust path, and checks that source governance does not silently drop at the index boundary. | The freshness SLO per content class and the stated stale window for revocation depend on the customer's IdP sync and risk appetite, so they wait for discovery. |

## Key Takeaways

- Permission fidelity is the load-bearing constraint, named in the first two minutes, because an assistant that leaks is worse than none.
- Requirements are stated so a test can fail them: MoSCoW Must as the launch gate, percentile latency, explicit Won't, and a component owner for every constraint.
- Back-of-envelope: size on 100 QPS peak and permission refresh of 50M chunks, not on 20 QPS average or a one-shot embed.
- Every source is mapped with its own permission model, and a source without a usable ACL is excluded rather than defaulted.
- One end-to-end diagram splits control plane from data plane, and the trust boundary sits at ENFORCE: text the user cannot see exists only to its left.
- Ingestion normalises permissions into one attribute model and refuses anything it cannot normalise.
- Enforcement runs before the model sees anything, in two layers: a compiled pre-filter that makes retrieval cheap and an authoritative post-check that makes it correct.
- Retrieval is hybrid, fused by rank, and reranked after enforcement so a restricted user's top-6 is the best of their own pool.
- Authorisation fails closed and everything else degrades visibly, with the missed deletion as the rehearsed failure.
- The release gate is a leak count of zero, not a score, and every run is a replayable trace.
- Rollout starts with one corpus, three personas and the leak test standing, then widens source by source.
- The sixty minutes are spent in proportion to risk, with the three-sentence close and eight carrying lines ready.
- As a story, the same system is a one-sentence open, five beats and an honest limitation.
- The cost pivot is answered with the same architecture: measure, route, bound, cache safely. The 100 ms pivot removes generation from the hot path and leans on permission-keyed caches.
- Incidents on this design are answered by pointing at the section that would have caught them.

## Check Yourself

1. **Why is post-filtering wrong even when it never returns an unauthorised document?** It crowds a restricted user's top-k out with material they will never see, so their top-6 becomes a top-2, and it can leak through result counts if those are shown.
2. **What does layer 2 decide that layer 1 cannot express?** Embargo, which needs "now"; need-to-know, which is list semantics the index cannot hold; live revocation, because the index may be stale; and obligations such as redaction, which are transforms rather than filters.
3. **A connector misses a deletion. Which check passes, and why is that the problem?** The ACL check passes because the permission data is still valid; the failure is freshness, so the answer is a staleness threshold, revalidation against the system of record and a reconciliation job that replays the deletion.
4. **Why does reranking run after enforcement rather than before?** So a restricted user's top-6 is the best of their authorised pool; reranking first would rank documents they cannot see and hand them an empty context.
5. **Why is the leak rate a gate rather than a metric?** A retrieval regression is a bug to fix next sprint; a leak is an incident, so one exposure blocks the release instead of lowering a score.
6. **What do the four scale numbers force?** 100k employees force ACL cardinality, not concurrency. 50M chunks force refresh, not the first embed. 20 QPS hides an untuned sync path; 100 QPS makes rerank and generate a serving problem.
7. **What breaks first at 10× and what replaces it?** BM25 rebuilt per request over the authorised pool; a lexical store with native document-level security such as OpenSearch DLS, or a cached per-group shard.
9. **How is α tuned?** Against a representative query set segmented by query type, never a fixed number.
10. **What is the sixty-second cost answer for legal RAG under budget?** Citations and escalation for legal quality, top-k and routing for budget, gated rerank for the 8-second target, and a limited-corpus pilot with cost instrumented from day one.

## References

### Fact-check sources (checked 27 Sep 2026)

- [OWASP Top 10 for LLM Apps 2025 – LLM08 Vector and Embedding Weaknesses](https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/) — permission-mapping and cache leaks are known RAG risks
- [Pinecone: The Missing WHERE Clause in Vector Search](https://www.pinecone.io/learn/vector-search-filtering/) — post-filtering shrinks the usable top-k
- [Qdrant: Pre-Filtering vs Post-Filtering](https://qdrant.tech/blog/pre-filtering-vs-post-filtering/) — post-filtering can return fewer than k results
- [Chroma Docs – Metadata Filtering](https://docs.trychroma.com/docs/querying-collections/metadata-filtering) — array metadata and `$contains` in Chroma 1.5+
- [Cormack, Clarke & Buettcher 2009, Reciprocal Rank Fusion (SIGIR)](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf) — RRF formula and k = 60
- [Anthropic, Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval) — reranking gain versus contextual embeddings
- [OpenSearch document-level security](https://docs.opensearch.org/latest/security/access-control/document-level-security/) — OpenSearch DLS as a lexical store with native doc security
- [Microsoft 365 Copilot federated connectors overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/federated-connectors-overview) — federated search limits on ranking and latency
- [Microsoft Entra: How application provisioning works](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/how-provisioning-works) — Entra provisioning runs on sync cycles
- [Artificial Analysis LLM leaderboard (TTFT)](https://artificialanalysis.ai/leaderboards/models) — fastest APIs ~0.4 s to first token, so 100 ms rules out live generation
- [Google Drive Help: Learn about folders with limited access](https://support.google.com/drive/answer/14254362?hl=en-GB) — folder permissions inherit, but a limited-access folder blocks inherited access

