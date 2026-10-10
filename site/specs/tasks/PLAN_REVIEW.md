# Plan review: site/specs/2026-10-05-production-implementation-plan.md

Date: 5 October 2026. Scope: whole plan checked; cards generated for Phase 0 only. Verdict: **Ready with fixes**

The plan is structurally sound (17 of 17 sections, 71 tasks, 4 phases, no cycles, no dependency pointing at a later phase). The four owner decisions recorded in §15 (PM-01, PM-02, PM-04, PM-05) remove the biggest content blockers. The findings below are things a builder would trip over in Phase 0; none of them stops work starting, so there are no blocking items.

## Blocking (fix before building)

- None.

## Should fix

- [ ] **FE-01 hides a type move.** `site/src/demo/store/rules.ts` imports `Attempt`, `LearnerState`, `Module`, `Status` and others from `site/src/demo/types.ts`, and `site/scripts/check-demo-rules.ts` imports the same file. Moving rules to `src/lib/progress/` without moving the types leaves `src/lib` depending on `src/demo`, which FE-19 deletes. Suggested fix: FE-01 also moves the types the rules need into `src/lib/progress/types.ts` (pulling the type half of BE-01 forward), and BE-01 then adds `id` and `updatedAt`.
- [ ] **QA-01 duplicates FE-01.** FE-01's outcome already adds `npm run check:rules`. Suggested fix: redefine QA-01 as "`check:rules` runs as a CI step", or fold it into OPS-01 and mark QA-01 done when OPS-01 lands.
- [ ] **OPS-01 depends on OPS-04 but does not say so.** §13 says CI uses the Node version set in `engines` (≥ 22.18 for type stripping). Add OPS-04 to OPS-01's "Depends on".
- [ ] **OPS-01 "required status on `main`" is a repository setting, not a file.** Branch protection is set in GitHub settings or via `gh api`, by the owner. Say so in the task so it is not marked done on the YAML alone.
- [ ] **A6, Q10 and OPS-03 are stale.** `site/.vercel/` is gitignored (`site/.gitignore` line 37), so `project.json` is per clone, not committed. The owner's main checkout already links `projectName: "forward-deployed"`. OPS-03 reduces to a verification and a CLAUDE.md note; A6 can be marked confirmed.
- [ ] **DS-01 targets the wrong files and has a live-page side effect.** The hard-coded px radii (3, 4, 8, 10 px, 0.75rem, 0.3em) are in `site/src/app/globals.css` (lines 120 to 364), not in components. Components already use Tailwind utilities (`rounded-md` 62 uses, `rounded-xl` 53, `rounded-lg` 45, `rounded` 18). Defining `--radius-md: 8px` in `@theme` overrides Tailwind's default `rounded-md` (6 px) everywhere, including live `/modules` pages, and `rounded-xl` has no token in the §6 scale. Decide the mapping (keep Tailwind names, or remap `xl`) and add a visual check of live templates (Q9).
- [ ] **DS-02 "recorded in the spec" names no spec.** Say which file holds the contrast table: the style guide, or a new design-tokens spec under `site/specs/` that DS-04 can extend.
- [ ] **PM-05 count mismatch.** §15 says "restore all four git-history groups" then lists five (incident logs, hands-on labs, readiness assessment, red-team fixtures, diagram explanations). Fix the number in §15.
- [ ] **PM-01 has no task for writing the credit strings.** With every third-party item `credited`, each needs a `credit` value (book title, iGrace, playbook, fdehandbook.com, DevRev, quoted sites, blitzy.com). The plan says who decides, not who writes them. Add this to PM-01 or DATA-02.
- [ ] **PM-01 reaches beyond Learn.** Book-derived `03_/System_Design_Worksheets` (module 01) and Blitzy 02 (module 16) are already public. With the "credited" decision they need a credit line on their existing pages and a row on `/library/credits` (SEC-05). No task covers the live modules.

## Notes

