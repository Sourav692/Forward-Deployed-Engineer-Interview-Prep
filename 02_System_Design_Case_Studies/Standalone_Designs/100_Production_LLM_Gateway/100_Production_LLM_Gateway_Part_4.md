# Production LLM Gateway Under Real Constraints, part 4

## 12. Name What Still Breaks

The rubric's last line rewards a candidate who "volunteers the failure mode of their own design." Have four ready *(own construction, with sourced items marked)*.

| Failure | Why the design misses it | What to add next |
|---|---|---|
| A rephrased injection passes both guards | Both layers are probabilistic; the source calls injection defence "risk reduction, not a solved problem" | Output-side policy checks on tool calls, least-privilege tools, a red-team suite that grows with every incident |
| Both providers degrade together | They share a region, a cloud or an upstream dependency | A third, independent provider or an in-network model for the top intents |
| The pacer degrades quality silently | Routing tightens and nobody notices the answers got worse | Alert on pacer state; track resolution rate by route |
| A cached answer goes stale | The key lacked a document or policy version | Version-keyed cache with invalidation on document, ACL or metadata changes |
| PII leaks through logs, not responses | Output validation never sees the log pipeline | Redact at write time; audit logs, traces and cache after any leak, as the source's incident answer says |

## 13. Score Yourself Against the Source Rubric

The study guide gives the rubric; each line maps to a section of this page.

