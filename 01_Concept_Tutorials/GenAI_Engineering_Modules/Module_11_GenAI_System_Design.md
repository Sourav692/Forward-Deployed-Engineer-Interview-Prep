# Module 11 – GenAI System Design (Beginner Guide + Keywords)

Oct 4, 2026 · @Sourav Banerjee

## Overview

This module is about how to design a GenAI application so it keeps working when thousands of real people use it. Building a demo that calls a model once is easy. Making it fast, cheap, watched, safe and easy to update is the real job, and it is what system design interviews test.

&#91;embedded content: GenAI system architecture · 6 topics marked\]

A request flows left to right from the user to the models. Each circled number shows where one of the six topics applies.

The module has six topics:

- Topic 1: Architecture Design for GenAI Systems (how the pieces fit together)
- Topic 2: Scalability & Performance Engineering (handling more users, faster)
- Topic 3: Cost Optimization for GenAI Systems (spending less per request)
- Topic 4: Observability, Logging & Monitoring (seeing what is going on inside)
- Topic 5: Reliability, Safety & Guardrails (not breaking, not saying harmful things)
- Topic 6: Data & Model Lifecycle Management (keeping data, prompts and models fresh)

The **bold keywords** are the exact terms to use when you answer in an interview.

## Topic 1: Architecture Design for GenAI Systems

This topic is about how the building blocks of a GenAI app fit together. Two golden rules: keep the model out of the user's critical path when you can, and never let one component be a single point of failure.

### How do I design the whole system for thousands of users?

Think of it like a restaurant: a front door, a manager, a kitchen, a pantry and a CCTV room.

- **Entry layer:** an **API gateway** checks who the user is (authentication), limits how much each user can send (**rate limiting**) and gives every request a **trace ID** that follows it everywhere.
- **Orchestration layer:** a stateless service that decides what to do (plain answer, **RAG**, or an **agent**), builds the prompt and assembles the final answer.
- **LLM access layer:** an **LLM proxy** that every model call goes through. It handles **retries**, **fallback** to a second provider, cost tracking and **response caching**.
- **Data layer:** a **vector store** for meaning-based search, a relational database for users and chat history, **Redis** for session cache and **semantic cache**.
- **Async processing:** slow work goes to a **job queue** with workers. The user polls for status or gets a **webhook**.
- **Observability:** structured logs carrying the trace ID, collected in one place.

The prototype-to-production jump is mostly adding three things: the LLM proxy, the job queue and the caching layer.

### What does the request flow look like from API call to final answer?

Six stages, each with its own job and its own way of failing:

1. **Ingestion:** gateway checks auth, rate limit and **schema validation**. Bad requests are rejected here, before they cost any model money.
2. **Context assembly:** fetch chat history, check the **semantic cache** (a similar question answered recently?), fetch documents via **RAG**, load the **system prompt template**.
3. **Prompt construction:** build the final prompt within a **token budget**. If it is too big, keep the system prompt and current question, and shrink the chat history first.
4. **LLM call:** go through the proxy with **timeout**, **retry** and **fallback model**. Use **streaming** so words appear immediately.
5. **Output processing:** check the format, run **safety checks**, pull out **structured data** (like JSON) if needed, tidy citations.
6. **Delivery and logging:** return the answer, log token counts, latency per stage and model used, and save the chat history.

### Where should the orchestration logic live?

Orchestration is the decision-maker: which model, in what order, with what context.

- **Dedicated orchestration service** when many services or agents must be coordinated, the logic is getting complex, or you want to deploy it separately from the API.
- **Inside the API layer** when the system is simple (one prompt, one call) and the team is small.
- **Never in the frontend.** It would expose your prompts, **API keys** and business logic.

Start inline, then move out when you add RAG, agents or several models. A framework like **LangGraph** gives you clear orchestration building blocks. The warning sign is deeply nested if/else code deciding which LLM call sequence to run.

### How do I design a scalable RAG system for a company?

Enterprise RAG has to cope with many file types (PDF, Word, **Confluence**, **SharePoint**), permissions, and heavy traffic.

- **Offline ingestion pipeline:** detect format, extract text, **chunk** while keeping structure, create **embeddings**, add **metadata** (department, classification, date), write to the index. It runs async so live search is never blocked.
- **Online query pipeline:** classify the query (is retrieval even needed?), embed it, run **vector search** with a mandatory **access-control filter**, **re-rank** the top results, assemble context, generate.
- **Access control at retrieval, not generation.** The model never sees a chunk the user is not allowed to read.
- **Scale tricks:** **read replicas** for search, **semantic cache**, separate compute for ingestion and queries, and **document versioning** so policy updates trigger re-indexing without breaking live queries.

