# Module 7 – Agent Production Systems (Beginner Guide + Keywords)

Oct 4, 2026 · @Sourav Banerjee

## Overview

A demo agent that works on your laptop is not the same as an agent that runs for real users. In production it has to be fast, cheap, safe when things break, easy to watch, and able to handle many users at once. This module covers each of those five concerns and what to do about them.

&#91;embedded content: production agent stack · 5 layers, 5 controls\]

The left column is the path a request takes; the shaded boxes on the right are the control that matters most at that layer.

Topics in this module:

- Topic 1: Performance & Latency Optimization (making it fast)
- Topic 2: Cost Optimization & Budget Control (keeping the bill under control)
- Topic 3: Reliability & Failure Handling (surviving errors)
- Topic 4: Observability & Monitoring (seeing what the agent is doing)
- Topic 5: Scalability & Infrastructure (serving many users)

The **bold keywords** are the exact terms to use in interviews.

## Topic 1: Performance & Latency Optimization

Latency is how long the user waits. The core rule: measure first, then fix the biggest slow part.

### My agent takes 6-8 seconds. How do I speed it up without making it dumber?

First find out where the time goes, using **stage-level latency measurement**. Note a timestamp at each stage: request received, planning done, tools done, reflection done, final answer.

- Common time sinks: **LLM inference**, **external API or tool calls**, **vector retrieval**, network overhead, and **serialization**.
- Always attack the biggest measured piece. In some systems it is the model, in others it is the tools.

### How do I split latency across planning, tools, reflection and the final answer?

Measure it for your own system, because it depends on model speed, tool complexity, network, context size and number of steps. Track:

- **P50 / P95** latency per stage (the typical and the slow-end case)
- Token processing time and tool execution time
- **Queue wait time**

Use a monotonic timer (for example **time.monotonic**), and do not guess fixed percentages.

### When does a planner model add too much delay?

A planner is a separate LLM call that makes the plan first. It is not worth it when:

- Tasks are simple and repetitive, so a rule-based router does the job in milliseconds instead of hundreds of milliseconds.
- The plan is nearly always the same, so a **template-based planner** is enough.
- A big slow planner must finish before anything starts. Use a smaller model or **stream the plan** so execution starts early.
- The context is small and there is not much to plan.

The fix is **adaptive planning**: a quick classifier sends simple tasks to a template and only hard or new tasks to the LLM planner.

### How do I run tool calls in parallel safely?

Parallel is fine only when calls do not depend on each other, rate limits allow it, order does not matter, and they do not change the same shared thing. In Python this is **asyncio.gather**. Add **concurrency limits**, **timeouts** and **error isolation** (one failure should not kill the others).

### How do I design an asynchronous agent workflow?

Do not make the user wait on one long request. Return a ticket right away and do the work in the background:

1. The API gateway returns a **job\_id** in under 100ms.
2. The job goes into a **task queue** (**Redis**, **SQS** or **Kafka**).
3. A **worker pool** picks up the job and runs the agent.
4. The result is saved in a **result store** keyed by job\_id.
5. The user polls a status endpoint or gets a **webhook**.

For long tasks, stream progress with **Server-Sent Events (SSE)** or **WebSockets** so it feels alive.

### Can I cache reasoning steps without breaking correctness?

Only with care, because reasoning often depends on changing context.

- Safe: deterministic steps with identical input, such as **prompt rewriting**, **query classification** or summarizing static content.
- Unsafe: reasoning that depends on chat history, real-time data, or that triggers actions.
- Rule of thumb: cache **tool outputs and retrieval results**, and cache reasoning only when the input is exactly the same.

### How does reasoning depth affect token cost and latency?

Each step adds its thought, action and result to the context, and that whole pile is sent again in the next step. So cost grows faster than the number of steps.

- Example: with about 600 new tokens per step, step 1 reads 1,000 tokens, step 5 reads 3,400 and step 10 reads 6,400.
- A 10-step agent can cost 5 to 8 times a 3-step one, not just 3 times.
- Latency grows too, since longer input means a slower first token and steps run one after another.
- Fix: **context compression** (summarize finished steps) and cut unneeded steps.

