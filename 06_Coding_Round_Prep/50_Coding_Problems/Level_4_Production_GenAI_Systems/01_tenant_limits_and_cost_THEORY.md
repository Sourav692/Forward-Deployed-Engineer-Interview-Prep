# Tenant limits and cost control: the ideas behind problems 31, 35, 39

A GenAI platform usually serves many customers from one shared pool of model capacity and one shared bill. These three
problems are about keeping that pool fair and that bill predictable. The code is small. The ideas behind it are what the
interviewer wants to hear.

## Per-tenant isolation (the noisy neighbour problem)

A tenant is one customer organisation on a shared platform. Isolation means every limit, counter, and budget is kept
separately for each tenant, so one customer's behaviour cannot change what another customer gets.

Why it matters: if the rate limiter uses one global counter, a single tenant running a batch job or a buggy agent loop
fills it, and every other customer starts getting refused or slowed down. The same is true for quotas and cost alerts.
A global number also hides who caused the problem.

> Say it like this: "Every counter is keyed by tenant, so one customer's spike never eats another customer's capacity."

## Fixed-window rate limiting

A rate limiter caps how many requests a caller can make in a period of time. A fixed window splits time into equal
blocks (for example each minute) and counts calls inside the current block. When a new block starts, the count resets.

Why it matters: model providers limit you, and you need to share that limit fairly between your own customers. Fixed
windows are the easiest version to build and explain. Their known weakness is the edge burst: a caller can use the full
limit at second 59 and again at second 60. A sliding window or token bucket smooths that out if it matters.

> Say it like this: "I start with a fixed window because it is simple to test, and I would move to a token bucket if
> bursts at the window edge cause trouble."

## Fail closed on missing data

Failing closed means that when the system is unsure, it picks the safe answer, usually "no". Failing open means it picks
"yes" and hopes for the best.

Why it matters: a tenant with no quota row is almost always a setup mistake. If the code treats a missing quota as
unlimited, that mistake becomes a surprise bill of thousands of dollars. The same idea applies to clock skew: if a
timestamp goes backwards, it should count against the current window, not open a fresh one.

> Say it like this: "If there is no quota on record I refuse the call, because an unlimited default turns a config bug
> into a billing incident."

## Atomic check-and-update

An atomic operation happens as one step that nothing else can interrupt. A check-then-update pattern (read usage, decide,
write usage) is not atomic: two requests can both read "99 of 100 used", both decide "allowed", and both go through.

Why it matters: real platforms handle many requests at the same moment across many servers. Without an atomic step,
quotas overshoot under load, which is exactly when they matter most. In production this is a Redis `INCR` with a check,
or a database transaction.

> Say it like this: "My version checks and adds in two steps, which is fine in one process; in production I would make
> it one atomic increment in Redis so parallel calls cannot overshoot."

## Baselines and thresholds for anomalies

An anomaly is a value far from what is normal for that tenant. A baseline is the normal level, here the average daily
cost. A threshold says how far above the baseline counts as a problem.

Why it matters: an agent stuck in a loop can spend a month of budget in hours. Comparing each tenant to their own past
catches that without a fixed number that is too high for small customers and too low for big ones. A minimum spend
stops tiny accounts from alerting on a jump from one cent to five cents.

> Say it like this: "I compare each tenant to their own average and require a minimum spend, so I catch real runaway
> loops without paging anyone over pennies."

## Injecting time

Instead of reading the clock inside the function, the current time is passed in as an argument (`now`).

Why it matters: tests can then replay any sequence of calls instantly and get the same answer every time. It also makes
clock problems, like a timestamp going backwards, easy to reproduce.

> Say it like this: "I pass the time in, so the limiter is deterministic and I can test window edges without sleeping."

## How the problems use these ideas

- **Problem 31 (rate limiter):** per-tenant isolation, fixed windows, injected time, and failing closed when the clock
  goes backwards. Storing one window per tenant also cleans up old windows for free.
- **Problem 35 (quota):** fail closed on a missing quota, and the request size is added before comparing. The
  production answer is the atomic update.
- **Problem 39 (cost anomalies):** baselines per tenant, a threshold factor, and a minimum spend. New tenants with no
  history are skipped on purpose, and that choice should be said out loud.

## Using an AI assistant on these problems

- Tell the assistant to take `now` as an argument and never call `time.time()`. Assistants reach for the real clock by
  default.
- Spell out the missing-data rule ("missing quota means refuse"). Left alone, assistants often write
  `quota.get(tenant, float("inf"))`.
- Check that every dict is keyed by tenant. Read the code for any counter that is shared across tenants.
- Ask for the output to be sorted when it is a list of ids, so your tests do not depend on dict order.
- After it works, ask the assistant one follow-up: "What breaks if two servers run this at once?" It should mention a
  shared store and atomic updates.

## Words to know

| Term | Plain meaning |
| --- | --- |
| Tenant | One customer organisation on a shared platform. |
| Rate limit | A cap on how many requests are allowed in a period of time. |
| Fixed window | Time split into equal blocks; the count resets at each new block. |
| Token bucket | A limiter that refills a little at a time, which smooths out bursts. |
| Quota | A customer's total allowance for a billing period. |
| Fail closed | When unsure, choose the safe answer (usually refuse). |
| Atomic | Done in one step that cannot be interrupted halfway. |
| Baseline | The normal level you compare against, such as average daily cost. |
