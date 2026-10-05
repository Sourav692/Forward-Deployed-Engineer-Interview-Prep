# Observe the Running Service

*Logs and metrics must capture enough to explain every slow or wrong answer without storing the private data inside the prompts.*

◷ 5 min

A running process is not proof of a healthy service. Log the structure of every request, measure quality and cost beside latency, and probe the dependencies the service cannot work without.

**Objectives:**

- log prompts and answers without leaking private data;
- choose the metrics and alerts for a FastAPI LLM service;
- design separate liveness and readiness probes;
- find the cause of a latency spike.

---

## Log the Structure, Not the Content

Prompts and answers carry private data, so a log of raw text is a leak waiting to happen. Log the structure of each request instead: trace id, user id, a SHA-256 hash of the prompt and of the response, token counts, model, latency and cost.

Store full content only when the user has consented. Keep it in a separate, encrypted, restricted-access store with an audit trail. Before anything is logged, redact personal data with a tool such as Presidio, which swaps names, emails and similar values for tags like `[EMAIL]`.

Set retention by purpose. Keep raw content for a short time. Keep structural metrics such as tokens, latency and cost longer, because planning and billing need them.

## Measure Quality and Cost Beside Latency

Standard web metrics are not enough for an LLM service. With Prometheus counters, histograms and gauges, track four groups:

| Worry | Metrics |
|---|---|
| Is it fast, and where is it slow? | Request count by endpoint and status, a latency histogram, active requests, and stage-level latency such as retrieval time against LLM call time |
| What is it costing? | Total tokens, input against output, and cost per model |
| Are the answers still good? | Faithfulness score, cache hit rate, top-1 retrieval similarity score |
| What is failing? | LLM errors by type, rate-limit hits by user tier |

Alert on the values that mean trouble. The source's examples are P99 latency above 15 seconds, error rate above 2%, faithfulness below 0.82, and hourly cost above twice the average.

## Separate Liveness From Readiness

An expired API key or a disconnected vector database breaks the service while the process keeps running. So ask two different questions with two probes.

The **liveness probe**, at `/health/live`, asks whether the process is alive. Keep it simple and fast; it fails only when the process is stuck or crashed. The **readiness probe**, at `/health/ready`, asks whether the service can handle traffic. It checks the database, the vector store, the LLM API with a light call such as listing models, and Redis. If any is down, it returns HTTP 503 and the instance leaves rotation.

In Kubernetes, give readiness a longer `initialDelaySeconds`, for example 30 seconds, to leave time for model loading. Set a `failureThreshold` as well, so one slow check does not pull an instance.

> **Warning: a running process can still be a broken service.** An expired key passes every liveness check. Only a readiness probe that calls each dependency notices, so never let liveness stand in for readiness.

## Alert on Percentiles and Time Every Stage

The average can look fine while 5% of users wait 30 seconds. Alert on P95 and P99 instead, with a Prometheus alert built on `histogram_quantile`.

Record embedding, retrieval and generation time for every request. Then a spike points to the stage that slowed down. Add anomaly detection on the latency series to catch a sudden jump, such as from 2 to 8 seconds. Finally, correlate the spike with the LLM provider's status page, recent deployments, longer prompts, and error or retry rates.

## Worked Example: A Tuesday Latency Spike

At 14:00 the P99 alert fires: P99 latency has crossed 15 seconds. The average is still near 3 seconds, so an average-based alert would have stayed silent.

The stage timings show embedding and retrieval unchanged and generation time tripled. Readiness is green, so every dependency answers. The rate-limit hit counter and the retry rate have both jumped, and the provider's status page reports degraded performance. Nothing was deployed that day.

The logs help without exposing anyone. Each slow request carries a trace id, token counts, model and latency, and its prompt appears only as a SHA-256 hash. The team confirms the slow calls are ordinary prompts, not unusually long ones.

The diagnosis is the provider, reached in minutes, because every signal pointed at one stage and one dependency.

---

## Key Takeaways

- Log trace id, user id, hashes, tokens, model, latency and cost; keep consented full content in an encrypted, audited store, and redact personal data first.
- Track latency, cost, quality and error metrics together, with alerts on P99, error rate, faithfulness and hourly cost.
- Liveness asks whether the process is alive; readiness checks every dependency and returns 503 when one is down.
- Alert on P95 and P99, time every stage, and correlate spikes with the provider, deployments, prompt length and retries.

## Check Yourself

1. **What do you log for each LLM request if you cannot log the prompt text?**
   Trace id, user id, SHA-256 hashes of prompt and response, token counts, model, latency and cost.

2. **The LLM API key expired. Which probe should fail, and with what status?**
   The readiness probe, returning HTTP 503, so the instance leaves rotation. Liveness stays green because the process is still alive.

3. **Why alert on P99 rather than average latency?**
   The average can look fine while a slice of users waits far longer. P95 and P99 show what the slowest requests experience.

## References

**Sources:** `Module_10_Backend_FastAPI_Deployment.md` (GenAI Engineering Modules), Topic 4: "How do I log prompts and answers without leaking private data?", "Which metrics should I monitor for a FastAPI LLM service?", "How do I design health checks for AI services?" and "How do I catch latency spikes?".
