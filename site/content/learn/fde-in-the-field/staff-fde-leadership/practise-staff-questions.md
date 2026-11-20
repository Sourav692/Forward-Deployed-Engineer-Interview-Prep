# Practise Staff Questions


## How to use this practice

These are the questions a senior or staff FDE loop asks about your own work. Each outline shows the structure of a strong spoken answer, then a worked example from a composite staff FDE at Dunholme Systems. The example shows the shape. Your answer must use your own story.

Work through them in order:

1. Read the question and set a two-minute timer.
2. Answer aloud with a real story of your own.
3. Open the outline. Check your answer against the structure, not the example.

The full method for the project deep dive and for building your stories stays in the Career track: [telling the build story](/learn/communication-and-behavioural/telling-the-build-story/three-formats-for-one-project) for presenting a project, and the [story bank](/practice/story-bank) for building a set of stories that covers these questions. Dunholme Systems, Sedbergh Health, Wigton Ports, Brough Insurance and every figure below are composites, not real customers.

> **What you'll practise**
>
> - Defending a team metric: how it was measured and what your part was.
> - Telling an owned project and a failure with the parts interviewers look for.
> - Explaining a trade-off made under pressure, and influence without authority.
> - Walking an interviewer through an engagement you led, at a steady pace.

## A metric under challenge

Taught in [proof versus knowledge](/learn/communication-and-behavioural/telling-the-build-story/proof-versus-knowledge).

<details>
<summary>Practice question 1. You say your team cut referral triage time at a hospital customer by 40%. The interviewer replies: "That is a team number. How do you know the system caused it, and what was your part?"</summary>

- **Answer:** Use three parts. How it was measured: "Median time from a referral arriving to its first triage decision, from the scheduling system's own timestamps, four weeks before and four weeks after, about 2,000 referrals in each period. It fell from 50 minutes to 30." What else could explain it: "A new staff rota started in the same month. A second site with the same rota but no assistant fell only from 52 to 49 minutes, so most of the drop came from the assistant." Your part: "I designed the measurement and the routing logic. Two colleagues built the integration." Then name a limit before you are asked: "It is one hospital group, over one quarter."
- **Trade-off:** Naming the limits makes the number sound smaller. It also makes it survive the next three follow-ups, which an inflated number will not.
- **Follow-up to expect:** "What would you measure differently?" A longer window and accuracy alongside speed, because faster triage that routes referrals wrongly is not a win.

</details>

## Ownership and failure

Taught in the Career worksheet [ownership, standards and failure](/practice/ownership-standards-and-failure) and the [story bank](/practice/story-bank).

<details>
<summary>Practice question 2. Tell me about a project you owned from start to finish.</summary>

- **Answer:** Structure it in five parts: the stakes in one sentence, what you owned and where your ownership ended, two decisions with their trade-offs, the result with a number, and what you would change. Example: "Wigton Ports needed berth changes from ship agents handled in minutes, not hours. I owned the assistant from discovery to handover, and the port's IT team owned the berth system. I chose to draft changes for a planner to approve rather than write them directly, and to integrate through the port's existing message queue instead of a new API. Median handling time fell from 3 hours to 25 minutes. I would bring the port's support team in at week two, not week ten."
- **Trade-off:** Owning end to end means owning the parts that went badly. Leave them out and the story sounds rehearsed.
- **Follow-up to expect:** "What would have happened if you had not been there?" Name what the team could already do without you by the end.

</details>

<details>
<summary>Practice question 3. Tell me about a time you failed.</summary>

- **Answer:** Use the four beats from the ownership worksheet: own the call in one sentence, spend most of the time on what you missed, then the correction and what changed for good. Example: "I estimated the first Sedbergh pilot at eight weeks, assuming clean referral data. I missed that two clinics coded urgency differently, and I did not profile the data before committing to the date. We slipped five weeks, and I told the sponsor in week six, later than I should have. I paused new features, mapped the codes with the clinics and reset the date with her. Since then I profile customer data in week one and raise a slip at the first missed milestone."
- **Trade-off:** A real failure exposes a weakness. A safe, minor one exposes that you avoid the question, which reads worse at staff level.
- **Follow-up to expect:** "How did the sponsor react?" Describe the reaction plainly, then what you did to rebuild trust.

