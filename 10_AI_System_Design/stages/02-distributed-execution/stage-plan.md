# Stage 2 Plan: Distributed Execution

Start from actual Stage 1 architecture `v0.1-stage-01`, guide/state, and ADR-001. Preserve the existing short draft API, scoped history, model adapter, and commit-before-success semantics. Introduce long document preparation for the same hypothetical Tenant A procurement workflow.

The illustrative workload is six jobs/minute, 20 seconds/job, and a 90-second job deadline. Proposed acceptance target is 300 ms after durable enqueue; not measured. First-teach 4.1, 4.2, 4.3, and 7.3 at D3. Revisit 6.1 at D2 through atomic claims rather than repeating database theory. Keep overload/fairness (5.3, Stage 5) contextual and distributed transactions (3.2, Stage 7) deferred.

Add a durable DB queue, separate worker role, epoch/lease state, bounded retry/dead/unknown outcomes, and an allowlisted three-step tool workflow. No existing role is removed. Logical roles and worker store are local fixtures, not a broker deployment. New job HTTP routes are specified but not implemented/tested as HTTP endpoints.

Five phases teach intuition before terminology, alternatives, three crash positions, unit-correct capacity, two intermediate checkpoints, four Staff interview drills, recall, and unassessed exit gates. The walkthrough covers acceptance/claim/execute/recover/complete/status, and the deterministic simulator varies lease and crash position.

Measurable outcomes: one active claim under a two-worker race; safe redelivery on expiry; rejected stale completion; external uncertainty blocks retry; disallowed tools and step/deadline exhaustion stop execution. Tests use temporary SQLite files and logical clocks. Estimated study time is six to eight hours; no learner completion is inferred.

Produce complete matching guides, runnable slice/tests, stage state/snapshot, ADR-002, validation report, coverage update, and clean-extraction package before moving to Stage 3. Defer real broker integration, heartbeats, provider reconciliation, cancellation, full agent orchestration, and production deployment.
