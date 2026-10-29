# Fair Sharing Between Tenants

*Serving requests first come, first served is simple and keeps the hardware busy, but it lets one tenant's burst make everyone else wait.*

A rate limit does not make a shared platform fair; it only stops a tenant exceeding its own budget. Add a fair queue for ordering under load, then spend caps, timeouts and per-tenant cost attribution so one tenant's runaway work cannot starve the rest.

**Objectives:**

- distinguish a rate limit from a fair queue in one sentence each;
- describe per-tenant quotas, circuit breakers, timeouts and spend caps;
- explain how per-tenant cost attribution supports all of them.

---

## Separate the Ceiling From the Order

Multi-tenant software is shared infrastructure, not just several customers using one app. One tenant's expensive query can starve everyone else. Without per-tenant limits, a single customer running a 10-minute query with a 1M-token context blocks other customers' requests. This is the noisy-neighbour problem.

Two controls answer two different questions. A **rate limit** answers "may this request proceed at all?" It is a ceiling on one tenant's own allotment. A **fair queue** answers "in what order are requests served under load?" The two are orthogonal, and a real platform needs both.

The easy-to-miss case: a large tenant bursts, stays within its own limit, and still makes a small, well-behaved tenant wait. A ceiling cannot prevent a wait that no tenant's limit was ever exceeded to cause. That is a queuing problem, not an authorisation problem.

## Queue Fairly Under Contention

First come, first served lets one tenant's burst monopolise everyone's capacity. The standard fix is **weighted fair queuing**, or a token bucket per tenant feeding a shared worker pool. Throughput is then shared proportionally under contention.

The quick reference draws the result as each of three tenants getting 33% of capacity at the model-serving scheduler. That is the equal-weight case. Weighted fair queuing generalises it, so a larger plan can carry a larger share.

## Set Quotas, Breakers, and Timeouts per Tenant

The quick reference gives a concrete set of limits.

| Control | Example setting | Effect |
|---|---|---|
| Free-tier quota | 10 requests a minute, 1,000 tokens a request | Over the limit returns `429 Too Many Requests` |
| Pro-tier quota | 100 requests a minute, 10,000 tokens a request | Same, at a higher ceiling |
| Enterprise quota | Custom limits | Negotiated per customer |
| Per-tenant circuit breaker | Opens at a 50% error rate | Blocks that tenant's requests for 60 s, returns a cached error, then closes |
| Query timeout | 30 s per query | Kills the query and returns partial results |

The enterprise RAG project applies the first of these in its entry point. A per-tenant fixed-window rate limit runs before an LLM client even exists. A denied request therefore costs nothing; its trace records `cost_usd == 0.0`. See [The Security-First Query Graph](/learn/production-ai/enterprise-rag-in-production/the-security-first-query-graph).

Two different circuit breakers appear across the sources, and they protect different things. The enterprise RAG client's breaker guards the *model provider*: it trips after 3 consecutive outage exhaustions and short-circuits calls for 30 s. The quick reference's breaker guards *other tenants*: it trips on one tenant's 50% error rate and blocks that tenant for 60 s. A platform may need both.

## Cap Spend and Attribute Every Cost

Every request records its cost: input tokens, output tokens, model and price. The quick reference's example is 450 input tokens and 280 output tokens on `gpt-4o`, costing $0.0195. Costs are then aggregated by tenant.

A daily spend cap acts on that total. Above 90% of the cap, the tenant is alerted. Above 100%, new requests are blocked with "quota exceeded", and the cap resets at midnight UTC. Without per-tenant tracking, nobody can tell which customer drives the cloud bill, and no cap can be enforced.

> **Warning: a spend cap is not an injection defence.** It limits how much a tenant can spend. It does not prove that a particular expensive action was authorised. [Prompt Injection and Egress Control](/learn/production-ai/security-tenancy-prompt-injection/prompt-injection-and-egress-control) explains why relying on it there is luck.

## Worked Example: Three Tenants, One Bad Day

Three tenants share one serving endpoint. By mid-afternoon, tenant A has spent $12.50 of a $50.00 daily cap. Tenant B has spent $48.90, over 90%, so it receives an alert. Tenant C has spent $52.10, over its cap, so its new requests are blocked until midnight UTC.

Meanwhile tenant A bursts within its own rate limit. Without a fair queue, its burst would fill the worker pool, and tenant B's requests would wait. With per-tenant queues feeding the fair scheduler, B still gets its share of capacity.

Then tenant A's error rate passes 50%. Its circuit breaker opens for 60 s, and its failing traffic stops consuming shared capacity.

Each control answered a different question: whether a request may proceed, in what order, at what cost, and whether one tenant's failure may spread. None of them would have covered the others.

---

## Key Takeaways

- A rate limit is a ceiling on a tenant's own allotment; a fair queue decides order under load, and a platform needs both.
- Weighted fair queuing, or a token bucket per tenant feeding a shared pool, shares throughput proportionally instead of first come, first served.
- Per-tenant quotas, circuit breakers and query timeouts bound each tenant, and a rate-limited request should cost nothing.
- Spend caps alert at 90% and block at 100%, and they depend on attributing every request's cost to a tenant.
- Each control answers one question, so none substitutes for another.

## Check Yourself

1. **Distinguish a rate limit from a fair queue in one sentence each.**
   A rate limit decides whether one tenant's request may proceed at all, as a ceiling on its own allotment. A fair queue decides the order requests are served under load, so one tenant's burst cannot monopolise shared capacity.

2. **How do the two circuit breakers in the sources differ?**
   The enterprise RAG client's breaker protects against the model provider failing: 3 consecutive outage exhaustions, 30 s open. The quick reference's breaker protects other tenants from one tenant's failures: 50% errors, 60 s block.

3. **Why does a spend cap need per-tenant cost attribution?**
   The cap acts on each tenant's running total. Without tagging every request's cost with its tenant, there is no total to compare against the cap.

