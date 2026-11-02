# Enterprise Knowledge Assistant with Permission-Aware RAG

*Answer from everything an employee may see and nothing they may not, without the permission check making retrieval too slow to use.*

The hard part of this system is that a Tier-1 agent, a Tier-3 engineer and an account manager must get different correct answers to the same question. Finding the right passage comes second. So the design starts from access control and works on retrieval quality inside it. This page combines the group's prompts into one read for the day before. Every other case in the group is a delta on it.

| Case in the group                                                | What it contributes here                                                   |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Enterprise Knowledge Assistant with RAG (anchor)             | Sections 1 to 11: the design, requirements, sizing, evaluation and rollout |
| Whiteboard script, Enterprise RAG with Access Control         | Sections 5 to 9 and 12: the sixty-minute delivery                          |
| Internal Knowledge Assistant for Enterprise Support          | The support-agent persona in sections 1 and 11                             |
| Two OpenAI-style practice prompts                        | The two follow-ups in section 12                                           |
| Meridian Assist running case                                 | Section 13                                                                 |
| Legal RAG under strict cost limits and sub-100 ms search | Section 14                                                                 |
| Reported prompt, LLM-powered enterprise search               | Section 12, follow-up table                                                |
| Incident write-ups and four latency and scale scenarios                  | Section 15                                                                 |

---

## 1. Name Permission Fidelity as the Constraint Before Drawing Anything

Open with the outcome and the risk before any architecture. An assistant that answers well but leaks is worse than no assistant, so permission fidelity is the load-bearing constraint and retrieval quality is the second problem. Say it in the first two minutes: the interviewer uses your opening to decide where the hour goes.

> *"Anyone can build multi-source RAG. The thing that makes this hard is that a Tier-1 agent, a Tier-3 engineer and an account manager must get different correct answers to the same question, so access control isn't a feature I add at the end, it decides the shape of the retrieval path. I'll design around that."*

For a less technical room, use the technology-agnostic version from the tutorial:

> *"We need an internal knowledge assistant for employees across departments. The assistant should answer questions using approved content from Drive, SharePoint, Slack, wikis, and support tickets, but only from material the requesting user is allowed to see. The success metric is grounded answers with citations, low hallucination risk, and freshness that matches source updates. I'd start by clarifying authority sources, permission inheritance, freshness expectations, and what the business wants to happen when the system is unsure or the sources conflict."*

| Answer  | What it does                                                                                                                               | What it misses                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Weak    | Sources → vector DB → LLM on top-k                                                                                                       | Permissions, deletions, citations, diagnosis                 |
| Average | Adds hybrid search, rerank, citations, a permission filter                                                                                 | Before vs after retrieval; fail-open vs fail-closed          |
| Strong  | ACL + version + tombstone at ingest; filter before the model; rerank; verify citations; abstain; query-time ACL, precompute only if stable | Proved with a leak suite, groundedness, and a deletion drill |

Ask the questions that change a component. Write the answers where they stay visible.

| Question to ask                                                                                                                     | What the answer decides                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Which source is authoritative for each content type, and what happens when Drive, SharePoint, Slack, the wiki and tickets disagree? | Conflict policy: prefer approved current sources, surface the conflict, never silently pick one         |
| Must permissions be inherited live, or is periodic sync acceptable?                                                                 | Where ACL checks live. Live means query-time enforcement; periodic means a bounded, stated stale window |
| Synthesise across sources, or answer only from retrieved passages? Citations to the passage or the document?                        | Context-budget design and the citation builder's granularity                                            |
| How fresh must policies, tickets and project updates be, and how fast must a deletion or revoked permission leave retrieval?        | Freshness SLO per content class; event-plus-backfill ingestion; reconciliation cadence                  |
| Who is the primary user, who diagnoses a wrong answer, who owns the risk if it over-shares?                                         | The trace store's audience and the escalation path                                                      |
| p95 latency target, residency, retention, cost limits?                                                                              | Stage-by-stage latency budget; region pinning; what the trace may store                                 |
| Who may view audit logs and answer traces, and what must they contain to reconstruct an answer?                                     | Trace schema: source event IDs, index and ACL version stamps, request ID, exact citation set            |
| Fallback when retrieval fails or sources conflict: refuse, label staleness, or escalate?                                            | The output policy engine's three modes                                                                  |

Each stakeholder notices a different failure first. Optimise only for the employee and security cannot defend it; optimise only for control and nobody uses it.

| User                | Workflow                                                                  | Failure they notice first                             | What the assistant gives them                                                                       | Approval needed                                            |
| ------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| End user (employee) | Asks a work question in chat, expects a cited answer and a next step      | Wrong or missing answer                               | Grounded answer with passage citations, abstention on weak evidence, a "missing source" button      | None for read-only Q&A; any write-back is out of MVP scope |
| Operator / support  | Triages "the assistant was wrong" reports, tunes connectors and retrieval | No trace of why the system failed                     | Replayable structured traces, a freshness dashboard per source, the reconciliation drill            | Decides when to widen sources after gates pass             |
| Security owner      | Approves sources, reviews leakage results, reads audit logs               | An answer exposes content the user should not see     | Leakage suite as a release gate, the ACL normaliser, immutable audit of retrieval set and citations | Any exposure blocks release; signs off each new source     |
| Executive sponsor   | Tracks adoption and cost-to-value                                         | A tool that looks impressive but does not reduce work | Grounded-answer rate, task completion, cost per answer, source-by-source expansion                  | Approves rollout stages and budget                         |