### When should I swap multi-step reasoning for a simple fixed flow?

Use a **deterministic workflow** when:

- Tasks always follow the same steps.
- Code can check each result (**JSON schema**, **regex**, **unit tests**).
- Error handling is rule-based (retry, fallback, escalate).
- The latency target is too tight for several LLM calls (for example under 2 seconds).
- Cost makes the agent unprofitable. Keep the agent only for rare complex cases.

### How do I avoid blocking while waiting for external APIs?

- **Async I/O** (**asyncio**, **aiohttp**) so the program does other work while waiting, and **asyncio.gather** for many calls at once.
- **Connection pooling** (a shared **ClientSession**) to avoid repeated connection setup that costs 50 to 200ms each time.
- **Timeouts** on every external call, for example 2 to 5 seconds for interactive tasks.
- **Circuit breaker**: after repeated failures, stop calling the broken service and use a fallback or cached result.

### How do I benchmark an agent realistically?

Toy tasks do not predict production. Build a benchmark from real work:

- 200 to 500 representative tasks, including hard cases, edge cases and known correct answers.
- Quality metrics: **task completion rate**, **answer correctness**, **faithfulness**.
- Performance metrics: end-to-end **P50 / P95 / P99** latency, per-stage breakdown, **step count** distribution.
- Cost metrics: tokens, tool calls and dollars per task.
- Be realistic: real tool endpoints for some tests, **concurrent load** (10, 50, 100 agents), long chat histories, and adversarial inputs such as prompt injection.
- Run it on every deploy and alert on regressions (for example completion rate down more than 2%, P95 latency up more than 10%, or cost per task up more than 5%).

## Topic 2: Cost Optimization & Budget Control

Every step of an agent costs tokens, and loops multiply the cost. This topic is about spending on purpose.

### Costs are rising because of multi-step loops. How do I control token use?

- **Context compression**: every few steps, summarize the finished steps and keep only the summary plus the recent ones.
- **Tool result truncation**: keep only the relevant lines of a big tool result (**contextual compression**) and set a max tokens per tool call.
- **Step limits and token budget**: a hard max on steps and total tokens, then give a best-effort answer.
- **Route to smaller models** (for example **GPT-4o mini**) for easy steps such as argument generation and formatting.

### How do I set step limits without hurting success?

- **Task-adaptive limits**: a simple lookup gets few steps, a big research job gets many.
- **Soft warning** at about 80% of the limit, telling the agent to wrap up.
- **Quality-aware early exit** when a confident answer already exists.
- **Post-limit synthesis**: if the limit is hit, still write the best answer from what was gathered and say what is missing, instead of returning an error.

### When is reflection too expensive?

Reflection means the agent critiques its own answer, which adds LLM calls. A single pass costs about 1.5 to 2 times, critique plus revision about 2 to 2.5 times, and multiple passes more than 3 times.

Use it when quality is critical, automated validators fail, or hallucination risk is high. Otherwise skip it.

### How do I design a token budget per request?

Give each part of the prompt its own allowance, for example:

- system prompt, task description, **conversation history**, **agent scratchpad** (reasoning and tool results), **retrieved context** (RAG chunks) and the user query.
- A separate output limit using **max\_tokens**.

Enforce it at every step: count tokens (for example with a tokenizer) before adding a tool result, and compress it if it would go over. Also add **per-user quotas** (daily or monthly) that switch to smaller models and fewer steps when a user nears the limit.

### How do I switch between big and small models during a run?

This is **model routing**:

- **By step type**: big model for planning and final answer, medium for reflection and interpreting results, small for argument generation and format conversion.
- **By complexity score**: a fast heuristic (not another LLM) picks small, medium or large.
- **Quality gate with escalation**: try the small model first and move up to the big one if the check fails. This gets most of the savings without losing quality.

### What numbers tell me an agent is not economically sustainable?

- **Cost per successful task** higher than the value it creates.
- **Cost per task trend** rising while traffic is flat (context growth or more steps).
- **Success rate per dollar** falling.
- Warning signs: more steps month over month, more tool calls for the same output, reflection used on more than 50% of tasks, big models used on easy steps.
- Do a **break-even analysis**. If the margin is under about 20%, optimize now.

