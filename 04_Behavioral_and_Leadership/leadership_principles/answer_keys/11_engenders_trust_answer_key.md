# Engenders Trust - Answer Key

Spoken answers - 3 grounded, 2 partly grounded. Deliver them in your own cadence; the wording is a script, not a recitation.

## 1. Admitting a mistake to your team

**CEO-ready answer.**

> "The failure you volunteer builds more trust than a clean record. On my own governed retrieval build, the evaluation harness flagged a leak. A claims manager saw a case outside their assignment. I stopped everything and treated it as real. It was a false alarm. The manager had just been reassigned, and my test data was stale. That was my mistake. I had labeled data carelessly. I wrote up the whole thing, false alarm included, and added a check so it can't recur. The team started reporting their own misses earlier. A false security alarm is dangerous, because people learn to ignore it."

**Technical-interviewer answer.**

> "The harness flagged a leak on my own reference build, Meridian Assist, a 22-document governed retrieval system. I treated it as a real incident before diagnosing it. The trace showed a claims manager receiving a case outside their assignment. The root cause was my test data. The manager had been reassigned that case, so access was correct and the label was stale. Underneath, I had conflated two labels: 'not relevant to this question' and 'not allowed to see it.' I separated them in the test data and added a check so they cannot be conflated again. The write-up covered the alarm, the false alarm and my labelling error. A noisy security gate trains people to ignore it."

**GROUNDED — the false-alarm leak + the failed first architecture**

*"Two, and I'll take the one that's more uncomfortable. On my own reference build — Meridian Assist, a 22-document governed RAG system — my evaluation harness flagged a leak: a claims manager shown a case outside their assignment. I stopped everything and treated it as real before I'd fully diagnosed it. It turned out the manager had actually just been reassigned that case: my test data was stale, not the system.*

*I wrote up the whole thing — the alarm, the false alarm, and the fact that I'd mislabeled my own test data by confusing 'not relevant to this question' with 'not allowed to see it.' Then I added a check so those two ideas can never be conflated again, because a false security alarm is worse than no alarm — people learn to ignore it.*

*The response `[FILL: from the team — e.g., how people reacted when you owned the false alarm]` was more trust, not less. And on a customer engagement I'd already told the sponsor mid-build that my first architecture didn't work and why. What I've found is that the failure you volunteer builds more trust than the clean track record you present."*

## 2. Building trust with a skeptical team

**CEO-ready answer.**

> "I built with them, not around them. At the insurer, I arrived as the outsider replacing a BI queue their analysts ran. To them, my project made their work look like the bottleneck. So I built the data foundation with the BI lead and their team. The agents used only governed assets they had reviewed and endorsed. Their governance decisions became the rules the agents obeyed. When my first design broke in testing, I showed them the traces. By launch, they owned the metric definitions and curated the analytics agent themselves. Their governed data became what every business user finally reached."

**Technical-interviewer answer.**

> "I made their governance the system's control plane. I built the Unity Catalog foundation with the BI team: bronze, silver and a handful of governed gold metric views. The agents queried those assets, not a parallel copy I owned. Endorsed assets were prioritized in the Context Index routing. So their governance decisions determined what the agents used. I reviewed designs with them before code. When the single-agent design broke, I shared the per-node traces that showed the wrong tool choices. The analytics specialist ran on Genie Spaces, which their analysts could curate without an engineer. By launch they owned the metric definitions and curated that specialist themselves."

**PARTLY GROUNDED — entering a large Asian life insurer as the external FDE.** Validate the dynamic: the BI/analyst team whose queue you were "replacing" had every reason to be wary.

*"At the insurer I arrived as an external engineer proposing to replace the BI queue that an existing analyst and data team ran. From their side, I was the person whose project made their work look like a bottleneck. `[FILL: who specifically — the BI lead, the data engineering team].`*

*I didn't build trust by presenting. I built the Unity Catalog foundation with them — bronze, silver, and a handful of governed gold metric views — so the agents queried assets they had reviewed and endorsed, not a parallel copy I'd built around them. Endorsed assets were prioritized in the Context Index routing, which meant their governance decisions were literally what the agents obeyed. I reviewed designs with them before code, and when my first architecture broke in testing, I told them so and showed the tracing rather than hiding it.*

*By the time the MVP shipped, `[FILL: concrete sign of trust — they owned the metric views, they curated Genie Spaces themselves, they demoed it to their own stakeholders].` The system didn't replace them; it made their governed data the thing every business user finally reached."*

## 3. Acting on feedback that disconfirmed your belief

**CEO-ready answer.**

> "I build the measurement before my opinion hardens. I believed the sophisticated retrieval strategy was the right production choice. I had put real effort into it. So I benchmarked it against five simpler options on the same test set. The data disagreed. Every option had zero leaks and similar quality, and mine was the slowest and costliest. I shipped the simple one and documented when that would flip. At a consumer lender, I assumed support tickets were one shape. A couple of hundred real tickets showed three. When the data disagrees, I say so as clearly as I'd claim a win."

