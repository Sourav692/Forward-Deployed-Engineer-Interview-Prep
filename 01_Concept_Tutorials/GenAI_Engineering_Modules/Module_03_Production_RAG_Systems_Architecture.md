# Module 3 – Production RAG Systems & Architecture (Beginner Guide + Keywords)

Oct 4, 2026 · @Sourav Banerjee

## Overview

This module is about running RAG for real users: keeping it fast, letting it grow, keeping it from breaking, and watching it so you know when quality slips. It ends with practice scenarios, the kind of "what would you do if..." questions interviewers love.

&#91;embedded content: production RAG request path · 5 steps + monitoring\]

A request enters through the gateway, the **semantic cache** answers if it can, otherwise vector search, optional re-ranking and the LLM produce the answer. Every step has **timeouts**, **circuit breakers** and fallbacks, and **observability** watches the whole path.

Topics in this module:

- Topic 1: Production RAG Systems & Architecture (latency, caching, async design)
- Topic 2: Scalability and Throughput (sharding, multi-tenancy, failover, rate limiting)
- Topic 3: Observability and Monitoring (logs, metrics, traces, drift, feedback loops)
- Topic 4: Scenario-Based Questions

**Bold keywords** throughout are the exact terms to use in interviews.

## Topic 1: Production RAG Systems & Architecture

This topic is about making a RAG app fast (low latency), cheap and steady once real users hit it. Latency means how long the user waits for an answer.

### My RAG answers in 200ms. How do I get under 100ms without hurting quality?

First measure where the time goes (embedding, retrieval, re-ranking, generation). Then fix the biggest piece.

- **Semantic cache** (**Redis**, **GPTCache**): if a similar question was already answered, return it in a few milliseconds.
- **Lower top-k**: fetch 3 to 5 chunks instead of 10. Less search time and fewer tokens for the LLM.
- **Smaller query embedding model**: the one used at query time can be lighter than the one used for indexing.
- **Conditional re-ranking**: the **cross-encoder** re-ranker is slow, so run it only when the scores are unclear.
- **Parallelization**: do independent steps together, like cache lookup while the query is being embedded.
- **Streaming**: does not cut the total time but the user sees words earlier (better perceived speed).
- **Tune the vector search**: lower `ef_search` on **HNSW**.

### How do I find which stage is slow?

Put a timestamp at every step and log the gap: query received, embedding done, cache checked, vector search done, re-ranking done, answer finished. Send them as structured logs to **Datadog**, **Grafana** or **OpenTelemetry**, then chart **P50** and **P95** (the typical and the slow-but-common case) per stage.

Common patterns:

- Generation is usually the biggest piece, often 60 to 70% of the time.
- A big cross-encoder re-ranker can quietly add 80 to 150ms.
- Vector search is fast, but slows under heavy concurrency or very large **HNSW** graphs.
- Embedding spikes when the model is cold or running on CPU.

Do not tune a 5ms step when generation takes 150ms.

### What caching should a production RAG system use?

Caching is the biggest easy win. Several layers:

- **Query-level semantic cache**: store question embeddings with their answers (**Redis**, **GPTCache**, **LangChain** caching). If the new question's **cosine similarity** is above about 0.95, return the saved answer.
- **Embedding cache**: key by a **content hash** so the same chunk is never embedded twice (great for re-ingestion).
- **Retrieval result cache**: save the top-k chunks for popular queries, with a **TTL** (time to live) that matches how often your documents change (for example 1 hour for daily-changing content, 24 hours for static docs).
- **Prompt (prefix) caching** from the LLM provider: put the stable part first (system prompt, rules) and the changing part (question, chunks) later, so the provider can reuse the work. This is different from the **KV cache** inside one generation.
- **Do not cache**: time-sensitive questions where stale answers are risky, and personalized answers.

### How do I make vector search itself faster at scale?

- **Tune HNSW**: lowering `ef_search` (for example 200 to 50) can roughly halve search time with a small recall loss. Pick the sweet spot.
- **Smaller dimensions**: **Matryoshka Representation Learning (MRL)** embeddings can be cut to 256 dimensions with little quality loss. Or compress existing ones with **PCA**.
- **Quantization**: **Product Quantization (PQ)** shrinks numbers from 32-bit to 8-bit or less (supported by **Faiss**, **Qdrant**, **Weaviate**).
- **Metadata pre-filter**: searching 100k vectors instead of 1M is much quicker.
- **Hardware**: enough RAM to keep the full graph in memory (disk is slow), or **Faiss GPU** for very high traffic.

