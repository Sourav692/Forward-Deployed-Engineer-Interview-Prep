# DATA-07: Interview hub definitions in `curriculum.ts`: five hubs, each listing existing question sources by link and the related modules

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 2: Practice, Interview and Progress | M | DATA-01 (done) | FE-18 | §9, §10 |

## Why
`/interview` lists five topic hubs as Coming soon (`site/src/app/(site)/interview/page.tsx:27-48`). A hub is only useful if it points to real practice material, and that mapping has to be data so the sync scripts, the hub pages and the checks share one source.

## Context from the plan
- Decision (§10): Git is the CMS; `curriculum.ts` is the single map and has no runtime imports (the `.mjs` sync reads it).
- Decision (§4): hubs index existing pages by link, never copy content (R8, R25).
- The five hubs (titles and summaries already on `/interview`; ids from the demo `src/demo/data/interview.ts:10`): `technical-foundations`, `ai-ml`, `ai-systems-design`, `fde`, `behavioural`. Hub slugs are URLs and must never change once published.
- Question sources the plan names (§8 FE-18): problem decomposition bank, leadership principles, hiring-manager round, scenario packs.

Status: **done** (#74). Built with one change: hubs list lesson and module **slugs** (`practice`, `modules`) instead of `{ title, href }` sources, so titles and URLs come from the curriculum and `check:curriculum` resolves every entry. Each hub needs at least two practice lessons and one module.

## Scope
In:
- `InterviewHub` type in `curriculum-types.ts`: `slug`, `title`, `summary`, `sources` (each `{ title, href, kind, note? }` pointing at a live site page), `relatedModules` (module slugs).
- `INTERVIEW_HUBS` in `curriculum.ts` with five entries.
- `check:curriculum` checks: hub slugs unique and not equal to any `interview-practice` module slug; every `relatedModules` slug resolves; every `href` is an internal route that exists (reuse the existing route resolver used for lesson links).
Out:
- Hub pages (FE-18).
- Writing new questions (grounding rule R6).

## Files likely touched
- `site/src/lib/curriculum-types.ts` (exists)
- `site/src/lib/curriculum.ts` (exists)
- `site/scripts/check-curriculum.ts` (exists)

## Implementation notes
Candidate sources per hub (verify each target is a published page before listing it; drop any that is not):
- Technical Foundations: coding-round-practice module, T1 track modules.
- AI and Machine Learning: T2 and T3 track modules, interview probes on their module pages.
- AI Systems Design: case-study worksheets (`/modules/01-...`), scenario packs and standalone designs (`/modules/15-fde-case-studies/...`), classic design walkthroughs.
- Forward Deployed Engineering: Problem Decomposition Bank lesson, customer discovery worksheets, mock interviews.
- Behavioural and Communication: the seven competency worksheets (`/modules/14-behavioural-and-leadership-round/*`), story bank, T7 track.

## Acceptance criteria
- [ ] Five hubs defined with at least three live sources each.
- [ ] `npm run check:curriculum` fails on a hub slug that collides with an interview-practice module slug, on an unknown related module, and on an `href` that does not resolve.
- [ ] `curriculum.ts` still has no runtime imports; `npm run sync` and `check:content` pass.

## Test plan
- `npm run check:curriculum` with one deliberate bad entry (then reverted) to see it fail.
- `npm run check:content`, `npx tsc --noEmit`.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Plan or docs updated if a decision changed

## Open questions
- Owner confirms the source list per hub before FE-18 publishes it.
