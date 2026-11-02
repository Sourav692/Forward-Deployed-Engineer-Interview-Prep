# Stage 11 Validation

Executed on 2026-11-02. Content verification is separate from learner mastery. All numerical workloads, scores, rates, costs, timeboxes, and recovery targets are illustrative inputs.

## Executed Checks

- Python 3 standard-library suite: 8 tests passed. Independent residency/fencing/current-policy/audit/bundle/RPO gates; recovery arithmetic and exact RPO boundary; invalid time/capacity values; independent app/token/slot capacity; tenant-scoped duplicate/conflicting usage; failed spend and zero-success economics.
- JavaScript worksheet: four explicit expected cases passed using `node 10_AI_System_Design/tools/test_simulator.cjs 10_AI_System_Design/stages/11-multi-region`. No model, cloud, or business work executes.
- `uv run --with markdown python 10_AI_System_Design/tools/check_stage.py 10_AI_System_Design/stages/11-multi-region`: 219 teaching blocks match HTML, five phases, mapped first/revisit IDs, three offline SVG diagrams, local links, anchors, answer reveals and complete walkthrough fields passed.
- Browser automation: every branch/step field and worksheet case, direct selection, Previous/Next, Reset, keyboard Enter, answer reveals, 375-pixel layout, print layout, no-JavaScript static teaching and offline reading passed. No HTTP(S) dependency or browser exception occurred.
- Hallmark render review uses the existing Grid document layout and embedded fonts. The first sweep found six wrapping ADR links in Stage 12; those links now stay together. Stages 10 and 11 had zero failures, reflex findings, or warnings. Final Stage 12 render confirmation passed with zero failures, reflex findings, and warnings. Three inherited reading-document layout exceptions apply per guide. In-thread visual review checked the header, reading hierarchy, walkthrough and responsive tables; no independent usability or screen-reader assessment is claimed.
- Repository validation ran from `site/` in the required order: sync, content checks, ESLint, TypeScript, and production build all passed. These stages are standalone learning-workspace artifacts and are not newly published site routes.

## Distribution Check

The stage ZIP preserves workspace-relative paths with this lesson, required predecessor guides/labs, stage state/plan/snapshot, applicable ADRs, curriculum/coverage, embedded-font licences, and existing validation tools. Later stages, caches, databases, credentials, render captures, and archives are excluded. Clean extraction checks every declared artifact, local Markdown/HTML link and HTML anchor, then runs all included Python suites sequentially. The acceptance record sets `clean_package_checked` only after that extraction succeeds; the final archive is rebuilt and verified again with the recorded result. SHA-256 accompanies each ZIP.

Authoring-only HTML generation uses Python's `markdown` package; browser checks use Puppeteer Core and Chrome. Neither is required to read the offline HTML or run its standard-library Python exercises. The JavaScript source is embedded in HTML and its Node worksheet tests are runnable from the package root.

## Unchecked Boundaries

Actual regions, DNS/private routing/provider geography, writer fencing or consensus, replication or acknowledged-state durability, measured RPO/RTO, reserved GPU/provider capacity, actual usage invoices or production billing reconciliation. Prior stage integration/deployment limits remain. Trusted fixture metadata and eligibility booleans stand in for production services; successful local checks do not establish their truth in deployment. Load testing, real identity, security review, screen-reader usability and learner mastery remain unassessed. See the guide and ADR for stopping boundaries and deferred specialisations.
