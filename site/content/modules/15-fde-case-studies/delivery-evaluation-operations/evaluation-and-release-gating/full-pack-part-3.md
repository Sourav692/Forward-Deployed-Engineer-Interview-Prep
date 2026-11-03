# Evaluation and Release Gating for Thirty AI Applications, part 3

## 8. Gate on Slices, Not on the Aggregate

A high average can hide a failing slice. A change may improve mean quality while hurting the rare, high-risk cases the business fears. So the release gate reads per-slice results, and a critical slice must pass on its own.

- The golden set is small enough to maintain carefully and broad enough to reflect real release risk.
- It holds representative happy paths, known hard cases, policy-sensitive cases, and examples that previously caused incidents or near misses.
- It also holds the edge cases where the old system failed quietly: malformed tool inputs, ambiguous queries, retrieval misses, and verbose answers that looked strong but were wrong.
- A golden set of obvious examples creates false confidence.

- Nondeterministic outputs are compared as distributions, not single strings. Run repeated trials where needed, seed what can be seeded, and compare aggregated rubric scores or pass rates.
- For many dimensions the unit is outcome equivalence rather than text match.
- Did the answer satisfy the task, respect policy and avoid harm? Stratify by scenario type so a regression in a small slice stays visible.

Online feedback is a discovery channel, not a scorecard. Thumbs-down, abandonment, escalation, correction and repeated retries are candidates for new cases. They enter the golden set only after redaction and trustworthy labelling. The tutorial's line: "Online feedback is a discovery channel for new failure modes; offline evaluation is where I make those failure modes measurable and releasable."

- The suite itself goes stale. The benchmark stops distinguishing candidates, or incidents cluster where it never looks.
- Mark it non-authoritative for gating, refresh it with new workflows, and re-baseline thresholds.
- A candidate can also overfit the benchmark: large offline gains with flat real-world behaviour.
- The defence is hidden holdout cases, adversarial variants, and never exposing the gate suite to the candidate's prompt, retrieval index or logs.

## 9. Walk Through the Regression the Suite Missed

The sales-copilot incident is section 8 failing in production. It proves an aggregate pass rate can hide a critical slice.

- A sales copilot drafts account-specific outreach emails from CRM notes, product documentation and approved messaging.
- The model route was upgraded to improve fluency and personalisation. After the upgrade, emails sounded polished but included unsupported claims.
- Reps saw drafts claiming "SOC 2 Type II renewal completed in June 2026" and "average 34% support cost reduction." The SOC 2 claim was not yet approved for external use.
- The ROI claim came only from an internal pilot.

The workflow was CRM account context → approved claims retriever → prompt template → LLM gateway → policy evaluator → offline eval suite → online quality monitor. The release gate checked grammar, tone and general groundedness on 120 examples. Only 6 of them were about regulated claims.

Six signals tell the story.

| Signal | Value | What it means |
|---|---|---|
| Online unsupported-claim rate | 8.7% against a 1.2% baseline, sample size 430 | Production regressed badly |
| External claim policy failures | 37, severity high | The failures are the dangerous kind |
| Release gate, `eval_v14` | 120 cases, 96.7% pass, `release_gate=pass` | The aggregate looked healthy |
| Regulated-claim slice | 6 cases, 83.3% pass | The critical slice was tiny and already failing |
| Missing cases | `security_cert_pending`, `roi_internal_only`, `customer_logo_permission` | The suite never tested the real risk |
| Claim verifier | `policy_action=should_block actual_action=warn_only` | The runtime backstop was switched off |

Two changes landed together on 2026-07-08 at 09:00. The router moved drafting from `llm_standard_v2` to `llm_premium_v3` after an offline eval showed better fluency. The policy evaluator also moved from block mode to warn-only during the experiment, to reduce false positives.

The root cause is an evaluation failure, not a model outage. The suite over-measured writing quality and under-measured unsupported business claims. The upgrade increased persuasive extrapolation, and warn-only mode let the risky drafts through.

Debug it by comparing offline pass rates with online failure modes. Inspect failing drafts, retrieve the claims used, verify the claims' approval metadata, and segment failures by model route and policy mode. Then name the gate flaw aloud: a high aggregate pass rate can hide failure on a small but critical slice.

| Horizon | Fix |
|---|---|
| Immediate | Roll back to `llm_standard_v2`; restore policy-evaluator block mode for external claims; add review banners to drafts generated during the experiment |
| Long term | A claim-level eval suite with labelled approval status; slice-based release gates; zero critical failures required for regulated claims; unsupported-claim rate monitored online; negative examples where the model must refuse internal-only claims |

Unsupported sales claims create legal exposure, customer trust damage and compliance issues. A careless or malicious rep could prompt the assistant to exaggerate ROI or security status and send the draft externally.

- Map it back onto the anchor *(own construction)*. The anchor's gate would have caught this in three places.
- A per-application threshold on the regulated-claim slice fails at 83.3%. The coverage metric flags a critical slice with 6 cases as below minimum sample, so the gate holds.
- And a policy change from block to warn-only is itself a versioned artifact, so it goes through the gate instead of around it.

> *Weak: "The model is too creative. I would make the prompt stricter and ask sales reps to review the output."*
>
> *Strong: "The failure is an eval and launch-gate problem. The suite passed at 96.7%, but it had only six regulated-claim cases and the online unsupported-claim rate jumped to 8.7%. I would roll back the model route, restore blocking for external claims, add claim-level evals for security, ROI, and customer-logo claims, and require critical slices to pass independently before release."*

