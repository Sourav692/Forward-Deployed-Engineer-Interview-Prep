# Practise Observability and Diagnosis Interview Questions

*Knowing every signal is not the same as using them under pressure, so rehearse answers that name the signal, the reason, and the next step.*

Interviewers probe observability through incidents, not definitions. Answer each question below aloud first, then compare with the answer, which uses only the concepts from the earlier lessons in this module.

**Objectives:**

- answer the common observability and diagnosis questions in under a minute each;
- tie every answer to a specific signal, field or metric;
- volunteer the gap or trade-off before the interviewer asks.

---

## Explain the Signals

**"What is the difference between logs, metrics and traces?"**
Logs say what happened to one request. Metrics say how often things happen across all requests. Traces show each step of one run in order, so they explain why. A production system needs all three. See [Logs, Metrics, and Traces](/learn/production-ai/observability-and-diagnosis/logs-metrics-and-traces).

**"You inherit a deployment with no monitoring. What is the fastest thing to add?"**
Structured JSON logging plus a lightweight metrics collector. Both are cheap, need no new infrastructure, and give immediate visibility. Tracing comes next.

**"Who reads a run trace, and why design one record for them?"**
The engineer debugging a bad answer, the auditor checking who saw what, and finance attributing cost. One record is cheaper than three systems, and it means everyone argues from the same facts. See [The Run Trace](/learn/production-ai/observability-and-diagnosis/the-run-trace).

## Defend the Design

**"Why does the format of a trace matter once a customer is involved?"**
A bespoke format needs a custom integration for every customer's monitoring stack. Standard spans with IDs, parent IDs and timings carry the same fields as attributes and plug into tools the customer already runs.

**"The customer's compliance team says logs cannot leave their network. What is your tracing plan?"**
A self-hostable tracing backend inside their network. The repository only demonstrates a hosted tracer, so name that honestly as a gap to build.

**"The customer wants an audit trail for compliance. How far do logs and traces get you?"**
Most of the way: structured logs and traces record who asked, what the policy decided and what was returned. A real compliance trail also needs a retention policy and access controls on the trail itself, which the repository's notebooks do not cover.

**"Why tally cost by purpose rather than only in total?"**
A total cannot say what to change. A split by rewrite, rerank, grade, synthesis and so on shows, for example, that the reranker is 60% of the cost.

## Diagnose the Incident

**"Your LLM bill tripled overnight with no traffic increase. How do you find the leak?"**
Treat it as a change in request shape, not user count. Break spend down by tenant, feature, model and prompt version, and compare before and after. Check whether routing sent everything to the expensive model, whether the cache hit rate collapsed, and whether a prompt change made requests longer. Then instrument per-request cost so the next spike is visible in minutes, not on the invoice.

**"A production agent returns wrong answers and there are no error logs. Walk me through debugging it."**
"No error logs" means a silent wrong answer, not a crash. Pull one failing run's trace and read each step in order: retrieval results, the exact prompt and the raw model output. The trace isolates which stage went wrong without re-running the pipeline blind.

**"Quality dropped overnight. Walk me through it."**
Ask what changed. If the prompt version changed, compare quality by version and roll back. If nothing changed on our side, compare the nightly evaluation with its baseline; a drop with no commits suggests provider drift. If the degraded flag is up, a fallback has been answering. Then read failing traces, mitigate, add a drift alert, and report impact, cause, mitigation and prevention. See [Diagnosing Production Incidents](/learn/production-ai/observability-and-diagnosis/diagnosing-production-incidents).

**"PII leaked in a model's output despite your output validator. What is your incident response?"**
Contain it by tightening the output check for the pattern that slipped through. Find whether the PII came from this turn or from something cached or logged earlier. Then audit logs, traces and caches, because the same PII is usually stored there too, and redact.

**"Your moderation layer shows zero flags for a week. Is that good news?"**
Not necessarily. Check whether it runs on input, output or both, and whether the traffic contained anything its fixed harm categories would ever catch.

## Set Targets and Alerts

**"What metrics would you put on the SLO?"**
First-token, inter-token and total latency as separate targets at P95 or P99, plus goodput under the target. Add cost per request, token-weighted cache hit rate, retry and timeout rate, and escalation rate. See [Production Monitoring](/learn/production-ai/observability-and-diagnosis/production-monitoring-metrics-drift-and-slos).

**"How do you catch a problem before customers see it?"**
Drift alerts on refusal rate, tool error rate and cost per run against a rolling baseline, plus a scheduled evaluation run. Sudden changes in those usually come before a visible incident.

> **Warning: do not answer an incident question with a fix.** "I would switch to a bigger model" before any measurement is the weak answer in every playbook case. Clarify and measure first, even if you already suspect the cause.

## Worked Example: A One-Minute Answer

Question: "Latency jumped from 2 seconds to 20 seconds after a deploy."

Answer: "I would not guess. I would pull the trace waterfall for slow requests and compare component timings before and after the deploy. That shows whether the 18 extra seconds are retrieval, the reranker, the model, a tool or infrastructure. A new reranker, a larger context, a provider incident, cold starts, a tool timeout or synchronous logging are the usual suspects. Immediately I would roll back the prompt or reranker change, disable the optional tool, or switch to the fallback provider. Long term I would add per-component latency budgets, canary deploys and performance tests at realistic payload and corpus size."

The answer names the evidence first, the candidates second and the fix last. That order is what the interviewer is scoring.

---

## Key Takeaways

- Explain each signal by the question it answers and add the cheapest monitoring first.
- Defend standard spans, per-purpose cost and self-hosted tracing as design choices with stated gaps.
- Diagnose incidents by asking what changed, then reading traces, then mitigating and preventing.
- Set SLOs on percentiles and separate latency phases, and alert on drift against a baseline.

## Check Yourself

<details>
<summary>1. Why is "switch to a bigger model" a weak first answer to a cost or latency incident?</summary>

It changes one knob without measuring. The strong answer decomposes the path with traces and cost attribution, then fixes the largest measured driver.

</details>

<details>
<summary>2. Name two metrics that should be separate SLOs for a chat assistant.</summary>

Time to first token and total latency (and inter-token time). Each fails for different reasons and needs its own target.

</details>

<details>
<summary>3. What do you say when a customer's logs may not leave their network?</summary>

Propose a self-hostable tracing backend in their network, and state that it is a gap to build rather than something already demonstrated.

</details>

