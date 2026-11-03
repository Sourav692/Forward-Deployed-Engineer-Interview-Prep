# Enterprise Knowledge Assistant with Permission-Aware RAG, part 3

## 10. Gate the Release on a Leak Count, Not a Score

A retrieval regression is a bug to fix next sprint. A leak is an incident. So a failed security suite blocks the release outright instead of lowering a score. It runs the same question as different personas and asserts that restricted material never appears.

| Metric                          |                                                    Good threshold |                          Bad threshold | Test dataset                                                                         | Owner             |
| ------------------------------- | ----------------------------------------------------------------: | -------------------------------------: | ------------------------------------------------------------------------------------ | ----------------- |
| Permission leakage              |                                                                 0 | > 0, any case triggers rollback review | ACL red-team suite across roles, tenants, regions, stale groups, mid-session changes | Security          |
| Grounded answer rate            |             ≥ 90% supported claims, no sustained drop over 5 pts |                 > 5 pts below baseline | Silent-mode labelled set plus sampled traffic, SME review                             | ML / eval         |
| Citation precision and recall   |                           ≥ 95% correct citations, ≥ agreed bar |                        > 5 pts decline | Source-span audit of a sampled set                                                   | Evaluation        |
| Freshness lag                   |                                  Within the SLO per content class |                            Exceeds SLO | Connector telemetry vs index timestamps                                              | Ingestion         |
| Retrieval recall                |                          Measured per query type, used to tune α |           Regression on any query type | Representative query set segmented by type                                           | ML / eval         |
| Escalation quality              |                      ≥ 95% correct escalation on high-risk cases |                  Missed high-risk case | Risk-labelled scenarios                                                               | Product / support |
| Task completion                 |      ≥ 80% of target workflows completed with less manual effort |                         Below baseline | Workflow replay tests                                                                | Product           |
| p95 latency and cost per answer | p95 within target at 100 QPS peak; cost per workflow below budget |                         Breach at peak | Load test plus production telemetry                                                  | Platform          |

Red-team the boundary directly with five attack families:

- the same question from users with different groups, regions, entitlements and mid-session membership changes
- indirect injection planted in a ticket, wiki page or pasted note
- exfiltration attempts that summarise confidential corpora, coax hidden metadata or extract system prompts and tool schemas
- citation fabrication, where the model cites a document absent from the retrieval set
- staleness attacks, where a deleted or superseded document still ranks well

**Eval bug:** labels mixed "not allowed" with "wrong document." A permitted contract tripped LEAK. False alarms train people to ignore the next real one. Split `forbidden_docs` (release gate) from `distractor_docs` (precision). Assert every forbidden doc is policy-denied.

**Trace (not the raw prompt):** prompt version, chunk IDs, policy decisions, tool calls, tokens, latency, cost, groundedness. One artefact for the engineer, the auditor, and finance. It already shows whether retrieval missed, permissions over-filtered, the model ignored evidence, or the template changed.

## 11. Roll Out One Corpus at a Time

Week one at a customer covers one connected source, the ACL translation provably right for three personas, a golden set built with their SMEs, and a standing leak test. That proves the risky part, the permission model, before anyone argues about embeddings. Everything else is incremental.

| Week  | Gate                                                                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0-1   | Name the workflow, the dangerous constraint, success metrics, source owners, approval rules and explicit non-goals                                                                         |
| 1-2   | One low-risk corpus, no write-back: validate ingestion, ACL normalisation, retrieval and citation formatting offline                                                                       |
| 2-3   | Golden dataset from historical questions and SME-approved answers; the access-leakage suite across roles, indirect phrasing, stale ACLs and deleted documents. Any exposure blocks release |
| 3-4   | Silent evaluation on real employee questions while users still get the legacy workflow; compare against human answers without showing output                                               |
| 5     | Read-only pilot for one segment with citations, confidence, abstention, feedback capture and an escalation path                                                                            |
| 6-8   | Expand source by source, each with its own freshness dashboard, reconciliation rules, owner and rollback trigger. Draft-only actions, if any, behind human approval                        |
| After | Widen only while leakage stays at zero and groundedness, freshness, latency and cost hold; rehearse the reconciliation drill; keep the rollback plan                                       |

The MVP is a smaller, sharper promise than "an AI assistant". It includes:

- one or two high-value connectors
- event ingestion plus periodic backfill
- extraction and chunking
- ACL normalisation
- keyword plus vector retrieval
- permission-aware filtering
- a basic reranker
- an LLM gateway with citations
- an output policy for abstain and redact
- trace capture with feedback

More sources, multimodal OCR, tenant-specific ranking, freshness policies by content class, drift regression tests and human review workflows come after the trust path works.

Close on the trade-offs and what would change them.

| Decision                             | Chose                                                                                                   | Would revisit if                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Pre-filter over post-filter          | pre-filter + tenant partitioning                                                                        | ACLs so dynamic the index cannot keep up, then a per-request authorisation service     |
| LLM reranker                         | LLM (explainable, no model hosting)                                                                     | latency or cost at scale, then a cross-encoder behind the same interface               |
| Hybrid + multi-query as default      | yes                                                                                                     | measurement showing the extra latency does not pay for itself on this corpus           |
| Real-time sync vs scheduled indexing | mixed: event-driven for high-churn sources, scheduled for stable ones, reconciliation for missed events | the customer's freshness tolerance turns out to be same-day, then scheduled everywhere |

## 12. Deliver It in Sixty Minutes

Spend minutes in proportion to risk, not diagram size. Authorisation and freshness deserve more of the hour than embeddings, and a candidate who spends twenty minutes on embeddings and one on permissions has optimised the wrong thing. Write the budget in the corner of the board.

