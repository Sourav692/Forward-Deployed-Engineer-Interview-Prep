# Evaluation and Release Gating for Thirty AI Applications, part 4

## 12. Roll Out One Application and Earn Trust

A gate nobody trusts gets bypassed, so adoption is part of the design. The rollout proves trust on one application before generalising.

| Phase | Owner | Exit criterion |
|---|---|---|
| 1. Prove it on one critical application | The application team plus one platform engineer | The app submits runs, compares against a baseline, and gets a recommendation humans understand. Every metric is a learning signal, not yet a hard gate |
| 2. Calibrate automated graders against humans | Evaluation lead or applied scientist | Stable, explainable agreement on the cases that drive release decisions; the disagreement set is understood |
| 3. Add latency and cost gates | Platform engineering with product and finance input | The candidate stays within agreed performance and cost envelopes, or the exception is approved with a rationale |
| 4. Expand with a shared schema and app-specific rubrics | Platform team; app teams own their rubric configuration | Coverage, escape rate and flaky-case rate hold as teams join |

The answer key's calendar: week 0–1 names scope, evidence, override authority and thresholds. Week 1–2 proves one application. Week 2–3 calibrates graders, including concise-correct and verbose-wrong examples. Week 3–4 holds the gate advisory. Week 5 adds latency and cost gates. Week 6–8 expands with a shared schema. After the pilot, widen only while the metrics hold, and retire any suite that stops discriminating.

The shared schema becomes core product: run metadata and model, prompt, dataset and rubric versions, plus outcome labels, trace references and the release decision. Rubrics stay configuration, because a support bot and a coding assistant do not need identical criteria. Adapters handle per-app formats; the shared service owns orchestration, scoring and audit.

| Metric | Calculation | Owner | Illustrative alert threshold |
|---|---|---|---|
| Evaluation coverage | executed cases / planned cases for a release | platform ops | below 95% for critical apps, or below the agreed minimum sample |
| Release regression escape rate | harmful changes that passed the gate / total harmful changes discovered | release manager with incident review board | rolling 30-day rate above 5%; same class escapes twice in a month; any severe escape in a critical app |
| Human-grader agreement | match rate between automated grader and sampled human labels | evaluation lead | below 85% for a stable rubric, or below the app-specific floor |
| Run duration | final scoring event minus candidate submission | platform engineering | p95 above 20 minutes, or median up more than 20% week over week |
| Cost per run | compute + storage + tool calls + human review per run | platform owner with finance visibility | above $25 for the critical app, or a trend that breaks the release budget |
| Flaky case rate | cases whose result changes across repeated runs without input change / repeated cases | QA or evaluation infra | above 2% overall, or above 5% in a release-affecting dimension |
| Production failure capture rate | regressions caught before or right after deploy / total known regressions | incident review board | below 80% over a quarter, or down more than 10 points |

A concrete launch review reads like this. Coverage 97%. One severe regression escaped in the last 20 releases. Agreement 89%, acceptable only if the disagreement set is explainable. p95 run time 14 minutes against the 20-minute window. Cost $18 per release evaluation. Flaky rate 1.5%, concentrated in one ambiguous rubric dimension. Four of 5 known regression classes caught before release, 1 by canary, with a postmortem required on the missed class.

Rollback triggers are as explicit as go/no-go gates: a bad canary signal, a spike in flaky cases, a post-release incident in an unchecked failure class, and a failed dependency that prevents trustworthy scoring.

## 13. Deliver It in Fifty Minutes

Spend time in proportion to risk, not diagram size. The evaluation-design block is the depth budget, and interviewers probe it hardest.

| Minutes | Phase |
|---|---|
| 0–5 | Discovery and assumptions: users, what counts as a release, failure modes, approval owner (section 1) |
| 5–10 | Scope and success criteria; platform-wide versus app-level metrics (sections 1 and 2) |
| 10–18 | Architecture: control and data planes, the ten-step path (sections 3 and 4) |
| 18–28 | Evaluation design, the depth budget: rubrics, graders, suite size, nondeterminism (sections 5 to 8) |
| 28–35 | Security, reliability and failure modes (section 11) |
| 35–42 | Rollout and adoption (section 12) |
| 42–47 | Follow-ups: grader validation, golden set, nondeterminism, online-to-offline |
| 47–50 | Executive summary: the outcome, the riskiest trade-off, the first production gate |

