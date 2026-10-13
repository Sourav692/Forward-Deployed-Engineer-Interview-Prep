# Scale a Prototype to Production

*The prototype proved the answer is useful to a hundred forgiving users, and nothing about how it behaves for a hundred thousand who did not ask for it.*

◷ 26 min

Scaling a prototype a thousandfold is not a bigger deployment of the same system. It is a different system that happens to share a prompt. This page is the day-before pack for this case, a standalone case with no group.

| Source | What it contributes here |
|---|---|
| #61 Question 17 in the OpenAI Applied decomposition question bank | The prompt, the seventeen items to cover, the adoption follow-up and its nine answers, reproduced verbatim in sections 1, 13 and 12 |
| Neighbour prompt E in the same bank, "AI Migration from Prototype to Production" | Section 2: the notebook variant of the same question |
| Cost & Latency cram sheets and additions | Sections 2, 4, 7 and 15: why demos die in production, Little's Law, prices, rate limits, batch discount |
| Production study guide (`12_production_and_operations`) | Sections 7 and 8: retries, breakers, fallback, degradation, budgets, the 99.9% answer |
| Handbook Module 08 doc 1 and Module 10 doc 4 | Sections 10 and 12: shadow, canary, pointer-flip rollback, override rate, week-4 retention |
| Handbook Module 06 doc 1 | Section 7: identity, fair queuing |
| G07, G13, G14, G18, G20 and Standalone #100 | Cross-linked by section instead of re-explained |

**The source has talking points for this prompt, not a worked design.** Question 17 lists what to cover and one follow-up. Everything that turns that list into an architecture, a sizing walk and a rollout is *own construction*, built from the sources above. Every number is a stated assumption for the whiteboard, not a measurement.

---

## 1. Ask What "Successful" Meant Before Scaling It

The prompt, verbatim from the question bank:

> *"A prototype works for 100 users. The customer now wants to deploy it to 100,000 users."*

"Works" is the word to attack first. A prototype is usually judged on a demo and a few enthusiastic users. That evidence says the idea is valuable. It says nothing about cost, tail latency, abuse, or the users who never volunteered. The bank's own list of biggest mistakes includes *"Treating a prototype as a production system."*

Ask before sizing anything. The assumed answers are *own construction*, stated aloud so the interviewer can correct them.

| Question | Assumed answer | What it decides |
|---|---|---|
| What does the prototype do? | An internal assistant: answers from company documents and calls two read-only tools | RAG plus light tool use, not a free-form agent |
| Who are the 100,000? | Employees of one enterprise, across departments and three regions | SSO, departments as tenants, residency questions |
| How was "success" measured? | Thumbs-up rate and a manager's impression from 100 volunteers | No real eval set exists yet; build one |
| What must stay true at scale? | Answers cite sources; no user sees a document they cannot open | Permission-aware retrieval is a gate, not a feature |
| What latency is acceptable? | First token under 2 s at p95; full answer under 10 s | Streaming, queueing and routing budgets |
| Is there a budget? | Yes, but nobody has priced it yet | The sizing in section 4 is part of the answer |
| When, and how fast? | Company-wide within a quarter | A staged rollout by cohort, not a launch day |

The weak answer draws autoscaling and a load balancer. It treats the jump as a compute problem. The strong answer says three things in the first two minutes. The evidence of success does not transfer. The bill scales with request shape, not with users. And adoption is a deliverable, not a side effect.

> *"A hundred volunteers proved the idea is useful. A hundred thousand employees will test everything the volunteers forgave: cost, the slow tail, permissions, abuse and whether anyone changes how they work."*

## 2. Name What the Prototype Was Hiding

A prototype hides problems by construction, not by accident. The cost cram sheet names four things demos hide. They hide *traffic shape*: one user, a warm cache, clean data. They hide *tail latency*: p95 and p99, not the average. They hide *usage expansion*: longer questions and bigger uploads, so tokens grow faster than requests. And they hide *governance cost*: security review, audit logging, evaluation, human review and support.

