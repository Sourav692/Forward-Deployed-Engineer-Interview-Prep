# Stage 4 Architecture Snapshot

Version: `v0.4-stage-04`. Previous: `v0.3-stage-03`. Decision: [ADR-004](../../architecture/decisions/ADR-004-stateless-scale-and-cache.md). Acceptance: educational design and local invariant tests, not a deployed scale-out.

Retain all Stage 3 roles: Client, trusted identity/policy, short drafting/scoped history, durable Queue/Workers, Document Ingestion, immutable versions, Search Index/current metadata, model adapter, exact citations, and proposed metadata-only Telemetry. Add load-balancing/readiness and stateless app replica roles, bounded per-replica immutable-body caches, and a proposed separately operated shared relational authority.

Production migration must preserve request/job key uniqueness, lease/epoch predicates, source versions, scoped reads, and commit-before-success; port transaction semantics and perform a controlled one-writer cutover. The executable still uses multiple local objects and one SQLite file solely to test the shared-state contract, not to emulate a managed DB or network deployment.

Current trusted policy/version/tombstone reads precede every cached body use. Cache keys include tenant/document/version/chunk; TTL/LRU do not grant access. Cache failure can fall back to authority; authority failure cannot be overridden by cached permission. Final answers and ranking are not cached.

Capacity, query counts, provider quotas, and hit rates are explicit assumptions. No actual autoscaler, load balancer, production migration, stampede solution, or p95/load benchmark is delivered. Stage 5 may introduce fair admission/scheduling under fixed provider capacity while preserving these contracts.