### What extra parts do production agents need?

Agents take real actions over many steps, so they need more than a chatbot does.

- **Tool registry:** a catalog of tools with name, description, input/output schema, permissions and rate limits.
- **Execution engine:** validates arguments, handles **timeouts** and **retries**, logs every call.
- **State management:** a persistent store with **checkpointing** so long tasks survive a server restart.
- **Guardrail layer:** sits between the agent's plan and the action. It checks scope, asks a **human for approval** on irreversible actions, and stops runaway loops.
- **Job queue and workers:** the user gets a job ID and the agent runs in the background.
- **Observability:** a full trace of every thought, tool call and retry. Without it, debugging agents is nearly impossible.

### How do I combine text, image and embedding models in one app?

Put a **model abstraction layer** in front, so app code never cares about each vendor's API.

- A **ModelRouter** receives the request type and sends it to the right **adapter** (text adapter for **GPT-4o**, image adapter for **Stable Diffusion / DALL-E**, embedding adapter for **text-embedding-3-large**).
- Each adapter translates the format, handles auth and returns a common response shape.
- **One cost and logging system:** tokens, image steps and vector dimensions are all converted into a common cost unit.
- **Async for slow models:** image generation goes through the job queue; text can stay synchronous.
- **Failure isolation:** each adapter has its own **circuit breaker**, retries and fallback, so a broken image service does not take down text.

### How would I design a Midjourney-style image platform?

Images are slow (5 to 60 seconds), big and need GPUs, so everything is built around waiting well.

- **Async-first:** every request goes into a queue and the user gets a job ID, then polls or gets a **WebSocket** notification.
- **GPU workers** pull jobs and scale with queue depth. Use separate worker tiers for fast and high-quality models.
- **Priority queues:** premium users go first, extra-paid rush jobs go next in line.
- **Output storage:** workers write to object storage (**S3**) and users download via a **CDN**, which keeps workers stateless.
- **Prompt safety check** before the job enters the queue, so bad prompts never use GPU time.
- **Cache popular results** so identical popular prompts are not generated again.

### How do I answer questions that need both database records and documents?

Example: "Is my overtime this month above the policy limit?" You need the policy (a document) and the timesheet (a database row).

- Give the agent or orchestrator **two tools**: **semantic search** over documents and a **structured query tool** (text-to-**SQL**) over databases.
- Let the **LLM combine the two results in its reasoning**. Joining SQL results with vector results at the data layer is complicated and rarely needed.
- Keep the SQL tool safe: **read-only** queries, **parameterized inputs**, and only the tables allowed for that user's role.

### How do I support both chat and task automation in one system?

Chat is quick and conversational. Automation is slow and goal-driven. Do not force one into the other.

- **One entry point, two paths.** A **request classifier** decides which path to use.
- **Chat path:** normal RAG with chat history, answer in 2 to 3 seconds, with **streaming**.
- **Task path:** goes to the **agent job queue**, user gets a job ID and status URL, progress streams over **WebSocket** or **SSE**.
- **Shared context:** the agent can see the earlier chat, and finished task results can be referenced in later chats.
- **UI:** chat looks like a message thread; tasks look like a progress tracker with a cancel button.

### What must change when moving from prototype to production?

Each prototype shortcut has a production fix:

| Prototype shortcut | Production fix |
| --- | --- |
| Direct LLM API calls | **LLM proxy** with retry, fallback, cost tracking, caching |
| State kept in memory | Database for chat history, **Redis** for sessions, **object storage** for files |
| Long synchronous calls | **Async job queues** and workers |
| Prompts hard-coded in source | **Versioned prompt registry** with A/B testing and rollback |
| No visibility | **Tracing** with trace ID, per-stage timing, token counts, model version |
| One instance | **Stateless** app, **horizontal scaling** behind a **load balancer** |
| No auth | **Authentication**, **authorization**, per-user limits |

## Topic 2: Scalability & Performance Engineering

This topic is about serving more users without slowing down. LLM calls are slow, limited by provider rate limits and costly, so most tricks are about calling them less, smoothing traffic and hiding the wait.

### How do I grow from 1,000 users to 1,000,000?

It is not just more servers. Each jump breaks something new:

- **1,000 users:** one server or a small cluster is fine.
- **10,000 users:** provider **rate limits** start to bite. Add a **semantic cache**, a **request queue**, and **stateless API servers** behind a **load balancer**.
- **100,000 users:** **vector search** becomes a bottleneck. Add **read replicas**, **shard** the index by domain, use **model routing** (cheap model for easy questions), add a **CDN**.
- **1,000,000 users:** one provider is not enough. Use **multi-provider routing** (OpenAI, Anthropic, self-hosted) and **multi-region** deployment. A **40% cache hit rate** now saves a lot of money.

