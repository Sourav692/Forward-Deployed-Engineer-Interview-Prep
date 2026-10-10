# UX-07: Dashboard wireframe for production (no sample data, empty-first)

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 2: Practice, Interview and Progress | M | UX-04 (done) | FE-16 | §5 |

## Why
Job 3 (§3) ends at "see if I am ready". The demo dashboard (`src/demo/components/Dashboard.tsx`) was designed on seeded sample data; a real learner's first visit is empty, and most readiness inputs are not measured yet. The screen needs to be designed for that state first.

## Context from the plan
- Key screen (§5): Dashboard. Primary action: open the next-up item. Hierarchy: next up, readiness gauges, revision queue, track progress, recent activity. Grid stacks to one column on mobile.
- Flows (§5): 5 "Check readiness" (next up with reason, revision queue, readiness with weakest dimension, finish-by date from weekly hours) and 6 "Revise" (review now, rate confidence ≥ 4, item leaves the queue).
- States (§5): skeleton while localStorage is read; designed empty state; storage-blocked error state.
- Exit criterion (§14): readiness notes which inputs are missing; an unmeasured input shows "not measured" instead of 0.
- Inputs actually available in Phase 2:
  - measured: lessons read, module confidence, bookmarks, activity, mock attempts (FE-15), weekly hours and path (FE-17, `/start`);
  - not measured: checkpoints (DATA-10 deferred), worksheet rubric means (no production worksheet scorer), behavioural readiness (see open question).
- Existing wireframe format: `site/specs/2026-10-05-learn-ux.md` (UX-04, text wireframes at 375 and 1280 px).

## Scope
In:
- Wireframes at 375 and 1280 px for `/progress` in three states: new learner (nothing stored), learner with some progress, storage blocked.
- Wireframes for `/progress/revision`, `/progress/history`, `/progress/bookmarks` (populated and empty).
- Copy for every empty state and for "not measured", added to the copy deck in `2026-10-05-learn-ux.md`.
- How readiness is displayed when inputs are missing (see open question).
Out:
- Building the pages (FE-16).

## Files likely touched
- `site/specs/2026-10-05-learn-ux.md` (exists; add a Dashboard section)

## Acceptance criteria
- [ ] Every dashboard widget has an empty state with a next action.
- [ ] No widget shows a number derived from data the learner never entered.
- [ ] Readiness display rule for missing inputs is written down and approved by the owner.
- [ ] Next-up rule (what is picked and why) is written down.

## Test plan
Owner review of the wireframes; FE-16 builds against them.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Plan or docs updated if a decision changed

## Open questions
- Readiness with missing inputs: show a score re-weighted over measured inputs only, or no overall score until every input is measured? Owner decides.
- Behavioural readiness (15 % of interview readiness): measure it from the seven competency worksheets on `/modules/14-behavioural-and-leadership-round/*` (share with saved answers under `fd:v1:answers:*`), or show "not measured"?