### How do I do cost-aware routing in multi-agent systems?

- Keep an **agent registry** with each agent's capability, cost per task and what it handles.
- Route each task to the **cheapest capable agent** that fits the remaining budget.
- **Escalation policy**: try cheap first, move up if the output is poor.
- **Budget enforcement** per tenant or user per day, switching to cheaper agents as the budget runs low, while critical tasks keep full capability.

### How do I stop a runaway agent from burning all the credits?

- **Hard credit limit per task** (a **CreditGuard** that raises an error when the budget is used up).
- **Global rate limit** with a **token bucket** at the API gateway.
- **Real-time spend alerts** at 50%, 75% and 90% of the daily budget. At 90%, move new tasks to smaller models; at 100%, queue them.
- **Loop detection**: catching a loop at step 3 instead of step 100 saves 30 times the cost.
- **Pre-authorization**: estimate the task cost first and reject it before it starts if credit is short.

### When should I reuse tool results instead of recomputing?

| Reuse (cache with a **TTL**) | Recompute |
| --- | --- |
| Static or slow-changing data (catalog, config, documents) | Real-time data (prices, live inventory, queue depth) |
| The same tool and arguments were already used in this task | The previous result was an error |
| Expensive computation whose result stays valid for a while | The task needs guaranteed fresh data |

### How do I estimate the monthly cost of an agent platform?

Build a small cost model with these parts:

- **LLM cost**: tasks per month x steps x tokens, split between large model and small model prices (input and output tokens are priced separately).
- **Tool cost**: tool calls per task x price per call.
- **Infrastructure cost**: vector database, compute, storage.
- Use **measured numbers** from the first 1,000 production tasks, not guesses.
- Add a **1.5x safety margin**, since real costs run 30 to 50% higher because of retries, longer tasks and traffic spikes.

## Topic 3: Reliability & Failure Handling

Tools break, models drift and networks fail. A reliable agent expects this and has a plan for each case.

### What should the agent do when a tool fails halfway?

First classify the failure, then choose the response:

| Failure | Response |
| --- | --- |
| **Rate limit** (429) | Retry with **backoff** (wait longer each time) |
| **Timeout** | Retry once |
| **Authorization** error | Do not retry, escalate to a human |
| **Validation** error | Re-plan the step with fixed arguments |
| **Service unavailable** | Switch to a **fallback tool** |

Also ask whether the failed step is on the **critical path**. If not, log it and continue. If everything fails, give a **partial result** that clearly says what is missing and why, instead of just an error.

### How do I design retries without creating loops?

- Every retry needs a limit: **max attempts**, **exponential backoff** (delay grows, for example 1s, 2s, 4s) and a **max delay**.
- Use different rules per error: long wait for 429, one retry for timeouts, two short retries for server errors (500), and no retry for 400 or 403 without fixing the cause.
- Add a **retry budget per task** so one failing tool does not use all the retries.

### How do I detect partial execution failures?

- **Structural checks**: planned steps vs completed steps, dependencies satisfied, no critical step missing.
- **Semantic checks**: expected fields present (for example price, competitor, date), required entities extracted, required sources retrieved.
- Use both together for reliable detection.

### How do I make tool calls idempotent?

**Idempotent** means doing the same call twice has the same effect as doing it once, which makes retries safe.

- Reads (GET, queries) are naturally idempotent.
- Writes need design: **idempotency keys** (a repeated key returns the stored result), **upserts** instead of inserts, and **check-then-act** (for example check whether the email was already sent).
- At the agent level, give each task a **task ID** and return the cached result if the same ID arrives again.

### How do I recover from corrupted agent state?

Corrupted state means the agent's picture of the task is inconsistent or wrong. First **detect it** with state validation (step order, references, contradictions, missing fields). Then recover in tiers:

- **Light**: throw away the bad step result and redo that step.
- **Moderate**: **roll back** to the last good **checkpoint** and redo from there.
- **Severe**: restart from the original task, and save a snapshot of the broken state for investigation.

