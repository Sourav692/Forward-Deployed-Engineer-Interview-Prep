# Logs, Metrics, and Traces

*Each signal is cheap to add on its own, but only the three together say what happened, how often, and why.*

Observability is not one log file. A log answers "what happened to this request", a metric answers "how often does it happen", and a trace answers "why, step by step".

**Objectives:**

- tell logs, metrics and traces apart by the question each one answers;
- add structured logging and a metrics collector to an unmonitored service;
- use callback hooks and a tracer to make a multi-step chain debuggable after the fact.

---

## Ask Three Different Questions of One Call

One LLM call produces three kinds of evidence. A structured log line records what happened on this request. A metrics counter records how often things happen across all requests. A trace span records each step in order, so a wrong answer can be traced to the step that caused it.

Production needs all three. Logs cannot show a trend without aggregation. Metrics cannot explain one bad answer. A trace explains one run but does not page anyone when the error rate doubles.

| Question a worried person asks | Signal that answers it |
|---|---|
| What happened to this customer's request? | Structured JSON log |
| Is the error rate or latency getting worse? | Metrics counters and rates |
| Which step produced the wrong answer? | Trace with one span per step |

## Log in a Shape a Machine Can Read

The production-operations tutorial renders every log record as one JSON object, so a log aggregator can filter and group it. Beside it, a small `MetricsCollector` keeps counters for requests, errors, latency, tokens and cache hits, and derives rates on demand.

```python
class MetricsCollector:
    def record_request(self, latency_ms, input_tokens, output_tokens, error=False, cache_hit=False):
        self.metrics["requests_total"] += 1
        self.metrics["latency_sum"] += latency_ms
        if error:
            self.metrics["errors_total"] += 1
```

Know the limit of the tutorial's numbers. Its `InstrumentedLLM` estimates tokens as `len(text.split()) * 4 // 3`. That is a word count, not a tokenizer. It is good enough for trends and wrong for billing.

On an inherited deployment with no monitoring at all, add exactly this first. Structured JSON logs plus a lightweight metrics collector need no new infrastructure and give immediate visibility.

## Attach Instrumentation Through Callbacks

A callback handler is where logging, metrics and streaming attach without touching the chain's own code. Subclass the base handler and override the start, new-token, end and error hooks. Then pass instances in the call's config.

```python
class DetailedCallbackHandler(BaseCallbackHandler):
    def on_llm_start(self, serialized, prompts, **kwargs):
        self.start_time = time.time()
    def on_llm_end(self, response, **kwargs):
        print(f"duration: {time.time() - self.start_time:.2f}s")

chain.invoke({"topic": "rabbits"}, config={"callbacks": [DetailedCallbackHandler()]})
```

Callbacks compose. A timing handler, a file-logging handler and a streaming handler can sit on the same call without knowing about each other.

The same hook tracks cost. `get_openai_callback()` is a context manager that adds up prompt tokens, completion tokens and total cost for every call inside its block. It works for OpenAI models only. A multi-provider system needs its own token-cost table.

## Trace a Run So You Can Replay It

Tracing captures every step of a chain as a queryable run. That turns "it gave a wrong answer" into "here is the step that went wrong". The tutorial wraps a call in a tracing context for a named project, then pulls runs back later, filtered by run type or metadata.

```python
with tracing_v2_enabled(project_name="My Project"):
    llm.invoke("How many people live in USA?")

client.list_runs(project_name="default", run_type="llm")
```

Tags and metadata on a call matter as much as the trace. They filter runs by experiment or customer without re-running anything.

> **Warning: hosted tracing is not always allowed.** The tutorial demonstrates only a hosted tracing product. When a customer's compliance team says logs cannot leave their network, you need a self-hostable tracing backend, which this repository does not build. Say that it is a gap rather than promising the hosted tool.

## Worked Example: An Agent That Is Wrong Without Errors

A support agent starts giving wrong refund answers. The error logs are empty, because nothing crashed.

The metrics show request volume and latency are normal, so this is not an outage. The structured logs show which requests got the bad answers and which customers sent them. The trace for one of those requests shows each step in order. The retrieved documents, the exact prompt sent and the raw model output are all there. The retrieval step returned last year's refund policy.

"No error logs" usually means a silent wrong answer, not a crash. Only per-step tracing isolates which stage introduced it. Logs and metrics said where to look; the trace said why.

---

## Key Takeaways

- Logs answer what happened, metrics answer how often, and traces answer why; production needs all three.
- Start an unmonitored deployment with structured JSON logs and a metrics collector, and treat word-count token estimates as trend data only.
- Callback handlers are the composable hook for timing, logging, streaming and cost, but the OpenAI cost callback covers one provider only.
- Traces with tags and metadata make a multi-step run debuggable after the fact, and a self-hostable backend is a gap when data cannot leave the customer's network.

## Check Yourself

1. **Your dashboards show normal latency and error rates, but customers report wrong answers. Which signal do you open first?**
   A trace of one affected request. Metrics show the system is up; only the per-step trace shows which stage, such as retrieval, produced the wrong answer.

2. **Why can't you bill a customer from the tutorial's `InstrumentedLLM` token counts?**
   They are a word-count estimate (`len(text.split()) * 4 // 3`), not a real tokenizer. They show trends, not exact cost.

3. **Your system calls two model providers. Is `get_openai_callback()` enough for cost tracking?**
   No. It reports cost for OpenAI models only. Keep your own per-provider token-cost table.

