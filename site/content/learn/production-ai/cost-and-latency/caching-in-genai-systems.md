# Caching in GenAI Systems

*A cache hit is the cheapest and fastest answer the system can give, and a wrong or cross-tenant hit is the most confident mistake it can make.*

A cache in a GenAI system is not a performance detail; it is a security and correctness decision. Cache what is expensive and stable, key it on everything that could change the answer, and clear it the moment the source changes.

**Objectives:**

- estimate what caching saves and decide which requests are safe to cache;
- choose between exact-match, semantic and provider prompt caching, and know each one's failure;
- build a cache key and an invalidation plan that respect tenants, permissions and versions.

---

## Count What a Hit Saves

Calling an LLM is slow and costs money. A cache is a shelf of answers the system already paid for. A hit means no model call at all. If 30% of 100,000 daily requests hit the cache, 30,000 paid calls disappear. A hit returns in around 10 ms, against seconds for a model call.

A multi-step pipeline can cache at every step: query embeddings, retrieval results and final answers. The overhead of a store such as Redis, an embedding per query and the cache logic is small next to the savings.

## Decide What Is Safe to Cache

Not every answer should be shared, even if the question repeats.

| How cacheable | Examples | How long |
|---|---|---|
| Highly | Stable facts, policy questions, FAQs such as "reset my password" | A long time to live (TTL), or until the source document changes |
| Moderately | Slowly changing data such as plan pricing; retrieval results for common queries | A short TTL of 1 to 4 hours, plus invalidation on updates |
| Not at all | Personal data ("my leave balance"), real-time data (a stock price), sensitive account data | Never shared across users |

The cost and latency playbook adds an enterprise rule: every cache must be tenant-aware, permission-aware, version-aware and freshness-aware. Prompt caches must not carry one user's sensitive context to another. Response caches must key on tenant, permission, document version and prompt version. Embedding caches key on content hash and model version. Retrieval caches must clear on any document, ACL or metadata change. Session caches clear at logout. CDN and gateway caches hold static resources only, never personalised responses.

## Start With Exact Match

The simplest cache keys on the exact prompt text. The production-operations tutorial installs one globally: an in-memory store for one process, or a SQLite store that survives a restart.

```python
set_llm_cache(SQLiteCache(database_path="langchain.db"))
chatgpt.invoke(chat_template.format())   # first call: slow, hits the API
chatgpt.invoke(chat_template.format())   # second call: instant, from cache
```

Exact match is free money when queries are machine-generated and repetitive, such as templated prompts. It misses every paraphrase. "What is Python?" and "Tell me about Python" are two misses.

Watch for a class that only claims to be semantic. The tutorial's cost notebook names its cache `SemanticCache` and gives it a `similarity_threshold`. Its lookup lowercases the query, MD5-hashes it and looks for an exact match. No embedding is involved. When the hit rate is lower than repeat user intent suggests, check whether the "semantic" cache compares meaning at all.

## Go Semantic Only With a Tuned Threshold

A real semantic cache embeds the new question and searches a vector store for a similar cached question. If similarity clears the threshold, it returns the stored answer, for example from Redis. Otherwise it calls the model and saves the result with a TTL. "Company remote work policy?" and "Can I work from home?" can then share one answer.

The threshold, often a cosine similarity around 0.80 to 0.92, must be tuned on real query pairs. For RAG, hash the retrieved documents into the cache key, so the same question with different context does not share an answer. In a chatbot, later turns carry conversation history, so semantic caching works best on the first turn of a session.

The threshold creates a risk exact match never has. Two questions can be close in wording and need different answers. "Refund policy for EU customers" and "refund policy for US customers" are near neighbours. A loose threshold serves the wrong answer confidently, not just a stale one. Tune conservatively, and never match across permission scopes or tenants, however close the wording.

Invalidation is harder too. An exact cache entry clears when its source changes. A semantic cache must decide when a whole neighbourhood of similar questions is no longer trustworthy, after any relevant document changes.

The sources disagree on where to start. The GenAI engineering notes recommend a semantic cache for repeated chatbot questions. The platform-judgement notes call exact match the safer starting point and semantic caching the next step. Both are right for different traffic: start exact, and add semantic matching when paraphrase-heavy human traffic shows the missed hits are worth the risk and the embedding cost.

## Clear Answers When the Source Changes

Three mechanisms work together.

**Tag-based invalidation.** Store each answer with the IDs of the documents it used, for example as a Redis set per document. When a document changes, delete every entry under its tag, not the whole cache.