### When should I accept fewer chunks (lower top-k) to be faster?

- **Go lower** for simple factual questions, strict speed targets (for example under 100ms chat), a good re-ranker, or when one chunk clearly wins on score.
- **Keep higher** for multi-part questions, research-style answers where completeness matters, closely clustered scores, or relaxed speed targets.
- **Best approach: adaptive top-k.** Start small (k=5), raise it if confidence is low, and raise it automatically when the question has words like "compare", "list all" or "summarize everything".

### How do I speed up the LLM part?

Generation is normally the largest delay.

- **Pick the smallest model** that is good enough (open models like **Llama 3** or **Mistral** can be self-hosted).
- **Stream** tokens so the first word appears quickly.
- **Shorter prompts**: trim boilerplate and use **contextual compression** to send denser context.
- **Prefix caching**: stable parts first (supported by Anthropic and OpenAI prompt caching).
- **Batching**: group requests for better GPU use; on self-hosted models use **continuous batching** and **speculative decoding**.
- **Cap `max_tokens`**: shorter answers finish sooner.

### How do I build an asynchronous (background) retrieval and generation pipeline?

Use it when users can wait a bit but you need lots of throughput. The flow:

1. The request enters through an **API gateway** and goes to a **task queue** (**Kafka** or **SQS**).
2. Separate workers handle retrieval, then re-ranking, then generation, each reading from a queue and writing to the next.
3. The result goes in a **result store** (**Redis** or a database) under a job ID.
4. The client **polls** or gets a **webhook** when the answer is ready.

Why it works: each worker type scales on its own (if generation is slow, add generation workers), and **timeouts** plus **dead-letter queues** catch failures without blocking others.

- **Use async for**: batch Q&A, summarization, nightly re-indexing, 10 to 30 second research tasks, pre-computing common answers.
- **Keep sync for**: real-time chat and simple lookups already under 500ms.

### How does embedding size (dimension) affect speed and memory?

Each number takes 4 bytes (**float32**), so size grows with dimensions:

| Vectors | Dimensions | Approx. memory |
| --- | --- | --- |
| 1M | 1536 | about 6 GB |
| 1M | 768 | about 3 GB |
| 1M | 256 | about 1 GB |

- **HNSW** adds roughly 1.5 to 2x more memory for its graph.
- Distance calculation grows with dimensions, so 1536 costs about twice the work of 768.
- Ways to shrink: smaller native models, **PCA** or projection layers, **PQ** or scalar quantization. Always benchmark quality at several sizes. Often 512 to 768 dimensions is near the best balance.

### How do I design a very low-latency RAG for real-time chat?

Target is under 500ms total, or under about 200ms to the first token.

- **Semantic cache first** (hits under 10ms).
- **Small, fast embedding model** kept in memory.
- **Pre-filtered vector search** by metadata (aim for around 30ms).
- **Skip re-ranking by default**; only use it for complex questions.
- **Stream immediately** as the first token appears.
- **Small context**: 3 to 5 tight chunks.
- **Fast LLM**: **GPT-4o mini**, **Claude Haiku**, or self-hosted **Mistral 7B**.
- **Infrastructure**: vector DB, embedding service and LLM in the same region, **connection pooling**, and keep everything warm (cold starts hurt).

### Which numbers should I watch in production?

- **Latency** (P50, P95, P99): total time, **time to first token**, and each stage (embedding, vector search, re-ranking, generation).
- **Quality**: **cache hit rate**, average top-1 similarity score, **faithfulness** score, hallucination rate, user signals (thumbs down, repeated questions).
- **Infrastructure**: vector DB memory and queue depth, embedding service CPU/GPU, LLM error and timeout rate, request queue depth (a growing queue means a throughput problem), tokens per request (cost).
- **Example alerts**: P95 above 500ms is a warning, above 1 second is critical, average faithfulness below 0.75 needs a look, and a cache hit rate drop of more than 10% week over week means checking index freshness or a change in query patterns.

## Topic 2: Scalability and Throughput

Throughput means how many requests the system can handle at the same time. Scaling means growing it safely when traffic or data gets much bigger.

### How do I scale from 100 to 10,000 requests per minute?

A 100x jump needs a rethink at every layer, not just more servers. Measure the bottleneck first.