The principles: stay **stateless**, use **async** for non-interactive work, **cache** at the response and retrieval levels, and treat cost as a first-class metric.

### How do I handle many users at once when each LLM call is expensive?

Two problems stack up: **rate limits** and surprise cost.

- **Request queue with concurrency control:** cap the number of simultaneous LLM calls.
- **Semantic cache first:** two people asking the refund policy in different words share one answer. A 30 to 40% hit rate cuts load by about a third.
- **Priority queues:** interactive chat in a fast lane, batch and background jobs wait.
- **Rate limit budget tracking:** alert at **70%** and **90%**, and overflow to a **secondary provider** instead of erroring.
- **Streaming:** a 3-second answer feels faster when words appear straight away.

### What slows down a RAG system as it grows?

Five bottlenecks, showing up at different scales:

| Bottleneck | Fix |
| --- | --- |
| **Embedding generation** (an API call per query) | Cache query embeddings, use **batch embedding** for ingestion |
| **Vector search latency** (millions of vectors) | Tune **HNSW** (**ef\_search**), **shard** the index, **read replicas** |
| **LLM generation** (usually the biggest delay) | **Streaming**, smaller models for easy queries, **semantic cache** |
| **Reranking** (**cross-encoder** adds 200 to 500ms) | Rerank only complex queries, use a smaller reranker most of the time |
| **Ingestion backlog** (stale content) | Separate ingestion compute, prioritize important docs, **incremental indexing** |

### How do I make a multi-step agent faster?

Every reasoning step is a back-to-back LLM call, so latency adds up quickly.

- **Run independent steps in parallel.** Three 800ms retrievals together take 800ms, not 2,400ms.
- **Use smaller models** (like **GPT-4o mini**) for easy steps such as tool arguments and formatting.
- **Stream progress** ("Step 1 done, step 2 running") so users tolerate the wait.
- **Compress context:** replace finished steps with short summaries.
- **Early exit:** skip extra verification when the first answer is clearly good.
- **Pre-warm** database connections and HTTP clients.

### What do queues and background workers do?

They stop the system from timing out or dropping requests under load.

- **Absorb spikes:** extra requests wait in the queue instead of failing. The user gets a job ID.
- **Enable async work:** ingestion, agents, image generation and reports all run in the background.
- **Resource isolation:** ingestion workers run on separate compute from query workers.
- **Automatic retries** with **exponential backoff** (wait longer after each failure).
- **Job prioritization:** premium and interactive jobs go first.

### How do I design pipelines for long-running AI tasks?

- **Submit and poll:** `POST /tasks/analyze` returns a **job\_id** and a status URL. `GET /tasks/<id>` returns status and progress.
- **Stateless workers** (**SQS**, **Celery**) pull jobs. State lives in the database, so any worker can take any job.
- **Checkpointing:** save state after each big step. If a worker dies at step 7 of 12, it resumes at step 7 and you do not pay for steps 1 to 6 twice.
- **Progress reporting:** workers update a status record; for live updates use **pub/sub** with **WebSocket** or **SSE**.
- **Failure handling:** after the maximum retries, jobs go to a **dead letter queue**. Retry temporary errors (timeouts); do not retry permanent ones (bad input, no permission).

### How do I stop many services from overloading one LLM API?

Use one **centralized LLM proxy** for all services. It does the following:

- Manages the **total rate limit budget** and gives each service a **quota** (for example chat 50%, ingestion 20%, analytics 10%, burst reserve 20%).
- **Queues** requests near the limit and **falls back** to a secondary provider.
- Uses a **circuit breaker** per provider: if the error rate passes a threshold (for example 5% over 60 seconds), switch traffic away so nobody waits on timeouts.
- Checks the **semantic cache** before spending any quota, and gives one view of cost and logs.

### Which caching strategies speed things up?

Cache at several layers:

| Cache | What it stores | Notes |
| --- | --- | --- |
| **Semantic response cache** | Answers keyed by meaning | Similarity threshold about **0.95**; TTL depends on content (static policy for 24h) |
| **Embedding cache** | Query and common chunk embeddings | Saves money and latency |
| **Retrieval result cache** | Top-K documents for common queries | Skips the repeated vector search |
| **Prompt cache** (provider-level, **OpenAI** and **Anthropic**) | Processed system prompt | Cuts system-prompt input cost by 60 to 75% |

Do not cache personalized answers, real-time data answers, anything with personal information, or answers that go stale quickly.

### How do I build scalable vector search?

