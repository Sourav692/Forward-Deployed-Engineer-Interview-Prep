# AI Customer-Support Automation as a Routed Decision Pipeline

*Resolve the routine ticket fast enough to matter, without letting a fluent model take an action or make a promise it was never authorised to make.*

◷ 40 min

- The product is a routed service that must decide when to act, when to ask for approval, and when to stop.
- A chatbot that answers everything fails that test. A fluent model is one input to that decision, never its authority.
- This page combines the group's prompts into one read for the day before.
- Every other case in the group is a delta on it.

| Case in the group                                              | What it contributes here                                                               |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| AI Customer-Support Automation (anchor)         | Sections 1 to 10 and 12: the design, requirements, evaluation and rollout              |
| Casebook Customer Support Assistant, 1M conversations a day | Section 6: planner justification, three memory layers, model routing; section 8: scale |
| Multi-Tenant SaaS Support Assistant                        | Section 11: the tenant predicate                                                       |
| ServiceNow Ticket Automation Agent                         | Section 11: classify, prioritise, assign                                               |
| Agentic Support Workflow, short and full mock              | Section 12: the interviewer's probes and the marketplace scenario                      |
| OpenAI-style practice prompt, Customer-Support Agent           | Section 12: the decomposition list and the 80 percent follow-up                        |
| Six framework mock designs        | Section 13: one implementation delta each                                              |
| Support chatbot with 10,000 daily users                    | Section 14: the cost drill                                                             |

---

## 1. Reframe the Chatbot as a Routed Decision Pipeline

Open with the harm case before any architecture. The ask sounds like "automate routine support". Reframe it: the product must decide when to act, when to ask, and when to stop. Interviewers listen for that reframe. Say it in the first minute; it sets up every gate that follows.

> *"I'd like to optimise for the outcome first: reduce handling time and cost without increasing incorrect or harmful resolutions. I'll clarify the highest-risk intents, estimate scale, sketch the control flow, and then spend most of my time on escalation, safety and rollout."*

- The running example is a customer who says "I was charged twice for last month's subscription and need this fixed today." The naive design sends that to a model, drafts a reply and resolves the ticket.
- The real design starts earlier. Verify who the user is. Determine whether the request touches money.
- Decide whether it is safe to act on the account. Preserve enough context for a human to take over if automation hesitates.
- If the billing provider is down, or the model sounds confident but the policy check fails, degrade into a safe handoff rather than force a bad answer.

- The three answer tiers show what the reframe buys. The weak answer sends each message to an LLM, drafts a reply and resolves the ticket.
- It treats model output as truth, never verifies identity before touching an account, and puts no policy gate between a fluent answer and a real refund.
- The average answer classifies intent, retrieves policy and account context, drafts a grounded reply and escalates on low confidence.
- It never names which actions need approval, never says what happens when a refund executes but the response times out, and treats confidence as sufficient grounds to act.
- The strong answer designs a routed decision pipeline. Identity is verified before any account tool.
- The router tags risk. Retrieval grounds the draft. A deterministic tool policy gateway, not the model, decides whether an action may execute.
- Latency is tiered by risk. Dependency failures degrade into a handoff carrying full context.
- The launch is agent-assist only, then reversible intents, then one tool class at a time with a kill switch per intent.

Ask the questions that move risk boundaries. Name the six discovery areas fast and unprompted: channel and volume, action authority, identity and data sensitivity, freshness of knowledge, escalation and human-in-the-loop, multilingual handling.

| Question to ask                                                                                           | What the answer decides                                                                             |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Which channels are in scope, chat, email or voice, and what is the monthly volume and peak concurrency?   | The gateway's envelope and whether voice transcripts enter the same pipeline; the capacity envelope |
| Which actions may the system take autonomously, and which require human approval before execution?        | The tool policy gateway's rules and the first-release scope fence                                   |
| How is the customer authenticated, and which fields such as payment data or PII need extra protection?    | The identity boundary, assurance levels, and what account tools may run pre-auth                    |
| How current must policy articles, order status and account data be before an answer is unsafe?            | Which facts are fetched live before an action and which may be cached                               |
| What does a human agent need to see at handoff, and how fast must that handoff happen?                    | The Handoff record's fields and the p95 for the handoff bundle                                      |
| How many languages at launch, and what happens when detection fails or returns low confidence?            | The language-neutral intake path and the multilingual escalation route                              |
| Which categories carry legal, financial or safety risk and must stay human-reviewed in the first release? | The risk tags the router assigns and the non-goals list                                             |
| What is the refund threshold above which approval is mandatory, and who owns that policy?                 | The one number the gateway checks on every money-moving action                                      |

- Interviewers often answer only half of these on purpose, to see whether the candidate can assume without gambling on the highest-risk area.
- Safe defaults exist. Chat and email but no phone means a text-based model.
- An unknown language mix means the dominant language plus a fallback escalation path.
- Unknown volume means scalable but not over-engineered.
- Dangerous assumptions weaken the control boundary: that identity is always verified, that any request can be automated, that the model's answer is inherently safe, and that the CRM is always the source of truth.
- When in doubt, protect the highest-risk constraint first: no unauthorised action and no confidently wrong answer on sensitive topics.

Map the people, because each notices a different failure first.

