# Mock: AI-assisted coding round, Applied AI Engineer (agentic app building)

This is a practice problem written to match the reported style (staged gates, production-quality, AI allowed with narration). It is **not** a leaked OpenAI question.

## Rules for the mock (be strict, it is the whole value)
- 60 minutes, timer visible. Screen-record yourself and narrate aloud.
- Use your AI assistant (Cursor / Claude Code / ChatGPT). Do NOT paste this whole file or the tests into it. Prompt in small, specific pieces and read every diff.
- Open one gate's tests at a time: `pytest -k gate1`, then `gate2`, and so on. Do not read ahead.
- `fake_llm.py` is provided. Do not edit it or the tests. Do not open `solution/` until you finish.
- Run: `pip install pytest && pytest -k gate1 -q`

## Scenario
You are building the core loop of a customer-support agent for an e-commerce company. The model can call tools such as `get_order`, `search_docs` and `issue_refund`. You own the loop that runs the model, executes tools safely, and keeps the whole thing observable.

## Time plan
| Minutes | Activity |
|---|---|
| 0-5 | Read Gate 1, clarify out loud, state a plan and assumptions |
| 5-20 | Gate 1: the agent loop |
| 20-35 | Gate 2: robustness (tool errors, bad arguments, retries) |
| 35-47 | Gate 3: guardrails (budget, approval, idempotency) |
| 47-57 | Gate 4: parallel tools, timeouts, trace, eval harness |
| 57-60 | Summarise trade-offs and what you would harden next |

## Gate 1: the agent loop (about 15 min)
Implement `Agent(llm, tools, system=..., max_steps=8)` and `run(user_message) -> AgentResult`.
- Messages start as `[system, user]`. Call `llm.complete(messages, tools)`.
- If the reply has `tool_calls`, append the assistant message (with its `tool_calls`), execute each call, append one `tool` message per call (`tool_call_id` and string `content`), then call the model again.
- If there are no tool calls, return the final content.
- Tool results that are not strings must be JSON-encoded.
- Stop after `max_steps` model calls by raising `MaxStepsExceeded`.
- Advertise tools to the model as `{"name", "description"}`; the description is the function docstring.

## Gate 2: robustness (about 15 min)
New requirement from the interviewer: "In production the model sends garbage and tools fail. The agent must not crash."
- A tool that raises must not crash the run. Send `ERROR: <type>: <message>` back to the model as the tool result.
- Unknown tool name, malformed JSON arguments, arguments that are not a JSON object, missing arguments and unexpected arguments must all produce an `ERROR...` tool message **without executing the tool**.
- Retry `LLMTransientError` from the model with exponential backoff (1s, 2s, 4s...). Add `max_retries=3` and an injectable `sleep` so tests are instant. Re-raise after the retries are exhausted. Never retry other exceptions.

## Gate 3: guardrails (about 12 min)
Interviewer: "The agent can spend money and move money. Add controls."
- `token_budget`: sum `usage.tokens` across model calls; raise `BudgetExceeded` as soon as the total goes over. `AgentResult.tokens` reports the total.
- `requires_approval` (set of tool names) plus `approver(name, args) -> bool`. If the approver is missing or says no, do not execute and return a tool message starting with `DENIED`.
- Side-effect tools are idempotent within one run: if the model repeats the exact same call (same name and arguments), return the cached result without executing again and without asking the approver again. Different arguments are a new action. Read-only tools are never cached.

## Gate 4: scale and observability (about 10 min)
Interviewer: "The model often issues several tool calls at once, and sometimes a tool hangs. How do you know it works?"
- Execute all tool calls of one assistant turn in parallel. Tool messages must still be appended in the original call order.
- `tool_timeout` (seconds): a tool that exceeds it yields `ERROR: tool '<name>' timed out after <n>s` and must not block the other calls.
- `AgentResult.trace`: a list of events: one `{"step", "type": "llm"}` per model call and one `{"step", "type": "tool", "name", "ok"}` per tool call, in order. `ok` is false for errors and denials.
- `evaluate(make_agent, cases) -> {"passed", "total", "failures"}`. Each case has `input`, optional `expect_tools` (exact ordered tool names used) and `expect_contains` (substring of the final answer). An exception during a case counts as a failure. Failures list `input` and `reasons`.

## Verbal questions the interviewer may ask at the end
- What breaks if the tool's side effect succeeds but the process dies before the result is stored?
- How would you stop prompt injection coming back through a tool result?
- Which of these would you move out of process (queue, durable state) in production, and why?
- How would you grow `evaluate` to use an LLM judge, and what are its failure modes?
- How would you trim long conversations without orphaning a `tool` message from its assistant tool call?

## Optional second drill
`ledger_drill/` (spec in `ledger_drill/LEDGER_PROBLEM.md`) is a credit ledger with expiry in four gates, the style often reported for OpenAI coding rounds. Same rules apply.
