# From Estimate to Build Plan

*A ticket list is easy to produce, but a plan has to cut risk in order, keep the blocking work visible, and make every change of scope carry its cost.*

◷ 6 min

An estimate says how much work exists; a plan says how the team will remove risk step by step until a usable release ships. The plan rests on the range from [Estimates People Can Trust](/learn/forward-deployed/scoping-an-fde-project/estimates-people-can-trust) and is run with a few light documents and decision-making meetings.

**Objectives:**

- set milestones that each prove something rather than mark a date;
- protect the critical path and give engineers end-to-end ownership;
- run the project with four light documents and spot the signs of drift.

---

## Make Each Milestone Prove Something

"End of week two" is a date, not a milestone. A real milestone delivers a working slice, proves a risky assumption, or unlocks the next block of work. The guide's four-step pattern:

1. Check the architecture, data, login and the hardest integration.
2. Get the core happy path working end to end.
3. Add failure handling, admin operations and analytics.
4. Test, pilot, monitor and prepare the rollback.

The hardest integration sits in the first milestone on purpose. Risk found in week one is cheap; risk found in the last week moves the date.

## Protect the Critical Path

Some work can run in parallel; some blocks everything behind it. The chain of blocking work is the critical path, for example architecture, then core workflow, then operations, then pilot rollout. Connect the riskiest dependency early, keep the path visible to everyone, and never let optional polish displace work on it. Parallel work saves calendar time but not total effort.

## Give Engineers a Whole Outcome

Do not slice work so finely that everyone owns a layer and nobody owns a result. One engineer can own booking from the user's click through to confirmation and support visibility. Another can own payment through to reconciliation and alerts. Ownership of an outcome is what makes someone notice when the pieces do not join.

Ownership for the lead is not controlling every file. Agree interfaces early, give engineers meaningful slices, review the riskiest work closely, and decide fast enough that nobody waits.

## Price Every Scope Change

Change is normal; silent change breaks plans. When scope rises, time rises, the team grows, or quality and risk shift. Nothing else stays fixed. Say it in those terms: it can be added, but it needs a later date, more people, or something removed.

Keep a short decision log for choices that change the shape of the project: hosted versus custom, manual versus automated, one customer versus broad rollout, data design, safety limits. A few sentences of reasoning per decision is enough.

## Run the Project With Four Light Documents

Heavy process is not needed. Four documents usually are.

| Document | What it holds |
|---|---|
| One-page brief | Problem, user, outcome, scope and exclusions, major risks, owner, target milestone |
| Technical design | How it is built, data flow, integrations, states, trade-offs, security, rollout, open questions |
| Execution plan | Milestones, dependencies, critical path, owners, checkpoints, the estimate range |
| Decision log | Each decision, its alternatives, reasoning, date, owner, and what would reopen it |

The brief is the one most people read, so keep it to one page. It names the project and owner, the problem and who feels it, the measurable target, what is in and out, the level of done, the main assumptions, the biggest risks, the estimate range with team shape, and the rollout plan.

Use meetings to decide, not to report. Write the needed decision down beforehand. Leave with a decision, an owner and the next checkpoint. If nothing needs deciding, send a document instead. A good outcome reads: version 1 is read-only with human approval; owner Priya; open question whether ticket history is reachable through the existing API; checkpoint Thursday after the security review.

The questions that expose the real work fall into four groups. Business: why now, who owns the outcome, what if nothing is done, which metric matters. Workflow: show the current process, the hand-offs and the usual exceptions. Technical: which systems hold the data, which actions are needed, what the access limits are. Delivery: who approves, which deadline is real, what can stay manual, what can be piloted.

> **Warning: the hardest integration scheduled for the final week is a date that will slip.** It is one of eight drift signs: nobody can state the outcome, stakeholders disagree on the MVP, the estimate lists no assumptions, the hardest integration comes last, nobody owns admin or support, the AI demo has no test set, scope arrives through chat without changing the plan, and the team celebrates deployment without knowing whether users succeeded.

## Worked Example: Planning the Class-Booking MVP

Take the three-to-five-week booking MVP. Milestone 1 connects hosted login and runs the payment-provider spike on refund rules, the hardest integration. Milestone 2 makes one booking flow work end to end. Milestone 3 adds the waitlist, double-booking handling, the admin portal and analytics. Milestone 4 pilots with one studio, with monitoring and a tested rollback.

One engineer owns booking end to end; another owns payment through reconciliation. When the studio asks for door access mid-project, the decision log records the choice: door access waits for a later phase, because adding it would push the date by the integration's unknown size. The plan absorbed a change without hiding its cost.

---

## Key Takeaways

- A milestone proves a slice or an assumption; put the hardest integration first.
- Keep the critical path visible and protect it from polish.
- Give engineers end-to-end outcomes, and lead by interfaces, reviews and quick decisions.
- Every scope change carries a cost in time, people or other scope; record shaping decisions in a log.
- Four light documents and decision-focused meetings are enough; watch for the eight drift signs.

## Check Yourself

1. **Why does the hardest integration belong in the first milestone?**
   Risk found early is cheap to absorb. Found in the last week, it moves the date.

2. **What should every meeting end with?**
   A decision, an owner and the next checkpoint. If nothing needs deciding, use a document instead.

3. **Name four signs a project is drifting.**
   Nobody can state the outcome; stakeholders disagree on the MVP; the estimate has no assumptions; scope arrives through chat without changing the plan.

