# Agent Platform for Non-Technical Users, part 4

## 14. Deliver It in Sixty Minutes

Announce where the risk is, then spend the hour there. The channel adapters are comparatively boring.

> *"The hardest part of this system is making the dangerous decisions deterministic instead of delegated to the model. I want to spend my time on the guardrail engine and the orchestrator."*

| Minutes | Phase |
|---|---|
| 0–8 | Clarify and scope: five questions, the framing sentence, Cascade Robotics (sections 1, 2) |
| 8–12 | Entities and the happy path, narrated before drawing (section 4) |
| 12–20 | The architecture, with the two routing decisions labelled (sections 4, 6) |
| 20–40 | Deep dive: determinism, the guardrail, the two bugs, durability (sections 7 to 10) |
| 40–55 | Cross-cutting and failure: tenancy, security, observability, failure table, scale (sections 11, 12) |
| 55–60 | Close: three sentences, trade-offs, week one |

The three-sentence close:

> *"A multi-channel platform where every dangerous decision - which workflow runs, whether a destructive step executes, whether a retry can double-apply a side effect - is deterministic and enforced in code, never delegated to the model in the moment. Workflows are declarative and versioned, promoted through a staged rollout the same way a person earns more autonomy over time. Durability and idempotency mean a crash or a redelivered event is a non-event, not an incident."*

| Decision | Chose | Would revisit if |
|---|---|---|
| A fixed step-list planner over an LLM reasoning loop | Deterministic, testable, free | The task space is open-ended enough that a fixed plan cannot cover it; then a model picks the next tool inside the same guardrail |
| Priority plus entity lock over one ranking mechanism | Two independent checks | Conflicts became rare enough that the lock is not worth it — unlikely, since the lock makes a misconfigured priority merely wrong instead of dangerous |
| In-process locks and idempotency store | Simple, fast for a demo | Any real deployment on day one |

The forward-deployed close, which must not be skipped:

> *"If I were shipping this, week one isn't the full agent runtime. It's: one channel, one non-destructive workflow, the guardrail engine, and the staged rollout - prove that a non-technical user's workflow genuinely can't take an unapproved destructive action, before anyone argues about which LLM plans the steps."*

The lines that carry the round:

1. *"The model decides THAT something should happen. A typed, validated function signature decides HOW - that boundary is where determinism lives."*
2. *"Autonomous status raises the ceiling on what can skip approval. It never removes the ceiling."*
3. *"One execution loop, not two - resume and a fresh run share the exact same code path."*
4. *"An idempotency key is on the action, not the run - because a run can legitimately retry, but one specific side effect must never apply twice."*
5. *"Priority answers which workflow SHOULD run. A lock answers whether two ever CAN run at once."*
6. *"A halted run with a named reason beats a workflow that loops until someone notices."*

Questions to ask them: how much of their agent configuration is already declarative versus code? Does the guardrail decision live in the platform or in each connector? What is the story for a workflow that acts across two channels in one run? How does a workflow earn autonomous status?

With a laptop, run `python scripts/run_workflow_demo.py`, then `python scripts/demo_guardrail_failure.py`, then `pytest -q` for 21 deterministic tests. The durability demo is the most persuasive artefact. A run crashes mid-flight and resumes, and the completed step provably never re-runs.

## 15. Stop Runaway Automations Before the Invoice Does

The interviewer's cost pivot is "users built automations and the bill exploded." Non-technical users will build loops. The platform bounds them, because the users cannot.

| | |
|---|---|
| Dominant driver | Retries and loops in user-authored automations, with no budget owner per tenant |
| Cheapest lever first | Per-automation step and token caps; per-tenant budgets with a circuit breaker; idempotency keys on every action; deterministic events instead of free-text triggers |
| Metric that proves it | Cost per automation run; steps per run; runaway kills per day; cost per tenant |
| Do not | Trust users to write bounded workflows |
| 60-second line | Non-technical users will build loops. The platform bounds them: caps per run, a budget per tenant, idempotent actions, and a breaker that trips before the invoice does. |

Most of the levers are already in the design, which is the point to make aloud *(own construction)*. The step budget is the per-run cap, and `max_steps` is the tighter of workflow and tenant. The spend cap already meters real dollars before the action, not after. The idempotency key already stops a redelivered event paying twice for the same work. The per-tenant breaker and token metering are the additions. Meter model tokens per run into `total_cost_usd` alongside tool cost, and trip the tenant's breaker when the day's spend crosses its budget.

Bug 2 belongs in this answer too. Cost accounting is a side effect, so a replayed step must not be billed twice.

Every strong cost answer is generated by four verbs in order. Measure cost per run and per tenant first. Route deterministic events to deterministic handling, and use a model only where judgement is needed. Bound runs with step caps, spend caps and the breaker. Cache safely, never across tenants.

---

## Level calibration