Open with the business result and the hidden constraint. The applications are not homogeneous: some are high-volume support assistants, some low-volume workflows, some narrow safety cases. So do not force one universal metric. Build a shared evaluation spine with app-specific rubrics and gates on top.

The two-minute spoken answer, from the answer key:

> *I would not start with the model. The ask is one platform so 30 applications can decide whether a change is safe to release, but the platform is not the goal — making quality, safety, latency, and cost regressions visible before and after deployment is. So I would restate it as a release-gating system that compares a candidate against the current baseline and records the evidence behind the decision, then separate the four stakeholders. An engineer asking "did my change worsen behaviour," an evaluator asking "what should I score," a safety lead asking "is this safe enough," and a release manager asking "can I approve this with evidence" are different jobs. Architecturally, the control plane decides what to evaluate and the data plane executes it inside a sandbox I treat as hostile-adjacent. An artifact registry pins the candidate so it cannot drift mid-run, a dataset store owns suites and rubrics, a scheduler fans out work with per-tenant quotas, a grader scores across all four dimensions, and a policy engine reads only completed validated runs to compute the delta against thresholds. Missing evidence fails closed, and a sample too small to support a decision holds rather than approves. The named failure is a grader that rewards verbosity over correctness, so graders are versioned, rubric hashes stored, and a calibration suite includes concise-correct and verbose-wrong cases. I would prove it on one critical application, calibrate against human labels, add latency and cost gates, then expand. The gate is only useful if teams trust it enough not to route around it.*

The lines that carry the round *(own construction from the sources' arguments)*:

1. *"A dashboard reports scores. A gate makes a decision, with an owner, a threshold and a record."*
2. *"Thirty apps, twenty releases, five thousand cases: three million executions a day."*
3. *"Δ against a pinned baseline, never an absolute score."*
4. *"Missing evidence blocks. Thin evidence holds. Nothing passes by default."*
5. *"Quality cannot buy its way past the safety floor."*
6. *"The grader is part of the release logic, so it is versioned and calibrated like code."*
7. *"An aggregate pass rate can hide a failing slice. Critical slices pass on their own."*
8. *"Model quality is not the same as application quality."*

The follow-ups arrive in a predictable order.

| Follow-up | Answer |
|---|---|
| How do you know the grader is reliable enough to gate releases? | Advisory first; calibrate against human labels on the decision-relevant cases; promote high-confidence checks to hard gates only as agreement holds |
| What belongs in the golden set? | Happy paths, known hard cases, policy-sensitive cases, past incidents and near misses, and quiet failures such as verbose-but-wrong answers |
| How do you compare nondeterministic outputs? | Distributions over repeated seeded trials, outcome equivalence rather than text match, stratified by scenario |
| How does online feedback enter offline evaluation? | As a discovery channel: redact, label, then add to the golden or shadow set |
| Why not run the full suite on every commit? | Tiered evaluation: smoke on every change, broader regression pre-release, deep audits for high-risk changes |
| Why not one universal rubric? | Generic metrics for trends, task-specific rubrics for the decision |
| How do you know the gate isn't blocking good releases? | Track the override rate and the reason for every override. Treat a rising rate of justified overrides as a threshold or rubric defect *(own construction)* |
| What about regulation? | Registry, lineage and audit trail are most of a compliance story; add an explicit control mapping, such as SOC 2-style controls, and reconcile deletion rights with trace retention *(tutorial's own gap note)* |
| What about fairness? | Stratify the golden set by user segment and add a per-segment Δ as a fifth dimension of the same fail-closed decision *(tutorial's own gap note)* |

Repair the five weak-answer traps on the spot. "We'll track accuracy and latency" is too generic; name task-specific rubrics and release decisions. "The model grader decides everything" is too automated; add human calibration and audits. "Full suite on every commit" is too big too soon; tier it. "Pass or fail" is too binary; add thresholds, confidence bands and escalation paths. "We only care about pre-release quality" is too narrow; add online feedback and post-release drift detection.
