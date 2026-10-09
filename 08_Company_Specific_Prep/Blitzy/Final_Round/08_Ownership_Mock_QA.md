# Ownership: Mock Questions and Spoken Answers

Five questions for the Ownership round. The recruiter's brief: "Have 2-3 concrete examples ready of taking ownership of ambiguous problems and handling pushback. The more specific and outcome-focused, the better."

Each answer is written to be said out loud in about two minutes. Replace every `[bracket]` with your real detail before the interview. If a bracketed detail did not happen, cut that sentence rather than invent it. Do not quote a number you cannot defend.

Use one spine for every answer, from the [Ownership Story Workbook](02_Ownership_Story_Workbook.md): the situation, what was unclear or contested, the decision you owned, what you did, how you handled people, the result, and what you changed afterwards.

## Your stories

The answers mix two engagements, so the interviewer hears more than one project.

| Story | Engagement | Proves | Used in |
| --- | --- | --- | --- |
| A. A one-sentence brief became access rules | The insurer: multi-agent data assistant | Ownership of an ambiguous problem | Q1 |
| B. No unreviewed writes to the customer database | The NBFC: ticket triage agents | Pushing back on a senior stakeholder | Q2, Q4 |
| C. My first architecture broke, and I told the sponsor the same day | The insurer | Owning a delivery issue | Q3 |
| D. Starting narrow when the sponsor wanted wide | The insurer | Pushing back on scope | Q5 |

Two backup stories sit at the end, for when the interviewer asks for a different example.

Never use the client's name in an answer. Say "a large Asian life insurer" and "one of India's largest NBFCs".

Story C and question 4 in the [Technical Aptitude mock](06_Technical_Aptitude_Mock_QA.md) have the same lesson: one agent with too many tools failed, so you split it into specialists. If both come up on the same day, own it as a pattern. Say which engagement came first, `[insurer or NBFC]`, and what you did earlier the second time.

### Confirm before the interview

These details are bracketed in the answers because they are not yet written down anywhere. Fill them in from memory or drop the sentence.

- **Insurer:** who, if anyone, told you to bring compliance in sooner; who pushed for the wider launch, and how the sponsor responded.
- **NBFC:** who pushed for full automation, and their reason; what you showed them that changed their mind.
- **Both:** which engagement came first.

## 1. Taking ownership of an ambiguous problem

**Question:** Tell me about a time you took ownership of a problem where the goal was unclear and nobody had defined the solution. What did you do first, and how did it turn out?

**Scored on:** clear stakes, how you made the ambiguity visible, the decision you owned, a defensible result, what you changed afterwards.

**Spoken answer:**

"At a large Asian life insurer, the brief was one sentence: business users need natural-language answers over their governed data. It didn't say which users, which data, or what a wrong answer would cost. At the time, an ad-hoc question took two to ten business days through a BI queue. A new dashboard took about four weeks. I owned the build end to end, in about eight to nine weeks.

I didn't start designing. I ran two sets of conversations. First with the people who use the data: actuaries, claims managers and analysts. They told me the same question needs a different right answer depending on your role and your market. Then, separately, with compliance, legal and security. They told me which document types carry health disclosures.

That changed the job. The real problem was not 'answer questions'. It was 'answer questions without showing anyone data they shouldn't see'. So I turned it into concrete rules: a matrix of role, document type and market. And before building anything, I agreed a release gate with compliance: zero leaks on a fixed test set.

Then I narrowed the first build to two business units in one market, so we could prove it properly.

The result: on that slice, time-to-insight went from days to minutes, and new dashboards became self-serve.

One thing I'd change: I spoke to compliance in a second round, and it cost me a cycle. Now I bring compliance into the first round of discovery."

## 2. Pushing back on a senior stakeholder

**Question:** Tell me about a time you pushed back on a customer or a senior stakeholder. What did they want, why did you disagree, and what happened?

**Scored on:** respect for their goal, a real choice with trade-offs, evidence rather than opinion, staying calm, the outcome.

**Spoken answer:**

"At one of India's largest NBFCs, I built agents to speed up their IT support tickets. Simple tickets took one to one and a half days to close. Complex ones took four to five days. The customer wanted full automation. `[Their head of operations]` wanted the agents to find the problem and fix it, with no human in between. It would have been a great demo.

I pushed back. Some fixes write to their master customer database. At an NBFC, a wrong write is not just a bug. It is a compliance problem, and it is hard to undo.

But I didn't just say no. I gave them two options. Option one, full automation: faster on paper, but a wrong write hits customer records with nobody checking. Option two: the agents diagnose and propose the fix, and a person approves any write. A bit slower per ticket, but nothing reaches production unreviewed. I recommended option two, and I was open about the cost: `[some tickets still wait for a human]`.

They weren't convinced at first, because `[they wanted the bigger headline number]`. So I showed them `[a few draft fixes from our test run that were wrong]`, and asked: 'Would you want this one written to your customer database without a check?' That made the risk real.

They agreed. We shipped the diagnose-and-propose design, and we still got the big drop in triage time, because the agents did the slow part: finding the cause.

What I learned: pushback lands when you respect their goal, put a real choice on the table, and bring evidence, not opinion."

## 3. A plan you owned went wrong

**Question:** Tell me about a time something you owned went wrong. How did you find out, what did you tell the customer, and what changed afterwards?

