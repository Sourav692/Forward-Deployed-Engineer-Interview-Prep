# Module 5 – Agent Fundamentals & Architecture (Beginner Guide + Keywords)

Oct 4, 2026 · @Sourav Banerjee

## Overview

An AI agent is an LLM that does not just answer once. It works toward a goal in a loop: it thinks, picks a tool, uses it, looks at the result, and repeats until the job is done. Around that loop sit memory (so it remembers what happened) and guardrails (so it stays safe).

&#91;embedded content: basic agent loop · 4 steps with memory and guardrails\]

Read the picture like this: the agent keeps cycling through the four steps, reads and writes memory as it goes, and the guardrails can stop it at any point.

Topics in this module:

- Topic 1: Core Understanding of Agents
- Topic 2: Reactive vs Deliberative Agents
- Topic 3: Tool-Calling Agents
- Topic 4: ReAct Pattern and Reasoning Loops
- Topic 5: Planner-Executor Architecture
- Topic 6: Memory in Agents
- Topic 7: Reflection and Self-Correction
- Topic 8: Single-Agent vs Multi-Agent Systems
- Topic 9: Control and Safety Fundamentals
- Topic 10: Design Thinking and Trade-Offs
- Topic 11: Memory and Caching

**Bold keywords** are the exact terms to use in interviews.

## Topic 1: Core Understanding of Agents

An agent is a system where an LLM is placed inside a control loop so it can plan, act and adjust. This topic explains what makes it different from a normal chatbot and when you should not use one.

### How is an agent different from a normal chatbot?

- A chatbot does one step: question goes in, **LLM** generates text, answer comes out. It may remember the chat history, but it still answers in a single pass.
- An agent runs a **loop**: understand the goal, plan, take an action, look at the result, and go again.
- An agent uses outside things like **tools**, **APIs**, databases or code execution. A chatbot mostly just talks.
- Example: "What is the weather in London?" is a chatbot job. "Book me a flight to London next Tuesday" is an agent job: check calendar, search flights, compare, ask for confirmation, book.

In simple words: the difference is in the **system architecture and control flow**, not just in having an LLM.

### When does adding agent behaviour make things worse?

Agents add cost, delay and more ways to fail. Skip them when:

- **The task is fixed and predictable.** If the steps never change, a hardcoded **workflow** is cheaper, faster and easier to debug. An agent that always calls the same three tools in the same order is just an expensive workflow.
- **Speed matters.** Every reasoning step is another LLM call, so a multi-step agent can take 5 to 30 seconds. Real-time use cases need sub-second answers.
- **Mistakes cannot be undone.** Sending emails, moving money or deleting records need very careful **guardrails**.
- **Cost is not justified.** A 10-step loop can cost about 10x a single LLM call.
- **You need predictability.** Agents are **non-deterministic** at every step, which is a problem in regulated or safety-critical work.

Rule of thumb: build the simplest thing that works, and add agent behaviour only when simpler options truly cannot cope.

### What is autonomy in an agent, and how do you measure it?

**Autonomy** means how much the agent can do without a human stepping in. It is a spectrum, not on/off.

Three dimensions:

- **Decision-making scope:** does it pick its own actions, or just follow a human-made plan?
- **Error recovery:** does it notice failures and adapt, or stop and ask for help?
- **Goal interpretation:** can it turn a vague goal like "research our competitors" into concrete searches and decide when it is done?

How to measure it:

- **Task completion rate** without human help, on a fixed set of test tasks (for example 100).
- **Intervention frequency** in production: how often a human has to step in. Lower means more autonomy.
- **Scope of tasks** it can handle on its own.
- **Clarification rate:** how often it asks questions versus guessing. Neither extreme is good.

### How does an agent decide between answering directly and calling a tool?

- It does not check "do I know this from training data?". It decides from the **tool descriptions**, the **system instructions** and its **function-calling** training.
- Answer directly when the question is conceptual, needs no outside data, or is just reasoning or summarising. Example: "What is gradient descent?"
- Call a tool when it needs external data, access to files or a database, real-time info, or an action. Example: "What is Tesla's stock price right now?"

### Why is decision-making the heart of agent design?

A chatbot only decides the next word. An agent decides something important at every step, and the quality of those decisions decides success.

- **Action selection:** the wrong tool at one step causes a chain of wrong results.
- **Stopping:** too early gives an incomplete answer; too late wastes money and can spoil a good answer.
- **Error handling:** retry, try something else, or escalate to a human?
- **Scope:** knowing what it is allowed to do and what is beyond its authority.

So you are not designing something that writes text, you are designing something that **makes decisions with real consequences**.

