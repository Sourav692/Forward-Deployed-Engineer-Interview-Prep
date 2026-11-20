# Practise the Role Questions


## How to use this practice

These questions test whether you can apply the module in a live answer, not recite it. Each one names the lesson that teaches its idea. Work through them in order:

1. Read the question and set a two-minute timer.
2. Answer aloud, as you would to an interviewer.
3. Open the outline and compare. Note what you missed, not only what you got right.

Every customer below is a composite and every figure illustrative, not a real customer. The questions on breaking down an unfamiliar problem have their own practice lesson, [practise breaking down the unknown](/learn/fde-in-the-field/fde-role-and-boundaries/practise-fde-role-and-boundaries-decomposition).

> **What you'll practise**
>
> - Trading tests and scope against a fixed date.
> - Delivering inside another team's rules and splitting who does what.
> - Judging, reviewing and recording shortcuts.

## Deadlines and trade-offs

Taught in [judgement under uncertainty](/learn/fde-in-the-field/fde-role-and-boundaries/judgement-under-uncertainty).

<details>
<summary>Practice question 1. Launch is in three days. Your team can finish the features or the automated tests, not both. The sponsor says "ship everything". What do you do?</summary>

- **Answer:** Do not drop tests silently. Lay out the options: ship all features with tests only on the money and data paths, ship fewer features fully tested, or move the date. Show what each risks, recommend one, and let the sponsor choose in writing. My usual recommendation is fewer features, fully tested on the paths that can lose data.
- **Trade-off:** Fewer features disappoint now. Untested features can fail in production, where the fix costs more and trust drops.
- **Follow-up to expect:** "The sponsor picks all features, minimal tests." Record the decision and the risk, add monitoring and a rollback plan for the untested parts, and schedule the tests for the week after launch.

</details>

<details>
<summary>Practice question 2. You chose a message queue product two weeks ago. A teammate argues it was the wrong choice. How do you decide whether to revisit it?</summary>

- **Answer:** Ask how hard the decision is to undo now. If the queue sits behind our own interface and holds no long-lived data, switching is a two-way door: compare the cost of switching with the cost of living with it, and decide quickly. If other systems already depend on its format, it is closer to one-way: switch only with clear evidence that it will fail the requirements.
- **Trade-off:** Revisiting too often stalls delivery. Never revisiting locks in a mistake while it is still cheap to fix.
- **Follow-up to expect:** "How do you avoid this next time?" Put such choices behind an interface and record the reasons in a short decision note.

</details>

## Working with other teams

Taught in [where the role ends](/learn/fde-in-the-field/fde-role-and-boundaries/where-the-role-ends) and [escalate, pause or stop](/learn/fde-in-the-field/fde-role-and-boundaries/escalate-pause-or-stop).

<details>
<summary>Practice question 3. The customer's security team requires every new service to pass a two-week review and forbids outbound internet access. Your design calls an external API. How do you deliver?</summary>

- **Answer:** Treat their rules as requirements, not obstacles. Book the review now and prepare the evidence it needs. Check whether the API can be reached through an approved proxy or private endpoint, or whether a self-hosted option exists. Plan the first release around what is allowed, and keep the external call as a later phase if it needs an exception.
- **Trade-off:** Working within their rules slows the start. Working around them loses the security team's trust, and you need their approval for every later release.
- **Follow-up to expect:** "The review will take longer than your deadline." Escalate to the sponsor with options: a reduced first release, or a request to prioritise the review.

</details>

<details>
<summary>Practice question 4. Your team, the customer's IT team and your company's support desk all touch the new system. How do you divide responsibilities?</summary>

- **Answer:** Write a short responsibility table for each activity: build, release, monitoring, first-line support, fixes and access management. Name one accountable person per row and who is consulted. Agree it with the three leads before go-live and put it in the runbook.
- **Trade-off:** A table takes a meeting to agree. Without it, incidents start with a debate about who should act.
- **Follow-up to expect:** "Two teams both claim the same row." Escalate to the sponsor for a decision. One accountable owner per row is the point.

</details>

Table 1 is an illustrative starting point for that responsibility table.

| Activity | Accountable | Consulted | Notes |
| --- | --- | --- | --- |
| Build and change | FDE team until handover, then customer IT | Product team | Changes go through the customer's change board |
| Release | Customer IT operations | FDE team | Within agreed change windows |
| First-line support | Customer service desk | Support desk | Known issues in the runbook |
| Product defects | Your company's support desk | Product team | Customer logs a ticket |
| Access management | Customer IT | FDE team | Joiners and leavers through their identity system |

*Table 1: An illustrative responsibility table. Real ones are agreed with the named leads before go-live.*

## Shortcuts and debt

Taught in [judgement under uncertainty](/learn/fde-in-the-field/fde-role-and-boundaries/judgement-under-uncertainty).

<details>
<summary>Practice question 5. A teammate's pull request hard-codes a customer's tax rate "to save time". How do you review it?</summary>

- **Answer:** Ask what happens when it is wrong or changes: tax rates change by law, and a wrong rate means wrong invoices. That makes it debt that endangers operations, so I would not accept it without a guard. Suggest reading it from configuration with a validation check. If the deadline forbids that, accept it only with a recorded owner, a removal date and a test that fails when the rate differs from the published one.
- **Trade-off:** Blocking the change costs an hour. Accepting it unrecorded risks a billing error nobody traces back to it.
- **Follow-up to expect:** "How do you avoid sounding obstructive in review?" Explain the risk in the customer's terms and offer the quicker safe version.

</details>

<details>
<summary>Practice question 6. Your engagement has accumulated shortcuts over three months. How do you document them so they get paid down?</summary>

- **Answer:** Keep a debt register beside the code: each entry has what was skipped, the risk, the owner, the removal trigger and a rough effort. Review it at each sprint planning, and include the top items in the handover so the customer knows what they inherit.
- **Trade-off:** A register costs a few minutes per shortcut. Without one, debt is discovered during incidents, at the worst time.
- **Follow-up to expect:** "Nobody gives you time to pay it down." Rank items by risk, attach the riskiest to planned work, and raise the top one with the sponsor as a delivery risk.

</details>

## References

1. Martin Fowler, [Technical debt quadrant](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html), accessed 17 November 2026.
2. The lessons linked under each heading in this module.

## Key takeaways

- Never cut tests silently. Put scope and quality options in front of the sponsor.
- Judge whether to revisit a decision by how hard it is to undo now.
- Treat another team's rules as requirements, and plan the first release around them.
- One accountable owner per activity, agreed before go-live.
- Record every shortcut in a register with owner and removal trigger, and hand it over.

## Check yourself

<details>
<summary>1. In practice question 5, why is the hard-coded tax rate more than a style issue?</summary>

Because a wrong or outdated rate produces wrong invoices. It is debt that endangers operations. A style issue would only make the code harder to read.

</details>

<details>
<summary>2. What makes the responsibility table useful in an incident?</summary>

It names one accountable person per activity, agreed in advance, so the first minutes go on fixing the problem instead of deciding who acts.

</details>
