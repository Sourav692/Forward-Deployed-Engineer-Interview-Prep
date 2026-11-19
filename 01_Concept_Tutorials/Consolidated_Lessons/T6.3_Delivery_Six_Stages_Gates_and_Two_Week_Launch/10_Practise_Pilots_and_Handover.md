---
title: "Practise pilots and handover"
subtitle: "Ten practice questions on designing and scoring pilots, expanding safely, gate criteria, engagement plans and handover."
track: Discovery, Scoping and Delivery
module_group: Delivery and adoption
module_code: T20.5
module_name: "Delivery: six stages, gates, two-week launch"
lesson: 11
lessons: ["Telling a delivery story in six stages", "Delivery as a repeatable process", "Role-gated stage gates", "Risk checks and delivery metrics", "Securing the delivery process", "Cross-team ownership and cadence", "Pilots that predict production", "Onboarding a new customer integration", "Handover and ownership", "Practise the two-week delivery round", "Practise pilots and handover"]
level: intermediate
reading_time: "14 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "19 November 2026"
tags: [practice, interview, pilot, stage gates, handover, customer scenario]
---

## How to use this practice

These questions put you in a customer meeting where a pilot, a gate or a handover is going wrong, or ask you to produce a plan or a checklist. Answer aloud first, writing the key items down. Then compare with the outline.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Designing, scoring and reading a pilot.
> - Deciding when a pilot may expand, and to whom.
> - Writing gate criteria and an engagement plan.
> - Turning a manual prototype into a supported service, and handing it over.
> - Deciding whether a customer integration has finished onboarding.

## Designing and reading a pilot

Taught in [pilots that predict production](08_Pilots_That_Predict_Production.md).

<details>
<summary>Practice question 1. Fallow Foods wants to pilot an assistant that answers store managers' questions about stock and deliveries. Design the pilot.</summary>

- **Answer:** Goal: cut the time managers spend chasing delivery answers, now a median of 25 minutes a day. Users: 12 stores chosen to cover large and small, urban and rural, and one store with known data problems, with 12 similar stores as a comparison group. Length: six weeks, including a bank holiday week. Scorecard: answer accuracy on a checked sample, share of questions asked through the tool, time spent chasing, and wrong-order complaints as a guard. Thresholds for expand, fix or stop agreed in advance.
- **Trade-off:** Twelve varied stores take longer to set up than three keen ones. Keen stores predict the ceiling, not the average.
- **Follow-up to expect:** "Why the store with bad data?" Because production will have it, and you want to see the failure now.

</details>

<details>
<summary>Practice question 2. Draw up a pilot scorecard for an invoice-matching assistant in a finance team.</summary>

- **Answer:** Technical: matching accuracy at least 95% on a weekly sample of 200 checked by a senior clerk, and 99% availability in working hours. Adoption: at least 80% of eligible invoices processed through the tool by week 3, by team, and still there in week 6. Business: median time per invoice down from 6 to 3 minutes against the comparison team. Guards: wrong payments no higher than baseline, and month-end close no later.
- **Trade-off:** More rows mean more measuring. A single time metric lets wrong payments hide behind speed.
- **Follow-up to expect:** "Accuracy is 93%." Below threshold: check which invoice types fail before deciding fix or stop.

</details>

<details>
<summary>Practice question 3. The pilot cut handling time by a third, but rework has doubled. The sponsor wants to expand. What do you say?</summary>

- **Answer:** Not yet. Show the net figure: time saved minus the time spent on rework, and the cost to customers of the cases redone. Find where the rework comes from, often a step the tool skips or a field it trusts that it should not. Fix it, rerun for two to three weeks, and expand when rework is back near baseline.
- **Trade-off:** Delay disappoints a sponsor who saw the speed. Expanding multiplies the rework across every site.
- **Follow-up to expect:** "Can we expand and fix in parallel?" Only to sites where the rework cause does not apply, if you can show that.

</details>

<details>
<summary>Practice question 4. The pilot model is 94% accurate, but after a month only a fifth of pilot users touch it. What do you do?</summary>

- **Answer:** Treat it as an adoption problem, not a model problem. Watch users work: is the tool where the work happens, does it save them effort, do they trust it, did anyone show them when to use it, does anything reward its use? Fix the biggest cause, such as moving it into the screen they already use, and measure use again by group.
- **Trade-off:** Field observation takes days. More model work feels productive and leaves use where it was.
- **Follow-up to expect:** "Users say it is fine but slow." Measure latency in their real workflow, not in the test harness.
- **Go deeper:** [Diagnosing low adoption](../T6.5_Adoption_and_Business_Impact/03_Diagnosing_Low_Adoption.md).

</details>

<details>
<summary>Practice question 5. Every group in the pilot succeeds except the weekend team, which keeps failing. What do you do?</summary>

- **Answer:** Split the scorecard by group to confirm it. Find what differs: case types, staffing, training times, access, a supervisor who is not there at weekends. Decide with the sponsor whether the weekend team is critical. If it is, fix the tool or process for them and rerun before expanding. If not, keep them on the old process with a written reason and a date to revisit.
- **Trade-off:** Fixing for one group delays everyone. Ignoring them leaves a group failing in production.
- **Follow-up to expect:** "Their average drags the pilot down only a little." The average does not matter. Their failure does.

</details>

<details>
<summary>Practice question 6. Write an expansion checklist for taking a pilot from one region to four.</summary>

- **Answer:** Scorecard at threshold for every group in the pilot region. Guard metrics within limits. Support staffed for four times the requests, with named people. Training scheduled for each new team at times they work. Local differences checked: rules, data quality and case mix in each region. Integrations load-tested at four times the volume. A tested way back per region. A named owner per region. Each line confirmed by a named person.
- **Trade-off:** A checklist slows the first new region. Without one, each region finds its own surprises in production.
- **Follow-up to expect:** "Can all four go at once?" Prefer one, then the other three, so one region's lesson protects the rest.

