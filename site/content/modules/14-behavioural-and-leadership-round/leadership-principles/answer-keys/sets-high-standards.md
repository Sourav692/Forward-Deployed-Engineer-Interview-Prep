# Sets High Standards - Answer Key

Spoken answers - 4 grounded. Deliver them in your own cadence; the wording is a script, not a recitation.

## 1. Holding the team to a higher bar

**CEO-ready answer.**

> "I set one rule: a single access leak means the build does not ship. At a large insurer, the usual bar for AI is a quality score and polite refusals. I made it zero leaks, with security decided by hard rules, never the model. I agreed that bar with the sponsor and compliance before the build. It was the customer's definition of done, not my preference. Then I made it mechanical. An evaluation harness gates every release. A separate check fails if the security documentation drifts from the code. When my own build flagged a leak, I stopped and traced it. It was stale test data. A bar has to apply to me too."

**Technical-interviewer answer.**

> "The bar was a release gate, not a target. The evaluation harness runs the governed golden set on every build. A single leak fails the release. Leak or no leak is decided by hard rules, never by the model. A second check compares the security documentation against the running policy code. If they diverge, the build fails, so what compliance approved is what is deployed. When the harness flagged a leak on my own build, I treated it as real. A claims manager had been shown a case outside their assignment. The trace showed a recent reassignment, so my test data was stale. I had also confused 'not relevant' with 'not allowed' in my labels. I added a check that keeps those apart."

**GROUNDED — zero-leak release gate (Meridian / a large Asian life insurer)**

*"For the governed RAG work, the expected bar for an AI system is a quality metric — recall, groundedness — plus 'the model refuses nicely.' I set a different bar: a build that produces even one access leak on the governed test set does not ship. Not 'low leak rate.' Zero. And a security decision is never made by the model's judgment — hard rules only.*

*How I communicated it mattered more than the rule. I agreed it with the business sponsor and compliance before the build began, so it wasn't my personal preference — it was the customer's definition of done, and everyone knew it going in. Then I made it mechanical: an evaluation harness that gates the release, plus a standalone check that fails if the security documentation drifts from the running policy code — so what we'd told compliance couldn't silently diverge from what was deployed.*

*And I held myself to it: on my own reference build, the eval harness flagged a leak. I stopped and traced it before anything else — it turned out to be a false alarm from stale test data in the harness. A bar you only apply to other people isn't a bar."*

## 2. Pushing back on good-enough work

**CEO-ready answer.**

> "I refused to accept a test that mostly passed. On a governed retrieval build, everything was green: 22 of 22 on the golden set. One security test passed most of the time. The easy call was to label it flaky. I traced it instead. I had let the model's judgment sit inside a security pass-fail decision. Mostly passing is fine for tone. It is not fine for whether we leaked a document. So I split them. Leaks are decided by hard rules. Tone gets a softer check. My rule: good enough is acceptable for things that fail loud. Never for things that fail silent."

**Technical-interviewer answer.**

> "The root cause was a non-deterministic judge inside a security assertion. The test used an LLM to decide whether a response leaked a document. That is probabilistic, so the result varied between runs. Calling it flaky would have hidden a real defect in the test design. I split the assertion. Leak or no leak is now a hard-rule check against the access policy. It is deterministic, and it gates the release. Refusal tone stays an LLM-judged check that is allowed to be soft. The golden set stayed at 22 of 22. What changed is that the security result is now reproducible. My rule: anything that fails silently gets a deterministic check."

**GROUNDED — the flaky LLM-judged security test (Meridian)**

*"On the enterprise RAG build I had a test that passed most of the time. The temptation was to call it flaky and move on — the numbers were 22 of 22 on the golden set, everything else was green.*

*I dug into why it wasn't deterministic, and the reason was that I'd let the LLM's own judgment sit inside a security-critical pass/fail decision. 'Mostly passes' is fine for 'was the refusal phrased well.' It is not fine for 'did we leak a document.' So I split them: leak/no-leak is decided by hard rules, never the model; tone is a separate, judgment-based check that's allowed to be soft.*

