# G17 — Logistics Exception Handling: Cheat Sheet

[Main](../1_Interview_Guide/G17_Interview_Guide.md) · [Deep Dive](../2_Technical_Deep_Dive/G17_Technical_Deep_Dive.md) · [Unchanged source](../4_Full_Design/G17_Full_Design.md)

## Ask first

Feed freshness/rate? Who approves? Which cases may auto-resolve? Shipment value/confidence rule? Residency?

## Whiteboard path

`Webhooks + batch diff → regional normalized queue → cheap detection → agent draft → customs-first policy gate → auto executor or human queue → carrier action → regional audit`

Agent proposes; gate decides. Exception type comes from detection, never from the agent's self-label.

## Numbers and rules

~200 webhook events/s peak; files every 2–6 hours; ~150 agents/~40 concurrent. Auto only when **non-customs**, value **< $500**, confidence above threshold. Missing field → human. EU data stays EU (customer rule, not GDPR). Batch lateness is visible.

## Failure and proof

Idempotency key per carrier action; circuit-breaker fallback to human; no unaudited action. Legacy non-idempotent carrier may be human-only. Offline replay → shadow → one carrier/region auto pilot. Zero customs auto-resolves is a release invariant; measure detection recall and outcomes with a matched rerouting holdout.

**60-second close:** “Two ingestion paths converge after ingestion. The model only drafts on detected exceptions. An independent customs-first gate and safe executor keep automated actions narrow, auditable and regional.”