| Minutes | Phase                                                             |
| ------- | ----------------------------------------------------------------- |
| 0–8    | Clarify and scope (section 1)                                     |
| 8–15   | Entities, the end-to-end diagram, both zoom-ins (sections 5 to 7) |
| 15–35  | Deep dive: access control, then retrieval (sections 7 and 8)      |
| 35–45  | Multi-tenancy, security, evaluation, observability (section 10)   |
| 45–55  | Failure modes (section 9) and back-of-envelope scale (section 3)  |
| 55–60  | Close: three sentences, trade-offs, week one (section 11)         |

Nouns before boxes: Tenant, Principal, Group, Compartment, Document, Chunk, ACL, Query, Run, Trace, Citation. Raise multi-tenancy, security, observability, and evaluation before they ask. Tenant ID comes from the verified session, never the request body, and is enforced in the data layer. Per-tenant rate limits and token budgets handle noisy neighbours.

The three-sentence close:

> *"Multi-source RAG where access control is pushed into the retrieval layer as a compiled pre-filter, backed by an authoritative post-retrieval policy re-check. Hybrid dense-plus-lexical retrieval fused with RRF and reranked, so the user gets the best of what they're allowed to see. Every run is traced, every release is gated on a zero-leak security suite."*

The two-minute spoken answer, for when the whole design has to fit in a summary:

> - I would start by asking whose workflow changes, what success means, and which constraint is most dangerous if ignored, and here that constraint is permission fidelity, not retrieval quality, because an assistant that answers well but leaks is worse than no assistant at all.
> - So I would restate the ask as a business outcome: employees resolve work questions from approved content across Drive, SharePoint, Slack, wikis, and tickets, with citations, and only from material they could already open.
> - Architecturally, ingestion is asynchronous: connectors into an event and backfill queue, parsing and chunking, then an ACL normaliser that maps every source's permission model into one internal representation, written to both a keyword and a vector index.
> - The query path is synchronous and ordered by risk: authenticate and resolve groups, rewrite only where meaning survives, retrieve with permission filters applied before candidates exist, rerank, trim to a context budget, generate through a gateway, verify every citation, and abstain when evidence is weak.
> - I would enforce ACLs at query time and precompute only where permissions are stable.
> - I would prove it with an access-leakage suite, groundedness and citation precision, freshness lag, and a deletion-reconciliation drill, rolling out from one low-risk corpus through silent evaluation to source-by-source expansion with rollback.
> - The goal is not a demo that answers well; it is a service the enterprise can trust, audit, and operate.

The lines that carry the round:

1. *"Access control decides the shape of the retrieval path, not the other way round."*
2. *"The filter makes retrieval cheap; the post-check makes it correct."*
3. *"The LLM is never the enforcement point. Unauthorised text never enters the context."*
4. *"Rerank after enforcement, so their top-6 is the best of their pool."*
5. *"Dense finds what means the same; lexical finds what says the same. Enterprise needs both."*
6. *"A retrieval regression is a bug. A leak is an incident. Only one of them blocks the release."*
7. *"Fail closed on authorisation. Degrade on everything else."*
8. *"Refusing well is a feature, and never hint that withheld material exists."*

The follow-ups arrive in a predictable order, and each has a prepared answer.

| Follow-up | Answer |
| --------- | ------ |
| How do you prove users never see a passage they cannot open? | Authorise before a passage can enter context or the response. Query-time effective permissions. A disallowed citation rejects or rewrites the response. Suite: known-denied docs, group changes, adversarial queries; retrieval, reranker, assembler, and citation renderer share one policy |
| Access today, gone tomorrow? | Pre-filter is a snapshot. Post-check re-resolves live, so revocation hits the next query after the IdP sync. Short permission cache, versioned identity, IdP change events. If signals lag, state the max stale window |
| Confident but wrong? | Citation check against the retrieval set, groundedness on a silent labelled set, abstain on weak evidence, trace which stage failed. Confidence follows evidence, not tone |
| Re-index after a chunking change? | Versioned migration: old and new side by side, new index version, offline eval, small traffic slice, leak tests again, rollback kept |
| LLM-powered enterprise search (OpenAI-style practice prompt) | This design. Open with section 1. Spend the time on permission layers and the leak gate |
| Unified search across SharePoint, Slack, Drive, Confluence, Salesforce, databases | Federated search inherits permissions but struggles to rank across sources and is only as fast as the slowest source. An index ranks across sources and must carry the ACL translation. Then this design |

| Weak line | Replace with |
| --------- | ------------ |
| "Vector search because it's modern" | Hybrid: exact terms plus paraphrase |
| "Permissions are handled by the database" | Storage ACL ≠ retrieval-time authorisation |
| "Store the whole prompt for debugging" | Structured traces, redacted |
| "Real-time sync everywhere" | Mixed, by freshness need |
| "More context will solve it" | Precision, cost, a tight candidate set |
| "If the model is confident it's right" | Confidence tied to evidence and citations |

Ask them something at the end:

- How is permission translation across customer source systems handled today?
- Where does the line sit between platform-generic and customer-specific in a deployment?
- What do the first two weeks of an engagement look like?
- How is agent quality evaluated once the customer owns the system?

With a laptop, the persona-by-document visibility matrix is the single most persuasive artefact. In the reference project it is 22 documents by 9 personas, every cell decided by a named policy rule. One principal sees nothing at all despite holding every group and the highest clearance.

```bash
python scripts/demo_access_control.py --matrix   # visibility matrix, no LLM cost, ~2 seconds
python scripts/evaluate.py --kinds security      # the zero-leak gate
```