| Rubric line (verbatim) | Answered in |
|---|---|
| Names a concrete resilience chain (retry → circuit breaker → fallback → graceful degradation), not just "add retries." | Section 8 |
| Puts cost control *before* the model call (routing + cache + budget), not as an afterthought. | Sections 3, 6 and 7 |
| Separates rule-based guardrails (fast, free, first) from an LLM-as-guardrail layer (slower, catches rephrased attacks). | Section 5 |
| Covers both input and output PII/injection checks, not just input. | Section 5 |
| Names what gets logged/traced and why (cost per request, which model answered, guardrail decisions) — enough to debug a bad run after the fact. | Section 10 |
| States a concrete latency budget breakdown, not just "keep it fast." | Section 9 |
| Volunteers the failure mode of their own design (what still breaks, and what they'd add next). | Sections 11 and 12 |

Three things on this page go beyond the rubric, and they are what a senior answer adds. The dollar arithmetic that shows the budget binds on the complex share. The collisions between the 3 s budget and the agent path, the retries and streaming. And a residency answer that constrains the fallback chain itself.

## 14. Deliver It in Forty-Five Minutes

The hour belongs to the four constraints, because those are the words in the prompt. Spend it in this order *(own construction)*.

| Minutes | What to say |
|---|---|
| 0–5 | The two faces; the five questions; state the assumptions |
| 5–10 | Requirements with numbers; what 3 s measures |
| 10–15 | Price the day: about $245, 96% on complex turns, ceiling near 61,000 turns |
| 15–25 | The diagram: screen, meter, route, recover |
| 25–30 | Guardrails both directions; cache keys |
| 30–37 | The resilience chain and the latency sums |
| 37–42 | Observability and residency |
| 42–45 | What still breaks, and the cost pivot |

The two-minute summary to rehearse:

> *"I'd build the gateway with two faces. The edge face screens the customer's input with free regex and PII masking first. It pays for an LLM guard only on what survives, and it validates the agent's output before it reaches the customer. The model face sits under every call the agent makes. It meters each one against a per-request cap and a daily ledger, routes simple turns to a small model, and wraps each provider in retry inside a circuit breaker. It fails over to a warm second provider and degrades to a labelled answer or a human handoff. Priced out, the day costs about $245 against $500, and 96% of that is the complex agent path, so that is where I'd watch. The latency sum fits 3 s on the common path. The agent path needs a first-token SLO, and retries need a deadline, not an attempt count. Every request carries its cost, its model and its guard decisions in one trace. If data can't leave the region, the fallback chain has to stay inside the region too."*

## 15. Answer the Cost Pivot in Ten Minutes

The pivot after a good design is "the bill is over budget." No playbook drill covers this case, so the card is *own construction*, built from the playbook's drivers and section 3's arithmetic.

| | |
|---|---|
| Dominant driver | The large-model agent path: 21% of turns and 96% of spend, then retries during incidents |
| Cheapest lever first | Tighten the router threshold on labelled traffic; send common intents to a one-call deterministic path; cap agent steps; cache safe FAQ answers; trim the system prompt and history |
| Metric that proves it | Cost per resolved conversation; spend by route; complex-turn share; cache hit rate; resolution rate by route |
| Do not | Downgrade every request to the small model, or cache account-specific answers to raise the hit rate |
| 60-second line | Almost all the money is the complex agent path, so route fewer turns there, cap its steps, and send common intents down a one-call path. Cache only answers the key proves are safe. Prove it with cost per resolved conversation, not cost per request. |

The playbook's own case says the same: "reduce cost **by workflow**, not across the board; protect high-value paths." Every strong cost answer follows four verbs in order. Measure, with spend by route and by prompt version. Route, sending simple turns to the small model and common intents to a workflow. Bound, with step caps, token caps and the pacer. Cache safely, with permission-aware, version-keyed entries only.

---

## Level calibration

The levels split on whether the four constraints are met one at a time, traded against each other, or turned into a platform choice the customer lives with for years.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Names the full chain of retry inside a breaker, warm fallback and labelled degradation, runs rule-based guards before the LLM guard in both directions, and caps each request before the paid call. Prices the day at about $245 against $500 and sees complex turns carry 96% of spend. | The collisions: a five-call agent path cannot finish in 3 s, retries overrun the budget during an outage, and the LLM output check fights streaming. |
| Staff | Splits the gateway into an edge face and a model face, holds agent turns to first token under 3 s, runs router and input guard in parallel, and gives retries a deadline instead of an attempt count. Adds a pacer that tightens routing at 80% and 95% of spend, version-keyed cache entries, and one trace per request with cost, model and guard decision. | What happens when data cannot leave the region, and which other agents will route through this gateway next. |
| Principal | Makes residency a routing rule with its own in-region fallback pool, because a fallback across the boundary is a breach, not a recovery. Positions the gateway as the shared function-to-model layer for every agent, and says plainly that a self-hosted pool turns the $500 into a GPU-hour budget on a weaker model. | The real traffic, complex-turn share and residency policy, which decide whether $500 still holds past about 61,000 turns a day. |

## Key Takeaways

- The gateway has two faces: the edge face screens the customer, and the model face sits under every call the agent makes.
- Each clause of the prompt becomes a constraint a test can fail, with one owning component.
- Pricing the day shows routing and caching make $500 possible, and complex turns carry 96% of spend.
- The architecture screens, then meters, then routes, then recovers, with the trace running through all of it.
- Rule-based guards run first and free; the LLM guard runs only on what survives, in both directions.
- The cache key must prove a hit is safe: tenant, permission, document version and prompt version.
- Cost control fires before the call: a per-request cap for outliers, a ledger and pacer for the day.
- Retry handles a bad call, the breaker a bad provider, fallback the outage, and degradation the floor.
- The 3 s budget fits the common path, and the agent path, retries and streaming each need their own rule.
- Every request carries its cost, model and guard decisions, with PII redacted before logs are written.
- Residency is a routing rule, and a fallback that crosses the boundary is a breach.
- A senior answer volunteers what still breaks and what comes next.
- The source rubric maps line for line onto this page.
- The forty-five minutes go to the four constraints, closed by the two-minute summary.
- The cost pivot targets the complex agent path and is proven by cost per resolved conversation.

## Check Yourself

1. **Why must the gateway sit under the agent's model calls, not just in front of the customer's message?** The cost playbook's rule of thumb puts one agent turn at 5–20 sub-requests. Metering, retry and failover that see only the first call miss the rest.
2. **Price the day aloud.** 14,700 simple turns × $0.00045 ≈ $6.61; 6,300 complex turns × $0.0375 ≈ $236.25; router and guards ≈ $2.40. About $245, with complex turns 96% of it.
3. **What does the naive design cost?** All 30,000 turns on the large-model agent path with no cache: $1,125, 2.25 times the budget.
4. **Why does the input guard run before the cache?** So an injected prompt is never cached, and the cache key is the PII-masked text.
5. **Why is a class named `SemanticCache` in the source not semantic?** It hashes normalised text for an exact match. Paraphrases miss.
6. **What is the difference between a per-request cap and the pacer?** The cap rejects one oversized request before the call. The pacer watches the day's total and degrades routing before the money runs out.
7. **Order the resilience chain and say what each link handles.** Retry for a blip, breaker for a bad provider, fallback for an outage, degradation as the floor.
8. **Why does the model face return a typed error rather than a degraded string?** An agent that acts on degraded text as if it were real can take a wrong action. Degrade for humans, fail loudly for machines.
9. **Sum the common-path latency.** ~1ms + ~5-10ms + ~200-400ms + ~1-2s + ~1ms, about 2.4 s at the top of each range. The LLM output check adds 300-500ms.
10. **Why can p95 full-answer latency never be under 3 s here?** Complex turns are 21% of traffic and take 5 to 10 seconds, so p95 falls inside them. Hold them to first token instead.
11. **Why can't the notebook's retry schedule run on the interactive path during an outage?** It waits 0.3 s, 0.6 s and 1.2 s, 2.1 s in total, before the fourth attempt. Use a per-request deadline and let the breaker send traffic to the fallback.
12. **A region-bound customer's primary provider goes down. Where does traffic go?** To that region's own fallback pool, or to a human handoff. Never to the global pool.
13. **What is the cost card's 60-second line?** Almost all the money is the complex agent path, so route fewer turns there, cap its steps, and send common intents down a one-call path. Cache only safe answers. Prove it with cost per resolved conversation.

## References

All paths are relative to the repository root.

| Section | Source |
|---|---|
| Prompt, rubric, strong answer; 5, 8, 9, 11, 12, 13 | `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/12_production_and_operations_INTERVIEW_TUTORIAL.md`, section 6 (mock system design), with sections 1.7–1.19 (patterns), 2 (gotchas), 3 (trade-off one-liners), 4 questions 2, 5, 8 and 9, and 5.2–5.3 (agent and FDE tracks: typed degradation, residency masking, self-hosted tracing) |
| 1, 4 (gateway sidecar, function-to-model mapping, same-path red teaming) | `01_Concept_Tutorials/FDE_Handbook/07_Multi_Agent_Systems/04_Case_Study_Research_Platform.md`, layers 4 and 8; `01_Concept_Tutorials/FDE_Handbook/07_Multi_Agent_Systems/diagrams/04-llm-gateway.mmd` |
| 1, 3, 5, 6, 7, 9, 10, 15 | `01_Concept_Tutorials/Cost_and_Latency_Optimization/CORE_8_DRIVERS_MEMORIZE.md` (drivers 5, 6 and 7; "5–20 sub-requests") and `CRAM_SHEET_FULL_PLAYBOOK.md` (§9 caching, §12 trace-event fields, §13 budgets, cascades "keep prompts and schemas portable") |
| 1, 15 | `01_Concept_Tutorials/Cost_and_Latency_Optimization/CRAM_SHEET_S15_S16.md`, §16 Case 2 (support chatbot with 10,000 daily users; "reduce cost by workflow"), §15 #12 (cache hit rate dropped) |
| 8 | `01_Concept_Tutorials/Cost_and_Latency_Optimization/ADDITIONS_BEYOND_PLAYBOOK.md`, section E (provider 429s versus gateway limits) |
| 11 (replica formula) | `03_Practice_Worksheets_and_Keys/System_Design_Worksheets/answer_keys/07_ai_system_for_an_air_gapped_environment_answer_key.md` |
| Underlying notebooks | `03_Advanced/12_Production_and_Observability/`: `Reliability_and_Fallbacks/01_Exception_Handling_and_Fallback_Chains.ipynb`, `Caching_and_Performance/`, `Cost_Monitoring/`, `Production_Course_Ops/02_cost_optimization.ipynb` and `03_security_patterns.ipynb`, `Safety_and_Alignment/03_Guardrails_LLM_and_Rule_Based.ipynb` |
| Cross-references | `02_System_Design_Case_Studies/Scenario_Packs_G01_G20/G02_Customer_Support_Automation/G02_Customer_Support_Automation.md` section 6 (the action gateway, a different component); `G07_Secure_Multi_Tenant_AI_Platform.md` sections 5 and 8 (tenant context, regional routing); `G14_Observability_And_Production_Diagnosis.md` sections 6, 7 and 11; `G18_Consumer_Scale_Chat_Service.md` sections 7 and 11 (cascade cost, regional failover); `G20_LLM_Inference_Serving.md` (self-hosted serving); `Standalone/19_Air_Gapped_AI_System/` |
| Everything marked *(own construction)* or *(assumption)*: traffic, prices, dollar arithmetic, the two faces, the pacer, parallel guard and router, deadline retries, warm fallback, residency pools, the failure table, the cost card | Built for this page. The source gives the rubric, the strong answer and the latency terms; treat the rest as the candidate's own reasoning, not a sourced claim |

### Fact-check sources (checked 27 Sep 2026)

- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing) — GPT-4o mini ($0.15/$0.60) and GPT-4o ($2.50/$10.00) are still listed at the illustrative prices used in section 3
- [OpenAI moderation guide](https://developers.openai.com/api/docs/guides/moderation) — the fixed category taxonomy (including harassment), per-category scores and the `flagged` flag
