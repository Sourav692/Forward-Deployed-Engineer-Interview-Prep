---
title: "Practise discovery questions, part 1"
subtitle: "Twelve practice questions on running discovery: finding the problem behind the request, asking questions that do not lead, and watching the work."
track: Discovery, Scoping and Delivery
module_group: Discovery and scoping
module_code: T20.1
module_name: Customer discovery and problem decomposition
lesson: 7
lessons: ["The discovery conversation", "Observing the work", "Stakeholder and workflow maps", "Decomposing a solution into workstreams", "Success metrics and evaluation data", "Choosing the first use case", "Practise discovery questions, part 1", "Practise discovery questions, part 2", "Practise decomposition interview cases"]
level: intermediate
reading_time: "16 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "17 November 2026"
tags: [practice, interview, discovery, observation, customer scenario]
---

## How to use this practice

These questions are the kind a customer-scenario round asks, often in role-play. Each section names the lesson that teaches its ideas. For each question:

1. Set a two-minute timer and answer aloud.
2. Open the outline and compare. Note what you missed.
3. Say the follow-up answer too, because interviewers usually push once.

Part 2 covers stakeholders, ownership and workflow maps. Questions that ask you to break down an open problem are in [practise decomposition interview cases](05_Practise_Decomposition_Interview_Cases.md). Every customer and figure below is fictional.

> **What you'll practise**
>
> - Planning and running discovery sessions.
> - Finding the problem behind a stated request.
> - Asking questions that surface workarounds without leading.
> - Describing an observation session and what it changed.

## Planning discovery

Taught in [the discovery conversation](01_The_Discovery_Conversation.md).

<details>
<summary>Practice question 1. What is the difference between business discovery and technical discovery, and which comes first?</summary>

- **Answer:** Business discovery asks who has the problem, what it costs, what a good outcome looks like and who decides. Technical discovery asks which systems, data, access and constraints exist. Business comes first, because it tells you which technical questions matter. I run them in overlapping weeks, not strictly in sequence, so access requests start early.
- **Trade-off:** Starting technical work early saves calendar time. Starting it before the outcome is clear wastes it on the wrong systems.
- **Follow-up to expect:** "IT is the first team you meet." Ask them who the business owner is, and book that meeting next.

</details>

<details>
<summary>Practice question 2. Plan the agenda for a first two-hour discovery workshop.</summary>

- **Answer:** Ten minutes on purpose and outputs. Thirty on the business problem with the sponsor: cost, goal, deadline. Forty on the current workflow with users, walking one real case. Twenty on systems and data with IT. Ten on constraints: security, legal, budget. Ten to agree next steps and owners, including an observation session. Send the agenda and the questions a day ahead.
- **Trade-off:** A packed agenda covers ground but rushes the workflow walk. Protect the forty minutes with users.
- **Follow-up to expect:** "The sponsor leaves after twenty minutes." Get the goal and decision rights first, while they are there.

</details>

<details>
<summary>Practice question 3. A customer opens with "We want an AI assistant for our sales team." What do you ask first?</summary>

- **Answer:** What should change for the sales team if this works, and how they would measure it. Then which part of the sales day is slow or error-prone, how often, and who feels it. Then what they have tried. The request names a solution. The answers give me the problem, the metric and the users.
- **Trade-off:** Questioning the request can feel like resistance. Explain that the questions protect their budget.
- **Follow-up to expect:** "They insist on the assistant." Agree to scope one, around the problem the answers revealed.

</details>

<details>
<summary>Practice question 4. What clarifying questions do you ask before designing anything?</summary>

- **Answer:** Five groups. The outcome: what changes and how it is measured. The users: who, how many, what they do now. The constraints: deadline, budget, security, compliance. The data: what exists, where, who owns it. The rollout: who must approve, who supports it after. I ask the outcome questions first, because the others depend on them.
- **Trade-off:** Too many questions stall the meeting. Too few produce a design for the wrong problem.
- **Follow-up to expect:** "You get only three questions." Outcome and metric, current users and their pain, and the hardest constraint.

</details>

## Finding the problem behind the request

Taught in [the discovery conversation](01_The_Discovery_Conversation.md) and [choosing the first use case](04_Choosing_the_First_Use_Case.md).

<details>
<summary>Practice question 5. The customer hands you a list of twelve features. You suspect one change would fix most of the pain. How do you handle it?</summary>

- **Answer:** Ask what problem each feature solves and group them by problem. Usually most share one root cause, such as a missing data field or a slow approval. Show the grouping, propose the one change with its expected effect, and keep the list as the backlog to review after it ships.
- **Trade-off:** Setting aside their list can feel dismissive. Building all twelve spreads the budget over symptoms.
- **Follow-up to expect:** "Each feature has an executive behind it." Show which problem each feature serves, and let the sponsor rank them.