- **Partition the index** by domain (HR, Finance, Product) and route each query to the right partition.
- **Read replicas:** search is read-heavy, so send queries to 3 to 5 replicas and only ingestion to the primary.
- **Tune HNSW** (**ef\_construction**, **ef\_search**) to balance recall against latency.
- **High-memory machines:** the index lives in RAM. As a rough guide, 10M vectors at 1536 dimensions need about 60GB.
- **Managed services** (**Pinecone**, **Qdrant Cloud**, **Weaviate Cloud**) become attractive past roughly 50M vectors or when high availability matters.

### How do I cut latency in an image-generation system?

The diffusion model itself is slow, so the tricks are about the waiting experience and throughput.

- **Queue transparency:** show position and a realistic ETA.
- **Progressive previews:** show a rough low-resolution image after a few diffusion steps.
- **Speed tiers with distilled models:** **SDXL Turbo** or **LCM LoRA** for fast, standard model for quality.
- **Cache popular prompts** with similar results.
- **GPU batching:** generate several images together for better GPU use, even though each one waits a bit longer.

## Topic 3: Cost Optimization for GenAI Systems

LLMs are billed per **token** (a token is roughly a small piece of a word). This topic is about knowing what you will spend and then spending less without hurting quality.

### How do I estimate the cost of running a GenAI system at scale?

Build it bottom-up from real measurements, not guesses.

1. Measure about 1,000 real requests: **input tokens** (system prompt + context + question), **output tokens**, number of LLM calls per request, embedding calls, vector searches and infrastructure cost.
2. Work out **cost per request** = input tokens x input price + output tokens x output price + embedding cost + infrastructure cost.
3. Multiply by volume. Example: 100,000 daily users x 5 requests = 500,000 requests a day, about 15 million a month.
4. Add about **20 to 30%** for monitoring, logging, CDN and support.
5. Plan for **3x traffic spikes** and add a **1.5x safety margin** for the first six months. Real usage is usually higher than the estimate.

### How do token patterns drive cost?

- **Long tail:** a few requests use 10x to 100x the average (for example a huge document upload). Averages hide this, so set **per-request limits**.
- **Output tokens cost more** than input tokens (often 3x to 4x), so long reports cost far more than short answers.
- **System prompt overhead:** a 1,000-token system prompt over 1 million requests is a billion tokens a month. **Provider prompt caching** cuts this by 60 to 75%.
- **Conversation history growth:** a 10-turn chat has about 10x the input of a 1-turn one. Use **context summarization**.
- **Cost attribution:** track tokens by request type, user segment and feature to see where the money goes.

### When should I switch from a large model to a small one?

Decide with data, not gut feeling.

1. Build an **eval set** from real traffic and set a minimum acceptable score per task.
2. Run the smaller model on the same set. If it stays above the bar, it is good enough for that task.

| Usually fine for a small model | Usually needs a large model |
| --- | --- |
| Simple fact extraction | Complex multi-step reasoning |
| Format conversion (to **JSON**) | Nuanced judgment on unclear input |
| **Classification** and routing | Long-form writing that must stay coherent |
| Tool argument generation | Tasks needing broad world knowledge |
| Short summaries of clear content |  |

A **classifier that routes** easy queries to the small model gets about 60 to 70% of the savings while keeping quality on hard ones.

### How do I build a model router that picks a model by difficulty?

This is one of the best cost savers. Cheap model for easy work, expensive model only when needed.

- **Complexity score (0 to 1)** from fast signals: query length, words like "compare" or "analyze", number of constraints, and whether it follows a complex chat. It must take under 50ms, so use a small classifier or rules, not a full LLM call.
- **Tiers:** below 0.3 goes to **GPT-4o mini**; 0.3 to 0.7 to a mid-tier like **Claude Haiku**; above 0.7 to **GPT-4o** or **Claude Sonnet**.
- **Quality gate:** check the cheap model's answer, and **escalate** to the next tier if it is weak ("try cheap first").
- **Keep calibrating:** study the escalations and improve the classifier so escalation stays rare.

### How can caching cut LLM cost without making answers wrong?

You cache the answer to the meaning of a question, not the exact words.

- **Safe:** stable policy questions like "What is the expense reimbursement limit?" Cache for about 24 hours.
- **Unsafe:** personal or live data like "What is my expense balance?" Never cache.
- **Design:** skip the cache for personalized queries, embed the query, look for a similar cached entry with a **similarity threshold of 0.95 or higher**, check it is not stale, otherwise generate and store with a **TTL** (time to live).
- **Protect accuracy:** keep the threshold high, and **invalidate** cache entries when the source documents change.

### How do I control cost in agent reasoning loops?

