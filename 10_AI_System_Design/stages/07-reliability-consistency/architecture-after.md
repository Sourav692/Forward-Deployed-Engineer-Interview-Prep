# Stage 7 Architecture Snapshot

Version: `v0.7-stage-07`. Previous: `v0.6-stage-06`. Decision: [ADR-007](../../architecture/decisions/ADR-007-consistency-and-recovery.md). Acceptance: tested local fault models and educational recovery contracts, not production failover.

Retain verified identity/current membership/resource policy, audit-before-disclosure, approved egress, shared history/stable keys, versioned retrieval/cache safety, durable worker epochs, bounded fair queues and provider budget reservations. Add per-data-class consistency choices, transactional result/outbox intent, duplicate-safe projection delivery, contiguous applied watermark/minimum-version history reads, bounded breaker/probe and remaining-deadline policy, and explicit recovery/diagnostic contracts.

Current access, quota and ownership authority never use stale projection fallback. Eligible history data reads may use a projection covering a trusted minimum, otherwise primary. All protected disclosure still requires current Stage 6 gates. Unknown provider state remains unknown; transaction/outbox replay does not prove exactly-once generation.

The executable uses two SQLite files and controlled delivery, plus a local logical breaker. No replicated database, consensus/leader election, network partition, actual failover/restore, collector, pager or production SLO is implemented. Stage 8 inherits these evidence boundaries for quality/release decisions and rollback.
