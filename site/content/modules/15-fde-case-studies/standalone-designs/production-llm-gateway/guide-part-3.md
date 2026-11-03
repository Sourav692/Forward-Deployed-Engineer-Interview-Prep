# Production LLM Gateway Under Real Constraints, part 3

## 8. Chain Retry, Breaker, Fallback and Degradation

"Retries handle one bad call; a circuit breaker handles a bad *dependency* — you want both, with the breaker wrapping the retried call." The source's full chain is retry, then breaker, then fallback, then graceful degradation. Each link covers a failure the previous one cannot.

**Retry** handles a momentary blip: a rate limit, a dropped connection. It must back off exponentially with jitter. A fixed interval synchronises every client's retry "into the same instant, which is the thundering-herd problem." The source bounds it at 3-4 attempts.

**The breaker** remembers that a provider failed a moment ago, so no request pays to rediscover it. A typical setting is `failure_threshold=3, cooldown_seconds=5.0`. It has three states. Closed passes calls through. Open rejects instantly without calling the provider. Half-open lets one probe through after the cooldown. A breaker without the half-open probe "has no path back to healthy." If it flaps under load, count failures over a sliding window rather than consecutively, and require more than one good probe before closing.

**Fallback** switches to a second provider when the breaker trips or retries run out. Tag every response with its `source`. "Logging which model actually answered is what lets you track cost and quality drift when traffic silently shifts to the backup." Keep prompts and tool schemas portable, because a fallback model with a different tool-calling format breaks the agent silently. Keep the fallback warm *(own construction)*. Send a small share of live traffic to it every day, such as 1% *(assumption)*, so its quality and its quota are proven before the outage. Confirm its rate limit covers full load. The additions file warns to "separate provider 429s from your own gateway limits."

**Degradation** is the floor. When both providers are down, return a labelled answer seeded with cached context, never a stack trace. For a support product the best degraded answer is often a handoff: "your ticket is logged and a person will reply" *(own construction)*.

- Degrade differently on the two faces. The source's rule is "Degrade gracefully in front of a human, fail loudly in front of a machine." The edge face shows the customer a labelled, useful reply.
- The model face returns a *typed error* to the agent, not a degraded string.
- An agent that acts on degraded text as if it were real can book against a stale price or issue a wrong refund.

## 9. Fit Failover Inside the Three-Second Budget

A latency budget is a sum, and the source gives the terms verbatim. They are whiteboard estimates, not measurements. Rule-based guardrail ~1ms. Cache check ~5-10ms. Router classification ~200-400ms on a small model. Main call ~1-2s. Output validation ~1ms, "or +300-500ms if the LLM-as-guardrail output check also fires."

| Path | Sum | Verdict |
|---|---|---|
| Common path | ~1ms + ~10ms + ~400ms + ~2s + ~1ms | About 2.4 s: fits |
| Plus LLM output check | + 300-500ms | About 2.9 s: tight |
| Plus LLM input guard in series *(assumption: 300-500ms)* | + 300-500ms | About 3.4 s: breaks |

- The source names the fix: the LLM input guard "is the one addition that risks the budget, so it should be skippable for low-risk, previously-seen query patterns." A second fix is *own construction*.
- The router and the input guard read the same text with the same small model, so run them in parallel.
- The pair then costs the slower of the two, not the sum.

Three more collisions sit inside the prompt *(own construction)*.

**The agent path cannot finish in 3 s.** Five sequential calls at ~1-2s each take 5 to 10 seconds. In my sizing, complex turns are 21% of traffic, so p95 falls inside them, and a p95 on full answers fails by construction. This is why section 1 asked what the 3 s measures. Hold the agent path to first streamed token under 3 s. Parallelise read-only tool calls, and route common intents to a one-call path. The playbook's rule applies: "I would not use an agent where a workflow engine or router is enough."

**Retries do not fit inside the budget during an outage.** A typical backoff waits 0.3s, then 0.6s, then 1.2s: 2.1 s of waiting before the fourth attempt, on top of each attempt's own timeout. On the interactive path, give each request a deadline, not an attempt count. Allow one retry only if the deadline leaves room, then fail over. After the breaker trips, requests skip provider A entirely, so failover adds almost nothing. The customers who pay for the outage are the few before the trip; the breaker threshold bounds how many.

