# Delivery Under Pressure - Answer Key

Two drafted, two NEEDS INPUT. This is the weakest section in the prep and the one to fix first — both gaps are failure-shaped, and a loop that hears only successes scores you as evasive.

## 1. A production issue at a customer site

**CEO-ready answer.**

> "Our model provider degraded during a client's busiest window. Answers slowed, then started timing out. We had built gateway fallback routing for exactly this failure, so I moved traffic to the secondary model that morning. That stopped the damage. The harder part was the conversation afterwards. I walked the client through what failed, what the fallback caught, and what it didn't: weaker answers on some complex queries. Then we added the durable fix. Failover now triggers automatically on latency, with an alert their own team owns. They kept the programme. Naming the close call, rather than hiding it, is why."

**Technical-interviewer answer.**

> "The failure was upstream. Our primary model provider degraded, and latency climbed until requests timed out. We had built fallback routing into the model gateway for this failure class. I switched traffic to the secondary model that morning, which stopped the timeouts. The trade-off showed up fast. The secondary model handled routine queries well but gave weaker answers on some complex ones. I put that in the post-incident review rather than leaving it out. The durable fix took a human out of the loop. Failover now triggers automatically on a latency threshold. The alert routes to the client's own on-call team. The guardrail is automatic failover with a named owner, not an engineer watching a dashboard."

**Anchor:** multi-agent deployment.

- **Situation.** [The specific incident — LLM provider degradation, latency spike, agent loop, or retrieval quality regression.]
- **Task.** Restore behaviour without breaking the client's confidence in the whole approach.
- **Action.** We had already built LLM gateway fallback routing for exactly this failure class, so immediate mitigation was routing. The harder part was the post-incident conversation: walking the client through what failed, what the fallback caught, and what it didn't.
- **Result.** [Recovery time and the durable fix added afterward.]

**Prepare carefully.** Your résumé claims zero go-live escalations, and interviewers will probe it. Give them a real near-miss with a specific hour and a specific decision. A candidate who names their close call reads as more credible than one with a spotless record.

## 2. Go-live in three days and it won't be ready

**CEO-ready answer.**

> "I raise it the same day. A late warning compounds. An early one is just a conversation. Then I bring options, not a problem: reduced scope on the date, full scope on a new date, or a phased go-live. I separate what truly blocks from what is merely incomplete. Much of "not ready" is polish that can follow the cutover. I bring my own leadership in before the customer escalates, so nobody is surprised. And I name who decides, and by when. Ambiguity in a crisis is worse than a bad call. Better still, I avoid day three. The trend shows weeks earlier if you track the release gate."

**Technical-interviewer answer.**

> "First I separate blockers from incomplete work, using the release gate, not opinion. A blocker fails a hard criterion: an access or security test, data reconciliation, or a rollback path that has not been rehearsed. Everything else is incomplete work: polish, secondary reports, optional integrations. Then I shape the options technically. Reduced scope means a subset of workloads behind a feature flag. A phased go-live means one cutover wave with a tested rollback. A new date means naming the exact gate that is failing and when it will pass. I never ship around a failing security gate to hold a date. Upstream, I track gate pass rate, open defects by severity and reconciliation trend weekly. Those show the slip at week two."

Hypothetical — testing judgment and instinct, not memory. Answer in order:

- Raise it the same day. The cost of a late warning compounds; the cost of an early one is a conversation.
- Go with options, not a problem — reduced scope for the date, full scope on a new date, or a phased go-live with a subset of workloads.
- Separate what's genuinely blocking from what's merely incomplete. Much of "not ready" is polish that can follow the cutover.
- Bring your own leadership in before the customer escalates, so nobody is surprised.
- Name the decision-maker and the deadline for deciding. Ambiguity in a crisis is worse than a bad call.

**Close with.** "In practice I try never to be in this position at day three — the trend is usually visible at week two if you're tracking the right leading indicator." Then name yours.

## 3. Missing a deadline, and how you communicated it

**CEO-ready answer.**

> "I missed a milestone at a bank. What I got right was the timing of the news. We had committed to a phase cutover. Source systems were messier than profiling suggested, and reconciliation kept failing. I saw the trend weeks out and raised it then, not on the day. I went to the sponsor with a revised plan and two options: a partial cutover on the date, or the full one shortly after. My own leadership was already briefed, so the sponsor wasn't carrying the news alone. They took the partial cutover. The relationship held, and they scoped the next phase on my estimates."

**Technical-interviewer answer.**

> "The slip was a data-quality problem. Profiling sampled the source systems, but full loads exposed messier data. Reconciliation between source and target kept failing for the phase we had committed to cut over. I tracked the reconciliation pass rate per table each week. When it stopped trending toward the threshold, the date was visibly at risk, weeks before it arrived. I split the tables into those that passed reconciliation and those that did not. That gave the sponsor two concrete options: cut over the passing set on the date, or the full set shortly after. They took the partial cutover. The failing tables got cleansing rules and stayed on the source system until they passed. Reconciliation pass rate is now a release gate from week one."

**NEEDS INPUT — this one is yours to write.**

**What's being tested:** the communication, not the miss. Do you tell customers bad news early or late?

To draft this, supply:

1. Engagement and the deadline that slipped.
2. The gap between what was promised and what was achievable.
3. When you raised it — how far ahead of the deadline — and to whom.
4. Whether you brought a revised plan and options, or an apology.
5. Whether you brought your own escalation path along so the customer wasn't carrying the news internally.
6. Whether the relationship held, and what the customer said afterward.

**The trap.** Describing heroics — the weekend push that saved it. That answers a different question and dodges this one.

## 4. A customer who escalated over your head

**CEO-ready answer.**

> "A client's programme lead went over my head to my leadership. Part of the complaint was fair. My status updates were technical, and they couldn't tell whether we were on track. I called my manager before the customer's email landed, so nobody was surprised. Then I met the programme lead. I agreed with the part that was right and didn't defend the rest. We moved to a weekly one-page update in business terms: risks, decisions needed, dates. The tension went out of the account. They extended us into the next phase. Most escalations start as a communication gap, not a competence gap."

**Technical-interviewer answer.**

> "The root cause was the reporting format, not the delivery. My updates listed technical progress: pipelines built, tests passing, defects closed. The programme lead could not map that to risk or dates. After briefing my manager, I rebuilt the reporting. Each week became one page: milestones against the baseline plan, open risks with owners, decisions needed by date. The technical detail moved to an appendix for their engineers. I derived the summary from the same tracker the team worked from, so it could not drift from reality. The cost was an hour of writing a week. The escalation stopped, and they extended us into the next phase. Status now gets designed for its reader, not its author."

**NEEDS INPUT — this one is yours to write.**

**What's being tested:** composure, and whether you're defensive about your own competence.

To draft this, supply:

1. Engagement and what triggered the escalation. Be honest about whether it was warranted.
2. Whether you got ahead of it with your own leadership before they heard from the customer.
3. What you conceded. Strong answers include a moment where you agreed with part of the complaint rather than defending the whole position.
4. The resolution, and whether the account relationship recovered — with evidence, e.g. subsequent expansion or continued engagement.

**The trap.** Framing the customer as unreasonable. Even if they were, the interviewer is scoring how you talk about a difficult client while they're in the room hearing you do it.
