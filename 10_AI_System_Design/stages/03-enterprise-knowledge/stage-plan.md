# Stage 3 Plan: Enterprise Knowledge

Read the actual Stage 2 state/snapshot and ADR-002 before this change. Preserve short draft/history, durable acceptance, queue/worker claims, bounded tools, scoped status, and external-ambiguity handling. Alice now needs supplier-policy answers grounded in changing documents she may read.

Teach 6.3 Object storage and data lifecycle at D1, 8.1 Document ingestion and indexing at D3, and 8.2 Search architecture at D3. Revisit 4.2 messaging from Stage 2 through duplicate/out-of-order connector events. Keep 8.3 Enterprise retrieval governance (Stage 6, D3) contextual and 14.1 evaluation architecture (Stage 8, D3) deferred; a small retrieval relevance fixture is not a production evaluation platform.

Add connector events, immutable source-version blobs, chunk/index publication, metadata version/tombstone pointers, and a permission-filtered retrieval path that rechecks current authorisation before model context is assembled. Keep one-host SQLite fixtures; distinguish atomic local index/metadata publication from a distributed object/search deployment. No earlier component is removed.

Illustrative corpus: 1,000 documents, 10 chunks/document, 200 changed documents/hour, 0.5 seconds/chunk embedding only for capacity comparison. No hosted embedding/model service is used. Outcomes: replay does not duplicate chunks; stale events cannot resurrect deleted content; restricted/other-tenant text never reaches returned context; an unpublished object remains invisible; a cited response identifies the current version.

Five phases, two intermediate checkpoints, six-step branchable ingestion/retrieval walkthrough, lexical relevance exercise, a two-control authorisation/version lab, four Staff interview drills, and unassessed exit gates. Estimated integrated study: six to eight hours. Package and validate fully before starting Stage 4.
