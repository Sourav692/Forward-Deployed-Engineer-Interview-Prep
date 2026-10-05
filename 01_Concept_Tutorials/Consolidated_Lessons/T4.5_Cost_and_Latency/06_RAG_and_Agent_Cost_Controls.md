# RAG and Agent Cost Controls

*Every extra chunk, candidate and agent step buys a little quality at a measurable price, so bound each one by evidence rather than by habit.*

◷ 7 min

RAG cost is not a vector-database tuning problem, and agent cost is not a model problem. Both are pipelines, so control them stage by stage, using the drivers from [The Eight Cost and Latency Drivers](02_The_Eight_Cost_and_Latency_Drivers.md).

**Objectives:**

- apply the RAG levers in the order the ingestion and query paths run;
- tune the knobs that actually move retrieval latency and reranker cost;
- turn an open-ended agent into a budgeted execution graph, and keep batch and evaluation spend visible.

---

## Optimise the Whole RAG Pipeline

A RAG system spends money at parsing, chunking, metadata, permissions, embedding, indexing, query rewriting, retrieval, reranking, context packing, generation and evaluation. Learn its two paths as sequences.

```
ingestion: parse → normalise → deduplicate → chunk → classify metadata
           → compute permissions → embed → index → validate retrieval
query:     authenticate → infer intent → apply tenant/ACL filters → retrieve
           → optional rerank → compress context → generate → cite → log metrics
```

The levers follow the path. Tune chunk size by document and question type, and keep overlap minimal rather than a blind 20% everywhere. Filter by metadata before vector search, which shrinks the search and prevents leaks. Precompute ACL metadata; never filter only after generation. Use hybrid search for acronyms, IDs, product names and legal clauses. Gate query rewriting, which adds latency on every query it touches. Measure quality as top-k falls; top-k 20 may not beat top-k 5. Compress context while keeping citations. Deduplicate, which cuts storage, noise, tokens and hallucination risk. Index incrementally with content hashes. Tune the vector store on production-size corpora and real tenant filters.

The best RAG optimisation is rarely a faster vector database. It is cleaner documents, better metadata, permission filters before search, fewer duplicate chunks, calibrated top-k and a prompt with only the evidence the answer needs.

## Turn the Knobs That Move the Curve

The companion notes name the specific settings behind "tune the index".

**The index parameter, not top-k, controls latency.** HNSW's `ef_search` and IVF's `nprobe` set the recall-latency curve far more directly than k does.

**Quantisation is the storage lever.** Scalar or product quantisation, or binary embeddings with a rescoring pass, cut memory and search time by large factors at modest recall loss.

**Dimensions can be truncated.** Several modern embedding models are trained so the vector can be shortened, for example from 1536 to 512 dimensions. Re-measure recall instead of re-embedding with another model, and verify per model.

**Reranker cost is candidates times document length.** A cross-encoder runs once per query-document pair. Going from 50 to 10 candidates is about five times less reranker compute. Truncate the passage too, not just the list.

**Measure rank, not just presence.** Recall@k will bless a retriever that buries the right chunk at position 9. Add nDCG@k, which rewards ranking, context precision and recall, and answer faithfulness. Hybrid fusion such as reciprocal rank fusion has a weight to tune, not a constant.

## Bound the Agent's Execution Graph

Agents blow up in predictable ways. They plan too long before acting. Ambiguous tool descriptions or missing state cause tool loops. They reflect on simple tasks and retry without limit. They carry large intermediate context every step and repeat retrieval instead of caching it. They run parallelisable calls one after another, wait on external APIs without timeout budgets, and let memory inflate the prompt every turn.

Each control has a matching safeguard.

| Control | Safeguard |
|---|---|
| A hard maximum on steps | At the limit, escalate to a human or ask for clarification |
| Tool allowlists by intent | Route by intent first |
| Tool-call and cost budgets | Record budget exhaustion as a trace event |
| Parallel read-only tool calls | Never parallelise side-effecting actions blindly |
| Cached tool results per request or session | A TTL and permission checks |
| Deterministic routing for common paths | Fall back to the agent for ambiguous tasks |
| A smaller planning model | Escalate when its confidence is low |
| Summarised intermediate state | Keep the full audit log outside the prompt |
| Human approval for expensive or sensitive actions | Clear thresholds and a clear explanation to the user |
| Trace analysis for loops | Tests for repeated failure paths |

