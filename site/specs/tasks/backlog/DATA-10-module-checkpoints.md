# DATA-10: Owner-written 6–10 item checkpoints for the T2–T6 modules, stored beside `curriculum.ts`

| Phase | Size | Depends on | Unblocks | Plan source |
|---|---|---|---|---|
| Backlog (moved out of Phase 2 on 10 October 2026) | L | PM-04 (done), DATA-01 (done) | Checkpoint input to readiness | §10, §15 PM-04 |

## Why
Interview readiness gives checkpoints 20 % weight, and modules reach Completed faster with a passed checkpoint. Until checkpoints exist, readiness shows the input as "not measured".

## Context from the plan
- PM-04 (5 Oct 2026): checkpoint questions may be authored, and the owner writes them.
- Deferred on 10 Oct 2026: the owner writes them later as a content task; Phase 2 ships without them.
- Rules (exist): `CHECKPOINT_PASS = 70`, `scoreCheckpoint` in `src/lib/progress/rules.ts`. Module sections already say `assessment: 'Checkpoint'` and `doneWhen: 'Checkpoint ≥ 70%'`.
- Demo sample of the data shape: `src/demo/data/assessments-checkpoint-t2-4.ts` (copy the shape before FE-19 deletes it).

## Scope
In:
- Data format and storage beside `curriculum.ts` (no runtime imports).
- Owner-written items for T2–T6 modules.
- A checkpoint page or panel on module pages, and the readiness input switching from "not measured" to measured.
Out:
- Checkpoints for T0, T1, T7–T9.

## Acceptance criteria
- [ ] Every T2–T6 module has 6–10 owner-written items.
- [ ] Passing at 70 % records an attempt and updates module status and readiness.

## Open questions
- Size per track: M per track (plan §14), L overall. Consider one card per track when it starts.
