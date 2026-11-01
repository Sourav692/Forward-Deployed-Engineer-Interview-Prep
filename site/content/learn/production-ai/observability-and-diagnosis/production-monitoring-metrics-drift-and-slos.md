# Production Monitoring: Metrics, Drift, and SLOs

*A trace explains one run after the fact, while monitoring watches thousands of runs for the change that comes before an incident.*

Per-run traces do not answer "is the system getting worse?" Aggregate the fields from [The Run Trace](/learn/production-ai/observability-and-diagnosis/the-run-trace) into metrics, compare them to a baseline, and set targets that page someone before a customer notices.

**Objectives:**

- choose the metrics, dashboards and trace fields a production GenAI system needs;
- alert on drift against a rolling baseline and attribute cost by tenant, workflow and model;
- write latency and quality targets on percentiles, with first-token, inter-token and total time as separate SLOs.

---

## Measure the Request Path, Not the Average

The cost and latency playbook calls a production GenAI system without cost and latency monitoring financially unsafe. Its metric list follows the request path. Measure request latency, first-token latency and total generation time. Count input and output tokens, then cost per request and per tenant, feature and user. Time retrieval, the reranker, each tool call and the vector store separately. Track agent step count, cache hit rate, retry and timeout rate, provider latency by model, queue depth and GPU utilisation. Add the customer's own ROI measures.

Read latency at the 95th and 99th percentiles, not the average. A healthy average hides the slow requests users remember.

Every trace event should carry enough to slice these metrics later. The playbook's list is tenant, feature, prompt version, model, input and output tokens, estimated cost and a latency breakdown. Add retrieval top-k, whether the reranker ran, cache status, tool calls, retries, timeout status and final outcome. Redact sensitive payloads and apply a retention policy.

## Build One Dashboard per Audience

Different people need different cuts of the same data. The playbook names five dashboards:

| Who is asking | Dashboard |
|---|---|
| The sponsor or CFO: what are we spending? | Executive cost |
| Engineers: which component is slow? | Latency by component at P50, P95 and P99 |
| The account team: how is this customer using it? | Tenant usage |
| On-call: what is broken right now? | Incident |
| AI engineers and product: is quality holding? | Model performance |

## Alert on Drift Before the Incident

Two questions a per-run trace cannot answer are drift and attribution.

**Drift alerting.** A sudden change in refusal rate, tool error rate or mean cost per run usually comes before a visible incident. A per-run budget that halts one runaway workflow is the same instinct applied to one execution. Drift alerting applies it across many runs over time: compare today with a rolling baseline and page when they diverge. A scheduled evaluation run is one input; production metrics are the other. At scale, a scheduled harness run that diffs leak count, refusal accuracy and groundedness catches quality regressions before a customer does.

**Cost attribution.** Expect the question "who pays for a runaway agent?" Totals by tenant, by workflow and by model answer it. The per-run cost-by-purpose field is the other half. The gap is a report and a bill, not a missing event.

## Watch the Four Ways Quality Fails Quietly

A web service fails with a 500 that an alert can catch. A model fails with a fluent, schema-valid answer that is wrong. The success rate can hold at 95% while users report that answers are getting worse. The cross-cutting quick reference names four patterns to watch, each with its own signal.

| What is going wrong? | Signal to track | First response |
|---|---|---|
| Are answers drifting away from the retrieved text? | Similarity between the embedded context and the embedded answer, as a weekly average | Roll back the last prompt or model change |
| Are relevant documents no longer surfacing? | Hit rate: share of queries with a relevant document in the top five | Re-index, check for new query topics, or re-embed |
| Is spend rising without more traffic? | Average tokens per query beside query volume | Look for prompt bloat, over-fetching, or retry loops |
| Is the system failing politely? | Share of "I don't know" answers | Log each as a capability gap and route to a human |

