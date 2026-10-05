# PM-03: Owner decides canonical home for each multi-use lesson file (see DATA-03 list)

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | M | DATA-03 | - (Phase 0 exit; feeds DATA-02 and DATA-04) | §3 Product goals, §10 Content and CMS pipeline |

Status: **todo** (open; waits on the DATA-03 report).

## Why
One canonical home per concept (R8) means each source file is synced once and other modules link to it. Phase 0 cannot exit until every multi-use file has a decided home.

## Context from the plan
- Decision: each source file is copied once to its home module; other modules list it under "Also useful" (`seeAlso`) and link to the home lesson (§10).
- Rule: material already live under `/modules/...` or `/fde-last-day-prep` is never re-synced into `/learn`; it appears as a lesson entry of kind `external-live` (§10).
- Proposed homes already in the plan (§10): FastAPI module → T1.2; RAG fundamentals → T2.2; reliability last-day guide, discovery and system design worksheets, scenario packs and standalone designs → link to their existing live pages.
- Validation that follows (§10, DATA-04): each lesson source appears as a home in exactly one module.

## Scope
In:
- Owner reviews every row of the DATA-03 report and accepts or changes the proposed home.
- The decision is applied in `curriculum.ts`: home module's `lessons` lists the source first; other modules list it in `seeAlso`.
Out:
- Producing the list (DATA-03); enforcing it in `check:content` (DATA-04).

## Files likely touched
- DATA-03 report file (new via DATA-03)
- `site/src/lib/curriculum.ts` (`lessons`, `seeAlso`, `homeModule`)
- `site/specs/2026-10-05-production-implementation-plan.md` §15 (record the decision, by the owner)

## Implementation notes
1. Present the report as a table with a "Decision" column the owner fills in; default to the proposed home.
2. Record the outcome in §15 alongside PM-01, PM-02, PM-04 and PM-05.

## Acceptance criteria
- [ ] Every row in the DATA-03 report has a decided home.
- [ ] `curriculum.ts` reflects each decision: one `homeModule` per source; other modules reference it via `seeAlso` or `external-live`.
- [ ] Phase 0 exit criterion "Canonical homes decided for every multi-use file" is met.
- [ ] Decision recorded in plan §15.

## Test plan
Rerun the DATA-03 script after the edit; it should report no source with more than one home.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Plan or docs updated if a decision changed

## Open questions
- This is the end of the Phase 0 critical path (DATA-01 → DATA-03 → PM-03, about 6 days). If owner time is short, can Phase 1 start with the plan's proposed homes as defaults?
