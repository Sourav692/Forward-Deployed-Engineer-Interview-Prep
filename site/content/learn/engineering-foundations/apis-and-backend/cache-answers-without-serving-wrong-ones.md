# Cache Answers Without Serving Wrong Ones

*A semantic cache answers far more questions from memory than an exact-match cache, but every extra hit is a bet that two different questions deserve the same answer.*

◷ 4 min

A cache that misses is slow; a cache that hits wrongly is worse, because it serves a confident wrong answer. Start with exact-match caching, move to semantic caching only when the hit rate justifies the risk, and place either one in front of the expensive path.

**Objectives:**

- explain what an exact-match response cache keys on and why it is safe;
- name the correctness risk a semantic cache adds, and the constraint that contains it;
- say why invalidation is harder for a semantic cache and where any cache must sit.

---

## Start With Exact-Match Caching

The FDE Handbook's RAG response cache is exact-match. Its key is the question, plus the compiled permission filter, plus the exact retrieved context. Two questions that mean the same thing but are worded differently are two keys, so the second one recomputes everything.

That sounds wasteful, but it is safe. A hit only happens when everything that shaped the answer is identical. When the content behind an answer changes, its entries clear cleanly.

## Treat a Similarity Threshold as a Correctness Risk

A semantic cache works differently. It embeds the incoming question, compares it with the embeddings of questions already answered, and treats any match above a similarity threshold as a hit. This is a genuinely different problem, not a bigger cache.

The threshold introduces a risk exact-match never has. Consider "refund policy for EU customers" and "refund policy for US customers". The two are close in meaning, yet they expect different answers. A naive semantic cache serves a *wrong* answer confidently, not a *stale* one.

Tune the threshold conservatively. The safest version never matches across different permission scopes or tenants, however close the wording.

> **Warning: never let a semantic cache cross a permission boundary.** Two users in different tenants or scopes may ask near-identical questions. A shared hit hands one of them an answer built from documents they are not allowed to see.

## Expect Harder Invalidation

An exact-match cache clears an entry when the content it answered from changes. A semantic cache cannot stop there. It has to decide when a stored answer's whole *neighbourhood* of similar questions is no longer trustworthy. That can follow any relevant document change, not only a change to the document that produced the cached answer.

## Put the Cache in Front of the Expensive Path

A cache saves only the work it skips. The FDE Handbook's travel-agent lesson makes the point: a cache placed after the fan-out to several services saves nothing, because the expensive calls have already happened. Place semantic or exact caching in front of the expensive path.

## Worked Example: An HR Assistant Across Two Regions

An HR assistant serves staff in the EU and the US. It starts with an exact-match cache keyed on question, compiled filter and context. Hit rates are modest, because staff word questions differently.

The team considers a semantic cache. Their test set turns up the obvious trap: "What is the refund policy for EU customers?" sits just above the threshold against a cached US answer. They respond in three ways. They set a conservative threshold. They partition the cache by permission scope, so an EU user can never hit a US entry. And they invalidate a cached answer's neighbourhood whenever any policy document in that scope changes.

They also check placement. The cache sits before retrieval and generation, not after. With those constraints the semantic cache raises the hit rate without serving a wrong answer. Without them, the extra hits would have been confident mistakes.

---

## Key Takeaways

- Exact-match caching keys on question, compiled filter and exact context; it is the safer starting point.
- A semantic cache's similarity threshold can serve a confidently wrong answer; tune it conservatively and never match across permission scopes or tenants.
- Semantic invalidation must cover a whole neighbourhood of similar questions after any relevant document change.
- Put any cache in front of the expensive path; a cache after the fan-out saves nothing.

## Check Yourself

1. **What correctness risk does semantic caching add that exact-match does not?**
   Two questions close in wording but needing different answers, such as EU and US refund policy, can share a hit. The cache then serves a confidently wrong answer.

2. **What is the safest constraint on a semantic cache?**
   A conservative threshold, and never matching across different permission scopes or tenants, however close the wording.

3. **Why is invalidation harder for a semantic cache?**
   It must decide when a stored answer's whole neighbourhood of similar questions is no longer trustworthy, after any relevant document change, not only the one that produced the answer.

## References

**Sources:** `03_Caching_Streaming_CICD_BuildVsBuy.md` (FDE Handbook, Cross-Cutting Concerns): "Why this matters", §1 "Semantic caching" and "Interview lens".
