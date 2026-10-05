# DATA-03: Script report of every source file listed in more than one module (the "41 entries" audit) and proposed homes

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | S | DATA-01 | PM-03 | §10 Content and CMS pipeline |

Status: in progress.

## Why
Each source file must have exactly one canonical home so the site never shows the same lesson twice (R8). The owner cannot decide homes (PM-03) without a complete list.

## Context from the plan
- Decision: each source file is copied once to its home module; other modules list it under "Also useful" and link to the home lesson (§10). Rejected: copy into every module.
- Rule: material already live under `/modules/...` or `/fde-last-day-prep` is never re-synced into `/learn`; module pages link to it as a lesson entry of kind `external-live` (§10).
- Known conflicts and proposed homes (§10):
  - `Module_10_Backend_FastAPI_Deployment.md`: T1.2, T1.4 → T1.2
  - `Module_01_RAG_Fundamentals_Core_Components.md`: T2.1, T2.2 → T2.2
  - `07_Last_Day_Revision/module-12-reliability-and-failure-handling.md`: T1.5, T8.3 → already live; link
  - `03_/Customer_Discovery_Worksheets/*`, `System_Design_Worksheets/*`: T6.1, T8.1 → already live in module 01; link
  - `02_/Scenario_Packs_G01_G20/*`, `Standalone_Designs/*`: T4.x, T5.4, T5.5, T6.x → already live in module 15; link

## Scope
In:
- A script that reads `curriculum.ts` and lists every source path referenced by more than one module.
- For each, a proposed home and whether it is `external-live`.
- The report committed as a markdown table for PM-03 to decide on.
Out:
- The decision itself (PM-03).
- Enforcing one home per source in `check:content` (DATA-04).

## Files likely touched
- `site/scripts/report-multi-use.mjs` (new, guess at name)
- `site/specs/` report file (new, guess)
- `site/src/lib/curriculum.ts` (read only)

## Implementation notes
1. Import `curriculum.ts` from `.mjs` (it has no runtime imports).
2. Mark sources under folders already synced to `/modules/...` or `/fde-last-day-prep` as `external-live`.
3. Propose the home using the §10 examples as the pattern: the more specific module wins, earlier track breaks ties.

## Acceptance criteria
- [ ] The report lists every source referenced by two or more modules (the audit expects about 41).
- [ ] Each row has a proposed home and an `external-live` flag.
- [ ] The five known conflicts above appear with the plan's proposed homes.
- [ ] The script runs with plain `node` from `site/`.

## Test plan
Run the script; spot-check rows against `curriculum_plan.md`.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Plan or docs updated if a decision changed

## Open questions
- Is the report a one-off committed file, or should the script stay as an npm script for later curriculum edits?
