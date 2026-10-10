# Practise Framework Interview Questions

*Framework questions reward naming the exact primitive and its trap, but an answer that stops at the API name sounds like a tour rather than judgement.*

◷ 7 min

Interviewers rarely ask what a class is called. They describe a symptom, such as a slow chat, a runaway loop or a refund sent twice, and listen for the mechanism. Every answer below points back to the lesson that teaches it.

**Objectives:**

- answer the common LangChain and LangGraph production questions in two or three sentences each;
- recognise which lesson's mechanism a symptom points to;
- structure a full design answer for a human-gated support agent.

---

## Lead With the Mechanism, Then the Primitive

A strong framework answer has three beats. Name the mechanism: what actually happens, such as "the whole node re-runs on resume". Name the primitive that controls it. Then name the trap. "Use `interrupt()`" is a tour; "the node re-runs from the top, so the paid call before the interrupt fires twice" is judgement.

## Answer Framework-Choice Questions

**Why use a framework at all, and when skip it?**
A framework buys one shared interface, declared state, native message shapes and checkpointing. It never buys the step budget or the confirmation policy. Skip it on a hot path with strict latency, bespoke retrieval, or high volume where exact token control drives cost. See [What a Framework Buys You](/learn/llm-and-retrieval/langchain-and-langgraph/what-a-framework-buys-you).

**Chain or graph?**
A straight line of steps is a chain. Decision diamonds, backward arrows, pauses or crash recovery call for a graph. See [Modelling Workflows as State Graphs](/learn/llm-and-retrieval/langchain-and-langgraph/modelling-workflows-as-state-graphs).

**How is an agent decoupled from one model provider?**
Initialise every model through a configuration string with `init_chat_model`, so a provider change is a value, not a refactor. Add `.with_fallbacks([...])` on critical paths so an outage degrades to a second provider automatically. Treat the model as a swappable dependency from day one. See [Composing Pipelines with LangChain](/learn/llm-and-retrieval/langchain-and-langgraph/composing-pipelines-with-langchain).

## Answer Loop and State Questions

**What stops an agent's tool loop from running forever?**
Nothing in the model. Termination is the model's own judgement, so bound it externally. In a graph, the guard clause in the routing function checks a step budget. On a prebuilt agent, `ModelCallLimitMiddleware` caps calls, with `run_limit` per invocation and `thread_limit` per thread. See [The Tool-Calling Loop in LangGraph](/learn/llm-and-retrieval/langchain-and-langgraph/the-tool-calling-loop-in-langgraph).

**`GraphRecursionError` fired at about 25 super-steps. Is raising the limit the fix?**
No. The error almost always means a conditional edge routes back with no path to `END`. Raising the limit only delays the same failure. Add an iteration counter to the routing function and keep the limit as a backstop.

**What should a production loop's exits be?**
Three independent ones: a checkable success condition, a hard budget on steps, tokens or time, and a guard that detects repetition or stagnation. Each alone fails differently. Success alone hangs on impossible tasks. Budget alone burns the whole budget on a task that became impossible early.

**A chatbot forgot what the user said two turns ago. What gets checked first?**
The state schema. A messages field with no reducer overwrites on every node; it needs `Annotated[list, add_messages]`.

## Answer Durability and Approval Questions

**Checkpointer or cross-thread store?**
The checkpointer is within-thread memory: resume this exact run, scoped by `thread_id`. A store is cross-thread memory for facts about a user that outlive any one conversation. See [Checkpoints, Interrupts, and Human Approval](/learn/llm-and-retrieval/langchain-and-langgraph/checkpoints-interrupts-and-human-approval) and [T3.4 Memory and state](/learn/agentic-systems/memory-and-state).

**The process crashes mid-run. What survives?**
State up to the last checkpoint survives, and the run resumes from there without replaying finished nodes. Side effects already sent to the outside world are not recovered. Give external actions idempotency keys so a resumed run cannot repeat them.

**A pod restarts mid-approval. How does the paused run resume?**
Only if the checkpointer is durable, such as Postgres or SQLite. A new process pointed at the same store and the same `thread_id` accepts `Command(resume=...)` as if nothing happened. `InMemorySaver` loses the pause.