## Topic 2: Reactive vs Deliberative Agents

There are two basic styles: react instantly to what you see, or stop and plan before acting. Most real LLM agents mix both.

### What is the architecture difference between reactive and deliberative agents?

- **Reactive agent:** no memory of the world. It looks at the current input and answers right away using **condition-action rules** (perception, then action). Think of a **thermostat**.
- **Deliberative agent:** keeps an internal **world model**, sets a goal, builds a **plan**, then executes it. Think of a chess engine looking several moves ahead.

| Aspect | Reactive | Deliberative |
| --- | --- | --- |
| State | None or minimal | Keeps a world model |
| Planning | None | Makes an explicit plan |
| Lookahead | No | Yes, several steps |
| Speed | Very fast | Slower (planning cost) |
| Complexity | Simple | Complex |
| Adaptability | Low, rule based | High, can **replan** |

In practice most LLM agents are **hybrid**: quick reactive answers for simple queries, deliberate multi-step planning for hard ones.

### When does a reactive agent beat a planning agent?

- **Low-latency systems** that must answer in tens of milliseconds, like **fraud detection** or robot control loops.
- **Deterministic tasks** with a known input-to-output mapping, like **email classification**.
- **High-frequency decisions**, like industrial automation or **streaming monitoring**.
- Environments that change faster than a planner can keep up.

Planning wins when the task needs reasoning, sequencing or exploring options.

### What is the trade-off between speed and reasoning depth?

More thinking means more time, tokens and money.

- **Shallow reasoning:** one LLM call picks the action. Takes hundreds of milliseconds. Good for simple, well-defined, time-sensitive tasks. Risk: poor choices on hard tasks.
- **Deep reasoning:** several calls for planning, acting, verifying, **self-critique** and replanning. Takes seconds to tens of seconds. Good for complex or high-stakes work. Risk: too slow, and cost grows with depth.

Ways to manage it:

- **Adaptive reasoning depth:** a small classifier checks task complexity and routes to a fast or slow path.
- **Streaming and async:** show partial results while deeper work continues in the background.
- **Budgets:** cap the number of steps and tokens, and escalate to a human if it goes over.

Match depth to stakes: a research task deserves 30 seconds, a factual lookup does not.

### How does state persistence differ between the two?

- **Reactive:** basically stateless. Simple and no stale data, but it cannot reason across a sequence of steps or learn from earlier ones.
- **Deliberative:** keeps rich state: the goal, the plan, completed steps, observations, current step, failures and saved artifacts. This can live in memory (one session), in a **database** (across sessions) or be shared (multi-agent).
- Big risk: **stale or wrong state**. If step 2 failed silently and step 3 assumes it worked, everything after is built on a false idea. So record failures explicitly.

### Why do deliberative agents need stronger controls?

They make many decisions in a row on their own, so mistakes pile up.

- **Compounding errors:** a mistake at step 3 may only show at step 8.
- **Irreversible actions:** emails, payments, deletions need **approval gates**.
- **Goal drift:** many small reasonable steps can end up far from the original goal, so check back against the goal now and then.
- **Adversarial inputs:** **prompt injection** hidden in a web page or tool output can hijack the agent. Validate tool outputs and keep an **instruction hierarchy**.
- **Resource exhaustion:** infinite loops or too many tool calls. Set hard limits on steps, tool calls, tokens and time.

## Topic 3: Tool-Calling Agents

Tools are how an agent touches the real world. This topic is about calling them safely, picking the right one, and handling failures.

### What must be true before an agent safely calls a tool?

- **Clear authorization:** asking for a summary does not mean it may send emails.
- **Input validation:** check the arguments the model made up before running them (reject SQL injection patterns, paths outside the allowed folder).
- **Idempotency awareness:** know whether a call is safe to retry. Querying a database is **idempotent**; sending an email is not.
- **Confidence check:** if unsure which record to update, ask the user rather than guess.
- **Rate limit and quota awareness:** do not run out of API quota halfway through.
- **Fallback plan:** have a different recovery path, because repeating the same call usually repeats the same failure.

### How does an agent pick one tool out of many?

- The LLM treats it like a classification problem using the **tool descriptions**, the conversation and the **system prompt**.
- The description is the main clue. A good one says what the tool does, **when to use it**, **when not to**, and what parameters it needs. "search: Search for information" is bad; a clear **web\_search** description with use and do-not-use rules is good.
- Add **routing rules** in the system prompt, such as "customer records go to the database tool".
- Ask the agent to think first (**chain-of-thought**): what do I need, which tool gives it, do I have the arguments?
- When several tools fit, choose the **most specific** one.

