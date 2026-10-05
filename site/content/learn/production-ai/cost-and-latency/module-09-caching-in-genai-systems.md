# Caching in GenAI Systems

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
