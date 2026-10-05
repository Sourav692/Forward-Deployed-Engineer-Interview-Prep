# Practise the Two-Week Delivery Round

*Seven boxes in a row are easy to draw in an hour, but the round is won by showing which boxes are enforced gates and naming honestly which parts are not built.*

◷ 9 min

The two-week delivery prompt rewards a candidate who treats it as an operating-model question in the first two minutes and spends the deep dive on gates and reuse. This lesson lays out a 60-minute plan, then a set of practice prompts to answer aloud before checking the outline.

**Objectives:**

- run the 60-minute round with a time budget and a framing sentence;
- ask the clarifying questions that change the design, and anchor on a measurable case;
- handle the scale, trade-off and close questions, and answer the common follow-ups.

---

## Frame the Round in the First Two Minutes

The prompt, from the DevRev interview preparation guide: design a delivery framework that takes a customer from scoping doc to deployed AI agent in under two weeks.

Open by naming what kind of question it is. In substance: this is an operating-model question, not a software architecture one; anyone can draw a pipeline of seven boxes; the signal is whether each box is an enforced gate or a status someone reports honestly; so the design makes the gates code rather than trust. That framing names the real test, shows the candidate noticed the question is different, and sets up the deep dive.

Write the time budget in the corner of the board.

| Minutes | Phase |
|---|---|
| 0–8 | Clarify and scope |
| 8–15 | High-level pipeline |
| 15–35 | Deep dive: gates and the reuse system |
| 35–45 | Cross-cutting: risks, metrics, CI/CD parallels |
| 45–55 | Failure modes and scale |
| 55–60 | Close: trade-offs and what to build first |

## Ask Questions That Change the Design

Five questions move the design. Is "two weeks" a hard SLA or a target? That decides whether a failed gate means slip the date or abort and re-scope. Who owns go/no-go: the FDA, the account team or the customer? That decides the allowed role on the final gate. What is genuinely reusable across customers? The library works for the fiftieth customer of a proven type, much less for a new type. What happens when a gate fails outright, not late: pause or terminate? Is this for one team or the whole organisation? That decides whether the library is a shared, versioned asset or tribal knowledge.

Then scope out loud: the pipeline is a state machine with role-gated checkpoints and a library behind each stage, and the infrastructure-provisioning layer under "configure, do not code" is named but not designed.

Anchor on Northwind Logistics: a tier-1 support triage agent over Zendesk, Confluence and Salesforce, with metrics agreed in writing before day 1. First-response time under 5 minutes on the top three ticket categories, and zero-edit sends on 60% of eligible tickets by week 4. Both are measurable from timestamps and edit history. Say early that a metric this clean is a condition of intake, because refusing unmeasurable requests is the cheapest high-signal idea in the design.

## Write the Nouns, Then Narrate, Then Draw

List the entities before the boxes: engagement, stage, gate, principal (a role), artefact, accelerator asset, escalation, metric. Then narrate one engagement in words. A request arrives; intake checks it is measurable and has an SME, or refuses. Accepted, it enters scoping on day 1. Each later stage sits behind a named gate that only the authorised role can sign. Each stage pulls from the library before building anything. On day 14, if the metrics were met, the sponsor signs go/no-go and the engagement deploys with a runbook and dashboards.

Only then draw the pipeline, labelling every gate with who signs it. The full diagram is in [Role-Gated Stage Gates](03_Role_Gated_Stage_Gates.md).

## Spend the Deep Dive on Gates and Reuse

Announce where the risk is. Seven stages in order is not a hard problem. The hard parts are making "done" checkable rather than "time passed", and making the library real enough that week two does not turn into bespoke code.

For gates, contrast a naive checkbox with a sign-off that checks role, requires evidence and enforces order. The FDA closing their own security gate is the delivery version of a model enforcing its own access control.

For reuse, give the number: reuse rate is reused pulls over total pulls, and Northwind's is 83%. Then say what the library honestly is not. Its entries are named assets, not real connector code or a real evaluation harness. The evaluate stage asserts a score rather than calling a harness. The gate mechanism is real; one piece of evidence behind it is not yet.

## Answer Scale and Trade-Offs Without Bluffing

Scale here is not chunk count; it is one FDA running six engagements at once. The state machine does not change with portfolio size, because each engagement has the same gates. What is hard is capacity: how many engagements one person can carry before gates queue behind their calendar rather than the customer. That needs real engagement-duration data before designing, just as cache sizing needs real query logs.

| Decision | Chosen | Would revisit if |
|---|---|---|
| Role-gated sign-off over self-certification | Six named gates, six named authorities | A one-person delivery team makes role separation impossible; gates would compress, not disappear |
| Hard refusal at intake over "start and hope" | Refuse unmeasurable or SME-less requests | The business accepts the risk for a strategic customer; intake then needs an explicit override with its own sign-off, never a silent bypass |
| Automatic escalation over manual tracking | Day-3 escalation on data access | Mitigations multiply until one dashboard is clearer than many checks; then it becomes a rules engine |