**Output validation fights streaming.** A validator cannot pass judgement on text already on the customer's screen. Stream through the rule-based check sentence by sentence, which costs microseconds. Hold the LLM output check for replies marked risky, such as those touching refunds or account data, and send those unstreamed.

## 10. Log Enough to Replay Any Bad Run

"No error logs" usually means a silent wrong answer, not a crash. Only a per-step trace isolates which stage produced it. The source's instruments answer three different questions. Structured logs say what happened to one request. Metrics say how often, overall. Traces say why, step by step.

- Tag every request with its cost, so "the $500/day ceiling is a live number, not a monthly surprise." Tag every response with the model and provider that answered.
- The playbook lists what every trace event should carry, verbatim: `tenant_id, feature, prompt_version, model, input_tokens, output_tokens, estimated_cost, latency breakdown, retrieval top-k, reranker used, cache status, tool calls, retries, timeout status, final outcome`.
- Add the guardrail decision and its reason for this gateway.

- Observability is also a privacy decision. Logs that store full prompts store the customer's PII a second time.
- Redact before writing, sample the successes, keep every failure, and attach a retention period.
- Write telemetry asynchronously, because synchronous logging is a listed cause of a post-deploy latency jump.
- [Observability and Production Diagnosis](/design/observability-and-production-diagnosis#full-pack) develops this in sections 6 and 7.
- It also covers walking a cost spike in section 11.

Put six numbers on one dashboard *(own construction)*: spend so far today against the pacer line, p95 time to first token, fallback rate by provider, breaker state, guard block rate by rule, and cache hit rate. A change in any one of them has a named first question in sections 7 to 9.

## 11. Close the Data Residency Gap

The source ends on its own gap: "this design has no answer yet for data residency if the customer can't send data to a third-party provider at all." Its proposed next step is "an in-VPC or self-hosted model." Here is that answer built out *(own construction, grounded where cited)*.

Residency is a routing rule, not a network setting. The gateway already sees every model call, so it is the right place to enforce where data may go. Tag each request with a data class at the edge, from the customer's policy and the PII detector's findings. Each data class then maps to a pool of allowed providers.

| Data class | Allowed destination | What the gateway does |
|---|---|---|
| No PII, public content | Any approved provider | Normal routing and fallback |
| PII that can be masked | Any approved provider, after masking | Mask before the request leaves the network, not only on output, as the source's FDE track puts it |
| PII bound to a region | A provider endpoint in that region with contractual no-retention, or a model in the customer's VPC | Route only to that region's pool |
| Data that cannot leave the network | A self-hosted model inside the customer's VPC | Route only to the in-network pool |

- The sharpest consequence falls on failover. A fallback that crosses the boundary is a breach, not a recovery.
- The residency pool therefore needs its own fallback: a second in-region endpoint, a second self-hosted replica set, or degradation to a human handoff.
- Never fall back to the global pool to stay up.
- [Secure Multi-Tenant AI Platform](/design/secure-multi-tenant-ai-platform#full-pack) section 8 makes the same point at platform scale: a route sending protected data to an unauthorised region is a residency breach.

- A self-hosted model changes the cost model from tokens to GPU-hours. Size it with the air-gapped chapter's formula, `Replicas = ⌈(QPS × Tokens_request) / (TokensPerSecond_replica × UtilizationTarget)⌉`.
- When the answer exceeds the available hardware, change the workload, not the hardware request.
- [LLM Inference Serving](/design/llm-inference-serving#full-pack) covers batching and failover inside that pool, and [the air-gapped AI system](/design/air-gapped-ai-system) covers the fully disconnected case.

Telemetry follows the data. Traces and logs obey the same residency as the requests they describe. A hosted tracing product may be off limits, and the source flags the gap: only hosted tracing is shown in the worked examples, so a self-hostable tracing backend has to be built.

Say the trade-off aloud. The in-network model is usually weaker and slower than the frontier providers. The complex-turn share may need a human handoff sooner, and the $500 budget becomes a GPU-hour budget.
