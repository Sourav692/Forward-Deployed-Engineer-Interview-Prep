# Stage 2 Verification

Scope: educational guide and SQLite job/worker slice; no production deployment. Learner mastery remains unassessed. Stage 1 prerequisites are preserved, with the new route explicitly specified rather than falsely reported as an implemented HTTP endpoint.

The stage is validated before the next stage begins. Checks cover the four first-taught D3 modules and the mapped 6.1 revisit, five learning phases, two answer-before-reveal checkpoints, matching Markdown/HTML teaching blocks, three offline SVG diagrams, local links, and full input/output/owner/failure walkthrough data.

Run from the directory containing the workspace:

```bash
python3 10_AI_System_Design/stages/02-distributed-execution/labs/test_jobs.py
```

The eight Python tests exercise durable acceptance/recreation and tenant scope, submission reuse/conflict, two concurrent claims, lease expiry and stale fencing, unknown external outcome, backoff/dead state, deadlines, and bounded/allowlisted agent steps. JavaScript cases independently check healthy execution, recoverable crash, changed lease, and ambiguous external start. The browser checks every branch/step field, case outputs, Reset, keyboard step selection, answer reveals, mobile width, print, and complete no-JavaScript/offline reading with zero HTTP(S) dependency requests.

Authoring checks use `tools/check_stage.py`, `tools/test_simulator.cjs`, and `tools/check_browser.cjs`. HTML rendering/parity checks require the authoring-only Python Markdown package; browser checks require Chrome and puppeteer-core. Neither is a runtime requirement of the guide or Python lab. Design lint checks the rendered document, retaining recorded long-document layout exceptions where needed.

The distribution is checked by `tools/verify_archive.py` after extraction into a clean temporary directory. It resolves declared artifacts, HTML/Markdown links and anchors, then executes the included Python suites sequentially. The package preserves prerequisite Stage 1 material, architecture decisions, snapshots, curriculum/coverage, and font licences. It excludes caches, databases, screenshots, and itself.

Unverified: real job HTTP integration, multi-host/broker deployment, heartbeat/cancellation, real identity/TLS, model/tool APIs, provider reconciliation, backup/restore, load/SLOs, exporter/alert backend, and screen-reader usability. Logical clock and toy model results must not be presented as production timing measurements. Specific pass evidence is recorded in stage-state only after checks succeed.

Executed result: eight Python tests and four JavaScript cases passed. Static parity checked 194 teaching blocks. Offline browser checks passed. Render lint reported zero failures, zero warnings, and three documented long-document exceptions (44c, 77, 79). No unresolved design finding remains.
