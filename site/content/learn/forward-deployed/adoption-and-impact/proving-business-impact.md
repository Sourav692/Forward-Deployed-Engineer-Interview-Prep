# Proving Business Impact

*Usage is easy to count and looks like success, but delivery is only done when the original problem measurably improved and the team can run the system.*

◷ 4 min

Healthy servers do not mean a healthy product, and a busy product does not mean the business moved. Prove impact by watching three kinds of signal and by reporting the result against the target set at scoping.

**Objectives:**

- watch technical, product and business signals rather than infrastructure alone;
- write a wrap-up that compares the result with the original target and names the next bottleneck;
- use delivery metrics that show trust being earned over time.

---

## Watch the Workflow, Not Just the Servers

Three kinds of signal answer three different questions.

| What is being asked | Kind of signal | Examples |
|---|---|---|
| Is the system up and fast? | Technical | Error rate, speed, queue length, AI timeouts, failed payment notifications |
| Are people getting through the workflow? | Product | Completion rate, drop-off, successful bookings, finished sessions |
| Did the business problem improve? | Business | Time to resolve, support cost, conversion, retention, customer satisfaction |

Technical signals can be green while product signals show users abandoning halfway. Product signals can look healthy while the business metric has not moved. Only the third row answers the question the project was funded to answer.

## Report What Changed, Not What Shipped

A good wrap-up compares the outcome with the original target and names the next bottleneck. The guide gives an example. A support assistant was piloted with 25 agents. Median resolution time fell from 12 minutes to 7. Escalations stayed within 1 percentage point of normal. The largest failure type was outdated policy lookups. So the next step is automatic knowledge refresh and lookup-quality tests.

Every part of that report does work. The pilot size bounds the claim. The before-and-after figure ties to the scoped goal. The escalation figure shows the gain did not come at a hidden cost. The failure type sets the next piece of work.

Note what the 12-to-7 result means against the guide's earlier example goal of "under 5 minutes". The pilot improved handling time substantially but did not reach that target. An honest wrap-up says so and names what stands between 7 and 5.

> **Warning: "we deployed it and people are using it" is not evidence of impact.** It reports activity. Delivery is done when the original problem measurably improved and the team can operate the system.

## Track Trust and Staying Power After Handover

The two-week delivery framework adds metrics that look past launch day. Time to first value measures how soon the customer saw something real. The evaluation score at handover records what was true when responsibility transferred. The human-approval override rate should fall over time as trust is earned; if it stays flat, the agent is not ready for less supervision. Week-4 retention asks whether the deployed system is still in use a month later, and it stays empty until measured rather than showing a false zero. These are taught in full in [Risk Checks and Delivery Metrics](/learn/forward-deployed/delivery-stages-and-gates/risk-checks-and-delivery-metrics).

## Worked Example: Writing the Northwind Wrap-Up

Northwind's success metrics were set in writing at intake. One was first-response time under 5 minutes on the top three ticket categories. The other was zero-edit sends on 60% of eligible tickets by week 4.

A wrap-up built on this lesson reports each metric against its target, not against zero. It adds the product signal, such as how many eligible tickets used the drafts at all. It reports the override rate's trend and week-4 retention once measured. It closes with the largest failure type and the next bottleneck. If zero-edit sends reached 45% rather than 60%, the report says so and explains which ticket categories held it back. The figure of 45% is hypothetical; the shape of the report is the point.

---

## Key Takeaways

- Watch technical, product and business signals; only business signals show the funded problem improved.
- Report the result against the original target, with pilot size, side effects and the next bottleneck.
- Track override rate and week-4 retention to see whether trust and use last beyond launch.

## Check Yourself

1. **Servers are healthy and error rates are low. Why is that not proof the product works?**
   Technical signals say nothing about whether users complete the workflow or whether the business metric improved.

2. **What four elements make the 25-agent pilot report convincing?**
   The pilot size, the before-and-after figure for the goal, the side-effect check on escalations, and the largest failure type with the next step.

3. **What does a falling override rate tell you?**
   Humans are correcting the agent less often, so trust is being earned and supervision can begin to relax.

