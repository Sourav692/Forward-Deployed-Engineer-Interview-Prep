# Observability and Production Diagnosis for a Customer-Facing AI Application, part 3

## 11. Walk Through the Cost Spike

Production GenAI systems fail economically as well as technically. Incident #88 produced no quality complaint at all. The only symptom was a budget alert.

**Setting.** An executive dashboard copilot summarises revenue, pipeline, customer-risk notes and operational metrics. The path is UI → metrics API → CRM-note retrieval → prompt assembler → semantic cache → LLM gateway → cost attribution. The cache key should include tenant, dashboard type, date range, normalised query and data snapshot ID. The router picks a mid-tier or larger model by context size and sensitivity.

**Symptom.** On 2026-07-08 the daily budget alert fired at 14:20. The CFO asked why the assistant had consumed almost four days of budget before lunch.

**Telemetry.**

| Signal | Value |
|---|---|
| Spend | $240 daily budget; $912 actual; $1680 projected by end of day |
| Deltas | Cost +280% (3.8×); requests +7%; input tokens +351% |
| Prompt template | `exec_summary_v6`; average context 4200 → 19000 tokens |
| Context contents | `all_notes_90d` instead of `top_20_notes_30d`; 500 table rows instead of a cap of 80; compression disabled |
| Cache | Hit rate 4% against a 67% baseline; key v5 = `[tenant_id, query_text]`; missing date range, snapshot ID, role scope |
| Routing | GPT-4-class because `context_tokens>12000`; 21384 tokens in, 1288 out; about 9× the per-request cost of before (the case's illustrative $2.74 against $0.31, not list prices) |

**What changed.** The `exec_summary_v6` upgrade added "more supporting context" after executives asked for richer explanations. The same release changed cache-key normalisation and dropped the date-range and snapshot fields. It also disabled compression while debugging a formatting issue.

**Root cause.** Three effects multiplied. The template expanded context. The larger context crossed the routing threshold into the expensive model. The cache-key regression collapsed the hit rate, so the system paid full price for every large prompt.

**Debugging path.** Start with cost per workflow, not global provider spend. Compare request count, input and output tokens, model route, cache hit rate and prompt version before and after the deploy. Sample traces to see what was assembled. Check whether the added context improved answers enough to justify its cost.

**The hidden correctness bug.** The key also lost `role_scope`. One user's executive summary could be served to another role whenever the query text matched. A cost incident turned out to be a permission incident too.

**Fix.** Now: roll back `exec_summary_v6`, restore compression, cap CRM notes and table rows, and force the mid-tier model for routine summaries. Invalidate every cache entry written under `cache_key_version=v5`. Later: add cost regression tests to CI and enforce per-workflow token budgets. Require cost and latency approval for template upgrades, track hit rate by version, and route with budget awareness and graceful degradation.

> *"The telemetry shows usage grew only 7%, but input tokens grew 351%, cache hit rate dropped to 4%, and requests started routing to a GPT-4-class model. I would roll back the prompt template, restore compression, cap context, fix the cache key, and add CI gates for token and cost regression. I would also audit cache safety because missing `role_scope` can create data exposure."*

The weak answer is "ask users to make shorter queries or switch to a cheaper model." It blames usage that grew only 7%.

## 12. Answer the Neighbouring Prompts With the Same Traces

Three prompts in the group look different and use the same instrument. Each one is answered by reading the anchor's traces at a different depth.

**#53, latency regression.** "An enterprise customer reports that responses have become slow." First clarify which latency: time to first token, time between tokens, total completion time, or user-perceived latency. Then decompose across ten stages: client and network, authentication, middleware, retrieval, prompt construction, model prefill, token generation, tool calls, post-processing and streaming. Check input and output token counts and retrieval p95 and p99. Then check retry rates, rate-limit throttling and traffic patterns. Finish with model version, prompt changes, cache hit rates and regional routing. Incident #87 is this prompt with real numbers.

The follow-up is "it only happens at peak traffic." Peak-only latency points at queueing, not a slower model. Separate queue wait from service time. Queueing delay climbs steeply as utilisation nears 100%; for a simple queue the wait is about 4× service time at 80% and 9× at 90%. A rising p99 with a flat p50 usually means queueing. Add admission control and shed non-interactive work to batch *(the utilisation point comes from the additions file, section D; the multiples are simple single-queue arithmetic)*.

**#54, RAG with poor answer quality.** Separate seven failure classes: retrieval, context assembly, reasoning or synthesis, prompt or instruction, output format, evaluation, and user experience. Measure each separately. Use recall@k, precision@k and MRR or nDCG for retrieval. Use citation correctness and context sufficiency for assembly. Use answer faithfulness, answer relevance and abstention quality for generation. Use end-to-end task success for the whole. The section 9 flowchart is the first cut; these metrics are the second.

The follow-up is "would you fine-tune the model?" Classify the problem first. A knowledge problem is usually retrieval or data access. A behaviour problem is prompting, fine-tuning or structured output. A freshness problem is indexing and the data pipeline. A permission problem is access-control-aware retrieval. Fine-tuning mainly helps the second; it is a poor fix for the other three.

**#74, diagnose high latency in an LLM inference pipeline.** This is the layer below the application. Walk the full stack: tokenization, network, batch size, KV cache, post-processing. Two facts carry the answer *(from the additions file, section B)*. Prefill processes the whole prompt in parallel and sets time to first token, so it scales with input tokens. Decode generates one token at a time and sets tokens per second, so it scales with output tokens. A frozen UI points at prompt size, retrieval and queueing. An answer that starts fast then drags points at output length.

Batch size trades throughput for per-request latency. With continuous batching nothing waits to fill; each decode step just gets slower as more sequences share it. The KV cache holds attention state for tokens already processed. Its memory caps how many sequences fit on a GPU at once, and a full cache forces queueing or preemption. Post-processing is usually small, but a synchronous evaluator or logger on the hot path is not. The same stack walk anchors G20 on inference serving, so prepare it once.

## 13. Roll Out in Four Phases With Named Owners

Observability fails socially before it fails technically. If no one owns a signal, no one owns the decision. So the rollout has names, gates and exit criteria, not only components.

| Phase | Owner | Exit criterion |
|---|---|---|
| 1. Define user-facing SLOs first | Product and engineering, with the customer signing off | Agreed latency targets, acceptable failures, support boundary, definition of a customer-visible incident. No agreement, no wider release |
| 2. Instrument one critical path | The primary service team, with platform support | One representative request traced end to end through auth, retrieval, model, tool and response assembly |
| 3. Add the trace-linked support workflow | Support engineering or customer success, with on-call defined | A support agent moves from a complaint to a trace without asking the user for raw prompts |
| 4. Add quality and cost signals with sampling | The observability platform owner, with model and product owners setting thresholds | Enough signal to detect regressions, sampling only what is needed |

The answer key gives a weekly version. SLOs come in weeks 0-1 and measurable "slow" and "wrong" in weeks 1-2. One path follows in weeks 2-3 and redaction scanning in weeks 3-4. The support workflow lands in week 5, then quality and cost signals in weeks 6-8.

| Metric | Calculation | Owner | Alert when |
|---|---|---|---|
| Availability SLO | Successful requests / total, excluding agreed out-of-scope failures | Application engineering with platform | The burn rate threatens the SLO |
| Latency SLO | Latency at the agreed percentile, usually p95 or p99 | Application engineering | Sustained breach, or a breach after a release or canary |
| Retrieval and tool success | Successes / attempts, by dependency and tenant | The owning service team | Below baseline, or a sudden shift in failure class |
| Token cost | Tokens per successful request, or cost per tenant per day | Product operations or finance partner | Consumption rises faster than traffic, or exceeds budget |
| Quality-event rate | Visible failures, escalations, reviewed bad outputs / sessions | Product and ML engineering | A meaningful rise after any release or config change |
| Trace coverage | Traced requests / expected requests on the critical path | Observability platform | Below the minimum needed for the top failure path |
| Telemetry overhead | Added latency, compute, storage, network versus baseline | Platform and SRE | Overhead materially raises latency or cost |
| Mean time to diagnose | First report or alert to a credible root-cause hypothesis | On-call engineering and support operations | Stops improving, or exceeds the response target |

The go/no-go gate is explicit. If trace coverage falls below the minimum or overhead moves latency, the release pauses. Rollback triggers are concrete: loss of trace propagation, a spike in quality-event rate, or an unsustainable cost slope.

Decide what is product, adapter, service or configuration. Per-customer sampling rates, retention windows and alert thresholds are configuration. Ticketing and alerting integrations are adapters. Collection, redaction, correlation propagation and the access gateway are a shared service. The request lifecycle, outcome tags and the minimal schema are core product. That split keeps customer edge cases out of the core.

Launch readiness needs a canary on one tenant or slice and a fast rollback switch. Keep old and new trace schemas interoperable during migration. Train support on what a healthy trace looks like, and publish an ops guide with metric definitions, access rules and rollback steps. Have three artifacts ready before launch: an evidence policy, a response runbook and an access review.

| Risk | Owner | Mitigation | Trigger |
|---|---|---|---|
| Sampling drops the only bad trace | Observability platform | Bias sampling toward error paths and reported incidents | Support cannot find evidence for an acknowledged failure |
| Telemetry becomes the bottleneck | Platform and SRE | Cap attributes, bound storage, monitor overhead | Latency or cost rises after instrumentation changes |
| Support sees too much or too little | Security and support engineering | Role-based access, redaction, audit logging | Sensitive content in support artifacts, or triage stalls |
| Quality signals are noisy | Product and ML engineering | Separate objective service metrics from subjective labels | Alerts fire on expected experimentation |
| Adoption mistaken for success | Product | Track task completion and business outcome | Usage rises while escalations and manual work stay flat |
