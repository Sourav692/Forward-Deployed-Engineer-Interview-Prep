# Delivery Under Pressure - Answer Key

Spoken answers - 5 grounded, 1 partly grounded, 1 needing your input. Deliver them in your own cadence; the wording is a script, not a recitation.

## 1. A production issue at a customer site

**PARTLY GROUNDED.** The story or result below still carries a bracketed placeholder. Fill it from your own material before you use this answer.

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

**GROUNDED.**

**CEO-ready answer.**

> "I raise it the same day. A late warning compounds. An early one is just a conversation. Then I bring options, not a problem: reduced scope on the date, full scope on a new date, or a phased go-live. I separate what truly blocks from what is merely incomplete. Much of "not ready" is polish that can follow the cutover. I bring my own leadership in before the customer escalates, so nobody is surprised. And I name who decides, and by when. Ambiguity in a crisis is worse than a bad call. Better still, I avoid day three. The trend shows weeks earlier if you track the release gate."

**Technical-interviewer answer.**

> "First I separate blockers from incomplete work, using the release gate, not opinion. A blocker fails a hard criterion: an access or security test, data reconciliation, or a rollback path that has not been rehearsed. Everything else is incomplete work: polish, secondary reports, optional integrations. Then I shape the options technically. Reduced scope means a subset of workloads behind a feature flag. A phased go-live means one cutover wave with a tested rollback. A new date means naming the exact gate that is failing and when it will pass. I never ship around a failing security gate to hold a date. Upstream, I track gate pass rate, open defects by severity and reconciliation trend weekly. Those show the slip at week two."

Hypothetical — testing judgement and instinct, not memory. Answer in order:

- Raise it the same day. The cost of a late warning compounds; the cost of an early one is a conversation.
- Go with options, not a problem — reduced scope for the date, full scope on a new date, or a phased go-live with a subset of workloads.
- Separate what's genuinely blocking from what's merely incomplete. Much of "not ready" is polish that can follow the cutover.
- Bring your own leadership in before the customer escalates, so nobody is surprised.
- Name the decision-maker and the deadline for deciding. Ambiguity in a crisis is worse than a bad call.

**Close with.** "In practice I try never to be in this position at day three — the trend is usually visible at week two if you're tracking the right leading indicator." Then name yours.

## 3. Delivering bad news to a customer

**CEO-ready answer.**

> "I told the sponsor the same day, with the cause and the fix. At a large insurer, my first design was one agent with twenty-plus tools. It worked in demos and broke in real testing, weeks into a two-month window. I gave them three things. What broke: the agent picked the wrong tool. Why: too many tool definitions in one prompt degrade selection. What next: a supervisor with specialist agents, reusing every existing tool and data asset, traced so we would know within days. The pivot worked. We shipped on time. What the sponsor remembered was hearing it from me first, with a plan."

**Technical-interviewer answer.**

> "The root cause was context load on tool selection. Version one was a single agent with twenty-plus tools. Twenty tool schemas plus conversation history in one prompt degraded selection. Tracing showed it was structural, not a prompt-tuning problem. So I moved to a supervisor with four specialist agents, each with a narrow toolset. A confidence gate asks a clarifying question below 60%. I kept every existing tool and data asset, so the change was to routing, not a rewrite. Per-node tracing and a held-out evaluation set told me within days whether the pivot worked. It did, and we shipped inside the window. The sponsor got the mechanism and the fix on the same day."

**GROUNDED — insurer v1 failure**

*"Mid-engagement at the insurer, my first architecture — one agent with twenty-plus tools — broke down in real testing. I was weeks into a window of about two months and the sponsor was expecting a working MVP.*

*I told them the same day, in three parts: what's broken — the agent is picking the wrong tool and degrading under context bloat; why, specifically — stuffing twenty tool schemas plus history into one prompt measurably hurts tool selection, it's not vague 'confusion'; and what I'm doing about it — a Supervisor pattern with specialist agents, keeping every existing tool and data asset so the change is bounded, with tracing so we'll know within days if it works.*

*Two rules I follow for bad news: never deliver a problem without the mechanism, because 'it doesn't work' invites panic and 'here's exactly why' invites trust; and never deliver it without the next step and its cost. The pivot worked and we shipped on time — but the thing the sponsor remembered was that they heard it from me first, with a plan."*

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

## 5. A fast decision with incomplete information

**CEO-ready answer.**

> "I re-architected mid-engagement, inside days, without a full study. At the insurer, my first design was one agent with twenty-plus tools. In real testing it kept picking the wrong tool. I knew the cause: too much in one context degrades tool choice. I didn't know whether four specialists was the right number. So I bounded the risk three ways. I kept every tool and data asset, so the change was reversible. I added a confidence gate, so a routing miss became a question, not a wrong answer. And I added tracing and an evaluation set to know within days. It worked. We shipped on time."

**Technical-interviewer answer.**

> "The root cause was context bloat. Twenty-plus tool schemas plus history in one context degraded tool selection. That told me specialisation addressed the cause, not a symptom. I re-architected into a Supervisor with specialist agents. The change touched orchestration only. Every tool and data asset stayed, so rolling back meant restoring the previous graph. Routing errors were the new risk. I contained them with a confidence gate: below 60%, the Supervisor asks a clarifying question rather than guessing. For verification, I added per-node MLflow tracing and a held-out evaluation set. Tracing showed which node made each routing decision. The evaluation set told me within days whether accuracy improved. It did, and the MVP shipped inside the original window."

**GROUNDED — insurer live pivot from single agent to Supervisor**

