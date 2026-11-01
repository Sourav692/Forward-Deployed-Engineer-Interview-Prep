# Stage 5 miniature example: why a queue cannot fix overload

**Scenario (illustrative numbers):** Tenant A sends 700 requests/s. Tenants B and C send 150/s each. One downstream provider can complete about 600 equal-cost requests/s. This example deliberately ignores variable token lengths; the full stage must correct that simplification.

## Before

`Gateway → Shared unbounded queue → AI workers`

There are 1,000 requests arriving every second but only 600 can finish. The queue gains about 400 requests each second. After five seconds it has grown by roughly 2,000. It keeps growing if traffic continues. More queue space does not make the provider faster.

## After

`Gateway → admission control → bounded tenant queues → fair scheduler → concurrency limiter → AI workers`

Set a queue limit and reject new work when it is full. Use per-tenant limits so Tenant A does not consume all waiting slots. Add deadlines: a queued request that has already timed out should not be processed. Use a weighted scheduler if enterprise tiers require different shares.

## Trade-off

A longer queue absorbs temporary bursts but increases waiting time; a shorter queue protects latency but rejects more traffic. The right limit depends on request deadlines, processing rate, and measured workload.

## Failure experiment

When the provider returns 429, retrying all failed requests immediately increases load. Instead limit retry budgets, use backoff with jitter, and propagate overload signals to admission.

## Test yourself

**Question:** Why is a rate limiter not enough for fair scheduling?

**Model answer:** A global rate limit caps total admission but does not decide which tenant gets capacity. Use per-tenant quotas and a scheduler. Weighted policies allocate different shares; deadlines and queue bounds protect latency.

**Exit check:** Explain queue growth, draw the new path, compare queue-vs-reject, and explain how one tenant is isolated.
