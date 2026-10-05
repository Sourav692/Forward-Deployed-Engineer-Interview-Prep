# Release Gates: Safety, Quality, and Cost

*A release gate must be strict enough that one leak blocks a ship, yet calm enough that people still believe it when it fires.*

◷ 8 min

Every layer of evaluation ends in one decision: does this change ship? Gate safety absolutely, quality against a baseline per segment, and cost as a visible trade. The gate draws on the sets and judges from [Golden Sets and Sample Size](/learn/production-ai/evaluation-and-release-gates/golden-sets-and-sample-size) and [Validating LLM Judges](/learn/production-ai/evaluation-and-release-gates/validating-llm-judges).

**Objectives:**

- explain why security is a gate rather than a score, and what counts as a leak;
- decide which checks should block a release and which should only advise;
- gate quality per stratum, and read a canary result against sample-size arithmetic.

---

## Gate Security, Do Not Score It

A retrieval regression is a bug. Recall drops, someone notices, and it is fixed next sprint. A leak is an incident. So the security check is not a number that rises and falls; it is a gate.

Three rules define the gate in the enterprise RAG harness. Any forbidden document that reaches the context counts as a leak. So does a forbidden document that is only cited, because naming a document confirms it exists and is relevant. One leak fails the whole run outright. It does not lower a score.

The third rule is what makes the gate trustworthy. The leak decision comes from the policy engine directly, with no model judgement. A deterministic check can block a release. A model's opinion should not. [Output Guardrails and Refusals](/learn/production-ai/enterprise-rag-in-production/output-guardrails-and-refusals) explains why a citation is itself a disclosure.

## Keep Noise Out of the Gate

Two checks are recorded but deliberately do not gate.

**`distracted`**, an allowed document that did not answer the question, is a quality miss, not a security miss. If it gated, people would start treating every gate failure as probably noise. Then they would stop trusting the alarm.

**Refusal correctness on security cases** is a model's judgement of wording. Whether the refusal was ideal, or a thinner but still safe answer from public material, is not a safety property. It is recorded as an advisory.

The case that forced this rule is `S05`. It refused on most runs and occasionally answered thinly from public help-centre documents, because the sufficiency verdict comes from a model. There were zero leaks either way, yet the gate flickered. The fix: security cases gate only on the deterministic leak property. Security must never depend on a coin flip.

## Gate Quality Per Stratum, With a Significance Test

Quality changes need a different gate. Compare the candidate with the baseline using a significance test, and do it per stratum, not only on the mean.

One documented case shows why. A document question-answering agent served 11 enterprise tenants. A retrieval change lifted aggregate accuracy from 79% to 81% and shipped. Within two weeks one tenant escalated: its accuracy had fallen from 82% to 67%.

The evaluation set had been drawn in proportion to traffic, so that tenant was only about 4% of it. Its documents leaned heavily on internal abbreviations. The change had shifted weight towards dense retrieval, which hurts exact matching on such tokens. The aggregate gain was real, and the collapse was invisible inside it.

The fix had two parts. First, a per-stratum floor: no release may drop any stratum by more than 3 points, whatever the aggregate does. Second, per-tenant monitoring in production with automatic alerts. Averages summarise, and summaries hide the failures that turn into escalations.

## Make Cost a Visible Trade

The third gate is cost. Report it on every run, and block on a ceiling breach. A quality gain that triples spend may still be worth it, but only as a decision someone makes in the open, never as a silent side effect.

Together the three rules form one gate. A pull request triggers the harness, which runs the cases paired with the baseline across strata. Deterministic trajectory assertions run first, with no judge needed. Open-ended answers go to the judge in both orders, and verdicts come back with quoted spans. The gate then blocks or allows, and states its reason.

## Run the Gate on Every Change, at Two Sizes

A gate that runs only when someone remembers is a habit, not a gate. The GenAI engineering notes describe the same loop with off-the-shelf scorers, run in CI on every change.

Keep a versioned test set of questions, reference answers, and expected sources, edge cases included. CI runs the full pipeline on it, saves the outputs, computes the metrics, and fails the build when a score drops below its threshold. Each result is stored with its commit hash and timestamp, so a regression points at the change that caused it.

