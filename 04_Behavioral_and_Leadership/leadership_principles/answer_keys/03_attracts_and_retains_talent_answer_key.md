# Attracts and Retains Talent - Answer Key

Spoken answers - 3 needing your input. Deliver them in your own cadence; the wording is a script, not a recitation.

**All three of these are NEEDS YOUR INPUT.** Nothing in the repo covers hiring or retention. Below is the shape of a strong answer and the stance your stories imply. If you've never owned hiring, say so and pivot to how you evaluate engineers you've worked alongside or interviewed.

## 1. Raising the hiring bar

**CEO-ready answer.**

> "I raised the bar by testing for judgment, not polish. On a hiring loop for forward deployed engineers, our design round rewarded clean whiteboard diagrams. That told us nothing about behavior in front of a regulated customer. I replaced it with a working exercise: defend a claim against a running system, then show us where it breaks. The strongest signal was whether candidates named the limits of their own result unprompted. That is the engineer I trust with a bank's production data. We fixed the scoring criteria before the loop started. Fewer candidates passed. The ones who did held up on customer sites."

**Technical-interviewer answer.**

> "The old design round measured diagram fluency, not engineering judgment. I replaced it with a working exercise against a running system. The candidate gets a small agent, its traces and an evaluation set. They make one claim about its behavior and defend it with evidence. Then they show where it breaks. The rubric was written before the loop started. It scored how they localise a fault from traces. Whether they separate a model failure from a data failure. Whether each claim has a test behind it. Whether they state the limits of their result unprompted. I hold myself to that last one. A 22-document benchmark proves my security gate, not retrieval at scale, and I say so."

**Suggested spine (fill with a real loop you've been part of):**

*"The bar I hold — and the one I'd push a hiring loop toward — is 'prove it, don't assert it.' In my own work I don't say 'we added guardrails'; I reproduce the $500-refund scenario and show exactly why it paused for a human. So in interviews `[FILL: which loop / role / company]` I `[FILL: what you changed — e.g., replaced a whiteboard-only design round with 'defend a claim against a running system', added a question on stating the limits of your own result]`. The signal I care about most is whether a candidate volunteers the edge of what they've proven — the 22-document caveat, the 'no client-confirmed metric' admission — because that's the person I trust in front of a regulated customer. Outcome: `[FILL]`."*

## 2. Retaining a high performer at risk of leaving

**CEO-ready answer.**

> "I kept a strong engineer by giving them the hardest problem, not a pay conversation. On an insurer engagement, one of our best engineers was disengaging. They were on reliable but repetitive pipeline work and saw no growth. I asked directly what was missing. It was scope, not money. I gave them ownership of the access-control layer, the piece with the highest risk. I put them in front of the customer's compliance team. I protected their deep-work time and stayed out of the way. They stayed, and they led that layer through release. Retention is usually an unblocking problem."

**Technical-interviewer answer.**

> "The technical lever was ownership of the hardest subsystem. The engineer was on pipeline maintenance: reliable work, no design decisions. I gave them the access-control layer end to end. That covered the role-by-document-type-by-market rules, the two-layer enforcement path and the zero-leak release gate. They ran the design review with compliance and owned the test set that gated release. I reviewed their design before code, not their code after. I stayed out of the implementation. My job was unblocking: system access, customer decisions, protected time. The risk was handing the highest-blast-radius component to someone else. The release gate made that safe. Their ownership was real because the gate, not I, decided what shipped."

**Suggested spine:**

*"`[FILL: who, role, why they were at risk — bored, blocked, undervalued, under-scoped].` I `[FILL: what you diagnosed — usually it's scope or growth, not money]`. `[FILL: concrete action — gave them the highest-blast-radius piece of the engagement, put them in front of the customer, sponsored them for X]`. Outcome: `[FILL]`."* Your day-to-day doc's stance to anchor on: *"unblock first, protect deep-work time for the decisions that matter, don't be the bottleneck"* — retention is usually the same problem.

## 3. Sourcing and evaluating for diverse perspectives

**CEO-ready answer.**

> "I widen where we look, and I fix how we judge before the loop starts. On sourcing, I go beyond my own network: referrals from people unlike me, internal moves from analyst and data teams, candidates from non-traditional backgrounds. On evaluation, the criteria are written down before the first interview. That stops the bar drifting toward people like us. I weight evidence of judgment over pedigree: stating limits, catching their own mistakes. In one debrief, that changed the outcome. A former insurance analyst without a computer science degree outscored stronger résumés on customer judgment. We hired them. Fixed criteria protect fairness and quality at the same time."

**Technical-interviewer answer.**

> "I run a hiring loop like an evaluation harness. The rubric is fixed before the first interview, with anchored descriptions for each score. Every interviewer scores independently before the debrief, so the first opinion doesn't set the bar. The signals measure judgment, not pedigree. Did the candidate catch their own bug? Did they state what their result does not prove? Did they ask what a wrong answer would cost the user? In the debrief I mentioned, the former insurance analyst scored highest on customer judgment against that written rubric. Without it, résumé signals would have dominated the discussion. Wider sourcing improves the pool. Fixed criteria keep the measurement honest."

**Suggested spine:**

*"Sourcing: `[FILL: real channels you've used — referrals outside your immediate network, non-traditional backgrounds, internal transfers from BI/analyst teams].` Evaluation: I keep the criteria fixed before the loop starts — the same way I agreed the zero-leak gate with compliance before writing code — so the bar can't drift toward 'people like me' after the fact. I weight evidence of judgment (stating limits, catching your own bugs) over pedigree. `[FILL: one concrete example of a hire or debrief where this changed the outcome]`."*
