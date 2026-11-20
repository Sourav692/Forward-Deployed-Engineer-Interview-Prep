---
title: "Practise stakeholder communication"
subtitle: "Seven behavioural practice questions on explaining a solution, running workshops and demos, reporting bad news, rescuing a stalled engagement and cutting scope. Answer aloud, then compare with the outline."
track: The FDE Role and Leading in the Field
module_group: Leading in the field
module_code: T19.2
module_name: Stakeholder communication
lesson: 6
lessons: ["One design, three audiences", "Workshops and reviews that decide", "Demos that tell the truth", "Updates, decision notes and bad news", "Negotiating scope and deadlines", "Practise stakeholder communication"]
level: intermediate
reading_time: "14 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "21 November 2026"
tags: [practice, interview, behavioural, stakeholders, communication]
---

## How to use this practice

These questions come up in behavioural and customer rounds. The interviewer wants a real situation, what you did, the result and what you would change. Each model answer below uses a composite engagement to show that shape. Replace it with your own story when you practise.

1. Read the question and set a two-minute timer.
2. Answer aloud, as you would to an interviewer, from one of your own engagements.
3. Open the outline and compare. Check that you named what you did yourself, gave a result with a number or a decision, and said what you would change.

How to build and rehearse the stories themselves is taught in the Career lesson [three formats for one project](../../../../01_Concept_Tutorials/Consolidated_Lessons/T7.1_Telling_the_Build_Story/01_Three_Formats_for_One_Project.md). Saltcote Housing and Brackley Media are composites, not real customers, and every figure below is illustrative.

> **What you'll practise**
>
> - Explaining one solution to three different listeners.
> - Designing a workshop that decides and a demo that shows an exception.
> - Writing a decision note, an update and an escalation after a failed experiment.
> - Recommending a way forward for a stalled engagement.
> - Cutting ten requested features to what fits in three weeks.

## Explaining one solution

Taught in [one design, three audiences](01_One_Design_Three_Audiences.md).

<details>
<summary>Practice question 1. Explain one solution you built three ways, in about a minute each: to a finance director, to a security architect and to a person who will use it every day.</summary>

- **Answer:** *Situation.* At a housing association I built an assistant that drafts repair jobs from tenants' reports. *What I did.* To the finance director: "It saves about 184 planner hours a month, worth about £4,600, against £2,400 running cost, with a spending cap." To the security architect: "Reports stay in your cloud tenancy, sign-in uses your existing accounts, the model sees no tenant names, and every draft is logged." To a planner: "You check a draft in about two minutes instead of keying the job in six, and you still approve every job." *Result.* All three signed off within a week. *What I would change.* I would write the shared fact sheet before the first meeting, not after the second.
- **Trade-off:** One-minute versions leave things out. Keep the main caveat in each, here that 8 in 100 drafts need correcting.
- **Follow-up to expect:** "The security architect asks about the model provider's data retention." Answer in one sentence and offer the contract terms in writing.

</details>

## Workshops and demos

Taught in [workshops and reviews that decide](02_Workshops_and_Reviews_That_Decide.md) and [demos that tell the truth](03_Demos_That_Tell_the_Truth.md).

<details>
<summary>Practice question 2. Design a 90-minute workshop that must decide how the customer's teams handle cases the AI cannot classify.</summary>

- **Answer:** *Situation.* At the housing association, about 8 in 100 repair reports could not be classified with confidence, and repairs and tenant services disagreed about who should handle them. *What I did.* I wrote three closed questions, each with one approver: who owns unclassified reports, what response time applies, and when the rule is reviewed. I sent a two-page pre-read two days ahead and asked four named people for written comments. In the room I gave each question 25 minutes, sorted objections as constraints, missing facts or preferences, and kept 15 minutes to read the decisions back. *Result.* Two questions were decided in the room and the third a week later, once an analyst brought the volumes. *What I would change.* I would invite fewer observers.
- **Trade-off:** Tight timeboxes cut some discussion short. Recording dissent shows people they were heard.
- **Follow-up to expect:** "Someone senior arrives and reopens everything." Restate the questions and the approvers, and offer them a separate slot.

</details>

<details>
<summary>Practice question 3. Plan a ten-minute demo of an AI system for a customer's leadership, including one exception and how the system recovers.</summary>

- **Answer:** *Situation.* At a media firm I demonstrated an archive search assistant to the chief executive and two directors. *What I did.* Minute 1: the problem in their numbers, hours lost searching. Minutes 2 to 5: three searches taken from producers' real requests, one vaguely worded. Minutes 5 to 7: a search that hits a clip with no licence record, which the system holds back and sends to the rights desk in one click. Minutes 7 to 9: what is not built yet, and the pilot plan. Minute 10: the decision we needed. I kept recordings of each scenario ready. *Result.* They approved a pilot with 20 producers, with no surprise in its first week. *What I would change.* I would bring a producer to run one search.
- **Trade-off:** Showing an exception looks less polished. It is the part that builds trust.
- **Follow-up to expect:** "The exception fails too." Say so plainly, play the recording and send the cause the next day.

