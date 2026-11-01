# ADR-002: Durable Jobs With Guarded Worker Ownership

Status: accepted for educational architecture. Stage: 2. Date: 2026-11-02. Supersedes: none; ADR-001 remains valid for short requests.

## Situation and Alternatives

Alice's hypothetical document preparation exceeds the five-second interactive target and must survive worker loss. A web-process thread overlaps work but does not persist it. A broker plus relational job store provides independent worker operations but introduces publication/acknowledgement boundaries. Choose a SQLite-backed job queue for the small single-host exercise; keep a broker/outbox option for measured deployment needs.

## Decision

A new proposed job API commits queued state before accepted response. Separate workers atomically claim an epoch and lease in short transactions, execute bounded allowlisted tools, then conditionally commit completion. Completed rows are no longer eligible for claims. Safe failures can retry with deterministic backoff, at most three attempts and a job deadline. Dead rows retain evidence. Expired started-external-effect rows become unknown and require reconciliation.

Trusted identity scopes job submission/status; the store receives trusted identity fields from the not-yet-built HTTP adapter. The runnable slice is a real SQLite worker/store exercise with simulated clocks and tools. It neither implements the new HTTP facade nor integrates a hosted provider or broker.

## Guarantees and Limits

One active claim is established transactionally. An outdated/expired epoch cannot commit completion. External actions are not fenced by a local epoch, and model execution/billing is not exactly once. Checkpoint records preserve only committed step progress, not unobserved external answers. Serial database writes and one host remain operational limits. Automatic reconciliation, renewal, cancellation, and multi-host deployment are deferred.

## Checks and Revisit Triggers

Test concurrent claims, crash redelivery, stale writes, durable restart, tenant scope, duplicate keys, attempts/deadline, and tool budgets. Track queue age, lease expiries, attempt count, dead/unknown state, and result commit latency. Preserve rows during incident review. Revisit the queue when measured contention or worker isolation requires a network broker/managed database; preserve acceptance and duplicate contracts during migration.
