# Module 10 – Backend, FastAPI & Deployment (Beginner Guide + Keywords)

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

## Topic 3: Deployment & Infrastructure

This topic is about packaging your AI service, running it at scale, and rolling out changes without breaking users.

### How do I package a FastAPI GenAI app into Docker?

- Use a **multi-stage build**: stage one installs build tools and Python packages; stage two copies only what is needed into a small runtime image (for example **python:3.11-slim**).
- Run as a **non-root user** for security.
- Add a **HEALTHCHECK** and start with **Gunicorn** using **Uvicorn workers**.
- **Never put secrets in the image** (API keys, database passwords). Pass them at runtime through **environment variables** or a **secrets manager**. The image should be safe to push to a public registry.
- For local development, **docker-compose** runs the API, **PostgreSQL** and **Redis** together.

### How do I scale CPU-heavy and GPU-heavy workloads in Kubernetes?

- **CPU workloads** (API servers, RAG orchestration): a **Deployment** with CPU/memory **requests and limits**, scaled by a **Horizontal Pod Autoscaler (HPA)** on CPU utilization (for example 70%) and on a custom metric like queue depth. They scale in seconds and can scale down aggressively.
- **GPU workloads** (self-hosted model inference): use a **nodeSelector** to land on GPU nodes and request **nvidia.com/gpu**. GPU nodes are expensive and slow to start (minutes), so do not scale down too fast.
- For GPUs, scale on **queue depth** rather than CPU. **KEDA** (Kubernetes Event Driven Autoscaler) can scale from a **Redis** or message broker queue, which HPA cannot do on its own.

### How do I manage API keys, endpoints and database settings securely?

- **Never hardcode** secrets in code or Dockerfiles.
- Use **environment variables** with a typed settings class (**pydantic-settings**, **BaseSettings**); a **.env** file only for development.
- In production use **Kubernetes Secrets** or a real secrets manager: **AWS Secrets Manager** or **Parameter Store**, **GCP Secret Manager**. Do not use **ConfigMaps** for secrets, since they are not encrypted by default.
- Use **separate secrets per environment** (dev, staging, production). The code is identical; only the values differ.

### How do I design a CI/CD pipeline for a GenAI app?

A prompt or model change can quietly make answers worse without any unit test failing, so the pipeline needs a quality gate.

1. **Unit tests** and **integration tests** (**pytest**).
2. **Eval stage** (the GenAI-specific part): run the service on a **golden evaluation set** and fail the pipeline if metrics like **faithfulness** drop (for example more than 5% from baseline).
3. **Build** the Docker image and push it to a registry.
4. **Deploy to staging** and run **smoke tests**.
5. **Production** with manual approval, a **canary deployment** (for example 10% of traffic), canary monitoring, then full rollout. (Tools: **GitHub Actions**, **kubectl**.)

### What should I think about when hosting a vector database next to FastAPI?

- **Memory**: vector indexes are RAM-hungry (about 6 GB for 1 million 1536-dimension vectors, plus **HNSW** graph overhead). An undersized instance swaps to disk and latency spikes.
- **Co-location vs separation**: same machine is fast but the two cannot scale independently. In production, run the vector DB as a **separate service** or use a **managed vector database**.
- **Network latency**: about 1 to 5 ms on a local network, 5 to 15 ms within a cloud region, 50 to 150 ms cross-region. Keep them in the **same region**.
- **Persistent storage**: use a **PersistentVolumeClaim** (volumeClaimTemplates) so the index survives a restart; re-indexing can take hours.
- **Backups**: regular **snapshots** to object storage (**Qdrant** snapshot API, **Weaviate** backup module).

### When should I pick serverless over containers?

- **Serverless** (**AWS Lambda**, **Google Cloud Run**, **Azure Functions**) fits spiky or unpredictable traffic, short stateless requests (a 2 to 3 second chat call), and teams that want zero server management.
- **Containers** (**Kubernetes**, **ECS**) fit **GPU** needs, long jobs (Lambda has a 15-minute limit), services that must keep a **model warm** in memory (cold starts can add 5 to 30 seconds), and strict **P99 latency** needs (serverless cold starts can add 1 to 3 seconds).
- Middle ground: **Cloud Run** with **minimum instances** of 1 to 2, which gives container behaviour with serverless-style scaling and no cold start for baseline traffic.

### How do I upgrade the model version without disrupting users?

- **Pin the exact version** string (for example a dated gpt-4o version), never a floating name, so a provider update cannot silently change behaviour.
- Steps: run your **evaluation suite** on the new model; deploy to **staging** and review samples; start a **canary** with traffic splitting by a **feature flag** (for example 5% of users); watch **faithfulness**, **user feedback** and **error rate** for 24 to 48 hours; then ramp up (5%, 25%, 50%, 100%).
- **Rollback**: keep the old version available and make rollback a config or flag change that takes under 2 minutes and needs no code deploy.