### What goes wrong if tool descriptions are vague?

- **Wrong tool chosen**, so the agent reasons on bad data.
- **Wrong arguments**, for example "next Tuesday" sent where a date like 2024-03-19 was needed.
- **Duplicate or conflicting calls** when two tools overlap.
- **Over-use or under-use** of a tool described too broadly or too narrowly.
- **Cascading failures** as later steps build on a wrong result.

Fix: treat tool descriptions like system prompts. Test selection on 50+ varied queries and add explicit "use when" and "do not use when" wording.

### How would you design a tool registry?

A **tool registry** is one central catalog that stores tool definitions and hands them to agents.

- **Standard schema** for every tool: name, **version**, description, parameters (**JSON schema**), return type, required permission, idempotent flag, **timeout** and **rate limit**.
- **Versioning:** agents can be pinned to a version, with deprecation warnings for moving on.
- **Permissions:** the registry only returns tools the agent is allowed to use.
- **Dynamic tool loading:** give the agent only the tools relevant to the task, not all 50 in every prompt.
- **Health monitoring:** track errors and latency, and hide unhealthy tools for a while.

### What kinds of failures happen when a tool runs?

| Failure type | What it looks like | What to do |
| --- | --- | --- |
| Network or availability | API down, **timeout**, **rate limit** hit | Retry with **exponential backoff**, switch to a fallback tool if it persists |
| Input validation | Model sent bad or out-of-range arguments | Read the error and retry with fixed arguments; escalate after two failures |
| Authorization | No permission for this call | Do not retry; tell the user it needs higher permission |
| Semantic | Call works but result is empty or odd, no error thrown | Check the result actually makes sense (hardest to catch) |
| Partial | Only part of the work finished (50 of 100 emails sent) | Track what completed and resume from there, not from the start |
| Silent side effects | Reports success but triggered something unintended | Document side effects in the registry |

## Topic 4: ReAct Pattern and Reasoning Loops

**ReAct** (Reasoning + Acting) is the most common agent loop. The agent writes down a thought, takes an action, reads the result, and repeats. This topic covers why it is useful and how to keep it from running wild.

### What is the reason-act-observe loop and why is it good?

The loop has three repeating parts:

1. **Thought:** "I need the current price of AAPL."
2. **Action:** call a tool, like `web_search`.
3. **Observation:** read what the tool returned, then think again until you can give the **Final Answer**.

Why it is useful:

- **Transparency:** every thought is written down, so debugging is easy.
- **Grounded reasoning:** answers rest on real tool results (observations), not made-up facts.
- **Error recovery:** a surprise result goes into the next thought, and the plan adapts.
- **Step-by-step validation:** each thought-action-observation triple can be checked by itself.
- **Controllability:** you can cap steps, add safety checks before an action runs, and ask a human for approval at chosen steps.

### Why can an uncontrolled loop become unstable?

With no stopping rule, the agent can keep going forever.

- **Circular reasoning:** fetches X, wants to verify X, fetches X again, and so on.
- **Tool failure loops:** keeps retrying a broken tool with the same arguments.
- **Goal ambiguity:** never feels sure the task is done.
- **Conflicting sub-goals:** finishing one undoes the other, so it flip-flops.

Why it hurts: **cost** (tokens and tool fees keep adding up), **time** (the user waits forever), and **repeated harmful actions** (the same email or database write happens again and again).

Must-have controls: a **maximum step count**, **loop detection**, and **escalation** after repeated failures.

### How do you detect an agent that is stuck?

- **Step count limit:** a hard maximum (10, 20 or 50 depending on the task). The simplest and most effective control.
- **Action repetition detection:** same tool with near-identical arguments 2 or 3 times means it is probably stuck.
- **Progress monitoring:** if no new information has been added to its state in about 3 steps, it is not progressing.
- **Reasoning pattern detection:** turn each thought into an **embedding** and compare with **cosine similarity**. Very high similarity (above about 0.95) over several steps means it is going in circles.
- **Explicit loop declaration:** tell the agent to say "STUCK" after repeating an action without success. Less reliable, but a useful extra layer.

### What are the limits of chain-of-thought for multi-step problems?

- **Error propagation:** an early mistake carries into every later step.
- **Hallucinated reasoning:** steps can sound convincing but contain wrong facts.
- **Context usage:** long reasoning traces eat tokens and leave less room for the actual task inputs.
- **Plan rigidity:** once a path is written, the model may stick to it even when new evidence says change course.

Fixes: **tool grounding**, **verification steps**, and architectures like **tree-of-thought** or **planner-executor**.

