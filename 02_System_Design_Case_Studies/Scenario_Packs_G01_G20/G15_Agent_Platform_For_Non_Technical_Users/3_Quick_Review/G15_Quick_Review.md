# G15 Agent Platform for Non-Technical Users: Cheat Sheet

[Main](../1_Interview_Guide/G15_Interview_Guide.md) · [Deep Dive](../2_Technical_Deep_Dive/G15_Technical_Deep_Dive.md) · [Unchanged source](../4_Full_Design/G15_Full_Design.md)

## Ask first

How non-technical is authoring? Which channels? Read-only or destructive actions? Blast radius? Multi-tenant from day one?

## Whiteboard path

`Channel adapter → canonical tenant Event → live-trigger priority → entity lock → pinned-spec orchestrator → typed args → action idempotency → guardrail / approval → scoped tool → checkpoint / trace`

The demonstrated engine has no LLM. A future model proposes values or a draft spec; code and humans authorise actions.

## Five rules

- Priority chooses which workflow *should* run; a lock stops two that *can* collide.
- Resume and fresh execution share one loop at `next_step_index`.
- Key idempotency on `{tenant_id}:{run_id}:{step_name}:{args_hash}` and check it after caller and tenant access, before authorisation or billing.
- Guardrail denies in order: step cap, real-dollar spend cap, shadow, not-live, missing destructive-action authority.
- Promote `DRAFT → TESTING → SHADOW → LIVE → AUTONOMOUS`, one step at a time, never self-approved.

## Failure story

$500 refund, $50 tenant cap: refuse, never clamp. Wrong-cost bug checked a nominal API fee; replay bug charged the cap again despite no second refund. Correct the amount and place idempotency before authorisation. The source demo has 21 deterministic tests; in-process stores still need durable shared replacements for production.

**60-second close:** “Non-technical intent becomes a reviewable spec. Deterministic routing, guardrails, idempotency and checkpointing decide whether a real action can run once and recover safely; the model never grants itself authority.”
