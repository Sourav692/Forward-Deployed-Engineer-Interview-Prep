# Backend, FastAPI and LLM Serving APIs

Oct 4, 2026 · @Sourav Banerjee

## Overview

A good model is not enough: it has to sit behind an API that is fast, safe and cheap to run. In simple words, this module is about the backend that wraps your AI: how FastAPI handles requests, how answers stream back, how you package and scale the service, and how you watch it and recover when things fail. The diagram shows one request travelling through the system, with the deployment pieces around it.

&#91;embedded content: request path and deployment pieces · 5 steps, 4 supporting parts\]

Reading it: the top row is the request path; the boxes below are what the API leans on, and everything runs packaged on Kubernetes.

Topics covered:

- Topic 1: FastAPI Architecture
- Topic 2: LLM Serving APIs
- Topic 3: Deployment & Infrastructure
- Topic 4: Production Operations

The **bold keywords** are the exact terms to use in interviews.

## Topic 1: FastAPI Architecture

**FastAPI** is the Python web framework that sits in front of your AI models and exposes them as an API. This topic is about keeping it fast, clean and easy to grow.

### How do I handle lots of LLM requests without freezing the server?

It depends on where the model runs.

- **External LLM APIs** (**OpenAI**, **Anthropic**): the work is waiting on the network (**I/O-bound**), so use **async endpoints** with an async HTTP client such as **httpx.AsyncClient**. Do not use a blocking library like **requests** inside an async endpoint.
- **Self-hosted models**: the work is heavy **CPU/GPU** compute, and running it inside FastAPI would **block the event loop**. Instead, move it out: a separate **inference service**, a **task queue** (**Celery**, **Ray**, **Kafka** workers), or a **model server** (**vLLM**, **TGI**, **Triton**) called over HTTP.
- Typical shape: FastAPI API layer, then inference server, then **GPU worker nodes**.
- Use **semaphores** or **rate limiters** so the upstream is not overloaded.

### Which endpoints should be async and which sync?

- Make it **async def** when it waits on I/O: LLM calls, database queries, vector search, HTTP calls, file reads. While one request waits, FastAPI serves others.
- Keep it a normal **def** when the work is CPU-only or uses a library that cannot be awaited. FastAPI automatically runs it in a **thread pool**.
- Danger: calling blocking code (like **time.sleep()** or a sync database driver) inside **async def** blocks the whole **event loop**. That is worse than a plain sync endpoint.
- Rule of thumb: if your libraries have async versions, go async everywhere; if not, use sync endpoints.

### How do I validate prompts and uploaded files?

Validate early, so bad requests never reach the expensive LLM.

- **Text prompts**: use **Pydantic** models with limits (min and max length, **max\_tokens** range, **temperature** range) and a **field\_validator** to reject whitespace-only prompts.
- **File uploads** (**UploadFile**): check the **content type** (PDF, CSV, text) and the **file size** before processing, and return a 400 error if it fails.
- **Token count**: count tokens up front with **tiktoken** and reject prompts that are too long, so you do not pay for a call that will fail.

### How do I wire up embeddings, vector search and the LLM with dependency injection?

- Create the expensive things **once at startup** using FastAPI's **lifespan** handler (LLM client, embedding client, vector store such as **Qdrant**, database pool), and clean them up on shutdown.
- Write small **dependency functions** (get\_llm\_client, get\_vector\_store) and add them to endpoints with **Depends()**.
- Benefit: **loose coupling**. In tests you inject mocks, and swapping a vector store means changing only one function.

### How do I stream responses with SSE or WebSockets?

- **Server-Sent Events (SSE)**: one-way stream from server to client, using **StreamingResponse**. Simple, great for streaming text. Each message looks like data: {"token": "Hello"}.
- **WebSockets**: two-way, suited to chat apps and real-time UIs. The server accepts the connection, then loops: receive prompt, send tokens back as they come.
- Think of SSE as a one-way radio broadcast and WebSocket as a phone call.

### How do I separate routes, business logic and prompts?

Use a **layered architecture**, each layer with one job:

- **api/routes**: thin **HTTP-only** handlers that validate, delegate and return (using **APIRouter**).
- **services**: the real logic, such as an LLM service or a **RAG service** that searches, builds a prompt, and generates.
- **prompts**: **prompt templates** plus a **PromptBuilder**.
- **models/schemas**: **Pydantic** request and response shapes.
- **core**: config and dependencies.
- Payoff: swap the LLM provider without touching routes, edit prompts without touching logic, and test each layer on its own.

### How do I run long AI jobs like document indexing?

