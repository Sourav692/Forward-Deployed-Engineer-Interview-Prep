# Risk Checks and Delivery Metrics

*A risk register is quick to write, but a mitigation that relies on memory fails in the busiest week, so each must run by itself.*

◷ 4 min

A risk mitigation that lives as a reminder on a tracker is not a mitigation. The delivery framework answers each named risk with a mechanism. It then measures the process with five numbers, the last of which asks whether delivery is productised or heroic.

**Objectives:**

- match each of the four named delivery risks to the check that mitigates it;
- read the five delivery metrics and what each actually reveals;
- state honestly what the Northwind numbers do and do not prove.

---

## Turn Each Risk Into a Check

Four risks are named, and each gets a mechanism rather than a to-do item.

| Risk | Mitigation | How it is enforced |
|---|---|---|
| Data access delays | Start on day 1, escalate on day 3 | An automatic date check: if data access is still pending on day 3, the system raises the escalation itself, once, and logs it |
| Scope creep | Change control on the signed scope | Any change after intake goes through the same sponsor-level authority that approved the original metrics |
| Unmeasurable success criteria | Refuse to start | Intake refuses the engagement before a clock starts |
| No customer SME | Make the SME a contractual prerequisite | Also enforced at intake; three of the six gates need an SME signature, so an engagement with no SME can never finish |

The escalation is automatic because a person remembering to chase access is the very thing that fails under load. It fires whether anyone is watching or not.

Scope-change control is the honest gap. The interview script marks it not yet built and suggests reusing the sign-off pattern for a scope-change request that requires the sponsor role. The handbook sizes that as low effort. So three of the four mitigations are real checks today.

The script contradicts itself on this count. Its risk table shows three of four built, while its closing summary says "two of four" are automatic. The table is the more specific statement; treat three as the accurate figure and say the scope-change check is the missing one.

## Accept That Some Engagements Should Not Be Two Weeks

The prep guide states an honest limit: some engagements should not be two weeks, and knowing which to reject is part of the framework. Intake refusal makes that judgement literal. Not every request should have a clock started against it.

> **Warning: a reminder on a tracker is not a mitigation.** "Escalate on day 3" written in a plan depends on someone's calendar. Written as a check against the engagement's day and gate state, it cannot be forgotten.

## Read Five Metrics, Not One

| Metric | What it reveals |
|---|---|
| Time to first value | How long until the customer saw something real, not a status update |
| Evaluation score at handover | The number that was true when responsibility transferred |
| Human-approval override rate | Falling over time means trust is being earned; flat means the agent is not ready for less supervision |
| Week-4 retention | Whether the deployed thing is still the thing being used a month later; left empty until recorded, never a fake zero |
| Accelerator reuse rate | The direct measure of productised process against bespoke heroics |

The first four come from the prep guide. The reuse rate is the framework's own addition, because it turns the governing question, pulled from the library or built from scratch, into a number. Metrics are computed from the engagement's own history when asked, not tracked separately.

## Worked Example: Reading the Northwind Numbers Honestly

The Northwind demo reports time to first value of 1 day, an evaluation score of 0.83, an override rate of 0.27 and a reuse rate of 0.83. All 6 of 6 gates passed. One escalation was raised automatically on day 3 and resolved when the gate passed.

Read them with care. This is one engagement, run once. The 0.83 evaluation score is a demo-scripted value, not a measurement; the interview script admits the evaluate stage asserts a score rather than calling a real evaluation harness. What the run does prove is that the pipeline enforces its own gates and fires its own escalation.

Saying that out loud is stronger than presenting 0.83 as a result. An interviewer probing the number finds the candidate already named its limit.

---

## Key Takeaways

- Each delivery risk needs a mechanism, not a reminder: auto-escalation, change control, intake refusal, SME prerequisite.
- Scope-change control is the honest gap; three of four mitigations are real checks.
- Some engagements should not be two weeks, and rejecting them is part of the design.
- Track five metrics, with reuse rate as the measure of productised delivery and week-4 retention left empty until recorded.
- Report demo numbers with their limits: one run, one scripted score.

## Check Yourself

1. **Why is the day-3 escalation automatic rather than a task for the delivery lead?**
   A person remembering to chase access is what fails under load. An automatic check against day and gate state fires whether anyone is watching.

2. **What does a flat override rate tell you?**
   Humans keep overriding the agent at the same rate, so trust is not being earned and the agent is not ready for less supervision.

3. **Why should week-4 retention show as empty rather than 0.0 before it is recorded?**
   A zero claims nobody uses the agent. An empty value says the measurement has not happened yet.

## References

**Sources:** `05_FDE_Delivery_and_Scoping/Delivery_Framework/docs/01-theory.md`: §B.4–B.5. `05_FDE_Delivery_and_Scoping/Delivery_Framework/INTERVIEW_SCRIPT.md`: Step 4A (automatic escalation), Step 4B ("What the library is honestly not"), Step 5 risk table and Step 6 summary. `01_Concept_Tutorials/FDE_Handbook/10_FDE_Delivery_Operating_Model/04_Gates_Risks_Metrics.md`: "Risk mitigations are checks, not reminders" and "The five metrics". The risks and metrics come from the DevRev interview preparation guide's delivery-framework prompt, summarised in our own words.
