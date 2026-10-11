# Approvals and Spend Caps

*Autonomy is what makes automation worth having, but a workflow that may act alone must still never act past its money limit or without the approval it was not granted.*

A guardrail that runs only when someone remembers to call it is not a guardrail. Run one decision on every step of every run, with deny overriding allow, and pair it with [Staged Rollout](/learn/agentic-systems/agentic-workflow-platforms/staged-rollout), which decides whether a workflow may act at all.

**Objectives:**

- list the five deny rules in order and the two ways a destructive step is allowed;
- explain why the step budget and the spend cap are different quantities;
- say why an autonomous workflow can still be stopped.

---

## Run One Decision on Every Step

Layer 3 asks: is this user allowed to configure or run this, and did we ask a human when we should have? Two mechanisms implement it. This lesson covers the first, a per-step guardrail decision. The project's three headline claims live in this layer:

1. A destructive action never executes without an explicit human approval or an explicit per-tenant allow-list entry, even on a fully autonomous workflow.
2. A $500 refund against a $50 cap is refused outright, never silently clamped.
3. Nobody can promote their own workflow. That one belongs to [Staged Rollout](/learn/agentic-systems/agentic-workflow-platforms/staged-rollout).

The decision, `authorize_step`, returns a `Decision(allowed, rule, reason)`. Deny overrides allow. A decision with a named rule and reason can be logged, tested, and explained; a boolean cannot.

## Check Five Deny Rules, Then Two Allows

The rules run in order.

| # | Rule | Denies when |
|---|---|---|
| 1 | `step_budget_exceeded` | The run has used its step allowance, the tighter of the workflow's maximum and the tenant policy's |
| 2 | `spend_cap_exceeded` | This step's real cost would exceed the cap, again the tighter of workflow and tenant. For a financial tool the cost is the actual amount |
| 3 | `shadow_mode` | The workflow is in `SHADOW`. Destructive steps never execute here, unconditionally, regardless of role or approval |
| 4 | `not_live` | The workflow has not been promoted to `LIVE` |
| 5 | `needs_human_approval` | The tool is destructive, not allow-listed for autonomous use on this tenant, and no approver is present |
| — | `autonomous_allowlisted` or `human_approved` | The two ways a destructive step is actually allowed |

Non-destructive steps pass after the budget checks. Destructive steps must clear all five rules and then match one of the two allows.

## Treat Steps and Dollars as Two Quantities

The step budget and the spend cap are not two severities of one limit. They measure different things.

The step budget counts how many steps a run has taken. It guards against a run looping forever, whatever each step costs. The spend cap counts the actual dollars one step is about to spend. It guards against one costly action, however few steps came before.

A run can trip one without touching the other. A long chain of cheap steps trips the step budget without nearing the spend cap. A single large refund trips the spend cap on step one, with almost no step budget used.

Both halt and escalate rather than loop. A denied step pauses the run with a named reason. It does not retry. It does not clamp the amount down to fit.

> **Warning: never clamp a refused amount to the cap.** Paying $50 against a $500 request looks helpful and is wrong: the customer asked for something else, and nobody approved the substitute. Refuse with `spend_cap_exceeded` and let a human decide.

## Keep Autonomy Under the Ceiling

Autonomous does not mean unlimited. A destructive tool not explicitly allow-listed for autonomous use still needs a human, even on a fully autonomous workflow. The spend cap applies at every status, autonomous included. Autonomy raises the ceiling on which actions may skip approval. It never removes the ceiling.

The tenant policy holds three things: a spend cap, a maximum step count, and the list of destructive tools allowed to run autonomously.

```python
@dataclass
class GuardrailPolicy:
    spend_cap_usd: float
    max_steps: int
    allowed_destructive_tools_autonomous: List[str]
```

A workflow can be tighter than its tenant's policy, never looser. The guardrail takes the minimum of the two budgets, and the allow-list belongs to the tenant alone.

## Worked Example: Why the $500 Refund Did Not Fire

Cascade Robotics runs an autonomous ticket-triage workflow. Its tenant policy has a $50 spend cap. `issue_refund` is not on its autonomous allow-list. A ticket asks for a $500 refund.

The draft step is non-destructive and cheap, so it passes the budget checks and runs. The refund step reaches the guardrail. The step budget is fine. The spend cap compares the real cost, $500, against $50, and denies with `spend_cap_exceeded`. The run pauses with that reason.

Suppose the request had been $30. The spend cap passes. The workflow is not in shadow and is live. But `issue_refund` is not allow-listed, and no approver is present, so the step is denied with `needs_human_approval`. Autonomy did not grant the tool; the tenant's list did not include it.

Two independent rules stopped the $500 refund, and either one alone would have. That is what "deny overrides" buys: each rule answers its own question.

## Prove It With Negative Controls

The project's guardrail-failure demo is the one to run for anyone who asks whether the guardrails are real. Every case is correctly denied:

- `wrong_role`: an author cannot promote their own workflow;
- `cannot_skip_stage`: a draft cannot jump to autonomous;
- `type_mismatch` or missing arguments: rejected before execution;
- `not_live`: a draft workflow never fires a destructive step;
- `spend_cap_exceeded`: a $500 refund against a $50 cap is refused, not clamped;
- `step_budget_exceeded`: a 30-step workflow halts at a 5-step cap;
- `entity_locked`: a second run on an in-flight ticket is refused.

A demo that shows things working proves less than a demo that shows things being stopped. Build the negative control for anything you claim is safe.

---

## Key Takeaways

- One guardrail decision runs on every step and returns a named rule and reason, with deny overriding allow.
- Five deny rules run in order, budget, spend, shadow, not live, and needs approval, before a destructive step can match one of two allows.
- The step budget counts steps and the spend cap counts dollars; either can trip alone, and both halt rather than loop or clamp.
- Autonomy widens which tools skip approval, but the allow-list is the tenant's and the cap applies at every status.
- The $500 refund was stopped by the spend cap, and a smaller refund would still have needed a human.
- Negative-control tests, things being stopped, are the evidence that guardrails are real.

## Check Yourself

1. **Give one example that trips the step budget alone and one that trips the spend cap alone.**
   A 30-step chain of cheap steps halts at a 5-step cap without approaching the spend cap. A single $500 refund trips a $50 spend cap on its first destructive step with almost no step budget used.

2. **Why did the $500 refund not fire on an autonomous workflow? Give two reasons.**
   `issue_refund` was not on the tenant's autonomous allow-list, so it still needed a human. And $500 exceeded the $50 spend cap, which is refused rather than clamped.

3. **A workflow sets its own spend cap to $200 and the tenant policy says $50. Which applies?**
   $50. The guardrail takes the tighter of the workflow's and the tenant's budgets, so a workflow can be stricter than its tenant but never looser.

