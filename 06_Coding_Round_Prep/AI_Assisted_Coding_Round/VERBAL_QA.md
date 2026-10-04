# Verbal questions: answer outlines

These are likely follow-ups after the coding, built from the agentic mock. They are my outlines, not reported OpenAI questions. Answer in under two minutes, with one concrete example.

## 1. The side effect succeeded but the process died before storing the result. What breaks?
- The agent can re-run the action after restart: a double refund.
- Fix: an idempotency key per action, stored durably in the same transaction as the side effect, or the downstream system must support the key. Check "did this key complete?" before acting.
- Mention the outbox pattern, and that an in-memory cache (as in the mock) only protects within one run.

## 2. How do you stop prompt injection coming back through a tool result?
- Treat tool output as untrusted data, never as instructions.
- Least privilege per tool, approval for side effects, and no tool that can fetch arbitrary URLs with user secrets.
- Delimit and label tool results, validate output against a schema, and run a policy check on proposed actions rather than relying on the model to refuse.
- Detect and log anomalies, such as an action unrelated to the user's request.

## 3. What would you move out of process in production?
- Idempotency and approval state go to a durable store, not memory.
- Tool execution to a queue or workers with timeouts and cancellation, because a thread cannot be killed.
- Traces to a tracing backend, budgets to a shared counter, and the approval step to an async human workflow.

## 4. How would you grow `evaluate` into an LLM judge, and what are the failure modes?
- Keep deterministic checks first (tools used, schema, forbidden actions), then add a judge for fuzzy quality.
- Judge failure modes: position and verbosity bias, self-preference, inconsistency across runs, and rubric drift.
- Mitigate with a fixed rubric, calibration against human labels, pairwise comparisons with swapped order, and regression on a golden set.

## 5. How do you trim long conversations without orphaning tool messages?
- Drop whole turns, never split an assistant message with `tool_calls` from its `tool` replies.
- Keep the system prompt and the latest user message, summarise older turns, and count tokens, not messages.

## 6. Why parallel tool calls, and what can go wrong?
- Latency: several independent calls run together.
- Risks: ordering of results (preserve the call order), shared state races, partial failures, a hung call blocking the rest (use timeouts), and rate limits.

## 7. How do you know the agent is working?
- Offline: a golden set of cases with expected tools and outcomes, run on every change.
- Online: traces per step, tool error rate, retries, cost per task, loop and budget breaches, and human override rate.
- Separate retrieval quality from generation quality, and review failures by category.

## 8. When would you not use an agent?
- When the steps are fixed and deterministic, correctness is critical, or latency and cost must be tight: use a workflow or plain code, with an LLM only where ambiguity exists.

## 9. Retry policy in one breath
- Retry only transient errors, with exponential backoff and jitter, a max attempt count, and an idempotency key for anything that writes.
