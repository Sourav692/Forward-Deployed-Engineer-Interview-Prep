# FE-16: `/progress` dashboard, `/progress/revision`, `/progress/history`, `/progress/bookmarks` on real data

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 2: Practice, Interview and Progress | L | FE-09 (done), FE-15, UX-07 | FE-19 | §5, §7, §8, §11 |

## Why
The dashboard is where job 3 (§3) pays off: next up, what to revise, how ready the learner is and when they will finish. All the rules exist; no production page shows them.

## Context from the plan
- Rendering (§8): static shell, client islands read localStorage behind a skeleton; no hydration mismatch (use `useProgress`, which uses `useSyncExternalStore`).
- Bundle budget (§8): dashboard ≤ 140 KB gzipped first-load JS beyond the framework baseline (checked by `npm run check:bundle`).
- Privacy (§9): no network request carries learner data (verify in DevTools).
- Rules (exist, `src/lib/progress/rules.ts`): `revisionReason` (lines 111-140: low confidence, failed checkpoint, decay at 14/30/60 days, confidence decay 21 days), `interviewReadiness` (35 % worksheets, 30 % mocks, 20 % checkpoints, 15 % behavioural), `finishBy`.
- Store (exists): `listBookmarks`, `listActivity`, `moduleProgress`, `trackProgress`, `listAttempts`.
- Components to port (§7): `ReadinessGauge`, `RevisionQueueList`, `ActivityTimeline` (`src/demo/components/ProgressViews.tsx`), `RevisionPage`, `HistoryPage`, `BookmarksPage` (`src/demo/components/ProgressPages.tsx`), `StatCard` (`src/demo/components/ui.tsx:125`), into `src/components/progress/`.
- Existing production use of revision rules: `src/components/learn/progress-model.ts`.
- Exit criteria (§14): real data only; empty state for new learners; unmeasured inputs show "not measured", not 0.
- Lighthouse (§11): mobile performance ≥ 90 on the dashboard.

## Scope
In:
- Four routes, built to the UX-07 wireframes.
- Readiness gauges from `rules.ts`, with the missing-input rule UX-07 settles.
- Revision queue with "Review now" → module page; rating confidence ≥ 4 removes the item.
- Finish-by date from weekly hours and remaining minutes on the chosen path.
- "Progress" in the mobile bottom bar and top bar points at `/progress`.
Out:
- Checkpoint data (DATA-10, backlog).
- Accounts or sync (Phase 3).

## Files likely touched
- `site/src/app/(site)/progress/page.tsx`, `revision/page.tsx`, `history/page.tsx`, `bookmarks/page.tsx` (new)
- `site/src/components/progress/*` (new, ported)
- `site/src/lib/progress/rules.ts` (exists; missing-input handling in `interviewReadiness`)
- `site/scripts/check-progress-rules.ts` (exists)
- `site/src/components/shell/*` (exists; nav links)
- `site/e2e/a11y.spec.ts`, `site/e2e/flows.spec.ts` (exist)

## Implementation notes
Consider splitting: (a) `/progress` dashboard with readiness and next up; (b) the three list pages. The list pages are mostly ports and could ship first.

## Acceptance criteria
- [ ] A new learner sees designed empty states and no numbers.
- [ ] After reading a lesson, rating confidence and scoring a mock, the dashboard reflects each within one render and after reload.
- [ ] Checkpoints show "not measured"; the overall readiness follows the UX-07 rule.
- [ ] Revision queue items carry their reason; confidence ≥ 4 removes an item.
- [ ] No network request carries learner data.
- [ ] Dashboard first-load JS within 140 KB budget (`npm run check:bundle`).
- [ ] Keyboard reachable, visible focus, gauges have text equivalents, contrast AA, 320 px and 200 % zoom.
- [ ] Zero serious or critical axe violations on `/progress` (empty and populated) in both themes.

## Test plan
- Rules: `npm run check:rules` with missing-input cases.
- E2E: read lesson → rate confidence → score mock → dashboard shows them; revision queue clears on confidence 4.
- A11y: `/progress` and one list page in `e2e/a11y.spec.ts`.
- Lighthouse on the preview.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Tests added or updated, CI green
- [ ] Lint and typecheck pass
- [ ] Reviewed in a preview deployment (UI tasks)
- [ ] Plan or docs updated if a decision changed

## Open questions
- Readiness and behavioural input rules: settled in UX-07.
