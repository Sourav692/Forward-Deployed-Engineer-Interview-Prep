# Staged Rollout

*Every stage slows a workflow's path to acting alone, but each one removes a doubt that would otherwise be settled by a real customer.*

◷ 6 min

A workflow does not earn trust by being written carefully; it earns it by answering one question at a time. Move it through four gates, each promoted by someone other than its author, with the per-step guardrail from [Approvals and Spend Caps](/learn/agentic-systems/agentic-workflow-platforms/approvals-and-spend-caps) still applying at every stage.

**Objectives:**

- name the five statuses and the one question each gate answers;
- argue why there are four gates, not fewer and not more;
- explain what `promote` denies and why separation of duties matters.

---

## Move One Stage at a Time

A workflow moves through `DRAFT → TESTING → SHADOW → LIVE → AUTONOMOUS`. It advances one stage at a time. Only an approver or an admin may promote it, never the workflow's own author.

| Stage | The one question it answers | What breaks if you skip it |
|---|---|---|
| `DRAFT` | Is this even wired correctly: right trigger, condition, and tool, no typos? | You test your first idea against real customer messages |
| `TESTING` | Does it behave correctly on realistic input, run against sample or historical data off to the side? | You learn it is wrong only after it is watching live traffic |
| `SHADOW` | Does it decide correctly on live traffic? It watches real events and decides what it would do, but every write is mocked | You discover bad decisions only after it has refunded someone for real |
| `LIVE` | Will a human still vouch for each individual action? It acts for real, but every destructive step needs approval first | You go from "looked fine in shadow" to acting alone, with nobody watching one real action |
| `AUTONOMOUS` | Has it earned the right to act without asking every time? The same guardrails apply; only the default flips from ask-first to act-first | Not a gate; it is the destination |

Shadow is unconditional. Destructive steps never execute in `SHADOW`, whatever the role or approval. A fixed step list is what makes that possible: there is a known set of steps to dry-run.

## Keep Exactly Four Gates

Each gate answers one question. Removing one leaves that question unanswered until a real customer answers it.

**Why not fewer?** Merging `TESTING` into `SHADOW` loses the difference between replaying old data and watching live traffic. Replay is cheap, repeatable, and free of real-time pressure. Live traffic is the first time the workflow sees today's actual weirdness. Merging `SHADOW` into `LIVE` means a workflow's decisions can never be watched without exposing customers to its mistakes. That is debugging in production. Without `LIVE`'s human approval, the first time a human sees real behaviour is also the first time nobody is watching.

**Why not more?** Every extra stage is one more promotion someone must remember. Stages without a distinct question behind them are process for its own sake. The guardrail policy already scales risk within a stage, so there is no need for extra stages meaning "a little more trusted".

For a whiteboard, use one line. Each stage removes one kind of "we don't actually know yet": wired right, then decides right on realistic data, then decides right on live data, then whether a human still catches a bad action. Only then has the workflow earned the right to act alone.

## Separate the Author From the Approver

`promote` advances a workflow exactly one stage and denies two things. `wrong_role` stops the author promoting their own work; only an approver or admin can promote at all. `cannot_skip_stage` stops a jump such as `DRAFT` straight to `LIVE`.

The person iterating on a workflow and the person saying it has earned more trust are always two people. It is the same instinct as requiring a second reviewer, applied to rollout rather than code. The project's identity file includes a principal called `u_author_wrong_hat`. It is a negative control proving an author cannot approve their own work, however the request is framed.

> **Warning: an author wearing an approver's hat is still the author.** If promotion checks only "does this user hold the approver role?", someone with both roles can approve their own workflow. Check that the signer is not the author, and keep a negative-control test that proves it.

## Worked Example: Rolling Out the Small-Refund Workflow

A support manager clones a refund workflow and edits it. It starts in `DRAFT`, where no real event can match it, so editing is safe.

The manager runs it against sample data, and an approver promotes it to `TESTING`. The replay shows a typo in the trigger, which the manager fixes. An approver promotes it to `SHADOW`. For a week it watches real refund requests and records what it would have done. The team compares those decisions with what human agents actually did. Every write is faked, so a wrong decision costs nothing.

An approver promotes it to `LIVE`. Now each refund pauses for a human to click approve. After a track record, an approver promotes it to `AUTONOMOUS` for the refund tool the tenant has allow-listed. Refunds over the cap still stop.

At no point could the manager promote their own workflow, and at no point could it skip a stage. The user never wrote code. They clicked through statuses, and each click answered one question.

## Name the Migration Gap

Every version of a workflow is kept, and a run pins to the version it started on. What is not built is gradual migration between two live versions: a traffic split on the spec, consulted by routing. The coverage map rates it as moderate effort, the same shape as a canary release. Safely adding a custom tool is partly covered for the same reason. Schema validation and scoping exist. Sandboxed execution and review-before-publish do not, and the fix is to reuse `promote`'s role-gated pattern for tools.

---

## Key Takeaways

- A workflow moves through five statuses, one at a time, and each of the four gates answers one question; shadow blocks destructive steps unconditionally.
- Four gates is the right number: fewer leaves a question for customers to answer, and more is process without a question.
- `promote` denies an author promoting their own work and any skipped stage, and a negative-control principal proves it.
- A non-technical user rolls out a workflow by clicking through statuses, building trust at zero risk in shadow before acting live.
- Versions are pinned per run, while gradual migration and custom-tool review are named gaps that reuse existing patterns.

## Check Yourself

1. **Name the question each of the four gates answers.**
   `DRAFT`: is it wired correctly? `TESTING`: does it behave on realistic data? `SHADOW`: does it decide correctly on live traffic? `LIVE`: will a human still vouch for each action?

2. **Why not merge `SHADOW` into `LIVE`?**
   Then you could never watch a workflow's decisions on live traffic without exposing customers to its mistakes. You would be debugging in production.

3. **What two things does `promote` deny, and why does `u_author_wrong_hat` exist?**
   `wrong_role`, an author promoting their own work or a non-approver promoting at all, and `cannot_skip_stage`. The principal is a negative control proving an author cannot approve their own work however the request is framed.

## References

**Sources:** `05_Approvals_Spend_Caps_Staged_Rollout.md` (FDE Handbook, Agentic Workflow Platforms): "Staged rollout", "Why four gates, specifically", "How a non-technical user actually moves through it", "Separation of duties", and "Interview lens". `03_Determinism_Over_Free_Text.md`: "Templates, not a blank canvas" and "Versioning a live workflow". `07_Coverage_Map.md`: "Likely follow-ups".
