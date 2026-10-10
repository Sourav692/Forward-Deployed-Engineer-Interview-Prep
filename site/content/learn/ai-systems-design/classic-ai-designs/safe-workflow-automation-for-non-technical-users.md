# Safe Workflow Automation for Non-Technical Users

*Letting non-technical users configure automations that take real actions widens who can build, while every dangerous decision must stay deterministic and out of the model's hands.*

◷ 12 min

Wiring an LLM to a tool call is easy; letting someone who has never seen a stack trace configure it safely is not. Make the system take the dangerous decisions itself, in code, and pace the round with [the six-step whiteboard clock](/learn/ai-systems-design/sixty-minute-whiteboard/the-six-step-whiteboard-clock).

**Objectives:**

- frame the round on deterministic control rather than model judgement;
- route events with two independent checks, priority and an entity lock;
- validate typed tool calls and order guardrail rules so deny overrides;
- make runs durable and side effects idempotent, including their cost;
- name the failure behaviour and the honest scale limits.

---

## Frame the Round on Who Decides

The prompt is "Design an AI agent platform for non-technical users to configure workflow automations across multiple channels." Say one sentence early. Anyone can wire an LLM to a tool call. The hard part is letting a non-technical person configure that safely. So the system must make the dangerous decisions itself, deterministically, and never delegate them to the model's judgement in the moment.

Five clarifying questions change the design. How non-technical are the users? Someone who reads a decision tree differs from someone who cannot read JSON, and that decides whether natural-language authoring is the whole product. Which channels, and who owns each integration? Slack and webhooks are usually simple; email threading and web-form deduplication hide the real work.

Can it act, or only read? Write actions such as refunds and closing tickets turn this into a guardrail problem instead of a UI problem. What is the blast radius of a bad workflow? A wrong Slack reply is embarrassing; a wrong refund is money. Is it multi-tenant from day one? That decides whether isolation is a retrofit or load-bearing.

Then scope explicitly. Design a multi-tenant platform where users configure declarative workflows, never code, that can take real destructive actions under a guardrail service. The visual builder UI and a natural-language-to-spec compiler are separate projects. Name what they must produce and move on.

## Anchor on a Refund Cap

The anchor case is Cascade Robotics: Tier-1 support triage across a Zendesk webhook and a Slack escalation channel. A high-priority ticket gets a drafted reply. A billing complaint gets an automatic refund up to a tenant-configured cap, and above the cap a human approves.

The cap is not a nice-to-have. It is the difference between "the agent acts autonomously" and "the agent acts autonomously until a mistake would cost real money, then stops and asks".

Write the nouns: event, channel, versioned workflow spec, trigger, step, tool, run, guardrail and principal. Then narrate one event. A ticket webhook arrives, and a channel adapter normalises it into a canonical event. Routing finds the highest-priority live workflow for it and checks that no other run is active on that ticket. The orchestrator runs steps one at a time, checkpointing after each.

A non-destructive step, such as drafting a reply, just runs. A destructive one, such as a refund, goes through the guardrail. Is the workflow live enough to act? Is this tool allow-listed for autonomous use? Is a human needed? Does it fit the spend cap? If it passes, it executes with an idempotency key, so a retry can never double-refund. Every decision, allowed or denied, is logged.

## Route With Two Independent Checks

```
  raw payload (any channel) --> ADAPTER --> canonical Event
                                                  |
                                                  v
                              ROUTING
                              1. priority match     <- design-time: which SHOULD run
                              2. entity lock check  <- run-time: can TWO ever run
                                                  |
                                                  v
                    ORCHESTRATOR (durable, checkpointed)
                    step -> validate args -> guardrail
                    -> execute (idempotent) -> checkpoint
                                                  |
                         COMPLETED / PAUSED_FOR_APPROVAL / HALTED
```

Routing is two checks on purpose. Priority answers a configuration question: which workflow is supposed to win. The entity lock answers a safety question: can two workflows ever mutate the same ticket at once. The lock holds even if priority was misconfigured, which turns a wrong priority into merely wrong instead of dangerous.

The checkpoint is one mechanism for both fresh runs and crash recovery. There is no separate recovery path with its own bugs. `next_step_index` is the single source of truth for where a run is.

## Type the Call So the Model Never Shapes It

Announce the risk. The hardest part is making dangerous decisions deterministic instead of delegated to the model, so spend the time on the guardrail engine and the orchestrator. The channel adapters are comparatively boring.

