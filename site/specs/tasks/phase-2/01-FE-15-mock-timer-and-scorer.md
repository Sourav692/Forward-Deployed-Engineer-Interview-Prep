# FE-15: MockTimer and RubricScorer on the five scenario mock lessons, scored on the lessons' own 1–5 rubric; attempts saved

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 2: Practice, Interview and Progress | M | FE-02 (done) | FE-16, FE-19 | §5 flow 4, §7, §8, §14 Phase 2 |

## Why
Job 3 (§3): "let me practise under interview conditions and see if I am ready". The mock lessons tell the learner to set a 45-minute timer and score themselves, but the page has no timer and nothing is saved, so the dashboard (FE-16) has no mock input for readiness.

## Context from the plan
- Decision (10 Oct 2026, §14 Phase 2 note): DATA-06 is retired. The mocks already ship as six T8.2 lessons at `/interview/mock-interviews/<lessonSlug>` through `learn.mjs`. The timer and scorer go on those lesson pages. Rejected: a separate `/practice/mocks/[mockSlug]` reading view (duplicates the lessons).
- Decision (same date): score on the lessons' own rubric, not the one in `rules.ts`. Rejected: keeping `RUBRIC_DIMENSIONS` (structure, technical-depth, trade-offs, communication, customer-judgement on 1–4), which does not match the tables printed in the lessons.
- Rubric, from the lessons (`01_Concept_Tutorials/Consolidated_Lessons/T8.2_Mock_Interviews_and_Scorecards/`):
  - Short round, five signals: Discovery, Architecture, Evals, Production, Communication (lessons 02–06, "Score the Round").
  - Full round, six dimensions: Discovery, Architecture, Security, Evaluation, Production, Communication, with anchors 1–2 Weak, 3 Average, 4 Strong, 5 Excellent (lesson 01, "Score With the Six-Dimension Rubric").
  - Both rounds are 45 minutes (lesson 01 line 20).
  - Each score needs one line of evidence ("A score without evidence is a guess").
- Pass rule (§14 exit): no dimension below 2 and mean ≥ 3.
- Component (§7): RubricScorer is a radio group per dimension; MockTimer has running, paused and done states.
- Storage (§8): `fd:v1:learn:attempts:<assessmentId>` = `Attempt[]`; `recordAttempt` / `listAttempts` exist in `src/lib/progress/store.ts:236-241`; `AssessmentKind` already includes `'mock'` and `ActivityKind` includes `'mock-completed'` (`types.ts`).
- Requirements covered: R18 Mock interviews (§16).

## Scope
In:
- `rules.ts`: replace the mock rubric with the two lesson rubrics (short: 5 signals, full: 6 dimensions) on a 1–5 scale; keep the pass rule; add a 1–5 to 0–100 mapping for mock means (`(mean − 1) / 4`).
- Update `scripts/check-progress-rules.ts` mock and readiness checks to the new rubric.
- `src/components/progress/MockTimer.tsx` and `RubricScorer.tsx`, ported from `src/demo/components/InterviewRunners.tsx` (`Timer` line 28, `MockRunner` line 56), typed on production types.
- Render them on lessons 02–06 of `mock-interviews` only (not lesson 01, the how-to).
- Save each scored round as an `Attempt` and log a `mock-completed` activity event; show the last attempt's result and the weakest dimension.
Out:
- Dashboard use of attempts (FE-16).
- Worksheet rubric scoring (no production worksheet scorer exists).
- Changing lesson text.

## Files likely touched
- `site/src/lib/progress/rules.ts` (exists)
- `site/src/lib/progress/types.ts` (exists: `RubricDimension`, `Attempt`)
- `site/scripts/check-progress-rules.ts` (exists)
- `site/src/components/progress/MockTimer.tsx`, `RubricScorer.tsx` (new)
- `site/src/app/(site)/learn/[trackSlug]/[moduleSlug]/[lessonSlug]/page.tsx` (exists; the interview lesson page reuses it) or a mock-specific island slot (guess)
- `site/src/demo/components/InterviewRunners.tsx` (demo; switch it to the new rules or leave it until FE-19 deletes it)
- `site/e2e/flows.spec.ts`, `site/e2e/a11y.spec.ts` (exist)

## Implementation notes
1. Decide where the island mounts. The interview lesson route renders `LearnLessonPage` with `trackSlug = INTERVIEW_TRACK`. Add the scorer only when the module is `mock-interviews` and the lesson is not `running-and-scoring-a-mock-interview`; keep the page a Server Component and the scorer a client island.
2. Assessment id: `mock:<lessonSlug>:<round>` (round = `short` | `full`), so each round has its own attempt list.
3. Timer: 45 minutes, start, pause, reset; respect `prefers-reduced-motion`; announce "Time is up" through `role="status"`, not an alert.
4. Scorer: one `fieldset` + `legend` per dimension, five radios (1–5) with the anchor text for the full round; one optional evidence text field per dimension. Disable "Save score" until every dimension has a value.
5. Demo still imports the old `RUBRIC_DIMENSIONS`: fix its import or let it use the new export, so `tsc` stays green until FE-19.

## Acceptance criteria
- [ ] Lessons 02–06 of `/interview/mock-interviews/*` show a 45-minute timer and a scorer with a Short round / Full round choice; lesson 01 shows neither.
- [ ] Short round scores five signals, full round six dimensions, each 1–5, labelled exactly as in the lesson tables.
- [ ] Pass rule applied: a round with any dimension below 2, or a mean below 3, is shown as "Not yet"; otherwise "Pass".
- [ ] Saving writes an `Attempt` under `fd:v1:learn:attempts:mock:<lessonSlug>:<round>` and an activity event; refreshing the page shows the last result.
- [ ] `npm run check:rules` covers the new rubric (pass, fail on a dimension of 1, fail on mean below 3, incomplete round).
- [ ] Storage blocked: scorer still works for the session and shows the "Progress won't be saved in this browser" notice.
- [ ] Keyboard reachable, visible focus, every radio group has a legend, contrast AA, works at 320 px and 200 % zoom.
- [ ] Zero serious or critical axe violations on a mock lesson page in both themes.

## Test plan
- Rules: `npm run check:rules`.
- E2E: Playwright flow in `flows.spec.ts`: open a mock lesson, score a full round, save, reload, see the result.
- A11y: add a mock lesson to `PAGES` in `e2e/a11y.spec.ts`.
- Manual: keyboard-only pass and a VoiceOver pass on the scorer.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Reviewed in a preview deployment (UI tasks)
- [ ] Plan or docs updated if a decision changed

## Open questions
- `interviewReadiness` still maps worksheet rubric means as 1–4. FE-16 decides how unmeasured inputs show; this task changes only the mock mapping.
