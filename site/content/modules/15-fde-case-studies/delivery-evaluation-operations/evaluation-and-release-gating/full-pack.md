# Evaluation and Release Gating for Thirty AI Applications

*A gate strict enough to stop a bad release is slow enough that teams route around it.*

- An evaluation platform makes a controlled decision about whether one change is safe to ship; a dashboard of scores is at most one view of it.
- This page folds the group's prompts into one read for the day before.
- The anchor design comes first; the neighbouring prompts, the incident and the cost pivot follow as deltas on the same gate.

| Case in the group | What it contributes here |
|---|---|
| LLM Evaluation and Release-Gating Platform (anchor) | Sections 1 to 8 and 11 to 13: framing, requirements, sizing, architecture, decision logic, graders, failure handling, rollout, delivery |
| Incident: model regression missed by a weak evaluation suite (sales copilot) | Section 9: the incident walked through end to end |
| OpenAI-style practice prompt: The Model Got Worse After an Upgrade | Section 10: the gate applied retroactively |
| OpenAI-style practice prompt: Build an Evaluation Strategy for an AI Application | Section 10: the gate built from nothing |
| Costs are fine but the eval bill tripled | Section 14 |
| Self-drill, Drill Add-ons tab | Section 14 |

Sections and tables marked *(own construction)* were built for this page from the sources' arguments. They are not in the sources verbatim.

---

## 1. Restate the Ask as a Release Decision

The customer opens with one sentence. "We need one platform that lets 30 AI applications decide whether prompt, model, retrieval, or tool changes are safe to release." The first job is to restate it without smuggling in a design.

A dashboard answers "what are the scores?" Nobody is obliged to act on that. The platform exists to answer "can this change ship?", and that question has an owner, a threshold and a record. So the goal is to make quality, safety, latency and cost regressions visible before and after deployment; the platform is the means.

| Restatement | Why it is weak or strong |
|---|---|
| Weak: "Build an evaluation dashboard with test runs, scorecards, and approvals." | Feature-first. It never pins a baseline, never says what blocks a release, never names who may override |
| Strong: "Build a release-gating system that helps teams compare a candidate AI change against the current baseline, detect quality, safety, latency, and cost regressions, and record the evidence behind a release decision." | Keeps the outcome in view. A dashboard becomes one possible interface to a controlled decision process |

Four stakeholders hire the platform, and each asks a different question. Blur them together and you get a system that is technically impressive and unusable in operation.

| Stakeholder | The question they hire the platform to answer |
|---|---|
| AI application engineer | "Did my change worsen behaviour?" |
| Domain evaluator | "What should I score and why?" |
| Safety lead | "Is this release safe enough for the risk profile?" |
| Release manager | "Can I approve this with evidence?" |

Ask the questions that change the design most. Recite the six-question tree in order.

| # | Question | What the answer decides |
|---|---|---|
| 1 | Which application types are in scope, and which are safety- or revenue-critical? | Whether a failed check blocks or warns; whether human review is mandatory |
| 2 | Are we gating only pre-release changes, or also monitoring live releases? | Offline suites only, or shadow traffic, canaries and sampled production too |
| 3 | What labels exist today, who reviews hard cases, and how often do they disagree? | Deterministic scoring, model graders, or human routing; disagreement kept as a signal |
| 4 | How frequently do teams release, and what confidence level is required to ship? | Fast smoke gates versus slow, rich review |
| 5 | What parts of a trace are sensitive, and what must be redacted or isolated? | Redaction, tenant isolation, retention, who may inspect failures |
| 6 | What regression threshold blocks a release versus only opening a review? | Whether the gate is credible at all |

Two more come from the answer key: what counts as a release, and who may override a failed gate and how that is recorded. An audited override forces immutable records and role-based controls. Shared evaluation data forces tenancy boundaries.

When the interviewer stays vague, protect the riskiest assumption. Assume the gate should block uncertain, high-impact changes and escalate them to a human. False passes are more dangerous than false blocks for high-impact applications.

> *"I'd frame this as a controlled decision process rather than a dashboard: compare a candidate against a pinned baseline, detect quality, safety, latency and cost regressions, and record the evidence behind the decision."*

## 2. State Requirements as Testable Constraints

A requirement that cannot fail a test is a preference. "Fast gate" is a preference. "p95 run duration under 20 minutes in the release window" is a constraint, and only the constraint shapes the architecture.

