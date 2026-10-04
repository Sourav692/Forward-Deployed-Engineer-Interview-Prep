# Module 9 – Memory, Databases & Caching for GenAI Systems (Beginner Guide + Keywords)

Oct 4, 2026 · @Sourav Banerjee

## Overview

An LLM has no memory of its own and every call is slow and costly, so real GenAI systems add memory, databases and caches around it. In simple words: memory decides what the model remembers, databases decide where facts and vectors live, and caches decide what we can reuse instead of recomputing. The diagram below shows where each piece sits.

&#91;embedded content: memory and caches in a GenAI system · cache first, then agent with memory\]

Reading it: a question first tries the cache; on a miss the agent works inside its short-term context, reading and writing long-term memory in the databases.

Topics covered:

- Topic 1: Memory Design in AI Systems
- Topic 2: Databases for AI Systems
- Topic 3: Vector Databases & Retrieval Infrastructure
- Topic 4: Caching in GenAI Systems
- Topic 5: Memory & Caching for Agent Systems

The **bold keywords** are the exact terms to use in interviews.

## Topic 1: Memory Design in AI Systems

An LLM forgets everything between calls, so memory is something you build around it. This topic covers what to keep, where to keep it, and how to stop it from overflowing.

### How do I design short-term and long-term memory for an agent?

Think of it like a person: a notepad on the desk for today's job, and a filing cabinet for everything you have learned.

- **Short-term memory** is the **context window**: the task, the plan, tool results so far, and the current step. It has a size limit, so track **token usage** and replace finished steps with short summaries (**compression**).
- **Long-term memory** lives outside the model and survives across tasks and sessions: user preferences, past outcomes, learned knowledge. Typical stores: a **vector database** (search by meaning) plus a **relational database** (structured facts).
- The agent **reads** long-term memory at the start of a task and **writes** to it at the end.
- Important things in short-term memory "graduate" to long-term memory (a good approach, a stated preference).

### What are the problems with storing long chat histories?

- **Storage at scale**: every message is a write, so you need high **write throughput** and fast reads. Store each turn with user id, session id, turn number, timestamp and content, usually in a **relational database**.
- **You cannot load 300 turns** into the context window. Pick the useful ones by combining three things: **recency** (last 5 to 10 turns), **semantic relevance** (embed the new question and search a **vector index** of past turns), and **structural markers** (the first turns, which show the purpose of the chat).
- Keep **session state** (preferences, decisions, finished tasks) as a structured summary instead of making the model re-read raw chat.

### How do I stop memory from overflowing the context window?

- **Token counting as a gate**: before every LLM call, count tokens and keep a buffer for the answer (for example act at about 80% of the limit).
- **Compression order**, cheapest loss first: shorten long **tool outputs**; then **summarize** older turns; then keep only the recent turns plus the most relevant ones.
- **Sliding window with summaries**: every \~20 turns, make a running **conversation summary**. Context holds the summary plus recent raw turns, while the full history stays in the database.
- **Be proactive**: start summarizing in the background at around 60% of the limit, so it is ready in time.

### How does the system remember important facts and forget the rest?

- **Importance signals**: phrases like "I always prefer" or "please remember", plus decisions and action items, are worth keeping. Small talk is not. A light **classifier** or **extraction step** saves these into a structured memory store.
- **Decay-based forgetting**: score memories by similarity and by how recently they were used, so old unused ones fade.
- **Consolidation**: a background job merges duplicates and marks old facts as **superseded** when the user changes their mind.
- **Relevance-based retrieval**: do not load all memories, just fetch the few that match the current question using **vector similarity search**.

### How do I keep memory separate for each user?

A leak here is a privacy violation, not just a bug.

- **Tenant scoping**: every row and every vector carries a mandatory, indexed **user\_id** and **tenant\_id**.
- **Mandatory filter at the access layer**: every database or vector query includes the user filter at infrastructure level, so neither app code nor the LLM can skip it.
- **Namespaced cache keys** in **Redis**, for example session:{user\_id}:{session\_id}:state.
- **Prompt scoping** ("you only see this user's data") is a second safety layer, not the main one.

## Topic 2: Databases for AI Systems

