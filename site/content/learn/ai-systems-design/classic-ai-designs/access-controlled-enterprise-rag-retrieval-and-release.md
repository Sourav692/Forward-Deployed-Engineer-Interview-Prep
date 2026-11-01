# Access-Controlled Enterprise RAG: Retrieval and Release

## Retrieve Hybrid, Then Rerank After Enforcement

For Meridian, compare hybrid retrieval with simpler baselines on the permitted corpus. The customer problem is unchanged: useful evidence must also be authorised. Enterprise text is full of error codes, SKUs and ticket IDs. Embeddings blur `MRD-5031` and `MRD-4290` because they look alike, while BM25 treats them as rare tokens and finds the exact one. On a paraphrase such as "telemetry disappears before it's saved", the opposite happens: dense finds the durability passage and BM25 is fooled by common words. Dense finds what means the same; lexical finds what says the same.

Fuse the two with Reciprocal Rank Fusion. A cosine score of 0.82 and a BM25 score of 14.3 are not comparable, but ranks always are. Each document scores the sum of 1 / (k + rank) across lists, with k ≈ 60. A document second in both lists beats one first in only one.

| Technique | Fixes | Cost |
|---|---|---|
| Multi-query (with RRF, RAG-Fusion) | The user's wording differs from the corpus | N× retrieval, 1 LLM call |
| HyDE | Questions and answers are written differently | 1 LLM call plus latency |
| Decomposition | Multi-hop questions no single chunk answers | 1 LLM call, only when needed |
| Reranking | Recall-optimised retrieval is imprecise | Evaluate quality gain against latency |

HyDE deliberately hallucinates a plausible answer and searches with its embedding, because a fake answer looks more like a real answer than a question does. The fake answer is only a search probe and is never shown. Reranking compares the query and candidates more closely. It can improve precision, but the gain must be evaluated on this corpus. Over-retrieve about 20, rerank to 6. A bi-encoder embeds question and document separately; a cross-encoder sees them together.

Order matters here too. Reranking runs after ACL enforcement, so a restricted user's top 6 is the best of their own authorised pool. Post-filtering after reranking would rank documents they cannot see and hand them an empty context.

## Gate Releases on Zero Leaks

Raise the cross-cutting concerns unprompted. For multi-tenancy, keep a collection per tenant plus a row-level filter. Derive tenant identity from the verified session and enforce it at the data layer. Never trust a tenant ID supplied by the model or request body. Per-tenant rate limits and token budgets handle noisy neighbours.

For security, authenticate through the customer's IdP and map authorisation to the source systems' own groups. Treat retrieved documents and tool outputs as untrusted input that can never alter the system prompt or unlock capability. Keep least-privilege connector credentials in a secrets manager, never in prompts. Attach PII redaction as an obligation to an allow, and keep a full audit trail.

Every run is a replayable record: prompt version, retrieved chunk IDs, policy decisions, tool calls, tokens, latency, cost and groundedness. That one artefact serves three audiences. The engineer debugs a bad answer. The auditor asks whether a user ever saw a document. Finance asks which tenant is burning the budget.

Evaluation has three families. Retrieval uses recall@k and MRR. Generation uses groundedness and refusal accuracy. Security requires zero observed leaks in the release suite. Passing finite tests is a release condition, not proof that no leak is possible. A retrieval regression is a bug fixed next sprint; a leak is an incident. So the security suite, which asks the same question as different personas, blocks the release outright.

The reference build found an evaluation bug worth telling. Its first labels conflated "the user must not see this" with "this is the wrong document". A keyword strategy retrieved a contract the account manager was entitled to read, and the harness reported a leak. A false security alarm trains people to ignore alarms. The fix split labels into `forbidden_docs`, which gate the release, and `distractor_docs`, a precision metric. A test now asserts every forbidden entry is genuinely policy-denied.

## Degrade Everywhere Except Authorisation

| Fails | Behaviour |
|---|---|
| Model provider down | Fail over to a secondary or smaller model; queue and back off |
| Vector store down | Use permission-enforced keyword search; otherwise refuse. Mark degraded answers |
| Connector stale | Answer with a staleness label; refuse only when permission data is stale |
| Reranker unavailable | Fall back to fusion order; the trace records it |
| Low retrieval confidence | Refuse and escalate to a human |
| Policy engine unavailable | Fail closed. Refuse. Never fail open on authorisation |

Say the last row slowly. Then name what breaks first at 10×. BM25 over the authorised pool breaks first, because the reference build rebuilds the lexical index per request over the permitted subset. A production option is a lexical store with document-level security, such as OpenSearch DLS, or a scoped shard whose access and invalidation rules are verified. Re-embedding cost falls with a content-hash cache. ACL updates should be decoupled from content reindexing, because ACL sync is cheap and re-embedding is not. LLM calls dominate latency, so cache, parallelise fan-out and stream tokens.

## Close With the Thesis and Week One

Summarise in three sentences. Access control is pushed into retrieval as a compiled pre-filter, backed by an authoritative post-retrieval re-check. Hybrid retrieval is fused with RRF and reranked, so users get the best of what they may see. Every run is traced, and every release is gated on a zero-leak suite.

| Decision | Chose | Would revisit if |
|---|---|---|
| Pre-filter over post-filter | Pre-filter plus tenant partitioning | ACLs changed too fast for the index; then a per-request authorisation service |
| LLM reranker | LLM: explainable, no model hosting | Latency or cost at scale; then a cross-encoder behind the same interface |
| Hybrid plus multi-query by default | Yes | The extra latency did not pay for itself on this corpus |