The functional requirements make this a gate rather than a dashboard. Split them with MoSCoW so the first release is the smallest trustworthy path *(the split is own construction; the items are the sources')*.

- The must-haves are six. A release owner submits a candidate change, and the platform compares it to a pinned baseline and returns pass, block or hold with evidence.
- Datasets, prompts, models, tools and graders are versioned, because versioning is the only way to reproduce a decision later.
- Both deterministic and probabilistic evaluations run, since some checks must be stable and others depend on rubric judgement.
- Every candidate is compared against a pinned production baseline, never reported as an absolute score.
- Release policies are enforced per application, which turns analysis into action. Human review is supported, and reviewer disagreement is recorded as a first-class signal rather than discarded as noise.

The should-haves follow once the gate is trusted. Privacy-safe production failures are sampled back into future suites so the test set evolves with the product. Online sampling watches live or shadow traffic after rollout. Latency and cost gates sit beside quality and safety.

The first version deliberately excludes six things. Automated fine-tuning or prompt optimisation. A full legal or compliance sign-off workflow. Open-ended notebook experimentation, which weakens reproducibility. Every metric for every application on day one. Cross-tenant sharing of datasets or graders. Custom visualisation of every trace field.

| Constraint | Stated so it can be tested |
|---|---|
| Latency | The gate finishes inside the release window. A p95 run duration past about 20 minutes (the target I'd set) turns a gate into a blocker |
| Availability | Peak matters more than average. Thirty teams releasing in the same business hour can overwhelm a daily-average design |
| Reproducibility | Same dataset, prompt version, model version, tool config and grader version recreate the same evaluation context |
| Lineage | Every result traces back to its inputs and version history |
| Statistical honesty | No overstating tiny differences, no cherry-picked runs, no treating noisy scores as precise |
| Security | The sandboxed runner is hostile-adjacent: timeouts, egress limits, secrets scoping, per-run concurrency caps |
| Isolation | One application's traces, labels and evaluations never leak into another tenant's workspace |
| Reliability | Fail closed on release decisions when evidence is missing. Never approve on an incomplete or unvalidated run |
| Cost | At roughly 3,000,000 test-case executions a day, tier the suites. If every release costs a fortune, teams route around the gate |

Every requirement then needs an owner in the architecture. If a requirement has no component owner, the design is incomplete.

| Requirement | Component responsibility |
|---|---|
| Version datasets, prompts, models, tools, graders | Registry and immutable version store |
| Run deterministic and probabilistic evaluations | Evaluation runner and scoring service |
| Compare candidates with production baselines | Baseline comparator and diff engine |
| Support human review and disagreement | Review queue, adjudication workflow, audit log |
| Enforce release policies | Policy engine and release gate |
| Sample privacy-safe production failures into future tests | Trace ingestion, redaction, curation pipeline |
| Reproducible runs | Run manifests, locked versions, execution logs |
| Grader and dataset lineage | Provenance graph and metadata store |
| Statistically honest comparisons | Reporting layer with uncertainty-aware summaries |
| Tenant and data isolation | Authz boundaries, workspace partitioning, encryption controls |

## 3. Size the Gate Against the Release Window

The whiteboard version is a queue, a pool of workers, a results database and a dashboard. It works at average load and fails when the release train tightens. Sizing turns it into a design.

- The headline workload is 30 applications × 20 candidate releases a day = 600 candidate evaluations a day, not "30 apps".
- With 5,000 test cases each, that is 3,000,000 test-case executions a day.
- I'd assume each case needs 2–3 model or grader calls at minimum and 3–5 more realistically.
- So the platform makes roughly 6,000,000–15,000,000 model or evaluator calls a day.

| Window | Calls/sec needed | Approx. workers at 2.5 calls/sec each | Practical implication |
|---|---|---|---|
| 24-hour batch | 69–174 | 28–70 | Shared elastic pool is sufficient if backlog is allowed |
| 6-hour release gate | 278–694 | 112–278 | Requires aggressive parallelism, admission control, and prioritisation |

The worker figure assumes one call every 400 ms, about 2.5 calls a second per worker at full utilisation. Real deployments add headroom for retries, tail latency and bursts.

Average load answers "can we survive the day?" Peak load answers "can we survive the release window?" A modest daily average still overwhelms the system if many applications submit in the same hour. The pool is therefore shared and elastic, with per-tenant quotas and admission control so one application cannot starve the rest.

| Scenario | Candidate evaluations/day | Test-case executions/day | Design pressure |
|---|---|---|---|
| Current | 600 | 3,000,000 | Queue depth, worker pool, storage writes |
| 10x growth | 6,000 | 30,000,000 | Throughput, cost, sharding, retention |

In this design, evaluator concurrency is the limit at current scale. At 10x, I expect storage, retention and human-review routing to dominate.

Cache immutable inputs, never the behaviour being measured. Test definitions, baseline outputs, corpus snapshots, rubric and prompt templates and precomputed embeddings are safe to cache when versioned. A cached stochastic judgement would hide exactly the variance the gate is meant to measure.

> *"I cache immutable inputs and expensive shared fixtures, not the stochastic judgement itself."*
