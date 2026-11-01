# Practise Agentic Workflow Platform Interview Questions

*A platform answer that describes the model in detail still fails if it never says what stops a refund firing twice or firing without authority.*

Interviewers rarely ask how the model picks a tool; they ask what happens on a retry, a restart, or an oversized refund. Answer each prompt below out loud first, then compare with the outline and reread the lesson it points to.

**Objectives:**

- answer the common agent-platform prompts in under a minute each;
- lead every answer with the layer and the mechanism, not the model;
- work through a full approvals design against a checklist.

---

## Lead With the Layer, Then the Mechanism

Most agent-platform questions share a skeleton. Say which layer the question lives in: canonical events, durability, or guardrails. Name the mechanism that answers it. Then say the negative case it refuses, and how that refusal is proven. An answer without a refusal cannot be checked. "The model would know not to refund twice" tells the interviewer nothing about what happens on the retry.

## Practise the Framing Questions

**1. "Restate the problem in one breath."**
We are building the safety and orchestration layer between a non-technical user's plain-English intent and a real, destructive action. Whichever channel triggered it, the action runs only when it should, runs exactly once, and survives crashes and retries. → [Why Workflow Automation Is a Trust Problem](/learn/production-ai/agentic-workflow-platforms/why-workflow-automation-is-a-trust-problem)

**2. "What is the hard part?"**
Trust, not tool selection. A non-programmer configured a button that moves real money, in English they cannot review as code. Name the three layers, then spend the time on durability and guardrails, where double refunds and skipped approvals happen. → [Why Workflow Automation Is a Trust Problem](/learn/production-ai/agentic-workflow-platforms/why-workflow-automation-is-a-trust-problem)

**3. "How does a user test a workflow before it is live, and how do you stop a bad one mid-flight?"**
One mechanism answers both. Staged rollout gives shadow mode, where every destructive step is blocked unconditionally while the workflow watches live traffic. Hard step and spend budgets halt a running workflow rather than letting it loop, and the entity lock stops a second run compounding the damage. → [Staged Rollout](/learn/production-ai/agentic-workflow-platforms/staged-rollout)

## Practise the Channel and Routing Questions

**4. "How do you support five channels without five copies of the logic?"**
Translate once, at the edge. One adapter per channel produces a canonical event with channel, event type, tenant, target entity, payload, and a raw reference. Nothing downstream knows about channels, so a new channel is one adapter. → [Canonical Events and Routing](/learn/production-ai/agentic-workflow-platforms/canonical-events-and-routing)

**5. "Two workflows conflict on one event. What happens?"**
Routing matches only live workflows and picks the highest priority, a design-time choice. An entity lock then refuses a second concurrent run on the same target, a run-time safety property. The lock holds even if priority is misconfigured. When nothing runs, routing returns a named reason. → [Canonical Events and Routing](/learn/production-ai/agentic-workflow-platforms/canonical-events-and-routing)

## Practise the Determinism Questions

**6. "Where does the model have latitude, and where does it not?"**
It may choose which value goes into a typed, schema-validated argument. It never improvises the control flow. The orchestrator walks a declarative step list, so a user reviews a form rather than trusting a black box. → [Determinism Over Free Text](/learn/production-ai/agentic-workflow-platforms/determinism-over-free-text)

**7. "How would a user author a workflow in plain English?"**
Generate a candidate spec from the description and show it for confirmation before it is published. The confirmation half is nearly free: promotion already gates every status change behind a human, so a generated spec enters as a draft through the same gate. The generation half is model-integration work the project deliberately left out. → [Determinism Over Free Text](/learn/production-ai/agentic-workflow-platforms/determinism-over-free-text)

**8. "How do you safely add a custom tool, and version a live workflow?"**
A custom tool gets a schema, required fields, a destructive flag, and scopes. Sandboxed execution and review-before-publish are not built; reuse the role-gated promotion pattern for tools. For versions, keep every one and pin each run to the version it started on. Gradual migration needs a traffic split consulted by routing. → [Staged Rollout](/learn/production-ai/agentic-workflow-platforms/staged-rollout)

## Practise the Durability Questions

**9. "The orchestrator restarts two hours into a workflow. What happens?"**
The run's `next_step_index` is the checkpoint. Resume continues from it, never from step 0. Resume and a fresh run share one loop, so there is no separate recovery path with its own bugs. The project demonstrates this by crashing a run mid-way. → [Durability and Idempotency](/learn/production-ai/agentic-workflow-platforms/durability-and-idempotency)

**10. "A refund step is retried. Is the customer refunded twice?"**
No. The idempotency key is on the action, `{run_id}:{step_name}`, not on the run, so a retried loop is fine and a retried side effect is a no-op. The replay check runs before authorisation and before cost accounting, because cost is a side effect too. → [Durability and Idempotency](/learn/production-ai/agentic-workflow-platforms/durability-and-idempotency)

