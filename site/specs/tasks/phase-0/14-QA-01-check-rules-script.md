# QA-01: `check:rules` script wired (from FE-01)

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | S | FE-01 | - | §13 Testing, deployment and operations |

Status: in progress.

## Why
The pure rules (status, mastery, revision decay, prerequisites, readiness, finish-by) drive every progress feature. Their self-check exists but was never wired into npm or CI (§2), so a broken rule could ship unnoticed (R30).

## Context from the plan
- Test layer (§13): Rules = status, mastery, revision decay, prerequisites, readiness, finish-by, run by `npm run check:rules`.
- Decision: keep the rules self-check as a plain `node` script; no test runner (§13).
- FE-01 already renames `check-demo-rules.ts` to `check-progress-rules.ts` and adds the npm script.

## Scope
In:
- Confirm `npm run check:rules` exists and exits non-zero on a failed assertion.
- Confirm OPS-01's workflow runs it.
Out:
- The move and rename (FE-01); the CI file (OPS-01).

## Files likely touched
- `site/package.json` (exists; `check:rules` added by FE-01)
- `site/scripts/check-progress-rules.ts` (renamed by FE-01)
- `.github/workflows/ci.yml` (new via OPS-01)

## Implementation notes
1. Review finding: this task overlaps FE-01 almost entirely. Treat it as the CI wiring check for the rules script and close it when OPS-01 runs `check:rules`.
2. Verify the script calls `process.exit(1)` (or throws) on failure, so CI fails rather than just printing.

## Acceptance criteria
- [ ] `npm run check:rules` passes from `site/`.
- [ ] Breaking one rule locally (for example changing `DECAY_INTERVALS`) makes the script exit non-zero.
- [ ] CI runs `check:rules` on every PR.

## Test plan
Run the script; make a deliberate local edit and confirm a non-zero exit; check the CI log.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Plan or docs updated if a decision changed

## Open questions
- Should the plan merge QA-01 into FE-01 and OPS-01? (PLAN_REVIEW should-fix item.)