End with the forward-deployed close. Week one at a customer is not this diagram. Connect one source, get the ACL translation provably right for three personas, build the golden set with their SMEs, and stand up the leak test. That proves the risky part before anyone argues about embeddings.

Bring questions for the interviewer's company. How do they translate permissions across customer source systems today? Where is the line between platform-generic and customer-specific work? What do the first two weeks of an engagement look like, and how is quality evaluated once the customer owns it? With a laptop, show the visibility matrix: 22 documents × 9 personas, each cell decided by a named rule, with no LLM cost. One principal sees nothing despite every group and the highest clearance.

## Worked Example: One Question, Three Personas

> **Added production guidance:** the clarification, payload, and response choices below illustrate the source's policy boundary. They are not a live execution.

### Clarify the Question and Identity

Ask: "Which Vertex incident and date? Do you need the technical explanation, credit policy, or both?" Resolve identity and groups from the verified session. A claimed job title in chat does not grant access.

### Follow the Persona

The Tier-1 agent asks about Vertex. The pre-filter limits search to tenant, clearance and groups, so post-mortems and contracts are never scored. The post-check confirms what came back, and reranking picks the best of the help docs and backlog tickets. The answer is the platform backlog, and credits go to the account manager.

The account manager asks the same question. Their attributes admit contracts but not engineering post-mortems, so they get the credit tiers and no root cause. The external contractor's external flag denies commercial sources, and default deny covers the rest, so they get nothing. The refusal never hints that withheld material exists.

Same index, same question, three correct answers. That is the requirement table from the first minutes, now produced by the two layers rather than by a prompt.

| Line that carries the round | When to use it |
|---|---|
| Access control decides the shape of the retrieval path | Opening framing |
| The filter makes retrieval cheap; the post-check makes it correct | The two-layer deep dive |
| The LLM is never the enforcement point | Prompt-injection follow-ups |
| Rerank after enforcement | Retrieval-quality deep dive |
| Dense finds what means the same; lexical finds what says the same | Why hybrid |
| A regression is a bug; a leak is an incident | Evaluation |
| Fail closed on authorisation; degrade on everything else | Failure modes |
| Refuse well, and never hint that withheld material exists | Refusals |

### Trace the Evidence Boundary

```json
{
  "question": "Why did Vertex lose data in March?",
  "trusted_scope": {"tenant": "meridian", "persona": "tier-1"},
  "permitted_evidence": ["help-backlog-01", "ticket-summary-02"],
  "policy_check": "allow_with_obligations",
  "response": {"explanation": "platform backlog", "credits": "refer to account manager"}
}
```

The policy layer supplies the permitted evidence set; the model cannot widen it. Verify every citation against that set and its supporting text.

### Handle Missing Evidence Without Guessing

If the policy service fails, refuse before generation. If permitted evidence is insufficient, say so and escalate. A denied persona receives no details about withheld documents. No branch issues a service credit.

### Explain the Design in 60 Seconds

> "I'd start with who needs different answers to the same question. For Meridian, support, engineering, and account teams have different access, and other tenants must see nothing. I'd translate source permissions during ingestion and quarantine unusable access metadata.
>
> Each query would derive trusted identity, search within the tenant and permission filter, then recheck current policy before evidence reaches a reranker or model. Hybrid retrieval would balance exact identifiers and paraphrases. I'd verify citations and refuse when permitted evidence is insufficient. Security tests would block release on any observed leak, with distractors labelled separately. I'd trace each run and degrade search quality only when authorisation still holds."

## Key Takeaways

- Frame the round on different correct answers per persona, and scope read-only Q&A explicitly.
- A concrete case and persona table become the requirement every decision is justified against.
- Ingestion translates and validates source ACLs; the query graph puts authorise first and enforce before the model.
- Partition by tenant and pre-filter within it; use ABAC with deny-overrides and default deny.
- A cheap pre-filter plus an authoritative post-check gives live revocation and a staleness signal; the LLM never enforces.
- Retrieve hybrid, fuse with RRF and rerank after enforcement.
- The security suite gates the release on zero leaks; label forbidden and distractor documents separately.
- Degrade gracefully on every dependency except the policy engine, which fails closed.
- Close on the thesis, three revisitable trade-offs and a week-one plan that proves the permission model first.

## Check Yourself

<details>
<summary>1. Why is post-filtering wrong even if it never shows a forbidden document?</summary>

It shrinks the user's top results, crowding them out with material they cannot see, and result counts can leak information if shown. Pre-filtering narrows the candidate set; authoritative checks still run before model context is built.

</details>

<details>
<summary>2. What does the post-check catch that the pre-filter cannot?</summary>

Embargo dates evaluated against "now", need-to-know list semantics, live revocation on a stale index, and redaction obligations.

</details>

<details>
<summary>3. Why must the security suite block the release instead of lowering a score?</summary>

A retrieval regression is a bug for next sprint, but a leak is an incident. The release suite must observe zero leaks; that is not a universal security proof.

</details>

<details>
<summary>4. Does the assistant issue the service credit it describes?</summary>

No. This case is read-only; the account manager owns the commercial decision.

</details>

<details>
<summary>5. Who establishes the tenant and groups?</summary>

Trusted identity and policy services, not a claimed role or tenant ID in the question.

</details>

<details>
<summary>6. Can a keyword fallback bypass the policy engine?</summary>

No. Every fallback needs equivalent authorisation. Otherwise refuse.

</details>

<details>
<summary>7. What does zero observed leaks establish?</summary>

That the release suite passed its security condition. It does not prove every possible disclosure is prevented.

</details>

<details>
<summary>8. Why keep hypothetical retrieval text separate from evidence?</summary>

HyDE text is a search probe, not a source. Only permitted supporting documents may ground the answer.

</details>

