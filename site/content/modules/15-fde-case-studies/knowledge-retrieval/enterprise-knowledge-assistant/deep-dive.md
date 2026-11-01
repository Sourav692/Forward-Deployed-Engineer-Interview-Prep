# Enterprise Knowledge Assistant: Deep Dive

Technical backup for the Main Interview Guide: the details you need when the interviewer goes deeper.

**Model and agent roles:** The query planner may split a multi-hop question, while the LLM gateway generates from the final authorised evidence set. The assistant is primarily a RAG workflow; ACL/ABAC enforcement and citation verification remain deterministic.

## 1. ACL normalisation

Different systems use direct grants, groups, nested groups, inheritance, item overrides, classifications and time windows.

Normalise to an internal representation containing:

- tenant
- document ID
- source/version
- owner
- principals/groups
- attributes
- classification
- validity window
- tombstone
- updated-at
- ACL version
- index version

**Do not:** default missing ACLs to internal, use embeddings as authorisation, or let the LLM decide access.

---

## 2. Two authorisation layers

### Pre-filter

Search only the user's authorised candidate space.

Benefits: recall, top-k utilisation, latency.

### Post-check

Revalidate final evidence before generation.

Catches: live revocation, stale ACLs, time embargoes, need-to-know, redaction obligations and changes between retrieval and generation.

Say it like this:

> “I don't want unauthorised content retrieved and discarded. I want it excluded from the search competition and then checked again before generation.”

---

## 3. ABAC

A policy can combine:

~~~text
tenant match
AND required clearance
AND group membership
AND customer/account relationship
AND time window
~~~

The policy engine remains deterministic and auditable.

---

## 4. Source-specific risks

**Drive:** inherited permissions (a limited-access folder blocks inheritance), personal files, external sharing, missed deletes.

**SharePoint:** broken inheritance, stale library permissions, item-level overrides.

**Slack:** private channels, DMs, high churn, pasted secrets, malicious instructions.

**Wiki:** stale policies, page restrictions, attachments/tables, prompt injection.

**Tickets:** customer-specific visibility, PII, project/queue rules, exact ticket identifiers.

---

## 5. Ingestion correctness

Recommended flow:

~~~text
source event
→ queue
→ fetch authoritative record
→ normalise
→ ACL normalisation
→ chunk
→ embed
→ index
~~~

Deletion:

~~~text
delete event
→ tombstone
→ remove from retrieval
→ invalidate affected caches
→ reconciliation
~~~

Use idempotency around source + document + version.

Reconciliation detects missing documents, stale versions, stale ACLs, missed deletes and broken checkpoints.

---

## 6. Freshness vs authorisation

Ask two different questions:

1. **Can the user access this?**
2. **Is this indexed copy still valid?**

A document can have correct permissions but be obsolete or deleted.

Use source-specific freshness SLOs and explicit behaviour when they are exceeded.

---

## 7. Retrieval details

Dense retrieval is good for meaning and paraphrases.

BM25/lexical retrieval is good for exact identifiers such as ticket IDs, policy IDs, error codes and SKUs.

RRF combines rankings without requiring scores to be directly comparable.

Tune retrieval on representative queries. No single dense/lexical setting is best for every query type.

---

## 8. Reranking

Reranking adds quality and latency.

Correct flow:

**authorised retrieval → candidate pool → reranker → final evidence**

Use selective reranking when:

- candidates are ambiguous
- quality gain is measurable
- latency budget permits it

Reduce it when:

- cache hits
- one high-confidence source is enough
- candidate pool is already strong
- latency is tight

---

## 9. Evidence selection

Do not pass top-k straight to the model.

Consider:

- relevance
- diversity
- source authority
- freshness
- authorisation
- contradictions
- token budget

If authoritative policy conflicts with an old wiki, use the declared authority rule and surface material conflicts instead of silently blending them.

---

## 10. Citation verification

A citation must:

1. belong to authorised evidence
2. support the claim
3. point to the intended granularity
4. not reference deleted/revoked content

A fluent answer can still fail citation correctness.

---

## 11. Abstention

Abstain when:

- no authorised evidence exists
- evidence conflicts materially
- freshness is outside SLO
- authorisation cannot be verified
- retrieval confidence is insufficient
- risk requires human review

Do not reveal that a forbidden document exists to explain an abstention.

---

## 12. Prompt injection and tools

Retrieved content is untrusted data.

Use:

- instruction/data separation
- deterministic authorisation
- tool gateway
- allowlists
- schema validation
- output checks
- human approval for risky writes

For write tools:

**LLM proposes → policy gateway authorises → schema/idempotency checks → approval if needed → tool executes.**

---

## 13. Evaluation dataset

Include:

- positive authorised questions
- questions whose answers exist but are unauthorised
- revocation cases
- deletion cases
- conflicting-source cases
- prompt-injection cases
- cross-tenant cases

Security tests often have an expected result of zero.

---

## 14. Leak suite

Build a persona × document visibility matrix.

Test:

- unauthorised retrieval
- unauthorised citation
- result-count leakage
- cache leakage
- citation leakage
- trace/audit leakage
- cross-tenant access

**One unauthorised exposure blocks release.**

---

## 15. Observability

Useful trace fields:

- request ID
- tenant and identity reference
- policy version
- ACL/index version
- retrieved IDs
- final evidence IDs
- citations
- model/prompt version
- stage latency
- token/cost
- output policy

Store the minimum sensitive content needed for replay and govern access to the trace store.

---

## 16. Scale reasoning

100k employees primarily create identity/ACL cardinality, not 100k concurrent requests.

50M chunks make refresh, deletes, ACL changes, re-embedding and reconciliation important.

At 100 QPS and three seconds of generation:

**100 × 3 ≈ 300 concurrent generations.**

That is why average QPS can hide serving problems.

---

## 17. Cache safety

Dangerous:

**query → answer**

Safer:

**tenant + permission signature + index version + query**

Also consider model/prompt version.

Invalidate on ACL changes, deletes, source updates and policy/index changes.

---

## 18. 100 ms design

Generation cannot remain on the hot path.

Use:

- cached embeddings
- cached authorised retrieval
- verified semantic answer cache
- selective reranking
- precomputation
- streaming

The product becomes a permission-aware search/cached-answer system.

---

## 19. Cost design

Cost drivers:

- embeddings
- index/storage
- retrieval
- reranking
- input tokens
- output tokens
- model choice

Levers:

**measure → route → bound → compress → selective rerank → cache**

For legal/high-risk RAG, keep mandatory citations and escalation while routing simple lookups to cheaper models.

---

## 20. Failure playbook

### Stale index
Detect with freshness/reconciliation metrics. Contain by labelling stale content; refuse only when permission data is stale. Prevent with events, tombstones and reconciliation.

### Prompt injection
Treat retrieved text as data. Block unsafe tool calls at the gateway.

### Vector drift
Version the index, run offline eval, stage cutover and keep rollback.

### Retrieval slowdown
Use ACL pre-filtering, partitioning, bounded top-k, warm caches and stage-level latency monitoring.

### Reranker slowdown
Reduce candidate count, use a cheaper model or route only ambiguous queries.

### Long context
Tighten the evidence set and compress.

---

## 21. Project-story lessons

Lessons to discuss if asked about mistakes:

- test data can be mislabelled and create false leak signals
- a stricter policy can mask another untested policy
- model-based security decisions can be nondeterministic
- copied search state does not automatically inherit source governance
- small retrieval benchmarks can hide real-scale differences

Say what you verified and what you assumed.
