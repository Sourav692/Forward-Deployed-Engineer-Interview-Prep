# PM-04: Owner decides whether checkpoint questions may be authored (A2) and who writes them

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | S | - | UX-05, DATA-10 | §3 Product goals, §15 |

Status: **done**. Decision recorded 5 October 2026.

## Decision
Checkpoint questions, diagnostic questions and project briefs **may be authored**, and the **owner writes them**. DATA-10 goes ahead in Phase 2. Confirms assumption A2 and resolves Q4 (§15).

## Why
The grounding rule (R6) forbids new lesson content. Without this decision, modules could only reach Completed through lessons read plus confidence, and the readiness dimension that depends on checkpoints would show "not measured" (Q4).

## Context from the plan
- A2 (§1): "No new content" applies to lesson bodies. Checkpoint questions, path definitions, diagnostic questions and module metadata are product configuration, so they may be written; checkpoint questions still need owner sign-off.
- DATA-10 (§10): owner-written 6 to 10 item checkpoints for the T2 to T6 modules, stored beside `curriculum.ts` (Phase 2, size L).
- UX-05 (§5): diagnostic copy (10 questions) and scoring table mapped to the seven paths, ported from `src/demo/data/paths.ts` and reviewed by the owner (Phase 1).
- Project briefs P1 to P5 (§14 Phase 3) now have an author.

## Scope
In:
- The decision (done).
Out:
- Writing the checkpoints (DATA-10), the diagnostic (UX-05) and project briefs (Phase 3).

## Files likely touched
- None for the decision. Later: `site/src/lib/` checkpoint data beside `curriculum.ts` (guess, DATA-10); `site/src/demo/data/paths.ts` as UX-05 source (exists).

## Acceptance criteria
- [x] Owner decision recorded in plan §15; A2 confirmed.
- [x] DATA-10 is no longer conditional (Phase 2 note "runs only if PM-04 approved" is satisfied).

## Test plan
None (decision task).

## Definition of done
- [x] Acceptance criteria all checked
- [ ] Plan or docs updated if a decision changed

## Open questions
- Project briefs were a Phase 3 open item (Q14). With an author now named, should P1 to P5 move earlier, or stay in Phase 3?
