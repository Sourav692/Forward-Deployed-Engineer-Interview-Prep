# Production LLM Gateway Under Real Constraints

*Every safety check and every fallback hop spends part of a three-second budget, and every dollar cut hands the answer to a cheaper model.*

◷ 27 min

This prompt sounds like one box on a diagram, but it is graded as four constraints that fight each other: uptime, safety, a daily budget and a latency ceiling. Treat the gateway as the one place where every model call is metered, screened, routed and recovered, and the fights become explicit trade-offs.

| Case | What it contributes here |
|---|---|
| #100 Production LLM gateway under real constraints (study-guide mock design) | The whole page. The prompt, the rubric and the strong answer come from the study guide; sections 3, 9 and 11 extend them |

**Read this first.** The source is short: a prompt, a seven-point rubric and a seven-bullet strong answer, in section 6 of the [production and operations interview tutorial](../../../../01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/12_production_and_operations_INTERVIEW_TUTORIAL.md). Every figure it gives is kept verbatim below. The patterns behind it (retry, breaker, fallback, degradation, guardrails, caching, routing, budgets) come from the same study guide. The traffic, prices and dollar arithmetic are *own construction*, and every number marked *(assumption)* is a whiteboard illustration, not a sourced figure. The source names data residency as its own open gap; section 11 closes it.

The prompt, verbatim:

> "Design a gateway that sits in front of a customer-support LLM agent. It must survive a provider outage without customer-visible downtime, resist prompt-injection and PII-leak attempts, and stay under a $500/day budget while keeping p95 latency under 3 seconds. Walk me through the architecture."

---

## 1. Ask Which Side of the Agent the Gateway Guards

"In front of an agent" has two readings, and the design needs both. The **edge face** sits between the customer and the agent. It screens what comes in and what goes out. The **model face** sits between the agent and the providers. An agent turn is rarely one call; the cost playbook's rule of thumb is that "one user request becomes 5–20 sub-requests." A gateway that only sees the customer's message cannot meter, retry or fail over the other calls.

So route every model call the agent makes through the gateway's model face *(own construction)*. The deployed research platform in the Handbook does this. Every agent and the evaluator call one shared gateway sidecar, naming a *function* rather than a model, and the gateway maps function to provider. Its reason carries straight over: "hard-coding a provider into every agent makes every outage, rate limit and pricing change a code change in five places."

Ask five questions before drawing, and state an assumption for each one the interviewer declines *(own construction)*.

| Question | Why it matters | Assumption for this page |
|---|---|---|
| How many conversations a day, and how many turns each? | Sets the spend the $500 must cover | 10,000 users a day, borrowed from the playbook's support-chatbot case; 3 turns each |
| Is 3 s the time to first token or to the full answer? | An agent turn with several tool steps usually cannot finish in 3 s | First streamed token for agent turns; full answer for one-call turns |
| One tenant or many? | Decides whether budgets, caches and residency are per tenant | One customer, several regions |
| Can data leave the customer's network or region? | The source's named gap; changes which providers are legal | Unknown; section 11 answers both ways |
| What must never happen? | Sets which checks fail closed | PII leaks to a customer or a provider it should not reach |

The weak answer draws "user → gateway → LLM" and adds retries. The strong answer names the two faces in the first two minutes. It then says each constraint in the prompt belongs to one of them: safety to the edge face, uptime and budget to the model face, latency to both.

Keep this gateway distinct from the "deterministic gateway" in [G02 Customer Support Automation](../../../Scenario_Packs_G01_G20/G02_Customer_Support_Automation/4_Full_Design/G02_Full_Design.md) section 6. That one decides which *actions* an agent may take. This one decides how *model traffic* is screened, paid for and recovered. A real support product has both.

> *"I'll treat the gateway as two faces. The edge face screens the customer's input and the agent's output. The model face sits under every model call the agent makes, so retries, failover and the budget see all of them, not just the first."*

## 2. State Requirements as Testable Constraints

A requirement that cannot fail a test is a preference. "Resist prompt injection" is a preference. "Block every attack in a versioned red-team suite, and log a reason for each block" is a constraint. The nouns below come from the prompt and the rubric; the thresholds are *own construction*.

