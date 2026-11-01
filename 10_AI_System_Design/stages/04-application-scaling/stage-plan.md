# Stage 4 Plan: Scale the Application

Use actual Stage 3 state/snapshot and ADR-003. Preserve authorised versioned retrieval, immutable source identity, durable jobs/worker fencing, short draft/history, model boundaries, and trusted scope. The hypothetical pilot expands to many readers and a 100 requests/second peak.

First-teach 6.2 Caching systems at D2 and 12.1 Scaling and traffic engineering at D3. Revisit 1.1, 1.2, 2.2, 7.1 from Stage 1 and 8.2 from Stage 3 only through changed scale constraints. Keep 5.1 admission controls contextual until Stage 5 and 16.1 container orchestration deferred to Stage 9.

Introduce a load-balancing role, stateless app replicas, separately operated shared relational-state design, and bounded per-replica immutable-passage caches. The executable uses shared-file SQLite and multiple local objects to exercise semantics only; it does not pretend to deploy a multi-host database or autoscaler. An explicit migration decision preserves schemas, uniqueness, and read-after-write history while moving production persistence off host-local files.

Illustrative model: 25 ms CPU/request, 70% target utilisation, two authoritative reads plus four passage fetches/request, 500 queries/second DB budget, 100 requests/second offered load, and a selectable provider limit. Compare measured versus modelled signals, cache-key/invalidation risks, bounded eviction, startup/warmup, and graceful scale-in.

Five phases, classified coverage, two checkpoints, six-step walkthrough and four-control capacity experiment. Outcomes: cross-replica history remains scoped/durable; cache hits never bypass current permission/version gates; update/delete/revocation cannot return cached stale text; eviction remains bounded; model arithmetic identifies the current limiting resource. Add Python integration checks against actual Stage 1/3 slices and deterministic JS cases. Estimate six to eight study hours. Validate/package fully before Stage 5.
