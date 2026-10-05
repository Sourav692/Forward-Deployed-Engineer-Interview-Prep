# The Run Trace

*A trace rich enough to replay any run is also rich enough to leak, so capture everything the three audiences need and redact the rest.*

◷ 6 min

A per-step trace is a debugging aid; a run trace is the system's record of what it did. Build one replayable record per request, on top of the signals from [Logs, Metrics, and Traces](/learn/production-ai/observability-and-diagnosis/logs-metrics-and-traces), and treat a run without one as a run that did not happen.

**Objectives:**

- design one trace record that serves the engineer, the auditor and finance;
- attribute cost by purpose, not only in total;
- read the security and degradation fields as alerts, and keep sensitive payloads out of the trace.

---

## Serve Three Audiences With One Record

In an access-controlled system, the trace answers three different people. The engineer debugging a bad answer asks which strategy ran, what was retrieved, what the reranker scored and what the grader said. The auditor asks whether this user ever saw that document. The finance team asks which tenant is burning the budget.

One record for all three is cheaper than three systems. It also means the auditor and the engineer look at the same facts. In the handbook's enterprise RAG build that record is a `RunTrace`, and a run that is not traced did not happen.

| Section | What it holds |
|---|---|
| Identity | `run_id`, principal, tenant, timestamp, `PROMPT_VERSION` |
| Authorisation | The compiled access filter and a readable explanation of it |
| Planning | Sub-questions, generated multi-queries, the HyDE passage |
| Retrieval | Which strategy ran; candidate chunk ids with `retrieved_by` provenance |
| Enforcement | Allowed, denied (with the rule), redacted, audit events, security events |
| Generation | Grade verdict and coverage note, cached or not, the draft |
| Verification | Dropped citations, surviving citations, groundedness score |
| Steps | Every named step with start, end and duration in ms |
| Cost | Prompt, completion and embedding tokens, call count, USD, in total and by purpose |
| Outcome | Answer or refusal, and a `degraded` flag |

`RunTrace.start(name)` and `end(name)` bracket each step. `finish(usage)` copies token and cost totals in. `write()` saves one JSON file per run. `timeline()` draws a bar chart of step durations, which is the first thing to read when a run is slow.

## Tally Cost by Purpose

A total says a run cost 2 cents. It cannot say what to change. The LLM client's `Usage` object counts tokens by purpose: `rewrite`, `hyde`, `rerank`, `grade`, `synthesis`, `groundedness` and `embed`.

That breakdown turns "2 cents" into "60% of it was the reranker". That number justifies swapping the LLM reranker for a cross-encoder. The same tally feeds a per-run cost ceiling in the generation step.

## Stamp the Prompt Version on Every Run

When answer quality shifts, the first question is "did the prompt change?" With `PROMPT_VERSION` on every trace, the trace answers it without a deploy log. Without it, the answer is an archaeology project. Prompt versioning with rollout and rollback builds on this one field; see [AgentOps](/learn/production-ai/agentops).

## Read Some Fields as Alerts, Not Logs

The trace makes three things possible beyond debugging.

**Replay.** The evaluation harness replays golden questions and scores the traces. A trace holds everything needed to re-derive every metric.

**Security signal.** A non-empty `filter_disagreements` field means the second enforcement layer denied something the first should have caught. That points to a stale index or a broken filter. Page someone; do not just log it.

**Degradation visibility.** The `degraded` flag, and the step that set it, say an answer was produced during a provider outage. That is different from a bad answer, and the dashboards should keep them apart.

## Redact Before You Store

The run trace is detailed on purpose, which makes it a privacy risk. The cost and latency playbook lists logging and tracing as a cost driver of its own. Full prompts, completions, embeddings and traces grow storage bills. Synchronous telemetry writes also slow the request path.

Keep the structure and drop the rest. Redact sensitive payloads, sample where full tracing is too expensive, apply a retention time-to-live, and prefer structured metrics over raw payloads. Write telemetry asynchronously. The trade-off is real: too little detail slows incident analysis, so keep enough to explain an incident.

> **Warning: a trace is a second copy of every prompt.** Logging prompts without redaction is the classic observability mistake. When PII leaks into an answer, assume it also sits in your logs, traces and caches, and redact there too.

## Worked Example: A Run That Cost Too Much

A tenant's runs suddenly cost three times more. The engineer opens one trace. The identity block shows the tenant and the prompt version, which has not changed. The steps block shows the rerank step taking most of the time. The cost-by-purpose block shows most tokens spent on `rerank`.

The same trace answers the auditor. The enforcement block lists every allowed and denied chunk and the rule that decided it. Finance rolls up the cost blocks by tenant without asking engineering for anything.

One record gave three teams their answer. The cost-by-purpose field told the engineer which component to swap before anyone touched the model.

---

## Key Takeaways

- Design one replayable record per run that answers the engineer, the auditor and finance from the same facts.
- Attribute cost by purpose so a total becomes a decision about a specific component.
- Stamp the prompt version on every trace so "did the prompt change?" has an instant answer.
- Treat filter disagreements and the degraded flag as alerts, and use traces as the input to evaluation replay.
- Redact, sample and expire trace data, and write it asynchronously, while keeping enough detail for incidents.

## Check Yourself

1. **Name the three audiences of a run trace and one question each asks.**
   The engineer: which step produced this bad answer? The auditor: did this user ever see that document? Finance: which tenant is burning the budget?

2. **What does a non-empty `filter_disagreements` field mean, and what should happen?**
   The second enforcement layer denied something the index filter should have caught, so the index is stale or the filter is broken. It should raise an alert, not sit in a log.

3. **Why is cost tallied by purpose and not only in total?**
   A total cannot tell you what to change. A per-purpose split shows, for example, that the reranker is 60% of the cost, which justifies replacing it.

## References

**Sources:** `08_Observability.md` (FDE Handbook, enterprise RAG): "Three audiences, one artefact", "What a `RunTrace` holds", "Cost attribution by purpose", "Prompt version on every run", "What the trace makes possible", Interview lens. `CORE_8_DRIVERS_MEMORIZE.md` (cost and latency playbook notes): driver 7, logging, tracing and observability overhead. `12_production_and_operations_INTERVIEW_TUTORIAL.md`: §4 question 8 (PII leak also sits in logs, traces and caches; the external answer is not reused).
