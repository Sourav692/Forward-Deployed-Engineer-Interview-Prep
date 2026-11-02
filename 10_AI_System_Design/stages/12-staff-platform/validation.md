# Stage 12 Validation

Executed on 2026-11-02 after the second review-driven revision (review run `20261102T132536384130Z-rereview`, actions A01–A05 and the stage-local deferred items). Content verification is separate from learner mastery. All workloads, scores, rates, costs, timeboxes and recovery targets are illustrative inputs.

## Changes Checked

- A01: emergency rollback writes a new local generation N+2 carrying N's route; a cell never applies a lower generation, so N+1 cannot return; on reconnect the cell reports N+2 and the control plane marks N+1 rolled back. Guide, outage table, sequence, walkthrough, snapshot and lab match [ADR-013](../../architecture/decisions/ADR-013-regional-authority-and-route-generations.md).
- A02: the cell checks current eligibility in its own authority store before every CAS, on the forward path too; a recall question covers revocation after signing.
- A03: the global control plane holds only opaque placement, contract versions, signing keys and signed generations on opaque IDs. Full manifests, change records and shadow evidence stay in the tenant region; a record inventory table states where each class lives and whether it is authority. The decision exercise now bans even opaque generations and their keys outside the EU.
- A04: no "supersession note" text remains; decision references list ADR-012 and ADR-013.
- A05: 11.2 and 11.3 have applied reminders linked to Stages 10 and 11.
- Deferred items applied: `retire()` state change and reversal-window check with three expected outcomes; a 3.3 pattern table and command-or-event task; scored option names match the option table; Interview 5 trimmed to about 140 words with a new follow-up; the model ADR gives a hard-constraint verdict for every option; the HTML migration figure names each actor and shows rollback as a conditional branch; the preset table shows all six lab outputs; mismatch-branch steps 4–6 use failure-path inputs; lab state wording ("a fresh comparison under a new change key"; `inspect()` reports change state and route separately).

## Executed Checks

Commands run from `10_AI_System_Design/`:

- `uv run -q --with markdown python tools/render_stage.py stages/12-staff-platform`, then `uv run -q --with markdown python tools/check_stage.py stages/12-staff-platform`: passed. 483 teaching blocks match the HTML; five phases; mapped first-taught and revisit IDs; three offline SVG diagrams; local links and anchors; answer reveals; complete walkthrough fields for four branches; four lab controls.
- `python3 stages/12-staff-platform/labs/test_platform.py`: 14 tests passed. The new test applies N+1 after a rollback wrote N+2 and expects `older generation` with route and generation unchanged; a newer signed generation is refused without current eligibility and applied with it.
- `node tools/test_simulator.cjs stages/12-staff-platform`: five deterministic cases passed (Baseline, No overlap, Costly migration, Support burden, Negative savings); each expected value equals `simulate()`.
- `PLAYWRIGHT_MODULE=<repo>/site/node_modules/playwright node tools/check_svg_fit.cjs stages/12-staff-platform`: passed at 1440 and 375 pixels, including both side nodes of the migration figure.
- `PLAYWRIGHT_MODULE=<repo>/site/node_modules/playwright node tools/check_browser.cjs <stage path>`, run from a scratch directory: passed. The course browser check runs on Playwright Chromium. It covered every branch and step field, simulator presets, Reset, keyboard selection, reveals, 375 px page width, print, no-JavaScript reading and zero network requests.

## Packaging

The stage ZIP and its checksum are rebuilt by the coordinator after this edit. The Hallmark render review and the repository site validation from `site/` were executed for an earlier version only. `stage-state.json` validation flags were left unchanged; only its mirrored `architecture_after` text was updated.

## Known Limits Found

- Diagrams with a side branch render 730 units wide. On narrow screens they keep a 44 rem minimum width and scroll sideways inside their figure, so text stays at about 14.5 px at 375 px and the page itself does not scroll horizontally. Captions and text alternatives carry the same content.
- `apply()` assumes a verified signature; the lab signs nothing. The control plane's "rolled back" marking on reconnect is described, not executed.

## Unchecked Boundaries

Actual identity and ownership delegation, attested and version-bound shadow reports from a real comparison service, signed route distribution with real keys and a real pull loop, the staleness timer, a deployed regional authority store, regional policy and gateway integration, schema and data migration, remote writer fencing, real deployment and rollout, observed adoption and support savings, measured TCO, and customer or SLO outcomes. Prior stage integration and deployment limits remain. Trusted fixture metadata and eligibility booleans stand in for production services; successful local checks do not establish their truth in deployment. Load testing, security review, screen-reader usability with real assistive technology, Firefox and Safari rendering, Python below 3.12, and learner mastery remain unassessed.
