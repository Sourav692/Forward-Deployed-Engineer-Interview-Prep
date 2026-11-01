# Enterprise Knowledge Assistant: Interview Guide, part 2

## 7. ABAC

ACL asks “can this principal access this document?”

ABAC can combine:

- user tenant
- groups
- department
- clearance
- region
- document classification
- customer/account
- time window

Authorisation stays deterministic. **Never ask the LLM to decide whether a user is allowed to see something.**

---

## 8. Retrieval

Use hybrid retrieval.

**Dense search:** semantic similarity and paraphrases.

**BM25/lexical search:** ticket IDs, error codes, policy IDs, product names and exact identifiers.

**RRF:** combine rank from dense and lexical systems.

Then rerank the authorised candidate pool.

Correct order:

~~~text
Authorise
 → Retrieve
 → Fuse
 → Enforce policy
 → Rerank
 → Select evidence
 → Generate
~~~

Never: retrieve → rerank everything → remove forbidden documents.

---

## 9. Reranking and context

Reranking improves ordering but adds latency/cost.

Use it for ambiguous queries or when quality justifies it. Reduce or skip it for safe cache hits, high-confidence single-source answers and very tight latency targets.

Do not stuff the entire top-k into the prompt.

Use:

1. authorised candidates
2. rerank
3. evidence selection
4. compression if needed
5. generation

A small, high-quality evidence set usually beats prompt stuffing.

---

## 10. Generation, citations and abstention

The LLM answers from the selected evidence.

~~~text
Evidence
 → Answer
 → Citation builder
 → Citation verifier
 → Output policy
 → User
~~~

Every citation must refer to evidence the user is authorised to see and that supports the claim.

If evidence is insufficient:

> **Abstain.**

Possible outcomes:

- Answer
- Answer with limitation/staleness warning
- Abstain
- Escalate

---

## 11. Prompt injection

Retrieved documents are data, not instructions.

A wiki page can contain malicious text telling the model to ignore its instructions. The model must not turn that into a tool action or security decision.

Use:

- clear instruction/data boundaries
- deterministic authorisation
- tool gateway
- allowlisted tools/actions
- argument validation
- output checks
- human approval for risky writes

Prompting alone does not solve prompt injection.

---

## 12. Evaluation

Evaluate separate layers.

### Retrieval

- Recall@k
- MRR/NDCG where useful
- exact-match retrieval for IDs/errors
- source coverage

### Grounding

- answer supported by evidence
- citation correctness
- citation completeness

### Security

- unauthorised retrieval
- unauthorised citation
- cross-tenant leakage
- revoked/deleted document tests

**Leakage is a release gate.** One exposure blocks release.

### Freshness

Test update, deletion, ACL revocation and reconciliation lag.

### Operations

Track p50/p95/p99 latency, token usage, cost/request, cache hit rate, escalation rate, connector lag, index freshness and model/version changes.

---

## 13. Persona-based testing

Create a persona × document visibility matrix.

Example personas:

- Tier-1 support
- Tier-3 engineer
- account manager
- security/admin
- external contractor
- cross-tenant user

Run the same questions as each identity.

Change the question from “did we get the right answer?” to:

> **“Did each persona get the right authorised answer?”**

Include negative cases where the correct result is zero accessible documents.

---

## 14. Observability and audit

A replayable trace should capture, subject to privacy policy:

- request ID
- identity/tenant reference
- source event/version
- ACL/index version
- policy decision
- retrieved IDs
- final evidence/citations
- model/version
- prompt/template version
- stage latency
- cost
- output policy decision

The audit system itself needs access control.

---

## 15. Scale and latency

Use round numbers as reasoning examples.

| Number | What it forces |
|---|---|
| 100k employees | ACL/identity cardinality |
| 50M chunks | Refresh/deletion problem |
| 20 QPS | Average load |
| 100 QPS | Peak serving pressure |
| <3 s | Chat-grade target in this design |
| <8 s | Relaxed interactive target in this design |
| ~100 ms | Generation cannot stay on the hot path |

At 100 QPS and ~3 seconds of generation, roughly 300 generations are in flight at once, which makes this a serving problem.

Budget latency across:

**identity/auth → retrieval → rerank → generation → verification**

Use permission-aware caching, bounded top-k, selective reranking, model routing, async ingestion and circuit breakers.

**Timeouts must degrade safely; they must never fail open.**

---

## 16. Scalability, latency & cost: production design

Use one framework: measure the workload, find the bottleneck, then bound or route the expensive work without weakening authorisation or answer quality.

| Concern | What drives it | Production choices | What to measure |
|---|---|---|---|
| **Scalability** | Corpus size, peak QPS, ACL/group cardinality, ingestion churn | Separate asynchronous ingestion from serving; partition/shard by tenant or useful scope; incremental indexing and tombstones; bounded candidate sets; scale stateless serving independently | Peak and sustained QPS, queue lag, index freshness, retrieval capacity, error rate |
| **Latency** | Identity/policy lookup, retrieval, reranking, generation and verification | Apply authorisation in retrieval; keep top-k bounded; rerank selectively; parallelise independent safe work; use permission-aware caches; stream when useful; set stage deadlines and degrade to safe partial results or abstention | p50/p95/p99 per stage, timeout rate, cache hit rate, time to first token |
| **Cost** | Embedding/index refresh, search, reranking, model calls and context tokens | Incremental/batched embeddings; route simple tasks to smaller models; compress evidence; cap top-k/context; rerank only when expected quality gain justifies it; cache only with permission/version-aware keys | Cost per request and tenant, tokens, embedding/index spend, rerank rate, cost by route |

### How to reason through it in an interview

