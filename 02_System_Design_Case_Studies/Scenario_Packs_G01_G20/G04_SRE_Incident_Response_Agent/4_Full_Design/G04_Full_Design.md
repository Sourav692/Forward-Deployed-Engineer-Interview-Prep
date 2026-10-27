# Incident Response Agent for an SRE Team

*A write-capable agent under a 30-second latency ceiling: fast enough to matter mid-incident, never fast enough to skip the human.*

◷ 29 min

The hard part of this system is not correlating logs with deploys. It is that the agent depends on the same observability stack that is most likely to be degraded during the incident it is investigating. And it can propose changes to production while the people who would catch a wrong hypothesis are the busiest they will ever be. This page consolidates the group's prompts into one read for the day before. Everything else in the group is a delta on it.

| Case in the group                                                           | What it contributes here                                                                                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| #11 Incident Response Agent for an SRE team, Cracking ch 28 (anchor)        | Sections 1, 4 to 9 and 11: the four decisions, the arithmetic, the falsifying metric, the script, follow-ups, rubric, recovery |
| #32 SRE Incident Triage Agent, practice worksheet + answer key + two mocks | Sections 2, 3, 9, 10 and the spoken answer; the mock's probes and objections in section 11                                     |
| #58 OpenAI-style practice Q14, Operations / Incident-Response Assistant     | The discussion checklist and the "restart production automatically?" progression in sections 1 and 10                          |
| Self-drill for#11, Drill Add-ons tab                                        | Section 12                                                                                                                     |
| Cracking ch 23 and ch 05 pattern vocabulary                                 | Typed results, tool gateway, degradation ladder, circuit breaker in sections 6 and 8                                           |

---

## 1. Name the Read-Only Boundary Before Drawing Anything

Open with the risk profile, not the components. A research agent that is wrong wastes a query; an incident agent that is wrong restarts the wrong service during a payments outage. So the first sentence separates what the agent may query from what it may change, and everything after it is justified by that line.

> *"The agent may query anything and change nothing on its own. A ten-second human approval is acceptable mid-incident. An autonomous rollback on a wrong hypothesis is not."*

The three answer tiers show what that opening buys. The weak answer connects the LLM to logs and metrics, lets it find the root cause, and restarts services from runbooks. It treats the model as the security boundary and never separates guidance from action. The average answer builds a triage assistant that queries observability tools and retrieves runbooks, requires approval for actions and evaluates root-cause accuracy. It has the right direction but no numbers, no failure design and no rollout gates. The strong answer designs an evidence-first incident copilot. It never claims a root cause without supporting telemetry. It presents hypotheses, confidence, blast radius, recent deployments and the recommended next checks. Remediation stays approval-gated with service ownership and change-risk validation.

Restate the problem in one sentence, ask for the eight numbers, then name the oracle and cut scope. The eight numbers are throughput, latency, horizon, accuracy, cost, autonomy, data class and recovery. The oracle is the answer to "how will we know a run succeeded". The scope cut is "I'll treat X as out of scope unless you want it in". Close the requirements phase by restating everything as one sentence and asking "is that the system?" It costs 20 seconds and is consistently marked as a strong signal.

| Question to ask                                                                                                                 | What the answer decides                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Which exact incident workflow is slow, risky or inconsistent today, and what decision does the responder make at the end of it? | The first release's scope: triage for API latency, deployment regressions, queue backlogs, dependency failures, error-rate spikes |
| Who is the primary user, who reviews the output, who owns the operational risk if the agent is wrong?                           | Primary on-call, incident commander, service owners, platform SREs, engineering managers; the approval role                       |
| Which tasks are read-only, which are draft-only, which require explicit approval before write-back?                             | The tool allowlist and the approval gate                                                                                          |
| Which systems are the source of truth, and how do their permissions, freshness and ownership differ?                            | The telemetry map and the source-coverage field                                                                                   |
| Top 5 recurring cases by volume and top 5 highest-risk cases by impact?                                                         | The golden set and the red-team set                                                                                               |
| What does a successful 30-day pilot prove: MTTA, time to first useful summary, acceptance rate, fewer false mitigations?        | The dashboard and the launch gates                                                                                                |
| What must the agent refuse or escalate instead of generating?                                                                   | Grounded refusal: no root cause without telemetry                                                                                 |
| What audit evidence must exist to reconstruct why a mitigation was proposed?                                                    | The incident timeline and the trace schema                                                                                        |

Map the people, because each notices a different failure first.