Anyone can wire a model to a tool; the level shows in how much of the dangerous decision is code, and how far its owner looks past one tenant.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Canonical events per channel, priority plus an entity lock, a versioned spec walked by one checkpointed loop, typed arguments and an idempotency key on the action. Refuses the $500 refund under a $50 cap rather than clamping it. | Who may promote a workflow, how a non-technical author reviews what will run, and what stops a tenant's runaway bill. |
| Staff | Adds separation of duties and the author's view: promotion one stage at a time by someone other than the author, shadow mode to try a workflow, plain-language run history, and per-tenant budgets with a breaker. Tells both real bugs, including idempotency that must cover cost accounting. | How the same decision shape serves other products, and what changes when a real planner or a natural-language compiler joins. |
| Principal | Names `Decision(allowed, rule, reason)` with deny overriding as the one policy shape across access control, delivery gates and workflow guardrails. Sequences the path: one channel and one non-destructive workflow first, any future planner or compiler landing in `DRAFT` behind the same `promote()` gate, and in-process stores moving to a distributed lock and a shared idempotency store. | Which destructive tools each tenant will allow-list and how much autonomy it will grant, which depends on that customer's risk appetite. |

## Key Takeaways

- The hard part is trust, not tool selection, and the framing sentence goes on the board in the first two minutes.
- One $500 refund against a $50 cap, on an autonomous workflow without an allow-list entry, anchors every later claim.
- Requirements are stated as testable guarantees, and each has a named owner in the architecture.
- One diagram shows adapters, two-check routing, a checkpointed orchestrator and a guardrail on every step, with three named exits.
- Every channel is translated once at the edge into a six-field canonical event.
- Priority answers which workflow should run, and the entity lock answers whether two can run at once.
- The workflow is declarative data the orchestrator walks, and the model fills only typed, validated values.
- The checkpoint is `next_step_index`, and resume and a fresh run share one loop.
- The idempotency key is on the action, and the replay check runs before authorisation because cost is a side effect too.
- Five ordered deny rules decide every step, and autonomy raises the ceiling without removing it.
- Four rollout gates each answer one question, and only someone other than the author may promote.
- The no-LLM choice and the in-process stores are named gaps with sized fixes, not hidden ones.
- Cascade Robotics is the anchor in prose, adding the three-layer map, the fixture and the shared decision shape.
- The hour goes to determinism, the guardrail and durability, and the close is a week-one plan.
- The cost pivot is answered with caps per run, budgets per tenant, idempotent actions and a breaker.

## Check Yourself

1. **Why is "the hard part is trust" a stronger framing than "the hard part is tool selection"?** Tool calling is a standard API feature; the tested question is how a non-programmer can trust an automation to do only what they meant under model error, retries and crashes.
2. **Why did Cascade Robotics' $500 refund not fire on an autonomous workflow?** `issue_refund` was not on the tenant's autonomous allow-list, and $500 exceeded the $50 spend cap. It was refused, not clamped.
3. **Why does routing need both priority and an entity lock?** Priority is configuration, choosing which workflow should win. The lock is safety, stopping two runs mutating one entity, and it holds even when priority is misconfigured.
4. **What does the model decide, and what does it never decide?** It may decide that an action is warranted and which value fills an argument. It never decides the call's shape or the control flow, which are a typed schema and a fixed step list.
5. **Why must `resume()` and `run_workflow()` share one loop?** A separate recovery path is second code whose bugs surface only in incidents; one loop starting at `next_step_index` is exercised on every run.
6. **Why is the idempotency key on the action rather than the run?** A run legitimately retries; keying `{run_id}:{step_name}` deduplicates the specific side effect while letting the loop rerun.
7. **Explain bug 2 in one sentence.** A replayed refund skipped the side effect but was still charged against the spend cap, so the idempotency check moved before authorisation because cost accounting is a side effect too.
8. **Give an example that trips the step budget but not the spend cap, and one that does the reverse.** A 30-step chain of cheap steps halts at a 5-step cap; a single $500 refund trips a $50 cap on step one.
9. **What question does each rollout gate answer?** DRAFT: wired correctly? TESTING: correct on realistic data? SHADOW: correct decisions on live traffic, writes mocked? LIVE: will a human vouch for each action? Then AUTONOMOUS.
10. **What is the scale gap, and why does it not change the design?** Locks and idempotency keys live in in-process dicts; they move to a distributed lock and a durable shared store behind the same functions.
11. **How do non-technical users run up a bill, and what stops it?** They build loops and retries; per-run step and token caps, per-tenant budgets with a breaker, and idempotent actions bound it.

## References

### Fact-check sources (checked 27 Sep 2026)

- [Redis docs: Distributed locks with Redis](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/) — Redis lock patterns and their limits
- [Kleppmann: How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) — a lease lock needs a fencing token to be safe
- [Slack docs: Events API](https://docs.slack.dev/apis/events-api/) — failed event deliveries are retried, so redelivery is normal
- [Stripe API reference: Idempotent requests](https://docs.stripe.com/api/idempotent_requests) — passing an idempotency key to a provider that supports it
- [OpenAI: Function calling and other API updates](https://openai.com/index/function-calling-and-other-api-updates/) — function calling shipped in the API in June 2023