> **Warning: claiming all four risk mitigations are built invites the follow-up that exposes the one that is not.** Show three real checks and name the missing scope-change control. An honest gap survives probing; an overclaim does not.

## Close With What to Build First

Summarise in three sentences: every transition sits behind a role-gated decision, not a status field; assets are pulled before anything is built, and that ratio is tracked; and the risk mitigations are checks in code, with the missing one named.

Then give the forward-deployed close. Rolling this out internally, week one is not all seven stages. Pick the two gates most often skipped under deadline pressure, which in the source author's experience are the golden-set sign-off and the rollback test, and make only those structurally unskippable. That proves the risky claim, that gates as code change behaviour, before anyone debates the other five.

Good questions to ask the interviewer: what the real accelerator library looks like today, whether code, templates or tribal knowledge; where two weeks has actually broken down, and at which gate; who owns go/no-go in practice; and how many engagements one FDA usually carries. With a laptop, show the gate table and the negative-control case rather than live-coding. The strongest evidence is the decision trace: which gate blocked, who owned it, what evidence was missing, and how the plan recovered.

## Practise the Follow-Up Questions

**1. "Restate the problem in one breath."**
A repeatable delivery pipeline, not a one-off plan, where speed comes from a reusable library and safety from role-gated checkpoints, so two weeks is an outcome of the process. → [Delivery as a Repeatable Process](02_Delivery_as_a_Repeatable_Process.md)

**2. "Why not just put more engineers on it?"**
Two weeks is repeatable only if most of each stage already exists. Headcount buys one heroic delivery, not a process. → [Delivery as a Repeatable Process](02_Delivery_as_a_Repeatable_Process.md)

**3. "Can a senior architect sign off security to save a day?"**
No. Wrong role is a hard deny with no seniority exception; only the security reviewer signs that gate. → [Role-Gated Stage Gates](03_Role_Gated_Stage_Gates.md)

**4. "The security gate passed. Does that mean adversarial testing happened?"**
Not unless the evidence is a required checklist. Free text cannot prove it. → [Securing the Delivery Process](05_Securing_the_Delivery_Process.md)

**5. "Day 14 arrives and the metrics are not met. Has the framework failed?"**
No. No-go is a legitimate outcome, and the log shows which gate stopped it and why. → [Role-Gated Stage Gates](03_Role_Gated_Stage_Gates.md)

**6. "How would you know the process is productised and not heroic?"**
Track the accelerator reuse rate across engagements; a rising custom-build count means the date will slip. → [Risk Checks and Delivery Metrics](04_Risk_Checks_and_Delivery_Metrics.md)

**7. "What should never be a two-week engagement?"**
One with no measurable metric or no customer SME. Rejecting those is part of the framework. → [Risk Checks and Delivery Metrics](04_Risk_Checks_and_Delivery_Metrics.md)

## Worked Example: The First Eight Minutes

The interviewer reads the prompt. The candidate opens with the framing: operating model, gates as code. They ask whether two weeks is a hard SLA. Suppose the interviewer says it is a target. A failed gate will slip the date rather than abort. They ask who owns go/no-go; suppose the answer is the customer's sponsor. So the final gate's allowed role is the executive sponsor. They state the provisioning layer is out of scope.

Then they anchor on Northwind's two metrics and note intake would refuse anything vaguer. Eight minutes in, the interviewer knows the design's shape, its scope boundary and the first high-signal idea, before a single box is drawn. Every remaining phase builds on answers already given.

---

## Key Takeaways

- Frame the prompt as an operating-model question in the first two minutes, and keep a written time budget.
- Ask the five questions that change gates and roles, and anchor on a case with measurable metrics.
- Write nouns, narrate one engagement, then draw the pipeline with every signer labelled.
- Spend the deep dive on enforced gates and a measured reuse rate, and say what is not yet real.
- Treat scale as capacity per FDA, defend three trade-offs, and close with the two gates to enforce first.

## Check Yourself

1. **Why ask whether two weeks is a hard SLA or a target?**
   It decides what a failed gate means: slip the date, or abort and re-scope.

2. **Which two gates should be made unskippable first in an internal rollout, and why?**
   The golden-set sign-off and the rollback test, the two most often skipped under pressure in the source's experience. Enforcing them first proves gates as code change behaviour.

3. **What is the scale question for this system?**
   Not data volume but portfolio: how many engagements one FDA can carry before gates queue behind their calendar. It needs real duration data before design.

## References

**Sources:** `05_FDE_Delivery_and_Scoping/Delivery_Framework/INTERVIEW_SCRIPT.md` (all steps, the cheat sheet, the questions to ask and the laptop advice), with the follow-up prompts drawn from the checkpoints in `01_Concept_Tutorials/FDE_Handbook/10_FDE_Delivery_Operating_Model/03_Scoping_To_Production_In_Two_Weeks.md` and `04_Gates_Risks_Metrics.md`. The problem prompt is from the DevRev interview preparation guide; the script's framing is summarised in our own words.