### How do you stop an agent from making up tool outputs?

Running tools outside the LLM helps a lot, but does not remove the problem completely. Good practices:

- **External tool execution:** the code runs the tool, not the model.
- **Structured tool responses** with source and timestamp fields.
- **Schema validation** of the result.
- **Grounding prompts:** tell the model to use tool results exactly as given, never invent missing fields, and ask for another tool call if something is missing.

## Topic 5: Planner-Executor Architecture

Here one part (the **planner**) decides the steps, and another part (the **executor**) carries them out. Think of an architect drawing the plan and builders doing the work.

### Why split planning and execution into different models?

- It is a design option, not a strict rule. Many production systems work fine with a **single LLM loop**, **ReAct** agents, or **state-machine** orchestrated agents (for example **LangGraph**).
- Benefits of splitting: **clearer task decomposition**, **cost optimization** and **easier debugging**.
- Cost idea: planning needs a strong, expensive model, while simple steps can run on a smaller, cheaper one.
- The choice depends on task complexity, cost limits and latency needs.

### What goes wrong when one model plans and executes?

- **Plan-execution interference:** the model has to juggle the plan and the live execution details at once.
- **Plan drift:** the plan quietly changes as it keeps generating, so behaviour gets inconsistent.
- **No validation gate:** a split system lets a human or a checker approve the plan first; a single model just runs it.
- **Context pollution:** after 10 steps the context is full of tool results, which makes clean planning harder.
- **Replanning complexity:** a separate planner only needs a clean summary: "these steps done, this one failed, replan from here."

### How do you make sure execution follows the plan?

- **Structured plan format:** a machine-readable **JSON** plan with step id, action, parameters, expected output and what to do on failure.
- **Step-by-step verification:** compare each real tool call against the planned one and flag mismatches.
- **Plan checkpointing:** record each completed step and its real outcome, and let the planner check before allowing the next step.
- **Executor constraints:** tell the executor to run only the current step, not skip, not edit the plan, and report failure instead of improvising.
- **Deviation logging:** log any action that was not in the plan, even a sensible one.

### When should you replan instead of carrying on?

Replan when:

- A **prerequisite step failed** and later steps depend on it.
- **New information changes the goal** (the record you wanted to update does not exist).
- **The plan's assumptions were wrong** (service down, missing permission).
- **Time or cost is over budget**, so a cheaper route is needed.

Keep going when:

- A step failed but is **not on the critical path**.
- A result is slightly different from expected but still good enough for the next steps.

### How does task decomposition make agents more reliable?

**Task decomposition** means breaking a big goal into small, checkable pieces.

- **Less load per step:** simple steps are easier for the model and the tools.
- **Verification points:** you catch failures early, not only at the very end.
- **Parallel execution:** independent sub-tasks can run at the same time (up to about 5x faster for 5 searches).
- **Better error recovery:** retry only the failed piece, not everything.
- **Visible progress:** "3 of 7 sub-tasks done" beats "the agent is working".

Tips: give each sub-task a clear input and output, keep them as independent as possible, size each to one LLM call plus tool use, and make dependencies explicit.

## Topic 6: Memory in Agents

Memory lets an agent use what it has already seen or learned. Think of it like a person: what you are holding in your head right now versus what you have written down in a notebook.

### What is short-term vs long-term memory?

|  | Short-term memory | Long-term memory |
| --- | --- | --- |
| What it is | The active **context window** for this session | Saved storage that survives across sessions |
| Holds | Current chat, recent tool results, plan state | User preferences, past interactions, learned facts, task history |
| Size | Limited by the model's context window | Practically unlimited |
| Lifetime | Gone when the session ends | Kept until deleted |
| Access | Instant, it is part of the prompt | Needs a **retrieval** step first |

- Short-term in practice: the **messages array** sent to the LLM.
- Long-term in practice: a **vector store** (semantic search over past interactions) plus a structured **database** for exact facts and preferences.
- A **memory manager** decides what to save at the end of a session and what to load at the start of the next one.
- The catch: long-term memory is only as useful as your **retrieval quality**.

### How does memory change an agent's decisions?

- **Personalization:** remembers "this user likes bullet-point summaries".
- **Avoiding repeated mistakes:** does not retry an approach that already failed.
- **Task continuity:** resumes a long task instead of restarting it, and does not redo finished sub-tasks.
- **Conflict detection:** notices when new information contradicts something it knew before.
- **Context-appropriate replies:** knows what was already said in this conversation.

### When should an agent forget?

Forgetting on purpose is as important as remembering.

