# Module 6 – Agent Frameworks & Ecosystem (Beginner Guide + Keywords)

Oct 4, 2026 · @Sourav Banerjee

## Overview

An agent framework is a ready-made toolkit that handles the boring plumbing of an AI agent: calling tools, remembering things, and deciding what to do next. This module compares the popular ones, and each one organizes the work in a different way: a single loop, a map of steps, a team of roles, a conversation, or a tree of agents. It ends with MCP, the common plug that lets any of them talk to tools.

&#91;embedded content: agent frameworks map · 5 frameworks + MCP\]

Read it left to right: pick the style that matches how your task naturally splits up, and MCP sits underneath as the shared way to reach tools.

Topics in this module:

- Topic 1: LangChain Agents (the classic agent loop and its limits)
- Topic 2: LangGraph (agents as a map of steps with shared state)
- Topic 3: CrewAI (a team of agents with roles)
- Topic 4: AutoGen (agents that solve things by chatting)
- Topic 5: Google Agent Development Kit (ADK)
- Topic 6: Model Context Protocol (MCP)

The **bold keywords** are the exact terms to use in interviews.

## Topic 1: LangChain Agents

LangChain is the most popular toolkit for building an LLM agent quickly. It is great for prototypes, but you need to know where it starts to hurt.

### How does LangChain decide which tool to use and run it?

A manager loop called **AgentExecutor** does the work. Think of it like a waiter between the chef (the LLM) and the kitchen tools.

1. The executor sends the chat history, the earlier steps (**intermediate steps**) and the list of tool descriptions to the model.
2. The model answers with either a tool call or a final answer.
3. If it is a tool call, the executor finds that tool, runs it, and adds the result to the step list.
4. The updated context goes back to the model, and the loop repeats.

The loop stops when the model gives a final answer, or when it hits **max\_iterations**, **max\_execution\_time**, or an error. LangChain supports several agent styles (**ReAct**, **OpenAI function-calling**, **LCEL**-based, **LangGraph**-backed), so the exact flow differs a little between them.

### What limits LangChain agents on multi-step tasks?

The classic agent is a simple "think, use tool, look at result, repeat" loop, and that causes some problems:

- **Sequential**: one step at a time, with no native parallel tool runs. Parallel work needs **LCEL** runnables, **LangGraph** or custom code.
- **Messy state**: progress is just a growing list of action and result pairs, with no strong typing, so it gets big and hard to manage.
- **Weak error handling**: retries, fallbacks and conditional routing have to be built by hand.

These limits are for the classic executor. For complex flows, **LangGraph** is now the recommended answer.

### How can I control tool routing myself instead of trusting the LLM?

By default the model picks tools from their descriptions. You can add your own rules on top:

- **Deterministic routing with LCEL**: use a **RunnableLambda** that checks keywords (for example "invoice" goes to the billing tool).
- **Tool filtering by user**: give each request only the tools that user is allowed to use (for example admin tools only for admins).
- **Hybrid routing**: use fixed rules for obvious cases and let the LLM decide the unclear ones. This cuts wrong tool picks and keeps flexibility.

### How does LangChain remember the conversation, and where does it break at scale?

Memory classes store the chat history and paste it into each new LLM call.

| Memory type | What it does |
| --- | --- |
| **ConversationBufferMemory** | Keeps the whole chat. Overflows the context window after many turns |
| **ConversationBufferWindowMemory** | Keeps only the last K turns. Forgets older context |
| **ConversationSummaryMemory** | Uses an LLM to summarize. Keeps the gist but costs extra calls and latency |
| **ConversationSummaryBufferMemory** | Recent turns word for word plus a summary of older ones. Best quality, most complex |

Problems at scale:

- Memory lives in Python objects by default, so it is lost on restart and not shared between servers behind a load balancer.
- There is no automatic expiry (**TTL**), so conversations pile up in RAM.
- Moving to **Redis** or **DynamoDB** (for example **RedisChatMessageHistory**) needs careful session handling.
- Memory is per session only, with no built-in long-term memory across chats.

### When do LangChain agents become hard to debug in production?