### What do load balancers do for AI backends?

- **Health-based routing**: sick or overloaded instances are taken out of rotation automatically (health check path such as /health, thresholds).
- **Timeouts**: LLM calls take 1 to 30 seconds, so set the load balancer timeout above your slowest normal response (about 1.5 times **P99**), or it will cut calls off.
- **Sticky sessions** for components that hold warm state, such as a GPU inference server with the model loaded.
- **LLM proxy** behind the load balancer: Client, Load Balancer, API servers, LLM proxy, then providers (OpenAI, Anthropic, self-hosted). It shares **rate limit budgets** across instances, routes between providers and centralizes **caching**.

## Topic 4: Production Operations

Once live, you need to see what is happening, spot trouble early, and recover gracefully when something breaks.

### How do I log prompts and answers without leaking private data?

- **Log the structure, not the content**: trace id, user id, **hash** of the prompt and response (**SHA-256**), token counts, model, **latency** and **cost**.
- Store **full content** only in a separate, **encrypted, restricted-access** store with an audit trail, and only if the user consented.
- **PII redaction** before logging, with a tool such as **Presidio** (it swaps names, emails and so on for tags like \[EMAIL\]).
- **Retention**: keep raw content for a short time; keep structural metrics (tokens, latency, cost) longer for planning and billing.

### Which metrics should I monitor for a FastAPI LLM service?

Standard web metrics are not enough. With **Prometheus** (Counter, Histogram, Gauge):

- **Request and latency**: request count by endpoint and status, **latency histogram**, active requests, and **stage-level latency** (retrieval time vs LLM call time).
- **Token and cost**: total tokens (input vs output) and cost per model.
- **Quality**: **faithfulness score**, **cache hit rate**, top-1 **retrieval similarity score**.
- **Errors**: LLM errors by type and **rate limit hits** by user tier.
- **Example alerts**: **P99 latency** above 15 seconds, error rate above 2%, faithfulness below 0.82, hourly cost above 2 times the average.

### How do I design health checks for AI services?

A running process is not necessarily a healthy service (an expired API key or a disconnected vector DB breaks it).

- **Liveness probe** (/health/live): "is the process alive?" Simple and fast; it fails only if the process is stuck or crashed.
- **Readiness probe** (/health/ready): "can it handle traffic?" It checks the **database**, **vector store**, **LLM API** (a light call like listing models) and **Redis**, and returns **HTTP 503** if anything is down.
- **Kubernetes probe settings**: use a longer **initialDelaySeconds** on readiness (for example 30 seconds) to leave time for **model loading**, and a **failureThreshold**.

### How do I catch latency spikes?

- **Percentile alerts** on **P95 and P99**, not the average, because the average can look fine while 5% of users wait 30 seconds (a **Prometheus** alert using histogram\_quantile).
- **Stage-level timing**: record embedding, retrieval and generation time for every request, so you see which part slowed down.
- **Anomaly detection** on the latency time series (a sudden jump from 2 to 8 seconds).
- **Correlate** a spike with the **LLM provider status page**, **recent deployments**, **longer prompts**, and **error or retry rates**.

### What do I do when a downstream AI service fails?

- **Circuit breaker** per dependency (for example **circuitbreaker** library): after several failures it stops calling the broken service for a while, and you switch to a **fallback LLM**.
- **Graceful degradation in tiers**: (1) full RAG answer; (2) LLM answer without retrieval plus a disclaimer; (3) a **static fallback message**.
- **Tell the user briefly** that the answer is limited (without technical details), rather than silently serving worse answers.

### How do blue-green and canary deployments work for GenAI APIs?

A bad release may give worse answers rather than crashes, so you roll out carefully.

- **Blue-green**: two identical environments. Deploy the new one beside the live one, test it (health check plus an **eval run**), then switch all traffic at once. Rollback is switching back instantly.
- **Canary** (usually better for GenAI): send a small share of real users to the new version, chosen by hashing the user id and a **feature flag**, and compare it against the old one.
- **Automated canary validation**: check that **faithfulness**, **error rate** and **P99 latency** of the new version stay within set margins of the old one (for example quality at least 95% of baseline), then promote or roll back.

### How do I load test a FastAPI AI service?

- The bottleneck is often the **LLM provider's rate limits**, not your server.
- Use **Locust** with realistic prompts, **think time** between requests, and 429 responses treated as expected, not as failures.
- **Scenarios**: **baseline test** (ramp to expected peak), **spike test** (jump to about 5 times normal), **soak test** (2 to 4 hours, to find **memory leaks** and **connection pool exhaustion**), **rate limit test** (check fallback and queuing).
- **Measure**: **P50, P95, P99** latency at each load level, error rate by type, **throughput**, **cost per request**, and the load at which you break your **SLA**.
- Use a **mock LLM** that answers instantly to test your own infrastructure (pod count, connection pools) cheaply, separate from LLM limits.