- **After a session:** drop the messy process details (intermediate reasoning, tool results), keep the outcome and key lessons.
- **Outdated facts:** give memories a **TTL** (time to live) or version timestamp, and overwrite old facts with new ones.
- **Resolved errors:** keep the fix if useful, not the whole error trail.
- **Irrelevant personal details** shared by accident.
- **Privacy requests:** users must be able to ask for deletion (a compliance need).
- **Noisy entries:** prune memories that keep showing up as irrelevant in retrieval.

### What are the risks of storing too much conversation memory?

- **Context window pollution:** 5,000 tokens of old memory means 5,000 fewer tokens for the current job.
- **Stale information bias:** old preferences may no longer be true.
- **Privacy and compliance risk:** every stored detail is something that can leak.
- **Retrieval noise:** in a huge store, precision drops and loosely related memories sneak in.
- **Memory conflicts:** contradicting entries with no way to tell which is right.

### How do you stop memory leaking between users or sessions?

This problem is called **memory contamination**.

- **Strict user isolation:** tag every memory with a **user ID** and always add a mandatory user filter on retrieval, enforced at the **data layer**, not just in app code.
- **Session isolation:** short-term memory does not flow into the next session; only explicitly saved long-term memories do.
- **Memory write validation:** every write must carry the right user and session IDs.
- **Multi-tenant architecture:** separate memory stores per company (tenant), not only per user.
- **Audit logging:** log every read and write with timestamp, user ID and content hash.

## Topic 7: Reflection and Self-Correction

Reflection means the agent checks its own work, like proofreading an email before you hit send.

### What is self-reflection and when does it help?

The agent writes a first answer or plan, then makes a second pass asking: "Is this right? Any gaps? Is it grounded in the facts I have?"

It helps when:

- **The output is high stakes:** a wrong customer-facing answer costs more than one extra LLM call.
- **The plan is long and complex:** catching a bad plan before step 1 is far cheaper than finding it at step 12.
- **The request is ambiguous:** it can list possible meanings and pick the likeliest.
- **An automated check fails:** for example a low **faithfulness** score or a **schema validation** error, so reflection is a cheap attempt to fix it before escalating to a human.

Not worth it for simple lookups, fixed-format tasks, or outputs that already pass the checks.

### How does critique-based refinement improve answers?

It is a three-step loop:

1. **Generate** a first answer ("Returns allowed within 30 days.").
2. **Critique** it ("Missing packaging rules, refund method and sale items.").
3. **Refine** it using the critique, so the final answer includes those details.

Why it works: in "generation mode" the model aims for a fluent, believable answer. In "critique mode" it hunts for errors and gaps, which uses a different kind of thinking. It improves **completeness**, **accuracy** (catches claims not backed by the **retrieved context**) and **format**.

To save cost, run it only when confidence is low, stakes are high, or a check fails.

### What are the risks of recursive self-correction?

- **Convergence failure:** each revision creates something new to critique, so it never settles.
- **Regression:** fixing problem A brings back problem B, a whack-a-mole cycle.
- **Quality degradation:** too many rounds drift away from the original intent.
- **Hallucination amplification:** every extra pass is another chance to add a wrong fact.
- **Cost explosion** with no iteration limit.

Controls: a **max iteration count** (usually 2 to 3), **early stopping** if the new version is semantically almost the same, and comparing against the original on key quality metrics before accepting.

### How do you add reflection without doubling the cost?

Full reflection (generate, critique, revise) is about 3x the LLM calls. Keep it cheap by:

- **Conditional reflection:** score the first output, and only reflect if the score is below a threshold. If 70% pass, average cost is about 1.3x instead of 3x.
- **A lightweight critique model:** a small, fast model (like **GPT-4o mini** or a fine-tuned small model) can cut critique cost by 80 to 90%.
- **Focused critique prompts:** check a short list (are claims cited, are fields present, is tone right) instead of "critique this".
- **One-pass revision:** critique once, revise once, then commit.

### When is reflection unnecessary?

- **Rule-checkable tasks:** use **JSON schema validation**, **regex** or **unit tests** and regenerate with the error message if it fails.
- **High-confidence outputs** that already match the expected pattern.
- **Simple factual lookups** (if retrieval was wrong, reflection cannot fix it anyway).
- **Real-time interactions** where speed comes first.
- **Low-stakes drafts** that a human will review anyway.

## Topic 8: Single-Agent vs Multi-Agent Systems

A single agent does everything itself. A multi-agent system splits the work between several agents, like a project manager handing tasks to specialists.

&#91;embedded content: single agent vs multi-agent · orchestrator and shared state\]

