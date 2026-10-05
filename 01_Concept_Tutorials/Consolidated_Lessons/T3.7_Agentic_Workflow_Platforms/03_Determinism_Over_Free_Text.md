# Determinism Over Free Text

*A model may choose which value goes into an argument, but the moment it improvises what happens next, nobody can review the automation they approved.*

◷ 7 min

The signal the agent-platform prompt tests is not clever reasoning; it is whether deterministic control flow is split from probabilistic reasoning. Make the workflow a document the orchestrator walks, and read [Canonical Events and Routing](02_Canonical_Events_and_Routing.md) first for how a run is chosen.

**Objectives:**

- state the five determinism controls and what each prevents;
- explain why a declarative workflow spec is the right artefact for a non-technical user to review;
- say which non-technical-user constraints are built and which are named gaps.

---

## Apply Five Controls, All Tested

The project builds and tests five controls. Each prevents one failure.

| Control | What it prevents | Where it is taught |
|---|---|---|
| Constrained tool schemas over free-text arguments | A hallucinated or wrong-typed argument reaching a real system | This lesson |
| Idempotency keys on side-effecting calls | A retried step applying its side effect twice | [Durability and Idempotency](04_Durability_and_Idempotency.md) |
| Max-step and max-cost budgets that halt and escalate rather than loop | A runaway run | [Approvals and Spend Caps](05_Approvals_and_Spend_Caps.md) |
| Confirmation gates on destructive actions, configurable per tenant and tool | An irreversible action without authority | [Approvals and Spend Caps](05_Approvals_and_Spend_Caps.md) |
| Deterministic control flow split from probabilistic reasoning | The model improvising the control flow at run time | This lesson |

The last control is the one the whole project is about. The model may choose which value goes into an argument. It never chooses what happens next.

## Make the Workflow Data the Orchestrator Walks

A workflow is a declarative document, not code.

```python
@dataclass
class Step:
    name: str
    tool: str                 # a name in the registry
    args_template: dict       # {"ticket_id": "{target_entity_id}", "amount_usd": "{payload.refund_amount}"}

@dataclass
class WorkflowSpec:
    workflow_id: str
    version: int
    status: WorkflowStatus    # DRAFT | TESTING | SHADOW | LIVE | AUTONOMOUS
    triggers: List[Trigger]
    steps: List[Step]
    max_steps: int
    max_cost_usd: float
```

The orchestrator does not execute the spec; it walks it. It takes the step at the current index, resolves its argument template from the event, validates, authorises, and applies. The control flow is the list, and nobody, human or model, changes the list at run time.

That is the reviewable artefact a non-technical user needs. A sentence like "refund anyone under $50" should never be wired straight into an execution engine. The system converts it into a structured spec: trigger is a refund request, condition is amount under $50, action is `issue_refund`. It shows the spec back for confirmation before anything runs. The user approves a form, not a black box.

## Type, Scope, and Flag Every Tool

The tool registry holds four tools: `draft_reply`, `issue_refund`, `close_ticket`, and `tag_ticket`. Two are destructive and two are not. Each definition carries a schema, required fields, a destructive flag, and scopes. Three properties do the safety work, each at a different moment.

**Schema and required fields apply before execution.** Validation checks every required field is present and every type matches. It denies before any execution is attempted, so a `type_mismatch` or missing argument never reaches a real system. That case is a negative-control test. A system cannot be corrupted by an argument it refused to accept.

**The destructive flag applies at the guardrail.** It is declared once, at registration. The guardrail asks "is this one of the tagged tools?", never "does this call look risky?".

**Scopes describe what the tool may touch.** They are the beginning of a connector permission model.

## Worked Example: Turning "Refund Anyone Under $50" Into a Spec

A support manager types "refund anyone under $50". The platform should not run that sentence. It should produce a spec the manager can read back.

The trigger is a refund request from any channel. The steps are fixed: draft a reply, then issue a refund. The refund step's arguments are templates: `ticket_id` comes from the event's target entity, and `amount_usd` comes from the payload's refund amount. The $50 limit becomes the spend cap and the spec's `max_cost_usd`, which the guardrail enforces at execution.

Now a message asks for $30. The orchestrator walks step 0, then step 1. The model's only latitude, in a version with a model, would be which value fills a typed slot, and validation checks that value's type. A message asking for $500 does not change the list either; the spend cap refuses the step. The spec made every behaviour visible before the first run, which is exactly what "trust" requires.