Constrain the tool call with a schema, not a prompt. A free-text call such as "issue a refund of about fifty dollars for this order" is bad. A typed signature, `issue_refund(order_id: str, amount_usd: float)`, is good. `validate_args()` checks every required field is present and every value's type matches before execution. A malformed call never reaches the tool.

The model decides that a refund is warranted. It never decides the shape of the call that moves money. This is the instinct of constrained decoding, applied at the tool-call boundary instead of the token boundary.

## Order the Guardrail Rules So Deny Wins

The script introduces its guardrail as "five ordered rules, deny overrides", but then lists seven. The seven are the full set.

| # | Rule | Outcome |
|---|---|---|
| 1 | Step budget exceeded? | Halt; do not loop |
| 2 | Spend cap exceeded? | Halt; do not loop. Uses the real dollar amount for a refund |
| 3 | Non-destructive? | Run it |
| 4 | Shadow mode? | Never executes, regardless of anything else |
| 5 | Below live status? | Destructive steps disabled entirely |
| 6 | Autonomous and allow-listed? | Auto-approved |
| 7 | Otherwise | Needs a real human with the right role |

Autonomous status raises the ceiling on which actions can skip approval. It never removes the ceiling. A destructive tool not explicitly allow-listed still needs a human on a fully autonomous workflow, and the spend cap applies at every status.

Rules 1 and 2 are not two severities of one check; they count different things. The step budget counts how many steps a run has taken, so it catches a run looping forever however cheap each step is. The spend cap counts the dollars one step is about to spend, so it catches one expensive action however few steps came first. A run can break one without touching the other.

## Count the Real Money, Not a Nominal Fee

The reference build found a bug worth telling. A $500 refund on a workflow with a $5 spend cap passed authorisation. Every tool shared one cost function that charged a flat, nominal fee per call. That suits drafting a reply, which spends no real money. But the refund used the same flat fee, so the cap checked against a few cents every time, whatever the refund's size.

Two quantities were conflated: the operational cost of running a step, and the dollars the step spends on the customer's behalf. A cap cannot limit money it never measures. The fix makes a financial tool's cost the real amount in its own arguments. It is the same family of bug as the false leak alarm in [Access-Controlled Enterprise RAG](/learn/ai-systems-design/classic-ai-designs/access-controlled-enterprise-rag): a check that looks protective but measures the wrong quantity.

> **Warning: idempotency must cover every effect of a step, including its cost.** The reference build's second bug came from a redelivered refund event. The idempotency guard correctly skipped the second refund, but the retry still went through the budget check and added its cost again. A safe, blocked retry then pushed a legitimate run over its cap. Check "has this exact action already applied?" before authorisation, and treat a replay as a free, pre-authorised no-op.

## Make Runs Durable and Retries Harmless

```
  Run 1: step 0 (draft) -> CHECKPOINT -> step 1 (refund, needs approval) -> PAUSED

  [process restarts / human takes an hour to approve]

  resume(): reads next_step_index=1, re-enters at step 1 - step 0 NEVER re-runs.
  Approval granted -> step 1 executes -> idempotency_key = "run_id:refund" recorded.

  If step 1 is attempted again (a redelivered event, a retry):
  same idempotency_key already exists -> no-op. The refund never fires twice.
```

There is no separate crash-recovery path. `resume()` and a fresh run call the same loop, which always starts at `next_step_index`, whether that is 0 or mid-workflow. One loop means one set of bugs to find, not two.

The idempotency key belongs to the action, not the run. A run can legitimately retry, but one specific side effect must never apply twice.

## Raise Tenancy, Security, and Failure Unprompted

Every event, workflow and policy carries a `tenant_id`, and guardrail caps are per tenant. Routing only ever matches a tenant's own workflows against its own events.

Every tool call is typed and scoped. A tool's `scopes` list is what a real deployment would check against the connector credential in use: least privilege, not an agent with admin on everything. Destructive versus non-destructive is a first-class flag on the tool, not inferred. A guardrail cannot reason about risk it is not told about.

Name the honest gaps. There is no real secrets vault for connector credentials yet. There is no PII redaction on step outputs before a human sees them for approval, though the RAG design's `redact_pii()` could be reused directly. Every guardrail decision, allowed or denied and why, lands on the run's event log as it happens, so each run is a replayable record.

| Fails | Behaviour |
|---|---|
| A step's arguments do not validate | Rejected before execution; the run halts with a named reason |
| A destructive step's approval never comes | The run stays `PAUSED_FOR_APPROVAL` indefinitely; it never silently expires into either action |
| A workflow runs away through a self-trigger | Halts at the step budget instead of looping until noticed |
| The process crashes mid-run | Resumes from the last checkpoint; a step that already ran never re-runs |
| An event is redelivered | The idempotency key on any destructive step makes the redelivery a no-op |

