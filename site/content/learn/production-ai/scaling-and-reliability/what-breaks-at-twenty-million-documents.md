# What Breaks at Twenty Million Documents

*A small corpus keeps security cheap to prove, but scaling it a millionfold breaks ingestion, the index, and query cost in different places that each need their own fix.*

◷ 5 min

"What if the customer has 20 million documents?" is not one scaling question. It is three: ingestion throughput, query-time latency and per-tenant isolation overhead, so name what breaks first in each before proposing fixes.

**Objectives:**

- walk the pipeline and name the first symptom of failure at each stage;
- scale ingestion with parallel, batched, resumable jobs, and do the throughput arithmetic out loud;
- separate what a small build proves from what is only correct on a whiteboard.

---

## Walk the Pipeline and Find the First Break

The handbook's enterprise RAG build holds 22 documents and 86 chunks in one in-process Chroma collection. That was deliberate, because access control and security stay cheap to prove at that size. Assume about 4 chunks per document at 20 million documents, which is about 80 million chunks. Then walk the pipeline.

| Stage | Why it breaks | First symptom |
|---|---|---|
| Ingestion | A single-process embedding loop | Ingest takes days; unchanged documents get re-embedded |
| Vector index | An in-process store has no answer for 80M vectors | Out of memory, or an index build that never finishes |
| Access control | Per-tenant scans and per-chunk checks do not shard | Latency grows with corpus size, not result size |
| Keyword search | BM25 is rebuilt over the whole allowed pool on every query | Fine at 86 chunks, fatal at 80M |
| Reranking | An LLM call per candidate set | 50 candidates times heavy traffic means cost and latency |
| Audit | Traces held in memory | The trail cannot be queried; a compliance risk |
| Cost | Uncached embedding and generation billed per token | Cost grows with corpus size and query volume |

Label every proposal as **proven** or **verbal**. Proven means the same mechanism already exists in the small build. Verbal means the architecture is correct but a laptop cannot honestly demonstrate it. Interviewers trust a candidate who keeps the two apart.

## Parallelise and Batch the Embedding

Today's ingestion is one process with a synchronous embedding loop and a content-hash skip for unchanged documents. The skip is proven. At 20 million documents, six changes are needed.

**Fan documents out across workers.** Embedding is embarrassingly parallel per document, through a job queue, a process pool or a cluster. Run the content-hash check inside the workers, not in a serial loop in front of them.

**Batch embedding calls.** Send hundreds of chunks per request, never one chunk per HTTP call.

**Split chunking from embedding.** Chunking is cheap and CPU-bound. Embedding is expensive and API-bound. Give chunking more workers than embedding.

**Make jobs idempotent and resumable.** A 20-million-document run will be interrupted. Content-hash deduplication plus a per-document ledger of `queued`, `embedded`, `indexed` and `failed` means a restart finishes only what did not finish.

**Dead-letter poison pills.** Some files fail: a corrupt PDF, bad encoding, an empty file. Quarantine each with its reason and keep the batch moving.

**Use the platform's incremental pipeline.** On Databricks the production answer is incremental loading, a distributed job with batched embeddings, Delta tables and a synced vector index. It is a pipeline, not a bigger script. This one is verbal.

## Do the Throughput Arithmetic Out Loud

At about 500 chunks per second with batched calls and reasonable parallelism, 80 million chunks take about 160,000 seconds. That is about 44 hours single-threaded. With 50-way parallelism it is under an hour.

The point is the formula: throughput per worker times worker count. "It will be slow" is not an answer; a number with its assumptions is.

> **Warning: an unbounded queue fails before the index does.** An ingest queue with no limit runs out of memory while the index is still fine. Apply backpressure: let the queue push back on producers instead of growing forever.

## Worked Example: The Interviewer Says "Twenty Million"

The interviewer asks what changes at 20 million documents. The answer opens with the three problems: ingestion throughput, query-time latency and tenant isolation.

For ingestion, it names the first symptom, days-long ingest and re-embedding of unchanged documents. It proposes parallel workers with the hash check inside them, batched calls, a ledger for resumable runs and a dead-letter queue. Then it does the arithmetic: 80 million chunks at 500 per second is about 44 hours on one worker and under an hour on 50.

Finally it labels each part. The hash skip is proven at small scale; the distributed pipeline is verbal. The interviewer heard a plan, a number and an honest boundary, not "we would scale it horizontally".

---

## Key Takeaways

- Treat 20 million documents as three problems, ingestion, query latency and tenant isolation, and name the first symptom at each pipeline stage.
- Scale ingestion with parallel workers, batched calls, separate chunk and embed pools, resumable ledgers and dead-letter queues.
- State throughput as per-worker rate times worker count, with the numbers: about 44 hours on one worker, under an hour on 50.
- Label every proposal as proven or verbal.

## Check Yourself

1. **Do the arithmetic: 80 million chunks at 500 chunks per second, then with 50 workers.**
   About 160,000 seconds, roughly 44 hours on one worker. With 50-way parallelism, under an hour.

2. **Why must the content-hash check run inside the workers?**
   A serial check in front of the workers becomes the bottleneck the parallelism was meant to remove.

3. **Why does a 20-million-document run need a per-document ledger?**
   The run will be interrupted. A ledger of queued, embedded, indexed and failed lets a restart finish only the remaining documents.

## References

**Sources:** `06_Scaling_To_20M_Documents.md` (FDE Handbook, cross-cutting concerns): "Why this matters", §1 what breaks first, §2 scaling ingestion and the throughput math, §9 backpressure, Interview lens.