Agents can burn 10x to 100x more tokens than a simple call, because the context keeps growing.

- **Per-task token budget** by task type (for example 5,000 for a simple lookup, 50,000 for research, 100,000 for complex analysis). When it runs out, the agent answers with what it has and says what is missing.
- **Context compression** every few steps: replace finished steps with a short summary.
- **Model routing inside the agent:** cheap models for tool arguments and parsing, expensive ones for real reasoning.
- **Step-level cost tracking:** flag any step that eats more than **20%** of the budget. It usually means a **context leak** or a huge tool result stuffed into the prompt.

### How do I avoid unnecessary retrieval calls in RAG?

- **Query classification first** (under 50ms): skip retrieval if the question can be answered from general knowledge or the current chat.
- **Context reuse:** if the document is already in the conversation, do not fetch it again.
- **Retrieval result cache** for common questions.
- **Retrieval necessity prompt:** tell the agent to check whether it already has enough information before calling the retrieval tool.
- **Minimum similarity threshold:** if nothing relevant comes back, answer "no information available" instead of letting the model guess (a **hallucination** risk).

### How do I enforce per-user cost limits?

- **Token quota table** per user: daily input/output tokens, monthly budget in dollars and current usage.
- **Check before every request.** If the user is over budget, return a clear error with the reset time.
- **Real-time tracking** with **Redis atomic increments** so counting is fast and safe under concurrency.
- **Tiered plans:** free, pro and enterprise get different limits.
- **Graceful degradation:** at **80%** move the user to cheaper models, at **95%** serve cached answers only, at **100%** pause until reset.
- **Admin override** so support can temporarily extend limits.

### Self-hosted model or API: how do I decide?

It is a break-even question.

- **API:** pay per token, no fixed cost, great for small or spiky traffic.
- **Self-hosted:** you pay for **GPUs** (for example an **A100 80GB**), plus engineering, **MLOps**, memory (weights and **KV cache**) and 24/7 operations.
- **Break-even:** self-hosting usually only pays off at very high volume, roughly hundreds of millions of output tokens a month.

| Pushes toward self-hosted | Pushes toward API |
| --- | --- |
| Data cannot leave your infrastructure | Team lacks MLOps skills |
| Strict latency needs | Very variable traffic (pay for use, not peak) |
| Need to **fine-tune** for your domain | Want the newest frontier models fast |
| **Data residency** rules | Speed of iteration matters most |

### How do I monitor and forecast LLM spend?

- **Real-time tracking:** log tokens and model on every call, compute cost at log time, store in a **time-series store**, and chart by hour, service, model and user segment.
- **Budget alerts:** 50% of the daily budget by noon is informational, 75% is a warning, 90% is critical, 100% means a hard stop or switch to cheaper models.
- **Anomaly detection:** alert if the current hour is more than **2x** the usual hourly spend. Causes are usually a traffic spike, a prompt change that added tokens, or a runaway loop.
- **Monthly forecast** from the current week's trend. Review if the forecast beats budget by more than 10%.
- **Cost per feature** guides both optimization and pricing.

## Topic 4: Observability, Logging & Monitoring

Observability means being able to see inside the system. GenAI is tricky because failures are often silent: no error, just a worse answer. So you log and measure the right things.

### Which logs do I need to debug a GenAI system?

- **Request log** for every call: **trace\_id**, timestamp, user ID, request type, input hash, model version, input and output tokens, latency, cost, cache hit, success.
- **Retrieval log (RAG):** which documents came back, their similarity scores, and which were actually cited.
- **LLM call log:** the prompt (or a hash), the response, model version, safety filter triggers.
- **Agent step log:** every reasoning step, tool call with arguments and results, and branching decision.
- **Error log:** full exception, the context, retries and final result.
- **Do not log in plain text:** **PII**, sensitive document content, **API keys**. Hash, mask or reference them by ID.

### How do I trace one request through a RAG pipeline?

- Create a **trace ID** at the entry and pass it through every service, LLM call and database query. Every log line carries it.
- Each stage makes a **span** (a timed step), nested like a tree: classification, retrieval (embedding + vector search), context assembly, LLM generation, post-processing (citations + safety check).
- Add RAG-specific details to spans: similarity scores and document IDs for retrieval; token counts, model version and cache hit for the LLM; **faithfulness score** and schema validation for post-processing.
- Use **OpenTelemetry** to send spans to **Jaeger**, **Datadog APM** or **Honeycomb**, and see the whole waterfall for one trace ID.

### Which metrics warn me about hallucination spikes?

Hallucination throws no error, so watch proxy signals:

