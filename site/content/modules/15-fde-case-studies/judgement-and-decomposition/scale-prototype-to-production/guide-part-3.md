# Scale a Prototype to Production, part 3

## 13. Cover All Seventeen Items the Bank Lists

The prompt lists seventeen things to cover. Check the answer against them, in the order given.

| Item (verbatim) | Where this page covers it |
|---|---|
| Traffic and capacity modelling | Section 4 |
| Multi-tenancy | Sections 1 and 7: departments as tenants, permission scope |
| Rate limits | Sections 4 and 7: provider limits and per-user buckets |
| Queuing | Section 7: fair queue per department |
| Caching | Section 7: prefix cache first, scoped answer cache second |
| Model routing | Sections 4 and 7 |
| Batch processing | Section 7: async lane and the batch API |
| Streaming | Section 7 |
| Cost controls | Sections 4, 7 and 15 |
| Autoscaling | Section 7: workers by queue depth |
| Observability | Sections 6 and 11; the Observability and Production Diagnosis case for the full design |
| Reliability targets | Sections 3 and 8 |
| Rollbacks | Section 10 |
| Security review | Section 11 |
| Support model | Section 11 |
| Change management | Sections 10 and 12: cohort waves, onboarding, champions |
| Adoption measurement | Section 12 |

Failure modes worth volunteering, with the signal that catches each:

| Failure | Signal | Mitigation |
|---|---|---|
| Bill grows faster than users | Cost per active user rising | Request-shape breakdown; routing, prefix cache, output cap |
| Monday-morning 429 storm | Provider 429 rate at peak | Capacity commitment, jittered retry, fallback, shed async lane |
| Department A's burst slows department B | Per-department p95 divergence | Weighted fair queue |
| Answer cites a forbidden document | Isolation test failure; user report | Filter before search; scope in cache key; release gate at zero |
| Prompt edit silently regresses quality | Slice score drop on the online sample | Prompt registry, eval gate, pointer-flip rollback |
| Fallback fails when needed | Fallback error rate on first real use | Keep it warm with a steady traffic share and its own eval |
| Eval bill triples | Judge spend per release | Stratified sample, cheaper judge with audits, cached judge calls |
| Launch succeeds, usage decays | Flat week-4 retention | Section 12's investigation, per cohort |

## 14. Deliver It in Forty-Five Minutes

Spend the time on the gap between prototype and production. The model choice is a sentence.

| Minutes | Phase |
|---|---|
| 0–6 | Clarify: what "works" meant, who the 100,000 are, the budget (section 1) |
| 6–10 | What the prototype hides (section 2) |
| 10–16 | Sizing aloud: requests, tokens per minute, dollars (section 4) |
| 16–22 | The tenfold table (section 5) |
| 22–30 | Architecture and the gateway (sections 6 and 7) |
| 30–36 | Reliability, eval and rollout (sections 8 to 10) |
| 36–41 | Ownership and adoption, including the follow-up (sections 11 and 12) |
| 41–45 | Failure modes and the cost pivot (sections 13 and 15) |

The two-minute spoken answer:

> - First I would ask what "works" meant, because a hundred volunteers prove the idea is useful and nothing about cost, the slow tail, permissions or adoption.
> - Assuming an internal document assistant going to 100,000 employees, I would size it: about 30% daily active at eight requests each is 240,000 requests a day, around 20 a second at peak and roughly 8 million tokens a minute.
> - On one mid-tier model that is about $120,000 a month; routing, prefix caching and an output cap cut it by nearly half.
> - Then I would walk the tenfold steps.
> - At a thousand users I need SSO, versioned prompts and traces.
> - At ten thousand I need a gateway with per-user limits, retry inside a circuit breaker, a fallback provider and permission-filtered retrieval.
> - At a hundred thousand I need fair queuing per department, a capacity commitment, sampled online evaluation and on-call.
> - I would rebuild the eval set from real traffic, gate every release on slices with security at zero, and roll out by department cohort with shadow, canary and a pointer-flip rollback.
> - Finally I would measure adoption, week-4 retention and override rate, because a system nobody uses has failed however well it scales.

The lines that carry the round:

1. *"A hundred volunteers proved the idea, not the system."*
2. *"The bill scales with request shape, not with users."*
3. *"Each tenfold step breaks something different."*
4. *"A rate limit decides whether; a fair queue decides in what order."*
5. *"You can't promise more than your dependency provides."*
6. *"If rollback requires a build, it is not a rollback."*
7. *"Adoption is a deliverable."*

Follow-ups beyond the bank's adoption question:

| Follow-up | Answer |
|---|---|
| Why not autoscale? | LLM load does not correlate with CPU, as the cram sheet notes; the limits are provider tokens per minute, cost and fairness |
| Build the fallback now or later? | Now, warm, with its own eval; a cold fallback fails the first time it matters |
| What do you cut to launch faster? | The answer cache and the model cascade; never identity, permission filtering or rollback |
| How do you know the router is right? | A labelled sample of real traffic; misroute rate against cost saved |
| One department wants a custom prompt | A configuration per department behind the same gate, never a fork |

## 15. Answer the Cost Pivot in Ten Minutes

The interviewer's pivot: "The pilot cost $400 a month. Finance just saw the forecast." There is no drill for this prompt, so the card below is a self-drill, grounded in the cost cram sheets.