**11. "This runs in one process. What changes at scale?"**
The lock and key stores are correct in shape and wrong in storage. Use a distributed lock, a database row with a unique constraint or a Redis lease checked with a fencing token. Use a durable idempotency-key store shared across workers. The mechanism stays the same, behind the same thin functions. → [Durability and Idempotency](/learn/production-ai/agentic-workflow-platforms/durability-and-idempotency)

## Practise the Guardrail Questions

**12. "What stops an autonomous workflow doing damage?"**
Every step passes one decision: step budget, spend cap on the real amount, shadow block, live check, then an autonomous allow-list match or a role-checked human approval. Autonomy widens which tools skip approval; it never removes the cap. → [Approvals and Spend Caps](/learn/production-ai/agentic-workflow-platforms/approvals-and-spend-caps)

**13. "Why four rollout gates, and who may promote?"**
Each gate removes one doubt: wired right, behaves on realistic data, decides right on live data, and a human still vouches for each action. Only an approver or admin promotes, one stage at a time, never the author. → [Staged Rollout](/learn/production-ai/agentic-workflow-platforms/staged-rollout)

**14. "How do you prove the guardrails are real?"**
Show things being stopped, not things working. The negative-control demo denies a wrong-role promotion, a skipped stage, a mistyped argument, a draft firing, an oversized refund, a runaway step count, and a concurrent run. → [Approvals and Spend Caps](/learn/production-ai/agentic-workflow-platforms/approvals-and-spend-caps)

## Worked Example: Design an Approvals Workflow

This is the module's interview probe. Work it as a sequence of decisions.

**Clarify the intent.** A support manager wants small refunds automatic and large ones checked. Restate it: refunds under the tenant's cap may eventually run alone; anything else needs a person.

**Shape the input.** Every channel goes through an adapter into a canonical event. Routing matches the live refund workflow and takes a lock on the ticket, so two runs cannot refund it at once.

**Make the workflow data.** The spec is fixed: draft a reply, then issue a refund. The refund's amount is a typed template from the event, validated before execution. `issue_refund` is declared destructive at registration.

**Gate every step.** `authorize_step` runs the step budget and the spend cap on the real dollar amount, refusing rather than clamping. It then runs the shadow block and the live check. A destructive step runs only if the tenant allow-lists it for autonomous use, or an approver signs. The tenant's cap wins over a looser workflow cap.

**Survive retries and restarts.** The checkpoint is `next_step_index`, and a paused run resumes through the same loop when the approver signs. Each refund carries a key on the action, checked before authorisation and before cost.

**Roll it out.** Draft, testing, shadow, live, autonomous, one stage at a time, promoted by someone who is not the author.

**Name the gaps.** No authoring surface, no automatic resume, in-process stores, and no plain-language run history. Each has a stated fix.

The answer never mentions how clever the model is. Every guarantee came from a component that refuses something, which is exactly what the question was probing.

> **Warning: do not describe a demo as proof of more than it proves.** The source project has no model in the loop and in-process stores. Say what is tested, including the negative cases, and say what a real deployment would add.

## Practise by Building

Rebuild the loop from memory: one step, one checkpoint, one key per action, and one guardrail decision. Then add the negative-control tests before the happy path: a refused oversized refund, a duplicate retry, a crash and resume, and an author trying to promote their own workflow. If each test fails for the reason you expect, the design holds.

---

## Key Takeaways

- Lead every answer with the layer and the mechanism, then the case it refuses and how that is proven.
- Framing questions are answered by "the hard part is trust" and three layers, with time spent on durability and guardrails.
- Channel and routing questions are answered by adapters at the edge plus priority and a lock.
- Determinism questions are answered by a declarative step list and typed arguments, with authoring as a named gap.
- Durability questions are answered by one integer checkpoint, one loop, and a key on the action checked before cost.
- Guardrail questions are answered by one per-step decision, autonomy under the cap, four gates, and negative-control evidence.
- A full approvals design walks from intent to gaps without depending on the model at all.

## Check Yourself

<details>
<summary>1. An interviewer asks, "What if the network retries the refund?" What is your one-sentence answer?</summary>

The idempotency key is on the action, run plus step, so the retry is a no-op, and the replay check runs before authorisation and cost so the budget is not charged again.

</details>

<details>
<summary>2. What one mechanism answers both "how do we test before live" and "how do we stop a bad run"?</summary>

Staged rollout with hard step and spend budgets: shadow mode dry-runs on live traffic, and the budgets halt a running workflow instead of letting it loop.

</details>

<details>
<summary>3. Name two gaps you would volunteer when describing the source project.</summary>

Any two of: no authoring surface, the planner is a fixed step list, nothing calls resume automatically, the lock and key stores are in-process, and run history is not in plain language.

</details>