- **Faithfulness score** distribution: is each claim supported by the retrieved documents? A drop is the strongest automatic signal.
- **Citation completeness rate:** share of claims with citations.
- **User correction rate:** people saying "that's wrong".
- **Retrieval quality correlation:** if low-retrieval answers hallucinate more, fix retrieval, not generation.
- **Model version changes:** compare faithfulness before and after a silent provider update.
- **Example alerts:** faithfulness below **0.85** (from a normal 0.90+), user corrections up more than **30%** week over week, citation completeness below **90%**.

### How do I make agent reasoning observable?

Capture not only what happened but why.

- **Thought-Action-Observation logging** for each **ReAct** step: the thought, the tool call with arguments, the result, plus step latency and tokens.
- **Decision point logging:** continue or stop, tool A or tool B, with the reasoning.
- **State snapshots** after each step so you can replay what the agent knew.
- **Quality signals per step:** valid arguments (schema check), meaningful result (non-empty, above minimum similarity), did the step add progress.
- **Human review link:** the trace ID in the response lets a support engineer open the full reasoning trace for a wrong answer.

### Which signals show a model is getting worse?

- **Output length shift:** much shorter, generic answers.
- **Vocabulary diversity** falling (more repetitive wording).
- **Format compliance rate:** fewer valid **JSON** or section-structured outputs.
- **Tokens per second** slowing, which points to model-side issues rather than the network.
- **Eval set performance:** run 50 to 100 representative queries weekly. This is the most reliable signal.
- **Model version monitoring:** log the exact version string so you notice silent updates.

### What dashboards should I build?

One dashboard per audience:

| Dashboard | Audience and refresh | What is on it |
| --- | --- | --- |
| **Engineering real-time** | Engineers, minutes | Request and error rate, **P50/P95/P99 latency**, LLM error rate and rate-limit proximity, active agent sessions, cache hit rate, queue depth |
| **Quality daily** | AI team | Faithfulness trend, retrieval quality (top-1 similarity, no-result rate), task completion, thumbs-down rate, eval set score |
| **Cost weekly** | Engineering and finance | Spend by model and feature, cost per request, top expensive sessions, month-end forecast, cache savings |
| **Executive monthly** | Leadership | Requests and success rate, user satisfaction, cost per session, availability |

### How do I record prompt versions and responses for auditing?

- **Versioned prompt registry** (for example `rag_system_prompt_v3.2`), not prompts buried in code. Every request logs which prompt version it used.
- **Response audit store** for compliance: audit ID, trace ID, user, prompt version, model, input hash, full response, retrieved document IDs, faithfulness score, user feedback.
- Keep audit records in an **immutable append-only store** for the required retention period (often 1 to 7 years).
- **Prompt change management:** pull request review, an **eval comparison** of old vs new prompt, and explicit approval before production.

### What does distributed tracing do in a multi-service AI system?

It links a complaint ("the answer was wrong") to the exact code path and data that caused it.

- **Request identity propagation:** the trace ID goes in an HTTP header to every downstream service.
- **Latency attribution:** shows which service ate the time (for example 3.6s of 4.2s in LLM generation).
- **Failure root cause:** the trace shows which service really failed, even if the upstream error looks vague.
- **Sampling strategy:** trace **100% of errors and slow requests** (above P95) but only **1 to 5%** of healthy ones to control storage cost.

### How do I monitor retrieval quality in RAG?

- **Automatic metrics per query:** **top-1 similarity** (below about 0.65 is poor, above 0.80 is good), **citation rate** (below 50% means retrieval returns junk), and **no-result rate** (rising means coverage gaps).
- **Ground-truth evaluation weekly:** 200 to 500 labeled queries scored with **Recall@5**, **MRR** (Mean Reciprocal Rank, how high the right document ranks) and **Precision@5**.
- **User behavior:** **follow-up rephrasing rate** and "answer seems wrong" feedback matched against low retrieval scores.
- **Index freshness:** if users keep getting old document versions, the indexing pipeline is lagging.

### How do I design alerts for GenAI failures?

| Type | Example triggers | Who is told |
| --- | --- | --- |
| **Infrastructure** (page on-call now) | LLM error rate above 5% for 5 minutes, **P99 latency** above 10s for 3 minutes, **queue depth** above 500, vector DB errors above 1%, any 500 errors | On-call engineer |
| **Quality** (business hours) | Faithfulness below 0.82, negative feedback up more than 40% week over week, eval score down more than 5%, hallucination detections above 2x baseline | AI team |
| **Cost** | Hourly spend above 2x average, month budget at risk by more than 15%, one user using more than 10% of daily budget | Finance and engineering |

Prevent **alert fatigue** by grouping related alerts (page once for the root cause, not 15 times for symptoms) with **alert suppression**, and give every alert a **runbook** saying what to do.

