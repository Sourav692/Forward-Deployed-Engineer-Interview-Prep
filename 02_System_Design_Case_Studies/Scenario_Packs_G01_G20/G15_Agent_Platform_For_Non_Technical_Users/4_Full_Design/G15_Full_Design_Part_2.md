# Agent Platform for Non-Technical Users, part 2

## 5. Translate Every Channel Once, at the Edge

Normalise at the first layer and nowhere else. If channel-specific logic leaks past the adapter, every later component must know every channel forever.

The canonical `Event` has six fields, and five carry the design. `channel` and `event_type` are what triggers match on. `tenant_id` scopes everything downstream. `target_entity_id` is what the entity lock keys on. `raw_ref` means normalisation is not destruction: the original is always recoverable for audit. Downstream of the three adapters, nothing knows which channel an event came from except by reading `event.channel`. Adding a sixth channel is one new adapter and zero changes anywhere else.

The Slack adapter shows why adapters are more than field mapping. It classifies `urgent_message` against plain `message` from the raw flag. That is how Cascade Robotics' `wf_slack_escalation` workflow triggers only on urgent messages.

## 6. Route Twice: Priority for Configuration, a Lock for Safety

Routing asks two independent questions, so it runs two independent checks. Priority answers a configuration question: which workflow is *supposed* to win. The entity lock answers a safety question: can two workflows ever mutate the same ticket at once.

Routing runs in three steps. First, match: return every workflow whose tenant, status and trigger fit, where a `Trigger` is `(channel, event_type, priority)`. A `DRAFT` workflow never matches a real event, and that one rule makes authoring safe. Second, prioritise: the highest `priority` wins. Third, lock: `acquire_lock(target_entity_id, run_id)` refuses if another run is active on the same entity. `route()` returns the selected workflow or a named reason, `no_trigger_match` or `entity_locked`. It never returns a silent no-op.

Cascade Robotics' fixture builds the conflict on purpose. `wf_ticket_triage` at priority 10 and `wf_legacy_ticket_tagger` at priority 1 share the trigger `webhook / ticket.created`. The triage workflow wins.

> *"Priority answers which workflow SHOULD run. A lock answers whether two ever CAN run at once — two different questions, two different checks."*

Build only priority, and a configuration mistake becomes a concurrent-mutation bug. Build only the lock, and there is no way to say which workflow should win. The lock holds even when two workflows are accidentally given the same priority.

## 7. Keep Control Flow in Data, and Let the Model Fill Only Typed Values

The prompt tests whether you split deterministic control flow from probabilistic reasoning. The model may decide *that* a refund is warranted. It never decides the shape of the call that moves money.

```
  Bad:   tool_call("issue a refund of about fifty dollars for this order")
  Good:  issue_refund(order_id: str, amount_usd: float)   <- typed, validated BEFORE execution
```

A `WorkflowSpec` is a declarative document: `workflow_id`, `version`, `status`, `triggers`, `steps`, `max_steps`, `max_cost_usd`. Each `Step` names a tool and an `args_template`, such as `{"amount_usd": "{payload.refund_amount}"}`, resolved from the event at execution. The orchestrator does not execute the spec as code; it walks it. Nobody, human or model, changes the list at runtime.

A non-technical user can review that artefact. *"Refund anyone under $50"* becomes a form showing the trigger, the `amount < $50` condition and the `issue_refund` action. The user confirms it before anything runs.

Five determinism controls are all built and tested.

| Control | What it prevents | Where |
|---|---|---|
| Constrained tool schemas over free-text arguments | A hallucinated or wrong-typed argument reaching a real system | `validate_args()`, before execution |
| Idempotency keys on side-effecting calls | A retried step applying its side effect twice | Orchestrator (section 9) |
| Max-step and max-cost budgets, halt and escalate | A runaway run | `authorize_step()`, tighter of workflow and tenant (section 10) |
| Confirmation gates on destructive actions, per tenant and tool | An irreversible action without authority | Guardrail approval plus per-tenant allow-list (section 10) |
| Deterministic control flow split from probabilistic reasoning | The model improvising what happens next | The fixed, declarative step list |

The registry holds four tools: `draft_reply`, `issue_refund`, `close_ticket`, `tag_ticket`. Two are destructive and two are not. `destructive` is declared once at registration, so the guardrail asks "is this one of the tagged ones?" and never "does this call look risky?" A guardrail cannot reason about risk it is not told about explicitly. `scopes` lists what the tool may touch, which is the start of least privilege for connector credentials.

The non-technical half of the problem has five constraints, and the sources say which exist.