</details>

## Gates and engagement plans

Taught in [role-gated stage gates](03_Role_Gated_Stage_Gates.md) and [delivery as a repeatable process](02_Delivery_as_a_Repeatable_Process.md).

<details>
<summary>Practice question 7. What criteria would you set for moving an AI assistant from prototype to pilot, and from pilot to production?</summary>

- **Answer:** Prototype to pilot: target users completed the core task, quality meets the agreed bar on a signed-off evaluation set, a security review has passed, a fallback exists and a pilot owner is named. Pilot to production: the scorecard thresholds are met for every critical group, guard metrics hold, rollback has been tested, support and owners are in place, and the sponsor signs against the metric agreed at the start. Each gate has a named signer by role.
- **Trade-off:** Strict gates slow progress. Loose gates move risk into production, where it costs most.
- **Follow-up to expect:** "The sponsor wants to sign every gate." Some gates need a specialist, such as security, whatever their seniority.
- **Go deeper:** [Role-gated stage gates](03_Role_Gated_Stage_Gates.md).

</details>

<details>
<summary>Practice question 8. Outline an engagement plan for Elstree Council's planning-enquiry assistant, with a deliverable for each stage.</summary>

- **Answer:** Scoping, week 1: a one-page scope with the measurable goal and named subject expert. Data readiness, week 2: verified access and a data quality note. Build, weeks 3 to 4: a configured assistant and a decision log. Evaluation, week 5: a signed-off test set and a results report. Pilot, weeks 6 to 11: a scorecard against baseline. Production, week 12: a release with runbook, dashboards and a signed handover.
- **Trade-off:** A deliverable per stage adds paperwork. Without one, nobody can tell whether a stage is done.
- **Follow-up to expect:** "Which stage slips most?" Data readiness, because access depends on other teams.
- **Go deeper:** [Delivery as a repeatable process](02_Delivery_as_a_Repeatable_Process.md).

</details>

<details>
<summary>Practice question 9. Caverly Logistics' operations team now runs its daily routing on your prototype, which needs an FDE to run two manual steps every morning. What do you do?</summary>

- **Answer:** Name the risk to the sponsor: daily operations depend on one person and on steps nobody else can run. In the short term, write the manual steps as a runbook and train two customer staff to run them. Then plan the move to a supported service: automate the steps, add monitoring and a fallback, and hand over to an owner, through a proper pilot gate.
- **Trade-off:** Hardening takes weeks the team wanted for features. Leaving it means the first FDE holiday stops operations.
- **Follow-up to expect:** "They want new features first." Agree to the runbook now and hardening before any new feature.

</details>

## Handover

Taught in [handover and ownership](09_Handover_and_Ownership.md).

<details>
<summary>Practice question 10. Write the handover checklist for Dunmore Pharmacy's prescription assistant.</summary>

- **Answer:** People: business owner in pharmacy operations, technical owner in IT, deputies and a staffed rota. Documents: architecture, data flows, a runbook for the top five failures, decision records. Access: credentials in Dunmore's vault, FDE access removed. Monitoring: dashboards and alerts to the rota, with one test alert received. Change: how to update field mappings and rules, who approves, the test set to rerun. Support: signed agreement and a tested ticket route. Open items with owners and dates. Acceptance: the owners ran a release and a practice incident.
- **Trade-off:** A full checklist takes a week of joint work. Skipping it moves the work to the first incident.
- **Follow-up to expect:** "What is the first item you check?" That named owners exist, because nothing else holds without them.

</details>

## Onboarding an integration

Taught in [onboarding a new customer integration](11_Onboarding_a_New_Customer_Integration.md).

<details>
<summary>Practice question 11. Ruddock Water's operations director wants its meter-reading integration live on Monday. The backfill finished on Friday, reconciliation shows 2% of meters differing, and alerts go to the team's shared inbox. What do you tell her, and what do you propose?</summary>

- **Answer:** Two of the four criteria are not met. Reconciliation is not clean, since 2% of meters differ and nobody has explained why. Alerts are not wired, because a shared inbox is not a rota and no test alert has been acknowledged. The backfill is finished, and owners need confirming in the launch contract. Propose going live on Monday for the districts whose reconciliation is clean, with alerts routed to the on-call rota and tested by Friday. Fix the differing meters with her data owner, then add the remaining districts once three daily runs are clean.
- **Trade-off:** A partial go-live is harder to explain than one date. It avoids billing customers from readings nobody has checked.
- **Follow-up to expect:** "The 2% is probably old meters." Then prove it with a sample, and write the rule into the field map.

</details>

## References

1. The lessons linked under each heading in this module.

## Key takeaways

- A pilot design names representative users, a comparison group, a full business cycle and thresholds agreed in advance.
- Read speed against rework, and use against accuracy, before expanding.
- Split results by group, and expand in waves with a checklist.
- Gates need criteria and named signers. A manual prototype in daily use needs hardening and an owner.
- A handover checklist ends with the owners doing the work.
- A customer integration is live only when backfill, reconciliation, alerts and owners all have evidence.

## Check yourself

<details>
<summary>1. In practice question 1, why include a store with known data problems?</summary>

Production will include such stores. Seeing the failure in the pilot lets the team fix it or set expectations before expansion.

</details>

<details>
<summary>2. In practice question 9, what is the main risk of the prototype in daily use?</summary>

Daily operations depend on one person running manual steps, with no runbook, monitoring or fallback.

</details>
