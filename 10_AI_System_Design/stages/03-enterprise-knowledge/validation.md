# Stage 3 Verification

Scope: five-phase retrieval lesson, offline interactions, and SQLite FTS5/versioned ingestion slice. Production integrations and learner mastery are unassessed. The local atomic metadata/index boundary is distinguished from a real distributed object/search publication.

Run `python3 10_AI_System_Design/stages/03-enterprise-knowledge/labs/test_knowledge.py` from the directory containing the workspace. Ten tests cover scoped relevance/citations, replay, replacement, tombstone ordering, revocation during retrieval, stale/forged hits, partial publication/orphans, immutable conflicts, query syntax, and ingestion through the actual Stage 2 durable job store. Python needs SQLite FTS5 and JSON support; no paid service is used.

Four JavaScript cases verify allowed, revoked, deleted, and stale context. Static parity/coverage/link checks, offline browser branch/step/case checks, Reset/keyboard, answer reveals, mobile width, print, and no-JavaScript reading run before acceptance. Authoring tools and prerequisites are in `tools/`; neither Markdown rendering dependencies nor the browser harness are runtime dependencies of the HTML/Python exercise.

The complete ZIP preserves prerequisite guides/labs, architecture/ADRs, current and per-stage snapshots, curriculum/coverage, and licences. `tools/verify_archive.py` extracts it into a clean directory, resolves artifacts and local links, and runs Python suites sequentially.

Unverified: real source connectors/cursors, PDF/file parsing, object/search services, embeddings/hosted generation, immediate upstream revocation, physical erasure/backups, production identity/TLS, deployment/load/SLOs, screen-reader usability, and model-answer entailment. The citation fixture verifies provenance and authorised context, not model truthfulness. Pass evidence is added only after execution.

Executed result: ten Python tests and four JavaScript cases passed; 193 Markdown teaching blocks matched the offline HTML. Every walkthrough branch/step, simulator case, Reset, keyboard, reveal, mobile, print, and offline/no-JavaScript browser check passed. Render lint reported zero failures/warnings and three retained document-layout exceptions. The clean archive check passed prerequisite and current Python suites and all declared local artifacts/links.
