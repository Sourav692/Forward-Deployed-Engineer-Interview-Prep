# FE-01: `src/demo/store/rules.ts` moved to `src/lib/progress/rules.ts`; demo imports it; `check-demo-rules.ts` renamed `check-progress-rules.ts` and added as `npm run check:rules`

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | S | - | BE-01, FE-02, OPS-01, QA-01 | §8 Frontend architecture |

Status: in progress.

## Why
Production progress (status, mastery, prerequisites, readiness, finish-by) must use the same pure rules the prototype proved. They live under `demo/`, which FE-19 deletes, and their self-check is not wired into npm (§2, R13, R30).

## Context from the plan
- Folder structure (§8): `site/src/lib/progress/rules.ts` holds the pure rules moved from `src/demo/store/rules.ts`.
- Decision: keep the rules self-check as a plain `node` script; no test runner (§13). Rejected: Vitest.
- Test layer (§13): `npm run check:rules` covers status, mastery, revision decay, prerequisites, readiness, finish-by.
- Requirements covered: R13, R30 (§16).

## Scope
In:
- Move `rules.ts` with `git mv`; update every importer.
- Rename `scripts/check-demo-rules.ts` to `scripts/check-progress-rules.ts`; add `"check:rules"` to `package.json`.
Out:
- The `fd:v1` learner store (FE-02).
- Adding `id` and `updatedAt` to learner records (BE-01).
- CI wiring (OPS-01).

## Files likely touched
- `site/src/demo/store/rules.ts` → `site/src/lib/progress/rules.ts` (exists, move)
- `site/scripts/check-demo-rules.ts` → `site/scripts/check-progress-rules.ts` (exists, move)
- `site/package.json` (exists)
- Importers (exist): `site/src/demo/types.ts`, `site/src/demo/components/{ProfileViews,Dashboard,ModuleIslands,InterviewRunners,AssessmentRunner,ProgressViews,ContinueButton}.tsx`
- `site/src/lib/progress/types.ts` (new, guess; see notes)

## Implementation notes
1. `rules.ts` imports types (`Attempt`, `LearnerState`, `Module`, `Status`, `ConfidenceRating` and others) from `src/demo/types.ts`. Leaving that import would make `src/lib` depend on `src/demo`. Move the types the rules need into `src/lib/progress/types.ts` and re-export them from `src/demo/types.ts`.
2. The check script runs as plain `node` with type stripping, so keep `.ts` extensions in its imports.
3. Run the script before and after the move; the output should be identical.

## Acceptance criteria
- [ ] `src/lib/progress/rules.ts` exists; `src/demo/store/rules.ts` is gone.
- [ ] Nothing under `src/lib/` imports from `src/demo/`.
- [ ] `npm run check:rules` passes from `site/`.
- [ ] `/demo` pages still work (dashboard, module, assessment) on the preview.
- [ ] Lint and `npx tsc --noEmit` pass.

## Test plan
`npm run check:rules`; `npx tsc --noEmit`; `npm run lint`; manual click-through of `/demo` on the preview.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Reviewed in a preview deployment (UI tasks)
- [ ] Plan or docs updated if a decision changed

## Open questions
- Should the type move be recorded as part of BE-01 so that task only adds `id` and `updatedAt`? (PLAN_REVIEW should-fix item.)
