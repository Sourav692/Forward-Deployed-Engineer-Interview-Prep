# Practise the Two-Week Delivery Round


## How to use this practice

The prompt, from the DevRev interview preparation guide: design a delivery framework that takes a customer from scoping doc to deployed AI agent in under two weeks.

Seven boxes in a row are easy to draw in an hour. The round is won by showing which boxes are enforced gates and naming openly which parts are not built. Read the 60-minute plan first. Then answer each follow-up question aloud before opening the outline.

Northwind Logistics and its figures are fictional.

> **What you'll practise**
>
> - Running the 60-minute round with a time budget and a framing sentence.
> - Asking the clarifying questions that change the design, and anchoring on a measurable case.
> - Spending the deep dive on gates and reuse, and saying what is not built.
> - Handling the scale, trade-off and close questions, and the common follow-ups.

## Plan the sixty minutes

Taught in [delivery as a repeatable process](/learn/forward-deployed/delivery-stages-and-gates/delivery-as-a-repeatable-process) and [role-gated stage gates](/learn/forward-deployed/delivery-stages-and-gates/role-gated-stage-gates).

**Frame it in the first two minutes.** Name what kind of question it is. In substance: this is an operating-model question, not a software architecture one. Anyone can draw a pipeline of seven boxes. The signal is whether each box is an enforced gate or a status someone reports in good faith, so the design makes the gates code rather than trust. That framing names the real test and sets up the deep dive.

Write the time budget in the corner of the board.

| Minutes | Phase |
|---|---|
| 0–8 | Clarify and scope |
| 8–15 | High-level pipeline |
| 15–35 | Deep dive: gates and the reuse system |
| 35–45 | Cross-cutting: risks, metrics, CI/CD parallels |
| 45–55 | Failure modes and scale |
| 55–60 | Close: trade-offs and what to build first |

*Table 1: The time budget for the 60-minute round.*

**Ask the five questions that change the design.**

- Is "two weeks" a hard SLA (service-level agreement) or a target? That decides whether a failed gate means slip the date or abort and re-scope.
- Who owns go/no-go: the FDA, the account team or the customer? That decides the allowed role on the final gate.
- What is reusable across customers? The library works for the fiftieth customer of a proven type, much less for a new type.
- What happens when a gate fails outright, not late: pause or terminate?
- Is this for one team or the whole organisation? That decides whether the library is a shared, versioned asset or tribal knowledge.

Then scope out loud: the pipeline is a state machine with role-gated checkpoints and a library behind each stage. The infrastructure-provisioning layer under "configure, do not code" is named but not designed.

**Anchor on a measurable case.** Northwind Logistics wants a tier-1 support triage agent over Zendesk, Confluence and Salesforce, with metrics agreed in writing before day 1: first-response time under 5 minutes on the top three ticket categories, and zero-edit sends on 60% of eligible tickets by week 4. Both are measurable from timestamps and edit history. Say early that a metric this clean is a condition of intake, because refusing unmeasurable requests is the cheapest high-signal idea in the design.

**Write the nouns, then narrate, then draw.** List the entities before the boxes: engagement, stage, gate, principal (a role), artefact, accelerator asset, escalation, metric. Then narrate one engagement. A request arrives, and intake checks it is measurable and has an SME, or refuses. Accepted, it enters scoping on day 1. Each later stage sits behind a named gate that only the authorised role can sign. Each stage pulls from the library before building anything. On day 14, if the metrics were met, the sponsor signs go/no-go and the engagement deploys with a runbook and dashboards. Only then draw the pipeline, labelling every gate with who signs it.

**Spend the deep dive on gates and reuse.** Seven stages in order is not a hard problem. The hard parts are making "done" checkable rather than "time passed", and making the library real enough that week two does not turn into bespoke code. For gates, contrast a naive checkbox with a sign-off that checks role, requires evidence and enforces order. The FDA closing their own security gate is the delivery version of a model enforcing its own access control. For reuse, give the number: reuse rate is reused pulls over total pulls, and Northwind's is 83%. Then say what the library is not. Its entries are named assets, not real connector code or a real evaluation harness. The evaluate stage asserts a score rather than calling a harness. The gate mechanism is real. One piece of evidence behind it is not yet.