The same sheet contrasts prototype and production on six axes, verbatim in the table's middle column.

| Axis | Prototype → production (cram sheet) | What that means for #61 *(own construction)* |
|---|---|---|
| Dataset | curated/static → large, messy, multi-tenant, churning | The eval set built from demo questions is biased toward what already worked |
| Security | mocked → OAuth/OIDC/SAML, RBAC/ABAC, permission filtering, audit | A shared API key and an unfiltered index become a data-exposure incident |
| Load | one user → concurrency, spikes, batch, retries | Provider rate limits appear at the Monday 9 a.m. spike |
| Observability | console logs → traces, token metrics, cost dashboards, alerts | Nobody can say why a bad answer happened |
| Latency | one happy path → tail latency, queueing, cold starts | The demo's 3 s answer becomes a 12 s p95 under queueing |
| Cost | small bill → budget ownership, allocation, anomaly detection, procurement | Nobody owns the invoice until it arrives |

Add three gaps the table does not name *(own construction)*. Prompts drift, because the builder still edits the live prompt by hand. Provider quotas are sized for a pilot account. And the support model is a chat message to the one engineer who built it. At a thousand times the users, that engineer becomes the outage.

The bank has a neighbouring prompt with the same shape: *"A team has a successful notebook-based AI prototype. How do you productionise it?"* Its discussion list is verbatim: reproducibility, CI/CD, evaluation gates, model and prompt versioning, secrets management, monitoring, cost controls, security, SLAs, rollback, ownership and support. Answer it with this page. The notebook variant adds one first step: turn the notebook into versioned, tested code before any of the rest applies.

## 3. State Requirements as Testable Constraints

A requirement that cannot fail a test is a wish. "Scalable" is a wish. "Sustains 20 requests a second at p95 first-token under 2 s" is a constraint. The split below is *own construction*.

The functional core does not change from the prototype. Answer questions from company documents with citations. Call the two read-only tools. Keep a short conversation history. What changes is everything around that core: identity, limits, fairness, failure handling, evaluation, rollout and support.

| Constraint | Stated so it can be tested *(own construction)* |
|---|---|
| Throughput | 20 requests/s sustained at peak, 40 requests/s burst for 10 minutes |
| Latency | First token under 2 s p95; full answer under 10 s p95; measured per stage |
| Availability | 99.9% for the assistant's own service; a provider outage degrades, never errors |
| Isolation | Zero answers citing a document the user cannot open, tested before every release |
| Fairness | One department's burst cannot raise another's p95 by more than 20% |
| Cost | Cost per daily active user tracked by department; monthly spend within the approved budget ±10% |
| Quality | No regression against the production-derived eval set on any intent slice |
| Operability | Every page has a runbook; rollback in under 5 minutes without a redeploy |
| Adoption | Week-4 retention and task success reported per department cohort |

Every new constraint needs an owner in the architecture *(own construction)*.

| Constraint | Primary component(s) |
|---|---|
| Throughput and latency | Gateway queue, model router, streaming, provider capacity |
| Availability | Retry, circuit breaker, fallback provider, graceful degradation |
| Isolation | SSO at the gateway, permission filter in retrieval, scoped cache keys |
| Fairness | Per-user token buckets, weighted fair queue per department |
| Cost | Budget meter before the call, routing, caching, batch path |
| Quality | Eval gate in CI, sampled online evaluation |
| Operability | Prompt registry with a live pointer, runbooks, on-call |

## 4. Size the Thousandfold Jump From Users Down to Tokens

Say the arithmetic aloud, because it turns "scale" into three numbers the customer must approve: requests per second, tokens per minute and dollars per month. Every figure below is an assumption *(own construction)*. The method is what gets scored.

