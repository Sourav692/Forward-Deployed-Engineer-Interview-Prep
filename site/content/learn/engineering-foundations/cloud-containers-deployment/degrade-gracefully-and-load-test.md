# Degrade Gracefully and Load Test

*A fallback answer is worse than the full one but better than an error, so plan the drop in quality before a dependency fails and measure where the service breaks before users find it.*

Every AI backend depends on services it does not control. Decide in advance what the service does when one of them fails, then load test to learn the load at which it stops meeting its targets.

**Objectives:**

- protect the service from a failing dependency with a circuit breaker and a fallback;
- design three tiers of graceful degradation;
- plan a load test that separates your infrastructure's limits from the provider's.

---

## Break the Circuit to a Failing Dependency

A dependency that keeps failing should not keep receiving calls. Put a **circuit breaker** on each dependency, for example with the `circuitbreaker` library. After several failures it stops calling the broken service for a while. Switch to a fallback LLM in the meantime.

## Degrade in Tiers

When parts of the system fail, step down rather than stop. The source names three tiers:

1. A full RAG answer, with retrieval and generation.
2. An LLM answer without retrieval, with a disclaimer.
3. A static fallback message.

Tell the user briefly that the answer is limited, without technical details. That beats silently serving worse answers.

> **Warning: silent degradation is a quality bug.** A tier-2 answer presented as a tier-1 answer looks grounded when it is not. Always mark the drop in the response the user sees.

## Load Test Against the Real Bottleneck

The bottleneck in an AI service is often the LLM provider's rate limits, not the service's own servers. A load test has to separate the two.

Use **Locust** with realistic prompts and think time between requests. Treat HTTP 429 responses as expected, not as failures, because they are the provider saying "slow down". Run four scenarios:

| Question | Scenario |
|---|---|
| Does it hold at expected peak? | Baseline test: ramp up to expected peak |
| What happens when traffic jumps? | Spike test: jump to about 5 times normal |
| Does it leak over time? | Soak test: 2 to 4 hours, to find memory leaks and connection-pool exhaustion |
| Do fallbacks and queues work? | Rate-limit test: check fallback and queuing |

At each load level, measure P50, P95 and P99 latency, error rate by type, throughput, and cost per request. Record the load at which the service breaks its SLA.

## Test Your Infrastructure With a Mock LLM

A mock LLM that answers instantly takes the provider out of the test. It tests pod count and connection pools cheaply, without paying for tokens or hitting provider limits. Run it separately from the tests against the real provider, so each result measures one thing.

## Worked Example: A Vector Store Outage at Peak

A support assistant runs a spike test at 5 times normal traffic, using a mock LLM so the run costs almost nothing. Midway, the vector store stops responding.

The circuit breaker on the vector store opens after several failures, and calls to it stop. Requests drop to tier 2: an LLM answer without retrieval, with a short note that the answer may be incomplete. P99 latency stays within the SLA because no request waits on the dead store.

The soak test the next day runs for 3 hours and shows connection-pool exhaustion after 2 hours. That is a leak the spike test could never reveal. A separate test against the real provider shows 429 responses at a known request rate, and queuing absorbs them.

The team now knows three numbers it did not have before: the breaking load, the hour the pool runs dry, and the provider's ceiling.

---

## Key Takeaways

- Put a circuit breaker on each dependency and switch to a fallback LLM while it is open.
- Degrade through full RAG, LLM-only with a disclaimer, then a static message, and tell the user the answer is limited.
- Load test with realistic prompts and think time, treat 429s as expected, and run baseline, spike, soak and rate-limit scenarios.
- Use a mock LLM to test your own infrastructure separately from provider limits.

## Check Yourself

1. **Name the three tiers of graceful degradation, best first.**
   A full RAG answer; an LLM answer without retrieval plus a disclaimer; a static fallback message.

2. **Why treat HTTP 429 as expected in a load test?**
   The bottleneck is often the provider's rate limit. A 429 is the provider throttling, so the test should check how fallback and queuing respond rather than count it as a crash.

3. **Which scenario finds memory leaks, and how long does it run?**
   The soak test, run for 2 to 4 hours, which also finds connection-pool exhaustion.

