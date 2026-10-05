# PM-01: Owner decision recorded per third-party item (exclude, keep with credit, rewrite) in `curriculum.ts` `publish` field

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| 0: Decisions and foundations | S | - | DATA-02 | §3 Product goals, §12 Security, §15 |

Status: **done**. Decision recorded 5 October 2026.

## Decision
Keep **all** third-party material, **with credit**. Every third-party lesson gets `publish: 'credited'`, a `credit` string, a credit line on the lesson page and a row on `/library/credits` (SEC-05). Resolves Q1 and Q2 (§15).

## Why
Publishing third-party text without a decision is the highest real risk for the site (§12). The `publish` field turns the decision into code that sync and `check:content` enforce (R9).

## Context from the plan
- Items in scope (from `module_source_audit.md`, summarised in §12): *Cracking Agentic AI System Design Interviews* chapters (T3.2, T3.3, T3.4, T4.2, T5.3); *The Forward Deployed Engineer System Design Interview* derived tutorials and `03_/System_Design_Worksheets` (T5.5, T8.1, live module 01); iGrace course pages (T5.1, T1.5); cost cram sheets (T4.5); fdehandbook.com scoping summary (T6.2); DevRev prompt (T6.3); quoted interview sites (T2.4, T3.1); Blitzy 02 from blitzy.com (T8.4, live module 16).
- `publish: 'credited'` lessons render a credit line from `credit` (§10).
- This plan is not legal advice; the owner's decision is the record (§12).

## Scope
In:
- The decision (done).
- Applying it: DATA-01 sets `publish: 'credited'` and `credit` on every third-party lesson.
Out:
- Credit line rendering (DATA-02, FE-07) and the credits page (SEC-05).

## Files likely touched
- `site/src/lib/curriculum.ts` (new, via DATA-01)

## Acceptance criteria
- [x] Owner decision recorded in plan §15.
- [ ] Every lesson flagged third-party in `curriculum_plan.md` has `publish: 'credited'` and a non-empty `credit` in `curriculum.ts` (checked when DATA-01 lands).
- [ ] Phase 0 exit criterion met: no third-party lesson left `pending` unless accepted as hidden.

## Test plan
Manual review of `curriculum.ts` against the audit list; automated once DATA-04 adds the publish checks.

## Definition of done
- [ ] Acceptance criteria all checked
- [ ] Plan or docs updated if a decision changed

## Open questions
- Who writes the exact `credit` strings (title, author, link) for each source? The plan names the decision but not the wording.
- Live module 01 (book-derived worksheets) and module 16 (Blitzy 02) are already public. Do they get a credit line on their existing pages now, and a row on `/library/credits`? No task covers them yet.
