# Current System: Enterprise AI Platform


Version: `v0.12-stage-12`. Previous: `v0.11-stage-11`. Decision: [ADR-012](decisions/ADR-012-versioned-regional-platform-contracts.md).

Retain the enterprise supplier workflow and all earlier roles: API Gateway, Identity/Policy Service, AI App Service, Metadata DB/history, Queue/Workers, Document Ingestion, Search Index, immutable passage caches, bounded fair admission, audit/Telemetry, Evaluation Service, Model Gateway, proposed GPU Pool, Fine-Tuning Jobs and Model Registry. Retain trusted current resource policy, approved egress, tombstones/source versions, stable scoped operation keys, worker epochs and unknown-outcome reconciliation, version-bound releases and model lineage.

Keep A/B inside EU-primary or eligible EU-secondary and C inside US-home. Maintain one authoritative writer per tenant, verified fencing before regional promotion, current policy/audit/readiness, copy-watermark/RPO checks and regional request/token/slot capacity. Async operation evidence loss still requires recovery holds, not blind redispatch.

Add versioned app manifests, desired-state validation, a migration metadata controller, supported developer onboarding, an ownership/exception operating model and decision portfolio. Keep global control out of customer prompt execution. Reuse existing logical roles; no blanket microservice rewrite. Migrate through inventory, manifest validation, eligible read-only shadow, one-app/cell pilot, generation-checked cutover, outcome/cost review and retirement. Reversal requires current previous-route eligibility and does not undo data/external effects.

The executed new slice is a SQLite metadata controller plus deterministic TCO worksheet. It does not deploy regional services, execute requests, attest shadow reports, integrate real identity/policy, migrate data/schema, or fence distributed writers. Earlier fixture limits remain. Coverage records describe authored/checked lessons; learner mastery and production readiness remain unassessed. Stage 12 ends the requested sequence; remaining work is capstone assessment and real pilot evidence.

Latest guide: [Stage 12](../stages/12-staff-platform/guide.md). Evidence: [validation](../stages/12-staff-platform/validation.md). Learner mastery remains unassessed.
