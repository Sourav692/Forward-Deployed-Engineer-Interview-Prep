# AI Customer-Support Automation as a Routed Decision Pipeline, part 5

## 13. Add the Implementation Detail From the Study-Guide Mocks

Six study-guide tutorials end with a mock design of this same system in a framework's vocabulary. None changes the design; each adds one implementation detail worth having ready when the interviewer asks "how exactly".

**Multilingual ticket triage (LangChain foundations, #95).** The pipeline is detect language, classify intent, route, draft and translate back, composed so batching, streaming and retries come free. Routing uses a branch with named intents and a required default arm, so an unrecognised classification never falls through silently. The p95 under 3 s budget splits into an example allocation of about 200 ms language detection, 300 ms classification, 1.5 s draft generation streamed, and 500 ms back-translation, 2.5 s in total. Retries are bounded on every LLM-calling step and the classifier has a fallback provider, because the classifier is the step that must never hard-fail a ticket into limbo.

**Human-gated ticket agent (LangGraph fundamentals, #96).** Structured-output classification returns `{category, risk_level}`, and the interrupt lives inside the refund or deletion tool itself, not before the whole turn, so read-only lookups never pause and only the irreversible action does. The checkpointer is durable Postgres keyed on the ticket ID, so a pod restart resumes mid-approval. The refund side effect is keyed on `ticket_id + action_type` and checked before executing. Order history, account status and prior tickets fan out concurrently and cancel together if one fails. The self-correction loop caps at 3 iterations, then escalates. Below a confidence threshold the ticket goes to human review by default.

**Agentic RAG support assistant (RAG and retrieval, #97).** Product docs and runbooks are two separate indices, each with BM25 alongside vectors so an exact error code still surfaces. A cheap semantic router decides which to query without an LLM call. Retrieve 20 per source concurrently and rerank the merged set to 5 only when the top scores are close. A hard 400 ms budget on the retrieval stage falls back to whichever source returned in time. The generation prompt cites which source each claim came from and says "I don't have that in my docs" below a relevance threshold. A weekly recall@k check on a labeled set built from real tickets gates any retrieval change.

**Support search over a fragmented, growing knowledge base (advanced RAG, #99).** Three sources, a 5,000-article wiki, ticket history with exact error codes and release notes with version numbers, growing 50 a day, under a 1.5 s p95. Hybrid search per source with α tuned separately, because tickets skew token-heavy and wiki articles skew semantic. CRAG-style grading rather than Self-RAG, because the failure mode is coverage gaps for new error codes, not hallucination, and the below-threshold path logs for a human rather than searching the public web. A cross-encoder reranks the fused top 20, since an LLM judge over 20 candidates would likely eat most of the budget. Each source appends incrementally with a `source` metadata field, no nightly reindex, and the live fallback rate is the coverage-gap signal.

**Travel-booking support agent (agents, #101).** A supervisor routes to three specialists: `booking_lookup` read-only, `policy_qa` RAG with no side-effect tools, and `change_or_cancel` as the only agent with write access, so every routing decision is logged in one place. The refund amount is computed as pure logic, not by the model, and over $200 raises an interrupt before the refund tool, whose call is idempotent on booking ID plus request ID. Thread state lives in a durable checkpointer, one thread per conversation; cross-session customer memory lives in a separate store read once at thread start. A hard cap of 15 steps and a per-conversation cost ceiling force a resolution or a handoff. Retry policy applies to the booking API, not to LLM calls; a malformed tool call re-plans through the supervisor. "What's your baggage allowance" never enters the agent at all; it is a direct lookup wired as a workflow.

**Support agent over a growing knowledge base (parent-document retrieval, #102).** Child chunks of about 400 characters match support phrasing closely; parents of about 2,000 characters bound the worst-case prompt (LangChain's example sizes; tune on your data). Vectors and the docstore share one Postgres, with an HNSW index once exact scans start to eat the latency budget, and the daily 20-article job writes idempotently keyed on `hash(article-id + last-modified)`. The p95 under 2 s budget is a budget of about 100 to 150 ms query embedding, 50 to 100 ms search at 50k vectors (generous; HNSW is often a few ms at that size), 20 to 50 ms docstore fetch, and 1.5 s streamed generation. Cap `k` at 3 or 4 and return "I don't have a confident answer" below the similarity threshold.

## 14. Answer the Cost Pivot in Ten Minutes

The interviewer's pivot after a good design is "volume is growing and monthly LLM spend is rising faster than ticket deflection". Answer it right after the design, on the same architecture, and reduce cost by workflow rather than across the board.

|                       |                                                                                                                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ask                   | Which intents dominate traffic? What share are repeated FAQs? What is the target cost per resolved issue? Can answers be cached? Which answers need live account data?                                                        |
| Dominant driver       | Model spend on repeated FAQ traffic that needs no LLM                                                                                                                                                                         |
| Weak move             | Keep the same model and hope browser-layer caching helps                                                                                                                                                                      |
| Strong move           | Intent router in front; cached safe FAQ answers behind a permission-aware semantic cache; small model for classification; RAG for knowledge answers; tool calls only for account-specific requests; concise response defaults |
| Path                  | gateway → intent classifier → FAQ semantic cache → RAG or tool path → model route → streaming answer                                                                                                                     |
| Trade-offs            | Caching cuts cost but must be permission-aware; a small model handles simple traffic; live account data cannot be broadly cached                                                                                              |
| Metrics that prove it | Cost per resolved ticket, deflection rate, cache hit rate, P95 latency, tool latency, CSAT                                                                                                                                    |
| Recommendation        | Reduce cost by workflow, not across the board; protect the high-value paths                                                                                                                                                   |

The sixty-second line: reduce cost by workflow, not across the board. Cache the FAQ path, route by intent, and protect the account-data path. Every strong cost answer is generated by four verbs in order. Measure, by tracing and attributing first. Route, matching model and path to risk. Bound, with limits on steps, tokens, top-k, timeouts and budgets. Cache safely, with tenant, permission and version in the key. Deliver it in six moves: frame the business impact, decompose the path, name the largest measured driver, fix safely, prove with before and after, prevent recurrence. Cost per resolved case that improves while repeat contact rises is the trap to name unprompted.

---

## Key Takeaways

- The product is a routed decision pipeline that decides when to act, ask, or stop; the harm case, not the architecture, opens the round.
- Requirements are constraints a test can fail: risk-tiered p95 targets, the NetValue equation, and a component owner for every line.
- The automation layer owns workflow state and evidence; CRM, billing, orders and identity remain the systems of record, and every write carries an idempotency key.
- One diagram separates the data plane that carries the conversation from the control plane that decides whether it may continue, with the authorisation boundary at the tool policy gateway.
- Identity is verified before any account tool, and security is a four-seam chain: untrusted text, least-privilege tools, identity, immutable audit.
- A deterministic gateway decides; the model proposes. Planners earn their cost only on multi-system requests, and memory is three separate layers.
- The handoff carries intent, evidence, attempted actions and the reason automation stopped, and the human queue prioritises by risk.
- Failures degrade into a safe handoff by a six-row policy table; the billing timeout and the timed-out refund are the rehearsed drills.
- The release gate is safe automation rate, incorrect resolutions and repeat contact, each with calculation, source, owner and alert, read across four dashboard layers.
- Rollout is agent-assist, then reversible intents, then one tool class at a time, with a kill switch and rollback per intent.
- The tenant variant adds a tenant predicate on every retrieval; the ITSM variant adds classification, assignment and change control.
- The hour is spent on escalation, safety and rollout, with the 90-second summary, the concise close and nine prepared follow-ups.
- Six study-guide mocks supply the implementation detail: branches with default arms, interrupts inside the tool, two indices with a cheap router, CRAG grading, a supervisor with one writing specialist, parent-document sizing.
- The cost pivot is answered by workflow: cache the FAQ path, route by intent, protect account data.

## Check Yourself

1. **Why is "the tool policy gateway is the authorisation boundary" a stronger claim than "we require human approval for refunds"?** Because it names where every action is decided, deterministically, on assurance level, allowlist, threshold and freshness, and it makes the model's confidence irrelevant to whether an action may execute.
2. **A refund call was issued and the response timed out. What happens next?** Treat the action as potentially successful, never blind-retry, query the ledger or action record to confirm completion, then return success, keep waiting, or escalate; `args_hash` deduplication prevents the repeat.
3. **What are the three risk tiers and their p95 targets?** Routine under 3 s automated by default; ambiguous under 8 s with retrieval plus a second pass; high-risk under 15 s for a handoff bundle where the final decision is never automated.
4. **Why does deflection rate fail as a launch gate?** It measures whether work moved, not whether it was resolved; safe automation rate, incorrect resolutions and repeat contact measure whether the customer was helped, and NetValue subtracts wrong-resolution and recontact cost.
5. **When does a planner earn its cost?** When a request spans systems, such as refund the order, cancel the warranty, notify shipping and create a ticket; "track my order" is a single tool call and must not route through a planner.
6. **What must the handoff record contain?** The original message, parsed intent, tool outputs, policy checks, identity status, error codes, attempted actions and the specific reason automation stopped.
7. **The customer demands 80 percent autonomous resolution in six months. What is the first question?** Eighty percent of what; then anchor on intent-specific gates, because the last intents are money-moving and legal where harm cost dominates.
8. **What changes for the multi-tenant variant?** A tenant predicate on every retrieval and tool call, and a permission-safety gate of zero violations from a red-team suite that asks the same question as users from different tenants.
9. **What is the sixty-second cost answer?** Reduce cost by workflow: an intent router, a permission-aware FAQ cache, a small model for classification, tools only for account data, and the high-value paths protected.

## References

### Fact-check sources (checked 27 Sep 2026)

- [Intercom blog: From resolutions to outcomes](https://www.intercom.com/blog/from-resolutions-to-outcomes-evolving-how-fin-delivers-value/) — vendor-reported 76% Fin resolution rate; deflection range
- [LangGraph docs – Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts) — interrupt inside the tool; durable checkpointer resumes by thread ID
- [LangGraph docs – Use the graph API](https://docs.langchain.com/oss/python/langgraph/use-graph-api) — parallel branches in a superstep succeed or fail together
- [Yan et al. 2024, Corrective Retrieval Augmented Generation](https://arxiv.org/abs/2401.15884) — CRAG retrieval grading with fallback
- [Asai et al. 2023, Self-RAG](https://arxiv.org/abs/2310.11511) — Self-RAG trained self-critique
- [Sentence-Transformers: Retrieve & Re-Rank](https://sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html) — cross-encoder reranking of a small candidate set
- [pgvector README](https://github.com/pgvector/pgvector) — exact search by default; HNSW index option
- [LangChain ParentDocumentRetriever source](https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain_classic/retrievers/parent_document_retriever.py) — 400 / 2,000-character example chunk sizes
- [Supabase: pgvector v0.5.0 HNSW](https://supabase.com/blog/increase-performance-pgvector-hnsw) — HNSW query latency at small scale