- **Deep layers**: an error travels through many internal layers before it reaches your code, so it is hard to see what the agent was trying to do.
- **Callbacks needed**: without **callbacks** you only see input and output, and the callback API has changed between versions.
- **Opaque steps**: **intermediate\_steps** are raw tuples, so you have to parse them to learn which tool ran, with what arguments, and how long it took.
- **Non-deterministic**: the same input can pick different tools on different runs, which makes bugs hard to reproduce.
- **Version changes**: behavior shifts between minor versions, so pin your version.

### How do I force structured output from a LangChain agent?

- **PydanticOutputParser**: checks the model output against a schema. If it fails, you can retry.
- **OutputFixingParser**: sends the broken output and the error back to the LLM so it can repair it.
- **Function calling / tool calling**: the model returns JSON arguments that match a schema. The shape is reliable, but the values can still be wrong, so check meaning too.

### When should I skip LangChain agents and write my own orchestration?

LangChain is good for fast prototypes. Switch to custom code (plain Python, **asyncio**) when you have:

- Complex branching and parallel paths with shared state.
- Strict latency targets (**SLAs**), since the abstractions add overhead.
- Advanced error handling such as per-step retries, fallbacks and **circuit breakers**.
- A big team that finds the changing LangChain API hard to learn.
- Deep integration needs with existing infrastructure (auth, observability, service mesh).

Simple rule: use LangChain for prototypes and simple **RAG** plus tool pipelines; replace the core when the prototype shows needs it handles badly.

## Topic 2: LangGraph

LangGraph lets you draw your agent as a map: boxes (nodes) for steps and arrows (edges) for what happens next, with a shared notebook (state) that every box can read and update.

### How is LangGraph different from a normal LangChain chain?

A chain is a straight line: step A, then B, then C, once each. A LangGraph workflow is a **directed graph** that can branch and loop.

- **State as a first-class object**: a typed state is passed through the graph. Each node returns only the parts it changed.
- **Conditional edges**: a small function looks at the state and picks the next node (for example, good result goes on, bad result goes to retry).
- **Cycles**: retry and reflection loops are natural, with a stop condition.
- **Built-in persistence**: **checkpointing** saves the state after each node so long jobs can survive interruptions and pause for human approval.

### How is state shared between nodes?

You define a **TypedDict** state (for example task, messages, retry\_count). Each node reads the full state and returns a small update.

- Normal fields: the last write wins.
- List fields with a **reducer** (for example **operator.add**): new items are appended instead of replacing the old ones. This is how messages and tool results pile up.
- After each node, the state and the graph position are saved to a store: **SQLite** for development, **Postgres** or **Redis** for production.
- This allows resuming after a restart, **human-in-the-loop** pauses, and inspecting the state at any step for debugging.

### How do I do conditional branching?

Use **add\_conditional\_edges**: after a node, call a routing function that returns the name of the next node.

- Example: after retrieval, if the score is high go to "generate answer", if it is low and retries remain go to "rewrite query", otherwise "escalate to human".
- Rewrite goes back to retrieve, which makes a retry loop.
- For parallel work, the **Send API** fans out the state to many nodes at once (for example one worker per sub-question).

### How do I stop infinite loops in a graph?

- **Counter**: keep a **retry\_count** in state and exit to a graceful-failure node after the max.
- **Quality check**: stop when a score (for example faithfulness) passes a threshold, or after a max number of reflections.
- **No-progress detection**: compare a hash of the state and force exit if nothing changes.
- **recursion\_limit**: a built-in setting on invoke. Hitting it raises **GraphRecursionError** instead of running forever.

### How does LangGraph make agents easier to observe?

- **Node-level streaming**: **app.stream** emits an event after every node with its name and state changes, so you get a free trace.
- **State inspection**: because of checkpoints you can look at the exact state at any step (for example with **SqliteSaver**).
- **Graph visualization**: draw the workflow as a diagram (**draw\_mermaid\_png**), which doubles as documentation.
- **LangSmith**: native integration records every node run, state change and LLM call in a visual UI.

### When should I use a planner-executor design?

Split "make a plan" from "carry out the plan". Use it when:

- The task is high-stakes (data migration, mass emails, production config), so someone or something should review the plan before anything runs.
- The task has dependent steps, such as research: plan what to check, run each check, then write a summary.

In LangGraph: a **planner** node writes the list of steps, an **executor** node does one step at a time, a router loops until all steps are done, then a **synthesize** node writes the final answer.

### How do I add retries and error handling?

