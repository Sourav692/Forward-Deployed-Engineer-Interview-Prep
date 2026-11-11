# Practise Scaling and Reliability Interview Questions

*A design that survives an outage but blows the budget, or scales but leaks, has not answered the question, so practise answers that hold all the constraints at once.*

"What breaks at 100 times the load?" and "your provider is down" are the two shapes of this round. Answer each question aloud first, then compare; every answer uses only concepts from the earlier lessons in this module.

**Objectives:**

- answer scaling questions with the three problems, the arithmetic and the proven-or-verbal label;
- answer reliability questions by naming the pattern and what it protects against;
- design a production gateway that meets availability, safety, cost and latency targets together.

---

## Answer the Scaling Questions

**"Name the three scaling problems at 20 million documents and the first symptom of each."**
Ingestion throughput, whose first symptom is days-long ingest and re-embedding unchanged documents. Query-time latency, where the in-process index runs out of memory and keyword search is rebuilt per query. Per-tenant isolation overhead, where per-chunk checks grow with corpus size. See [What Breaks at Twenty Million Documents](/learn/production-ai/scaling-and-reliability/what-breaks-at-twenty-million-documents).

**"How long does it take to embed 80 million chunks?"**
At about 500 chunks per second, it takes about 160,000 seconds. That is roughly 44 hours on one worker. With 50-way parallelism, it is under an hour. The point is throughput per worker times worker count.

**"Why is the post-retrieval access check free at scale?"**
It re-checks only the candidates, which top-K bounds, so it costs O(candidates), not O(corpus). Policy changes still need no reindex because enforcement reads the catalogue at query time.

**"Does caching fix tail latency?"**
No. Caching moves the median. Timeouts, circuit breakers and fallback to a smaller model move the tail.

**"Why not one shared index with a tenant filter?"**
A big tenant's rebuild slows everyone, and one filter mistake exposes everyone. Per-tenant shards keep the blast radius to one tenant.

## Answer the Reliability Questions

**"What is the difference between a retry and a circuit breaker?"**
A retry is a per-call decision for a transient failure. A breaker is a cross-call decision: it remembers that the dependency failed a moment ago and stops paying to find out again. Use both, with the breaker wrapping the retried call.

**"Name the three circuit-breaker states."**
Closed, where calls pass; open, where calls are rejected without touching the dependency; half-open, where one probe decides whether to close or re-open.

**"Why not retry forever?"**
A dependency that is really down never recovers by waiting, and every retry burns latency and quota that a failover could use.

**"Your agent's tool loop has no circuit breaker. What is the worst case?"**
One flaky tool is retried on every step and consumes the run's whole latency and cost budget.

**"One tool in a fan-out of ten trips its breaker. What happens to the other nine?"**
Nothing, if each dependency has its own breaker. One open circuit should not block unrelated tools.

**"Your fallback model uses a different tool-calling format. What breaks?"**
Tool schemas and structured-output contracts are not portable across providers. The fallback path needs its own validation, tested before the outage.

**"When is graceful degradation dangerous for an agent?"**
When the agent acts on the degraded result as if it were real, such as booking against a cached, stale price.

**"Circuit breaker, backup provider or bulkhead: what does each protect against?"**
The breaker protects against a dependency failing repeatedly. The backup provider protects against a long outage the breaker cannot route around. The bulkhead protects against a slow dependency exhausting a shared pool.

**"Is a kill switch the same as demoting a workflow in a staged rollout?"**
No. Rollout is a deliberate, role-gated change that may only affect future checks. A kill switch halts everything in scope now, including in-flight work, with one fast flip.

**"The customer asks for 99.9% uptime on an LLM feature. What do you say?"**
Separate our infrastructure's uptime from the upstream provider's. We cannot promise more than our dependency provides. Fallback and circuit-breaker design buy margin, not a guarantee.

**"Where does your AI system keep its state?"**
In at least five stores: conversation, workflow state, retrieval index, memory, and artifacts and audit. Each has a named owner, purpose and retention. Operational state lives in stores the runtime controls, the prompt is only a view, and stable tenant, user, run and step IDs link them. → [Know Every Store You Run](/learn/production-ai/scaling-and-reliability/know-every-store-you-run)

## Worked Example: Design a Production LLM Gateway

The prompt: design a gateway in front of a customer-support agent. It must survive a provider outage without visible downtime, resist prompt injection and PII leaks, stay under $500 a day, and keep P95 latency under 3 seconds.

**Request path.** A rule-based input guardrail runs first, a regex injection and PII check in microseconds. Next comes a cache lookup, exact match first, with an embedding-based semantic cache only if traffic shows many paraphrased repeats. A cost router follows: a cheap classifier picks the small or the strong model. An LLM-based guardrail runs only if the rule-based layer passed.

**Resilience.** Retry the model call with bounded backoff, 3 or 4 attempts, inside a per-provider circuit breaker. On a trip, fail over to a secondary provider and tag the response with its source. If both are down, return a labelled degraded answer using any cached context.

**Cost control.** A per-request token budget rejects outliers before the paid call. The router sends only complex queries to the expensive model, and cache hits are free. Cost is tagged per request, so the $500 ceiling is a live number, not a monthly surprise.

**Safety on the way out.** An output validator re-checks for leaked PII and a short banned-phrase list. Every block is logged with a reason.

**Observability.** Structured logs and a metrics collector track request count, error rate, latency and cache hit rate. Every call is traced so a bad run can be replayed step by step.

**Latency budget.** The rule-based guardrail takes about 1 ms. The cache check takes 5 to 10 ms. The router takes 200 to 400 ms on a small model. The main call takes 1 to 2 s. Output validation takes about 1 ms. The output LLM guard, when it fires, adds 300 to 500 ms. The common path is comfortably under 3 seconds. The LLM input guard is the one addition that threatens the budget, so make it skippable for low-risk, previously seen query patterns.

**Named failure mode.** The design has no answer for data residency if the customer cannot send data to a third-party provider at all. Say so and propose an in-VPC or self-hosted model as the next step.

A strong answer names the resilience chain. It puts cost control before the call. It orders guardrails cheap to expensive and checks input and output. It states the latency budget. It volunteers its own gap.

> **Warning: "add retries" is not a resilience design.** Interviewers score a concrete chain of retry, breaker, fallback and labelled degradation, plus what is logged when each fires.

---

## Key Takeaways

- Scaling answers name three problems, show the arithmetic and label each fix as proven or verbal.
- Reliability answers name the pattern and the failure it protects against: retry, breaker, backup, bulkhead or kill switch.
- Never promise more uptime than the upstream provider gives; fallbacks buy margin.
- A gateway design must satisfy availability, safety, cost and latency together, with a stated latency budget and a named gap.

## Check Yourself

<details>
<summary>1. Why must the circuit breaker wrap the retried call rather than sit beside it?</summary>

So a trip stops the retries from wasting time on a known-bad primary and the request reaches the fallback faster.

</details>

<details>
<summary>2. In the gateway design, which component most threatens the 3-second budget, and what is the mitigation?</summary>

The LLM input guardrail. Make it skippable for low-risk, previously seen query patterns.

</details>

<details>
<summary>3. What is the honest gap in the gateway design?</summary>

Data residency: if data cannot go to a third-party provider, it needs an in-VPC or self-hosted model.

</details>