**Technical-interviewer answer.**

> "I tested my preferred strategy, decomposition plus reranking, against five simpler ones on a single golden set. Same queries, same leak checks, same quality metrics. All six had zero leaks and near-identical quality. Mine was the slowest and most expensive. I shipped dense retrieval and recorded the condition for revisiting: a much larger corpus, where retrieval stops being easy. At the lender, I read a couple of hundred historical tickets before designing. I expected one shape and found three. That drove a triage layer, three investigation routes and a code-lookup agent. About a third of tickets were clarification round-trips my design did not handle. I logged that as the next gap, not as solved."

**GROUNDED — the retrieval benchmark + the lender ticket analysis**

*"I believed the decomposition-plus-reranking retrieval strategy was the right production choice for the enterprise RAG platform — it's the sophisticated approach, and I'd put real effort into it. Rather than trust that, I benchmarked it against five simpler strategies on the same golden set.*

*The data disagreed with me. At that corpus size every strategy scored zero leaks and near-identical quality, and my preferred one was simply the slowest and most expensive. I wrote that down plainly — dense retrieval is the right choice here, the fancy one hasn't earned its keep yet — and documented the condition under which the answer would flip.*

*Same thing at a large Indian consumer lender, before writing a line: I assumed IT-support tickets were one shape. I went through a couple of hundred real tickets and found three — and that about a third were clarification round-trips my design didn't handle at all, which I flagged as the next gap rather than pretending it was solved. The habit I try to keep: build the measurement before the opinion hardens, and when the measurement disagrees, say so in the same sentence you'd have used to claim the win."*

## 4. Building trust with security and compliance

**CEO-ready answer.**

> "Four things, and none of them is a slide. First, let them set the bar. The insurer's compliance team defined zero leaks for their regulators, and that became the release gate. Second, make the guarantee mechanical. Access is a hard rule; the model's judgment never touches it. Third, make the documentation unable to lie. An automated check fails if it drifts from the running policy. Fourth, be open about failures. I walk security teams through my own false-alarm leak, start to finish. Security teams don't trust systems that claim no edges. They trust people who show the edges."

**Technical-interviewer answer.**

> "The mechanism earns the trust, so I show it. Compliance defined what zero leaks meant for their regulators. That definition became test cases in an evaluation harness that fails the release on one leak. Access control is attribute-based and enforced before generation. The model never sees a document the user cannot see. Leak or no leak is a hard rule, and tone is a separate, softer check. I split those after finding a flaky test where the model's judgment sat inside a security decision. A standalone check fails if the security documentation drifts from the running policy code. And I walk them through my false-alarm leak, including the stale test labels behind it."

**GROUNDED — insurer / Meridian**

*"Four things, and none of them are a slide. Let them set the bar: I asked the insurer's compliance team what zero leaks meant for their regulators and made that the release gate, so it was their standard I was meeting, not mine. Make the guarantee mechanical: the evaluation harness gates the release, and a security decision is a hard rule — the model's judgment is never in that path. Make the documentation unable to lie: a standalone check fails if the security reference drifts from the running policy code, so what they were told stays true. And be open about failures: on my own reference build the harness once flagged a leak; I stopped, traced it, and it was a false alarm from stale test data. I walk security teams through that story, false alarm included.*

*Security teams don't trust systems that claim to have no edges. They trust the person who shows them where the edges are."*

## 5. Pushing back on a senior leader

**CEO-ready answer.**

> "I push back with the customer's outcome, not my preference. At the insurer, the executive sponsor wanted the first release to cover every business unit and market, plus open-ended search. In about two months, that meant a wide, shallow system nobody would trust. I took it to the sponsor directly. I showed what the full scope did to the governance work and to the date. Then I offered a trade: two business units, one market, four domains, shipped on time. Expansion would be a copy, not a rebuild. They agreed. That slice cut time-to-insight from days to minutes and earned the expansion."

**Technical-interviewer answer.**

> "I made the case with the engineering cost of scope, not with opinion. Every business unit and market adds rows to the access matrix, governed views to build and cases for the evaluation set. Open-ended search adds a second retrieval path with its own permission model. In about two months, that means thin coverage everywhere and a leak gate nobody can trust. I showed the sponsor that cost against the date. The trade was two business units, one market and four specialist domains. I designed the slice so expansion meant adding specialists and governed views, not rebuilding orchestration. The slice cut time-to-insight from days to minutes and earned the expansion conversation."

**PARTLY GROUNDED — insurer scope / managed-feature choice.** Same spine as Q30 and Q3; `[FILL: who, and the moment]`. Use Q30 if the pushback was on scope, Q3 if it was on the managed-feature choice. Don't use both in one loop.
