# Stage 11 Validation

Executed on 2026-11-02, after the revision that applied review actions A01–A05 (review run `stage-11/20261102T085400174706Z`). Content verification is separate from learner mastery. All numerical workloads, scores, rates, costs, timeboxes, and recovery targets are illustrative inputs.

## Executed Checks

Commands ran from `10_AI_System_Design/`.

- `uv run -q --with markdown python tools/render_stage.py stages/11-multi-region` regenerated `guide.html`; it was not edited by hand.
- `uv run -q --with markdown python tools/check_stage.py stages/11-multi-region`: passed. 357 teaching blocks match the HTML, with five phases, mapped first-taught and revisit IDs, three offline SVG diagrams, local links, anchors, at least two answer reveals (four are present) and complete walkthrough fields.
- `python3 stages/11-multi-region/labs/test_regions.py`: 12 tests passed. They cover independent residency, failed-region, authority-quorum, fencing, approval-generation, audit, bundle, RPO and RTO gates; a lost quorum reporting only "authority unavailable"; exact RPO (60 s) and RTO (plan 600 s) boundaries; 360 s and 780 s plans; invalid times; capacity units, burst and the 2M tokens/minute quota case (33 RPS: 3 replicas, 66 slots); and monthly cost per success before (28,125 micro-USD) and after a failover with 20,000 or 40,000 retried attempts (28,225 and 28,325). Ledger tests cover a redelivered attempt counted once, a cross-region retry counted as extra spend with one success, rejection of a conflicting revision (cost, region or outcome), tenant scoping, failed spend and zero-success economics.
- `node tools/test_simulator.cjs stages/11-multi-region`: 7 deterministic JavaScript cases passed. Each `lesson-ui.json` expected value equals `simulate(params)`, and the guide's preset table uses the same Decision, Blocking reasons, Planned recovery and Possible loss strings.
- `PLAYWRIGHT_MODULE=<repo>/site/node_modules/playwright node tools/check_svg_fit.cjs stages/11-multi-region`: passed. Every diagram label, side nodes included, fits its node box and the viewBox at 1440 px and 375 px.
- Browser check (Playwright substitute): `tools/check_browser.cjs` needs puppeteer-core, which is absent, so the review run's `html-labs-browser.cjs` was copied to a scratch directory and run with the repository's Playwright Chromium. It was adapted for the new control ids (`authority`, `restore`), seven walkthrough steps, the new branch order and new static-text markers, and it now measures side-node text against its own node box. Result: 17 checks passed, 0 failed. These covered five phase sections, all 112 field comparisons across 4 branches and 7 steps, direct step selection, Previous/Next/Reset, branch change resetting the step, keyboard Enter/Space/Tab, live regions, all 7 lab presets, deterministic control changes (combined "residency, writer not fenced, RPO exceeded"), lab Reset, answer reveals, SVG text fit, no horizontal scroll at 375 px, print layout hiding controls, no JavaScript errors and no HTTP(S) requests, the no-JavaScript static walkthrough table, lab table and SVGs, and internal anchors.
- `PLAYWRIGHT_MODULE=<repo>/site/node_modules/playwright node tools/check_browser.cjs stages/11-multi-region`: passed. The course browser check now runs on Playwright Chromium instead of Puppeteer Core. It covered every branch and step field, simulator presets, Reset, keyboard selection, reveals, 375 px page width, print, no-JavaScript and zero network requests. The unchanged Stage 10 also passes it, which shows the port matches the earlier check.
- Visual check: the after-architecture and recovery-sequence SVGs were screenshotted at 1440 px and inspected. The US-home branch, the EU-primary to EU-secondary replication edge and the fail-closed branch match the Mermaid source.

## Not Re-run in This Revision

- The Hallmark render review and the `site/` repository checks (sync, content checks, ESLint, TypeScript, build) were not re-run. The guide keeps the existing renderer layout, and the stage is not a site route.
- `python3 tools/verify_archive.py dist/stage-11-multi-region.zip`: passed after the rebuild. The checksum matches, and a clean extraction resolves every declared artifact, Markdown/HTML link and anchor, and runs every included Python suite.

## Known Rendering Limit

Diagrams with a side branch render 730 units wide. On narrow screens they keep a 44 rem minimum width and scroll sideways inside their figure, so text stays at about 14.5 px at 375 px and the page itself does not scroll horizontally. Captions and text alternatives carry the same content.

## Distribution Check

The stage ZIP preserves workspace-relative paths for this lesson, required predecessor guides and labs, stage state/plan/snapshot, applicable ADRs, curriculum and coverage, embedded-font licences, and existing validation tools. Later stages, caches, databases, credentials, render captures and archives are excluded. A clean extraction checks every declared artifact, local Markdown/HTML link and HTML anchor, then runs all included Python suites in sequence. This revision refreshed the Stage 11 files, tools and decision records in the archive and added ADR-013. Inherited Stage 1–10 files, the README and coverage stay as they were at Stage 11. Stage 0 is not included, because its orientation links Stage 12; it ships in the Stage 12 archive.

Authoring-only HTML generation uses Python's `markdown` package. Browser checks used Playwright Chromium in place of Puppeteer Core. Neither is needed to read the offline HTML or run its standard-library Python exercises. The JavaScript source is embedded in the HTML, and its Node worksheet tests run from the package root.

## Unchecked Boundaries

Actual regions, DNS/private routing/provider geography, a real consensus authority store, lease or epoch enforcement in real stores, replication or acknowledged-state durability, measured lag at isolation, measured RPO/RTO, reserved GPU/provider capacity, actual usage invoices and production billing reconciliation are not checked. Prior stage integration and deployment limits remain. Trusted fixture metadata and eligibility booleans stand in for production services; successful local checks do not establish their truth in deployment. Load testing, real identity, security review, screen-reader usability, browsers other than Chromium and learner mastery remain unassessed. See the guide and ADR for stopping boundaries and deferred specialisations.
