# Why Workflow Automation Is a Trust Problem

*A non-programmer wants to hand the system a button that moves real money, and the platform must make that button safe without asking them to read a line of code.*

An agent platform is not hard because a model has to pick a tool; that was solved years ago. Spend the design on trust, and read [Canonical Events and Routing](/learn/production-ai/agentic-workflow-platforms/canonical-events-and-routing) for the first of the three layers that deliver it.

**Objectives:**

- restate the agent-platform prompt in plain words, phrase by phrase;
- name the three layers of a strong answer and the incident each prevents;
- list the six guarantees behind a "refund anything under $50" automation.

---

## Translate the Prompt Into One Sentence

The prompt reads: *"Design an AI agent platform for non-technical users to configure workflow automations across multiple channels."* Many candidates hear "AI agent platform" and start drawing a model choosing tools. That spends forty minutes on the wrong thing.

Translated into normal words, the ask is this. A support manager who cannot code says, "When a customer emails asking for a refund under $50, just refund them automatically." The system then does exactly that, safely, whether the request came by email, Slack, chat, or a web form. Everything else in the design is how to make that safe and reliable.

Four phrases carry the prompt.

| Phrase in the prompt | What it really means |
|---|---|
| "AI agent" | Something that looks at an event and takes an action, such as reply, refund, escalate, or tag, rather than just answering a question |
| "platform" | Many tenants, each defining many workflows, not one workflow |
| "for non-technical users to configure" | The author cannot write code, cannot read a stack trace, and should not need to |
| "across multiple channels" | The same automation works from email, Slack, a chat widget, a web form, or a raw webhook, each shaped differently on the wire |

## Name the Hard Part: Trust

The platform hands a non-programmer a button that can refund real money, email a real customer, or close a real ticket. They configured it in plain English, not in code they can review line by line. So the real question is how someone who cannot read code can trust the automation to do only what they meant. It must hold even when the model is wrong, the network retries, or the server crashes mid-run.

That is a systems and safety problem wearing an AI costume. The source project makes the point bluntly: it contains no LLM, or large language model, at all. Its "agent reasoning loop" is a fixed, deterministic step sequence. Every property can therefore be proven with fast, reproducible tests, including the negative cases. What that choice costs is covered in [Determinism Over Free Text](/learn/production-ai/agentic-workflow-platforms/determinism-over-free-text).

## Cover Three Layers, and Spend Time on the Top Two

Every good answer covers three layers. Each asks one question.

| Layer | Question | Mechanism |
|---|---|---|
| 3 | Is this user allowed to configure or run this, and did we ask a human when we should have? | Guardrails: approvals, spend caps, and staged rollout |
| 2 | If this runs twice by accident, through a retry, crash, or redelivery, does it break something? | Idempotency keys and checkpointed, resumable execution |
| 1 | Whichever channel this came from, does it look the same to everything downstream? | A canonical event schema and one adapter per channel |

A weak answer talks about Layer 1 and waves at a model doing "reasoning". A strong answer spends most of its time on Layers 2 and 3. That is where real incidents happen: double refunds, an autonomous workflow that skipped a required human check, and a crash that re-runs a completed step.

> **Warning: do not lead with the model.** A design that opens on prompt engineering and tool selection leaves no time for the parts an interviewer is testing. Name the trust problem first, then the three layers, then go deep on Layers 2 and 3.

## Worked Example: The Six Silent Guarantees Behind a $50 Refund

The user's request, in their own words: "If a customer messages us anywhere asking for a refund and it's under $50, just refund them. Don't bother me for small stuff."

The platform must silently guarantee six things.

1. Whether the message arrived by email, Slack DM, or the website widget, it is normalised into one internal shape before any decision. That is the channel adapters.
2. The workflow fires only for messages about refunds, and if two workflows could match, exactly one wins, deterministically. That is routing.
3. Before it could auto-refund anyone, the workflow went through `draft → test → shadow → live`, and someone with authority approved it going live. That is staged rollout.
4. "Under $50" is enforced as a real spend-cap check at execution time, not typed into an English prompt and trusted. That is the guardrails.
5. If the refund call is retried, through a flaky network or a duplicate webhook, the customer is refunded once, not twice. That is idempotency.
6. If the server restarts mid-run, the run resumes where it left off rather than restarting and risking a second refund. That is durable, checkpointed execution.

