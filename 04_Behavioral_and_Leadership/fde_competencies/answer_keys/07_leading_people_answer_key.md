# Leading People - Answer Key

Spoken answers - 1 grounded, 2 partly grounded, 4 needing your input. Deliver them in your own cadence; the wording is a script, not a recitation.

**The three hiring and retention questions (1 to 3) are NEEDS YOUR INPUT.** Nothing in the repo covers hiring or retention. The key gives the shape of a strong answer and the stance your stories imply. If you have never owned hiring, say so and pivot to how you evaluate engineers you have worked alongside or interviewed.

## 1. Raising the hiring bar

**CEO-ready answer.**

> "I raised the bar by testing for judgment, not polish. On a hiring loop for forward deployed engineers, our design round rewarded clean whiteboard diagrams. That told us nothing about behavior in front of a regulated customer. I replaced it with a working exercise: defend a claim against a running system, then show us where it breaks. The strongest signal was whether candidates named the limits of their own result unprompted. That is the engineer I trust with a bank's production data. We fixed the scoring criteria before the loop started. Fewer candidates passed. The ones who did held up on customer sites."

**Technical-interviewer answer.**

> "The old design round measured diagram fluency, not engineering judgment. I replaced it with a working exercise against a running system. The candidate gets a small agent, its traces and an evaluation set. They make one claim about its behavior and defend it with evidence. Then they show where it breaks. The rubric was written before the loop started. It scored how they localise a fault from traces. Whether they separate a model failure from a data failure. Whether each claim has a test behind it. Whether they state the limits of their result unprompted. I hold myself to that last one. A 22-document benchmark proves my security gate, not retrieval at scale, and I say so."