**Answer scale and trade-offs without bluffing.** Scale here is not chunk count. It is one FDA running six engagements at once. The state machine does not change with portfolio size, because each engagement has the same gates. What is hard is capacity: how many engagements one person can carry before gates queue behind their calendar rather than the customer. That needs real engagement-duration data before designing, just as cache sizing needs real query logs.

| Decision | Chosen | Would revisit if |
|---|---|---|
| Role-gated sign-off over self-certification | Six named gates, six named authorities | A one-person delivery team makes role separation impossible; gates would compress, not disappear |
| Hard refusal at intake over "start and hope" | Refuse unmeasurable or SME-less requests | The business accepts the risk for a strategic customer; intake then needs an explicit override with its own sign-off, never a silent bypass |
| Automatic escalation over manual tracking | Day-3 escalation on data access | Mitigations multiply until one dashboard is clearer than many checks; then it becomes a rules engine |

*Table 2: Three trade-offs to defend, and when you would revisit each.*

> **Warning: claiming all four risk mitigations are built invites the follow-up that exposes the one that is not.** Show three real checks and name the missing scope-change control. An honest gap survives probing. An overclaim does not.

**Close with what to build first.** Summarise in three sentences: every transition sits behind a role-gated decision, not a status field. Assets are pulled before anything is built, and that ratio is tracked. The risk mitigations are checks in code, with the missing one named. Then give the forward-deployed close. Rolling this out internally, week one is not all seven stages. Pick the two gates most often skipped under deadline pressure, which in the author's experience are the golden-set sign-off and the rollback test, and make only those structurally unskippable. That proves the risky claim, that gates as code change behaviour, before anyone debates the other five.

Good questions to ask the interviewer: what the real accelerator library looks like today, whether code, templates or tribal knowledge; where two weeks has broken down, and at which gate; who owns go/no-go in practice; and how many engagements one FDA usually carries. With a laptop, show the gate table and the negative-control case rather than live-coding. The strongest evidence is the decision trace: which gate blocked, who owned it, what evidence was missing, and how the plan recovered.

## Worked example: the first eight minutes

Taught in [delivery as a repeatable process](/learn/forward-deployed/delivery-stages-and-gates/delivery-as-a-repeatable-process).

The interviewer reads the prompt. The candidate opens with the framing: operating model, gates as code. They ask whether two weeks is a hard SLA. Suppose the interviewer says it is a target, so a failed gate will slip the date rather than abort. They ask who owns go/no-go. Suppose the answer is the customer's sponsor, so the final gate's allowed role is the executive sponsor. They state the provisioning layer is out of scope.

Then they anchor on Northwind's two metrics and note intake would refuse anything vaguer. Eight minutes in, the interviewer knows the design's shape, its scope boundary and the first high-signal idea, before a single box is drawn. Every remaining phase builds on answers already given.

## Framing and reuse

Taught in [delivery as a repeatable process](/learn/forward-deployed/delivery-stages-and-gates/delivery-as-a-repeatable-process).

<details>
<summary>Practice question 1. "Restate the problem in one breath."</summary>

- **Answer:** A repeatable delivery pipeline, not a one-off plan, where speed comes from a reusable library and safety from role-gated checkpoints, so two weeks is an outcome of the process.
- **Trade-off:** A one-breath restatement leaves out detail. A long restatement spends the minutes you need for clarifying questions.
- **Follow-up to expect:** "So what would you build first?" The intake check and the gate mechanism, then the library.

</details>

<details>
<summary>Practice question 2. "Why not just put more engineers on it?"</summary>

