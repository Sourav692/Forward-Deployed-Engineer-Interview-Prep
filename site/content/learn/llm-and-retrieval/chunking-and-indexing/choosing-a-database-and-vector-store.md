# Choosing a Database and Vector Store

*A managed vector database ships in minutes with little operations work, but cost, data residency, and tuning control push larger or regulated deployments toward self-hosting.*

◷ 7 min

There is no single "RAG database". A GenAI system usually needs several stores, each for its own job, and the vector store is only one of them. This lesson builds on the index families from [How Vector Search Works](/learn/llm-and-retrieval/chunking-and-indexing/how-vector-search-works).

**Objectives:**

- assign relational, document, vector, and object stores to their jobs in a RAG system;
- decide when PostgreSQL with pgvector is enough;
- compare FAISS, Pinecone, Weaviate, and Milvus, and choose managed or self-hosted;
- lay out the ingestion tables that make re-embedding and access filtering possible;
- benchmark candidate stores on the team's own data.

---

## Give Each Kind of Data Its Own Store

Different data needs different guarantees, so real systems mix databases. Users, billing, audit logs, and document metadata must stay consistent, which suits a relational database such as PostgreSQL or MySQL. Agent traces and logs change shape often, which suits a document database such as MongoDB, DynamoDB, or Firestore. Embeddings need similarity search over millions or billions of vectors, which suits a vector database such as Pinecone, Qdrant, Weaviate, or Milvus. Raw files live in an object store.

A vector database earns its place through purpose-built ANN search and the lifecycle around it. It stores and indexes embeddings, applies filters, shards and replicates, and indexes incrementally. Many can combine vector similarity, keyword search, and metadata filters in one query, and scale horizontally across nodes.

## Start With pgvector Below Tens of Millions of Vectors

PostgreSQL with the pgvector extension stores embeddings next to relational data and supports HNSW and IVFFlat indexes. The GenAI databases notes say that below tens of millions of embeddings, PostgreSQL plus pgvector alone is often enough.

The parent document tutorial adds an operational argument. If the vector store and the store of full documents are both Postgres, the operations surface shrinks to one database. When pgvector read latency spikes under load, check first that the vector column has an HNSW or IVFFlat index and is not being scanned sequentially.

## Compare the Main Vector Stores by What They Are

The four names that come up most are different kinds of thing, not four versions of one product.

| Tool | What it is | Good for | Watch out for |
|---|---|---|---|
| FAISS | A search library inside the application; IVF, HNSW, and PQ; saving to disk is manual | Research, offline pipelines, local prototypes | No server, no distribution, no built-in metadata filter or keyword search |
| Pinecone | Fully managed service with auto-scaling, metadata filtering, replication, and dense plus sparse search | Small teams, fast launch, little operations work | Proprietary, cost grows at scale, few tuning knobs, undisclosed algorithm |
| Weaviate | Open source, self-hosted or cloud; built-in BM25 plus vector hybrid; schema-based | Hybrid search, structured metadata, self-hosting | Schema design and setup take more work |
| Milvus | Open source and distributed; HNSW, IVF_FLAT, IVF_PQ, and DiskANN | Hundreds of millions to billions of vectors | Complex to run, with several supporting components |

Hybrid support differs too. Weaviate builds it in with configurable fusion. Qdrant stores sparse and dense vectors together. Pinecone supports sparse-dense, but the sparse vectors must be created before ingestion. FAISS has no keyword search, so it is paired with Elasticsearch, OpenSearch, or a BM25 library, with merging done in application code.

## Choose Managed or Self-Hosted by Constraint

The decision turns on constraints. Team, timeline, compliance, and scale decide it, not taste.

| Worry | Points to |
|---|---|
| Small team, no infrastructure person | Managed |
| Must ship in minutes, not days | Managed |
| Compliance allows data to live with a vendor | Managed |
| Roughly under 50 million vectors | Managed |
| Data residency rules keep data in-house | Self-hosted |
| 100 million or more vectors with heavy traffic | Self-hosted |
| Need custom HNSW settings, quantization, or index types | Self-hosted |
| Already running Kubernetes with a team for it | Self-hosted |

A common mix is managed for development and staging, self-hosted for production. Scale thresholds differ across sources: one note suggests managed under roughly 50 million vectors, another calls managed the practical choice at 10 million or more. Treat both as rules of thumb. Neither is a hard limit.

## Lay Out Tables That Survive Change