The must-haves follow the prompt's four clauses. Screen every customer input for injection and PII. Screen every agent output for PII leakage and banned content. Route each model call to the cheapest model that can handle it. Retry, fail over and degrade so a provider outage never shows up as an error page. Refuse any request that would breach the per-request or daily budget. Log enough to replay any bad run.

The should-haves make it operable. A cache for repeated safe answers. Per-region routing for data that cannot travel. A red-team suite that runs through the real path. Prompt and routing changes shipped as versioned config, not code.

| Constraint | Stated so it can be tested |
|---|---|
| Availability | A single-provider outage produces zero customer-visible errors; every response is answered, degraded with a label, or handed to a human |
| Latency | p95 under 3 s to first token on every turn; p95 under 3 s to full answer on one-call turns |
| Daily spend | Under $500/day, enforced by a live ledger, never discovered on the invoice |
| Per-request spend | Rejected before the paid call if it exceeds a token cap *(assumption: 8,000 input tokens per call)* |
| Injection | Every attack in the red-team suite blocked at input or at output; no release if one passes |
| PII | No PII from one turn appears in a response or a log unless policy allows it |
| Attribution | Every response tagged with the model and provider that produced it |
| Replay | Any request reconstructable from its trace: guardrail decisions, route, model, tokens, cost |

Every must-have then needs an owner in the architecture *(own construction)*.

| Requirement | Primary component(s) |
|---|---|
| Screen input | Rule-based input guard, then LLM input guard |
| Screen output | Rule-based output validator, then optional LLM output check |
| Cheapest capable model | Complexity router |
| Survive outage | Provider adapters with retry and breaker, fallback provider, degradation responder |
| Stay under budget | Token-budget check, spend ledger and pacer |
| Replay | Tracer, structured logs, metrics collector |
| Residency | Data-class policy and region-bound provider pool |

## 3. Price the $500 Day Before Drawing Anything

Treat the budget as a design input. Price one day of traffic first, and the design follows from where the money goes. Every number here is *own construction*, and the prices are illustrations; replace them with the current price sheet in the room.

| Assumption | Value |
|---|---|
| Customer turns per day | 10,000 users × 3 turns = **30,000** |
| Cache hit rate | 30% of turns, so 9,000 turns cost nothing |
| Router split of the 21,000 misses | 70% simple, 30% complex |
| Simple turn | One call to the small model |
| Complex turn | An agent path of 5 calls to the large model, the low end of the playbook's 5–20 rule of thumb |
| Tokens per call | 2,000 in, 250 out |
| Small model price | $0.15 in, $0.60 out, per million tokens *(illustrative: GPT-4o mini's list price, still listed in Sep 2026; newer small models price differently)* |
| Large model price | $2.50 in, $10.00 out, per million tokens *(illustrative: GPT-4o's list price, still listed in Sep 2026; newer large models price differently)* |
| Router classification | About $0.00005 per call on the small model |
| LLM input guard | Fires on half of turns, about $0.00005 each |
| LLM output check | Fires on 6,000 turns, about $0.0001 each |

A small call costs 2,000 × $0.15 + 250 × $0.60, per million, which is **$0.00045**. A large call costs $0.0075, so a five-call complex turn costs **$0.0375**.

| Line | Arithmetic | Per day |
|---|---|---|
| Cache hits | 9,000 × $0 | $0 |
| Router | 21,000 × $0.00005 | $1.05 |
| Simple turns | 14,700 × $0.00045 | $6.61 |
| Complex turns | 6,300 × $0.0375 | $236.25 |
| Guards | 15,000 × $0.00005 + 6,000 × $0.0001 | $1.35 |
| **Total** | | **about $245, 49% of the budget** |

Three readings come out of that table. First, the naive design fails. Send all 30,000 turns down the large-model agent path with no cache, and the day costs $1,125, which is 2.25 times the budget. Routing and caching make $500 possible.

Second, complex turns are 21% of traffic and 96% of spend. The complex share decides the budget; the guards and the router barely register. If it rises from 30% to 40% of misses, the day costs about $323.

Third, the budget binds at about 61,000 turns a day with this mix. That is the growth ceiling to tell the interviewer, and it is why section 7 needs a pacer, not only a per-request cap.