## Topic 5: Reliability, Safety & Guardrails

This topic is about keeping the system up when parts fail, and keeping it safe when users or documents try to misuse it. Think of seat belts, airbags and a spare tyre.

### What if the main LLM goes down?

One provider is a **single point of failure**, so fallback must be automatic.

- **Multi-provider fallback chain:** try for example **OpenAI**, then **Anthropic**, then a **self-hosted Llama** model, in order, with a timeout on each.
- **Circuit breaker** per provider: after about 5 failures in a row, stop calling it and go straight to the next one. Close the breaker again after about 60 seconds of good responses.
- **Graceful degradation tiers:** (1) primary LLM, (2) secondary LLM, (3) smaller fast model, (4) show the retrieved documents without a written answer, (5) a static message with a way to reach a human.
- Tell the user briefly that load is high and answers may be shorter. Do not expose provider details.

### How do I stop prompt injection in RAG?

**Prompt injection** is when a retrieved document contains hidden instructions like "ignore your rules", trying to hijack the model.

- **Structural separation:** clearly label the system instructions as authoritative and the retrieved text as "content to analyze only, never to obey".
- **Injection awareness in the system prompt:** tell the model that document text may look like commands and must be treated as data.
- **Input sanitization:** scan retrieved text for patterns like "Ignore previous instructions" or "You are now" and flag or remove them.
- **Output monitoring:** watch for sudden tone changes, system prompt leaks or off-topic answers, which suggest an injection worked.

### How do I enforce access control for sensitive documents?

Do it at **retrieval**, before the model sees anything.

- **Metadata on every chunk:** document ID, **access level**, **allowed roles**.
- **Mandatory filter at query time** applied inside the vector database, so neither the app nor the LLM can skip it.
- **Defense in depth:** a second check on returned documents against the user's clearance before building the prompt.
- **Audit logging** of who accessed which document, when, and for what query.

### What guardrails go before an agent runs a tool?

A mistake here (emailing 10,000 customers, deleting records) is a real incident. Check these in order:

1. **Authorization:** may this agent call this tool with these arguments for this user?
2. **Argument validation:** valid date, valid email, sensible quantity.
3. **Idempotency check:** was the same action just done? Block the duplicate email.
4. **Irreversibility classification:** reads are safe, writes can be undone, sends, publishes and deletes may not be.
5. **Scope boundary:** a "look up customer" task must not call "delete customer".
6. **Human approval gate** for high-risk or irreversible actions: show the plan and wait for a yes.

### How do I retry failed tool calls sensibly?

First work out why it failed, because some failures should not be retried.

| Failure | What to do |
| --- | --- |
| **Rate limit (429)** | Wait for the **retry-after** time, then retry |
| **Timeout** | Retry once with the same arguments, then fall back or report failure |
| **Validation error (400)** | Do not repeat the same call. Send the error to the LLM so it fixes the arguments |
| **Server error (500/503)** | Retry twice with **exponential backoff** (about 1s, then 4s) |
| **Auth error (401/403)** | Do not retry. Retrying cannot fix permissions |

Also keep a **retry budget** per tool and per task, and use a **fallback tool** (for example a cached data tool) when retries run out.

### How do I catch and reduce hallucinations in production?

- **Automated faithfulness check on every response:** pull out the factual claims and use an **LLM evaluator** to check each one against the retrieved documents.
- **Numeric hallucination detection:** numbers are the most often invented. Any number that cannot be traced to a source is a candidate.
- **Consistency checking:** make sure different parts of a long answer do not contradict each other.
- **Mitigation by score:** faithfulness about **0.7 to 0.85** gets a caveat ("please verify with the source"). Below **0.7** hide the generated answer and show only the retrieved documents.
- **Feedback loop:** user corrections become labeled examples that improve the detector.

### How do I stop agents from looping forever?

A looping agent can drain a monthly budget in hours.

- **Hard step limit** (a **max steps** counter). When reached, stop.
- **Action repetition detection:** if the same tool with near-identical arguments shows up 3 or more times in the last 5 actions, it is looping.
- **Progress monitoring:** if the agent learned nothing new for 3 steps, it is spinning in place.
- **Graceful exit:** instead of an error, ask the agent to give its best answer from what it has and say what it could not find.

### How do I prevent unsafe content?

Use several layers, because one layer alone can be bypassed.

- **Input classification** with a light classifier before generation.
- **System prompt guardrails** that are specific ("do not give instructions for making weapons"), not vague ("be safe").
- **Output safety classifier** on every answer (**OpenAI Moderation API**, **Perspective API**, fine-tuned classifiers).
- **Jailbreak pattern detection:** role-play tricks, "hypothetically" framings, instruction override attempts.
- **Rate limit repeat offenders** and eventually suspend them.
- **Human review queue** for gray areas, to avoid both over-refusing and under-refusing.

