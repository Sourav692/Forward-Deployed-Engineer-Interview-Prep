# Practise Evaluation and Release-Gate Interview Questions

*An evaluation answer that lists metrics still fails if it never says which number blocks a release and how big the test set must be.*

"How do you know it works?" is rarely a request for metric names. Interviewers want layers, a gate and a sample size. Answer each prompt below out loud first, then compare with the outline and reread the lesson it points to.

**Objectives:**

- answer the common evaluation prompts in under a minute each;
- lead every answer with what gates and what only informs;
- work through a full evaluation plan for an enterprise RAG system.

---

## Lead With the Gate, Then the Metrics

Most evaluation questions share a skeleton. Say what is measured at each layer, so a regression can be localised. Say which check blocks a release, and why it is deterministic. Say how large the test set is and what change it can detect. Only then name tools.

An answer without a gate cannot be acted on. "We'd track groundedness and recall" leaves the interviewer asking what happens when a number moves. The outlines below follow the skeleton.

## Practise the Measurement Questions

**1. "How do you know your system works?"**
"It works on my question" is not evidence. Measure each layer separately, from unit assertions up to production sampling, so a drop points at one subsystem. Keep three families apart: retrieval, generation and security. Quality is a metric; security is a gate. A team that cannot measure quality, latency and cost per run is running a demo in production. → [The Evaluation Pyramid](/learn/production-ai/evaluation-and-release-gates/the-evaluation-pyramid)

**2. "Your success rate fell from 84% to 76%. What do you do?"**
Read down the layers, not the headline. The cause could be retrieval, a tool schema, planning, context assembly or the model. Component metrics such as argument validity or recall@k name the suspect. → [The Evaluation Pyramid](/learn/production-ai/evaluation-and-release-gates/the-evaluation-pyramid)

**3. "What is the difference between groundedness and correctness?"**
Groundedness is faithfulness to the retrieved sources; correctness is agreement with reality. A stale document can make a grounded answer wrong. Measuring only groundedness rewards repeating outdated sources confidently. → [Component and Trajectory Metrics](/learn/production-ai/evaluation-and-release-gates/component-and-trajectory-metrics)

**4. "How do you evaluate an agent's path, not just its answer?"**
Assert properties of the trajectory rather than matching one reference path, because most tasks have several valid paths. Write safety assertions first, such as "never refund before checking the order status". Opening with safety rather than accuracy signals experience of systems with consequences. → [Component and Trajectory Metrics](/learn/production-ai/evaluation-and-release-gates/component-and-trajectory-metrics)

## Practise the Dataset Questions

**5. "What goes into a golden-set case?"**
A question, the principal asking it, and the strategy. Then expected documents that must reach the context, forbidden documents that must never surface, and distractors that count only against precision. Behavioural assertions cover refusals and required content. Build it with the customer's experts. → [Golden Sets and Sample Size](/learn/production-ai/evaluation-and-release-gates/golden-sets-and-sample-size)

**6. "Tell me about a time evaluation itself was wrong."**
Use the false-alarm story. The harness reported a contract leaking to an account manager who was allowed to read it; it was only irrelevant. The fix split forbidden from distractor labels, with a test that every forbidden entry is truly denied. A false security alarm trains people to ignore the real one. → [Golden Sets and Sample Size](/learn/production-ai/evaluation-and-release-gates/golden-sets-and-sample-size)

**7. "Your new prompt scores 3 points higher on a 200-case suite. Ship it?"**
Not on that evidence. With `n ≈ 15.7 × p(1 − p) / δ²`, a 200-case suite cannot reliably see changes below about 11 points. Run a paired evaluation, or detect small gains in a production experiment. Saying this unprompted is a strong signal. → [Golden Sets and Sample Size](/learn/production-ai/evaluation-and-release-gates/golden-sets-and-sample-size)

## Practise the Judge Questions

**8. "Can you use an LLM as a judge?"**
Yes, once it is validated. Score separate criteria with anchored levels and quoted evidence. Calibrate on at least 100 human labels, require kappa of 0.60 or more and position bias of 10 points or less, and report kappa beside every score. → [Validating LLM Judges](/learn/production-ai/evaluation-and-release-gates/validating-llm-judges)