## 10. Answer the Two Neighbouring Prompts With the Same Gate

Both OpenAI-style practice prompts are the anchor seen from a different moment. The upgrade-regression prompt is the gate applied after the fact. The evaluation-strategy prompt is the gate built from nothing.

**The model got worse after an upgrade.** A customer says quality declined after switching to a newer model. Treat it as the release decision that never happened, and run it retroactively. The source's diagnostic plan has eleven steps. Collect before-and-after production examples. Replay a fixed evaluation set. Segment by task, language, customer and input size. Compare structured-output compliance. Check prompt compatibility and retrieval changes. Compare latency and token usage. Run human evaluation, and calibrate any LLM-as-judge first. Roll back or pin the model version. A/B test future upgrades.

- Map those steps onto the anchor *(own construction)*. Pinning the version is the artifact registry.
- Replaying a fixed set against the old model is Δ against a pinned baseline.
- Segmenting is slice-based gating. Calibrating the judge is section 7. A/B testing future upgrades is the online sampling pipeline.
- The answer ends with the permanent fix: model upgrades become candidates that pass through the gate.

The follow-up is "the offline benchmark improved, but the customer still says quality declined." The source gives seven explanations, and each maps to a gate weakness.

| Explanation | The gate weakness it points at *(own construction)* |
|---|---|
| The benchmark does not represent production traffic | Stale or unrepresentative golden set |
| A specific customer segment regressed | Aggregate gate, no slices |
| Retrieval quality changed | Retrieval config not pinned as an artifact |
| The user experience became slower | No latency gate |
| Structured output became less reliable | No deterministic schema check |
| The model improved average quality but worsened important edge cases | Mean-based decision on a tail-risk product |
| Users are judging task completion rather than answer quality | Model quality measured instead of application quality |

**Build an evaluation strategy.** A customer wants to deploy an assistant but has no reliable way to measure quality. The source lists fourteen items to cover: a representative production dataset, golden examples, task-specific rubrics, ground-truth labels, automated graders, human evaluation, and LLM-as-judge calibration. Then safety and refusal tests, regression tests, online metrics, user feedback, slice-based analysis, statistical confidence, and continuous evaluation in CI/CD.

The source's key distinction fits in one sentence: "Model quality is not the same as application quality." Evaluate the complete workflow: retrieval, tools, business rules, user interaction, operational performance and business outcomes. That sentence is also the anchor's four-dimension gate in miniature.

The follow-up is "what if there is no labelled data?" Sample production traffic. Use expert labelling. Apply weak supervision. Use synthetic examples carefully. Measure grader agreement. Send the difficult cases to human review. The anchor's rollout says the same thing in order: one application, humans label a sample, calibrate the grader, and keep the gate advisory until agreement holds.

## 11. Fail Closed on Evidence, Degrade on Dashboards

Every external dependency and every irreversible action needs an explicit failure policy. Otherwise the default becomes "guess", and a guessing gate approves things.

| Condition | Recommended behaviour | Why |
|---|---|---|
| Grader service times out | Fail closed for release decisions; queue a retry for analysis runs | Do not approve on missing evidence |
| Metrics backend is delayed | Degrade dashboards, not gate decisions, if the decision record is already durable | Preserve the control plane |
| Evaluation case write conflicts | Retry idempotently with the same run identifier | Prevent duplicate or partial runs |
| Dependency outage persists | Open a dead-letter path and require human review | Avoid silent backlog buildup |
| Evidence store is unavailable | Block release and escalate | Audit evidence is part of the gate |

Time out grader and retrieval calls. Retry only operations that are safe to repeat. Put repeated failures behind a circuit breaker so the platform stops hammering a broken dependency. Escalate any unresolved release decision to a human rather than guessing.

- Four controls deserve their own threat model. Separate evaluator data by application and tenant, including reviewer access.
- Redact or synthesise sensitive cases at ingestion, because online samples carry PII, secrets and proprietary prompts.
- Version model-based graders like code, or the platform can change verdicts without changing the application under test.
- Prevent test-set leakage into prompts, retrieval, hidden notes or cached artifacts, since leakage manufactures false confidence.

- Inputs are adversarial until proven otherwise. A candidate prompt can carry an injection, a retrieved document can be poisoned, and an uploaded case can hide instructions that steer the grader.
- Sanitise before evaluation, isolate from the grader context, log the artifact hash and tenant scope, and keep a copy of suspicious evidence.
- Contain at the smallest scope: one tenant, one application, one region, one dependency chain.

| Failure | Detect | Contain | Prevent |
|---|---|---|---|
| Online sample contains PII | Boundary scanners or human review flag sensitive text before persistence | Quarantine, redact or synthesise, block propagation | Ingress filtering, tenant-scoped retention, least-privilege raw-trace access |
| Small sample produces false confidence | The result set is too narrow to support a decision, even if scores look good | Keep the gate in "insufficient evidence", not "approved" | Minimum sample sizes per workflow; no tiny run unlocks production |

Before launch the team must be able to show who changed the policy and which grader version was used. It must also show which tenant and application were evaluated, which cases were redacted or synthesised, which external dependencies were called, and what happened on each retry.
