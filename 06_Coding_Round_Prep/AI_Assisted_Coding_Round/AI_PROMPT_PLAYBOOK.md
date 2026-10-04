# AI assistant playbook for the round

The scoring signal reported in public guides is how you steer and verify the AI, not how much you use it. This is my synthesis of those guides; confirm the tool policy with your recruiter.

## Workflow per gate
1. Read the gate. Say the plan aloud in 30 seconds: data structures, edge cases, what you will test.
2. Write or ask for the test first, when a test does not exist yet.
3. Prompt for ONE small piece. Read the diff. Say what it does and what you would change.
4. Run the tests. Fix with a narrow follow-up, not a rewrite.
5. State complexity and one trade-off before moving on.

## Good prompts (narrow, with context and a constraint)
- "Add a `_exec(call)` method to `Agent` that returns a string. Unknown tool returns `ERROR: unknown tool '<name>'`. Do not change `run`. Show only the diff."
- "Here is my failing test and traceback. Explain the cause in two sentences before suggesting a fix."
- "Add exponential backoff (1s, 2s, 4s) around `llm.complete`, retrying only `LLMTransientError`. Inject `sleep` so tests are instant."
- "Review this diff for edge cases I missed: empty tool calls, duplicate ids, non-dict arguments."
- "Write a pytest for the behaviour: a repeated side-effect call with identical arguments executes once. Do not write the implementation."

## Bad prompts (reportedly penalised)
- Pasting the whole problem and asking "solve this".
- "Fix it" with no failing output.
- Accepting a large diff without reading it.
- Asking the AI to decide the design for you.

## Phrases to say aloud while working
- "My plan is..., the risk is..."
- "I'm asking the model for X only, because I want to own the design."
- "That diff has a bug: it caches the denial. I'll fix that."
- "Before I move on, let me add a test for the duplicate case."
- "Trade-off: threads are simpler here; I'd use asyncio if tool calls were I/O-heavy at scale."

## Things to catch in AI output (common)
- Swallowed exceptions with a bare `except`.
- Retrying every exception type.
- Mutable default arguments.
- Tool messages appended out of call order after parallelising.
- Caching read-only results or caching failures.
- Hard-coded sleeps in tests.
- Missing the assistant `tool_calls` message before its `tool` results.

## One-line system prompt you can set in your assistant
"Give small, focused diffs, explain each change in one or two sentences, and never rewrite code I did not ask you to change."