*Same instinct at the insurer: the first single-agent design worked in demos. It was 'good enough' until real testing, where it picked the wrong tool because nothing was specialized. I re-architected live mid-engagement rather than ship something that demoed well and failed quietly. The rule I use: good enough is fine for things that fail loud. It's never fine for things that fail silent."*

## 3. Defining done for an AI system

**CEO-ready answer.**

> "Done is something you can prove, not a demo that went well. For a governed AI system, I hold four tests. First, a release gate: one leak on the golden set fails the build. Second, security decisions are made by hard rules, never the model. Third, every step is traced, so a wrong answer leads back to the exact tool call. Fourth, a check fails if the security documentation drifts from the code. Then one honesty requirement: the limits are written down. A small test corpus. State that would not survive a restart. A system that claims no edges is not done. It is untested."

**Technical-interviewer answer.**

> "Done means four mechanisms, each with a failure condition. One, the evaluation harness runs the golden set, and one leak fails the build. Two, access decisions are hard rules in the policy engine, never the model. Three, every node is traced in MLflow, so a wrong answer resolves to the exact tool call. Four, a drift check fails if the security reference stops matching the policy code. Then I document the limits. The corpus is 22 documents, so six retrieval strategies all scoring 22 of 22 proves the gate, not retrieval at scale. The guardrail engine's locks are in process and don't survive a restart. Each limit names what would close it."

**GROUNDED — Meridian / insurer / Agent Platform**

*"Done is a property you can prove, not a demo that went well. For the governed RAG work, done meant four concrete things. A release gate: the evaluation harness runs the golden set and one leak fails the build. A separation of concerns: leak/no-leak is decided by hard rules, never the model — a security decision can't be probabilistic. Diagnosability: every node traced in MLflow, so a wrong answer can be walked back to the exact tool call that produced it, not just noticed. And documentation that can't drift: a standalone check that fails if the security reference no longer matches the running policy code, so what compliance was told stays true.*

*Plus one honesty requirement: the limits are written down. The 22-document corpus caveat, the in-process locks in the guardrail engine that wouldn't survive a restart — named in the docs, not discovered by the customer. A system that claims to have no edges isn't done; it's untested."*

## 4. Shipping something you knew wasn't perfect

**CEO-ready answer.**

> "Yes, deliberately, and in writing. On an agent guardrail engine, the locks and retry keys lived in process memory. They don't survive a restart. I shipped it because the build had to prove three things: no destructive action without approval, no double-apply on retry, no re-run after a crash. Where the keys live doesn't change those. I documented the production path in the coverage map. At a large lender, the triage classifier was simple pattern matching, brittle to new phrasing. Clarification tickets had no path yet. I flagged both as the next gaps. Imperfect is fine when it is chosen, bounded and written down."

**Technical-interviewer answer.**

> "I separated the properties under test from the storage layer. The guardrail engine has no LLM in it, by design. It proves three properties with 21 deterministic tests. No destructive action without approval, no double-apply on retry, no re-run after a crash. Entity locks and idempotency keys live in in-process Python dictionaries. They don't survive a restart or share across workers. The properties depend on key shape and check order, not on the store. So the production path is the same key shape in Redis or Postgres. That is written in the coverage map. At the lender, the triage classifier is pattern-based. It is cheap and interpretable but brittle to phrasing drift. Both gaps are written down."

**GROUNDED — Agent Platform in-process state + lender triage**

*"Deliberately, and in writing. On the agent guardrail engine, the entity locks and idempotency-key store are in-process Python dictionaries — correct in shape, but they don't survive a restart or share across workers. I shipped it that way because the point of the build was to prove three properties — no destructive action without approval, no double-apply on retry, no re-run after a crash — and those properties don't depend on where the keys are stored. I documented it directly in the coverage map with the production path: same key shape, moved to Redis or Postgres.*

*At a large Indian consumer lender, the triage classifier is pattern-based — cheap, interpretable, and brittle to phrasing drift — and the roughly one-third of tickets that were clarification round-trips have no path at all yet. I flagged both as the next gaps rather than letting the demo imply they were solved.*

*Imperfect is fine when the imperfection is chosen, bounded, and written down. It's not fine when it's discovered."*