</details>

## Updates, escalations and stalled work

Taught in [updates, decision notes and bad news](04_Updates_Decision_Notes_and_Bad_News.md).

<details>
<summary>Practice question 4. Tell me about a decision you documented for a customer, and the weekly update in which you reported it.</summary>

- **Answer:** *Situation.* The housing association had to choose between keeping a planner's approval on every job and approving only low-confidence drafts. *What I did.* I wrote a one-page decision note: context, the two options with their risk and planner time, the choice (approve every job for three months), consequences, and a revisit trigger: reopen if, over a month, fewer than 2 in 100 high-confidence drafts need changes. That week's update led with "Green: planner approval decided, see note", then results against targets, risks and "No decisions needed this week". *Result.* When the trigger was met in month three, the review took one meeting. *What I would change.* I would agree the trigger with tenant services before writing the note.
- **Trade-off:** Notes take an hour to write. They save repeated arguments about why a choice was made.
- **Follow-up to expect:** "Who reads these?" Name each reader and what they use it for.

</details>

<details>
<summary>Practice question 5. Tell me about an experiment that failed and that you had to escalate.</summary>

- **Answer:** *Situation.* I recommended training a small model to classify repair reports. The first test scored 71 in 100 against a target of 85, and an alternative scored 88. *What I did.* I told the sponsor that week, starting with "I recommended this approach and the test rules it out for now." I gave the alternative's cost, about £1,800 a month more, and its switching time of one week, and asked for a decision by Friday to protect the pilot date. *Result.* She chose to switch in ten minutes, and the new approach reached 92 in 100 after tuning. *What I would change.* I lost two weeks hoping for a fix before reporting. Now I report a missed target in the week I see it.
- **Trade-off:** Escalating your own miss costs some credibility. Hiding it costs far more.
- **Follow-up to expect:** "What did you learn about the first approach?" The past job records used inconsistent trade codes, which the model copied.

</details>

<details>
<summary>Practice question 6. An engagement you joined has stalled for six weeks: no decisions, and the sponsor has stopped attending. What do you recommend, and how?</summary>

- **Answer:** *Situation.* I took over a media firm's search engagement after six weeks with no decisions. *What I did.* I spent a week finding why: three open questions with no approver, and a sponsor who had lost confidence after a failed demo. I asked for 30 minutes with her and brought a one-page recommendation: the cause, a narrower first release for one team in four weeks, the two decisions needed from her by a date, and the option to stop with what we had built so far. *Result.* She chose the narrow release and named an approver for each open question. The first release shipped in five weeks. *What I would change.* I would have offered the stop option in writing, not only aloud.
- **Trade-off:** Offering to stop risks the engagement. A stalled one is already at risk, and a real choice brings the sponsor back.
- **Follow-up to expect:** "She will not meet you." Go through your own manager to theirs, with the same one page.

</details>

## Scope under a fixed date

Taught in [negotiating scope and deadlines](05_Negotiating_Scope_and_Deadlines.md).

<details>
<summary>Practice question 7. A customer asks for ten features in three weeks. Your team can build about four. Walk me through what you did.</summary>

- **Answer:** *Situation.* The housing association's tenant services team wanted ten portal features before a tenant newsletter went out in three weeks. *What I did.* I asked what the newsletter needed to announce: online repair reporting with progress updates. I sized all ten: about 48 days of work against 21 days available after a reserve for testing. The three features the newsletter needed came to 17 days. I offered two options: those three by the date, fully tested, and the rest in two later releases, or a later newsletter with five features. *Result.* They chose the first, and the newsletter went out on time. *What I would change.* I would put the sizing table in front of them in the first meeting.
- **Trade-off:** Cutting scope disappoints early. Shipping ten half-tested features disappoints tenants, which matters more.
- **Follow-up to expect:** "They insist on all ten." Show the days again and ask which date or which features they will move.

</details>

## References

1. The lessons linked under each heading in this module.
2. The Career lesson [three formats for one project](../../../../01_Concept_Tutorials/Consolidated_Lessons/T7.1_Telling_the_Build_Story/01_Three_Formats_for_One_Project.md), for preparing the stories behind these answers.

## Key takeaways

- Answer behavioural questions with the situation, what you did, the result and what you would change.
- Give each audience the answer to its own decision, from one set of facts.
- Workshops decide when questions are closed and each has one approver.
- Report misses in the week you see them, starting with what you recommended.
- Rescue a stalled engagement with its cause, a narrower path and a real choice for the sponsor.
- Cut scope with arithmetic, and keep testing out of the trade.

## Check yourself

<details>
<summary>1. In practice question 6, why include the option to stop in a rescue recommendation?</summary>

It gives the sponsor a real choice. A stalled engagement is already at risk, and naming the stop option shows you are protecting her budget, which brings her back to the decision.

</details>

<details>
<summary>2. Why does each model answer end with what the candidate would change?</summary>

It shows the interviewer you learn from your own work. An answer with no change suggests either a perfect engagement, which is rare, or no reflection.

</details>
