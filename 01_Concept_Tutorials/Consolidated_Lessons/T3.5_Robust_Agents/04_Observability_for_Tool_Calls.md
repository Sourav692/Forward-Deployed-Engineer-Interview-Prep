# Observability for Tool Calls

*A record of every call costs storage and effort, but without one, "why did the agent close the wrong ticket?" has no answer except "the model decided".*

◷ 6 min

An agent whose actions cannot be explained is a liability, not a product. Log every tool call with its arguments, status and latency, one status per executor branch, so the trace is complete by construction; [The Eight Guard Checks](05_The_Eight_Guard_Checks.md) shows where this check sits among the others.

**Objectives:**

- list the fields of a tool-call record and the five statuses;
- read a short trace and answer the debugging, cost and audit questions from it;
- describe the trace and span hierarchy used in production.

---

## Record Every Call With Its Outcome

Every tool call must leave a record: what was called, with what arguments, what came back, how long it took. It must also say whether the call was served from cache, retried, blocked or replaced by a fallback. This is the finest-grained layer of observability.

```python
@dataclass
class ToolCall:
    step: int
    tool: str
    args: dict
    status: str          # ok | cache_hit | retry | error | blocked
    result: Any = None
    error: Optional[str] = None
    ms: float = 0.0      # latency in milliseconds
```

## Map One Status to Each Executor Branch

A trace cannot be complete if some branch of the executor never logs. In the reference executor every branch logs, and each branch has its own status.

| Status | Emitted when |
|---|---|
| `blocked` | The confirmation gate refused a destructive call |
| `cache_hit` | The memo served the result; no execution |
| `retry` | A transient failure; another attempt follows |
| `ok` | Executed successfully, with latency |
| `error` | A permanent failure, or retries exhausted; also logged by `with_fallback` before it switches tools |

Because the statuses map one-to-one onto the branches in [The Confirmation Gate and Memoization](01_The_Confirmation_Gate_and_Memoization.md) and [Retries and Fallbacks](02_Retries_and_Fallbacks.md), nothing the executor does is invisible.

## Read the Trace as Three Stories

The logger keeps records in order and renders them as a table:

```
 #  tool             status         ms  args -> result/error
------------------------------------------------------------------------------
 1  search_tickets   retry         0.0  {'query': 'auth'} -> temporary outage (attempt 1)
 2  search_tickets   retry         0.0  {'query': 'auth'} -> temporary outage (attempt 2)
 3  search_tickets   ok            0.1  {'query': 'auth'} -> [{'id': 'TKT-1', 'subject': 'Cann…
 4  close_ticket     blocked       0.0  {'ticket_id': 'TKT-3'} -> needs confirmation
```

Four lines answer four questions. Was the dependency flaky? Yes, twice. Did it recover? Yes. Did the agent try something destructive? Yes. Was it stopped? Yes.

The same artefact serves three audiences.

| The worried question | What the trace gives |
|---|---|
| Why did the agent close the wrong ticket? | **Debugging:** which search ran, what it returned, which ID the agent chose |
| Where did the response time go? | **Cost and latency:** sum `ms`, count calls, spot the slow tool; tool latency is often the hidden half of response time |
| Who approved this refund? | **Safety and audit:** every destructive action and its confirmation, in the log rather than in someone's memory |

The logger's `count(status)` is what the tests assert on, for example `log.count("retry") == 2 and log.count("ok") == 1`. It is also the shape of a metric: retries per run, cache hit rate, and blocked destructive attempts per tenant.

## Promote the Log to Structured Spans

In production the in-memory log becomes structured spans, in OpenTelemetry or a vendor trace product such as LangSmith.

```
 trace   = one conversation (conversation_id)
   └─ span  = one agent turn (query, answer, iterations)
        └─ span  = one tool call
                   tags: tool · status · tokens · cache_hit · retries · ms
```

Attach the `conversation_id` to pull the whole story, and the user or tenant to slice it. A standard format matters more than the vendor: a customer who already runs an observability stack can ingest the spans without a bespoke integration.

## Keep Both the Run Trace and Per-Call Telemetry

Per-call telemetry and the run-level trace are complementary, not redundant. The run trace says what happened overall: prompt version, retrieved chunks, policy decisions and cost. Per-call telemetry says exactly which step absorbed the latency, hit the cache or needed a fallback.

> **Warning: a branch that does not log is a hole in every audit.** If the gate blocks silently, or a fallback switches tools without a record, the trace looks complete and is wrong. Make logging part of every branch of the executor, and assert on it in tests.

## Worked Example: Answering "What Happened?" From the Trace

A customer complains that their login ticket is still open, though they asked the agent to close it. The support lead opens the trace above.

Lines 1 and 2 show the search service failed twice with a temporary outage. Line 3 shows the third attempt succeeded, so the dependency recovered within the retry budget. Line 4 shows the agent proposed `close_ticket` for TKT-3 and the gate blocked it, waiting for confirmation.

Nothing was broken. The close was waiting for a human who never approved it. The fix is in the approval workflow, not in the agent. Debugging, cost and audit came from the same four lines, which is why every call is a record.

---

## Key Takeaways

- Every tool call leaves a record of tool, arguments, status, result or error, and latency.
- Five statuses map one-to-one onto the executor's branches, so the trace is complete by construction.
- One trace answers debugging, cost and latency, and safety and audit questions; its counts are also metrics.
- In production the log becomes spans: a trace per conversation, a span per turn, a span per tool call, in a standard format.
- Per-call telemetry complements the run-level trace; keep both.

## Check Yourself

1. **List the five statuses and the executor branch that emits each.**
   `blocked` from the confirmation gate, `cache_hit` from the memo, `retry` from a transient failure with attempts left, `ok` from a successful execution, and `error` from a permanent failure, exhausted retries, or a fallback switch.

2. **How do per-call telemetry and the run-level trace differ, and why keep both?**
   The run trace records what happened overall: prompt version, retrieved chunks, policy decisions and cost. Per-call telemetry shows which step absorbed latency, hit the cache or needed a fallback. Each answers questions the other cannot.

3. **Sketch the trace and span hierarchy for a conversation with three turns.**
   One trace keyed by `conversation_id`, holding three turn spans. Each turn span holds one child span per tool call, tagged with tool, status, tokens, cache hit, retries and latency.

## References

**Sources:** `04_Observability_For_Tool_Calls.md` (FDE Handbook, Robust Agents): "Why this matters", "What one record holds", "The trace", "Why it matters, three ways", "From in-memory log to production spans" and "Interview lens". `05-guarding-tool-calls.md` (Production and Platform Judgement): "8. Per-call telemetry".