The worked numbers show the shapes. Answer-to-context similarity slides from 0.91 to 0.88 to 0.82 over three weeks, under a 0.85 floor. Hit rate falls from 85% to 78% to 65%, and the alert fires below 70%. Daily cost jumps from $135 to $280, a rise of more than 50%, while queries stay near 1,000 and tokens per query go from 450 to 1,200. The fixes there are a trimmed prompt, top-k cut from 10 to 5, and at most 2 retries per query. "I don't know" answers rise from 2% to 8%.

The last pattern is the easiest to miss. A polite refusal looks like a success to every error counter. Parse responses for it and count it as a gap, not a pass.

## Set Targets on the Right Percentiles

The repository's companion notes add metrics the playbook list leaves out. Each one prevents a specific misreading.

| Worry | Metric that answers it |
|---|---|
| Does the UI feel frozen before text appears? | Time to first token (TTFT) |
| Does the answer start fast, then drag? | Time per output token (TPOT), inter-token |
| How long until the answer is complete? | Total latency |
| How many requests actually met the target? | Goodput: successful requests per second under the SLO |
| Is caching saving real money? | Cache hit rate by cache type and weighted by tokens |
| Is the model slow, or is the system overloaded? | Queue wait and service time, separately |
| Is a slowdown coming? | Saturation and utilisation beside latency |
| Is the assistant pushing work back to people? | Escalation and human-override rate, as cost metrics |

Treat TTFT, TPOT and total time as three separate service-level objectives (SLOs). A system doing 100 requests per second where 30% blow the latency budget has a goodput of 70. A 60% hit rate on tiny requests saves almost nothing, which is why the hit rate must be token-weighted.

Latency curves bend sharply past about 70 to 80% utilisation. A rising P99 with a flat P50 usually means queueing, not a slower model.

## Keep Monitoring Off the Hot Path

Observability has its own cost. Synchronous logging is a listed cause of a latency jump after a deploy. Log asynchronously, sample where full tracing is too expensive, and prefer structured metrics over raw payloads. Set retention by privacy policy.

> **Warning: averages hide the incident.** A dashboard of mean latency can look flat while P99 doubles. Alert on P95 and P99 regressions and on spend anomalies, and do it before launch, not after the first invoice.

## Worked Example: A Dashboard and SLO Spec

An internal support assistant is going to production. The spec separates three latency targets: first token, inter-token and total, each at P95. The engineering dashboard breaks latency down by component so a regression points at retrieval, reranking or the model.

Cost is attributed by tenant, workflow and model, with a spend-anomaly alert. Drift alerts compare refusal rate, tool error rate and cost per run against a rolling baseline. A nightly evaluation run feeds the same alerting. Cache hit rate is token-weighted. Queue wait is charted beside service time.

When P99 rises with a flat P50 a month later, the queue chart shows it is load, not the model. The spec turned a vague "it feels slow" into one chart and one decision.

---

## Key Takeaways

- Measure every stage of the request path, read latency at P95 and P99, and put enough fields on each trace event to slice the metrics later.
- Build separate dashboards for cost, component latency, tenant usage, incidents and model quality.
- Alert on drift against a rolling baseline, and attribute cost by tenant, workflow and model.
- Track answer-to-context similarity, retrieval hit rate, tokens per query, and the "I don't know" rate, because each failure looks like success to an error counter.
- Set TTFT, TPOT and total latency as separate SLOs, and track goodput, token-weighted cache hits, queue wait and utilisation.
- Keep telemetry asynchronous and sampled so monitoring does not become the slowdown.

## Check Yourself

<details>
<summary>1. P99 latency is rising but P50 is flat. What is the most likely cause, and which chart confirms it?</summary>

Queueing under load, not a slower model. Charts of queue wait against service time, and of utilisation, confirm it.

</details>

<details>
<summary>2. What two questions can a single run trace not answer, and what answers them?</summary>

Whether behaviour is drifting over time, answered by drift alerts against a rolling baseline; and who pays, answered by cost aggregated by tenant, workflow and model.

</details>

<details>
<summary>3. Your cache hit rate is 60%, yet cost barely moved. What metric was missing?</summary>

A token-weighted hit rate. If the hits are small requests, a high count saves little money.

</details>