Treat errors as just another state. Tool nodes catch exceptions and write **last\_error** and **error\_type** into state. A router then sends the flow to the right place:

- **Rate limit**: wait, then retry.
- **Validation error**: fix the arguments and retry.
- **Permission error**: do not retry, escalate to a human.
- Too many retries: go to a graceful-failure node.

### When is a graph better than plain sequential code?

|  | Sequential | Graph (LangGraph) |
| --- | --- | --- |
| Good at | Simple and easy to read, test and run fast | Branching, loops, parallel work, persistence, human approval |
| Best for | Straight pipelines like retrieve, rank, generate | Retry loops, planner-executor, multi-agent with shared state, long tasks |

A good hybrid: keep the happy path as a simple **LCEL** chain, and wrap it in a LangGraph node when you need loops, branches or saved state.

## Topic 3: CrewAI

CrewAI treats agents like a small team at work: each member has a job title, a goal and a story, and they hand work to each other.

### How does CrewAI set up role-based teamwork?

Each **Agent** has a **role**, **goal**, **backstory**, **tools** and an **LLM**. These fields are turned into its system prompt. You then create **Tasks** (with a description and **expected\_output**), assign each to an agent, and put everything in a **Crew** that you start with **kickoff**.

- A task can receive the output of earlier tasks through **context**.
- You can give cheaper models to simple roles (for example a writer on a smaller model).
- Roles shape the style of reasoning, but they do not strictly limit behavior. An agent can still step outside its role unless the task wording sets limits.

### How do agents coordinate with each other?

- **Sequential process** (**Process.sequential**): tasks run in order, and each output is passed on as context.
- **Hierarchical process** (**Process.hierarchical**): a **manager agent** on a stronger model (**manager\_llm**) decides who does what, like a project manager.
- **Context passing**: a task lists which earlier tasks it depends on.
- **Delegation** (**allow\_delegation=True**): agents hand sub-tasks to teammates. Very flexible but hardest to control.
- **Shared memory**: a common store the agents can read and write during the run.

### How do I stop crew members from making conflicting decisions?

- Use a **hierarchical** setup so the manager has the last word and settles disagreements.
- Give each task a **clear scope** in words (for example "analyze the market ONLY, no product advice").
- Force a **structured output** (**output\_json** with a schema) so overlaps are easy to spot.
- Add a **reviewer agent** at the end to catch inconsistencies.

### How do I keep the cost down with many agents?

Every extra agent multiplies the bill, so:

- **Model tiering**: expensive model (for example **GPT-4o**) only for hard roles, small model (**GPT-4o-mini**) for research and formatting.
- **Fewer agents**: do not create an agent for something one LLM call can do.
- **Trim context**: pass only what the next task needs (for example a synthesis rather than five raw outputs).
- **Cache** final results for repeated inputs, keyed by a hash of the input.

### What failures are special to role-based teams?

- **Role hallucination**: an agent takes on duties that belong to someone else.
- **Echo chamber**: the manager just approves the specialists, especially on the same base model.
- **Context propagation errors**: a mistake in task 1 is treated as a fact by everyone after it.
- **Responsibility diffusion**: nobody owns the quality of the final answer.
- **Context budget overload**: so much previous output piles up that the last agent has little room to think.

### When should I pick CrewAI over LangGraph?

| Pick CrewAI when | Pick LangGraph when |
| --- | --- |
| Work splits naturally into roles (research, analysis, writing) | You need complex branching and conditional control |
| The flow is fairly fixed (A, then B, then C) | You need saved state, long runs and human-in-the-loop |
| You want a fast prototype with little code | You need fine-grained observability of every step |

## Topic 4: AutoGen

AutoGen builds multi-agent systems as a group chat: agents send each other messages, and the conversation itself drives the work.

### How do AutoGen agents talk to each other?

Agents pass messages. Each message can trigger a reply, a tool call, or the end of the chat.

- A typical pair is an **AssistantAgent** (the LLM brain) and a **UserProxyAgent** (acts for the user and can run code), started with **initiate\_chat**.
- In a group, a **GroupChat** holds all the agents and a **GroupChatManager** (an LLM moderator) picks who speaks next from the chat history. This is routing by conversation, not by graph arrows.

### What are the benefits of the conversation style?

