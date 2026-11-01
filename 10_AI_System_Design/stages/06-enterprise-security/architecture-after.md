# Stage 6 Architecture Snapshot

Version: `v0.6-stage-06`. Previous: `v0.5-stage-05`. Decision: [ADR-006](../../architecture/decisions/ADR-006-trusted-enterprise-boundaries.md). Acceptance: educational security boundaries with tested local fixtures, not production assurance.

Retain ready replicas/shared history, operation keys, current versioned retrieval and immutable-cache safety, durable jobs/epochs, bounded fair scheduling and provider budget guards. Strengthen Gateway and Identity/Policy roles with verified-principal propagation, scoped service audience/actions, current membership/epoch/freshness, and explicit resource governance. Add durable protected audit-before-disclosure and approved provider/tenant-secret-reference gates.

The local slice integrates actual Stage 3 context checks with signed public fixture envelopes, authoritative membership rows and durable audit insertion. It ignores tenant headers, rejects stale/incorrect identity and resource scope, and blocks output if mandatory audit fails. This is not a JWT/OIDC provider or a deployed mTLS/RLS/KMS/private-network system. Policy observations cannot guarantee upstream revocations not yet received.

Only permitted text may cross the external provider boundary. Network reachability, model instructions, scheduler shares and a warm cache never confer resource permission. Unknown remote outcomes and slot reconciliation remain explicit. Stage 7 may add consistency choices and fault recovery while preserving these gates; no such deployment is implied by this snapshot.
