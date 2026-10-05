# Databases and Vector Search for GenAI Systems

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
