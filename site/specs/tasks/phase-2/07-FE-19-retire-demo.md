# FE-19: Retire `/demo`: redirect `/demo/*` to `/`, remove `src/demo/` and its search route

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 2: Practice, Interview and Progress | S | FE-15, FE-16, FE-17, FE-18 | — | §7, §8, §14, Q12 |

## Why
The demo was the prototype for production. Once the last components are ported, keeping it means two versions of the same UI drifting apart, a second search index, and sample data a visitor could mistake for real content.

## Context from the plan
- §7 acceptance: `src/demo/` contains no component that production also needs. Run this task only after FE-15, FE-16 and FE-17 have ported `InterviewRunners`, `Dashboard`, `ProgressViews`, `ProgressPages` and `SettingsView`.
- Production does not import `@/demo` today (only comments mention it: `types.ts:7-8`, `rules.ts:2`, `ThemeToggle.tsx:9`). The demo imports production (`@/lib/progress/rules`, `@/components/ui`).
- Q12 (§15): demo progress (`fd:demo:v1`) is not migrated. Accepted.
- Robots: `robots.ts:10` disallows `/demo`; remove the line once the redirect is in.

## Scope
In:
- Delete `site/src/app/demo/` (about 30 routes, including `search-index.json/route.ts`) and `site/src/demo/`.
- Redirect `/demo` and `/demo/:path*` to `/` in `next.config.ts` (permanent).
- Remove stale comments and the `robots.ts` line; update `[...missing]/page.tsx:10` comment.
- Remove any rule or export kept only for the demo (for example the old rubric constants).
Out:
- Migrating `fd:demo:v1` data (Q12).

## Files likely touched
- `site/src/app/demo/**`, `site/src/demo/**` (delete)
- `site/next.config.ts`, `site/src/app/robots.ts` (exist)
- `site/src/lib/progress/types.ts`, `rules.ts`, `site/src/components/ThemeToggle.tsx` (comments)
- `site/CLAUDE.md` or `README` if they mention `/demo`

## Acceptance criteria
- [ ] `/demo` and any `/demo/...` URL answer 308 to `/`.
- [ ] `grep -r "demo" site/src` finds no import or route left.
- [ ] Build, lint, typecheck, `check:content`, `check:routes` and e2e pass.
- [ ] Bundle sizes do not grow.

## Test plan
- `npm run build`; `curl -I` a demo URL on the preview.
- Full `verify-site` run.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Reviewed in a preview deployment (UI tasks)
- [ ] Plan or docs updated if a decision changed

## Open questions
- None.