**Where does the approval gate go for a refund over $500?**
Inside the refund tool, immediately before the payment call. Read-only steps then never pause, and an idempotency key on the refund stops a resume from sending it twice.

## Answer Latency and Concurrency Questions

**The chat UI feels laggy though the model is fast. What is the fix?**
Stream. Switch `.invoke()` to `.stream()`, or `.astream()` in an async server, so tokens render as they arrive. Total time is unchanged; perceived latency drops. See [Retries, Fan-Out, and Streaming](/learn/llm-and-retrieval/langchain-and-langgraph/retries-fan-out-and-streaming).

**A chain fine in development times out under concurrent load. Diagnosis?**
Synchronous `.invoke()` per request serialises on model latency, so throughput is capped by the thread pool size divided by per-call latency. Move to async endpoints with explicit concurrency limits, and use `.batch()` with `max_concurrency` where inputs are independent.

**Fan out three tool calls: `gather` or `TaskGroup`?**
`TaskGroup`. When one task raises, it cancels every sibling, which matters when a still-running call is still spending money. `gather` lets the others run on.

**Nested retries at model, tool and step level: what is the worst-case time?**
Attempts multiply, roughly steps times step retries times call retries times the call timeout, plus backoff. A 30-second timeout, three attempts, two step retries and 40 steps is over two hours. Pass an absolute deadline down through every layer and keep 10 to 20 percent of the budget for wind-down.

**Which stream mode for a typing effect, and what must not leak?**
`stream_mode="messages"` for tokens. The `values` and `updates` modes expose internal state fields that a client should never see.

> **Warning: "it worked in my demo" is the answer interviewers are waiting to puncture.** Demos use in-memory checkpoints, synchronous calls, no call limits and no evaluation set. Name those four gaps before the interviewer does.

## Practise a Full Design: A Human-Gated Ticket Agent

The LangGraph tutorial's mock prompt: triage support tickets, auto-resolve simple ones, and send refunds and account deletions to a human first. Survive a pod restart mid-conversation. Keep p95 under three seconds on the auto-resolve path. Never take an irreversible action twice.

A strong outline maps each requirement to a mechanism. Classify each ticket into category and risk level with structured output, not free-text parsing. Use `PostgresSaver` with `thread_id` set to the ticket id. Put `interrupt()` inside the refund and deletion tools, not before the whole turn. Key each side effect on ticket id plus action type. Fan out order history, account status and prior-ticket lookups under one `TaskGroup`. Cap the self-correction loop at three iterations, then escalate.

The latency budget is about 150 ms to classify, 200 ms for concurrent lookups, 2 s of streamed generation and 50 ms for the checkpoint write. Below a confidence threshold, route to a human rather than guess. The rubric checks every one of those lines, which is why each requirement in the prompt needs its own named mechanism.

## Practise by Building

Three take-home tasks from the source tutorials make strong portfolio pieces. Build a 30-example labelled set for an LLM ticket router and report per-category accuracy and the worst confusion pair. Add a hard cap on workers spawned per run to an orchestrator-worker pipeline, returning a structured error when it trips. Wrap a graph whose node uses `RetryPolicy` in a circuit breaker that opens for 30 seconds after five exhausted-retry failures.

---

## Key Takeaways

- Answer with mechanism, primitive and trap, in that order.
- Framework-choice answers name what the framework buys and what stays application code.
- Loop answers name an external budget, an iteration guard and the reducer behind lost state.
- Durability answers separate recovered state from unrecovered side effects, and require a durable checkpointer.
- Latency answers reach for streaming, async calls, `TaskGroup` and absolute deadlines before a faster model.
- A full design answer maps every requirement to one named mechanism.

## Check Yourself

1. **Name the three exits a production agent loop needs.**
   A checkable success condition, a hard budget on steps, tokens or time, and a repetition or stagnation guard.

2. **What survives a crash in a checkpointed graph, and what does not?**
   State up to the last checkpoint survives. Side effects already sent externally are not recovered, so they need idempotency keys.

3. **Name one thing missing from the source notebooks that a strong candidate should build anyway.**
   An evaluation harness: a labelled set measuring router accuracy or loop convergence, rather than eyeballing printed output.