**Scored on:** a real mistake that was yours, telling people early, a bounded fix, the recovery, a lasting change in how you work.

**Spoken answer:**

"At the insurer, my first design was one agent, one prompt and over twenty tools. It worked in demos. In real testing, it kept picking the wrong tool, and accuracy dropped as the conversation grew. We were a few weeks into a roughly two-month build, so time was short.

It was my design, so it was mine to fix. I told the sponsor the same day, before they found it, in three parts: what is broken, why, and the fix with its cost. The why was simple. Twenty tool descriptions plus the whole chat history in one prompt makes the model worse at picking the right tool. The traces showed it was a structure problem, not something more prompt tuning would fix.

The fix was a supervisor that sends each question to one of four specialist agents. One answers BI questions in SQL. One combines SQL with policy documents. One does statistics. One builds dashboards. I kept every existing tool and data asset, so the change stayed small and safe. When the supervisor is less than 60% sure what the user means, it asks a clarifying question instead of guessing. And I added tracing on every step plus a held-out test set, so I'd know within days if I was wrong again.

It worked, and we shipped on time. What the sponsor remembered was that they heard it from me first, with a plan.

What I carry from it: specialize early and keep each agent's context small. And when my design breaks, the customer hears it from me first, with the cause and the fix."

## 4. When they don't agree with you

**Question:** What would you have done if the NBFC had insisted on full automation anyway? Tell me how you handle being overruled.

**Scored on:** a clear recommendation, recording the risk, committing without sulking, making the chosen path safe, revisiting with data.

Answer honestly: in the real story they agreed. Say so, then explain what you would do. Do not invent a time you were overruled.

**Spoken answer:**

"In that project, they agreed with me. But it is their system and their call, so I've thought about what I'd do if they hadn't.

First, I'd make sure they decide with full information. I'd put my recommendation and the risk in writing, in one short message, so the decision is clear and nobody is surprised later.

Then I'd commit and make their choice as safe as I can. I wouldn't sulk or slow-walk it. I'd limit the agents to a short list of tables they are allowed to write to. I'd make every write log what it changed, so it can be reversed. I'd start with the lowest-risk ticket type. And I'd add a switch that turns automatic writes off in seconds.

Then I'd agree a check-in after `[two weeks]` with real numbers: how many writes, how many were wrong, how many were reversed. If the data shows it is safe, great, we expand. If not, we have the evidence to change course together, not an argument.

So my rule is: disagree clearly, decide together, then own the outcome of the path we picked."

## 5. Blitzy scenario: the VP wants everything at once

**Question:** A Blitzy customer's VP of Engineering wants their whole `[Java monolith]` modernized by the end of the quarter. Your assessment says that is not safe: test coverage is low and their reviewers are already stretched. The VP pushes back hard. What do you do?

**Scored on:** respecting the business goal, a real choice with trade-offs, a concrete first step with proof, a real precedent, accountability for either path.

**Spoken answer:**

"I've been in a version of this before. At the insurer, `[the sponsor]` wanted every business unit and every market at once, with about two months. I argued for two units in one market first. I framed it as their risk, not my convenience: an access mistake at launch can end an AI programme at an insurer. Compliance backed the narrow start. Every extra request went on a written expansion path, unlocked once the first slice held. They heard 'next', not 'no'.

I'd do the same here. First, I find out what the VP actually needs. Usually it's not 'every line by the quarter'. It's 'show the board real progress' or 'retire a costly system by a date'.

Then I give two options. Option A: modernize everything at once. With low test coverage, we can't prove the new code behaves like the old code. And their reviewers can't read that much code properly, so risky changes would get merged without a real check.

Option B: start with one domain that is useful but low risk. We write tests that capture what the old code does today. Blitzy generates the new code, and it must pass those tests. We switch over behind a feature flag. In `[four to six weeks]` the VP has a working piece in production and real numbers.

I recommend option B. If the VP still picks A, I write the risk down, add the strongest checks we can, and show the review load every week. Either way, I own the result."

## Backup stories

Use these when the interviewer says "give me a different example". Each is a 45-second outline. Expand it with the workbook's capture sheet before relying on it.

**NBFC: a vague ask turned into three ticket routes** (ambiguity)
- The ask was broad: `[use AI to fix our ticket backlog]`. Nobody had defined what that meant.
- I read `[N]` past tickets and sat with `[the support leads]`. It was three problems, not one: knowledge questions answered in their SOPs, data issues in their database, and real code bugs.
- So I built a supervisor that routes each ticket: a RAG agent over SOPs and past tickets, a read-only data agent, and a coding agent that searches their repo.
- Triage time dropped about 90% for simple tickets and 80 to 85% for complex ones. Be ready to say exactly how that was measured.

**Insurer: building the data foundation nobody owned** (ownership outside your lane)
- The engagement was scoped to the agent layer. The data the agents would query was, on paper, someone else's job, and the BI team whose queue I was replacing had reason to be wary of me.
- Agents can't be governed if the data isn't, so I built the foundation myself, inside their governed catalogue: raw tables, enrichment joins, and seven reviewed metric views. The agents query those views, never raw tables.
- The assets the data team had reviewed and endorsed were ranked first in routing, so their governance decisions were what the agents obeyed. `[Who on the data team was wary, and the sign they came round.]`
- Every number traces back to governed data. The honest flip side: doing it myself was right here, but it is also the fastest way to become the bottleneck.