1. **Quantify first.** Ask for corpus size, average and peak QPS, concurrency, freshness/revocation SLO, p95 target, quality target and cost budget. State assumptions if the interviewer has no numbers.
2. **Protect the invariant.** Authorisation pre-filtering and the final policy check stay in place. A timeout or cache hit must never bypass permissions or serve stale revoked content.
3. **Optimise the measured bottleneck.** Profile each stage before choosing a fix. Reduce candidate count or skip reranking only when evaluation shows quality remains acceptable; route up to a stronger model for high-risk or difficult synthesis.
4. **Scale ingestion separately.** Queue connector work, make it idempotent, process changes incrementally, and reconcile periodically. This prevents backfills from competing with interactive serving.
5. **Set safe degradation paths.** On a deadline, stop optional reranking or return fewer verified results; if authorisation or permission freshness cannot be established, fail closed and abstain; label stale content instead of refusing it.
6. **Prove the trade-off.** Replay representative queries across personas and track answer quality, citation correctness, leakage, latency and cost together. Zero leakage remains a release gate.

**Interview-ready answer:**

> “I’d start by quantifying corpus size, peak QPS, freshness, latency and cost targets. I’d separate asynchronous ingestion from online serving and scale retrieval and generation independently. On the query path I’d enforce permissions inside retrieval, keep top-k and context bounded, and use reranking and model size selectively based on measured quality. I’d cache only with tenant, permission and index or policy versions in the key, and invalidate on changes. Then I’d track p95 by stage, cost per request, freshness and answer quality together. Under pressure I can skip optional work or abstain, but I never relax authorisation.”

---

## 17. Safe caching

Never key the cache on the query alone:

~~~text
query → answer
~~~

Use a key containing at least:

~~~text
tenant
+ permission signature
+ index version
+ query
~~~

Consider adding model/prompt version.

Invalidate on ACL changes, deletes, source updates and index/policy changes.

---

## 18. Multi-tenancy

Isolate tenants across:

- identity
- authorisation
- retrieval filters
- cache keys
- storage/index partitioning
- audit
- evaluation

A cross-tenant principal with broad groups must still return zero results for another tenant.

---

## 19. Failure playbook

**Retrieval down:** partial safe coverage or abstain; never invent.

**LLM down:** retrieval-only result if useful/safe, otherwise abstain.

**Connector down:** answer with a staleness label; refuse only when its permission data is stale.

**Permission service down:** fail closed.

**Missed deletion:** tombstone + reconciliation + revalidation.

**Reranker too slow:** smaller candidate set, cheaper reranker or selective reranking.

**Embedding model changes:** version index, offline eval, staged cutover and rollback.

**Long context hurts quality:** tighten evidence and compress.

---

## 20. Cost optimisation

Think:

~~~text
Measure
 → Route
 → Bound
 → Compress
 → Selective rerank
 → Cache safely
~~~

Use smaller models for classification/routing, calibrated top-k, selective reranking, evidence compression, batch embeddings and incremental indexing.

For legal/high-risk RAG:

~~~text
auth
 → tenant/ACL filters
 → hybrid retrieval
 → optional rerank
 → compressed evidence
 → cited answer
 → audit
~~~

Simple clause lookup can use a cheaper model. High-risk synthesis can escalate.

---

## 21. 100 ms pivot

At ~100 ms, ordinary end-to-end generation cannot remain on the hot path.

Use:

- cached embeddings
- cached permission-aware retrieval
- verified semantic answer cache
- pre-filter inside search
- selective/skip reranking
- precomputation for common queries
- streaming where appropriate

At that point the system is closer to a permission-aware search product with a cached-answer layer.

---

## 22. Interview story

Opening:

> “I built an enterprise AI search system where the hardest part wasn't finding the right answer. It was making sure the same question produced the right answer for the right person.”

Five beats:

1. **Problem:** multiple roles need different slices of the same information.
2. **Decision:** authorisation becomes a retrieval constraint.
3. **Design:** normalise ACLs → pre-filter → retrieve → post-check → rerank → evidence → generate → verify.
4. **Lessons:** bad test labels, untested security rules and model-based security decisions can all mislead you.
5. **Limitation:** a small corpus can make retrieval strategies look similar; large-scale retrieval claims need a representative corpus.

---

## 23. Interview trigger → answer

| Interviewer asks | Mental trigger |
|---|---|
| Functional vs non-functional? | What it does vs how well/under what constraints |
| Why not post-filter? | Wastes top-k and hurts recall |
| Why two checks? | Fast pre-filter + authoritative post-check |
| ACL changes? | Query-time enforcement |
| Deletion missed? | Tombstone + reconciliation |
| Why hybrid? | Semantic + exact match |
| Why rerank after auth? | Rank only authorised pool |
| Prompt injection? | Retrieved text is data |
| Hallucination? | Evidence + citation + abstain |
| Scale? | Peak QPS + refresh |
| No leaks? | Fail closed + leak suite |
| 100 ms? | Remove generation from hot path |
| Cost? | Route + bound + selective rerank + cache |

---

## 24. 60-minute delivery

| Time | Focus |
|---|---|
| 0–2 min | Problem + permission constraint |
| 2–5 min | Clarifying questions + requirements |
| 5–10 min | Architecture |
| 10–20 min | Permission model |
| 20–30 min | Retrieval + reranking |
| 30–40 min | Generation + citations + security |
| 40–50 min | Scale + latency + cost + reliability |
| 50–60 min | Evaluation + incidents + close |

### Final mental model

> **Permission first. Retrieval second. Generation third.**

The flow:

**Identity → Authorisation → Pre-filter → Hybrid retrieval → Policy check → Rerank → Evidence → LLM → Verify → Answer/Abstain/Escalate.**

The release rule:

> **Leak count must be zero.**
