# Rolling Out With a Way Back

*Launching to everyone at once is the fastest route to value, but a rollout without chosen first users and a tested way back turns the first real failure into an incident.*

Shipping is not the finish line; delivery is the result the system produces in real use. That result starts with a deliberate rollout and continues as a loop that turns production failures into planned work.

**Objectives:**

- answer the five questions every launch needs before it starts;
- run the ship, observe, learn, prioritise, improve loop after launch;
- classify a production failure before choosing a fix.

---

## Answer Five Questions Before Launch

Before any user sees the feature, settle five things. Who gets it first? Can it be turned on and off with a feature flag? Which numbers will be watched? Which conditions trigger a rollback? Who is on hand if it fails?

Each answer limits the cost of being wrong. A small first group limits who is affected. A flag limits how long they are affected. Named numbers and rollback triggers turn "it feels off" into a decision someone can make in minutes. A named responder means the decision gets made.

The two-week delivery framework builds the same caution into its stages. Shadow mode runs on real traffic without acting, and limited production acts only with a human approving and a rollback that has been tested. See [Delivery as a Repeatable Process](/learn/forward-deployed/delivery-stages-and-gates/delivery-as-a-repeatable-process).

> **Warning: a rollback that was documented but never exercised is a hope, not a plan.** Test the way back before the first real user depends on it.

## Expect Production to Prove the Plan Wrong

Real use will show parts of the original plan were wrong. That is normal, and it is why delivery continues after launch as a loop: ship, observe, learn, prioritise, improve.

The loop only works if failures become planned work rather than firefights. Each important failure should become a scheduled fix and, where it involves AI behaviour, a new test case, so the same failure is caught next time.

## Classify the Failure Before Fixing It

A failure report rarely names its cause. Before choosing a fix, sort it into one of eight kinds: product design, code, data, operations, search and retrieval, AI behaviour, documentation, or user training.

The classification decides who acts. A retrieval failure goes to the data and indexing work. A training failure goes to onboarding, and no code change will fix it. Fixing the wrong layer spends effort and leaves the failure in place.

## Worked Example: Launching a Support Assistant to 25 Agents

A support-assistant pilot is ready. Answer the five questions. First users: 25 support agents. Switch: a feature flag per agent. Numbers: median resolution time and the escalation rate. Rollback trigger: escalations rising more than a set margin above normal. On hand: the delivery lead and one support supervisor.

In the first weeks, the most common failure is an answer built on an outdated policy document. Classify it: search and retrieval, specifically stale knowledge, not AI behaviour. The planned work is an automatic knowledge refresh plus tests for lookup quality, not a prompt change. The loop turned a recurring complaint into a fix at the right layer.

---

## Key Takeaways

- Before launch, decide the first users, the feature flag, the watched numbers, the rollback triggers and the responder.
- Production will prove parts of the plan wrong; run the ship, observe, learn, prioritise, improve loop.
- Classify each failure into one of eight kinds before fixing it, so the fix lands on the right layer.

## Check Yourself

<details>
<summary>1. Name the five questions to answer before a launch.</summary>

Who goes first, whether a feature flag can switch it, which numbers are watched, what triggers a rollback, and who is on hand.

</details>

<details>
<summary>2. Why classify a failure before fixing it?</summary>

The class decides which layer and which team acts. A training or documentation failure is not fixed by changing code or prompts.

</details>

<details>
<summary>3. Answers cite an outdated policy. Is that an AI behaviour problem?</summary>

No. It is a search and retrieval problem, stale knowledge, fixed by refreshing the knowledge base and testing lookup quality.

</details>

