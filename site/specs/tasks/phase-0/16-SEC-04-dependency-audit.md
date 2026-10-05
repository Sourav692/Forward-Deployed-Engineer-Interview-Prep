# SEC-04: Dependabot or `npm audit` step in CI

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | S | OPS-01 | - | §12 Security, privacy and compliance |

Status: in progress.

## Why
The site has six runtime dependencies (`marked`, `mermaid`, `next`, `react`, `react-dom`, `server-only`) and renders markdown to HTML. A known vulnerability in any of them, especially the markdown and diagram renderers, should be flagged on a PR rather than found later (§12).

## Context from the plan
- Threat (§12): XSS through content rendered with `marked`; sources are owner-controlled but raw HTML passes through.
- Task (§12): Dependabot or `npm audit` step in CI.
- CI (§13): GitHub Actions on every PR (OPS-01).
- Stack (§2): Next 16.3.5, React 19.2.8, Tailwind v4, TS 5, ESLint 9.

## Scope
In:
- Either `.github/dependabot.yml` for npm in `/site` (weekly), or an `npm audit --audit-level=high --omit=dev` step in `ci.yml`, or both.
Out:
- Security headers and CSP (SEC-02); content sanitiser (SEC-01).

## Files likely touched
- `.github/dependabot.yml` (new) and/or
- `.github/workflows/ci.yml` (new via OPS-01; add one step)

## Implementation notes
1. Dependabot needs `directory: "/site"`, since there is no root `package.json`.
2. If using `npm audit`, choose a level (`high` suggested) and `--omit=dev` so dev-only advisories do not block PRs; document the choice.
3. Dependabot PRs land on branches and get Vercel previews like any other PR; they follow the normal PR-then-merge rule.

## Acceptance criteria
- [ ] Either Dependabot opens update PRs for `site/` npm dependencies, or CI runs `npm audit` and fails on advisories at the chosen level.
- [ ] The chosen option and audit level are written in the PR description.
- [ ] CI stays green on `main` (no existing advisory at the chosen level, or it is fixed in this task).

## Test plan
For `npm audit`: run it locally in `site/` and check the CI log. For Dependabot: confirm the config shows under the repository's Dependabot settings.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Plan or docs updated if a decision changed

## Open questions
- Dependabot, `npm audit`, or both? Dependabot alone does not actually depend on OPS-01 (PLAN_REVIEW note).