Read the picture like this: on the left one agent talks to its tools; on the right an orchestrator hands work to several agents, and they all coordinate through shared state and a message queue.

### What must change when you go from one agent to many?

It is not just "add more agents". You need:

- **Communication infrastructure:** agent-to-agent channels like **message queues**, shared state stores or direct API calls.
- **An orchestration layer:** an **orchestrator** (coordinator) that assigns sub-tasks, tracks completion and puts results together.
- **Shared state management:** a shared store such as **Redis** or a database replaces one agent's in-memory context.
- **A task definition protocol:** each task has a description, tools available, expected output format, success criteria and timeout.
- **Result aggregation:** often a **synthesis agent** that combines everyone's results.
- **Failure propagation rules:** retry, reassign, or fail the whole job?

### When is multi-agent truly useful?

- **Parallelizable tasks:** independent sub-tasks (many searches, batch document processing) run at the same time.
- **Specialized expertise:** for example a code-writing agent, a **code-review** agent and a documentation agent.
- **Scale beyond one context window:** each agent handles a slice and reports a summary.
- **Quality through debate:** a **generator** agent and a **critic** agent push each other to better answers.

Stay with a single agent for sequential tasks, tasks where sharing context between steps matters, cases where coordination costs more than it saves, and whenever you cannot answer "why can one agent not do this?".

### What communication rules do agents need?

Ad-hoc chat between agents gives inconsistent behaviour, so make it structured, reliable and auditable.

- **Task handoff protocol:** a structured **JSON** message with task ID, assignee, description, available tools, expected output, timeout and priority.
- **Result return protocol:** status (success or failure), the result, sources, **confidence** and tokens used.
- **Shared message bus:** a queue such as **Kafka**, **RabbitMQ** or a simple **Redis** queue, using publish and subscribe so agents are not wired directly to each other.
- **Heartbeat and health:** each agent sends a regular health signal, and the orchestrator reroutes work away from unhealthy ones.

### How do you prevent coordination conflicts?