- **Natural handoff**: when the coder finishes, the reviewer simply responds, with no edges to define.
- **Flexible roles**: the manager can call on any agent when something unexpected comes up.
- **Refinement by dialogue**: reviewer and coder go back and forth and improve the result.
- **Code execution built in**: the assistant writes code, the **UserProxyAgent** runs it, and the output goes back as the next message.
- **Human-in-the-loop** feels natural: set **human\_input\_mode** to ALWAYS or TERMINATE and a person can join anytime.

### How do I control how long the conversation runs?

Otherwise chats can loop forever and burn tokens. Use several brakes:

- **max\_consecutive\_auto\_reply**: cap on automatic replies.
- **is\_termination\_msg**: a function that ends the chat when a keyword (for example TASK\_COMPLETE) appears. Tell agents to say it when done.
- **max\_round** in the group chat: a hard cap on rounds.
- A custom **GroupChatManager** (override **select\_speaker**) for complex stop rules.
- A **token budget** check that stops and asks for a summary before money runs out.

### How do I build a moderator agent?

A moderator decides who speaks and keeps the chat on track.

- **Rule-based**: a custom **speaker\_selection\_method** function (for example code written goes to the reviewer, REVISION\_NEEDED goes back to the coder, APPROVED goes to the writer, otherwise let the LLM decide).
- **A dedicated Moderator agent**: its system message tells it to check each contribution, direct the next agent, ask for fixes, and say TASK\_COMPLETE at the end.

### What risks come from emergent behavior?

- **Sycophantic agreement**: agents politely agree, so one wrong claim becomes a shared fact.
- **Role boundary erosion**: over a long chat a reviewer starts coding and a researcher starts recommending.
- **Compounding hallucinations**: each agent builds on the last one's invention.
- **Goal displacement**: the team hits a proxy goal (tests pass) but misses the real one.
- **Prompt injection**: a malicious web page or file read by one agent can redirect everyone.

### How do I check that AutoGen workflows really finish the job?

- **LLM verifier**: a second prompt that compares the original task with the final output and says yes, no or partial, with confidence.
- **Known-answer test set**: coding tasks checked by unit tests, research tasks checked against known facts, analysis checked against expert labels.
- **Metrics**: task completion rate, revision rate, truncation rate (how often **max\_round** is hit), and human escalation rate.
- **A/B tests** of different agent mixes, models and prompts on the same tasks.

## Topic 5: Google Agent Development Kit (ADK)

ADK is Google's toolkit for building agents, aimed at production and enterprise use on Google Cloud, with security and evaluation built in.

### What ideas does ADK promote?

- **Modularity**: tools, agents, orchestration and evaluation are separate pieces you can test on their own.
- **Explicit tool contracts**: each tool has an input schema, output schema and documented side effects.
- **Multi-agent composition**: agents call other agents the same way they call tools.
- **Evaluation first**: test harnesses and metrics are part of the framework.
- **Safety built in**: input and output validation, permissions and audit logs.
- **Cloud-native**: works with **Vertex AI**, **Cloud Run**, **Cloud Logging** and **Secret Manager**.

### How does ADK keep development modular?

Three building blocks: a **tool** (a standalone class with typed input and output), an **agent** (a reusable unit with its tools and system prompt), and an **orchestrator** agent that uses other agents as tools (for example sub-agents for customer service, tech support and billing).

### How are tools and permissions managed?

- A central **tool registry** stores each tool with its permissions, **rate limit**, allowed environments and version.
- **Permission-based access**: build the agent for a user so it only gets the tools that user's roles allow.
- **Versioning and deprecation**: agents can be pinned to a tool version so upgrades do not break them.
- **Runtime permission checks** happen in the framework before each tool call, not in your app code.

### How would I design an enterprise-grade ADK agent?

- **Security config**: **PII detection**, **prompt injection detection**, output validation and an audit log of every action.
- **Compliance**: frameworks like **SOC2** and **GDPR**, **data residency** in a chosen region, and a retention period.
- **Multi-tenant isolation**: all tool calls are scoped to the tenant.
- **SLA enforcement**: a latency target (**p99**), an error-rate limit, an automatic **circuit breaker** and a **fallback agent**.

### Why choose ADK over a lightweight framework?