| | |
|---|---|
| Dominant driver | Input tokens per request (system prompt, retrieved chunks, history) multiplied by 240,000 requests a day; output verbosity second |
| Cheapest lever first | Route easy intents to the small model; cache the frozen prefix; cap and trim output; move non-interactive work to the batch API; budgets per department before the call |
| Metric that proves it | Cost per successful task by department and intent; cache-read share of input tokens; output tokens per answer; share of traffic per model; misroute rate |
| Do not | Cut quality globally by downgrading every request, or cache answers without the user's permission scope in the key |
| 60-second line | The forecast grew with request shape more than with users. I would route easy intents to a small model, cache the stable prefix, cap output, batch what nobody waits for, and give every department a budget enforced before the call, then prove it with cost per successful task. |

The cram sheet's incident line applies unchanged: *"The increase is likely from request shape, not just user count. I would isolate token growth, retries, agent steps, and batch jobs before changing the model."* Its roadmap sentence is the right shape for finance: first instrument the bottlenecks, then apply safe quick wins, and finally redesign heavy workflows with routing, caching and async processing.

Every strong cost answer follows four verbs in order. Measure tokens and cost per request path first. Route by intent. Bound output, context and tool steps. Cache safely, with the permission scope in every key.

---

## Level calibration

The levels split on whether the thousandfold jump is treated as a capacity problem, an operating problem, or a change programme for a whole organisation.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Sizes 240,000 requests a day down to about 20 a second and 7.8M tokens a minute, then puts one gateway in front of every call with per-user token buckets, retry inside a circuit breaker, a warm fallback and permission-filtered retrieval. Cuts the naive $122,000 month with routing, prefix caching and an output cap. | Who owns the prompt, the budget and the pager, and how 100,000 people arrive without a launch-day cliff. |
| Staff | Walks the tenfold steps and names what breaks at each: identity, then capacity, then fairness. Adds a weighted fair queue per department, an eval set rebuilt from real traffic and gated on slices, cohort waves with a pointer-flip rollback, and named owners with runbooks and a support ladder. | Whether anyone changes how they work, and what the provider relationship needs beyond one quarter. |
| Principal | Treats adoption as the deliverable, measuring week-4 retention and override rate per cohort and investigating a flat curve like a bug. Starts the capacity commitment weeks ahead, tells the customer the service cannot promise more uptime than its provider gives, and keeps per-department prompts as configuration behind one gate, never a fork. | The real department mix, active share and current prices, which only the first cohorts and the price sheet can confirm. |

## Key Takeaways

- Ask what "works" meant, because a hundred volunteers prove usefulness, not cost, tail latency, permissions or adoption.
- Name what demos hide: traffic shape, tail latency, usage expansion and governance cost, plus drifting prompts and one-person support.
- State constraints as tests: requests a second, p95 first token, zero forbidden citations, fairness between departments, budget.
- Size from licensed users to requests, tokens per minute and dollars; adoption is a cost variable.
- Scale in tenfold steps, because I'd expect identity to break first, capacity second, fairness and organisation last.
- Draw admit, assemble, answer, learn, with boundaries at the gateway, retrieval and the control plane.
- Put one gateway in front of every call for identity, per-user limits, a fair queue, metering, routing and safe caching.
- Chain retry, breaker, a warm fallback and degradation, and never promise more uptime than the provider gives.
- Rebuild the eval set from production traffic, gate on slices, and hold security at zero.
- Roll out by cohort through shadow and canary, with a rollback that is a pointer flip.
- Name owners, runbooks and a support ladder before the first cohort.
- Measure adoption with week-4 retention and override rate, and investigate a stall from data to sessions to users.
- Check the answer against the bank's seventeen items and volunteer the failure modes.
- Spend the forty-five minutes on the gap between prototype and production.
- Answer the cost pivot with routing, prefix caching, output caps, batching and budgets before the call.

## Check Yourself

1. **Why is "the prototype works" weak evidence for scaling?** It was judged by a hundred forgiving volunteers on demo questions; it says nothing about cost, tail latency, permissions, abuse or adoption.
2. **Walk the sizing from 100,000 licensed users to tokens per minute.** 30% daily active × 8 requests = 240,000 a day; 80% in 8 hours with a 3× peak ≈ 20/s; × 6,500 tokens ≈ 130,000 tokens/s ≈ 7.8M tokens a minute.
3. **Why did the bill rise about 300 times rather than 1,000?** Only 30% of licensed users are active each day, so adoption sets cost as much as headcount does.
4. **What breaks first between 100 and 1,000 users?** Identity and process: a shared key, a demo eval set, live prompt edits and one-person support.
5. **How do a rate limit and a fair queue differ?** The limit decides whether a request may proceed; the queue decides the order admitted requests are served under load.
6. **Why must the budget check fire before the call?** Checking after the call only reports what was already spent.
7. **What do you tell a customer who asks for 99.9% uptime?** The service cannot promise more than its provider gives; fallback and breakers buy margin, not a guarantee.
8. **Why rebuild the eval set?** The demo set measures what already worked; production traffic from real cohorts contains the questions that will fail.
9. **What makes a rollback a real rollback?** It repoints to a version that is still deployed, in minutes, with no build.
10. **Why split cohorts per user rather than per request?** So one person's experience does not flicker between versions mid-conversation.
11. **The system is ready but nobody uses it. Where do you start?** Segment usage by department and intent, read the sessions where users stop, then check quality, trust, latency, onboarding and workflow fit.
12. **What is the sixty-second cost answer?** Route easy intents down, cache the stable prefix, cap output, batch non-interactive work, budget per department before the call, and prove it with cost per successful task.

## References

### Fact-check sources (checked 27 Sep 2026)

- [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing): Claude Sonnet 5 at $2/$10 and Claude Haiku 4.5 at $1/$5 per million tokens; cache reads at 0.1× input; Batch API at 50% off
- [Anthropic prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): minimum cacheable prompt length: 1,024 tokens for Sonnet 5, 4,096 for Haiku 4.5

