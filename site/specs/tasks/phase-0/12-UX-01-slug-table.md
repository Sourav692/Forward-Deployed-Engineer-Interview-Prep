# UX-01: Final slug table for 10 tracks and 53 modules committed in `curriculum.ts`, checked for collisions with `editorial.TRACKS` ids

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | M | DATA-01 | UX-02, UX-03, UX-04 | §4 Information architecture |

Status: in progress.

## Why
Slugs become URLs and `fd:v1` progress keys, and ids must never change once published (CLAUDE.md). Fixing them before any Learn page ships avoids breaking links and saved progress later.

## Context from the plan
- Decision: track and module URLs use slugs (`/learn/llm-and-retrieval/retrieval-hybrid-rerank`), not codes, because codes already changed once (T8.1 and T8.2 merged on 5 October 2026) (§4). Rejected: `/learn/t2/t2-4`.
- Decision: codes (`T2.4`) are display labels stored on the module (§4).
- Decision: track slugs must not collide with existing track ids in `editorial.TRACKS` (§4). Rejected: reusing names like `core`.
- Section acceptance: no slug contains a module code (§4).
- Routes: `/learn/[trackSlug]`, `/learn/[trackSlug]/[moduleSlug]` (§4).

## Scope
In:
- Review and finalise the `slug` of every track and module in `curriculum.ts`.
- A check that fails on collisions and on slugs containing codes.
Out:
- Lesson slugs (kebab of source filename, set in DATA-01 and DATA-02).
- The id-change guard against the committed manifest (DATA-04).

## Files likely touched
- `site/src/lib/curriculum.ts` (new via DATA-01)
- `site/src/lib/editorial.ts` (exists; `TRACKS` at line 117, `PRACTICE_TRACKS`, `BEHAVIOURAL_TRACKS`; read only)
- `site/src/lib/registry.ts` (exists; module `id`s such as `01-customer-discovery-and-decomposition` for `/modules/...`; read only)
- `site/scripts/check-parse.ts` (exists; add the collision check, or a small standalone check)

## Implementation notes
1. Slugs: lowercase kebab, short, topic-led, no `t2`, `t2-4` or similar.
2. Collect `Object.keys(TRACKS)` and the registry module slugs; fail on any overlap with track or module slugs.
3. Present the table (code, title, slug) in the PR so the owner can approve it before merge.

## Acceptance criteria
- [ ] Every track and module has a final slug; slugs are unique.
- [ ] No track slug equals any key in `editorial.TRACKS`.
- [ ] No slug matches a code pattern such as `t\d` or `t\d-\d`.
- [ ] The check runs in `npm run check:content` (or a named script) and passes.
- [ ] Owner approved the slug table in the PR.

## Test plan
`npm run check:content`; deliberately add a colliding slug locally to see the check fail.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Plan or docs updated if a decision changed

## Open questions
- Should module slugs also be checked against existing `/modules/[module]` registry slugs? The plan only names `editorial.TRACKS` (PLAN_REVIEW note).
