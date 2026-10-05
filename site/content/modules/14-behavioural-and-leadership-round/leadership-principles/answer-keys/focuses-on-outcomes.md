# Focuses on Outcomes - Answer Key

Spoken answers - 3 grounded, 1 partly grounded. Deliver them in your own cadence; the wording is a script, not a recitation.

## 1. A team spread too thin

**CEO-ready answer.**

> "I cut scope to one outcome and proved it on a narrow slice. At a large Asian life insurer, the pull was to cover every business unit, every market and open-ended search. A small team and two months makes that a wide system nobody trusts. So I anchored on what the sponsor needed: governed, self-serve answers replacing a BI queue that took days. Two business units. One market. Four specialist domains, not twelve. I took the data foundation myself so the team stayed focused. Time-to-insight went from days to minutes on that slice. That result earned the expansion conversation."

**Technical-interviewer answer.**

> "The technical decision was to narrow the data surface before writing any agent logic. Every extra business unit and market adds access rules, metric definitions and evaluation cases. Two business units, one market and four specialist domains gave me a governed foundation I could test end to end. I built that foundation myself: bronze, silver and governed gold metric views in Unity Catalog. The agents queried only those assets. The trade-off was coverage. Open-ended search and the other domains waited. What I bought was a repeatable pattern. Adding a domain means a new specialist and new governed views, not a rebuild. On that slice, time-to-insight went from days to minutes."

**PARTLY GROUNDED — a large Asian life insurer, scope narrowing.** Fill in who was on the team.

*"Early at the insurer, the pull was to cover everything at once: multiple business units, multiple markets, every document type, plus open-ended enterprise search on top of the BI use case. With `[FILL: team size / who]` and about two months, that's a recipe for a wide, shallow system that no one trusts.*

*I refocused around the one outcome that actually mattered to the sponsor — self-serve, governed answers that replace a BI queue that took days — and cut everything that didn't serve it. Scope went to governed data domains, not open-ended search. The first governed-retrieval build went to two business units in one market. Four specialist domains, not twelve. And I took the data-foundation work on myself so the rest of the team wasn't split between building agents and building tables.*

*The refocus wasn't 'do less'; it was 'prove the model on a narrow slice so expanding it later is a copy, not a rebuild.' Time-to-insight went from days to minutes on that slice, and that result is what earned the expansion conversation."*

## 2. Saying no to a distracting feature

**CEO-ready answer.**

> "I say no when a feature doesn't move the number the customer judges us on. On an enterprise retrieval platform, I benchmarked six strategies. The most sophisticated one was the most impressive to demo. It was also the slowest and most expensive, with no quality gain. I shipped the simple one and said so plainly. At the insurer, I kept open-ended enterprise search out of the MVP. It would have doubled the governance surface and delayed what the sponsor needed. It went on the roadmap, not in the build. Good demos don't pay for themselves. Outcomes do."

**Technical-interviewer answer.**

> "I ran six retrieval strategies against one golden set, from keyword and dense similarity to hybrid and decomposition plus reranking. Every strategy scored zero leaks and near-identical quality. Decomposition plus reranking added extra model calls per query. That meant more latency and more spend for no measurable gain. I shipped dense retrieval and recorded the condition that would reopen the decision: a much larger corpus. At the insurer, I kept open-ended enterprise search out of the MVP. Governed text-to-SQL runs against curated assets with known access rules. Open search over every document needs its own permission model and its own evaluation set. That doubles the governance surface. It went on the roadmap with that cost written down."

**GROUNDED — declining the fancy retrieval strategy (Meridian) + open-ended search (insurer)**

*"On the enterprise RAG platform I benchmarked six retrieval strategies — keyword, dense similarity, hybrid, and a decomposition-plus-reranking approach that was the most sophisticated and the most fun to build. On the same golden set, every strategy scored zero leaks and near-identical quality; the sophisticated one was simply the slowest and most expensive. So I said no to shipping it, even though it was the more impressive thing to talk about. Dense retrieval was the right production choice at that corpus size, and I said that plainly instead of defending the clever option.*