## Score the Five Non-Technical-User Constraints

The source names five constraints for the non-technical half of the problem. Two are built, one is half-built, and two are named gaps.

| Constraint | In plain language | Built? |
|---|---|---|
| Templates, not a blank canvas | Clone "Auto-refund small orders" and change the numbers | No. A library of pre-built specs with a `clone()` is low effort |
| Plain English compiles to a reviewable spec | The sentence becomes a form you confirm; it never runs directly | Partly. The spec is that form; the compiler is not built |
| A test mode where nothing actually happens | Shadow mode watches real traffic and decides what it would do, with every write faked | Yes. `SHADOW` blocks every destructive step unconditionally, even for an admin |
| Run history in human words | "Refunded 12, escalated 2, denied 1 for exceeding the cap", not a JSON log | No. A sentence-per-step summary over the structured trace is low effort |
| Staged rollout with levels | Draft, test, shadow, live, autonomous, one stage at a time, and the author cannot grade their own test | Yes. See [Staged Rollout](06_Staged_Rollout.md) |

For the natural-language compiler, the coverage map's line is worth knowing. The confirmation half is nearly free, because `promote` already gates every status change behind a human. A generated spec enters at `DRAFT` and passes the same gate as a hand-written one. The generation half is the model-integration work, left out on purpose.

## Pin Each Run to a Version

The workflow store keeps every published version of each workflow. A run pins to the version it started on, so editing a workflow mid-flight never changes runs already in progress. Routing uses each workflow's current latest version for the tenant. What is not built is gradual migration between two live versions, a traffic split consulted by routing. The coverage map rates it as moderate effort.

## State the Fixed-Step-List Gap Plainly

The loop shape is real: plan, select a tool, call, observe, and iterate, under a hard step cap. But the planner is a fixed step list, not a model choosing the next tool from what the run has observed. Swapping in a real planner, a model or a rule engine, is a moderate change that keeps the architecture: a reasoning loop with deterministic guardrails around it. It was left out so every property could be tested deterministically.

> **Warning: do not imply the demo proves a model planner is safe.** It proves the guardrails, idempotency, durability, and rollout hold around a fixed step list. Say that, and say that the guardrails would stay the same around a real planner.

---

## Key Takeaways

- Five controls make the platform deterministic, and the defining one splits fixed control flow from the model's choice of values.
- A workflow is a declarative spec the orchestrator walks; nobody edits the step list at run time.
- Tools are typed, flagged, and scoped, and validation refuses a bad argument before any execution.
- A plain-English request becomes a spec the user confirms, with the money limit enforced as a spend cap, not as prompt text.
- Of the five non-technical-user constraints, shadow mode and staged rollout are built, the compiler is half-built, and templates and plain-language history are low-effort gaps.
- Runs pin to the workflow version they started on; gradual migration between live versions is not built.
- The planner is a fixed list; a real planner is a moderate swap inside the same guardrails, and the demo should not be oversold.

## Check Yourself

1. **Why is a `WorkflowSpec` the right thing for a non-technical user to review?**
   It is a declarative form with a trigger, a condition, and a fixed list of steps. The user can read and confirm it before anything runs, instead of trusting an engine to interpret a sentence.

2. **What three properties of a tool definition do the safety work, and when does each apply?**
   The schema and required fields apply at validation, before execution. The destructive flag applies at the guardrail, as a declared property. Scopes describe what the tool may touch, the start of connector permissions.

3. **What exactly is the fixed-step-list gap, and how should you describe it?**
   The planner is a fixed list rather than a model choosing the next tool from observed state. Say that swapping in a real planner is a moderate change that keeps the same guardrails, and that the demo does not prove a model planner is safe.

## References

**Sources:** `03_Determinism_Over_Free_Text.md` (FDE Handbook, Agentic Workflow Platforms): "Why this matters", "Five controls, all built and tested", "The workflow is data, not code", "The tool registry: typed, scoped, flagged", "Templates, not a blank canvas", "Versioning a live workflow", "The honest gap in the 'agent runtime'", and "Interview lens". `07_Coverage_Map.md`: "Reference architecture", "The non-technical user problem", and "Likely follow-ups".