- **Explicit task ownership:** one task, one agent at a time. An agent must **claim** it first, and the claim is exclusive.
- **Resource locking:** **optimistic or pessimistic locking** when writing to shared files, databases or APIs.
- **Consistent state snapshots:** read from a stable snapshot, using **transactional reads** where possible.
- **Idempotent operations:** doing a step twice gives the same result as once.
- **Conflict detection on write:** if agent A says a customer is inactive and agent B says active, catch it before either is used.
- **Explicit dependency graph:** the orchestrator enforces order (B waits for A's task).

### What are the risks of emergent behaviour?

**Emergent behaviour** means things that come out of agents interacting and that nobody programmed on purpose.

- **Goal misalignment through specialization:** each agent optimizes its own goal (find many documents vs cut API cost) and they clash.
- **Uncontrolled resource consumption:** agents spawning agents can grow exponentially without limits.
- **Information cascades:** a slightly uncertain claim from agent A becomes "fact" for B and C, and ends up confidently wrong.
- **Coordination lock (deadlock):** agents wait on each other forever.
- **Reward hacking:** the system games the overall metric and breaks the spirit of the goal (**Goodhart's Law**: when a measure becomes a target, it stops being a good measure).

## Topic 9: Control and Safety Fundamentals

This topic is about keeping an agent safe, watchable and inside its limits. Think of it as the seatbelts, speed limiter and dashcam of an agent.

### How do you put guardrails in the reasoning stage, not just on the final output?

Output guardrails catch problems after the thinking is already done. Reasoning-stage guardrails stop problems before they happen.

- **Input classification first:** sort the request before the agent starts thinking. If it is prohibited, return a fixed reply. Cheapest and most reliable.
- **Reasoning constraints in the system prompt:** before each action ask "is this in scope, does it need confirmation, could it cause irreversible harm?"
- **Tool call validation before execution:** a validation layer checks permission, argument ranges and user confirmation for irreversible tools.
- **Thought content monitoring:** in **ReAct** style agents, watch the thoughts live and interrupt on worrying patterns.
- **Step-level human approval gates:** certain action types cannot run without a human sign-off.

### Why does an agent need more observability than a RAG system?

Agents have **dynamic control flow**, **iterative reasoning**, **tool execution** and **state updates**, so you cannot tell what happened from input and output alone. (A simple **RAG** pipeline has fewer branches, though modern production RAG can also get complex.)

What to record:

- **Reasoning trace** (every thought)
- **Tool calls** and their results
- **State transitions**
- **Execution latency**
- **Error propagation** (where a mistake started and how it spread)

### How do you limit reasoning steps safely?

- **Hard step limit:** a loop with a **MAX\_STEPS** value (for example 20).
- **Graceful degradation:** at the limit, do not just throw an error. Ask the agent for a **best-effort summary** of what is done and what is left.
- **Adaptive limits by task type:** about 5 for simple tasks, 20 for research, 50 for complex workflows, chosen by classifying the task first.
- **Soft warnings:** at about 80% of the budget, tell the agent "you have used 16 of 20 steps, finish the important parts".
- **Monitor step distribution:** if most tasks need 5 steps but many hit 20, the limit is wrong or the agent is inefficient.

### Which metrics show an agent is behaving unreliably?

| Metric | What it tells you |
| --- | --- |
| **Task completion rate** | Below about 80% without human help is a problem; track by task type |
| **Step count distribution** | Wide spread (usually 5 steps, sometimes 20) means erratic decisions |
| **Tool error rate** | High rate: bad arguments (reasoning issue) or flaky tools (infra issue); split by tool |
| **Retry frequency** | Many retries mean wrong calls on the first try |
| **Loop detection triggers** | Any non-zero rate needs a look |
| **Output faithfulness** | Falling grounding or correctness means reasoning is degrading |
| **User escalation rate** | Users correcting or overriding the agent more often is an early warning |

### How do you simulate attacks and bad situations in testing?

This is **adversarial testing**: push the agent into scenarios that are rare but dangerous.

- **Prompt injection attacks:** hide "ignore previous instructions" in tool outputs, documents or user messages, and check it is ignored.
- **Tool failure injection:** force timeouts, empty results, malformed responses, permission errors and rate limits, and check the agent recovers calmly.
- **Goal hijacking:** a sub-step result suggests a very different action ("the order should be deleted") when the task was only to check status. Does it stay in scope?
- **Resource exhaustion attacks:** recursive or fan-out tasks to confirm rate limits and step limits hold.
- **Ambiguous permission scenarios:** gray-area tasks. Does it escalate or just decide?
- **Contradictory instruction sets:** does it spot the conflict and ask, or silently pick one?

## Topic 10: Design Thinking and Trade-Offs

Building agents is mostly about choosing what NOT to build. This topic is about picking the simplest design that works and spotting where designs go wrong.

### How do you decide between an agent and a simple workflow?

The default is always the simplest thing that works.

| Use a simple workflow when | Use an agent when |
| --- | --- |
| Steps are always the same and known up front | Next steps depend on results you cannot know in advance |
| No branching on intermediate results | The task needs dynamic decisions about which action to take |
| Each step is deterministic | Different inputs truly need different approaches |
| Reliability matters more than flexibility | Failures must be recovered in ways you cannot hardcode |

- **Decision test:** can you draw the whole flowchart before seeing the input? If yes, use a **workflow**. If a box says "decide based on the result", you need agent behaviour at that spot.
- **Hybrid approach:** a deterministic workflow for the normal path, and agent behaviour only for exceptions and recovery.

### What are the signs of an over-engineered agent system?

- An agent that always runs the **same steps**, which is just a slow, costly pipeline.
- **Multi-agent** setups for a task one person could do in 30 minutes.
- A **planner** that always produces the same plan.
- **Reflection loops** that never change the output (two LLM calls for one call's value).
- A **tool registry** with one tool (just a function wrapper).
- Heavy **state management** for tasks that are completely independent.

Simplest test: remove the fanciest component and measure. If performance does not drop, it was over-engineering.

### How do you balance autonomy with deterministic control?

Pick a spot on the spectrum for each task type, based on risk.

- **Full autonomy:** low stakes, reversible actions, reliable agent (booking a meeting room, looking up public info).
- **Supervised autonomy:** the agent works alone but pauses for approval before consequential actions (sending an email, changing a database record).
- **Human-directed automation:** a human approves every step for high-stakes work (payments, medical decisions, legal changes).

Implementation patterns:

- **Confidence thresholds:** act alone above a threshold, ask a human below it.
- **Action classification:** label every action as "safe", "needs user confirmation" or "needs admin approval", enforced in the **tool execution layer**, not in the model's reasoning.
- **Audit trail:** log all actions with reasoning traces, because autonomy must not mean opacity.

### How does cost grow with reasoning depth?

Two things push cost up: **more LLM calls**, and a **growing context window**. Each new step adds tokens, and every later call re-reads all earlier tokens (for example 1000, then 1500, then 2000 tokens per call), so in bad cases cost grows close to **quadratically**.

That is why production agents use:

- **Context pruning**
- **State summarization**
- **Scratchpad compression**

### Agent works in testing but badly in production. What do you check first?

- **Input distribution shift:** real users phrase things differently. Compare the **embedding** distribution of the first 1,000 production queries with your test set.
- **Tool reliability:** tests use perfect **mock tools**; production has rate limits, downtime and odd edge cases.
- **Concurrency effects:** hundreds of parallel users expose **race conditions**, shared-state bugs and quota exhaustion.
- **Context window behaviour at scale:** real conversations get long; test with realistic long contexts.
- **Latency effects:** an agent tuned for 50 ms tool replies may behave differently at 2 seconds. Check **timeout handling**.
- **User behaviour:** real users give incomplete info, try edge cases and push limits that synthetic tests miss.

## Topic 11: Memory and Caching

This topic goes deeper on how agents store knowledge for long tasks and for teams of agents, and how to avoid repeating work.

### How would you design persistent memory for long-running, multi-session agents?

Use several memory types, but only fetch what the task needs.

- **Episodic memory:** a record of past task runs, useful for "how did we handle something like this before?"
- **Semantic memory:** general knowledge distilled from repeated experience, used when the task touches known domain patterns.
- **Procedural memory:** reusable workflows or strategies, used when the task matches a known procedure.

**Tiered retrieval** (the recommended way):

1. Work out the **task type**.
2. Query only the **relevant memory types** (for example episodic top 3, semantic only if domain knowledge is needed, procedural top 1 only if a known procedure matches).
3. Keep only a small number of **high-confidence** results.

This lowers latency and token use and avoids overloading the context.

### How is short-term working memory different from long-term knowledge memory?

- **Working memory** holds the current task context, plan and reasoning state, tool outputs and intermediate results. In small tasks it lives entirely in the **context window**.
- In long tasks it can overflow, so earlier information moves to an **external scratchpad store**, and the agent pulls back only the relevant bits (**scratchpad retrieval**).
- Simple picture: active context window, then external scratchpad store, then selective retrieval of the needed intermediate state.
- So working memory is usually read in order, but large task states may still need a retrieval step.

### How do you cache repeated tool calls?

Use two layers:

1. **Exact parameter caching (the safe default):** key is the tool name plus **normalized parameters**, value is the cached result. Always correct for deterministic tools.
2. **Semantic similarity caching (optional):** reuse a result when a new query is very close in meaning. Only when the tool is deterministic, the input is text, and small wording changes give the same answer.

| Safe to semantic-cache | Not safe |
| --- | --- |
| Web search | Real-time APIs |
| Document retrieval | Time-sensitive queries |
| Knowledge base queries | Financial or market data |
|  | User-specific queries |

Control this with **tool capability metadata** (for example `is_deterministic` and `supports_semantic_cache` flags). Without it you can serve wrong or stale answers.

### How do multiple agents share a memory store without conflicts?

Design it as **read-heavy, write-careful**: reads are fast and concurrent, writes are coordinated.

- **Append-only shared knowledge log:** agents only add new entries and never edit old ones. Each entry has an ID, agent ID, type, content, **confidence**, a **supersedes** pointer (which older entry it replaces), a timestamp and a status. Entries are also indexed as **embeddings** for search.
- **Conflict detection:** when a new entry arrives, search for similar existing entries (similarity above about 0.85) and use an LLM check to see if they **contradict**.
- **Conflict resolution:** send conflicts to a **resolver agent** or **human review** instead of silently accepting them.

### How do you let agents coordinate without overwriting each other's reasoning?

Combine three mechanisms:

- **Append-only event log:** keeps updates auditable and unchangeable.
- **Conflict detection:** spots semantic clashes between entries.
- **Resolution or reconciliation layer:** fixes clashes through **automated consistency checks**, **consensus mechanisms** or **human review**.

Flow: agent write, then append-only log, then conflict detection, then resolution workflow, then a resolved knowledge state. The log keeps history but still needs the resolution step to produce usable shared knowledge.

### How do you control memory growth and avoid overwrites in long-running agent systems?

The course answer for this one focuses on safe coordination patterns so the store stays clean as it grows:

- **Namespace isolation:** each agent has a private space, like `agent:{agent_id}:private`.
- **Append-only shared results:** agents publish outputs under their own key, like `task:{task_id}:results:{agent_id}`, instead of overwriting shared state.
- **Versioned shared state:** use **version numbers** and reject updates made on an out-of-date version (a **conflict error**).
- **Optimistic concurrency control** (version checking) is usually preferred over heavy **locking**, because it scales better under many concurrent writers.

For growth itself, reuse the forgetting ideas from Topic 6: **TTLs**, summarising old entries, and pruning noisy or outdated memories.