- **Answer:** Two weeks is repeatable only if most of each stage already exists. Headcount buys one heroic delivery, not a process.
- **Trade-off:** Extra people can rescue a single late engagement. They do not make the next customer faster, and they add coordination cost.
- **Follow-up to expect:** "When would you add people?" When the reuse rate is high and the queue is capacity, not missing assets.

</details>

## Gates and evidence

Taught in [role-gated stage gates](/learn/forward-deployed/delivery-stages-and-gates/role-gated-stage-gates) and [securing the delivery process](/learn/forward-deployed/delivery-stages-and-gates/securing-the-delivery-process).

<details>
<summary>Practice question 3. "Can a senior architect sign off security to save a day?"</summary>

- **Answer:** No. Wrong role is a hard deny with no seniority exception. Only the security reviewer signs that gate.
- **Trade-off:** The deny costs a day. An override path means the gate fails on exactly the engagement that needed it.
- **Follow-up to expect:** "The reviewer is on holiday." Name a deputy reviewer in advance, never a senior stand-in from the delivery team.

</details>

<details>
<summary>Practice question 4. "The security gate passed. Does that mean adversarial testing happened?"</summary>

- **Answer:** Not unless the evidence is a required checklist. Free text cannot prove it.
- **Trade-off:** A checklist takes longer to fill in. Free text lets the right signer sign too early.
- **Follow-up to expect:** "What is on the checklist?" Prompt-injection tests, permission-boundary probes and the signed data agreement.

</details>

<details>
<summary>Practice question 5. "Day 14 arrives and the metrics are not met. Has the framework failed?"</summary>

- **Answer:** No. No-go is a legitimate outcome, and the log shows which gate stopped it and why.
- **Trade-off:** Reporting a no-go is uncomfortable. Forcing a go hands the customer a system that missed the goal they signed.
- **Follow-up to expect:** "What happens next?" The sponsor chooses to extend with a fix, narrow the scope or stop.

</details>

## Metrics and refusal

Taught in [risk checks and delivery metrics](/learn/forward-deployed/delivery-stages-and-gates/risk-checks-and-delivery-metrics).

<details>
<summary>Practice question 6. "How would you know the process is productised and not heroic?"</summary>

- **Answer:** Track the accelerator reuse rate across engagements. A rising custom-build count means the date will slip.
- **Trade-off:** Reuse rate alone can be gamed by calling everything an asset. Pair it with engagement duration and quality at handover.
- **Follow-up to expect:** "Northwind's is 83%. Good or bad?" One engagement, so it shows the mechanism, not a trend.

</details>

<details>
<summary>Practice question 7. "What should never be a two-week engagement?"</summary>

- **Answer:** One with no measurable metric or no customer SME. Rejecting those is part of the framework.
- **Trade-off:** Refusing loses a start date. Accepting starts a clock that cannot reach a meaningful go/no-go.
- **Follow-up to expect:** "The account team insists." Any exception needs its own sign-off in writing, never a silent bypass.

</details>

## Key takeaways

- Frame the prompt as an operating-model question in the first two minutes, and keep a written time budget.
- Ask the five questions that change gates and roles, and anchor on a case with measurable metrics.
- Write nouns, narrate one engagement, then draw the pipeline with every signer labelled.
- Spend the deep dive on enforced gates and a measured reuse rate, and say what is not yet real.
- Treat scale as capacity per FDA, defend three trade-offs, and close with the two gates to enforce first.

## Check yourself

<details>
<summary>1. Why ask whether two weeks is a hard SLA or a target?</summary>

It decides what a failed gate means: slip the date, or abort and re-scope.

</details>

<details>
<summary>2. Which two gates should be made unskippable first in an internal rollout, and why?</summary>

The golden-set sign-off and the rollback test, the two most often skipped under pressure in the author's experience. Enforcing them first proves gates as code change behaviour.

</details>

<details>
<summary>3. What is the scale question for this system?</summary>

Not data volume but portfolio: how many engagements one FDA can carry before gates queue behind their calendar. It needs real duration data before design.

</details>