*At the insurer, the equivalent 'no' was open-ended enterprise search. The outcome that mattered was replacing the BI queue with governed, traceable answers. Open-ended search would have doubled the governance surface and delayed the thing the sponsor actually needed. It's on the roadmap; it wasn't in the MVP.*

*The test I apply: does this feature move the one number the customer is judging us on? If not, it waits — no matter how good it looks in a demo."*

## 3. Measuring success on a customer engagement

**CEO-ready answer.**

> "Three layers, agreed before the build. First, the customer's outcome. At the insurer, time-to-insight went from days to minutes, and dashboards moved from weeks in a queue to self-serve. Second, the gates that cannot slip: zero leaks, explainability, latency. Compliance signed off on those before I wrote code. Third, the signal for my own company: adoption grew after rollout. I report that as correlated, not proven. At a consumer lender I failed to instrument resolution time from day one. I can't quote that number, so I don't. The measurement plan is now part of scoping."

**Technical-interviewer answer.**

> "I treat the measurement plan as part of the design. Layer one is the customer metric: time-to-insight, days to minutes at the insurer. Layer two is the release gates. Zero leaks is enforced by an evaluation harness that fails the release on a single leak. Explainability comes from per-node MLflow tracing, so every answer traces back to the assets it used. Latency is a gate agreed with the sponsor and compliance. Layer three is adoption, which I report as correlated with rollout, not causal. At the lender, I missed the baseline. Resolution time per ticket type was not captured from day one. Without a before measurement, there is no delta to claim. Now baseline instrumentation ships in the first build."

**GROUNDED — insurer success bar + honest attribution + lender lesson**

*"Three layers, agreed before the build. The customer's outcome metric — at the insurer, time-to-insight, which went from days to minutes, and dashboard delivery, from weeks to self-serve. The non-negotiable gates — zero leaks, explainability, latency — agreed with the sponsor and compliance before I wrote code. And the platform signal for the vendor I worked for — adoption grew after rollout.*

*And I hold myself to reporting those honestly: that growth is correlated with the rollout, not a controlled experiment, and I say that unprompted. At a large Indian consumer lender I didn't instrument resolution time per ticket type from day one, so I can't quote a hard number, and I won't invent one. The measurement plan is now part of the scoping conversation, not something I retrofit."*

## 4. Metrics looked good but the outcome wasn't there

**CEO-ready answer.**

> "A perfect score can answer the wrong question. My retrieval platform scored 22 of 22 on its golden set. Zero leaks, every strategy near-perfect. But the corpus was 22 documents. At that size retrieval is easy, and the differences between strategies are noise. So I split the claims. The security property holds, and the harness gates every release. That I could defend. Which strategy wins in production, I could not. I wrote down what would make that claim true: rerun at real scale. Good numbers on the wrong question are dangerous, because nobody argues with them."

**Technical-interviewer answer.**

> "The root cause was a test set too small to separate the strategies. With 22 documents, recall 1.0 and groundedness 1.0 are easy for everyone. The spread between six strategies sat inside the noise. So I split the result by what it actually tested. The zero-leak gate does not depend on corpus size. It checks whether a forbidden document reaches the model, and that property holds at any scale. Strategy ranking does depend on scale, because retrieval gets harder as similar documents multiply. I kept the harness as the release gate and marked the ranking as unproven. The write-up names the next experiment: rerun the same method at a representative size, such as 200,000 documents."

**GROUNDED — Meridian 22/22**

*"The enterprise RAG platform scored 22 of 22 on the golden set — recall 1.0, groundedness 1.0, zero leaks, six retrieval strategies all near-perfect. It looks like a finished result. It isn't, and I said so in the write-up.*

*The corpus is 22 documents. At that size retrieval is easy, so every strategy scores well and the differences between them are noise. The table proves nothing about which strategy wins at 200,000 documents — which is the question a real customer would actually have. What it does prove, independent of scale, is the zero-leak gate and the testing discipline.*

*So I separated the claim I could make — 'the security property holds and the harness gates releases' — from the one I couldn't — 'this retrieval strategy is right for production.' And I wrote down what would need to be true to make the second claim: re-run the benchmark at a representative corpus size. Good numbers on the wrong question are the most dangerous kind, because nobody argues with them."*
