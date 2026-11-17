# Practise Discovery Questions, Part 2


## How to use this practice

Work through these the same way as [part 1](/learn/forward-deployed/customer-discovery/practise-discovery-questions-1): two minutes aloud, then compare with the outline and say the follow-up answer. Most of the ideas come from [stakeholder and workflow maps](/learn/forward-deployed/customer-discovery/stakeholder-and-workflow-maps). Every customer and figure below is fictional.

> **What you'll practise**
>
> - Handling disagreement between stakeholders.
> - Dealing with approvals that are bypassed or look redundant.
> - Mapping systems, workflows and owners, and showing the map.

## Disagreement and ownership

<details>
<summary>Practice question 1. Two senior stakeholders want opposite things from the project, and both outrank your sponsor's deputy. What do you do?</summary>

- **Answer:** Meet each one separately to learn what they need and why. Write the conflict down neutrally: each position, its reason and the cost of each option. Take it to the sponsor, who owns the decision, and ask them to settle it with both in the room. Record the decision and share it.
- **Trade-off:** Escalating early may feel political. Picking a side yourself makes an enemy and decides something that is not yours to decide.
- **Follow-up to expect:** "The sponsor will not decide." Explain what work stops until they do, and set a date.

</details>

<details>
<summary>Practice question 2. The sponsor, the compliance team and the users each want something different from the same workflow. How do you reach a design?</summary>

- **Answer:** Trace each requirement to its reason. Compliance requirements backed by law or contract are constraints. The sponsor's goal sets the target. User needs decide adoption. Design within the constraints to meet the goal, then shape it around users. Show all three groups the result together, so each sees how their need was handled.
- **Trade-off:** Meeting compliance in full can add steps users dislike. Make those steps cheap, such as pre-filled evidence, rather than arguing them away.
- **Follow-up to expect:** "Compliance's rule turns out to be a habit, not a law." Then it can be traded, but the compliance lead decides that, not you.

</details>

<details>
<summary>Practice question 3. Nobody owns the process you are improving. Each team owns one step. What do you do?</summary>

- **Answer:** Map the steps and handoffs with each team's lead, so the gaps are visible. Raise the missing owner with the sponsor, propose an interim owner for the engagement, and make naming a permanent owner part of the handover plan. Without one, every later change becomes a negotiation.
- **Trade-off:** Raising it may look like overreach. Delivering into an unowned process means nobody keeps it running.
- **Follow-up to expect:** "Should you be the owner?" Only for the engagement. A permanent owner must sit with the customer.

</details>

<details>
<summary>Practice question 4. Describe how you documented and resolved an ownership conflict between teams.</summary>

- **Answer:** Use a real case. Name the activity both teams claimed or both avoided, how you found it, and the impact on the project. Explain how you wrote it up: the activity, each team's view, the options. Then who decided and what changed, such as an on-call rota or a support boundary in the runbook.
- **Trade-off:** Stories about conflict risk blaming a team. Keep the focus on the gap in the process.
- **Follow-up to expect:** "What would you do differently?" Map owners earlier, before the first incident exposed the gap.

</details>

## Approvals and controls

<details>
<summary>Practice question 5. During observation, you see staff routinely skip an approval step to meet deadlines. What do you do?</summary>

- **Answer:** Do not report individuals. Find out why the step exists and who owns the rule behind it. Measure how often it is skipped and why: the approver is slow, the step adds nothing, or the deadline is impossible. Take the evidence to the control owner and the sponsor with options, such as a faster approval path or a changed threshold.
- **Trade-off:** Raising it may expose a compliance gap the customer would prefer not to see. Ignoring it means building on a process that is not what it claims.
- **Follow-up to expect:** "Should your system enforce the step?" Only once the step is workable. Otherwise people will find a new way around it.

</details>

<details>
<summary>Practice question 6. An approval step adds two days, and the approver always says yes. The sponsor wants it gone. What do you do?</summary>

- **Answer:** Ask the control owner which rule requires it and what the approver checks. If the rule is real, keep the step and make it cheaper: prepare the evidence automatically, batch approvals or agree a service level. If nobody can name a rule, the control owner decides whether it goes. Either way, record the decision.
- **Trade-off:** Keeping the step costs time. Removing a mandated control can cost a fine, funding or an audit finding.
- **Follow-up to expect:** "It always says yes, so it adds no value." It may be the evidence an auditor needs that someone checked.

</details>

## Maps

<details>
<summary>Practice question 7. Map a workflow that crosses a CRM, an ERP and email. How do you go about it?</summary>

- **Answer:** Trace three real cases end to end: a simple one, a large one and an exception. Draw swimlanes per team and mark which system each step reads and writes. Mark handoffs, especially the email ones, because those leave no record. Note waits and exceptions with how often each happens, then name an owner per step.
- **Trade-off:** Tracing real cases is slower than drawing from interviews. It catches the email steps nobody mentions.
- **Follow-up to expect:** "Where do things usually go wrong?" At the email handoffs, because no system tracks them.

</details>

<details>
<summary>Practice question 8. Build a system and ownership map for a new engagement. What goes on it?</summary>

- **Answer:** Each system involved, the data it holds, which fields it is the system of record for, who owns it and who grants access. The connections between systems and which way data moves. For each process step, the system used and the person accountable. Mark gaps: unowned fields, manual copies and missing access.
- **Trade-off:** A full map takes a week. A partial one is enough to start, as long as gaps are marked.
- **Follow-up to expect:** "Two systems both claim a field." Name the one that records the real event, and make the other read from it.

</details>

<details>
<summary>Practice question 9. Produce a stakeholder map for a hospital discharge project. Who is on it?</summary>

- **Answer:** Sponsor: the chief operating officer. Process owner: the head of patient flow. Users: ward nurses, discharge coordinators, pharmacists. Control owners: clinical governance and information governance. System owners: the patient record and bed management teams. Affected groups: patients, social care and transport providers. For each, note what they can approve or block.
- **Trade-off:** A large map is harder to manage. Missing pharmacy or social care can stall discharges you have sped up elsewhere.
- **Follow-up to expect:** "Who has the most informal power?" Often senior nurses, because their adoption decides whether it works.

</details>

<details>
<summary>Practice question 10. Present a current and proposed workflow to the customer's leadership. How do you show it?</summary>

- **Answer:** Use the same swimlanes for both. Show the current map with waits and exceptions measured, then the proposed map with only the changes highlighted. For each change, show what it removes, which lane it affects and the expected effect in their metric. End with what each team leader must agree to.
- **Trade-off:** A detailed map overwhelms leaders. Show one page and keep the detail in an appendix.
- **Follow-up to expect:** "A team leader objects to a change in their lane." Ask what it would break, then adjust or take it to the sponsor.

</details>

## References

1. The site's [stakeholder and workflow maps](/learn/forward-deployed/customer-discovery/stakeholder-and-workflow-maps) lesson.
2. The site's [observing the work](/learn/forward-deployed/customer-discovery/observing-the-work) lesson.

## Key takeaways

- Write conflicts down neutrally and let the person who owns the decision make it.
- A missing process owner is a risk to raise, not a gap to fill yourself.
- Before removing or enforcing an approval, find the rule and its owner.
- Map systems, fields, owners and handoffs, and mark the gaps.
- Show current and proposed workflows on the same lanes.

## Check yourself

<details>
<summary>1. Why should your system not enforce a skipped approval step straight away?</summary>

If the step is unworkable, people will find a new way around it. Fix why it is skipped first.

</details>

<details>
<summary>2. Why are email handoffs the first place to look on a multi-system map?</summary>

No system records them, so cases wait or get lost there without anyone seeing.

</details>