| User                    | Workflow                                                     | Failure they notice first                           | What the agent gives them                                                           | Approval needed                         |
| ----------------------- | ------------------------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------- |
| Primary on-call         | Alert fires; wants a first useful summary and the next check | A confident wrong hypothesis that costs ten minutes | Correlated summary, ranked hypotheses with evidence, parallel read-only diagnostics | None for reads; approves any mitigation |
| Incident commander      | Coordinates responders, decides on mitigation                | A proposed action with no blast radius stated       | Exact command, blast radius, evidence, change-freeze status, rollback path          | Is the approver for high-impact actions |
| Service owner           | Reviews proposed changes to their service                    | An action against their service they never saw      | Ownership routing on every proposal, timeline entries                               | Co-approves per service                 |
| Platform SRE / security | Owns tool credentials and the audit trail                    | An agent holding write scope it should not          | Scoped read-only credentials, allowlisted tools, full audit                         | Signs off each new tool and source      |
| Engineering manager     | Tracks MTTA and trust                                        | A tool responders stopped reading                   | Hypothesis precision, acceptance rate, later reversal rate                          | Approves rollout stages                 |

Scope out loud before the first box. Read-only investigation over the observability stack, staged mitigation with approval, one alert class first, and no autonomous production changes. Say the practice prompt's own progression as the roadmap: read-only investigation, then suggested remediation, then human-approved execution, then limited autonomous action only for low-risk, reversible operations.

This OpenAI-style practice prompt lists what an interviewer would expect to hear discussed. Use it as a coverage check on the way out:

- logs, metrics, traces, alerts, tickets and runbooks
- time-window correlation
- service topology
- retrieval of historical incidents
- hypothesis generation
- tool access
- proposed versus executed remediation
- approval workflow
- incident timeline
- auditability
- false-positive cost
- safe rollback

## 2. State Requirements as Testable Constraints

A requirement the responder cannot test is a preference. "Fast during incidents" is a preference; "first useful summary under 30 seconds at 400 alerts in 90 seconds" is a constraint, and only the second one changes the architecture. Split the functional list with MoSCoW so the launch gate is the smallest set that still helps an on-call engineer.

The must-haves are four. Correlate logs, metrics, traces, deployments and runbooks for a fired alert, and propose a likely cause with the evidence that supports it. Execute only safe read-only diagnostics automatically; every write is a proposal with an exact command, its blast radius and the evidence behind it. Apply user, role and service-ownership permissions before retrieval and before generation, and hold only scoped read credentials. Show confidence, missing evidence and which sources could not be reached, because source coverage is an output field, not an afterthought.

The should-haves belong in the first usable version. Draft the incident timeline as events arrive. Ground every step in an approved runbook and cite it. Route proposals to the service owner and the incident commander with change-freeze awareness. Simulate a command before proposing it where the platform allows. Collect responder feedback and post-incident review outcomes for evaluation, never for direct training. Admin controls for tool allowlists, source inclusion, blocked actions and audit export. Later come automatic low-risk reversible actions, historical-incident similarity search, and per-service tuning.

Declare the non-goals, because "tell us what is broken and fix it automatically" is the request and not the first release:

- no autonomous production changes, restarts or rollbacks
- no writes to incident tooling beyond draft timeline entries and Jira creation behind approval
- no destructive commands, even proposed, without a simulated or dry-run result
- no action during a declared change freeze without the freeze owner's approval
- no ingestion of a source that lacks ACL metadata

| Constraint           | Stated so it can be tested                                                                                                                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Latency              | First useful summary under 30 seconds from alert receipt, then incremental updates. Interactive follow-up questions 3 to 8 seconds. Longer investigations run asynchronously with progress state. The budget is sliced across dedupe, correlation, parallel telemetry queries, hypothesis generation and citation verification |
| Burst capacity       | 1,200 alerts a day is trivial; 400 alerts in 90 seconds during an incident is the design point. Deduplicate and correlate before any model call; cap concurrent investigations per service                                                                                                                                     |
| Availability         | The agent runs outside the affected blast radius. Every telemetry query may return`EMPTY` or `UNAVAILABLE`; the agent reports which sources it could not reach and still produces output                                                                                                                                   |
| Security             | SSO; RBAC or ABAC over service ownership; scoped read-only tool credentials; no destructive action without approval; command simulation; change-freeze awareness; secrets never in prompts; logs redacted before they enter context                                                                                            |
| Audit and compliance | Immutable record of alert IDs, signals queried, sources reached and missed, hypotheses and confidence, proposals with blast radius, approver, decision time, executed command, outcome, model and prompt version                                                                                                               |
| Reliability          | Fail closed on permission uncertainty, on a missing simulation for a destructive proposal, and on any write without approval. Degrade on telemetry gaps by disclosing the gap                                                                                                                                                  |
| Cost                 | Small models or rules for alert clustering; the strong model only for hypothesis synthesis; capped lookback windows; cached service catalog and runbooks. Cost matters less during a SEV-1 but is still tracked per investigation                                                                                              |