A GenAI app usually needs more than one kind of database. This topic is about picking the right one for each job and laying out the tables for a RAG pipeline.

### How do I choose between relational, document and vector databases?

- **Relational** (**PostgreSQL**, **MySQL**): structured data that must stay consistent, such as users, billing, audit logs and metadata. With the **pgvector** extension, PostgreSQL can also store embeddings and do approximate nearest neighbour search (**HNSW**, **IVFFlat**).
- **Document databases** (**MongoDB**, **DynamoDB**, **Firestore**): flexible or changing shapes, such as agent traces and logs.
- **Vector databases** (**Pinecone**, **Qdrant**, **Weaviate**, **Milvus**): built for searching embeddings by similarity across millions or billions of vectors.
- Real systems mix them: PostgreSQL for metadata, a vector DB for semantic search, an **object/document store** for raw files and logs.
- For fewer than tens of millions of embeddings, **PostgreSQL + pgvector** alone is often enough.

### Why use a vector database instead of a normal one?

- **Purpose-built ANN search** (approximate nearest neighbour) with **HNSW**, **IVF**, **PQ** (product quantization), **DiskANN**.
- **Built-in lifecycle features**: embedding storage, indexing, filtering, **sharding**, **replication**, **incremental indexing**.
- **Hybrid search**: vector similarity, keyword search and metadata filters in a single query.
- **Horizontal scaling** across nodes, up to hundreds of millions or billions of vectors.

### How do I design the database tables for RAG ingestion?

Three tables cover the whole life of a document:

- **documents**: id, tenant, source, type, **file\_hash** (to catch duplicate uploads), **status** (ingesting, indexed, failed, superseded), **version**, timestamps, flexible **JSONB** metadata.
- **document\_chunks**: id, parent document, chunk text, token count, **embedding\_model** and **embedding\_version** (so you know what to re-embed after a model upgrade), and a **vector\_store\_id** linking to the vector in the vector DB.
- **document\_permissions**: who (user, role, team) can read, write or administer each document.
- Why this works: you can invalidate all chunks of a changed document, you detect duplicates by hash, and at query time you filter results to documents the user is allowed to read.

### What goes wrong when storing millions of embeddings?

- Memory is the big question, but the whole index does not always need to sit in RAM.
- **In-memory HNSW**: fastest, but needs lots of RAM.
- **Disk-based indexes** (**DiskANN**, **IVF-PQ**, SSD-optimized search): much larger datasets, slightly slower.
- Some databases use **memory-mapped** indexes, keeping the often-used graph parts in RAM.
- So you choose between RAM-heavy and low-latency, or compressed and disk-based, depending on latency needs and data size.

### How do I update embeddings when documents change often?

1. **Change detection**: use webhooks or change APIs from **SharePoint**, **Confluence**, **Notion** or **Google Drive**, and put the document on an **ingestion queue**.
2. **Priority-based re-ingestion**: a compliance policy change is more urgent than a blog edit. Rank by document type and how often it is retrieved.
3. **Re-ingest**: mark old chunks as pending replacement, parse, chunk and embed the new version, insert new chunks as **active**, delete old vectors, mark old records **superseded**.
4. Make the swap as **atomic** as you can, and always filter on status = active so queries never see both versions.
5. **Deletions**: soft delete first (hidden from queries), then hard delete later in a background job after a retention period.

## Topic 3: Vector Databases & Retrieval Infrastructure

This topic is about how vector search stays fast, how to mix it with keyword search, and how to measure and protect it in production.

### How do vector databases search so fast?

Checking the query against every vector (exact search) is too slow at scale, so they use **approximate nearest neighbour (ANN)** indexes that find near-best results in milliseconds.

- **HNSW** (Hierarchical Navigable Small World): a multi-layer graph. The top layers are sparse for quick jumps across the space, lower layers are dense for precise local search. Think of it like zooming a map from country to street. Main knobs: **ef\_construction** (index quality vs build time), **ef\_search** (recall vs query speed), **M** (edges per node: connectivity vs memory).
- **IVF** (Inverted File Index): groups vectors with **k-means** clusters and only searches the closest clusters. Faster to build, usually lower recall, good for very large data.
- **Product Quantization (PQ)**: compresses vectors into small pieces, saving 8 to 32 times memory for a bit of accuracy. Often combined as **IVF-PQ** for billion-scale data.
- Rule of thumb: up to about 10 million vectors, tuned **HNSW**; beyond about 100 million, **IVF** or **IVF-PQ**.

