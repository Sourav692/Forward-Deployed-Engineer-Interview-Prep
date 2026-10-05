# Diagnosing Production Incidents

*Guessing at a fix is fast and usually wrong, while a fixed debugging sequence feels slower and finds the real cause first.*

◷ 5 min

An incident answer is scored on its sequence, not on the fix it lands on. Clarify, measure, isolate, mitigate, prevent and communicate, using the traces and metrics from [Production Monitoring](/learn/production-ai/observability-and-diagnosis/production-monitoring-metrics-drift-and-slos) as evidence.

**Objectives:**

- walk any production incident through one fixed set of steps;
- start diagnosis from a trace waterfall rather than a guess about the model;
- separate a quality drop, a latency jump and a provider problem by what each changes in the data.

---

## Follow the Same Steps Every Time

The cost and latency playbook runs every incident through the same shape. State the symptoms. Ask clarifying questions. List probable causes. Pick the metrics to check. Debug. Apply an immediate fix, then a long-term fix. Add prevention. Communicate with the customer.

The playbook's own framing is that the point is not memorised fixes. The point is to show a senior debugging sequence. A candidate who follows it on an unfamiliar incident scores better than one who recites the right fix for a familiar one.

The communication step is the same in every case. Acknowledge the impact. Show the measured cause. Give the immediate mitigation. Then explain the long-term prevention and the metric that will prove it worked.

## Ask What Changed Before Asking What Broke

Most incidents follow a change. The clarifying questions all ask what moved: retrieval, the reranker, the prompt version, the model, the provider, a tool dependency or the region.

The run trace makes these cheap to answer. The prompt version is on every trace. The `degraded` flag shows when an answer came from a fallback. Cost by purpose shows which stage grew.

## Read the Trace Waterfall, Not the Average

Build a latency waterfall from distributed traces. Mark auth, retrieval, reranking, prompt build, first token, generation, tool calls, post-processing, logging and the network return. Then optimise the slowest component at P95 and P99.

Latency is a chain. Improving one link does nothing if another dominates. The waterfall shows which link dominates.

## Start a Wrong-Answer Hunt From One Trace

"No error logs" usually means a silent wrong answer, not a crash. Pull the run from the tracing backend and read each step's input and output in order. Check the retrieval results, the exact prompt sent and the raw model output. Re-running the whole pipeline blind wastes time and may not reproduce the problem.

When quality drops with no deploy at all, suspect the provider. A model provider can change what a model version points to with no change on the team's side. A nightly evaluation run against the last known-good baseline catches this. A gate that only runs on the team's own commits does not.

## Know What Your Own Instruments Hide

Some dashboards lie in predictable ways. During an outage, an error-rate chart fed only by circuit-breaker calls can show a flat line instead of a spike. An open breaker rejects calls without touching the dependency, so the dependency's errors are never recorded. Log the trip time separately when that number matters.

Retries hide too. Retries are invisible to product metrics unless traced, so spend spikes during incidents with no matching traffic change.

> **Warning: a PII leak in an answer is rarely in one place.** Contain it first: tighten the output check for the pattern that slipped through. Then check whether it came from the current turn or from something cached or logged earlier. Audit logs, traces and caches, because the same data usually sits in the observability stack too.

## Worked Example: Quality Dropped Overnight

The interview probe is "quality dropped overnight: walk me through it." Start with clarifying questions. Did anything deploy? Which tenants and query types are affected? Is it refusals, wrong answers or slow answers?

Next, check the change log the traces carry. If the prompt version changed, compare quality by version; the fix is a rollback. If nothing on our side changed, compare tonight's scheduled evaluation run with the baseline. A drop there with no commits points at a provider-side model change. If the `degraded` flag is up, a fallback model has been answering during an outage.

Then open individual traces for failing questions. Read retrieval results, the prompt and the raw output in order. Mitigate immediately with a rollback, a pinned model version or a disabled optional step. Prevent recurrence with a drift alert on the metric that moved and a nightly regression run. Close with the customer: impact, measured cause, mitigation, prevention and the metric that will show it holds.

The sequence found the cause without guessing at the model, and every step used a field the trace already had.

---

## Key Takeaways

- Run every incident through symptoms, questions, causes, metrics, debugging, immediate fix, long-term fix, prevention and communication.
- Ask what changed first, because the trace already records prompt version, degradation and cost by stage.
- Diagnose latency from a component waterfall at P95 and P99, not from averages.
- Start a wrong-answer investigation from one trace, and use scheduled evaluation to catch provider-side drift with no deploy.
- Know that open circuit breakers and silent retries distort dashboards, and that a PII leak must be chased into logs, traces and caches.

## Check Yourself

1. **During an outage, your error-rate dashboard shows a suspicious flat line. Why?**
   Calls go through an open circuit breaker, which rejects them without touching the dependency. Its errors are never recorded, so the breaker's trip time must be logged separately.

2. **Quality fell overnight and nobody deployed anything. What do you check?**
   Compare the scheduled evaluation run with the last known-good baseline. A drop with no commits suggests the provider changed what a model version points to.

3. **What is the one customer-communication sentence the playbook reuses for every incident?**
   In substance: acknowledge the impact, show the measured cause, give the immediate mitigation, then explain long-term prevention and the success metric.

## References

**Sources:** `CRAM_SHEET_S15_S16.md` (cost and latency playbook notes): §0 shape A, incident 2 (latency 2s to 20s). `CRAM_SHEET_FULL_PLAYBOOK.md`: §3 method and latency chain. `CORE_8_DRIVERS_MEMORIZE.md`: driver 6 retries. `12_production_and_operations_INTERVIEW_TUTORIAL.md`: §2 gotcha "A circuit breaker in `OPEN` never touches the dependency"; §4 questions 4 and 8 (external answers not reused). `03-cost-latency-cicd-rigor-and-build-vs-buy.md` (Production and Platform Judgment): §3 nightly regression runs. `08_Observability.md` (FDE Handbook, enterprise RAG): prompt version and degradation visibility.