| User                              | Workflow                                                          | Failure they notice first                                | What the system gives them                                                                | Approval role                                                 |
| --------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Customer                          | Asks in chat, email or voice; wants the double charge fixed today | A confident wrong answer, or a promise that is not kept  | Fast grounded answer on routine intents; a clean handoff on risky ones                    | None                                                          |
| Support agent                     | Receives escalations, sends every reply during agent-assist       | A thin handoff that repeats work the machine already did | Handoff with intent, evidence, attempted actions and reason codes                         | Sends the final response in phase one; approves gated actions |
| Support operations lead           | Owns workflow adoption and the escalation policy                  | Automation that deflects work into second contacts       | Safe automation rate per intent, repeat-contact rate, kill switch per intent              | Owns the go/no-go gate with product                           |
| Security, legal, privacy reviewer | Sets data access, retention and tool permission policy            | An action taken before identity was verified             | Immutable audit of actor, model version, tool, fields validated, policy version, override | Signs off each tool class                                     |

Declare the scope fence before the first box, because without a non-goals list the design expands until risk dominates the interview. First-release exclusions:

- open-ended negotiation with customers
- autonomous handling of legal complaints
- fully unsupervised refunds or cancellations
- cross-system data repair with no human review
- proactive outreach on ambiguous policy violations

## 2. State Requirements as Testable Constraints

A constraint is a boundary the design must obey; a preference is polish. "Refunds above a stated threshold require human approval" is a constraint and shapes trust boundaries, authorisation and audit. "Show recent purchases on the right side of the console" is a preference and decides nothing about admissibility. State every requirement so a test can fail it.

- The functional must-haves form the pipeline in order. Classify and route every request by intent and risk before any retrieval or drafting begins.
- Retrieve grounded customer and policy context from CRM, order and policy sources before drafting.
- Draft or send answers gated by confidence and risk level. Execute tools such as refunds, address changes and subscription actions only through a controlled, authorised layer.
- Hand off to a human with full conversation and action history whenever automation hesitates.
- Record every retrieval, decision, tool call and human override so any outcome is attributable afterward.

The non-functional requirements tier by risk rather than one flat SLO.

| Constraint   | Stated so it can be tested                                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Latency      | p95 under 3 s for routine requests, automated by default; under 8 s for ambiguous requests using retrieval plus a second pass; under 15 s for a safe high-risk handoff bundle, where the final decision is never automated |
| Availability | At 2M tickets a month and 100 QPS peak, routing, retrieval and escalation accept work independently; a burst sheds enrichment and returns "we're processing your request", never a collapse                                |
| Security     | Untrusted customer text belongs in a message channel, never a control channel; tools are scoped per workflow; identity is verified before any account tool                                                                 |
| Compliance   | An immutable trail of actor, model version, tool invoked, fields validated, policy version and any human override, surviving the incident it describes                                                                     |
| Reliability  | A dependency timeout or incomplete context degrades into a safe handoff rather than forcing an answer;`409` when a state transition is no longer permitted, `422` when typed validation fails                          |
| Cost         | Judged by`NetValue = V_time_saved − C_model − C_wrong_resolution − C_recontact`, never by deflection rate alone                                                                                                       |

Every requirement has an owning component:

| Requirement                                   | Primary component(s)                                                 |
| --------------------------------------------- | -------------------------------------------------------------------- |
| Classify and route requests                   | Intent router, policy classifier, escalation gate                    |
| Retrieve grounded customer and policy context | Retrieval layer connected to CRM, order and policy sources           |
| Draft or send answers by confidence and risk  | Response policy engine with confidence thresholds and approval paths |
| Execute tools through a controlled layer      | Tool execution service with authorisation, validation and logging    |
| Hand off with conversation and action history | Agent console and shared case timeline                               |
| No unauthorised account action                | Permission checks and human approval for restricted operations       |
| Low incorrect-resolution rate                 | Conservative thresholds, grounding, fallback to human review         |
| Fast human takeover                           | One-click escalation and context packaging                           |
| Complete action auditability                  | Append-only event trail with actor, time and reason                  |

- Size for the load that breaks the system, not the average. The practice numbers are 2 million tickets a month, 100 QPS peak and 20 languages.
- Two million a month is about 67,000 a day, but a morning spike after a product incident or a billing change arrives far above that.
- At 100 QPS the control plane cannot be a single-threaded pipeline. Twenty languages make English-only assumptions unsafe.
- Turn volume into calls, because tickets times one is not the model bill.
- Assume 70 percent routine, 20 percent ambiguous and 10 percent escalated. Routine is 1.4M tickets times 2 calls, or 2.8M.
- Ambiguous is 0.4M times 3, or 1.2M. Escalated is 0.2M times 1, or 0.2M.
- That is about 4.2M model calls a month, plus retries, moderation and tools.
- Retrieval runs 1.4M plus 0.8M plus up to 0.2M, so 2.2M to 2.4M calls a month.
- Retrieval therefore drives freshness logic, cache design and failure isolation. Handled only by people, a queue this size needs well over a thousand full-time agents (assuming ~1,500 tickets per agent a month).
- Deflecting 30 to 50 percent of tickets (a conservative planning assumption) shows up as delayed hiring, less overtime and agents moved to complex cases, not as half a team eliminated.

- The NetValue equation is the most reusable move on the board. Start with time saved.
- Subtract model and retrieval cost. Subtract the cost of a confidently wrong resolution, which I'd expect to outweigh the model bill in most support settings.
- Subtract the cost of a repeat contact. A system that saves ten seconds per ticket and raises recontact is not a win.
- At 10× growth, revisit partitioning rather than server count: split online answering from offline summarisation, isolate escalation traffic from routine classification, and move long-running enrichment out of the critical path.
- Peak concurrency and escalation rate control the architecture more than the exact monthly count.