</details>

<details>
<summary>Practice question 6. Describe a time discovery changed the problem you set out to solve.</summary>

- **Answer:** Use a real case in four parts. What was asked, for example faster document entry. What discovery showed, such as waits for approval causing most of the delay. What changed in the plan and who agreed. The result, with a number. Keep it about the evidence and the decision, not about being right.
- **Trade-off:** A story where you overrode the customer can sound arrogant. Show that the customer made the call with your evidence.
- **Follow-up to expect:** "What if you had been wrong?" Say how you would have found out: the baseline and the agreed metric.

</details>

## Asking without leading

Taught in [the discovery conversation](01_The_Discovery_Conversation.md).

<details>
<summary>Practice question 7. How do you run a discovery session without leading the customer to your answer?</summary>

- **Answer:** Ask about past events, not opinions: "Walk me through the last case you handled." Use open questions and avoid naming a solution. Let silences run. Ask for examples and numbers. Keep my design ideas out of the room until the problem is agreed, and note them for later.
- **Trade-off:** Open questions take longer to reach detail. Leading questions get quick agreement to the wrong thing.
- **Follow-up to expect:** "The customer asks what you would build." Say you will propose once you have seen the work, and give a date.

</details>

<details>
<summary>Practice question 8. Give five interview questions that surface workarounds.</summary>

- **Answer:** "What do you keep outside the system to get this done?" "When did a case last get stuck, and what did you do?" "Who do you message when information is missing?" "What do new starters get wrong in their first month?" "What would break if you were off for two weeks?" Each asks about real behaviour, which is where workarounds show.
- **Trade-off:** These questions can make staff wary of blame. Say you are looking at the process, not their performance.
- **Follow-up to expect:** "They say there are no workarounds." Ask to see their screen during a real case.

</details>

<details>
<summary>Practice question 9. What questions do you ask a daily user, a business owner and a system administrator?</summary>

- **Answer:** The user: walk me through your last case, where do you wait, what do you check twice. The business owner: what does this cost, what result would make it worth funding, who else must agree. The administrator: which systems and data are involved, who grants access, what changes need approval and how long they take.
- **Trade-off:** Separate sessions take longer. Mixing roles in one room makes users quieter.
- **Follow-up to expect:** "Their answers conflict." Good: conflicts point at where the process differs from the description.

</details>

## Watching the work

Taught in [observing the work](06_Observing_the_Work.md).

<details>
<summary>Practice question 10. How do you learn how a process really runs, including its exceptions?</summary>

- **Answer:** Interview first to get the described process, then sit with each role on their live queue and note when cases start, wait, move and come back. Ask about every stop. Then read the system records to see how often each pattern happens. Exceptions show up as the cases people park, forward or handle by phone.
- **Trade-off:** This takes days, not hours. A process built from the description alone misses the costly cases.
- **Follow-up to expect:** "There is no system data." Keep a tally sheet with the team for a week.

</details>

<details>
<summary>Practice question 11. What does each stakeholder group know that the others do not?</summary>

- **Answer:** Sponsors know the goal, budget and politics. Process owners know the official process and its targets. Users know the workarounds, waits and exceptions. Control owners know which steps rules require. System owners know the data, access and change rules. No single group sees the whole process, so discovery has to reach all of them.
- **Trade-off:** Meeting every group costs time. Missing one usually costs a late surprise.
- **Follow-up to expect:** "Which group do teams skip?" Control owners, and frontline users when access is guarded.

</details>

<details>
<summary>Practice question 12. Design a half-day observation exercise for a claims team.</summary>

- **Answer:** Brief the team lead and staff on purpose and confidentiality. Sit with two handlers for ninety minutes each on live claims, noting timestamps, waits, handoffs and side tools. Spend thirty minutes with the team lead on what a bad week looks like. Collect copies of checklists and templates. Then compare notes with a week of claim timestamps.
- **Trade-off:** Two people is a small sample. It tells you what to measure, and the system data tells you how often.
- **Follow-up to expect:** "Staff are nervous." Share your notes with them afterwards and remove names.

</details>

## References

1. The lessons linked under each heading in this module.

## Key takeaways

- Business discovery first, technical discovery close behind.
- Turn a requested solution into a problem, a metric and a user.
- Ask about past events and real cases, not opinions.
- Observe live work, then size what you saw with system data.

## Check yourself

<details>
<summary>1. Why ask "walk me through the last case" instead of "how does the process work"?</summary>

A real past case brings out the waits, workarounds and exceptions. A general question gets the official process.

</details>

<details>
<summary>2. In practice question 5, why group the twelve features by problem?</summary>

Grouping shows that several features share one root cause, so one change can remove most of the pain.

</details>