| ADK advantages | ADK downsides |
| --- | --- |
| Built-in evaluation (golden datasets, A/B tests) | Higher learning curve |
| Agents-as-tools multi-agent support | More boilerplate for simple agents |
| Built-in PII, injection and permission controls, audit logs | Cloud features assume Google Cloud (**GCP**) |
| Native **Cloud Logging**, **Cloud Trace**, **Cloud Monitoring** | Smaller community and fewer tutorials |

Choose ADK when the team is on GCP, compliance matters, and you need evaluation plus multi-agent setups. Otherwise a lighter tool may be quicker.

### How do I plug ADK into existing cloud systems?

- **Deploy on Cloud Run** like any service, with min and max instances for latency and scale.
- **Wrap existing REST APIs** (for example an internal CRM) as tools, using a service account for auth.
- **Event-driven**: trigger agents from **Pub/Sub** messages.
- **Auth**: Google **service accounts** and **Workload Identity**, so existing **IAM** and **VPC Service Controls** apply.

## Topic 6: Model Context Protocol (MCP)

MCP is a common plug standard that lets AI apps connect to tools and data in one agreed way, like USB-C for AI.

### What problem does MCP solve?

Without a standard, every AI app needs a custom connector for every tool: M apps times N tools means M x N integrations, and any API change breaks them one by one.

With **MCP**, a tool provider builds one MCP server and an app builds one MCP client, so the work becomes M + N. MCP standardizes:

- **Tool discovery** (what tools exist)
- **Tool invocation** (the call format)
- **Result format**
- **Context sharing**
- **Authentication**

### How does MCP give every model the same way to use tools?

It uses a **client-server** design. The tool owner runs an **MCP server** that lists its tools (name, description, **input schema**) and handles calls (for example **list\_tools** and **call\_tool**). The AI app runs an **MCP client** that connects, lists tools and calls them in the same way for GitHub, Slack, Salesforce or anything else. The app does not need to know each tool's own API.

### Does MCP help different agent frameworks work together?

In theory yes. A tool built once as an MCP server could be used by **LangChain**, **AutoGen**, **CrewAI** or custom agents, with shared tool discovery and reusable integrations.

In practice it is still young: framework support is incomplete, the spec keeps changing, and many frameworks need **adapters**. So treat it as good for early production and experiments, not universal yet.

### What are the security risks of exposing tools through MCP?

A standard door for tools is also a standard target.

- **Authentication and authorization**: verify who is calling and what they may do, using **OAuth 2.0** with scoped tokens (**JWT**).
- **Input validation**: a model tricked by **prompt injection** can send bad arguments, so always sanitize.
- **Capability creep**: follow **least privilege** and expose only what the agent needs.
- **Transport security**: **TLS** (HTTPS or WSS) for remote servers; local servers can use Unix sockets.
- **Rate limiting** at the MCP server so a runaway agent cannot drain quotas.

### How can agents share context through MCP?

- **Resources**: MCP's standard way to expose data by a URI (for example the current task state or a shared semantic memory). Any agent reads it with the same call (**read\_resource**).
- **Tools for writing**: a tool such as update\_shared\_context lets agents write to the shared store.
- The benefit: a planner and an executor built in different frameworks can share the same context.

### What are the limits of relying on MCP across platforms?

- **Immaturity**: the spec still changes, so manage versions carefully.
- **Adoption gaps**: not every tool speaks MCP, so you still write wrappers.
- **Latency**: an extra network hop on each tool call.
- **Limited expressiveness**: streaming, two-way talk and event subscriptions are not fully standardized.
- **Hard debugging**: a failure could sit in the client, network, server, or the tool API.
- **Vendor incentives**: big platform vendors (for example Salesforce, ServiceNow, SAP) may be slow to adopt because it weakens lock-in.

### How would I build an enterprise tool registry for MCP?

A central catalog of all MCP servers in the company:

1. **Register** a server: connect, discover its tools, and store owner, **data classification**, compliance tags, **SLA** and version.
2. **Discover** tools: search the catalog and return only the tools the agent's permissions allow.
3. **Get a client**: check permissions, then issue a short-lived scoped token for an authenticated MCP client.

Governance extras: a **security approval** step before a tool becomes visible, **deprecation** with a grace period, **usage analytics** (cost attribution and audits), and **health monitoring** that hides unhealthy servers.