Prevention: save a copy before each step, validate after it, and persist a checkpoint only when it passes.

### What are the most common failures in production agents?

- **Tool argument hallucination**: valid-looking but wrong arguments. Validate ranges and types first.
- **Context window overflow**: early instructions get lost. Use context compression and a token budget.
- **Silent tool failures**: success with an empty result. Check for minimum expected content.
- **Reasoning loop**: busy but not progressing. Use loop detection.
- **Goal drift**: the agent slowly answers a different question. Re-insert the original task now and then.
- **Prompt injection via tool results**: treat tool output as data, never as instructions.
- **Context poisoning**: an early wrong assumption is treated as fact later. Use verification steps, contradiction detection, **retrieval grounding** and state checkpoints.

### How do I test an agent against weird tool responses?

Use **fault injection**: wrap the real tool so it sometimes misbehaves. Test these cases:

- Empty result, partial result, wrong data type, **malformed JSON**
- Huge results (100x normal) and very slow responses
- Intermittent failures (for example 30% of calls) and **rate limit** errors

Run this as **chaos testing** weekly in staging and rotate the faults. Anything that breaks in staging would break in production.

### What fallback should I use when the agent is not confident?

Measure **confidence** from signals like the top retrieval score, step consistency, no contradictions and tool success rate. Then pick a tier:

1. **High confidence (0.7 to 1.0)**: answer normally with citations.
2. **Medium (0.5 to 0.7)**: answer but say clearly that it is uncertain and suggest confirming.
3. **Low (0.3 to 0.5)**: show the relevant sources without writing an answer.
4. **Very low (below 0.3)**: **escalate to a human**.

## Topic 4: Observability & Monitoring

Observability means you can see inside the agent: what it did, why, how long it took and what it cost. Without it, you only learn about problems from angry users.

### How do I trace an agent's reasoning steps in production?

Record a **trace** for each task: ids, task description, total latency, tokens, cost, success flag, and a list of **step traces**. Each step stores its type (reasoning, tool call, reflection), duration, the thought and decision, the tool name, arguments and result, a confidence score and tokens.

Send the traces to **OpenTelemetry**, which works with **Jaeger**, **Datadog** or **Honeycomb**. Each step becomes a **child span** of the main trace, so you get:

- A **waterfall** view of every step and its duration
- Search and filtering across millions of traces
- A link from a user's feedback to the exact **trace ID**

### What should I log at each stage of the loop?

- **Task start**: trace ID, task ID, user ID, task type, step limit, token budget, timestamp.
- **Each reasoning step**: step number, thought, decision, selected tool, tokens used, latency.
- **Each tool call**: tool name, arguments, a short result preview, result tokens, success flag, latency.
- **Task complete**: success, total steps, tokens, cost, latency and a **faithfulness score**.

### How do I measure reasoning quality over time?

Quality drops quietly, so track it with numbers:

- **Faithfulness score** from an **LLM judge**: do the answer's claims match what the tools retrieved?
- **Task completion rate** per task type.
- **Step efficiency**: average steps per success. If it rises, the agent is getting wasteful.
- **Answer consistency** on known-answer questions asked again and again.
- A weekly run of a **golden test set** (for example 100 tasks), investigating drops of more than 5%.
- A **trend dashboard** over about 90 days, since slow declines matter even before they cross an alert threshold.

### What metrics show the agent is misusing tools?

- High **tool error rate** for one agent compared to others.
- Unusual **call frequency** (15 calls where 2 to 3 is normal).
- The **wrong tool for the task type** (for example web search for an internal document question).
- **Out-of-range or badly typed arguments**.
- **Repeated identical calls** more than twice, which points to a loop.
- Low **tool success rate** (for example 60% when peers reach 95%).

### How do I detect infinite reasoning loops automatically?

- **Timeout** (simplest and most reliable): wrap the run in **asyncio.wait\_for** and return a timeout result.
- **State repetition detection**: a **LoopDetector** that checks if the same tool is being called in a very similar state within a recent window.
- **Progress monitoring**: if 3 steps in a row add no new information, it is probably looping.
- On detection: stop the agent, log the full trace, alert the team, and give the user a graceful partial result.

