# Stage 2 Architecture Snapshot

Version: `v0.2-stage-02`. Previous: `v0.1-stage-01`. Acceptance: teaching architecture, not deployed production. Decision: [ADR-002](../../architecture/decisions/ADR-002-durable-execution.md).

Retain Client, AI App Service ingress/identity/policy, original short `/requests` endpoint and scoped history, Model Gateway adapter, Metadata DB, and proposed metadata-only Telemetry. Add a separate job path with a durable Queue represented by the job table and separate worker objects/process roles on the same host.

The job transaction establishes accepted queued state. A worker claim establishes a lease and epoch. The worker executes bounded approved steps outside a DB write transaction. Result commit requires current unexpired authority and deadline. Safe work can redeliver; started external ambiguity becomes unknown without automatic retry. The proposed job HTTP facade is not implemented by the executable.

Real code verifies SQLite persistence/concurrency, retry states, and policy budgets using logical clocks. Identity, external models/tools, broker delivery, deployment, renewal, cancellation, and reconciliation remain unverified or unimplemented. Stage 3 can reuse durable jobs for ingestion while preserving these invariants.