**Support persona (same architecture):** agent asks a customer/problem question → cited answer from policy, product docs, past tickets → next step, optional draft ticket note. Reads run automatically. Any write-back is previewed and human-approved. Extra sources: Zendesk, Salesforce Service Cloud, Jira.

**Scope before the first box:** read-only Q&A, five source systems (Drive, SharePoint, Slack, wikis, tickets), ABAC, multi-tenant, sub-3 s. Writes and streaming ingest are out. If they give no assumptions, state yours: permissions at query time; citations point at the passage, not the title.

## 2. State Requirements as Testable Constraints

A requirement that cannot fail a test is a preference. "Make it fast" is a preference; "p95 under 3 s" is a constraint. Split with MoSCoW: Must is the launch gate. If the interviewer forces a tradeoff, protect Must first.

| Priority | Functional requirement                                                      | Accepted when                                                       |
| -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Must     | Incremental ingest of Drive, SharePoint, Slack, wikis, tickets              | A source change never requires a full reindex                       |
| Must     | Preserve versions and ACL metadata                                          | Retrieval can answer "what was visible to this user at this time?"  |
| Must     | Resolve effective permissions at query time; filter before the model        | Unauthorised chunks never enter the context window                  |
| Must     | Grounded answers with passage-level citations                               | Every citation is in the permitted retrieval set                    |
| Must     | Abstain on weak evidence                                                    | A correct refusal beats a confident hallucination                   |
| Should   | Hybrid retrieval and reranking                                              | Policy IDs, error codes and ticket numbers match lexically          |
| Should   | Show confidence, missing evidence and escalation reason                     | Uncertain or high-risk answers are labelled, not guessed             |
| Should   | Safe feedback for evaluation                                                | No raw-prompt dump; no training on customer data without governance |
| Should   | Admin controls: sources, freshness, policy, blocked actions, audit export   | An operator can change those without a code release                 |
| Could    | Richer analytics, more sources, tenant ranking, OCR, human-review workflows | Out of MVP; must not distort the first architecture                 |

**Won't (MVP):** write-back to tickets or docs; personal files; unapproved web; cross-tenant search; memory beyond a session. A later write tool is allowlisted, previewed, idempotent and human-approved.

**Non-functional (operating constraints):**

| Constraint   | Testable form                                                                                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Latency      | p95, never "fast enough". In this design, target p95 of 3–8 s; under 3 s if it must feel like chat; longer work goes async. Slice identity → ACL → retrieval → rerank → generate; each stage times out and degrades, never fails open |
| Availability | Connector, index or model down: partial coverage, labelled staleness, or refuse; never a silent guess                                                                                                |
| Cost         | Embedding, index and tokens estimated separately. Cost per answer. Cache stable docs; prune retrieval; small models for classification; expensive reasoning only where risk justifies it              |
| Security     | SSO via the IdP; ABAC over source ACLs; filter before the model; revocations fan out to indexes and caches; secrets never in prompts; no training on customer data unless the contract allows it      |
| Audit        | Immutable: source event IDs, index/ACL versions, request ID, retrieved docs, policy decision, model/prompt version, exact citation set shown                                                          |
| Reliability  | Fail closed on permissions, stale permission data and the citation check. Label stale content, including a suspected missed deletion, and suppress it once the deletion is confirmed. Degrade on retrieval quality. Queue background reindex                                         |

Every Must has an owner:

| Requirement                     | Component                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------- |
| Incremental ingest              | Connectors, change-event processor, ingestion queue with backfill               |
| Version and ACL preservation    | Metadata store, ACL normaliser, permission-aware index, audit log               |
| Hybrid retrieval and reranking  | Keyword index, vector index, fusion, reranker                                   |
| Grounded answers with citations | LLM gateway, evidence selector, citation builder and verifier                   |
| No cross-user disclosure        | Identity mapping, authorisation filter, policy enforcement point, output policy |
| p95 latency                     | Query service, caches, rerank budget, model timeout                             |
| Deletion freshness SLO          | Connector sync, tombstones, reconciliation job, reindex                         |
| Graceful degradation            | Circuit breakers, fallbacks, partial-answer policy                              |

## 3. Size on Peak QPS and Permission Refresh

These are round numbers, not a capacity plan. Each one rules out a naive design.

| Quantity     | Figure     | What it forces                                                                                                                                |
| ------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Employees    | 100k       | Identity and ACL cardinality, not 100k concurrent. Post-filter does not scale when almost every query has a different permission set          |
| Corpus       | 50M chunks | The first embed job is doable. Refresh is the hard part: a permission change or deletion must update indexes and caches without a 50M rebuild |
| Average load | 20 QPS     | Untuned sync retrieve → rerank → generate looks fine                                                                                        |
| Peak load    | 100 QPS    | 5× the work on the same path. Rerank and generate dominate. They queue, p95 blows the 3 s budget, or you drop                                |

Say these five in the room:

1. Size on peak QPS and refresh, not "we indexed once."
2. Slice the latency budget: identity/ACL (cheap) vs retrieve vs rerank vs generate (expensive). Timeouts degrade; they never fail open.
3. Cache by tenant + permission signature + index version, so repeats skip rerank and generate.
4. Pre-filter inside search. Never retrieve forbidden chunks and throw them away.
5. Ingestion is async; query is sync. Event + backfill + reconciliation is how 50M stays permission-correct.

Rough check: 100 QPS × 3 s generate ≈ 300 in-flight generations, a serving problem that 20 QPS hides.