### How do I build dashboards for agent health?

Make one per audience:

| Dashboard | Audience and refresh | What it shows |
| --- | --- | --- |
| **Engineering** | Real time | Request and error rate, **P50/P95/P99** latency per stage, tool success by tool, token and cost rate, loop detections, active sessions |
| **Operations** | Hourly | Completion rate trend, steps per task, cost per task, timeouts, **queue depth**, error categories |
| **Quality** | Daily, ML team | Faithfulness trend, reasoning quality by task type, golden test set results, thumbs-down vs quality metrics, model version comparison |
| **Business** | Weekly, leadership | Tasks completed, success rate by product area, cost efficiency, user satisfaction, coverage gaps |

### How do I connect user feedback to internal logs?

- **Feedback anchoring**: every response carries a hidden **trace ID**, and the feedback event (thumbs down, comment) sends it back, so you can join feedback with the full trace.
- **Automated root cause analysis** on negative feedback: pull the trace and check retrieval scores, faithfulness, abnormal step counts and tool errors to guess the probable cause.
- **Weekly failure analysis**: group negative feedback by cause and use the biggest groups as next week's priorities.

## Topic 5: Scalability & Infrastructure

Scaling means the same agent keeps working when there are far more users, sessions and tools than before.

### How do I scale from 100 users to 100,000?

- **Stateless compute**: servers keep no state. State lives in **Redis** (sessions), a database (long-term memory) and **S3** (files), so any server can serve any request and you scale by adding servers.
- **Request queue** for load leveling: users go to the API gateway, then a task queue, then a worker pool, then a result store. The queue absorbs traffic spikes.
- **Auto-scaling worker pool** based on queue depth (for example with **Kubernetes HPA**): add workers when the queue grows, remove them when it shrinks.
- **Read replicas** for the vector store and memory database; writes stay on the primary.
- **Semantic cache** at the edge (CDN layer) that answers repeated or similar questions without touching the backend.

### How do I handle many sessions that share persistent memory?

The danger is a **race condition** when several sessions read and write the same user's memory.

- Split **session-scoped (short-term)** memory from **user-scoped (long-term)** memory. Short-term writes have no contention.
- Use **optimistic locking** with a version number for long-term writes. If another session wrote first, re-read, merge and retry.
- **Memory consolidation at session end**: batch the updates and write them together, which greatly reduces write contention.

### How do I scale multi-agent systems horizontally?

- **Stateless agent workers**: any worker can run any agent type, and the task state sits in a shared store.
- **Agent type routing**: a separate queue per agent type (planning, research, synthesis), each scaled by its own demand.
- **Shared state store** (**Redis** or a document database) as the coordination point, where a coordinator creates sub-tasks with dependencies.
- **Event-driven coordination**: publish a completion event when a sub-task ends, and downstream agents start automatically. This replaces polling and allows true parallel work.

### What infrastructure problems come with many external APIs?

- **Failure cascading**: reliability multiplies. Five APIs at 99% each give about 95% overall, so give each a fallback or graceful degradation.
- **Different rate limits**: use one **rate limiter** (**token bucket**) per API.
- **Latency variance**: P99 can be 10 to 100 times P50, so set **per-dependency timeouts** rather than a single global one.
- **Credential management**: use a **secrets manager** with automatic rotation.
- **Dependency health monitoring**: watch each API's availability and latency, and switch to fallbacks early.

### How do I isolate tenants in an enterprise multi-agent system?

Multi-tenancy means one customer must never see another customer's data or actions.

- **Compute isolation**: strict cases get separate environments (separate **Kubernetes namespaces** with **network policies**). Standard cases can share compute with strong data-layer isolation.
- **Data isolation**: a mandatory **tenant\_id filter** enforced in the data layer (for example in the vector database), not just in app code.
- **Tool access isolation**: each tenant only gets the tools configured for it.
- **Audit log isolation**: tenant-scoped, immutable logs kept for the required period.
- **Resource quotas** per tenant (requests per minute, tokens per day, concurrent sessions), so one tenant cannot slow down others.
