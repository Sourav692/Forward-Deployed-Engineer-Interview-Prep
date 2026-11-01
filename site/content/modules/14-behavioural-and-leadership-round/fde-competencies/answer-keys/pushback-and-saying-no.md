# Pushback and Saying No - Answer Key

Spoken answers: 2 grounded, 3 partly grounded. Deliver them in your own cadence. Treat the wording as a guide; don't recite it.

## 1. A request that is the wrong thing to build

**CEO-ready answer.**

> "I don't say no. I show the cost in the customer's terms and offer the version that gets the outcome. At the lender, the ask was a fully autonomous agent fixing tickets end to end. The risk was an LLM writing to config tables that route live loan leads at a regulated lender. So I delivered automated investigation, with the root cause in the ticket in minutes. The write stayed behind an engineer's confirmation. I named the trade: slower resolution, zero unreviewed changes. They chose it once they saw the blast radius. Customers are usually right about the pain. My job is to fix the mechanism."

**Technical-interviewer answer.**

> "The technical objection was the write path, not the autonomy. The investigation is read-only: triage, retrieval over past tickets, code lookup. Writing to config tables that route live loan leads is a different risk class. A wrong write misroutes real customers, silently. So I split the system at that boundary. The agent posts the root cause and the proposed change to the ticket. An engineer confirms before anything is written. Investigation runs in minutes, so most of the manual effort still goes away. I gave up end-to-end resolution time. In return, every production config change has a named reviewer. I also flagged the triage classifier's brittleness to phrasing drift as the next gap. Autonomy can widen once the proposals have a track record."

**Example story: lender autonomy + insurer open-ended search**

*"I don't say no; I show them what the request costs in their own terms and offer the version that gets them the outcome.*

*At the lender the intuitive ask is a fully autonomous agent that fixes tickets end to end. The ambition is fine; the wrong part is letting an LLM write to config tables that route live loan leads at a regulated lender. So I gave them the outcome (automated investigation, root cause in the ticket in minutes) with the write gated behind an engineer's confirmation, and I named the trade: slower resolution, zero unreviewed changes. They chose it once they saw the blast radius.*

*At the insurer the ask was open-ended enterprise search. Right outcome, wrong first step: it would have doubled the governance surface before the narrow slice was proven. It went on the roadmap with a precondition, and the customer heard 'next,' not 'no.'*

*The customer is almost always right about the pain and often wrong about the mechanism. My job is to fix the mechanism without dismissing the pain."*

## 2. Disagreeing with a customer executive

**Add your own detail.** The story or result below still carries a bracketed placeholder. Fill it from your own material before you use this answer.

**CEO-ready answer.**

> "The sponsor wanted every business unit and every market at launch. I disagreed early, and I framed it as their risk, not my convenience. Access-control mistakes compound at scale. A leak at launch ends an AI programme at an insurer. So I proposed two business units in one market first. I gave ground too: every new request went on a written expansion path. The one precondition was that the zero-leak gate held on the first slice. Compliance backed the narrow start. We shipped in the window, and time-to-insight went from days to minutes. The expansion conversation then ran on a result, not a promise."

**Technical-interviewer answer.**

> "I argued for a narrow first slice because the access model was unproven, not because the build was hard. The insurer needed role-by-document-type-by-market permissions over documents with health disclosures. Every extra business unit and market multiplies that matrix and its test surface. So I proposed two business units in one market, with a governed test set and a release gate that fails on a single leak. I conceded the expansion path in writing. Each new request was logged with one precondition: the zero-leak gate holds on the first slice. The cost was a smaller launch footprint. The benefit was a matrix small enough to test exhaustively. We shipped in the window, and expansion had a tested gate instead of an argument."

**Anchor:** the tier-1 bank migration.

- **Situation.** Multi-region programmes almost always contain a sequencing disagreement: [which region first, or big-bang versus phased cutover].
- **Action.** Frame the disagreement as risk, not preference. Argue from the escalation surface: what happens to APAC trading hours if EMEA cutover goes wrong, and who is awake to fix it.
- **Result.** Zero go-live escalations across all three regions. Cite this as vindication, briefly, without gloating.

**The trap.** Picking a disagreement you won easily. Choose one where you had to concede something.

## 3. Handling scope creep on an engagement

**CEO-ready answer.**

> "I stop scope creep by agreeing what done means before the build. At a large insurer, the sponsor and I fixed the bar up front. Governed self-serve answers would replace a days-long reporting queue, with zero leaks, explainability and acceptable latency, on two business units in one market. When new requests came in, I didn't refuse them. I asked whether they moved that bar inside the window. Most didn't. They went on a written expansion path with a precondition, so the customer heard next, not no. I did absorb the data foundation, because the bar was unreachable without it. I have that conversation with the sponsor myself."

**Technical-interviewer answer.**

