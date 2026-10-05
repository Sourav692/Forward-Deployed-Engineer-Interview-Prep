# PM-05: Owner decides which git-history folders to restore (`56cb673^`: incident logs, labs, readiness assessment, red-team fixtures, diagrams)

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | S | - | DATA-09 | §3 Product goals, §15 |

Status: **done**. Decision recorded 5 October 2026.

## Decision
Restore **all** the git-history groups: production incident logs, hands-on labs, the final readiness assessment, red-team fixtures and diagram explanations. The restore itself is DATA-09 in Phase 3. Resolves Q11 (§15).

## Why
These folders close gaps in T6.6 (customer-environment debugging), T9.1 (capstone build) and T8.3 (final readiness), which today are partly ready or coming soon (R31, R32).

## Context from the plan
- Source: the deleted root `FDE/Complete GEN AI FDE Interview System — Core + GenAI/`, removed in commit `56cb673` ("regroup root content folders"); restore from `56cb673^` (`module_source_audit.md`).
- Folders and targets (audit):
  - `05_PRODUCTION_DEBUGGING_OBSERVABILITY_AND_OPTIMIZATION/04_PRODUCTION_INCIDENT_LOGS/` (11 files) → T6.6
  - `11_HANDS_ON_LABS` → T9.1
  - `08_FINAL_READINESS_ASSESSMENT/` (4 files) → T8.3
  - `04_EVALUATION_SECURITY_AND_RED_TEAM/04_RED_TEAM_FIXTURES/` (2 READMEs) → T4.4, T4.7
  - Diagram explanations (location to confirm in DATA-09)
- DATA-09 (§10): restore chosen folders into root sources and map them to T6.6, T9.1, T8.3 (Phase 3, size M).
- Mock interviews were already restored to `03_Practice_Worksheets_and_Keys/Mock_Interviews/`; they are not part of this decision.

## Scope
In:
- The decision (done).
Out:
- The restore and mapping (DATA-09).

## Files likely touched
- None for the decision. Later: new folders under the matching numbered root directory (DATA-09).

## Acceptance criteria
- [x] Owner decision recorded in plan §15; Q11 resolved.

## Test plan
None (decision task).

## Definition of done
- [x] Acceptance criteria all checked
- [ ] Plan or docs updated if a decision changed

## Open questions
- §15 says "all four git-history groups" but lists five. Fix the count in the plan (PLAN_REVIEW should-fix item).
- Should DATA-09 move earlier than Phase 3, given the decision is made and the gaps are in Phase 1 modules?