| Constraint | In plain language | Built? |
|---|---|---|
| Templates, not a blank canvas | Clone "Auto-refund small orders" and change the numbers | ❌ `clone()` over pre-built specs is the low-effort fix |
| Plain English compiles to a reviewable spec | The sentence becomes a form you confirm | 🟡 The spec is the form; the compiler is not built |
| A test mode where nothing happens | Shadow mode fakes every write | ✅ `SHADOW` blocks every destructive step unconditionally, even for an admin |
| Run history in human words | "Refunded 12, escalated 2, denied 1 for exceeding the cap" | ❌ The trace is structured; a sentence per step is low effort |
| Staged rollout, like a driving test with levels | One stage at a time, and the author cannot grade their own test | ✅ `promote()` |

Versioning follows from the same idea. `WorkflowStore` keeps every published version, and a `Run` pins to the version it started on. Editing a workflow mid-flight never changes runs already in progress.

## 8. Checkpoint Every Step and Run One Loop for Resume

A recovery path that is different code from the normal path gets tested only during incidents, so there is no separate recovery path. One loop always starts wherever `next_step_index` says.

```
  Run 1: step 0 (draft) -> CHECKPOINT -> step 1 (refund, needs approval) -> PAUSED

  [process restarts / human takes an hour to approve]

  resume(): reads next_step_index=1, re-enters at step 1 - step 0 NEVER re-runs.
  Approval granted -> step 1 executes -> idempotency_key = "{tenant_id}:{run_id}:{step_name}:{args_hash}" recorded.

  If step 1 is somehow attempted again (a redelivered event, a retry):
  same idempotency_key already exists -> no-op. The refund never fires twice.
```

The checkpoint is one integer on the `Run`. `resume()` and a fresh `run_workflow()` call the same `_continue()` loop, so the recovery path is exercised on every run. The demo proves it with a real crash. `run_workflow(..., crash_after_step=0)` sets the state to `CRASHED` after the checkpoint is saved, and `resume()` continues from step 1. The external call count shows step 0 never ran again.

A run ends in exactly one of `COMPLETED`, `PAUSED_FOR_APPROVAL` or `HALTED_BUDGET`, plus `CRASHED` as a transient state that `resume()` clears. There is no fourth "it just stopped and nobody knows" path.

The verified happy path, from `scripts/run_workflow_demo.py`: `run_001` on `wf_ticket_triage` v1. Step 0, the draft, is applied at 0.02 USD. Step 1, the refund, is denied without approval and the run pauses. An approver resumes it, the refund applies, and the run completes.

> *"There's no separate crash-recovery code path. `resume()` and a fresh run call the exact same loop — it always starts at `next_step_index`, whether that's 0 or the middle of a long-running workflow. One loop, one set of bugs to find, not two."*

## 9. Key Idempotency on the Action, and Cover Every Side Effect

A run legitimately retries after a transient failure, so a run-level "already started" flag cannot stop one step from firing twice. The key goes on the action: `idempotency_key = f"{tenant_id}:{run_id}:{step_name}:{args_hash}"`. The reference build keyed on `{run_id}:{step_name}` alone; adding the tenant and an arguments hash stops a retry with different arguments, or another tenant's run, from matching. `_apply_side_effect()` returns `True` only the first time a key is seen. Reruns of the loop are fine; reruns of an already-applied side effect are not. The verified result: before retry, 1 apply; after retry, still 1 apply.

Two real bugs from building the project are the strongest material in the round. Tell them as stories.

**Bug 1: the spend cap checked the wrong number.** A $500 refund on a workflow with a $5 spend cap passed authorisation. The cost function charged a flat, nominal fee per tool call, which is fine for drafting a reply. The refund used the same fee, so the cap was checking against the nominal 0.02 USD every time. It conflated the operational cost of running a step with the dollars that step spends on the customer's behalf. The fix: a financial tool's cost is the real amount in its own arguments, `args["amount_usd"]`.

**Bug 2: idempotency covered the side effect but not its cost.** After the first fix, an approved run whose refund step was retried started failing with `spend_cap_exceeded`. Nothing extra had happened in the real world. The idempotency guard correctly skipped the second refund, but the retry still went through `authorize_step()` and its cost was added to the run total again. The fix moves the idempotency check before authorisation. After the caller and tenant access checks, a replay of an applied key is a free no-op that never touches the budget or the approval logic.

> **"Idempotency has to cover every side effect of a step, not just its most obvious one."** Cost accounting is a side effect too.

The anchor links bug 1 to a false-security-alarm bug in the RAG project. Both are safety checks that look like they measure something while quietly measuring the wrong quantity. When quoting, note that the story uses a $5 cap, while the Cascade Robotics tenant policy uses $50. Both figures are the sources'; they are different scenarios.
