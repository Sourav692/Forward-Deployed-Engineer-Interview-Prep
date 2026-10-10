# Capacity, Latency, and Cost at Scale

*Caching makes the typical request fast, but only timeouts, circuit breakers, and fallbacks protect the slow tail, and capacity planning has to pay for both.*

◷ 6 min

At scale, the median and the tail have different causes. Move the median with routing, early filtering and caching; bound the tail with timeouts and fallbacks; and size capacity from throughput and latency together.

**Objectives:**

- apply five levers to P95 latency at scale and say which percentile each one moves;
- size concurrency with Little's Law and choose infrastructure controls for the critical path;
- state the cost number that matters at 20 million documents.

---

## Pull Five Levers for P95

The scaled RAG graph has the same stages as the small one. Attack each with a specific lever. Each lever targets one stage.

**Route by difficulty.** Use a cheap, fast model for rewriting, HyDE, grading and reranking. Keep the strong model for synthesis only, and do not cheapen synthesis. This is proven in the small build.

**Filter early.** Apply access control before the expensive reranker, so it sees a small authorised set. The bigger the corpus, the more work the filter saves.

**Cache precisely.** Cache embeddings and full answers, keyed on the question, the access filter and the exact context. A hit is only valid for an identical, freshly re-enforced situation.

**Parallelise independent LLM work.** Multi-query rewrites, HyDE and per-tenant requests are independent. Check that they actually fan out at once; this is partly done.

**Filter inside the index.** Filtered approximate search wins twice: lower latency and no over-fetch-then-discard.

Two more stages have gaps. The LLM reranker is a full model call; a cross-encoder is the swap. A tenant's index should be warm before its first request rather than lazy-loaded; that is verbal.

## Tell the Median From the Tail

| Percentile | What sets it |
|---|---|
| P50 | The happy path: a cache hit, or fast dense retrieval plus a small-model rewrite and synthesis |
| P95 and P99 | A cache miss on a cold query, multi-hop questions with extra LLM calls, or reranking a wide match set before access control narrows it |

Caching does not fix tail latency. It moves the median. Timeouts, circuit breakers and fallback to a smaller model move the tail. A circuit breaker is a P99 tool: it bounds a dead dependency and does nothing for the typical case.

## Size Concurrency With Little's Law

Concurrency equals throughput times latency. That is Little's Law. At 10 requests per second with 4 seconds of average latency, about 40 requests are in flight at once. Halving latency halves the concurrency to provision. Latency work is therefore a capacity-cost win, not only a UX win. Use this when asked how many replicas or what rate limit a service needs.

## Control the Critical Path

The cost and latency playbook treats infrastructure work as controlling the critical path. Each control below prevents a specific failure.

| Failure to prevent | Control |
|---|---|
| Latency spikes when connections run out | Connection pooling and HTTP keep-alive |
| Batch spend growing without limit | Worker scaling by queue depth, with budgets |
| One tenant starving the others | Tenant-aware rate limits |
| Overload cascading through the system | Backpressure and graceful degradation |
| Scaling on the wrong signal | Autoscaling on queue depth or tokens, since LLM load may not track CPU |
| Slow first requests after idle | Minimum replicas and warmers, at the cost of idle capacity |
| Regional users waiting on distance | Regional deployment, limited by data residency |
| Idle GPUs costing more than an API | Batching and quantisation for self-hosting; a managed API at low volume |

Horizontal scaling helps less than expected when the provider's latency dominates.

Recognise the six shapes these controls assemble into. A real-time GenAI API needs a short critical path, routing, streaming, caching and strict timeouts. An async document pipeline needs queues, batching, autoscaled workers, budgets and retries. A RAG ingestion pipeline needs deduplication, incremental indexing, ACL metadata and an embedding cache. A multi-tenant platform needs tenant budgets, isolation, per-tenant metrics and a permission-aware cache. An agent service needs step limits, tool budgets, a trace store and deterministic routes. An evaluation pipeline needs sampled runs, cheaper judges and scheduled offline execution.

## Quote the Cost That Matters

One number to have ready: embedding about 80 million chunks once, at about $0.0001 per 1,000 tokens with a small embedding model, costs roughly low-to-mid four figures in US dollars. It is real money, but manageable.

The cost that matters is query-time generation times query volume. Generation is the recurring bill. That is why routing, early filtering and caching dominate the conversation, not the ingest bill. Tiered storage is verbal, and a cheaper reranker is a known gap.

> **Warning: "add caching" is not a tail-latency plan.** If the interviewer asks whether caching fixes P99, the answer is no. Cache misses, multi-hop questions and wide reranks set the tail; bound them with timeouts, breakers and smaller-model fallbacks.

## Worked Example: Sizing a Service at Twenty Million Documents

A tenant's assistant must handle 10 requests per second at peak, with 4 seconds of average latency. Little's Law gives about 40 concurrent requests, so the pool, rate limits and replica count are sized for 40 in flight, with headroom.

The median falls with a small model for rewriting and grading, filtering before reranking, and a precise answer cache. The tail is bounded by per-dependency timeouts, a circuit breaker on the provider and a fallback to a smaller model. Autoscaling follows queue depth, not CPU. Cutting average latency to 2 seconds would halve the concurrency to provision.

The cost discussion centres on generation per query, not the one-time embedding bill. Every lever was assigned to the percentile it moves, which is the distinction the interviewer is testing.

---

## Key Takeaways

- Route by difficulty, filter before reranking, cache precisely, parallelise independent calls and filter inside the index.
- Caching moves the median; timeouts, circuit breakers and fallbacks move the tail.
- Concurrency equals throughput times latency, so cutting latency cuts provisioned capacity.
- Control the critical path with pooling, queue-depth scaling, tenant limits, backpressure and warm capacity, and know the six architecture shapes.
- The one-time embedding cost is low-to-mid four figures; query-time generation times volume is the cost that dominates.

## Check Yourself

1. **Does caching fix tail latency?**
   No. It moves the median. Timeouts, circuit breakers and fallback to a smaller model move the tail.

2. **A service handles 10 requests per second at 4 seconds average latency. How many requests are in flight?**
   About 40, by Little's Law: concurrency equals throughput times latency.

3. **Why does the ingest bill not dominate the cost conversation at 20 million documents?**
   It is a one-time cost in the low-to-mid four figures. Query-time generation recurs with every query, so routing, filtering and caching matter more.

