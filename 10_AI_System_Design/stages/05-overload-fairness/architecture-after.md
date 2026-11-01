# Stage 5 Architecture Snapshot

Version: `v0.5-stage-05`. Previous: `v0.4-stage-04`. Decision: [ADR-005](../../architecture/decisions/ADR-005-bounded-fair-dispatch.md). Acceptance: educational policy and tested local slices, not a deployed dispatcher.

Retain ready app replicas and shared durable authority; trusted identity/current-source policy; immutable-body caches; original draft/history/key semantics; durable Queue/Workers/epoch fencing; source ingestion, Search Index and citations; model adapter and proposed metadata-only Telemetry. Add admission-controller role, bounded tenant queues, weighted service turns, request/token/concurrency budgets, deadline expiry, and explicit rejection/retry/settlement policy.

Design flow: validate and deduplicate, admit only within bounds, schedule eligible work, reserve provider budgets atomically, execute with current policy/worker authority, commit result, and settle only known termination. Unknown external state retains evidence/slot until reconciliation. More app replicas or different scheduling cannot increase a fixed provider budget.

The SQLite reservation guard and equal-cost finite-burst scheduler are separate local exercises; one test integrates a grant with Stage 2 Jobs. Real HTTP admission, distributed quotas, broker/network dispatch, tokenisation/usage reconciliation, cancellation/reconciliation, production providers, load/SLOs, and variable-cost fairness are not demonstrated. Source/policy revocation freshness retains Stage 3 limitations; the cache never becomes authority.

Latest authored stage is 5. Stage 6 has not been created. It may expand enterprise identity, isolation, audit, connectivity and retrieval governance while preserving all inherited execution and overload contracts.
