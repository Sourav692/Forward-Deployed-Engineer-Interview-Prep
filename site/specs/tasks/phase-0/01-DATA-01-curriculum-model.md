# DATA-01: `src/lib/curriculum.ts`: 10 tracks, 16 sections, 53 modules with every field from `curriculum_plan.md`, statuses and gap notes; types in `curriculum-types.ts`

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | L | - | DATA-02, DATA-03, DATA-06, DATA-07, DATA-10, UX-01 | §10 Content and CMS pipeline, §9 data model |

Status: in progress.

## Why
Every Learn page, the sync script and the content checks read the curriculum from one typed data file. Without it nothing in Phase 1 can start (R3, R4, R5, R28).

## Context from the plan
- Decision: git is the CMS; `curriculum.ts` is the single map from module to source files (§10). Rejected: headless CMS.
- Decision: `curriculum.ts` has no runtime imports so `.mjs` sync scripts can import it, the same rule as `editorial.ts` and `glossary.ts` (§10, CLAUDE.md). Rejected: separate JSON.
- Shapes (§9):
  - Track: `slug`, `code`, `title`, `objective`, `forWhom`, `prerequisites[]`, `required` (`yes` | `no` | `fde-path` | `candidates`), `estHours`, `exitCompetencies[]`.
  - Section: `slug`, `title`, `whyItMatters`, `outcomes`, `exercise`, `assessment`, `interviewRelevance`, `doneWhen`.
  - Module: `slug`, `code`, `title`, `status` (`ready` | `partly` | `coming-soon` | `on-hold`), `estMinutes`, `objective`, `scope`, `prerequisites` (module slugs), `deliverable`, `assessment`, `interviewProbe`, `commonMistakes[]`, `lessons` (home first), `seeAlso`, `gapNote?`, `relatedModules[]`.
  - Lesson: `slug`, `title`, `source`, `homeModule`, `publish` (`own` | `credited` | `excluded` | `pending`), `credit?`, `estMinutes`.
  - Path: `id`, `persona`, `variantOf?`, `moduleFlags`, `estHours`, `readinessCriteria`.
- Owner decisions (§15): FDE Handbook lessons are `own` (PM-02); third-party lessons are `credited` (PM-01). Use `pending` only where a source's status is unknown (§14 critical path note).
- Lesson slug = kebab of the source filename, fixed at first publish (§4).
- Requirements covered: R3, R4, R5, R10, R28, R31 (§16).

## Scope
In:
- `site/src/lib/curriculum-types.ts` with the types above.
- `site/src/lib/curriculum.ts` with all tracks, sections, modules, lesson refs, statuses (36 ready, 11 partly, 3 coming soon, 3 on hold) and gap notes.
Out:
- Final slug review and collision check (UX-01).
- Lesson sync (DATA-02), interview hubs (DATA-07), path flags beyond a port of the demo (UX-05, FE-10).

## Files likely touched
- `site/src/lib/curriculum.ts` (new)
- `site/src/lib/curriculum-types.ts` (new)
- `site/src/demo/data/curriculum.ts` (exists, reference for shape; 53 modules with ids `t0` and so on)
- `.website_plan/curriculum_plan.md` (exists locally, gitignored, read-only source)

## Implementation notes
1. Start from the demo model in `site/src/demo/data/curriculum.ts`, but use slugs, not `t2-4` style ids.
2. Transcribe every field from `curriculum_plan.md`; do not invent objectives or probes the plan does not have.
3. Keep the file free of runtime imports (type-only imports are fine).

## Acceptance criteria
- [ ] 10 tracks, 16 sections and 53 modules present; status counts match `module_source_audit.md`.
- [ ] Every lesson flagged third-party in `curriculum_plan.md` has a `publish` value (§3 acceptance).
- [ ] No runtime imports; a `.mjs` script can `import` the file under Node type stripping.
- [ ] `npx tsc --noEmit` and `npm run check:content` pass.

## Test plan
Type check; a one-off `node` import from a `.mjs` file; counts checked by hand against the audit until DATA-04 adds automated checks.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Plan or docs updated if a decision changed

## Open questions
- `.website_plan/` is gitignored, so only the owner's clone has the source. Should `curriculum_plan.md` be committed (for example under `site/specs/`) so others can review the transcription?