- **Embedding service**: use a pool of workers behind a **load balancer**, with **GPU** or optimized CPU inference. Throughput depends on model size, input length, **batch size** and the serving tool (**vLLM**, **Triton**). Cache query embeddings.
- **Vector database**: add **read replicas** and **shard** the index (by category or date). Or use a managed service (**Pinecone**, **Weaviate Cloud**) that scales out automatically.
- **LLM generation**: the hardest part, as it is costly. Use a **model router** across several API keys or providers, **priority lanes** in a request queue, and pre-generate answers for predictable questions off-peak.
- **Whole system**: go **async** for non-real-time requests, put a **semantic cache** at the front (if 30% of queries repeat, 3,000 per minute never reach the backend), and **rate limit** at the API gateway.

### How do I scale a vector database horizontally?

Horizontal scaling means spreading the index over many machines instead of buying a bigger one.

- **Sharding**: split vectors by date, document type, tenant or topic. A **query coordinator** sends the query to the relevant shards in parallel, then merges their top-k results.
- **Replication**: each shard has read **replicas** for safety and read speed. Writes go to the primary, reads spread out. A 3x replication factor is common.
- **Stateless query layer**: any coordinator can serve any query, so it scales easily too.
- **Managed vs self-hosted**: managed (**Pinecone**, **Weaviate Cloud**, **Qdrant Cloud**) handles it for you. Self-hosted (**Faiss**, **Milvus**) gives control but needs real DevOps. Managed is usually right until cost bites at very large scale.

### What happens when the store grows from 1M to 100M documents?

- **Memory**: 1M vectors at 1536 dimensions is about 6GB, and 100M is about 600GB. You must **shard**, and **INT8 quantization** cuts it to about 150GB.
- **Index build time**: **HNSW** on 100M vectors takes hours. Use a **write buffer**: new vectors go into a flat index first and get merged into HNSW in the background.
- **Search speed**: HNSW is usually close to logarithmic in practice (not a strict guarantee). As the graph grows, memory locality drops and **cache misses** rise, so latency can creep up. Sharding (for example 10 nodes with about 10M each) keeps it steady.
- **Operations**: backup, recovery, re-indexing with a new model and bulk deletes all get much harder.
- Advice: design for 10x from day one so you do not rebuild painfully at 5M.

### How do I implement sharding in vector search?

| Strategy | How it splits | Good | Catch |
| --- | --- | --- | --- |
| **Hash sharding** | Hash of the document ID | Even spread | Every query must hit all shards |
| **Content-based sharding** | By type, topic, date or tenant | Filtered queries hit only the right shards | More routing logic |
| **Cluster-based sharding** | **K-means** clusters, one per shard | Only the shards nearest the query are searched | Hard to maintain as data grows |

- **Query-time merging**: each shard returns its top-k, and the coordinator merges them into a global top-k. **Score normalization** matters because shards can have different score ranges.
- In practice most teams use managed DBs (**Pinecone**, **Weaviate**, **Qdrant**) that shard automatically.

### How do I build a multi-tenant RAG where customers never see each other's data?

Multi-tenant means many customers share one system.

- **Namespace-based isolation** (most common): one namespace or collection per tenant, enforced in the app before each DB call. Native in **Pinecone** and **Weaviate**.
- **Index-level isolation** (strongest): a separate index per tenant. No leak possible, but most expensive. Best for strict compliance (**HIPAA**, **SOC2**).
- **Metadata filter isolation** (weakest): one shared index with a `tenant_id` filter on every query. A filter bug could leak data, so use only for low-sensitivity cases.
- **Extras**: per-tenant **encryption keys** at rest, separate **audit logs**, per-tenant **rate limits and quotas**, and separate embedding pipelines so one tenant's ingestion does not slow another's queries.

### How do I handle traffic spikes without hurting quality?

- **Before the spike**: **auto-scaling** (horizontal pod autoscaling on CPU or GPU use), **pre-warming** extra instances before known events (cold starts of big models can take 30 to 60 seconds), and a warm **semantic cache**.
- **During the spike**: queue and **shed load** gracefully with a "high traffic" message, **lower top-k** automatically (for example 10 to 5), and give premium users dedicated capacity.
- **Safety nets**: a **CDN** (such as **CloudFront**) at the edge, **circuit breakers** that return cached or fallback answers, and **rate limits** per IP and per API key.

### What does load balancing do in a RAG system?

It is needed at every layer, not just the front door.

