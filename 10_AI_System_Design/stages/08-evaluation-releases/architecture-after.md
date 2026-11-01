# Stage 8 Architecture Snapshot

Version: `v0.8-stage-08`. Previous: `v0.7-stage-07`. Decision: [ADR-008](../../architecture/decisions/ADR-008-versioned-quality-releases.md). Acceptance: locally executed fixture evaluation/release control, not model quality or deployment approval.

Retain verified current identity/resource policy, audit/egress, versioned retrieval/cache safety, stable result/job/reservation identities, fair bounded dispatch and Stage 7 consistency/outbox/recovery. Add immutable release-bundle/dataset/evaluator/gate identities, per-case/slice evaluation, hard known-safety gates, synthetic latency/cost checks, scoped sticky canary assignment, constrained shadow policy, generation-checked release pointer and redacted bundle/cohort telemetry.

Only approved report-bound bundles can become candidate routes in the trusted local controller. Withdrawing a candidate keeps current stable; rolling back a completed promotion selects prior approved stable. Saved operations remain immutable and cannot be regenerated or reauthorised by a release flag. Current membership/source tombstones never roll back with model routing.

The dataset has eight authored cases and fixture outputs. Timing/cost are labels, not measured inference; safety rubrics are deliberately narrow. No real model/judge, shadow/canary traffic, artifact signature, production approval pipeline or monitoring backend is deployed. Stage 9 inherits these approved-routing, evidence and runtime safety boundaries.
