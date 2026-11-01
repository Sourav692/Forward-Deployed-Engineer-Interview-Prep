# ADR-003: Versioned, Permission-Filtered Retrieval

Status: accepted educational baseline. Stage: 3. Date: 2026-11-02. Supersedes: none. Preserve ADR-001 short drafting and ADR-002 durable execution.

## Situation and Options

Alice needs a current supplier-policy answer grounded in documents she may read. A broad unfiltered index can expose restricted or deleted material before generation. Compare repeated scans, lexical full-text search, semantic vectors, and hybrid retrieval. Choose lexical FTS5 for the small explicit-policy/identifier corpus; keep semantic/hybrid candidates contingent on measured authorised relevance misses.

## Decision and Migration

Add source connector events, immutable tenant/document/version blobs, passage publication, current version/tombstone metadata, and a trusted reader gate. Reuse durable jobs for ingestion. Reject immutable-body conflicts and out-of-order replacement. Preserve prior visible content if object preparation succeeds but publication fails. In the local exercise, metadata and FTS passage replacement commit together; real object/search service publication would require a separate version/cutover/reconciliation protocol.

Filter tenant, current version, deletion, and reader policy before final top-k. Recheck current policy/version when building model context and resolve stored text instead of trusting submitted hit bodies. Return exact document/version/passage identifiers. No authorised evidence means no grounded policy answer for this route; the separate short drafting endpoint remains available.

## Guarantees and Non-Guarantees

Tests verify replay, replacement, tombstones, cross-tenant restrictions, revocation between search/context, forged/stale hits, incomplete publication, query sanitisation, and reuse of the durable job store. Object bytes are modelled in SQLite, not a production object service. Connectors, parsers, models/embeddings, global revocation freshness, physical erasure, and distributed transactions are not implemented. Citation identity proves provenance, not answer entailment.

## Operations and Revisit

Measure source/policy/index lag, job age, publication failures, rejected context, relevance, and refusals. Preserve tombstones and source provenance during replay or rollback. Revisit search representation after an authorised query set shows concrete lexical misses. Stage 4 caching/replication must retain the live trusted gate and source-version identity. Broader retrieval governance stays assigned to Stage 6.
