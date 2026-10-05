# Creates a Culture of Accountability - Answer Key

Spoken answers - 1 grounded, 1 partly grounded, 2 needing your input. Deliver them in your own cadence; the wording is a script, not a recitation.

## 1. Addressing underperformance directly

**CEO-ready answer.**

> "I raise it early, specifically and against an agreed standard. On an engagement, an engineer's work kept drifting from what the customer had asked for. Twice it passed review and still missed the customer's intent. I didn't wait for a pattern to become a problem. I named the standard we'd agreed with the customer. I showed where the work stood and what had to change by when. The bar wasn't personal. Then I supported them: design reviews before code and a seat in discovery calls. Within a few weeks the drift stopped. Clear standards make hard conversations fair."

**Technical-interviewer answer.**

> "The drift was measurable. Twice, work passed code review and still missed the customer's intent. That meant my review checked correctness but not intent. So I fixed the process as well as raising it with the engineer. I named the agreed standard: the customer's success bar, written down at scoping. I showed exactly where each piece diverged from it. Then I moved inspection earlier. Their designs came to review before code, with the customer requirement each one served written beside it. They also sat in discovery calls, so they heard intent first-hand. Review now had two checks: is it correct, and does it match the stated requirement? Within a few weeks the drift stopped."

**NEEDS YOUR INPUT.** Suggested spine. If the honest answer is "as a senior IC, my version of this was addressing work that drifted from the customer's intent," say that.

*"`[FILL: who, what the gap was — missed commitments, work that didn't match customer intent, quality below the agreed bar].` I had the conversation early and specific: here is the agreed standard `[e.g., the zero-leak gate / the customer's success bar]`, here is where the work is against it, here is what changes by when. I separated the person from the work — the bar wasn't personal, it was the one we'd agreed with the customer. `[FILL: what support you gave — pairing, design review before code, clearer tickets].` Outcome: `[FILL — improved / moved to a better-fit role / exited]`."*

## 2. Inspecting work and giving consequences fairly

**CEO-ready answer.**

> "I inspect early and make the standard mechanical. Two checkpoints. Before code, I review designs, because a wrong turn costs an hour there and a customer relationship later. Daily, I check two things: is it correct, and does it match what the customer asked for? For fairness, the bar enforces itself. On governed retrieval work, one leak in the test set blocks the release, whoever wrote it. That includes me. When the gate flagged my own build, I stopped and traced it. It was stale test data, and I wrote that up too. Good design earns higher-stakes work and more customer time."

**Technical-interviewer answer.**

> "I make the standard executable wherever possible. On governed retrieval work, the release gate is an evaluation harness over a golden set. One leak fails the release. It applies to every author, including me. When the gate flagged my own reference build, I stopped and traced the case. A claims manager had been reassigned, and my test labels were stale. I had confused 'not relevant to this question' with 'not allowed to see it.' I added a check that keeps those two labels separate. A second check fails if the security documentation drifts from the running policy code. Design review before code covers what the harness cannot: boundaries, data flow and fit to customer intent."

**GROUNDED — from the day-to-day doc + the eval-gate discipline**

*"I inspect at two points, and neither is 'end of sprint.'*

*First, before code: I review designs before they're built, because a wrong turn caught at the design stage costs an hour and caught after it ships costs a customer relationship. Second, daily and lightweight: I review what the team produced with two lenses — is it correct, and does it match what the customer actually asked for, which isn't always what the ticket says. Drift between those two is the thing I most want to catch today rather than next week.*

*For fairness, I make the standard mechanical wherever I can, so consequences follow from the bar, not from my mood. On the governed RAG work the release gate is a harness: one leak on the test set and it doesn't ship, whoever wrote it. I hold myself to the same gate — when it flagged a leak on my own reference build, I stopped, traced it, and wrote it up, including that it turned out to be a false alarm from stale test data. Positive consequences are the same in reverse: the engineer whose design survives review gets the next higher-blast-radius piece and more customer-facing time. That's the reward that actually matters on an engagement team."*

## 3. Missing a commitment

**CEO-ready answer.**

> "I missed one at a large consumer lender. I committed to cutting ticket resolution time. The system shipped and worked. But I hadn't instrumented resolution time by ticket type from day one. So I couldn't prove the improvement I'd promised. I told the sponsor that plainly, before they asked. I did not quote an estimate as a result. The cause was mine: I treated measurement as something to add later. Now the measurement plan goes into the scoping document, before any build starts. A result you can't prove is a commitment you haven't kept."

**Technical-interviewer answer.**

> "The miss was an instrumentation gap, not a delivery gap. The triage-to-root-cause system shipped and worked. But resolution time per ticket type was never captured from day one. Without a baseline per type, any before-and-after delta is an estimate. I would not report an estimate as a result. I told the sponsor what was measured and what was not. The fix is in how I scope. The measurement plan now names each metric, its baseline and where it is logged, before the build starts. Baseline capture ships in the first release. If a metric cannot be instrumented, I reword the commitment before I accept it."

**NEEDS YOUR INPUT.** If nothing fits, the honest adjacent example is the lender measurement gap: you committed to an outcome you then couldn't prove. Suggested spine:

*"`[FILL: what was committed, to whom, and what slipped].` I told them before they found out, with the cause and the new date `[FILL]`. What I changed afterwards: `[FILL]`."*

*Adjacent, grounded version:* *"The commitment I'd most like back is at a large Indian consumer lender — I committed to compressing ticket resolution time and then couldn't prove the delta, because I hadn't instrumented per-ticket-type resolution time from the start. I said so plainly rather than quoting an estimate as a result, and I now put the measurement plan in the scoping document."*

## 4. Holding a customer accountable for their side

**CEO-ready answer.**

> "I make their dependencies visible from day one, so a slip is a shared fact, not a surprise. At a large Asian life insurer, the access rules came from a matrix only their compliance team could sign off. That sign-off sat on the plan as a named dependency with a date. When their review ran late, I showed the sponsor exactly which build steps it blocked. We re-sequenced the work instead of quietly absorbing the delay. Two rules. Never absorb a customer slip silently; it teaches them dates don't matter. And always frame it as their outcome at risk."

**Technical-interviewer answer.**

> "The access rules came from a role by document type by market matrix. Only the insurer's compliance and business teams could sign it off. In my build, that matrix fed the policy layer, the evaluation set and the leak gate. So I tracked it as a dated dependency, with the list of build steps it blocked. When the review ran late, I showed the sponsor that list. We re-sequenced. Work that did not depend on the matrix moved forward: the data foundation, tracing and orchestration. Policy enforcement and leak testing waited for the signed matrix. Hard-coding a draft matrix would have meant rework, and a test set built on unapproved rules."

**PARTLY GROUNDED — insurer access matrix / compliance dependency.** `[FILL: a concrete dependency that slipped]`

*"By making their dependencies explicit and visible from the start, so a slip is a shared fact rather than a surprise. At a large Asian life insurer the policy rules came from a role-by-document-type-by-market access matrix that only the customer's compliance and business teams could sign off. That sign-off was on the plan as a named dependency with a date, not an assumption inside my timeline. `[FILL: what slipped and how you raised it — e.g., 'when the compliance review ran late I showed the sponsor exactly which build steps were blocked on it, and we re-sequenced rather than absorbed it'].`*

*Two rules: never absorb a customer slip silently — it teaches them the dates don't matter — and always frame it as their outcome at risk, not my inconvenience."*
