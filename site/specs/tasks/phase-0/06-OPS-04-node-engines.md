# OPS-04: `engines` field and `.nvmrc`

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | S | - | OPS-01 (implicit, see PLAN_REVIEW) | §13 Testing, deployment and operations |

Status: in progress.

## Why
`check-parse.ts` (and the new `check-progress-rules.ts`) run as plain `node` with native TypeScript type stripping, which needs a recent Node. Today that requirement is undocumented (§2), so an older Node fails with a confusing error.

## Context from the plan
- Decision: `engines.node` set to the version CI uses (≥ 22.18, for type stripping) (§13). Rejected: undocumented requirement.
- Current state: no `engines` field in `site/package.json` (§2).

## Scope
In:
- `"engines": { "node": ">=22.18" }` (or the chosen floor) in `site/package.json`.
- `.nvmrc` naming the same major version.
Out:
- The CI workflow itself (OPS-01), which reads `.nvmrc` via `setup-node`.

## Files likely touched
- `site/package.json` (exists; no `engines` today)
- `site/.nvmrc` (new)

## Implementation notes
1. Place `.nvmrc` in `site/`, since all npm commands run from there and Vercel's root is `site/`.
2. Vercel reads `engines.node` to pick its Node version; check the preview build log shows the expected major.
3. Run `npm run check:content` on the chosen Node to prove type stripping works without flags.

## Acceptance criteria
- [ ] `site/package.json` has an `engines.node` range with a floor of at least 22.18.
- [ ] `site/.nvmrc` exists and matches that range.
- [ ] Vercel preview build log shows a Node version inside the range.
- [ ] `npm run check:content` passes on the pinned version.

## Test plan
`nvm use && npm run check:content` in `site/`; inspect the Vercel preview build log.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Plan or docs updated if a decision changed

## Open questions
- Which major to pin: 22 (minimum named in the plan) or 24 (current LTS)? The owner's local Node is 26.