</details>

## Pressure and influence

Taught in the Career worksheets [delivery under pressure](/practice/delivery-under-pressure) and [communication and influence](/practice/communication-and-influence), and in [platform investment from field evidence](/learn/fde-in-the-field/staff-fde-leadership/platform-investment-from-field-evidence).

<details>
<summary>Practice question 4. Describe a trade-off you made under time pressure.</summary>

- **Answer:** Name the deadline, the options, the criteria you used, who agreed, the outcome and when you revisited it. Example: "Wigton Ports wanted the assistant live ten days before peak season. Automatic berth updates scored 92% correct on our evaluation set against the 98% we had agreed. The options were to delay, to go live with automatic updates, or to go live with a planner approving every change. I recommended approval on every change, the port's operations manager agreed in writing, and we went live on time. After four weeks of logged approvals we turned on automatic updates for the two lowest-risk change types."
- **Trade-off:** The approval step cost planners about an hour a day during peak season. It kept wrong berth changes out of the live schedule.
- **Follow-up to expect:** "Would you make the same call again?" Yes, and say what evidence would have changed it.

</details>

<details>
<summary>Practice question 5. Tell me about a time you influenced a team you had no authority over.</summary>

- **Answer:** Show that you learned what the other team wanted, gave them evidence in their terms, found allies and made a specific ask. Example: "Seven of our deployments had each built their own permission sync, and one copy exposed restricted documents for three days. Dunholme's product team owned the platform, and its roadmap was new features. I asked the product manager how she planned, costed the gap at about 58 engineer-weeks a year, brought security and support into the proposal and asked for 12 engineer-weeks with a fallback. She deferred it one quarter. With two more deployments logged, the next cycle accepted it. I would go to her before the incident, not after."
- **Trade-off:** Building allies takes weeks. Going over the product manager's head is faster once, and costs you the next proposal.
- **Follow-up to expect:** "What if they had said no again?" Keep the agreed fallback running, keep logging and ask what evidence would change the answer.

</details>

## The project deep dive

Taught in [the timed deep dive](/learn/communication-and-behavioural/telling-the-build-story/the-timed-deep-dive).

<details>
<summary>Practice question 6. Walk me through an engagement you led.</summary>

- **Answer:** Open with the situation in two sentences, then what you did, the result and what you would change. Spend most of the time on what you did, and stop at about 15 minutes so the interviewer can steer. Example: "Brough Insurance's claims team took two days to route new claims. I led a team of three for twelve weeks. I mapped the routing rules with the handlers, chose to suggest a queue for a handler to confirm rather than route automatically, and ran the evaluation with their senior handler. Routing time fell to four hours across about 6,000 claims a month. I would bring their IT team into the design in week one, not week six."
- **Trade-off:** A tight structure leaves out detail you are proud of. Hold it back for the follow-ups, where it carries more weight.
- **Follow-up to expect:** "What was the hardest decision?" Pick one, give the options and say why you chose.

</details>

## References

1. Will Larson, [Staying aligned with authority](https://staffeng.com/guides/staying-aligned-with-authority/), StaffEng, accessed 17 November 2026. Staff-plus authority as borrowed from the wider organisation, and the need to stay aligned with it.
2. The Career lessons linked under each heading, which hold the method for building and telling your own stories.
3. The lessons in this module, for the staff situations these questions draw on.

## Key takeaways

- Defend a team metric in three parts: how it was measured, what else could explain it and what your part was.
- Name the limit of a number before the interviewer finds it.
- An owned-project answer shows where your ownership ended and the parts that went badly.
- A failure answer spends most of its time on what you missed and on what changed for good.
- Influence without authority starts with the other team's goals and ends with a specific ask.
- A project deep dive runs situation, what you did, result and what you would change, with most of the time on what you did.

## Check yourself

<details>
<summary>1. In practice question 1, why does the second site matter?</summary>

It had the same new rota but no assistant, so its small drop shows how much of the change the rota explains. Without it, the rota could account for the whole 40%.

</details>

<details>
<summary>2. Why should a staff-level failure story be a real one rather than a minor slip?</summary>

The question tests whether you own mistakes and change how you work. A minor slip shows neither, and suggests you avoid the question.

</details>
