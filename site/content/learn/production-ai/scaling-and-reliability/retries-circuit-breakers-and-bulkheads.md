# Retries, Circuit Breakers, and Bulkheads

*Retrying recovers from a blip and makes a real outage worse, so pair per-call retries with a cross-call breaker and isolate slow dependencies.*

A retry decides about one call; a circuit breaker remembers the last hundred. Use retries for transient failures, a breaker for a dependency that is down, and a bulkhead for one that is merely slow, and know which is which.

**Objectives:**

- retry transient failures with bounded exponential backoff and jitter;
- implement the three-state circuit breaker and place it around the retried call;
- tell a bulkhead from a circuit breaker by what each protects against.

---

## Retry With Growing, Jittered Delays

A rate limit or a dropped connection deserves a bounded number of retries with a growing delay. It does not deserve an immediate crash or a tight retry loop. The production-operations tutorial's decorator catches a specific retryable exception and sleeps `base_delay * backoff_factor ** attempt` between tries. It re-raises after `max_attempts`.

```python
@retry_with_backoff(max_attempts=4, base_delay=0.3, backoff_factor=2.0)
def call_with_retry(question: str) -> str:
    return flaky(question)   # raises TransientError twice, then succeeds
```

The delay must grow. With a fixed interval, every client that failed at the same moment retries at the same moment. That synchronised spike is the thundering herd. The tutorial's delays are 0.3 s, 0.6 s and 1.2 s, with no randomness. Production adds jitter, for example `delay * random.uniform(0.5, 1.5)`, so two clients that failed in the same millisecond do not retry in lockstep.

`max_attempts` stops a transient failure from becoming an infinite loop. Re-raise after the last attempt so a fallback or the caller can react. Retrying forever fails because a dependency that is truly down never recovers by waiting. Every retry burns latency and quota that a failover could use.

## Break the Circuit on a Dead Dependency

A circuit breaker stops calling a dependency that has failed too often, so the system stops paying to rediscover that it is down. It has three states.

**Closed.** Calls pass through normally, and each failure increments a counter.

**Open.** Once failures reach the threshold, the breaker trips. For the cooldown period, every call is rejected without touching the dependency at all. It does not retry and fail; it never calls out.

**Half-open.** After the cooldown, exactly one probe call goes through. Success closes the breaker. Failure re-opens it for another full cooldown.

```python
breaker = CircuitBreaker(failure_threshold=3, cooldown_seconds=5.0)
breaker.call(unhealthy_dependency, x)   # after 3 failures, raises without calling x
```

The half-open probe is the part people forget. A breaker that only "counts and stops" has no path back to healthy and stays open after the dependency recovers.

## Wrap the Retried Call in the Breaker

Retries and breakers are not redundant. Retries handle one bad call; a breaker handles a bad dependency.

| Option | Costs | Buys | Pick when |
|---|---|---|---|
| Retry with backoff | Extra latency per call; still hits the dependency each attempt | Automatic recovery from momentary blips | The failure is likely transient, such as a rate limit or brief timeout |
| Circuit breaker | A cooldown during which good traffic is also rejected | No wasted latency or quota on a dependency that is clearly down | The dependency has failed repeatedly and is likely unavailable |

In the tutorial, the primary path's retry loop calls through the breaker. A trip stops the retries from wasting time on a known-bad primary, and the request falls through to the fallback faster.

Give each dependency its own breaker. When one tool in a fan-out of ten trips its breaker, the other nine keep working. Without a breaker, an agent's tool loop retries a flaky tool on every step and burns the run's entire latency and cost budget.

## Stop the Breaker Flapping

A breaker that flaps open and closed under load usually has two faults. The failure threshold is too low for normal transient noise. The cooldown is too short, so one lucky probe reopens traffic before the dependency has stabilised. Count failures over a sliding window rather than a raw consecutive count. Consider requiring more than one successful probe before closing fully.

## Isolate a Slow Dependency With a Bulkhead

A bulkhead is a different pattern, and interviewers notice when candidates mix the two up.

| Pattern | Protects against | How |
|---|---|---|
| Circuit breaker | A dependency failing repeatedly | Stop calling it for a while |
| Bulkhead | A dependency being slow but not failed | Give it a small, dedicated pool of connections or threads |

With a bulkhead, a call that hangs for thirty seconds exhausts only its own small pool. It never drains the shared pool that every other request, for every other customer, depends on. A circuit breaker asks whether a dependency is healthy. A bulkhead asks whether, even if it is not, it can only hurt itself.

> **Warning: an open breaker flattens your error chart.** In the open state, calls fail instantly with "circuit is OPEN" and the dependency is never invoked. Health metrics recorded only through the breaker undercount how long the dependency has been down. Log the trip time separately.

## Worked Example: A Flaky Tool in an Agent Loop

An agent calls a CRM tool that starts timing out. With no protection, every agent step retries the tool, and each run spends its whole latency and cost budget on one broken dependency.

With the patterns layered, a timeout triggers up to four retries at growing, jittered delays. After three failed calls, the CRM tool's breaker opens. Later calls fail instantly and the agent receives a structured "tool unavailable" result instead of a hang. A bulkhead gives the CRM tool its own small connection pool, so its slow calls never starve the search tool. After the cooldown, one probe tests the CRM. It is still down, so the breaker stays open.

The CRM outage cost one tool's capacity, not the whole agent's. Each pattern did a separate job: retries for the blip, the breaker for the outage, the bulkhead for the slowness.

---

## Key Takeaways

- Retry transient failures with exponential backoff, jitter and a maximum attempt count, then hand off to a fallback.
- A circuit breaker moves closed to open to half-open, rejects calls without touching the dependency while open, and needs the half-open probe to recover.
- Put the breaker around the retried call, one breaker per dependency.
- Fix flapping with a sliding failure window, a longer cooldown and several successful probes.
- A bulkhead isolates a slow dependency in its own pool; a breaker stops calls to a failing one.

## Check Yourself

<details>
<summary>1. Why must backoff be exponential rather than a fixed interval?</summary>

A fixed interval synchronises every failed client's retry into the same instant, the thundering herd. Growing, jittered delays spread them out.

</details>

<details>
<summary>2. What happens to the dependency while the breaker is open?</summary>

Nothing. Calls are rejected without invoking it, which is why breaker-only metrics undercount the outage.

</details>

<details>
<summary>3. A dependency is not failing, just taking 30 seconds per call. Which pattern applies?</summary>

A bulkhead. A dedicated small pool keeps the slow calls from exhausting the shared pool.

</details>