**9. "Why not judge with the same model that wrote the answer?"**
Models prefer their own output over equally good answers from other models, and the effect is measurable. Use a different model, and record order-dependent pairwise verdicts as ties. → [Validating LLM Judges](/learn/production-ai/evaluation-and-release-gates/validating-llm-judges)

## Practise the Gate Questions

**10. "What counts as a leak, and what happens when one occurs?"**
Any forbidden document that reaches the context or is cited. A citation alone confirms a document exists and is relevant. One leak fails the run and blocks the release, decided by the policy engine with no model involved. → [Release Gates: Safety, Quality, and Cost](/learn/production-ai/evaluation-and-release-gates/release-gates-safety-quality-and-cost)

**11. "Why would you gate per stratum instead of on the mean?"**
Tell the eleven-tenant story. Aggregate accuracy rose from 79% to 81% while one tenant, about 4% of the set, fell from 82% to 67%. A floor of no more than 3 points lost in any stratum would have blocked it. → [Release Gates: Safety, Quality, and Cost](/learn/production-ai/evaluation-and-release-gates/release-gates-safety-quality-and-cost)

**12. "How do you roll out a prompt change safely?"**
Run 100 golden-set queries scored by a judge for semantic equivalence, and block below a 90% pass rate. Then canary at 5% of traffic for 24 hours and test success rates for significance. Add the caveat: a 250-query canary arm is too small to trust a 3-point win. → [Release Gates: Safety, Quality, and Cost](/learn/production-ai/evaluation-and-release-gates/release-gates-safety-quality-and-cost)

**13. "What online signals would you add?"**
Tie user feedback to the trace's `run_id`. Use escalation-to-human rate as a proxy for retrieval failure. Cluster refused questions periodically, and treat each cluster as a content gap for the source owner. Reuse the offline report shape for live traffic. → [Release Gates: Safety, Quality, and Cost](/learn/production-ai/evaluation-and-release-gates/release-gates-safety-quality-and-cost)

> **Warning: never let the security number into an average.** A candidate who reports "92% overall, including security" has just described a system where a leak can ship. Say out loud that leak rate is a separate gate that must be exactly zero.

## Worked Example: Write the Evaluation Plan for an Enterprise RAG Assistant

The prompt: "Write the evaluation plan for a permission-aware support assistant before it goes live."

**Layers.** Unit assertions on parsers and the policy engine. Component metrics: recall@k, MRR and nDCG for retrieval, groundedness for generation. Trajectory assertions where the system acts. Outcome checks on refusals and required content.

**Golden set.** Built with the customer's experts. Each case names a principal, expected documents, forbidden documents and distractors. Every policy rule is exercised by a case where it alone decides. Strata by persona and source type, with refusal cases at a realistic share. Versioned with a datasheet and refreshed against live traffic.

**Judge.** A groundedness judge from a different model, calibrated on at least 100 human labels, with kappa reported beside every score.

**Gates.** Leak rate exactly zero, decided by the policy engine, blocks release. Quality is compared with the baseline per stratum, with no stratum allowed to drop more than 3 points. Cost is reported, and a ceiling breach blocks.

**Size.** State the smallest change the suite can detect, and use paired evaluation for small changes.

**Online.** Feedback tied to `run_id`, escalation rate, and clustered refusals feeding the content backlog.

Each element answers one of the skeleton's questions: where it broke, what blocks, and how sure we are. That is the whole plan.

---

## Key Takeaways

- Lead every evaluation answer with layers, the gate, and the sample size, then name tools if asked.
- Measurement questions test layered metrics, groundedness versus correctness, and trajectory assertions with safety first.
- Dataset questions test labelling discipline and the arithmetic of detectable change.
- Judge questions test calibration against humans, kappa, position bias and no self-judging.
- Gate questions test deterministic leak gating, per-stratum floors, visible cost and honest canary reading.

## Check Yourself

1. **In one sentence, what makes the security check a gate rather than a metric?**
   One leak, decided deterministically by the policy engine, fails the run and blocks release instead of lowering a score.

2. **What is the smallest change a 200-case suite can reliably detect near an 80% success rate?**
   About 11 points.

3. **Name two checks that are recorded but deliberately not gated.**
   Distractor retrieval, which is a precision miss, and model-judged refusal wording on security cases, which is an advisory.