- **API gateway**: spreads requests, removes unhealthy instances with **health checks** (**round-robin** or **least-connections**).
- **Embedding service**: spread across instances. No sticky sessions needed since it is stateless.
- **Vector DB**: send reads to replicas and writes to the primary. Prefer the freshest replica when consistency matters.
- **LLM layer**: spread over several API keys or accounts, add **fallback routing** (if OpenAI is down, use Anthropic or a self-hosted model), and track per-key usage.
- **Tools**: a service mesh like **Istio** or **Envoy** for internal traffic; **Kong** or **AWS API Gateway** for external. Always expose health check endpoints.

### How do I design failover for a RAG system?

Each part needs its own backup plan.

- **LLM**: primary **GPT-4o**, secondary **Claude**, last-resort self-hosted **Llama 3**. Use **LiteLLM** to switch providers smoothly.
- **Vector DB**: primary plus standby with replication, automatic promotion, and multi-region for managed DBs.
- **Embedding service**: at least two instances, a self-hosted fallback model, and cached query embeddings.
- **Graceful degradation**: if vector search fails, use **BM25** keyword search; if the LLM fails, show the top chunk with a disclaimer; if all fails, a cached answer or a clear error message.
- **Circuit breakers**: after about 5 straight failures, stop calling and use the fallback right away, so one broken service does not drag everything down.

### How do I design rate limiting for enterprise users?