### How do I combine vector search with keyword search?

- Vector search understands meaning but can miss exact strings, such as a product code ("SKU-49382"). **BM25** keyword search finds exact terms reliably. **Hybrid search** uses both.
- Run both searches **in parallel** (for example with **asyncio.gather**), then merge the lists.
- **Reciprocal Rank Fusion (RRF)** merges by rank, so you do not need to match score scales. Each document scores 1 / (k + rank) in each list (k is usually 60); documents high in both lists win.
- **Dynamic weights**: more keyword weight for exact IDs and names, more vector weight for open-ended questions. A small **query classifier** decides.

### What affects vector search speed at scale?

- **Index placement**: in-memory is fastest; disk-backed or compressed is slower but bigger.
- **Search parameters** such as **ef\_search** (recall vs latency).
- **Embedding latency**: embedding the query often dominates (about 50 to 150 ms).
- **Network hops** if the vector DB is a separate service.
- **Result fetching** from PostgreSQL or an object store; reduce it with **batching** or **caching**.

### How do I measure retrieval quality?

- Build a **golden dataset** of 200 to 500 queries with known relevant documents.
- **Recall@K**: what share of the truly relevant documents show up in the top K (3 relevant, 2 in the top 5 gives 0.67).
- **MRR** (Mean Reciprocal Rank): 1 divided by the rank of the first relevant result, averaged over queries.
- **NDCG**: handles degrees of relevance and gives more credit for ranking good results higher.
- **Re-run after every change** (chunking, embedding model, index settings) to catch regressions.
- **Online signals**: users rephrasing the same question right after an answer means retrieval missed.

### What can fail in production?

Many failures are silent: no error, just worse answers.

- **Index corruption** after a crash: take regular **snapshot backups** and compare index counts with the relational DB.
- **Embedding API down**: use a **circuit breaker** and fall back to **keyword-only search**.
- **Stale index**: lag between document updates and index updates; monitor and alert on it.
- **Memory pressure and swapping**: causes huge latency spikes; monitor the process memory (**RSS**).
- **Thundering herd on cold start**: the index must load into RAM first. Use a **readiness probe** and **connection draining**.

## Topic 4: Caching in GenAI Systems

Calling an LLM is slow and costs money. A cache is a quick-answer shelf that saves repeating work you already did.

### How does caching cut cost and delay?

- **Cost**: a cache hit means no LLM API call at all. If 30% of 100,000 daily requests hit the cache, 30,000 paid calls disappear.
- **Latency**: a hit returns in around 10 ms, versus seconds for an LLM call.
- **Semantic caching**: matches questions that mean the same thing ("company remote work policy?" and "Can I work from home?") using **embedding similarity**, so many more requests hit.
- **Multi-step pipelines** can cache at every step: query embeddings, retrieval results and LLM answers.
- The extra cost (**Redis** or in-memory storage, embedding the query, cache logic) is small compared to the savings.

### Which requests should I cache?

| Cacheability | Examples | How |
| --- | --- | --- |
| Highly cacheable | Stable facts, enterprise policy questions, FAQs ("reset my password") | Long **TTL** (time to live), or until the source document changes |
| Moderately cacheable | Slowly changing info like plan pricing; retrieval results for common queries | Short TTL (1 to 4 hours) plus invalidation on updates |
| Do not cache | Personalized ("my leave balance"), real-time (stock price), sensitive account data | Never share across users |

### How do I cache repeated chatbot questions?

- Build a **semantic cache**: embed the new question, search a **vector store** for a similar cached question, and if the **similarity threshold** is met, return the stored answer from **Redis**. Otherwise call the LLM and save the result with a **TTL**.
- The threshold (often a **cosine similarity** around 0.80 to 0.92) must be **tuned with real query pairs** so you avoid wrong cache hits.
- **Context hash**: for RAG, hash the retrieved documents into the cache key, so the same question with different context does not share an answer.
- Chatbot caveat: later turns carry conversation history, so caching works best on the **first turn** of a new session.