Scale has one honest limit. Every lock and idempotency key in the reference build lives in an in-process dictionary: correct in shape, wrong in storage. At real volume, that becomes a distributed lock, such as Redis or a unique-constraint row, plus a durable idempotency store shared across workers. `acquire_lock` and `release_lock` stay the same two functions; only their backing changes.

## Close on Determinism and a Narrow Week One

Summarise in three sentences. Every dangerous decision is deterministic and enforced in code, never delegated to the model: which workflow runs, whether a destructive step executes, and whether a retry can double-apply. Workflows are declarative and versioned, and promoted through a staged rollout the way a person earns autonomy. Durability and idempotency make a crash or a redelivered event a non-event.

| Decision | Chose | Would revisit if |
|---|---|---|
| A fixed step-list planner over an LLM reasoning loop | Deterministic, testable, free | The task space is open-ended enough that a fixed plan cannot cover it; then a model picks the next tool inside the same guardrail |
| Priority plus entity lock over one ranking | Two independent checks | Conflicts became rare enough that the lock is not worth it; unlikely, since the lock makes misconfiguration merely wrong |
| In-process locks and idempotency store | Simple and fast for a demo | Any real deployment on day one |

For the forward-deployed close, week one is not the full agent runtime. It is one channel, one non-destructive workflow, the guardrail engine and the staged rollout. That proves a non-technical user's workflow cannot take an unapproved destructive action, before anyone argues about which LLM plans the steps.

Questions for the interviewer's company: how much agent configuration is already declarative rather than code? Does the guardrail decision live in the platform or in each connector? How is a workflow that acts across two channels in one run handled? How is a workflow judged to have earned autonomous status? The artefact to show is the durability demo, where a run crashes mid-flight, resumes, and the executed step provably never re-runs, backed by 21 deterministic tests with no LLM.

## Worked Example: A $500 Refund on a $5 Cap

A billing complaint arrives through the Zendesk webhook. Routing picks the highest-priority live workflow and takes the entity lock on the ticket. Step 0 drafts a reply: non-destructive, so it runs and checkpoints.

Step 1 proposes `issue_refund(order_id, amount_usd=500)`. The arguments validate. The step budget is fine. The spend cap compares $500, the real amount, against $5 and halts the step with a named reason. Under the buggy cost function, the cap would have seen a few cents and approved it.

Now suppose the tenant raises the cap, the workflow is autonomous, but `issue_refund` is not allow-listed. Rule 7 applies, so the run pauses for a human with the right role. Approval an hour later resumes at step 1, never re-running step 0, and records `run_id:refund`. A redelivered event hits the idempotency check first and becomes a free no-op. No refund repeats, and no cost is counted twice.

| Line that carries the round | Point it makes |
|---|---|
| The model decides that; a typed signature decides how | Where determinism lives |
| Autonomy raises the ceiling, never removes it | Guardrail ordering |
| One execution loop, not two | Durability |
| The idempotency key is on the action, not the run | Safe retries |
| Priority says which should run; the lock says whether two can | Routing |
| A halted run with a named reason beats a silent loop | Failure behaviour |

---

## Key Takeaways

- Frame the round on deterministic control, and ask about users, channels, write actions, blast radius and tenancy.
- Anchor on a refund cap: autonomy up to the point where a mistake costs real money.
- Route with a priority match and an independent entity lock; one checkpointed loop serves fresh and resumed runs.
- Typed, validated tool signatures keep the model from shaping the call that moves money.
- Order the seven guardrail rules so deny wins; budget counts steps and the cap counts dollars.
- A spend cap must measure the real money a step spends, not a nominal fee.
- Resume and fresh runs share one loop; idempotency belongs to the action and must cover cost too.
- Tenant IDs, scoped tools and a destructive flag carry security; failures halt or pause with a named reason.
- Close on determinism, three revisitable trade-offs and a narrow week one.

## Check Yourself

1. **Why are priority and the entity lock separate checks?**
   Priority answers which workflow should run, a configuration question. The lock answers whether two can mutate one ticket at once, a safety question that holds even when priority is misconfigured.

2. **How did a $500 refund pass a $5 spend cap?**
   Every tool shared a flat nominal cost function, so the refund counted as a few cents. A financial tool's cost must be the real amount in its arguments.

3. **Why must the idempotency check run before authorisation?**
   Otherwise a replayed action is skipped but its cost is still counted, and a safe retry can push a run over budget. A replay should be a free, pre-authorised no-op.