| Step | Assumption | Result |
|---|---|---|
| Licensed users | 100,000 | — |
| Daily active share | 30% once adoption settles | 30,000 daily active users |
| Requests per active user | 8 a day | 240,000 requests a day |
| Business-hours concentration | 80% of traffic in 8 hours | ≈ 6.7 requests/s during working hours |
| Peak | 3× the working-hours average | ≈ 20 requests/s |
| Input per request | 6,000 tokens: 1,500 system and tools, 3,500 retrieved, 1,000 history | 1.44B input tokens a day |
| Output per request | 500 tokens | 120M output tokens a day |
| Concurrency | Little's Law: 20/s × 5 s average | ≈ 100 requests in flight at peak |
| Peak token rate | 20/s × 6,500 tokens | ≈ 130,000 tokens/s ≈ 7.8M tokens/minute |

Little's Law is `concurrency = throughput × latency`, from the cost additions. It turns latency work into capacity work. Halving average latency halves the in-flight slots to provision.

Now price it. The cost additions list current tiers: Claude Sonnet 5 at $2.00 input and $10.00 output per million tokens, and Claude Haiku 4.5 at $1.00 and $5.00 (checked Sep 2026 on Anthropic's pricing page). Prices change constantly, so state the mechanism and say "I'd check current pricing" for the digits.

| Scenario *(own construction)* | Daily cost | Monthly |
|---|---|---|
| Prototype: 100 users × 8 requests, one mid-tier model | ≈ $14 | ≈ $400 |
| Naive scale: 240,000 requests on one mid-tier model | $2,880 input + $1,200 output = $4,080 | ≈ $122,000 |
| + route 70% of requests to the small model | ≈ $2,650 | ≈ $80,000 |
| + cache the 1,500-token stable prefix (read price 10% of input; only the mid-tier 30% benefits, because Haiku 4.5 will not cache a prompt under 4,096 tokens) | ≈ $2,460 | ≈ $74,000 |
| + cap average output at 350 tokens | ≈ $2,220 | ≈ $67,000 |

Two points carry the table. First, the bill went up about 300 times, not 1,000 times, because only 30% of licensed users are active. Adoption is a cost variable. Second, the three cheapest levers cut the naive bill by nearly half without touching quality on the hard 30%. The cost additions' rule of thumb is that a real agent request can become 5–20 sub-requests. If the tools grow into an agent, multiply the call count before trusting any of this.

Then check the provider. 7.8M tokens a minute at peak must fit the account's tokens-per-minute and requests-per-minute limits, split by model after routing. Plan for twice the peak, because retries during an incident and the Monday spike stack on each other *(own construction)*. That headroom is a procurement conversation, and it starts weeks before launch.

## 5. Walk Each Tenfold Step and Name What Breaks

Scale in tenfold steps, because each step breaks something different. A plan that jumps from 100 to 100,000 finds all of them on the same morning. The table is *own construction*, built from the cost incidents and the production guide.

| Step | What breaks first | First signal | Fix before the next step |
|---|---|---|---|
| 100 → 1,000 | Shared API key and no per-user identity; the demo eval set; prompt edited live; support is one engineer's inbox | Complaints reach the builder directly; answers wrong on documents the demo never touched | SSO and per-user identity; versioned prompts; structured logs and traces; first eval set from real logs |
| 1,000 → 10,000 | Provider 429s at peak; the bill becomes visible; queueing inflates p95; retrieval exposes documents across departments | 429 rate; invoice; p95 rising while p50 stays flat; a permissions complaint | Gateway with rate limits, retry, breaker and fallback; permission-filtered retrieval; routing and caching; budgets per department |
| 10,000 → 100,000 | Department bursts starve each other; provider capacity; multi-region and residency; eval cost; incident blast radius; adoption stalls | One department's p95 degrades during another's peak; eval bill spikes; week-4 retention flat | Weighted fair queue; capacity commitment and a warm fallback; sampled online eval; on-call and runbooks; cohort rollout with change management |

Read the table left to right in the interview. I'd expect the prototype's weaknesses to show up in roughly this order: identity first, capacity second, fairness and organisation last. The fix for each step is cheap before that step and expensive during it.
