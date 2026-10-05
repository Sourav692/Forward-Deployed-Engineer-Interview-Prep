# Tasks: Forward Deployed production platform

Source plan: [`site/specs/2026-10-05-production-implementation-plan.md`](../2026-10-05-production-implementation-plan.md) · Review verdict: Ready with fixes ([PLAN_REVIEW.md](PLAN_REVIEW.md)) · Generated: 5 October 2026

Only Phase 0 is carded. Later phases are listed below with their task counts and will be carded when Phase 0 exits.

## Phase 0: Decisions and foundations (about 1 week)

Outcome: owner decisions are recorded, CI guards every PR, and the curriculum model exists as data.

| # | Task | Outcome | Size | Depends on | Status |
|---|---|---|---|---|---|
| 1 | [DATA-01](phase-0/01-DATA-01-curriculum-model.md) | `src/lib/curriculum.ts` with 10 tracks, 16 sections, 53 modules; types in `curriculum-types.ts` | L | - | in progress |
| 2 | [DS-01](phase-0/02-DS-01-radius-tokens.md) | Radius tokens in `@theme`; hard-coded radii replaced | S | - | in progress |
| 3 | [DS-02](phase-0/03-DS-02-core-status-tokens.md) | Demo status tokens promoted to core; contrast verified and recorded | S | - | in progress |
| 4 | [FE-01](phase-0/04-FE-01-move-progress-rules.md) | Rules moved to `src/lib/progress/rules.ts`; `npm run check:rules` | S | - | in progress |
| 5 | [OPS-03](phase-0/05-OPS-03-vercel-project-link.md) | Vercel project link confirmed as `forward-deployed` | S | - | in progress |
| 6 | [OPS-04](phase-0/06-OPS-04-node-engines.md) | `engines` field and `.nvmrc` | S | - | in progress |
| 7 | [PM-01](phase-0/07-PM-01-third-party-publish-decision.md) | Third-party publish decision recorded | S | - | done |
| 8 | [PM-02](phase-0/08-PM-02-handbook-authorship.md) | FDE Handbook authorship confirmed | S | - | done |
| 9 | [PM-04](phase-0/09-PM-04-authored-checkpoints.md) | Checkpoint authoring decided | S | - | done |
| 10 | [PM-05](phase-0/10-PM-05-git-history-restore.md) | Git-history restore decided | S | - | done |
| 11 | [DATA-03](phase-0/11-DATA-03-multi-use-source-audit.md) | Report of source files listed in more than one module, with proposed homes | S | DATA-01 | in progress |
| 12 | [UX-01](phase-0/12-UX-01-slug-table.md) | Final slug table for tracks and modules, collision-checked | M | DATA-01 | in progress |
| 13 | [OPS-01](phase-0/13-OPS-01-ci-workflow.md) | `.github/workflows/ci.yml` on every PR; required on `main` | M | FE-01 | in progress |
| 14 | [QA-01](phase-0/14-QA-01-check-rules-script.md) | `check:rules` wired (from FE-01) | S | FE-01 | in progress |
| 15 | [PM-03](phase-0/15-PM-03-canonical-homes.md) | Owner decides canonical home for each multi-use file | M | DATA-03 | todo (waits on DATA-03) |
| 16 | [SEC-04](phase-0/16-SEC-04-dependency-audit.md) | Dependabot or `npm audit` in CI | S | OPS-01 | in progress |

Exit criteria:

- [ ] Every third-party lesson in `curriculum.ts` has `publish` set to something other than `pending`, or is accepted as `pending` (hidden) for Phase 1.
- [ ] Canonical homes decided for every multi-use file.
- [ ] CI runs on PRs and is green on `main`.

## Critical path

Estimate only, using S = 0.5, M = 1.5, L = 4 days.

- Longest chain: **DATA-01 (4) → DATA-03 (0.5) → PM-03 (1.5) = 6 days.** PM-03 is an owner decision, so its real length depends on owner time.
- DATA-01 (4) → UX-01 (1.5) = 5.5 days, in parallel with the chain above.
- FE-01 (0.5) → OPS-01 (1.5) → SEC-04 (0.5) = 2.5 days; QA-01 runs beside OPS-01.
- DS-01, DS-02, OPS-03 and OPS-04 have no dependencies and can run any time.
- PM-01, PM-02, PM-04 and PM-05 are already done.

## Later phases (not yet carded)

| Phase | Tasks | Status |
|---|---|---|
| Phase 1: Learn MVP (about 3 weeks) | 40 | not yet carded |
| Phase 2: Practice, Interview and Progress (about 3 weeks) | 9 | not yet carded |
| Phase 3: Version 2 (about 4–6 weeks, scheduled later) | 6 | not yet carded |

## Backlog

None. Every plan task belongs to a phase.