*"Mid-engagement at a large Asian life insurer, in real testing, my first architecture — one agent, one prompt, twenty-plus tools — was picking the wrong tool and degrading under context bloat. I was weeks into a window of about two months. I didn't have time to run a controlled study of alternative architectures.*

*The decision was to re-architect live into a Supervisor pattern with specialist agents. What I knew: the failure mechanism was specific — stuffing 20-plus tool schemas plus history into one context measurably degrades tool selection — so specialisation would address the cause, not just the symptom. What I didn't know: whether four specialists was the right number, or whether routing would introduce its own errors.*

*I bounded the risk three ways. I kept every existing tool and data asset and changed only the orchestration on top, so the pivot was reversible. I added a confidence gate — below 60%, the Supervisor asks a clarifying question instead of guessing — so a routing mistake becomes a question to the user rather than a wrong answer. And I put per-node MLflow tracing and a held-out eval set in place so I'd know within days whether it worked, not at the end. It did, and we shipped on time."*

## 6. An irreversible, high-stakes decision

**CEO-ready answer.**

> "I slow down at the blast radius, not across the whole project. At a large consumer lender, the question was whether an agent could change production configuration on a live lending pipeline. A bad change misroutes real loan leads at a regulated lender. You can't take that back. So I studied a couple of hundred real tickets before designing anything. I scoped every tool to one narrow, named operation. And every action landed as a finding for an engineer to confirm. Meanwhile the lower-risk triage and retrieval layers shipped fast. Reversible calls get speed. Irreversible ones get guardrails."

**Technical-interviewer answer.**

> "The decision was the agent's write path into production config tables. I designed the permission model from the ticket data, not from the agent's convenience. A couple of hundred historical tickets showed which operations the work needed. Each became one narrow, named tool. There was no general write access. Every action landed in the ticket as a finding for an engineer to confirm. Logic bugs went to a separate code-lookup agent. It does a deterministic one-file lookup and gives the model only that file. The ops agent never reasons over code it wasn't shown. The retrieval-strategy choice was the opposite case. It was reversible in an afternoon, so I benchmarked, shipped and documented when to revisit."

**GROUNDED — lender production writes vs. Meridian retrieval-strategy choice**

*"I treat these two very differently, and I have a clean example of each.*

*Routine, reversible: which retrieval strategy to ship in the RAG platform. I benchmarked six against one golden set, picked the cheapest one that met the bar, and documented when to revisit — at a larger corpus the answer might flip. That's a decision you make with data and can undo in an afternoon.*

*High-stakes, hard to reverse: at a large Indian consumer lender, whether the agent could write to production config tables on a live lending pipeline. A bad call to a config-update tool misroutes real loan leads at a regulated lender — you don't get to un-send those. So the process changed. I went through a couple of hundred historical tickets first to understand the real shape of the problem instead of assuming. I scoped every tool to a single, narrow, named operation rather than open write access. I kept a human in the loop: every action lands in the ticket as a finding for an engineer to confirm. And I built a separate code-lookup agent for logic bugs rather than letting the ops agent reason over source code it wasn't shown.*

*The pattern: for reversible calls, decide fast and measure. For irreversible ones, slow down at the blast radius, not the whole project — the triage and RAG layers still shipped quickly."*

## 7. Short-term deliverable versus long-term goal

**CEO-ready answer.**

> "I shipped the deadline and protected the long-term path. At a large insurer, I had about two months for a working MVP. The supervisor design worked. But as domains grew, it would hit the same overload that broke my first design. Re-architecting then would have risked the date. So I shipped on time, and the customer's time to an answer went from days to minutes. Two choices kept the future open. Prompts lived in a governed table, tunable without a redeploy. Specialists were loosely coupled. When growth made the limit real, I evolved the design. Refactor when the pressure is real, not speculative."

**Technical-interviewer answer.**

> "I shipped a known ceiling and kept the exit open. The supervisor worked: four specialists, confidence-gated routing. But its own tool list grew with each domain. That would recreate the context bloat that broke version one, one level up the stack. I didn't re-architect before the deadline. I made two cheap design choices instead. Prompts lived in a governed Delta table with a five-minute cache, so behaviour was tunable without a redeploy. The context index was resolved centrally, so specialists were already loosely coupled. When domain growth made the ceiling concrete, I moved to a deep agent pattern. Self-contained subagents, plus a memory-manager subagent. Loose coupling made that a refactor, not a rewrite."

**GROUNDED — insurer (Supervisor now, Deep Agent later)**

*"At the insurer I had about two months to deliver a working MVP, and partway through, the Supervisor architecture was working — four specialist agents, confidence-gated routing, all fine. But I could see the long-term problem: as domains grew, the Supervisor's own tool list was going to re-approach the exact context-bloat failure that killed my first single-agent design, one level up the stack.*

*The tension was: re-architect now into a Deep Agent pattern and risk the deadline, or ship the Supervisor and accept a known ceiling. I did neither purely. I shipped the Supervisor on time — the customer got days-to-minutes time-to-insight — but I made two choices that kept the long-term path open: prompts lived in a governed Delta table with a five-minute cache so behaviour could be tuned without a redeploy, and the Context Index was resolved centrally so specialists were already loosely coupled. Then, once domain growth made the ceiling concrete rather than theoretical, I evolved it into the Deep Agent pattern with self-contained subagents and a memory-manager subagent.*

*The principle: ship the deliverable, but don't let it foreclose the strategic direction — and refactor when the pressure is real, not speculative."*
