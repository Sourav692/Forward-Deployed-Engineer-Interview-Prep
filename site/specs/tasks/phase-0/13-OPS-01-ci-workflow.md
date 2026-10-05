# OPS-01: `.github/workflows/ci.yml` running all checks on PRs; required status on `main`

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | M | FE-01 (and OPS-04, see notes) | OPS-02, PERF-01, QA-02, SEC-04 | §13 Testing, deployment and operations |

Status: in progress.

## Why
There is no CI today (`.github/` is absent); Vercel builds only prove the build (§2). Every PR must prove content, rules, types and build before the preview is reviewed. Phase 0 exit needs "CI runs on PRs and is green on `main`".

## Context from the plan
- Decision: GitHub Actions CI on every PR: install, sync, `check:content`, `check:rules`, lint, `tsc`, build, bundle check, Playwright smoke against `next start` (§13). Rejected: rely on Vercel build status.
- In Phase 0 only the first seven steps exist; bundle check (OPS-02, PERF-01) and Playwright (QA-02) are added in Phase 1.
- Decision: `engines.node` set to the version CI uses (≥ 22.18) (§13).
- Section acceptance: a PR that breaks a link, a rule, a type or the smoke flow fails CI before review (§13).

## Scope
In:
- `.github/workflows/ci.yml` at the repository root, triggered on `pull_request` and `push` to `main`, with `working-directory: site`.
- Steps: `npm ci`, `npm run sync`, `npm run check:content`, `npm run check:rules`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Branch protection on `main` requiring the CI job.
Out:
- Bundle budget (OPS-02, PERF-01), Playwright and axe (QA-02, A11Y-01), dependency audit (SEC-04).

## Files likely touched
- `.github/workflows/ci.yml` (new; repository root, not `site/`)
- `site/package.json` (exists; read `check:rules` from FE-01)
- `site/.nvmrc` (new via OPS-04; used by `actions/setup-node` `node-version-file`)

## Implementation notes
1. Use `actions/setup-node` with `node-version-file: site/.nvmrc` and npm cache keyed on `site/package-lock.json`.
2. Sync rewrites `generatedAt` in `manifest.json`, so do not fail on a dirty tree after sync.
3. CI checks out a clean clone: gitignored folders (`09_Study_Plans/`, `.website_plan/`) are absent. Sync reads only committed root folders, so it should succeed; confirm on the first run.
4. Branch protection is a repository setting: the owner sets it in GitHub settings or with `gh api repos/:owner/:repo/branches/main/protection`. Note it in the PR; the YAML alone does not meet the criterion.
5. OPS-04 should land first or together, so CI and Vercel use the same Node.

## Acceptance criteria
- [ ] CI runs on every PR and on push to `main`.
- [ ] A PR that breaks a link, a rule or a type fails CI (proved with a throwaway commit).
- [ ] The CI job is a required status check on `main`.
- [ ] CI is green on `main` after merge.

## Test plan
Open the PR and watch the run; push a deliberate broken link on a scratch branch to see `check:content` fail.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Plan or docs updated if a decision changed

## Open questions
- Add OPS-04 to this task's "Depends on" in the plan (PLAN_REVIEW should-fix item).