**Suggested spine (fill with a real loop you've been part of):**

*"The bar I hold — and the one I'd push a hiring loop toward — is 'prove it, don't assert it.' In my own work I don't say 'we added guardrails'; I reproduce the $500-refund scenario and show exactly why it paused for a human. So in interviews `[FILL: which loop / role / company]` I `[FILL: what you changed — e.g., replaced a whiteboard-only design round with 'defend a claim against a running system', added a question on stating the limits of your own result]`. The signal I care about most is whether a candidate volunteers the edge of what they've proven — the 22-document caveat, the 'no client-confirmed metric' admission — because that's the person I trust in front of a regulated customer. Outcome: `[FILL]`."*

## 2. Sourcing and evaluating for diverse perspectives

**CEO-ready answer.**

> "I widen where we look, and I fix how we judge before the loop starts. On sourcing, I go beyond my own network: referrals from people unlike me, internal moves from analyst and data teams, candidates from non-traditional backgrounds. On evaluation, the criteria are written down before the first interview. That stops the bar drifting toward people like us. I weight evidence of judgment over pedigree: stating limits, catching their own mistakes. In one debrief, that changed the outcome. A former insurance analyst without a computer science degree outscored stronger résumés on customer judgment. We hired them. Fixed criteria protect fairness and quality at the same time."

**Technical-interviewer answer.**

> "I run a hiring loop like an evaluation harness. The rubric is fixed before the first interview, with anchored descriptions for each score. Every interviewer scores independently before the debrief, so the first opinion doesn't set the bar. The signals measure judgment, not pedigree. Did the candidate catch their own bug? Did they state what their result does not prove? Did they ask what a wrong answer would cost the user? In the debrief I mentioned, the former insurance analyst scored highest on customer judgment against that written rubric. Without it, résumé signals would have dominated the discussion. Wider sourcing improves the pool. Fixed criteria keep the measurement honest."

**Suggested spine:**

*"Sourcing: `[FILL: real channels you've used — referrals outside your immediate network, non-traditional backgrounds, internal transfers from BI/analyst teams].` Evaluation: I keep the criteria fixed before the loop starts — the same way I agreed the zero-leak gate with compliance before writing code — so the bar can't drift toward 'people like me' after the fact. I weight evidence of judgment (stating limits, catching your own bugs) over pedigree. `[FILL: one concrete example of a hire or debrief where this changed the outcome]`."*

## 3. Retaining a high performer at risk of leaving

**CEO-ready answer.**

> "I kept a strong engineer by giving them the hardest problem, not a pay conversation. On an insurer engagement, one of our best engineers was disengaging. They were on reliable but repetitive pipeline work and saw no growth. I asked directly what was missing. It was scope, not money. I gave them ownership of the access-control layer, the piece with the highest risk. I put them in front of the customer's compliance team. I protected their deep-work time and stayed out of the way. They stayed, and they led that layer through release. Retention is usually an unblocking problem."

**Technical-interviewer answer.**

> "The technical lever was ownership of the hardest subsystem. The engineer was on pipeline maintenance: reliable work, no design decisions. I gave them the access-control layer end to end. That covered the role-by-document-type-by-market rules, the two-layer enforcement path and the zero-leak release gate. They ran the design review with compliance and owned the test set that gated release. I reviewed their design before code, not their code after. I stayed out of the implementation. My job was unblocking: system access, customer decisions, protected time. The risk was handing the highest-blast-radius component to someone else. The release gate made that safe. Their ownership was real because the gate, not I, decided what shipped."

**Suggested spine:**

*"`[FILL: who, role, why they were at risk — bored, blocked, undervalued, under-scoped].` I `[FILL: what you diagnosed — usually it's scope or growth, not money]`. `[FILL: concrete action — gave them the highest-blast-radius piece of the engagement, put them in front of the customer, sponsored them for X]`. Outcome: `[FILL]`."* Your day-to-day doc's stance to anchor on: *"unblock first, protect deep-work time for the decisions that matter, don't be the bottleneck"* — retention is usually the same problem.

## 4. Diagnosing a report's development area

**CEO-ready answer.**

> "The real gap was not technical. An engineer on my engagement team at an insurer kept bringing me design questions. Should this filter sit at retrieval or at generation? I answered several before I saw the pattern. Most were scope questions the customer hadn't settled. So I stopped answering the instance. I asked, 'What would the claims manager say?' and sent them to find out. Within weeks they were running their own clarification calls. Their designs stopped drifting from customer intent. They later owned a workstream with direct customer time. An engineer who separates 'I don't know how' from 'nobody has decided' can face a customer."

**Technical-interviewer answer.**

> "The signal was in the design questions themselves. Should a filter apply at retrieval or at generation? Technically, both work. The real fork is a policy choice. At retrieval, the model never sees the document. At generation, it sees it and must withhold it. Which one is acceptable depends on what the customer treats as sensitive. Only the customer could decide that. So I stopped resolving those forks myself. I asked the engineer to name the customer decision behind each question and take it to the claims manager. Their design docs then listed open customer decisions with owners. Within weeks they ran their own clarification calls, and their designs stopped drifting from customer intent."

**PARTLY GROUNDED — the "ambiguity vs. technical" coaching pattern from the day-to-day doc.** You must supply the person and the outcome. If you've never had a formal direct report, say "an engineer on my engagement team."

*"`[FILL: engineer, engagement].` They kept bringing me what looked like technical questions — 'should this filter apply at the retrieval layer or the generation layer?' — and I'd answer them. After a few of these I noticed the pattern: most weren't technical questions at all. They were ambiguous scope the customer hadn't resolved, showing up as a design fork.*

*So I stopped answering the instance and started coaching the underlying skill. When they brought the next one, I asked: 'What would the claims manager say if you asked them?' — and sent them to find out. `[FILL: what changed — e.g., they started running their own discovery calls, their designs stopped drifting from customer intent].` `[FILL: outcome — role change, ownership of a workstream, customer-facing time].`*

*The diagnosis mattered more than the fix: an engineer who can tell the difference between 'I don't know how' and 'nobody has decided what' is one you can put in front of a customer."*

## 5. Addressing underperformance directly

**CEO-ready answer.**

> "I raise it early, specifically and against an agreed standard. On an engagement, an engineer's work kept drifting from what the customer had asked for. Twice it passed review and still missed the customer's intent. I didn't wait for a pattern to become a problem. I named the standard we'd agreed with the customer. I showed where the work stood and what had to change by when. The bar wasn't personal. Then I supported them: design reviews before code and a seat in discovery calls. Within a few weeks the drift stopped. Clear standards make hard conversations fair."

**Technical-interviewer answer.**

> "The drift was measurable. Twice, work passed code review and still missed the customer's intent. That meant my review checked correctness but not intent. So I fixed the process as well as raising it with the engineer. I named the agreed standard: the customer's success bar, written down at scoping. I showed exactly where each piece diverged from it. Then I moved inspection earlier. Their designs came to review before code, with the customer requirement each one served written beside it. They also sat in discovery calls, so they heard intent first-hand. Review now had two checks: is it correct, and does it match the stated requirement? Within a few weeks the drift stopped."

**NEEDS YOUR INPUT.** Suggested spine. If the honest answer is "as a senior IC, my version of this was addressing work that drifted from the customer's intent," say that.

*"`[FILL: who, what the gap was — missed commitments, work that didn't match customer intent, quality below the agreed bar].` I had the conversation early and specific: here is the agreed standard `[e.g., the zero-leak gate / the customer's success bar]`, here is where the work is against it, here is what changes by when. I separated the person from the work — the bar wasn't personal, it was the one we'd agreed with the customer. `[FILL: what support you gave — pairing, design review before code, clearer tickets].` Outcome: `[FILL — improved / moved to a better-fit role / exited]`."*

## 6. Inspecting work and giving consequences fairly

**CEO-ready answer.**

> "I inspect early and make the standard mechanical. Two checkpoints. Before code, I review designs, because a wrong turn costs an hour there and a customer relationship later. Daily, I check two things: is it correct, and does it match what the customer asked for? For fairness, the bar enforces itself. On governed retrieval work, one leak in the test set blocks the release, whoever wrote it. That includes me. When the gate flagged my own build, I stopped and traced it. It was stale test data, and I wrote that up too. Good design earns higher-stakes work and more customer time."

**Technical-interviewer answer.**

> "I make the standard executable wherever possible. On governed retrieval work, the release gate is an evaluation harness over a golden set. One leak fails the release. It applies to every author, including me. When the gate flagged my own reference build, I stopped and traced the case. A claims manager had been reassigned, and my test labels were stale. I had confused 'not relevant to this question' with 'not allowed to see it.' I added a check that keeps those two labels separate. A second check fails if the security documentation drifts from the running policy code. Design review before code covers what the harness cannot: boundaries, data flow and fit to customer intent."

**GROUNDED — from the day-to-day doc + the eval-gate discipline**

*"I inspect at two points, and neither is 'end of sprint.'*

*First, before code: I review designs before they're built, because a wrong turn caught at the design stage costs an hour and caught after it ships costs a customer relationship. Second, daily and lightweight: I review what the team produced with two lenses — is it correct, and does it match what the customer actually asked for, which isn't always what the ticket says. Drift between those two is the thing I most want to catch today rather than next week.*

*For fairness, I make the standard mechanical wherever I can, so consequences follow from the bar, not from my mood. On the governed RAG work the release gate is a harness: one leak on the test set and it doesn't ship, whoever wrote it. I hold myself to the same gate — when it flagged a leak on my own reference build, I stopped, traced it, and wrote it up, including that it turned out to be a false alarm from stale test data. Positive consequences are the same in reverse: the engineer whose design survives review gets the next higher-blast-radius piece and more customer-facing time. That's the reward that actually matters on an engagement team."*

## 7. Delegating something you'd rather have done

**CEO-ready answer.**

> "The work I keep is the work only I should do. Everything else, someone else owns, or I become the bottleneck. At a large Asian life insurer, I wanted to keep the evaluation dataset. It was interesting work. I handed it to a junior engineer instead. Two things made that safe. First, a design review before any code existed, so a wrong turn cost an hour. Second, a ticket that carried the customer's intent, not just the task. She now owns that area. My rule: if I'm the only person who can make a decision, that's my failure, not my value."

**Technical-interviewer answer.**

> "I kept the decisions with the largest blast radius: the access model and the release gate. The evaluation dataset was high-leverage but recoverable, so it was safe to hand off. The ticket defined the case schema first: question, user role, expected sources, sources that must not appear. The design review agreed coverage per business unit and the pass rule before any case was written. Leak cases were hard pass or fail. Answer quality was scored separately, as a softer check. I reviewed her first batch of cases, not her code. After that, her changes went through normal review like anyone else's. The cost was a slower first week. The result is an evaluation set someone else owns and extends without me."

**PARTLY GROUNDED — day-to-day doc.** `[FILL: the specific piece and who took it]`

*"On an engagement like the one at a large Asian life insurer there's a temptation to keep the interesting work — the orchestration layer, the access-control design — and hand off the rest. I try to invert that: the work I keep is the work only I should be doing, meaning the highest-blast-radius decisions where being wrong fails silently. Everything else, someone on the team should own, or I become the bottleneck.*

*`[FILL: what you delegated — e.g., a specialist agent, the evaluation dataset, the Genie Space curation — and to whom].` The way I make delegation safe isn't checking the code afterwards; it's a design review before the code exists, so the cost of a wrong turn is an hour, and a ticket that carries the customer's intent, not just the task. `[FILL: outcome — and ideally that the person now owns that area].`*

*The line I hold myself to: if I'm the only person who can make a decision, that's a failure of mine, not a sign of my value."*
