# Evaluation and Release Gating for Thirty AI Applications, part 5

## 14. Cut the Eval Bill Without Blinding the Gate

The pivot after a good design is #120: "costs are fine but the eval bill tripled." The answer starts from the fact that LLM-as-judge is inference too. Evaluation is the eighth cost driver, the one that runs off the request path where no interactive user ever sees it.

The source answer is four moves. Use a stratified sample instead of the full set. Use a cheaper judge with a periodic strong-judge audit. Run deltas only on changed prompts or models. Cache judge calls on unchanged pairs.

The self-drill card turns the same idea into the full answer shape.

| | |
|---|---|
| Dominant driver | Batch and evaluation pipeline spend: LLM-as-judge over the full suite on every change |
| Cheapest lever first | Sample the suite for smoke tests; cheap judge first, strong judge only on failures and disagreements; cache judged pairs by prompt version; full suite only at the release gate |
| Metric that proves it | Eval cost per release; judge agreement rate; time to gate; regressions caught per dollar |
| Do not | Run the full strong-judge suite on every commit |
| 60-second line | A gate nobody can afford gets bypassed. Tier the judges, sample on every change, run the full suite only where a release decision is made. |

The source names the risk alongside the fix: weak eval coverage misses quality regressions, as incident #91 shows. So cut cost by sampling the easy majority, never by thinning the critical slices. The regulated-claim slice runs in full on every release; the smoke tier samples the rest *(own construction)*.

Two levers connect the cost answer back to the design. The anchor's gap note calls human review almost certainly the most expensive unit cost. Better grader agreement therefore lowers cost per run by shrinking the human-review tail. And the judge cache is safe only on unchanged pairs. It is keyed on prompt version, model version and case, and never replaces a judgement the gate is meant to re-measure.

Every strong cost answer runs through four verbs in order. Measure eval spend per release and per tier first. Route cases to a cheap judge and escalate only disagreements. Bound the full suite to the release gate. Cache safely, keyed on every version that could change the verdict.

---

## Level calibration

Every level can draw the pass, block or hold gate; the level shows in who trusts it, who may override it and whether teams can afford it.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Pins the candidate and the production baseline, judges Δ on quality, safety, p95 latency and cost separately, and fails closed: missing evidence blocks, thin evidence holds. Sizes 3,000,000 executions a day against a six-hour release window. | Who owns rubrics and overrides, and why the LLM grader needs calibration against humans before it may gate. |
| Staff | Adds the trust path: app teams own rubrics, an authorised owner records every override, the grader stays advisory until human agreement holds, and critical slices pass on their own, as incident #91 shows. Tracks escape rate, override reasons and eval cost per release. | How the gate becomes the standard for all 30 apps without teams routing around it, and what changes at 10x. |
| Principal | Treats the gate as the organisation's release contract: a shared schema with app-specific rubrics, policy mode as a versioned artifact nobody can bypass, and tiered suites that keep the gate affordable. Plans for 10x, where storage, retention and human-review routing dominate, with compliance mapping and per-segment fairness as later dimensions. | Each team's real release cadence, label quality and acceptable eval spend, which need their own data before thresholds are set. |

## Key Takeaways

- The ask is a controlled release decision for four stakeholders with four different questions, not a dashboard of scores.
- Requirements are stated so a test can fail them, with every one owned by a component and six things fenced out of the first version.
- Thirty apps, twenty releases and five thousand cases make three million executions a day, and the peak release window, not the daily average, sizes the pool.
- The control plane decides and the data plane executes, so a noisy runner can never make the policy nondeterministic.
- Every input is pinned and every result is a delta against a pinned baseline, with records that are immutable, monotonic and write-once.
- The decision checks quality, safety, latency and cost separately, judges quality on a lower bound, and never lets quality hide a safety drop.
- A grader is release logic: versioned, calibrated against humans, advisory until agreement holds.
- Critical slices pass on their own, because an aggregate pass rate can hide the failure the business fears.
- Incident #91 passed at 96.7% with six regulated-claim cases while production ran 8.7% unsupported claims.
- A post-upgrade regression is the gate run retroactively, and an evaluation strategy is the gate built from nothing.
- Missing evidence blocks, thin evidence holds, and dashboards degrade while the gate keeps its record.
- Trust is earned on one application first, then graders, then latency and cost gates, then a shared schema.
- The fifty minutes go mostly to evaluation design, closed by the two-minute answer.
- The eval bill falls by tiering judges and sampling the easy majority, never by thinning the critical slices.

## Check Yourself

1. **Why is a dashboard the weak answer?** It reports scores nobody must act on. It never pins a baseline, defines what blocks a release, or says who may override.
2. **Redo the sizing aloud.** 30 × 20 = 600 evaluations a day; × 5,000 = 3,000,000 executions; × 2–5 calls = 6–15 million calls; 69–174 calls/sec over 24 hours or 278–694 in a 6-hour window; 28–70 or 112–278 workers at 2.5 calls/sec.
3. **Why separate the control plane from the data plane?** So selection, enforcement and escalation stay deterministic when runners are slow, failing or fed adversarial input.
4. **What is the difference between missing and insufficient evidence?** Missing evidence, such as a grader timeout or a down evidence store, blocks. Insufficient evidence, a sample too small to decide, holds rather than approves.
5. **Why is quality judged on the lower bound of the delta?** A small gain on a noisy rubric may be noise; the lower bound of a bootstrapped delta keeps the gate statistically honest.
6. **How is the verbosity-rewarding grader detected and prevented?** Detect a score shift toward long, low-alignment answers against a baseline grader. Prevent it by versioning the grader, storing rubric hashes and calibrating on concise-correct and verbose-wrong cases.
7. **In incident #91, what three facts show the gate failed rather than the model?** A 96.7% pass on 120 cases with only 6 regulated-claim cases, an 83.3% pass on that slice, and warn-only policy mode. Production ran 8.7% unsupported claims against a 1.2% baseline.
8. **The offline benchmark improved but the customer says quality fell. Name three explanations.** Unrepresentative benchmark, a regressed customer segment, and worse edge cases hidden by a better average. Also possible: retrieval changed, the UX slowed, or structured output got less reliable.
9. **What if there is no labelled data?** Sample production traffic, use expert labelling and weak supervision, use synthetic examples carefully, measure grader agreement, and send hard cases to humans.
10. **What is the sixty-second answer to "the eval bill tripled"?** A gate nobody can afford gets bypassed. Tier the judges, sample on every change, run the full suite only where a release decision is made, and cache judge calls on unchanged pairs.

## References

### Fact-check sources (checked 27 Sep 2026)

- [RFC 9110 HTTP Semantics: 13.1.1 If-Match and 15.5.13 412](https://www.rfc-editor.org/rfc/rfc9110.html#name-if-match): a failed If-Match returns 412 Precondition Failed, not 409
- [Zheng et al. 2023, Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685): LLM judges show verbosity bias
- [AICPA & CIMA: SOC 2](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2): SOC 2 control mapping
- [GDPR Article 17: Right to erasure](https://gdpr-info.eu/art-17-gdpr/): deletion rights that trace retention must respect
- V2 chapter 9 tutorial, "My Perspective on the Gaps": the gap note calling human review the most expensive unit cost