- `curriculum_plan.md` and `module_source_audit.md` live in `.website_plan/`, which is gitignored. DATA-01, DATA-03 and UX-01 can only be built on the owner's machine (or after the source is copied somewhere committed); CI and other clones cannot regenerate them.
- Phase 0 critical path is DATA-01 (L) → DATA-03 (S) → PM-03 (M), about 6 days at S=0.5, M=1.5, L=4. That uses almost the whole "about 1 week" budget, so PM-03 is the item most likely to slip.
- §3 acceptance asks for A1 to A6 to be confirmed or replaced. After this review, A2, A5 and A6 are confirmed; A1 (Q13), A3 (Q6) and A4 are still assumptions.
- UX-01 checks track slugs against `editorial.TRACKS`. It should also check module slugs against the existing `/modules/[module]` registry slugs so `/learn` and `/modules` never share an id.
- SEC-04 only depends on OPS-01 if the `npm audit` route is chosen. Dependabot (`.github/dependabot.yml`) can land on its own.
- The four traceability warnings (R19, R27, R29, R34) are deliberate deferrals or non-goals, not gaps.

## Structural check

```text
Plan: site/specs/2026-10-05-production-implementation-plan.md
Sections: 17/17  Tasks: 71  Phases: 4
  Phase 0 Decisions and foundations (about 1 week): 16 tasks
  Phase 1 Learn MVP (about 3 weeks): 40 tasks
  Phase 2 Practice, Interview and Progress (about 3 weeks): 9 tasks
  Phase 3 Version 2 (about 4–6 weeks, scheduled later): 6 tasks

Errors (0):

Warnings (4):
  - requirement R19 Projects P1–P10 maps to no task (note: Deferred: no repository source)
  - requirement R27 MVP and roadmap maps to no task (note: All phases)
  - requirement R29 Profile and portfolio maps to no task (note: Deferred: needs accounts and T9 content)
  - requirement R34 No admin or community in MVP maps to no task (note: Not built by design)
```

---

# Phase 2 review

Date: 10 October 2026. Scope: Phase 2 checked against the code before carding. Verdict: **Ready with fixes (applied to the plan)**

## Blocking (fixed in the plan before carding)

- [x] **DATA-06 duplicated live content.** The mocks already ship as six T8.2 lessons at `/interview/mock-interviews/*` through `learn.mjs`. Owner decision: retire DATA-06; FE-15 puts the timer and scorer on those lessons.
- [x] **Mock rubric mismatch.** `rules.ts` scored five dimensions on 1–4; the lessons print a five-signal short round and a six-dimension full round on 1–5. Owner decision: use the lessons' rubric; FE-15 updates `rules.ts`.
- [x] **FE-18 route collision.** `/interview/[moduleSlug]` already serves interview-practice modules. Owner decision: hubs at `/interview/hubs/[hubSlug]`.

## Should fix

- [ ] **Readiness has few measured inputs.** Checkpoints (DATA-10, now backlog), worksheet rubric means (no production scorer) and behavioural readiness are unmeasured, so only mocks feed interview readiness in Phase 2. UX-07 must settle how the score shows; card open question.
- [ ] **FE-16 is L.** Consider splitting the three list pages (ports) from the dashboard (new readiness logic).
- [ ] **A11Y-01 never covered `/progress` and `/settings`.** FE-16 and FE-17 add them to `e2e/a11y.spec.ts`.

## Notes

- DATA-10 moved to the backlog: PM-04 approved checkpoints, and the owner will write them later.
- FE-19 must run last: the demo holds the only `InterviewRunners`, `Dashboard`, `ProgressViews`, `ProgressPages` and `SettingsView` that FE-15, FE-16 and FE-17 port.

## Structural check

```
Sections: 17/17  Tasks: 71  Phases: 4
  Phase 2 Practice, Interview and Progress (about 3 weeks): 7 tasks
Errors (0)
Warnings (5): DATA-06 and DATA-10 in no phase (backlog); R19, R27, R29, R34 map to no task (deferred or by design)
```