**Event-driven invalidation.** Trigger that clean-up from the document system's update event.

**TTL as the safety net.** If an event is missed, expiry still clears the entry, for example after 24 hours for stable data and 1 hour for volatile data.

A stale answer after a knowledge update is worse than a miss.

## Cache Embeddings by Content Hash

Large ingestion jobs repeat work. Fingerprint each chunk by hashing its text plus the embedding model name, for example with SHA-256, and use that as the key. If the key exists, skip the embedding call.

The biggest savings come from re-indexing after small edits, where only changed chunks are re-embedded, and from duplicate content such as one policy copied into many places. Including the model name means a model upgrade invalidates old embeddings automatically. Size the store: a 1536-dimension float32 vector is about 6 KB, so 1 million embeddings take about 6 GB. Turn on persistence so the cache survives restarts.

## Keep Provider Prompt Caches Warm

Providers also cache prompt prefixes, which cuts input cost and prefill time on repeated context. In Anthropic's implementation, the match is byte-exact on the prefix, rendered as tools, then system, then messages. One changed byte invalidates everything after it.

So put stable content first: a frozen system prompt and a tool list in a fixed order. Put volatile content, such as timestamps, request IDs and the user's question, after the last cache breakpoint. When the hit rate drops suddenly, look for silent invalidators. Common ones are a timestamp in the system prompt, unsorted JSON keys, a tool list whose order varies, a prompt-version bump or a model swap, since caches are per model.

Prove it from usage data rather than guessing: zero cached-read tokens across identical requests means something is invalidating the prefix. Short prefixes below a model-dependent minimum, roughly 512 to 4,096 tokens, do not cache at all. At most 4 cache breakpoints fit in one request.

## Write the Key That Makes Caching Safe

The playbook's cache key rule combines every input that could change the answer:

```
tenant_id + user_id or permission_signature + document_version
+ prompt_version + model_version + request_normalized_hash + tool_state_version
```

If that key feels too heavy, the answer is probably not safe to cache broadly. Never cache secrets, tokens, credentials or private notes. Never share sensitive user-specific answers without permission-bound keys. Avoid caching results behind fast-changing permissions unless invalidation is strong.

> **Warning: a cache hit-rate drop is usually a keying problem.** After a deploy, compare cache keys before and after and inspect invalidation events. A new prompt version, a changed TTL, new normalisation or document churn are the usual causes. Any cache change needs a performance review and a security review.

## Worked Example: Caching a Support Bot

A support bot serves 10,000 daily users, and spend rises faster than ticket deflection. An intent classifier routes each message. FAQ intents such as password resets go through a semantic cache. Its threshold is tuned on real paraphrase pairs and its key carries the tenant, the prompt version and a hash of the retrieved documents. Each entry is tagged with its source document IDs, cleared by update events, and expires after 24 hours as a safety net.

Account-specific questions bypass the cache and call tools, because live account data must not be shared. The system prompt is frozen and placed first, so the provider's prefix cache stays warm. Ingestion re-embeds only chunks whose content hash changed.

Cost per resolved ticket falls on the repeated intents, while personal answers stay uncached. Every cache decision followed one test: is the answer stable, and does the key capture everything that could change it?

---

## Key Takeaways

- A cache hit removes a paid call and returns in milliseconds; cache at every expensive, stable step.
- Classify requests by cacheability, and make every cache tenant-, permission-, version- and freshness-aware.
- Exact match is the safe start and misses paraphrases; check that a "semantic" cache really compares embeddings.
- Semantic caching needs a threshold tuned on real pairs, context hashes for RAG and no cross-tenant matches, and its invalidation is harder.
- Invalidate by document tag and update event, with a TTL as the safety net.
- Cache embeddings by a hash of chunk text plus model name, and keep provider prefix caches warm by putting stable content first.
- Build the full cache key; if it feels too heavy, the answer should not be cached broadly.

## Check Yourself

1. **"What is Python?" hits the cache but "Tell me about Python" misses. What do you check first?**
   Whether the cache compares embeddings at all. A hash of the normalised text is exact match, even if the class is called semantic.

2. **Why must a semantic cache never match across tenants, even with near-identical wording?**
   Close wording can need a different answer, and tenants have different permissions. A cross-tenant hit leaks data and serves a confidently wrong answer.

3. **Why include the embedding model name in the embedding-cache key?**
   So a model upgrade invalidates every old embedding automatically, instead of mixing vectors from two models.