Every must-have then needs an owner in the architecture.

| Requirement                         | Primary component(s)                                                        |
| ----------------------------------- | --------------------------------------------------------------------------- |
| Correlate signals for a fired alert | Alert intake, dedupe and correlation, incident context builder              |
| Propose a cause with evidence       | Hypothesis generator, evidence ranker, runbook retriever                    |
| Read-only by default, staged writes | Tool gateway with allowlist, typed results, proposal builder, approval gate |
| Permissions before retrieval        | Identity resolution, service-ownership map, policy filter                   |
| Source coverage as output           | Typed telemetry results, coverage field in the summary                      |
| First summary under 30 s            | Pre-aggregation, parallel query fan-out, tier router, streaming             |
| Audit and timeline                  | Trace store, incident timeline writer, approval log                         |
| Graceful degradation                | Degradation ladder, circuit breakers per telemetry source                   |

## 3. Map Every Telemetry Source With Its Failure Mode

The agent's inputs are the systems that break during incidents, so map each source with how it fails, not only what it holds. A source that is down is a fact the agent must report, never a gap it silently fills.

| Data source                           | What it holds                    | Owner                    | Freshness           | Permission model           | Risk during an incident                                                         |
| ------------------------------------- | -------------------------------- | ------------------------ | ------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| Prometheus / Grafana                  | Metrics, dashboards, alert rules | Platform SRE             | Seconds             | Grafana org, team and folder roles (Prometheus has no fine-grained authz) | Query storms during a spike; the metrics store itself under pressure            |
| Datadog / New Relic                   | Metrics, APM traces, logs        | Observability team       | Seconds to a minute | Role-based, per-service    | Rate limits; partial data during ingestion lag                                  |
| Logs                                  | Application and infra logs       | Service teams            | Seconds             | Index-level, PII-sensitive | Secrets and PII in log lines; volume that overflows context                     |
| Traces                                | Distributed traces               | Observability team       | Seconds             | Per-service                | Sampling hides the failing request; trace backend degraded                      |
| Kubernetes                            | Pod state, events, rollouts      | Platform                 | Real time           | Namespace RBAC             | Read credentials that are one flag away from write                              |
| CI/CD and deploy metadata             | Versions, commits, deploy times  | Platform / service teams | Minutes             | Repo permissions           | The most useful correlation and the easiest to miss when a deploy is mid-flight |
| Feature flags                         | Flag state and history           | Product platform         | Real time           | Per-project                | A flag flip that looks like a regression                                        |
| Incident management (PagerDuty, Jira) | Alerts, incidents, past tickets  | On-call program          | Minutes             | Team-based                 | Duplicate incidents; stale ownership                                            |
| Runbook repository                    | Symptoms, steps, risk level      | Service owners           | Days                | Repo permissions           | Stale steps; injection planted in a runbook                                     |

State the integration assumptions aloud. Every source record has a stable ID, an owner, a last-updated timestamp and ACL metadata. A source that lacks ACL metadata is excluded until it is mapped. Embeddings are never the authority for permissions. Source freshness varies by system, so the summary carries stale-source warnings when a record is older than the approved threshold. Responder feedback is stored separately from ground truth, and post-incident reviews become evaluation data only after approval.

The core records follow from that. Alert(id, service, severity, labels, start_time). Signal(id, alert_id, source, metric or log or trace, timestamp, value). Deployment(id, service, version, commit, deploy_time). Runbook(id, service, symptom, steps, risk_level). ActionProposal(id, action_type, blast_radius, approval_status). IncidentTimeline(event_id, incident_id, timestamp, source). Add one field the answer key does not name and the anchor insists on: SourceCoverage(investigation_id, source, status) with the five typed states.

The dependency inversion is the fact to say while the map is up. The agent depends on the observability stack, which is disproportionately likely to be degraded during the incident it is investigating. So run outside the affected blast radius, treat every telemetry query as potentially `EMPTY` or `UNAVAILABLE`, and report which sources could not be reached.