### How do I test the system against attacks?

Make **adversarial testing** a regular habit, not a one-off.

- **Test categories:** **prompt injection**, **jailbreaks**, **data extraction** ("repeat your system prompt"), **edge cases** (empty, huge or odd-language inputs) and **retrieval manipulation** (poisoned documents in the knowledge base).
- **Automated adversarial suite** of 200 to 500 labeled inputs with the expected behavior (refuse, answer normally, escalate). Run it on every deployment; a failure blocks the release.
- **Red team exercises:** humans find creative attacks that scripts miss. Add every successful attack to the automated suite.

### How do I keep each customer's data separate in a multi-tenant app?

One tenant must never see another tenant's data, including through the LLM.

- **Data layer isolation:** a **tenant\_id** on every record and a mandatory tenant filter on every database and vector query.
- **Compute isolation:** dedicated worker pools for enterprise tenants with strict **data residency** needs.
- **Conversation isolation:** history is scoped to tenant ID plus user ID.
- **LLM context isolation:** never put data from two tenants in the same prompt.
- **Per-tenant audit trails** that only that tenant's admins can see.

## Topic 6: Data & Model Lifecycle Management

Models, prompts, documents and indexes all change over time. This topic is about changing them safely, and spotting when quality quietly slips.

### How do I version models, prompts and embeddings?

These three decide output quality and can each change on their own.

- **Prompts:** keep them in **Git** and change them through a pull request with an **eval comparison** (before vs after). Use names like `rag_system_v3.2`.
- **Models:** **pin an exact version** such as `gpt-4o-2024-05-13`, not plain `gpt-4o`. Log it with every call and test new versions on your eval set first.
- **Embeddings:** a new embedding model makes old vectors incompatible (different vector space). Record which model made each chunk and **re-embed everything into a shadow index**, validate, then switch.
- **Compatibility matrix:** write down which prompt version works with which model and embedding model. Mixing versions causes subtle regressions.

### How do I A/B test models?

- **Deterministic traffic routing:** hash the user ID plus experiment ID so the same user always gets the same variant (for example 10% to the challenger).
- **Compare three kinds of metrics:** automated quality (**faithfulness**, format compliance, task completion), user behavior (thumbs-down rate, rephrasing rate, abandonment) and cost per task.
- **Sample size and time:** run at least a week, with about **500 to 1,000 responses per variant** to detect roughly a 5% quality difference with **80% statistical power**.
- **Guardrail metrics** that must not get worse (safety violations, error rate, **P99 latency**). If one breaks, stop the test and **roll back** automatically.

### How do I detect model drift?

**Model drift** is slow, silent quality decline. Without monitoring, you hear about it from angry users weeks later.

- **Golden eval set** of 100 to 200 labeled cases, run weekly. A drop of **5% or more** triggers an investigation.
- **Output distribution monitoring:** response length, vocabulary diversity, format compliance.
- **Model version monitoring:** providers sometimes update weights quietly, so check the version string first when metrics shift.
- **User feedback:** negative feedback above **2x** the 90-day average is a strong warning.
- **Input distribution drift:** users may simply be asking different questions than before, which can hurt quality even if the model did not change.

### How do I update the vector index when documents change often?

Do **incremental updates**, not full re-indexing.

1. **Change detection:** listen to **SharePoint webhooks**, the **Confluence change API** or **Google Drive push notifications** and queue the changed document.
2. Re-ingest: parse, chunk and embed the new version.
3. Mark old chunks as `pending_replacement`, write new chunks as `active`, then switch atomically so old ones become `superseded`.
4. Retrieval uses a **status: active filter**, so old chunks stay for history but are not served.

Also keep **version history** per document, accept a short **staleness window** (a few minutes) or suppress retrieval for compliance-critical documents during re-indexing, and show a **staleness warning** for documents that should have been updated but were not.

### How do I roll back a bad model deployment fast?

You should be able to roll back in **under 5 minutes**.

- **Blue-green deployment:** keep the old version running next to the new one. Switching back is just a **config flag** change, no new build.
- **Canary rollout:** send 5%, then 10%, 25%, 50%, 100% of traffic, with **automated quality gates** at each stage.
- **Pre-defined automatic rollback triggers:** faithfulness down more than **10%**, error rate up **3x**, negative feedback up more than **50%**. The system rolls back and pages on-call.
- **After rollback:** run the golden eval set on both versions to see what regressed and decide whether to fix or postpone.
