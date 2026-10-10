# Tasks: Forward Deployed production platform

Source plan: [`site/specs/2026-10-05-production-implementation-plan.md`](../2026-10-05-production-implementation-plan.md) · Review verdict: Ready with fixes ([PLAN_REVIEW.md](PLAN_REVIEW.md)) · Generated: 5 October 2026

Phases 0 and 2 are carded. Phase 1 is listed in full with the PR that delivered each task. Phase 3 is listed below with its task count.

## Phase 0: Decisions and foundations (about 1 week)

Outcome: owner decisions are recorded, CI guards every PR, and the curriculum model exists as data.

| # | Task | Outcome | Size | Depends on | Status |
|---|---|---|---|---|---|
| 1 | [DATA-01](phase-0/01-DATA-01-curriculum-model.md) | `src/lib/curriculum.ts` with 10 tracks, 16 sections, 53 modules; types in `curriculum-types.ts` | L | - | done (#15) |
| 2 | [DS-01](phase-0/02-DS-01-radius-tokens.md) | Radius tokens in `@theme`; hard-coded radii replaced | S | - | done (#14) |
| 3 | [DS-02](phase-0/03-DS-02-core-status-tokens.md) | Demo status tokens promoted to core; contrast verified and recorded | S | - | done (#14) |
| 4 | [FE-01](phase-0/04-FE-01-move-progress-rules.md) | Rules moved to `src/lib/progress/rules.ts`; `npm run check:rules` | S | - | done (#11) |
| 5 | [OPS-03](phase-0/05-OPS-03-vercel-project-link.md) | Vercel project link confirmed as `forward-deployed` | S | - | done (local re-link; file is gitignored) |
| 6 | [OPS-04](phase-0/06-OPS-04-node-engines.md) | `engines` field and `.nvmrc` | S | - | done (#10) |
| 7 | [PM-01](phase-0/07-PM-01-third-party-publish-decision.md) | Third-party publish decision recorded | S | - | done |
| 8 | [PM-02](phase-0/08-PM-02-handbook-authorship.md) | FDE Handbook authorship confirmed | S | - | done |
| 9 | [PM-04](phase-0/09-PM-04-authored-checkpoints.md) | Checkpoint authoring decided | S | - | done |
| 10 | [PM-05](phase-0/10-PM-05-git-history-restore.md) | Git-history restore decided | S | - | done |
| 11 | [DATA-03](phase-0/11-DATA-03-multi-use-source-audit.md) | Report of source files listed in more than one module, with proposed homes | S | DATA-01 | done (#15) |
| 12 | [UX-01](phase-0/12-UX-01-slug-table.md) | Final slug table for tracks and modules, collision-checked | M | DATA-01 | done (#15) |
| 13 | [OPS-01](phase-0/13-OPS-01-ci-workflow.md) | `.github/workflows/ci.yml` on every PR; required on `main` | M | FE-01 | done (#13); branch protection still to set |
| 14 | [QA-01](phase-0/14-QA-01-check-rules-script.md) | `check:rules` wired (from FE-01) | S | FE-01 | done (#11, #13) |
| 15 | [PM-03](phase-0/15-PM-03-canonical-homes.md) | Owner decides canonical home for each multi-use file | M | DATA-03 | done (signed off 5 Oct 2026, #15) |
| 16 | [SEC-04](phase-0/16-SEC-04-dependency-audit.md) | Dependabot or `npm audit` in CI | S | OPS-01 | done (#12, #13) |

Exit criteria:

- [x] Every third-party lesson in `curriculum.ts` has `publish` set to something other than `pending`, or is accepted as `pending` (hidden) for Phase 1.
- [x] Canonical homes decided for every multi-use file.
- [x] CI runs on PRs and is green on `main`.

## Phase 1: Learn MVP (about 3 weeks)

Outcome: a visitor picks a path, browses all 10 tracks and 53 modules, reads real lessons for every ready and partly ready module, sees honest gap states, and keeps lesson progress in their browser.

Phase 1 was built in workstreams straight from the plan, without separate task cards. QA findings: [2026-10-05-phase-1-qa-report.md](../2026-10-05-phase-1-qa-report.md).

| # | Task | Outcome | Size | Depends on | Status |
|---|---|---|---|---|---|
| 1 | DATA-02 | `scripts/learn.mjs` sync with link rewriting, heading normalisation, emoji stripping, credit line, snapshot fallback | L | DATA-01, PM-01 | done (#19) |
| 2 | SEC-01 | Folder allow-list and sanitiser in `learn.mjs` and `mocks.mjs`; check fails on any `content/` file whose source is outside the allow-list | S | DATA-02 | done (#19) |
| 3 | DATA-04 | `check-parse.ts` extended with the learn checks above | M | DATA-02 | done (#19) |
| 4 | DATA-05 | Glossary pass: add acronyms surfaced by the new lessons to `glossary.ts` | M | DATA-02 | done (#19) |
| 5 | FE-02 | `src/lib/progress/store.ts` with the `fd:v1` keys above, storage probe, `fd:progress` change event, export/import/reset | M | FE-01 | done (#17) |
| 6 | SEC-03 | Import type guard rejects unknown keys and values over 1 MB | S | FE-02 | done (#17) |
| 7 | BE-01 | Learner record types in `src/lib/progress/types.ts` with `id` and `updatedAt` on every record | S | FE-01 | done (#17) |
| 8 | FE-05 | Primitives moved from demo (`ui.tsx`, `feedback.tsx`) into `src/components/` | S | DS-01 | done (#18) |
| 9 | DS-03 | `StatusBadge` primitive with the eight statuses plus Coming soon and On hold, colour + icon + text label, tooltip with the rule | S | DS-02 | done (#18) |
| 10 | DS-04 | Type scale documented in `site/specs/` and applied to the lesson reading column | S | — | done (#18) |
| 11 | UX-02 | `NAV` in `editorial.ts` relabelled to the six areas; existing hrefs reached from area indexes | S | UX-01 | done (#20) |
| 12 | UX-03 | Breadcrumb spec per template (labels, truncation at 375 px) | S | UX-01 | done (#21) |
| 13 | UX-04 | Wireframes for module, lesson, track, path, gap states (Partly ready, Coming soon, On hold) at 375 and 1280 px | M | UX-01 | done (#21) |
| 14 | UX-06 | Copy deck for empty, error and gap states | S | UX-04 | done (#21) |
| 15 | FE-03 | Production AppShell: TopNav (six areas + utilities), SideNav tree, MobileNav, BottomBar, Breadcrumbs, moved from demo and used in `(site)/layout.tsx` without changing existing `/modules` page bodies | L | UX-02, DS-01 | done (#20) |
| 16 | A11Y-03 | Skip link, focus-visible ring using `--accent-ring`, landmark roles in the new AppShell | S | FE-03 | done (#20) |
| 17 | FE-04 | `src/lib/learn.ts` loaders and `generateStaticParams` for `/learn/[trackSlug]`, `/[moduleSlug]`, `/[lessonSlug]` with `dynamicParams = false` | M | DATA-02 | done (#21) |
| 18 | FE-06 | `/learn` overview (10 tracks, flags from chosen path, filters by level, topic, required) and track page with SectionAccordion | M | FE-04, FE-05 | done (#21) |
| 19 | FE-07 | Module page and lesson page, including GapPanel and LessonReader with source note and credit line | L | FE-04, DS-03 | done (#21) |
| 20 | FE-08 | PrerequisiteCard and Blocked status driven by `checkPrerequisites`, with "Open anyway" | S | FE-02, FE-07 | done (#21) |
| 21 | FE-09 | LessonActions (mark read, bookmark, note) and ConfidenceControl, with module rollup weighted by lesson minutes | M | FE-02, FE-07 | done (#21) |
| 22 | UX-05 | Diagnostic copy (10 questions) and scoring table mapped to the seven paths, ported from `src/demo/data/paths.ts` and reviewed by owner | S | PM-04 | done (#24) |
| 23 | FE-10 | `/start` diagnostic and `/start/paths/[pathId]`; path flags shown on `/learn` and module pages | M | FE-02, UX-05 | done (#24) |
| 24 | FE-11 | `/design`, `/practice`, `/interview` area index pages linking into existing `/modules/...` pages and `/fde-last-day-prep` | M | FE-03 | done (#25) |
| 25 | FE-13 | New landing page at `/` (name, tagline, personas, six areas, CTAs) | M | FE-03 | done (#25) |
| 26 | FE-14 | `not-found.tsx`, `error.tsx`, `loading.tsx` for `(site)` | S | FE-03 | done (#25) |
| 27 | FE-12 | Search index extended with tracks, modules and lessons; index split into per-area files fetched on demand to keep each under 500 KB | M | FE-04 | done (#23) |
| 28 | PERF-02 | Search index split per area (FE-12) with a size check in `check-parse.ts` | S | FE-12 | done (#23) |
| 29 | SEO-01 | `sitemap.ts`, `robots.ts`, metadata and JSON-LD on new routes | M | FE-04 | done (#23) |
| 30 | SEC-02 | Security headers in `next.config.ts`; CSP verified against mermaid and the theme script on preview | M | — | done (#23) |
| 31 | SEC-05 | Credits page `/library/credits` listing every `credited` source | S | DATA-02 | done (#23) |
| 32 | DATA-08 | Update CLAUDE.md "Layout" and "Content pipeline" bullets: `01_`, `05_` and `Mock_Interviews` now feed the site (DATA-06 adds its own line in Phase 2) | S | DATA-02 | done (#19) |
| 33 | QA-02 | Playwright setup with smoke flows above | M | OPS-01 | done (this PR) |
| 34 | A11Y-01 | axe checks in Playwright for landing, learn, track, module, lesson, start, progress, settings, existing scenario page | M | QA-02 | done (this PR) |
| 35 | PERF-01 | Bundle-size check in CI from `next build` output against budgets | S | OPS-01 | done (this PR) |
| 36 | OPS-02 | Bundle budget script reading `.next` build manifest | S | OPS-01 | done (this PR) |
| 37 | QA-03 | Route audit script: crawl preview sitemap, fail on 404 and on pages with zero published lessons marked `ready` | S | SEO-01 | done (this PR) |
| 38 | QA-04 | Regression check that live counts (module pages, links, diagrams reported by `check:content`) only grow | S | DATA-04 | done (this PR) |
| 39 | A11Y-02 | Manual audit report per template (keyboard, screen reader, zoom, reduced motion) with fixes filed | M | Phase 1 build | done (this PR); screen-reader pass still manual |
| 40 | QA-05 | Lighthouse run on preview for landing, lesson, dashboard | S | Phase 1 build | done (#26; production re-measured in #27: LCP 1.2–2.4 s) |

Exit criteria:

- [x] `/learn` shows 10 tracks and 53 modules; module status matches `curriculum_plan.md` after owner decisions (`check:curriculum`, `check:paths`).
- [x] Every published lesson renders with no repository links and passes `check:content` (108 synced, 96 live).
- [x] Existing `/modules/...`, `/fde-last-day-prep/...`, `/guide`, `/learning-map`, `/glossary` behave as before; their `fd:v1` progress is intact (`check:routes` crawls all 321 sitemap URLs; the e2e worksheet regression saves to `fd:v1:answers:*`).
- [x] Smoke and axe suites pass in CI; Lighthouse targets met. The suites run in the `e2e` CI job. On production, performance is 95 to 100 and LCP is 1.2 to 2.4 s (see the QA report).
- [x] Owner verifies the site. Done on 6 October 2026: the owner walked through production, ran the screen-reader pass, approved the diagnostic questions and settled the open decisions.

## Critical path

Estimate only, using S = 0.5, M = 1.5, L = 4 days.

- Longest chain: **DATA-01 (4) → DATA-03 (0.5) → PM-03 (1.5) = 6 days.** PM-03 is an owner decision, so its real length depends on owner time.
- DATA-01 (4) → UX-01 (1.5) = 5.5 days, in parallel with the chain above.
- FE-01 (0.5) → OPS-01 (1.5) → SEC-04 (0.5) = 2.5 days; QA-01 runs beside OPS-01.
- DS-01, DS-02, OPS-03 and OPS-04 have no dependencies and can run any time.
- PM-01, PM-02, PM-04 and PM-05 are already done.

## Phase 2: Practice, Interview and Progress (about 3 weeks)

Outcome: a learner practises mocks with a timer and rubric, sees a dashboard with next-up, revision queue and readiness, and can export and restore progress.

Re-scoped on 10 October 2026 after checking the plan against the code (see the note under Phase 2 in the plan, §14): DATA-06 is retired, FE-15 scores the existing mock lessons on their own 1–5 rubric, hubs live at `/interview/hubs/[hubSlug]`, and DATA-10 moves to the backlog.

| # | Task | Outcome | Size | Depends on | Status |
|---|---|---|---|---|---|
| 1 | [FE-15](phase-2/01-FE-15-mock-timer-and-scorer.md) | MockTimer and RubricScorer on the five scenario mock lessons, 1–5 lesson rubric, attempts saved | M | FE-02 | done (#72) |
| 2 | [FE-17](phase-2/02-FE-17-settings-page.md) | `/settings`: weekly hours, export, import, reset with ConfirmDialog | S | FE-02 | done (#73) |
| 3 | [DATA-07](phase-2/03-DATA-07-interview-hub-definitions.md) | Five interview hubs defined in `curriculum.ts`, linking existing sources and modules | M | DATA-01 | done (#74) |
| 4 | [FE-18](phase-2/04-FE-18-interview-hub-pages.md) | Hub pages at `/interview/hubs/[hubSlug]` | M | DATA-07 | done (this PR) |
| 5 | [UX-07](phase-2/05-UX-07-dashboard-wireframe.md) | Empty-first dashboard wireframes and the missing-input readiness rule | M | UX-04 | done (this PR) |
| 6 | [FE-16](phase-2/06-FE-16-progress-dashboard.md) | `/progress` dashboard, revision, history and bookmarks on real data | L | FE-09, FE-15, UX-07 | done (this PR) |
| 7 | [FE-19](phase-2/07-FE-19-retire-demo.md) | `/demo` retired with redirects; `src/demo/` removed | S | FE-15, FE-16, FE-17, FE-18 | todo |

Exit criteria:

- [ ] The five scenario mock lessons at `/interview/mock-interviews/...` carry a timer and a scorer for the short (five signals) and full (six dimensions) rounds, scored 1–5; pass rule (no dimension below 2, mean ≥ 3) applied; attempts saved.
- [x] Five topic hubs at `/interview/hubs/...` list existing question sources by link, with no copied content.
- [x] Dashboard shows real data only; empty state for new learners.
- [x] Readiness formulas from `rules.ts` drive gauges; inputs not yet measured (checkpoints) show "not measured" instead of 0. Rule settled in UX-07: overall score re-weighted over measured inputs.
- [ ] Export → reset → import restores state exactly.
- [ ] `/demo` retired.

Critical path (estimate, S = 0.5, M = 1.5, L = 4 days): **UX-07 (1.5) → FE-16 (4) → FE-19 (0.5) = 6 days**, with FE-15 (1.5) also feeding FE-16. FE-17 and DATA-07 → FE-18 (3 days) run in parallel.

## Backlog

| Task | Outcome | Size | Status |
|---|---|---|---|
| [DATA-10](backlog/DATA-10-module-checkpoints.md) | Owner-written checkpoints for T2–T6 modules | L | deferred (owner writes later) |

## Later phases (not yet carded)

| Phase | Tasks | Status |
|---|---|---|
| Phase 3: Version 2 (about 4–6 weeks, scheduled later) | 6 | not yet carded |

## Consolidation

Every reading module was rewritten into concept lessons under `01_Concept_Tutorials/Consolidated_Lessons/`, following `../2026-10-05-consolidation-playbook.md`. Per-track notes are in `../consolidation/`.

| PR | Scope |
|---|---|
| #31 | T3.4 Memory and state (the pilot) |
| #33 | Scaffold: per-track RENAMED files, derived redirects, playbook |
| #34 | T3.1–T3.3 single agents |
| #35 | T7.1 and T8.2, T7–T8 live titles |
| #36 | T0.1–T0.3, T1.2, T1.4 and T9.1 |
| #37 | T4.1, T4.2 and T4.4 quality and safety |
| #38 | T3.5–T3.7 reliable and multi-agent systems |
| #39 | T5.1–T5.4, T5.5 titles |
| #40 | T2 LLM and retrieval fundamentals |
| #41 | T6.1–T6.3 and T6.5 |
| #42 | T4.3 and T4.5–T4.8 operations and scale |
| Integration (this pass) | RENAMED hygiene and check, handoffs, naming audit, MRR glossary, canonical-homes table |

## Backlog

None. Every plan task belongs to a phase.