- **BackgroundTasks** (built into FastAPI) is only for very short jobs, such as sending an email after replying.
- For jobs that take minutes, use a real **task queue**: **Celery** (with **Redis** as the **broker**) or **ARQ**.
- Pattern: the endpoint submits the job and immediately returns a **job\_id** and a status URL. A second endpoint reports state (PENDING, PROGRESS, SUCCESS) and progress steps such as parsing, embedding, indexing.
- The worker **retries automatically** on failure (for example 3 times).

### How do I break up a big service into modules or microservices?

- **Phase 1: modular monolith.** One codebase, but organized into modules (retrieval, generation, ingestion), each with its own router, service and models. Modules talk through clean interfaces, not each other's databases. Most teams should stop here.
- **Split into microservices only when** teams block each other on deploys, one part needs very different **scaling**, or technology needs differ.
- Common split points: the **ingestion service** (slow, CPU-heavy), the **query service** (low latency, many instances) and an **LLM proxy service** (central rate limiting and cost tracking).
- Microservices add operational complexity, so use them only when the monolith hurts more.

## Topic 2: LLM Serving APIs

This topic is about the API you expose to users: how it streams answers, remembers conversations, and protects itself from abuse and cost blow-ups.

### How do I build a streaming chat endpoint?

- Use **StreamingResponse** with media type **text/event-stream** (**SSE**). Send small JSON events: a **token** event for each piece of text, a **done** event at the end, and an **error** event if something fails.
- Important: once streaming starts, you **cannot change the HTTP status code**, so errors have to travel inside the stream.
- After the stream ends, **save the full reply** to conversation history.
- Set headers **Cache-Control: no-cache** and **X-Accel-Buffering: no**. The last one stops **nginx** from buffering, which would defeat streaming.

### How do I handle multi-turn conversations through an API?

- Two choices: **client-side state** (the client sends the whole history each time) or **server-side state** (the server stores history and the client sends only a **session ID**). Server-side is usually recommended.
- Store the session in **Redis** with a **TTL**, for example one hour, under a key like session:{id}.
- Each message: load session, add the user message, trim to a **context budget**, call the LLM, save the answer.
- **Context budget trimming**: always keep the system prompt and the newest message, then fill the rest with the most recent history that fits the token limit.

### How do I stop people abusing a public LLM endpoint?

Every call costs real money, so use layers:

- **Authentication**: **API key** or **JWT** on every request.
- **Token-aware rate limiting**: count tokens per minute, not just requests, using Redis counters. Return **HTTP 429** when over the limit.
- **Request validation** to block "prompt bombs" (huge prompts).
- **Abuse pattern detection**: identical repeated requests, always-max-token requests, odd timing; then review or suspend.
- **Output limits**: always set **max\_tokens** on the call, whatever the user asks.
- **Bot detection**: **CAPTCHA** or behaviour checks for endpoints without accounts.

### How do I design rate limiting when requests vary in token size?

One huge request can cost as much as 50 small ones, so a plain "100 requests per minute" rule is not enough.

- Limit on **three dimensions** at once: **requests per minute**, **tokens per minute**, and **daily cost budget** (estimated from input and output token prices). Use Redis counters with expiry.
- **Tiered limits by plan**: free, pro and enterprise get different numbers.
- Return helpful headers: **X-RateLimit-Remaining-Tokens**, **X-RateLimit-Reset** and **Retry-After**, and put a clear error type in the 429 body (request limit, token limit, or daily budget exceeded).

### How do I structure a response that has text, citations and tool results?

- Use one consistent **unified response schema** (Pydantic) so clients never face surprise shapes.
- Include: **response\_id**, **session\_id**, ordered **content\_blocks** (text pieces with inline references to citations and tool results), a plain **full\_text** for simple clients, a list of **citations** (document id, title, section, relevance score, excerpt), a list of **tool\_outputs** (tool name, input, output, execution time), and **metadata** (model, input and output tokens, latency, retrieval score, **faithfulness score**).
- Simple clients read full\_text; rich clients use content\_blocks to draw inline citations.

### How do I keep things safe when many users start long AI tasks at once?

Two problems: too many expensive jobs at once, and shared state getting corrupted.

- **Cap concurrency** with an **asyncio.Semaphore** (for example at most 50 LLM calls at a time).
- Do not keep counts in in-memory dictionaries. Use **distributed state** (**Redis**, **database locks**, **distributed queues**) so limits work across **all API instances**, for example a per-user count of active tasks.
- **Stateless task execution**: workers load state from the database and write results back, so any worker can handle any task.

### How do I enforce token and request size limits at the API?

- **Request size middleware**: reject bodies larger than a limit (for example 10 MB) with **HTTP 413**, based on the **content-length** header.
- **Token counting** before the LLM call with **tiktoken**, wrapped as a FastAPI dependency. If over the limit, return **HTTP 400** with the counted tokens and the limit.
- **Output ceiling**: always pass **max\_tokens**, using the smaller of what the user asked and a hard maximum from config.
