# Stage 3 Architecture Snapshot

Version: `v0.3-stage-03`. Previous: `v0.2-stage-02`. Decision: [ADR-003](../../architecture/decisions/ADR-003-versioned-retrieval.md). Acceptance: educational baseline, not a deployed retrieval product.

Retain Client, trusted AI App Service/Identity/Policy roles, synchronous draft/history, Metadata DB, Queue, Workers, bounded tool/model adapters, and proposed metadata-only Telemetry. Add source connector envelopes, immutable version storage, Document Ingestion/chunk publication, Search Index, current-version/tombstone/policy metadata, and a retrieval-context gate.

Ingestion uses Stage 2 durable jobs and guarded completion. Content publication atomically changes local metadata and FTS passages; immutable objects may remain orphaned after partial preparation. Retrieval ranks within tenant/current-version/reader scope and rechecks stored policy/text before provider context. No relevant or authorised current evidence means refusal for the grounded-answer path.

The executable is SQLite FTS5 plus local version/policy fixtures, including an actual durable-job-to-ingestion test. No external connector, parser, embedding/model, production object store, or distributed search cluster exists. Upstream permission changes not yet observed remain a freshness risk. Old objects/backups are not physically erased by tombstoning search visibility.

Stage 4 may add app replicas/caches and a separately operated relational store when traffic requires it. It must preserve live policy/version checks, durable worker contracts, scoped history, and exact citations.