### How do I clear cached answers when the source changes?

- **Tag-based invalidation**: store each cached answer with the IDs of the documents it used (a Redis set per document). When a document changes, delete every entry under that tag, not the whole cache.
- **Event-driven invalidation**: trigger the clean-up from the document system's update event.
- **TTL as the safety net** in case an event was missed: for example 24 hours for stable data, 1 hour for volatile data.

### How does embedding caching help with big ingestion jobs?

- **Chunk-level fingerprinting**: hash the chunk text plus the **embedding model name** (for example **SHA-256**) and use it as the cache key. If seen before, skip the embedding API call.
- Biggest savings: **re-indexing after small edits** (only the changed chunks are re-embedded) and **cross-document deduplication** (the same policy copied in many places).
- Including the **model name** in the hash means upgrading the model automatically invalidates old embeddings.
- Storage: a 1536-dimension float32 vector is about 6 KB, so 1 million embeddings is about 6 GB. Turn on Redis **persistence** so the cache survives restarts.

## Topic 5: Memory & Caching for Agent Systems

Agents run many steps, sometimes for days. Memory lets them learn and continue; caching saves repeat work; both need rules so they do not backfire.

### How do I design persistent memory and retrieval rules for a long-running agent?

- **Four memory types**: **working memory** (the context window), **episodic memory** (history of past tasks), **semantic memory** (general learned knowledge), **procedural memory** (strategies for doing tasks).
- **Storage**: **vector database** for meaning-based search, **relational/document database** for structured metadata.
- **Retrieval gating** keeps irrelevant memories out: **semantic similarity filtering**, **recency weighting**, **usefulness scoring** and a **top-k cap**.
- Example score: about 0.6 x similarity + 0.25 x recency + 0.15 x usage frequency.

### What is the risk of storing too much memory?

- **Context contamination**: old and new facts conflict (an old preference vs a new one), so more memory means a noisier signal.
- **Compounding errors**: a wrong conclusion saved to memory gets reused and becomes a false belief.
- **Cost and noise**: top-k search over millions of memories costs more and returns marginal results.
- **Privacy**: sensitive information kept forever may resurface in the wrong context.
- **Fixes**: **TTL on episodic memories**, **consolidate** many episodes into one semantic summary, let users **inspect and delete** memories, and **audit** them for accuracy.

### How do I combine vector search and structured databases for agent memory?

- **Vector search**: "find memories relevant to this situation" (open-ended, by meaning).
- **Structured database**: "all decisions about project X in the last 30 days" (exact, by filters).
- **Together**: each memory has metadata in the relational DB (agent id, user id, **memory\_type**, created\_at, last\_accessed, access\_count, relevance score, tags), full text in a document store, and an **embedding** in the vector DB.
- **Query pattern**: vector search with metadata filters (agent, type, last 90 days), take the top 20, then **re-rank** with a combined score of similarity, recency and access frequency, and keep the best 10.

### How do caches work inside an agent's reasoning loop?

- **Good to cache**: **tool call results** (a customer lookup that has not changed), planning output for similar tasks, and retrieved documents for the task.
- **Do not cache**: **reasoning steps** that depend on growing context (the same visible input still has different history), and **tool calls with side effects** such as send\_email or update\_database. These must run every time.
- **Cache scope**: tool result caches live for the current task and expire when it ends; longer caches only for stable reference data.

### How do I design memory for several agents working together?

- Split **shared memory** (task plan and status, each agent's results, shared facts, who is doing what) from **private memory** (the agent's current sub-task, its own reasoning and tool history).
- Use an **append-only shared log**: agents add entries and never edit each other's, so there are no write conflicts. Each entry has agent id, type, content, timestamp and a **sequence number**.
- **The log is the communication channel**: researcher writes, verifier reads and writes, writer reads both. No direct agent-to-agent messages.
- **Conflict detection**: contradictions are visible in the log, so the **orchestrator** can spot them and start a resolution step instead of silently overwriting.
