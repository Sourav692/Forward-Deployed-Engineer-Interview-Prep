# Pushback and Saying No - Answer Key

Three drafted, one NEEDS INPUT.

## 1. Telling a customer no

**CEO-ready answer.**

> "I said no with evidence, not opinion. A financial-services client wanted agents in a decisioning path with no human in the loop. I didn't argue from principle. I red-teamed the deployment and brought the results to the table. They were concrete cases where the system gave confident, wrong answers under adversarial framing. Then I offered an alternative that kept their goal. Keep the automation, add a confidence threshold, and send the uncertain cases to a human. They accepted the constrained design, and the account stayed whole. A no backed by evidence you generated is a decision. A no backed by opinion is a debate."

**Technical-interviewer answer.**

> "I said no because the failure mode was untested, so I tested it. I ran adversarial red-teaming against the deployment with PyRIT. The findings were concrete. Under adversarial framing, the system returned confident, wrong output in the decisioning path. With no human in the loop, nothing would catch it. The alternative kept the automation but bounded it. A confidence threshold routed uncertain cases to human review instead of acting on them. The red-team cases became regression tests the design had to pass before any change. The cost was a human review queue and slower resolution on edge cases. They accepted the constrained design. The guardrail is a threshold, an escalation route and adversarial tests that re-run on every change."

**Anchor:** multi-agent guardrails, financial services.

- **Situation.** The client wanted agents extended into [an automated decisioning path] with no human in the loop.
- **Task.** Decline the scope without losing the account relationship.
- **Action.** I didn't argue from principle. I ran adversarial red-teaming against the deployment using PyRIT and brought the results to the table — concrete cases where the system produced confident wrong output under adversarial framing. Then offered the alternative: keep the automation, add a confidence threshold and human escalation above it.
- **Result.** They accepted the constrained design. The red-team findings became [part of the standing evaluation suite / a reusable pattern across accounts].

**Why it lands.** "No" backed by evidence you generated is the senior version. "No" backed by opinion is the junior version.

## 2. Scope creep on a fixed-timeline engagement

**CEO-ready answer.**

> "I don't refuse additions. I price them in time, visibly. At an insurer we had about two months, and requests kept arriving: more markets, more document types, open-ended enterprise search. Every request went on a written expansion path with one precondition. Nothing expanded until the zero-leak gate held on the first slice. That way the customer made the tradeoff, not me in silence. The MVP shipped on the narrow slice, and the customer heard "next", not "no". Absorbing scope quietly feels helpful. It is the most common way engagements fail."

**Technical-interviewer answer.**

> "Scope creep here was a test-surface problem. Each new market or document type adds rows to the access matrix. Each row needs governed test cases before the zero-leak gate means anything. So every request went on a written expansion path with its cost: new test cases, policy changes and timeline impact. The precondition was mechanical. Nothing expanded until the harness passed with zero leaks on the first slice. Open-ended enterprise search was the clearest deferral. It had no bounded document set, so it could not be tested against the gate in the window. The trade-off was a narrower launch. The MVP shipped on the slice, and the expansion path became the next-phase backlog, ordered by what could pass the gate."

- **Anchor.** Any migration engagement — scope creep is universal there.
- **Action.** You don't refuse additions, you price them in time. Every new request gets logged against the timeline visibly, so the customer makes the tradeoff rather than you absorbing it silently.
- **Result.** [A specific instance where a request got deferred to a phase two, and the customer accepted it.]

**Senior framing.** Absorbing scope quietly feels helpful and is the most common way engagements fail. Say that.

## 3. Pushing back on your own company's roadmap

**CEO-ready answer.**

> "My job is the customer's outcome, even when that means building around my own company's product. At an insurer, our managed multi-agent feature was exactly the right pattern. It wasn't available to this customer in time. Demoing it would have flattered us. Waiting for it would have tied their launch to a roadmap nobody in the room controlled. So I used managed services where they were good enough and hand-built the supervisor where there was a gap. The MVP shipped in the window. Then I carried the gap back internally. An internal accelerator and an open-source contribution both started that way."

**Technical-interviewer answer.**

> "The decision was build versus wait on a managed multi-agent feature that would not land in time. I used managed services where they were good enough. The BI specialist used a managed text-to-SQL service, because its SQL is always read-only and the insurer's analysts could curate it. I built only the gap: the supervisor, as an 8-node LangGraph state machine. It classifies intent with a confidence score and asks a clarifying question below 60%. It resolves governed assets once through a central Context Index, routes to one of four specialists, and composes the answer. The cost was owning more code. Prompts lived in a governed table with a five-minute cache, so behaviour could change without a redeploy."

**Anchor:** your field-to-product feedback loop.

- **Action.** [A specific case where a customer requirement wasn't served by the product as shipped and you either built around it or carried it back to engineering. Overwatch and an internal accelerator both started as gaps between what the product did and what the field needed.]
- **Result.** [Whether it shipped, or whether the workaround became reusable IP.]

**Why this question exists.** They're checking you'll advocate for the customer internally, not just represent the company externally. FDE roles fail when the engineer becomes a pure sales extension.

## 4. Walking away from an approach mid-project

**CEO-ready answer.**

> "I killed my own first architecture weeks into a two-month build. It was one agent, one prompt, twenty-plus tools. It demoed well. In real testing it picked the wrong tool, and accuracy fell as context grew. Tracing showed a structural problem, not a tuning one. More tuning would have been sunk cost. I told the sponsor the same day: what broke, why, and the fix with its cost. I moved to a supervisor with four specialist agents. I kept every existing tool and data asset, so the rebuild was bounded. We shipped on time. The sponsor remembered hearing it from me first, with a plan."

**Technical-interviewer answer.**

> "The root cause was context bloat. Twenty-plus tool schemas plus conversation history in one prompt measurably hurt tool selection, and it got worse as context grew. Tracing showed a structural problem, not a prompt problem. I replaced it with a supervisor and four specialist agents, each with a small, focused toolset. I kept every existing tool and data asset, so the rewrite was bounded to orchestration. I added a confidence gate that asks a clarifying question below 60%. I put per-node tracing and a held-out evaluation set in place, so I would know within days if I was wrong again. The cost was rebuild time inside a two-month window. We still shipped on time."

**NEEDS INPUT — this one is yours to write.**

**What's being tested:** sunk-cost resistance. Can you kill your own work?

**Likely anchor:** the multi-agent or RAG work, where an initial architecture stops holding under real data — a retrieval strategy that didn't survive contact with the corpus, an agent topology that looped, or an orchestration choice you replaced.

To draft this, supply:

1. The engagement and the approach you abandoned.
2. How much had already been built when you concluded it wouldn't work.
3. What the evidence was — evaluation results, a latency ceiling, a cost curve.
4. How you made the case to the client to discard work they'd already paid for.
5. What the replacement did better.
6. How long the rebuild actually cost versus the projection if you'd continued.

**The trap.** Picking a case where you walked away in week one. That's not a hard call. Pick one with real invested effort.