Three relational tables cover a document's life in a RAG pipeline.

| Table | Key fields | What they make possible |
|---|---|---|
| `documents` | id, tenant, source, type, `file_hash`, status, version, timestamps, JSONB metadata | Catch duplicate uploads by hash; track ingesting, indexed, failed, or superseded |
| `document_chunks` | id, parent document, chunk text, token count, `embedding_model`, `embedding_version`, `vector_store_id` | Know exactly what to re-embed after a model upgrade; link to the vector |
| `document_permissions` | User, role, or team, with read, write, or admin rights | Filter results at query time to documents the user may read |

A store cannot re-embed what it never recorded. The model and version columns turn an embedding upgrade from a guess into a query. The status column lets queries see only active chunks.

> **Warning: vendor benchmarks do not predict behaviour on the team's own data.** Compare stores on real documents, the real embedding model, and real metadata filters. A store that is fast without filters can slow sharply with them.

## Benchmark on Real Data Before Choosing

The GenAI Engineering notes give a six-step comparison.

1. Write requirements: target queries per second, maximum P95 latency, dataset size now and in 12 months, required recall (95% or 99%), and must-have features such as hybrid search, filtering, and multi-tenancy.
2. Build a realistic test set from real documents, embedding model, and filters.
3. Measure indexing: time to index 100,000, 1 million, and 10 million vectors; CPU and memory; and how soon new vectors become searchable.
4. Measure queries under load at 1x, 5x, and 10x expected traffic, recording P50, P95, and P99 latency, with and without filters.
5. Measure recall against exact brute-force results. Recall@K here is the share of the ANN top-k that matches the exact top-k. Aim for at least 95% at the chosen `ef_search` or `nprobe` setting.
6. Measure operations: setup effort, monitoring, update and delete speed, and recovery time after a failure.

## Worked Example: A Support Assistant at 5,000 Articles

A support agent answers from about 5,000 internal articles, growing by about 20 a day toward 50,000. Answers need p95 latency under 2 seconds.

That scale is far below tens of millions of vectors, so Postgres with pgvector is enough. It also holds the article metadata, permissions, and full parent documents, so there is one database to run, not two. An HNSW index goes on the vector column once the table passes a few thousand vectors. The `documents` table's hash and version columns let the daily job add 20 articles without reindexing everything.

A regulated customer would change the answer only at the residency line. If documents cannot leave the customer's cloud, the store must be self-hosted inside it, whichever product is chosen.

---

## Key Takeaways

- Real systems mix relational, document, vector, and object stores, each for its own job.
- Below tens of millions of embeddings, PostgreSQL with pgvector is often enough and keeps one database.
- FAISS is a library, Pinecone a managed service, and Weaviate and Milvus open-source databases with different strengths.
- Managed or self-hosted is decided by team size, timeline, compliance, scale, and tuning needs.
- Record the embedding model and version per chunk, and a status per document, so re-embedding and filtering are queries.
- Benchmark candidate stores on real data, under load, with filters, and against exact-search recall.

## Check Yourself

1. **When is PostgreSQL with pgvector a reasonable vector store?**
   Below tens of millions of embeddings, especially when metadata and full documents already live in Postgres.

2. **Why store `embedding_model` and `embedding_version` on every chunk?**
   After a model upgrade, they show exactly which chunks need re-embedding, so query-time and stored vectors stay in the same space.

3. **How is ANN recall measured when comparing stores?**
   Compare the ANN top-k with exact brute-force top-k for the same queries; the share that matches is Recall@K. Aim for at least 95%.

## References

**Sources:** `Module_09_Memory_Databases_Caching_for_GenAI_Systems.md`: Topic 2 "How do I choose between relational, document and vector databases?", "Why use a vector database instead of a normal one?", and "How do I design the database tables for RAG ingestion?". `Module_02_RAG_Frameworks_Tools_Implementation.md`: Topic 3 "How do FAISS, Pinecone, Weaviate and Milvus compare?", "When should I pick a managed vector DB instead of self-hosting?", "How do metadata filtering and hybrid search differ across vector DBs?", and "How would I test and compare vector DBs before choosing?". `Module_01_RAG_Fundamentals_Core_Components.md`: Topic 5 "How do you scale a vector database to millions of embeddings?". `parent_document_retrieval_INTERVIEW_TUTORIAL.md`: the "Chroma (in-memory) vs. PGVector" trade-off, Applied AI question 8, and the §6 mock design.