Several tools compute those scores. **RAGAS** scores faithfulness, answer relevance, context precision, context recall, and answer correctness, using a model as the judge. **TruLens** adds tracing and its "RAG triad" of groundedness, answer relevance, and context relevance. **DeepEval** checks for hallucination, bias, and toxicity and runs inside pytest, so it slots into an existing test job. LangSmith and Arize Phoenix lean towards tracing, datasets, and drift monitoring. The judge-validation rules in [Validating LLM Judges](/learn/production-ai/evaluation-and-release-gates/validating-llm-judges) apply to every one of them.

Control the bill by running two sizes. Run a small set on each pull request and the full set on merges or nightly. Use a cheaper judge model for routine runs.

## Read a Canary Result Against the Arithmetic

The sources describe a simpler continuous-delivery flow for prompt changes. A new prompt version runs 100 golden-set queries scored by an LLM judge for semantic equivalence. Below a 90% pass rate, deployment is blocked. Above it, the version is registered and sent 5% of traffic as a canary for 24 hours. A two-proportion z-test then compares success rates.

The worked numbers are 3,600 of 5,000 successes for the old version (72%) and 188 of 250 for the new one (75.2%), with a p-value of 0.03. Below 0.05 the new version is promoted; otherwise the canary is extended.

> **Warning: the sources disagree on whether that canary is big enough.** The sizing rule from [Golden Sets and Sample Size](/learn/production-ai/evaluation-and-release-gates/golden-sets-and-sample-size) suggests that detecting about 3 points near a 73% success rate needs roughly 3,000 cases per variant. The canary arm had 250. Treat a small-sample canary win with suspicion, prefer paired comparisons, or extend the canary until the arm is large enough.

Rollout stages, automated rollback and multi-metric A/B decisions belong to AgentOps, which covers change management, and are taught there.

## Worked Example: The Enterprise RAG Gate, Read Honestly

On the enterprise RAG golden set, the `enterprise` strategy passes 22 of 22 cases. Recall@k is 1.00, MRR is 1.00, groundedness is 1.00 and refusal accuracy is 100%. Leaks are 0, median latency is 10.7 s, and cost is $0.0196.

Read it honestly. The corpus has 22 documents, so the quality numbers say almost nothing about strategy choice. What matters is that the harness exists, gates the release, and would say something on a 200,000-document corpus. The number that matters is the zero.

The harness is offline only. For online signals, the answer the source recommends ties feedback to the same `run_id` the trace produces. Escalation-to-human rate becomes a proxy for retrieval failure. Refused questions are embedded and clustered on a schedule, and each cluster becomes a content gap on the backlog of whoever owns that source. The live metrics reuse the harness's `EvalReport` shape rather than a second metrics system.

---

## Key Takeaways

- Security is a deterministic gate: any forbidden document retrieved or cited is a leak, and one leak blocks the release.
- Quality misses and model-judged refusal wording are recorded but kept out of the gate, so the alarm stays credible.
- Quality gates against the baseline per stratum with a significance test, with a floor such as no stratum dropping more than 3 points.
- Cost is reported every run and a ceiling breach blocks, so expensive gains are explicit decisions.
- The gate runs in CI on every change, small on pull requests and full on merges, with scores stored per commit.
- A canary win must be read against the sample size behind it; small arms produce confident noise.

## Check Yourself

1. **Why is the leak check decided by the policy engine rather than an LLM judge?**
   A deterministic decision can be trusted to block a release. A model's judgement can flicker between runs, as case `S05` showed.

2. **Aggregate accuracy rose from 79% to 81%, yet one tenant escalated. What gate would have caught it?**
   A per-stratum floor, such as no stratum dropping more than 3 points, plus per-tenant monitoring. That tenant was only about 4% of a traffic-proportional set.

3. **Why is an allowed but irrelevant document not a gate failure?**
   It is a quality miss. Gating on it would create false alarms and teach people to ignore real ones.

## References

**Sources:** `07_Evaluation_Golden_Sets_Judges.md` (FDE Handbook, Enterprise RAG): "Why security is a gate", "What the evaluation caught" (story 3), "The results, read honestly" and "What is not built". `ch12_validation_and_measurement.md` (*Cracking Agentic AI System Design Interviews*, Ch. 12): "The CI Release Gate", including the eleven-tenant segment-collapse case, summarised in our own words. `Cross_Cutting_System_Design_Quick_Reference_v2.md`: §8 "CI/CD Pipeline for AI Systems" and "Statistical Significance Testing for Canary". `Module_02_RAG_Frameworks_Tools_Implementation.md` (GenAI Engineering Modules): Topic 4, "Which tools can automatically score a RAG system?" and "How do I run evaluation continuously inside CI/CD?".