Do not use an agent where a workflow engine or a router is enough. Treat the agent as an execution graph with budgets, not an open-ended reasoning loop. When an agent repeats the same tool call, treat it as a control-loop bug. The fix is step budgets, better tool routing, cached results and explicit stopping criteria.

## Keep Batch and Evaluation Spend Visible

Background jobs do not show up in interactive metrics. Embedding should be incremental; re-embedding unchanged documents is a pipeline design bug. Compare documents changed with documents embedded, and use a content-hash embedding cache with change detection. Nightly summarisation should hash, deduplicate and process only changed documents, with a cheaper model, batch inference, queue budgets and sampled quality checks. Provider batch APIs run asynchronously at 50% of standard cost.

Evaluation is inference too. When the evaluation bill triples while production cost holds, use stratified samples instead of the full set. Use a cheaper judge audited periodically by a strong one, run only on changed prompts or models, and cache judge calls on unchanged pairs.

> **Warning: parallelising is only safe for reads.** Running independent read-only calls at once collapses latency. Running side-effecting calls at once, such as two writes to a CRM, can duplicate or reorder actions.

## Worked Example: The CRM Assistant From 45 Seconds to 8

Sales users say account preparation takes 30 to 45 seconds. The weak response is a faster model with no look at the traces.

The trace for one request shows 9 model calls, 7 retrievals, 4 CRM calls and a large intermediate context carried through every step. That run costs €1.20. The fixes come from the control table: a maximum of 4 steps, caching inside the request so retrievals are not repeated, and a smaller routing model. The same request now takes 8 seconds and costs €0.18.

The long-term design goes further. Account lookup, ticket summary and next-best-action become deterministic routes backed by an account cache and parallel read-only CRM calls. The agent is kept only for ambiguous multi-step requests. The open-ended loop became a bounded execution graph, and the trace, not the model, showed where the time went.

---

## Key Takeaways

- Treat RAG cost as a pipeline: filter before search, calibrate top-k, deduplicate, compress with citations and index incrementally.
- Tune `ef_search` or `nprobe`, quantisation and dimensions for retrieval latency, and cut reranker candidates and passage length for reranker cost.
- Measure ranking quality with nDCG and faithfulness, not Recall@k alone.
- Give agents step, tool and cost budgets, deterministic routes for common paths and caches for repeated calls.
- Keep batch and evaluation jobs incremental, sampled and budgeted, because nobody sees them spend.

## Check Yourself

1. **Retrieval got slow after the corpus grew. Is lowering top-k the main knob?**
   Usually not. The index parameter, such as `ef_search` or `nprobe`, sets the recall-latency curve more directly. Also check metadata filters and duplicates.

2. **The reranker doubled latency. Name two ways to cut its cost without dropping it entirely.**
   Rerank only ambiguous or high-value queries, and score fewer candidates with truncated passages, since cost scales with candidates times length.

3. **An agent keeps calling the same CRM lookup until it times out. What kind of bug is it, and what fixes it?**
   A control-loop bug. Add a step budget, cache the tool result, improve the tool routing or schema, and set explicit stopping criteria.

## References

**Sources:** `CRAM_SHEET_FULL_PLAYBOOK.md` (notes on the third-party *GenAI FDE Cost and Latency Optimization Playbook*): §4 agentic versus deterministic and batch versus live, §7 RAG cost and latency, §8 agent cost and latency (CRM worked number), §17 RAG and agent checklists. `CRAM_SHEET_S15_S16.md`: incidents 3, 4, 9 and 13; cases 3 and 5. `ADDITIONS_BEYOND_PLAYBOOK.md`: §A3 batch API, §C RAG and vector specifics, §E "the eval bill tripled". `CORE_8_DRIVERS_MEMORIZE.md`: drivers 3, 4, 5 and 8. Playbook content is summarised in new words.
