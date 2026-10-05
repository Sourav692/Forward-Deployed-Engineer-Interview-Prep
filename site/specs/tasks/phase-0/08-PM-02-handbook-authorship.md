# PM-02: Owner confirms FDE Handbook authorship (A5)

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | S | - | - | §3 Product goals, §15 |

Status: **done**. Decision recorded 5 October 2026.

## Decision
The FDE Handbook (84 files) is the owner's own writing. Its lessons get `publish: 'own'` and need no credit line. Confirms assumption A5 and resolves Q3 (§15).

## Why
The Handbook is the backbone of most modules (`module_source_audit.md`). If it were third-party, most of the 47 lesson-bearing modules would need a rights decision before Phase 1 (Q3: high impact).

## Context from the plan
- A5 (§1): the FDE Handbook is the owner's own writing (audit open question 1).
- The audit found nothing in the Handbook that looks copied.
- `publish` values (§9): `own` | `credited` | `excluded` | `pending`.

## Scope
In:
- The decision (done).
- Applying it: DATA-01 sets `publish: 'own'` on every Handbook lesson.
Out:
- Non-Handbook sources (PM-01 covers third-party items).

## Files likely touched
- `site/src/lib/curriculum.ts` (new, via DATA-01)

## Acceptance criteria
- [x] Owner decision recorded in plan §15; A5 confirmed.
- [ ] Every Handbook-sourced lesson in `curriculum.ts` has `publish: 'own'` (checked when DATA-01 lands).

## Test plan
Grep `curriculum.ts` for Handbook source paths and confirm each has `publish: 'own'`.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Plan or docs updated if a decision changed

## Open questions
- None.
