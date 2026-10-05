# Deployment, Infrastructure and Production Operations

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