Every guarantee is a component in the architecture. None requires the user to know what an idempotency key is. That is what "the hard part is trust" means in practice: the user states intent, and six components make the intent safe.

## Answer the Cascade Robotics Question

The project's scenario is a support tenant, Cascade Robotics, with a ticket-triage workflow: draft a reply, then issue a refund. The question that drives its demo is: *"Why didn't Cascade Robotics' $500 refund fire automatically?"*

| Question | What actually happened | Layer |
|---|---|---|
| Wasn't the workflow autonomous? | Yes, but `issue_refund` was not allow-listed for autonomous use on this tenant, so it still needed a human | 3 |
| Wasn't there budget? | The tenant's spend cap is $50. A $500 refund is refused outright as `spend_cap_exceeded`, never silently clamped to the cap | 3 |
| What if it retries and refunds twice? | It cannot. The idempotency key for that action exists after the first apply, so a retry is a no-op | 2 |

Each answer is a test in the project. [Approvals and Spend Caps](/learn/production-ai/agentic-workflow-platforms/approvals-and-spend-caps) and [Durability and Idempotency](/learn/production-ai/agentic-workflow-platforms/durability-and-idempotency) build them.

## Reuse One Decision Shape Across Policy Problems

The FDE Handbook's RAG platform, this agent platform, and its delivery framework share one shape on purpose. A named policy returns a `Decision(allowed, rule, reason)`, and deny overrides allow.

| Here | In the delivery framework | In enterprise RAG |
|---|---|---|
| The step guardrail, `authorize_step` | The delivery sign-off gate | The access-control policy decision |
| Staged workflow rollout, `promote` | The staged engagement pipeline | The pre-filter followed by an authoritative re-check |
| The entity lock in routing | One mutable state per engagement | Per-tenant collection isolation |
| The run trace | The delivery trace | The RAG run trace |

The point, stated once for all three: access control, delivery gates, and workflow guardrails are the same kind of problem in three hats. A named rule decides, deny overrides, and the reason is never "because I said so".

## Expect Follow-Ups on Testing and Containment

Interviewers rarely probe the happy path. Expect two questions: how does a user try a workflow before it is live, and how do you stop a bad one mid-flight? One mechanism answers both: staged rollout plus a hard step and spend budget. They are not two separate features. [Staged Rollout](/learn/production-ai/agentic-workflow-platforms/staged-rollout) covers the first half.

---

## Key Takeaways

- The prompt, in plain words, is a non-programmer saying "refund anything under $50" and the system doing exactly that from any channel.
- The hard part is trust, not tool selection; the source project proves this by containing no LLM at all.
- Three layers cover the answer, and real incidents live in Layers 2 and 3: retries, crashes, and missed human checks.
- A single automation hides six guarantees, each owned by a component: adapters, routing, staged rollout, spend caps, idempotency, and checkpointing.
- The Cascade Robotics $500 refund was stopped twice by guardrails and could never apply twice because of idempotency.
- Access control, delivery gates, and workflow guardrails share one decision shape: a named rule, deny overrides, and a stated reason.
- Testing before live and stopping a bad run are answered by one mechanism, staged rollout plus hard budgets.

## Check Yourself

<details>
<summary>1. Restate the agent-platform prompt in one breath.</summary>

We are building the safety and orchestration layer between a non-technical user's plain-English intent and a real, destructive action. Whichever channel triggered it, the action runs only when it should, runs exactly once, and survives crashes and retries without surprising anyone.

</details>

<details>
<summary>2. Name the three layers and the incident each prevents.</summary>

Layer 1, canonical events and adapters, stops channel-specific logic leaking downstream. Layer 2, idempotency and checkpointing, stops double refunds and re-run steps. Layer 3, approvals, spend caps, and staged rollout, stops an action running without the authority it needed.

</details>

<details>
<summary>3. Why did Cascade Robotics' $500 refund not fire automatically, and why could it never fire twice?</summary>

`issue_refund` was not on the tenant's autonomous allow-list, and $500 exceeded the $50 spend cap, which refuses rather than clamps. A retry is a no-op because the idempotency key for that action already exists.

</details>