- **Per-tenant quota**: a daily or monthly token budget from the contract, tracked in **Redis** with **sliding window counters**. Alert at 80%, return **429** errors at 100%.
- **Per-request limits**: requests per minute with **token bucket** or **leaky bucket** algorithms (for example enterprise 1,000 RPM, standard 100 RPM).
- **Priority queues**: enterprise requests go first under load, using separate queues.
- **Cost-aware limiting**: count tokens, not just requests, since a long generation costs far more than a cache hit.
- **Friendly responses**: send `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `Retry-After` headers.

### How do I stop one failing part from taking down the whole pipeline (cascading failures)?

- **Circuit breakers**: when errors pass a threshold, fail fast with a fallback instead of waiting.
- **Timeouts everywhere**: for example embedding 200ms, vector search 100ms, LLM 5 seconds. Never wait forever.
- **Bulkheads**: separate resource pools (LLM connections apart from vector DB connections), so one exhausted pool does not hurt the others. In **Kubernetes**, separate resource limits per deployment.
- **Backpressure**: when overloaded, tell upstream to slow down. A full message queue makes the producer wait instead of piling up memory.
- **Graceful degradation**: a partial answer with a disclaimer beats a 500 error.

## Topic 3: Observability and Monitoring

Observability means being able to see what is happening inside your system just by looking at what it emits. Monitoring then watches those signals and raises alarms.

### How do I design observability for a production RAG system?

You need three pillars:

- **Logs** (what happened): structured **JSON** logs at every stage (ingestion, embedding, retrieval, re-ranking, generation), each with a **trace ID**. Include chunk IDs, similarity scores, faithfulness scores and the final answer.
- **Metrics** (how often and how fast): latency, throughput, errors, cache hit rate and quality scores at **P50**, **P95**, **P99**, stored in **Prometheus** and shown in **Grafana**.
- **Traces** (why it was slow or wrong): **OpenTelemetry** traces where one query has child spans per stage, viewed in **Jaeger**, **Datadog APM** or **AWS X-Ray**.

You need all three together.

### What should I log at retrieval, re-ranking and generation?

Use one structured record per stage, all sharing the same `trace_id` so you can join them.

- **Retrieval**: the query, query embedding latency, vector search latency, `top_k`, the returned chunk IDs with scores and source files, and whether it was a cache hit.
- **Re-ranking**: re-ranking latency, how many chunks went in and out, the top result before and after, and the re-ranker model (for example a **cross-encoder**).
- **Generation**: model name, input and output tokens, generation latency, faithfulness score, answer length.

### How do I follow a single user query from start to finish?

This is **distributed tracing**.

1. Create a unique `trace_id` at the **API gateway**.
2. Pass it to every downstream call (as a header or context).
3. Each service adds a child **span** with its start time, end time and key details.
4. Send all spans to **Jaeger** or **Datadog APM**.

A full trace looks like a tree: gateway, query embedding, cache lookup, vector search, re-ranking, context assembly, LLM generation, output validation. When a user says an answer was slow or wrong, you open their trace, see which stage was slow, which chunks were retrieved and what the LLM saw, and can replay it. Without tracing, debugging is guesswork.

### How do I notice retrieval slowly getting worse?

It usually creeps in, so watch these:

- **Similarity score distribution**: track the average and **P10** of top-1 scores daily. Alert if the 7-day rolling average drops more than 0.05.
- **Retrieval eval set**: keep 100 to 200 labeled queries, run daily or on each deployment, and alert if **Recall@5** falls more than 5 percentage points from baseline.
- **User behavior**: repeated questions in a session, reworded follow-ups, rising thumbs-down rate.
- **Index freshness**: age of the newest document. If ingestion fails silently, the index goes stale.

### How do I measure hallucinations in production?

Humans cannot review everything, so combine automation with sampling.

- **Automated faithfulness scoring**: after each answer, a small cheap LLM (for example **GPT-4o mini**) checks whether each claim is supported by the retrieved chunks. Log the score and track the daily average.
- **Human review sampling**: review 1 to 2% of responses, oversampling those with low faithfulness. Label them faithful, partially faithful or hallucinated, and use that to calibrate the automated scorer.
- **Do not rely on hedging words** like "I believe" or "it is likely". A model can hallucinate confidently or hedge while being right. Rely on faithfulness evaluation against the retrieved context, grounded evaluation, human sampling and **claim verification**.
- **Alerts**: daily average faithfulness below 0.75, human-reviewed hallucination rate above 5%, or a sudden spike in one document category.

### What dashboards should I build?

| Dashboard | For | Shows |
| --- | --- | --- |
| **Operations** | On-call engineers | Request rate, errors, P50/P95/P99 latency, per-stage latency, LLM errors and token use, vector DB memory and queue depth, active alerts |
| **Quality** | ML engineers, product | Faithfulness trends, recall from the eval set, cache hit rate, thumbs-down and repeat-query rates, top query categories, **embedding drift** indicators |
| **Business** | Product managers | Queries per day, monthly active users, average answer quality, cost per query and per month, common topics and failures, **SLA** compliance (for example share of answers under 500ms) |

### How do I detect embedding drift?

**Embedding drift** means the kind of content or questions has changed over time, so retrieval gets worse. Causes: new topics or terminology in documents, shifting user questions, an embedding model update, or a changed preprocessing step.

Signals:

- **Similarity scores**: a downward shift in query-to-document scores.
- **Embedding statistics**: movement of the **centroid** (average vector) or change in variance.
- **Retrieval evaluation**: **Recall@k** or **MRR** drops while the architecture is unchanged.

Fixes: re-embed the documents, adjust chunking, or switch to an embedding model that fits the new domain.

### How do I get alerted when retrieval recall drops?

1. Keep a **golden eval set** of 100 to 200 question and correct-chunk pairs.
2. Run it on a schedule (hourly for critical systems, daily for standard) and compute **Recall@5** and **MRR**. Save to a time-series store.
3. Set a baseline from the first two weeks of production.
4. Alert rules: **warning** if Recall@5 falls below 0.65, **investigation** if it drops more than 5% from the 7-day rolling average, **critical** if it drops more than 10% in one day.
5. Route alerts: warnings to a **Slack** channel, critical ones page the on-call engineer.
6. Make the alert useful: include current value, baseline, change, a link to traces of the worst queries, whether a new ingestion batch or code deploy just happened, and the top 5 failing queries.

### How do I know if answers are really useful to users?

Automated scores miss whether people actually got help. Combine signals:

- **Direct**: thumbs up or down, reworded follow-ups (the first answer failed), **session completion rate** (did the user finish the task or contact a human?), copying the answer or clicking a cited source (positive).
- **Indirect**: query abandonment, **repeat query rate**, **escalation rate** to human support.
- **Qualitative**: monthly interviews or surveys, and reading free-text feedback.
- **Combine**: build a composite **usefulness score** (thumbs up, no rephrasing, session completion) and track it per document category, query type and time period to spot systematic gaps.

### How do I build a feedback loop that keeps improving the system?

1. **Collect** implicit signals (queries, completions, escalations) and explicit ones (thumbs, ratings, comments), each stored with its `trace_id` so feedback links to the exact retrieval and generation.
2. **Analyze**: review the bottom 10% of rated answers weekly and group them by failure type (retrieval miss, hallucination, irrelevant, incomplete). Each type has a different fix.
3. **Act**:
   - Retrieval misses go into the retrieval eval set; check chunking and embedding alignment.
   - Reported hallucinations go into the faithfulness eval set; tighten the prompt or improve context.
   - Missing content triggers a **content gap analysis**.
   - Learn from the well-rated answers too.
4. **Close the loop**: after a fix, check that the failure rate for similar queries drops, run **A/B tests** before full rollout, and report improvements monthly.

## Topic 4: Scenario-Based Questions

These are "what would you do if..." questions. The pattern for a good answer: find the root cause first, then pick the fix.

### My vector DB is the bottleneck. Do I scale up the machine or redesign the indexing?

It depends on why it is slow. Just adding hardware without knowing the cause only delays the problem.

- **Memory problem** (the **HNSW** index no longer fits in RAM and spills to disk): short term, add RAM (**vertical scaling**). Long term, use **Product Quantization (PQ)** or scalar quantization, **shard** across nodes, or use disk-friendly indexes like **DiskANN** for billion-scale data.
- **Query throughput problem** (too many concurrent queries on one node): scale **horizontally** with read replicas and add a **semantic cache** in front. This is the one case where horizontal scaling clearly wins.
- **Index build problem** (ingesting new documents blocks queries): use a **write buffer**, where new documents go into a flat index and merge into HNSW in the background off-peak.
- **Filter problem** (metadata filtering is slow): add **metadata indexes** on commonly filtered fields, and **partition** the index by the most common filter.

Vertical scaling is a quick patch; redesigning the indexing is the long-term answer, except for pure throughput.

### I reduced latency but hallucinations went up. Why?

Speed changes often hurt quality quietly:

- **Lower top-k** (10 to 3): the right chunk sometimes misses the cut, so the LLM answers from memory.
- **Weaker or removed re-ranker**: it used to fix wrong first-place results; now the LLM gets worse context.
- **Smaller chunks**: fragments lack surrounding context, and the LLM fills the gaps.
- **Smaller LLM** (for example **GPT-4o** to **GPT-4o mini**): less able to stay grounded when context is unclear.
- **Less context passed in**: the answer needed chunk 4 or 5, which you cut.

Fix: never optimize speed alone. Run a quality eval (**faithfulness**) after every latency change, find the exact cause, and fix it instead of undoing everything.

### After re-indexing with a new embedding model, results got worse. What went wrong?

- **Query encoder mismatch** (most common): documents use the new model but queries still use the old one. They live in different vector spaces, so scores are meaningless. Always use the same model version for both.
- **Index not fully rebuilt**: old and new embeddings are mixed. Never mix models in one index; build a **new index** and do an **atomic switchover**.
- **Normalization mismatch**: many vector DBs implement **cosine similarity** as inner product on normalized vectors. If normalization differs between indexing and query time, scores become inconsistent. Be consistent and check what your DB expects.
- **Worse model for your domain**: a better **MTEB** benchmark score does not guarantee better results on your data. Benchmark on your own data and run an **A/B test**.
- **HNSW settings**: values like `ef_construction` tuned for the old model may not suit the new one, so re-tune.

### It works in staging but fails under production load. What did I miss?

- **Concurrency**: staging tests few parallel requests. Under real load CPU saturates, memory bandwidth limits, cache locality drops and queries queue up inside the vector DB. Do **load testing** at realistic concurrency.
- **Data volume**: 10,000 test documents versus 10 million real ones. The HNSW index may spill to disk and get far slower. Test at production scale.
- **Cold starts**: staging is always warm. Real instances restart with cold models and empty caches. Use **readiness probes** that warm the model before taking traffic.
- **Network latency**: services in different availability zones add 1 to 2ms per call, which adds up over many calls. Test with realistic topology.
- **External API rate limits**: staging uses relaxed test keys. Use production-like keys and traffic.
- **Managed service tiers**: a staging tier may behave differently from the production tier under heavy query rates.

### How do I benchmark different RAG designs scientifically?

1. **Decide what to measure**: retrieval (**Recall@K**, **MRR**, **NDCG**), answer quality (faithfulness, relevance, correctness), latency (**P50/P95**, per stage), and cost (tokens per query, cost per 1000 queries).
2. **Build a controlled test set**: 200 to 500 questions with ground truth answers and correct source chunks, covering simple, multi-hop, vague and out-of-scope questions. Use it for testing only, never for tuning.
3. **Change one variable at a time** (for example only chunking, with the same embedding model, retriever and LLM).
4. **Be statistical**: run each setup 3 to 5 times, report mean and standard deviation, and use **significance testing** so noise is not mistaken for improvement.
5. **Validate in production** with an **A/B test** (for example 10% of traffic), since offline results do not always carry over.
6. **Document everything**: model versions, hyperparameters, dataset versions and infrastructure, and version your eval datasets like code.