> "Scope control needs a measurable definition of done. Ours had four criteria, fixed before the build. Self-serve governed answers replacing a days-long BI queue. Zero leaks on the governed test set. Explainability, meaning every answer traces to a governed source. Acceptable latency. The slice was two business units in one market. Every new request got one test: does it move one of those criteria inside the window? Open-ended enterprise search, more markets and more document types all failed it. Each went on the expansion path with a technical precondition: the zero-leak gate holds on the first slice. The data foundation passed the test. Without governed metric views, explainability and zero leaks were unreachable."

**Example story: insurer**

*"By deciding what 'done' means with the sponsor before the build, so scope creep has something to be measured against. At the insurer we agreed the success bar up front: self-serve, governed answers replacing a BI queue that took days, with zero leaks, explainability, and acceptable latency, on two business units in one market.*

*When requests came in (open-ended enterprise search, more markets, more document types), I didn't refuse them. I asked whether they moved that bar within the roughly two-month window. Most didn't. They went on a written expansion path with a stated precondition, 'once the zero-leak gate holds on the first slice', so the customer heard 'next,' not 'no.'*

*Where I did absorb extra scope was the data foundation, because without governed metric views the agreed bar was unreachable. That's the test: scope that serves the agreed outcome, I take on; scope that adds surface without moving the outcome, I sequence. And I have that conversation myself, directly with the sponsor, rather than routing it through a delivery lead."*

## 4. Holding a customer accountable for their side

**CEO-ready answer.**

> "I make their dependencies visible from day one, so a slip is a shared fact, not a surprise. At a large Asian life insurer, the access rules came from a matrix only their compliance team could sign off. That sign-off sat on the plan as a named dependency with a date. When their review ran late, I showed the sponsor exactly which build steps it blocked. We re-sequenced the work instead of quietly absorbing the delay. Two rules. Never absorb a customer slip silently; it teaches them dates don't matter. And always frame it as their outcome at risk."

**Technical-interviewer answer.**

> "The access rules came from a role by document type by market matrix. Only the insurer's compliance and business teams could sign it off. In my build, that matrix fed the policy layer, the evaluation set and the leak gate. So I tracked it as a dated dependency, with the list of build steps it blocked. When the review ran late, I showed the sponsor that list. We re-sequenced. Work that did not depend on the matrix moved forward: the data foundation, tracing and orchestration. Policy enforcement and leak testing waited for the signed matrix. Hard-coding a draft matrix would have meant rework, and a test set built on unapproved rules."

**Add your own detail: insurer access matrix / compliance dependency.** `[FILL: a concrete dependency that slipped]`

*"By making their dependencies explicit and visible from the start, so a slip is a shared fact rather than a surprise. At a large Asian life insurer the policy rules came from a role-by-document-type-by-market access matrix that only the customer's compliance and business teams could sign off. That sign-off was on the plan as a named dependency with a date, not an assumption inside my timeline. `[FILL: what slipped and how you raised it — e.g., 'when the compliance review ran late I showed the sponsor exactly which build steps were blocked on it, and we re-sequenced rather than absorbed it'].`*

*Two rules: never absorb a customer slip silently, because it teaches them the dates don't matter, and always frame it as their outcome at risk, not my inconvenience."*

## 5. Pushing back on your own company's roadmap

**Add your own detail.** The story or result below still carries a bracketed placeholder. Fill it from your own material before you use this answer.

**CEO-ready answer.**

> "My job is the customer's outcome, even when that means building around my own company's product. At an insurer, our managed multi-agent feature was exactly the right pattern. It wasn't available to this customer in time. Demoing it would have flattered us. Waiting for it would have tied their launch to a roadmap nobody in the room controlled. So I used managed services where they were good enough and hand-built the supervisor where there was a gap. The MVP shipped in the window. Then I carried the gap back internally. An internal accelerator and an open-source contribution both started that way."

**Technical-interviewer answer.**

> "The decision was build versus wait on a managed multi-agent feature that would not land in time. I used managed services where they were good enough. The BI specialist used a managed text-to-SQL service, because its SQL is always read-only and the insurer's analysts could curate it. I built only the gap: the supervisor, as an 8-node LangGraph state machine. It classifies intent with a confidence score and asks a clarifying question below 60%. It resolves governed assets once through a central Context Index, routes to one of four specialists, and composes the answer. The cost was owning more code. Prompts lived in a governed table with a five-minute cache, so behaviour could change without a redeploy."

**Anchor:** your field-to-product feedback loop.

- **Action.** [A specific case where a customer requirement wasn't served by the product as shipped and you either built around it or carried it back to engineering. Overwatch and an internal accelerator both started as gaps between what the product did and what the field needed.]
- **Result.** [Whether it shipped, or whether the workaround became reusable IP.]

**Why this question exists.** They're checking that you'll advocate for the customer inside your own company as well as represent the company to the customer. FDE roles fail when the engineer becomes a pure sales extension.
