# Choose a Runtime and Scale It

*Serverless removes servers to manage but adds cold starts and limits, while containers keep models warm at the price of running the cluster yourself.*

◷ 6 min

No single runtime suits every part of an AI backend. Choose the runtime per workload, scale each on the signal that actually measures its load, and place the vector database and load balancer around it with the same care as the API from [Package the Service and Keep Secrets Out](/learn/engineering-foundations/cloud-containers-deployment/package-the-service-and-keep-secrets-out).

**Objectives:**

- choose between serverless and containers for a given AI workload, with the numbers that decide it;
- scale CPU and GPU workloads in Kubernetes on the right signal;
- host a vector database and configure a load balancer so neither becomes the bottleneck.

---

## Pick Serverless or Containers by the Workload

**Serverless** platforms such as AWS Lambda, Google Cloud Run and Azure Functions run code without servers to manage. They fit spiky or unpredictable traffic, short stateless requests such as a 2 to 3 second chat call, and teams that want zero server management.

**Containers** on Kubernetes or ECS fit everything serverless handles badly. A GPU workload needs them. So does a long job, because Lambda stops at 15 minutes. So does a service that must keep a model warm in memory, since a cold start can add 5 to 30 seconds. Strict P99 latency targets point the same way, because serverless cold starts can add 1 to 3 seconds.

A middle ground exists. Cloud Run with a minimum of 1 to 2 instances gives container behaviour with serverless-style scaling. Baseline traffic then never meets a cold start.

## Scale CPU Work on CPU and GPU Work on Queue Depth

CPU workloads, such as API servers and RAG orchestration, run as a Kubernetes **Deployment** with CPU and memory requests and limits. A **Horizontal Pod Autoscaler (HPA)** scales them on CPU utilisation, for example 70%, and on a custom metric such as queue depth. They scale in seconds, so they can scale down aggressively.

GPU workloads, such as self-hosted model inference, behave differently. Use a `nodeSelector` to land pods on GPU nodes and request `nvidia.com/gpu`. GPU nodes are expensive. They also take minutes to start. So do not scale them down too fast.

Scale GPU work on **queue depth** rather than CPU, because the queue shows how much inference is waiting. **KEDA**, the Kubernetes Event Driven Autoscaler, can scale from a Redis or message-broker queue, which HPA cannot do on its own.

## Size and Place the Vector Database

Memory is the first constraint. Vector indexes are RAM-hungry. One million 1536-dimension vectors need about 6 GB, plus the overhead of the HNSW graph. An undersized instance swaps to disk, and latency spikes.

Running the vector database on the same machine as FastAPI is fast, but the two cannot then scale independently. In production, run it as a separate service or use a managed vector database. Keep it in the same region as the API, because distance shows up directly in latency:

| Where the database sits | Typical network latency |
|---|---|
| Same local network | about 1 to 5 ms |
| Same cloud region | about 5 to 15 ms |
| Another region | about 50 to 150 ms |

Give the index a **PersistentVolumeClaim** (through `volumeClaimTemplates`) so it survives a restart, because re-indexing can take hours. Take regular snapshots to object storage, using the Qdrant snapshot API or the Weaviate backup module.

## Configure the Load Balancer for Slow Calls

A load balancer does three jobs here. **Health-based routing** takes sick or overloaded instances out of rotation automatically, using a health check path such as `/health` and thresholds. **Timeouts** must suit LLM calls, which take 1 to 30 seconds: set the load balancer timeout to about 1.5 times your P99, or it cuts off normal responses. **Sticky sessions** keep a user on a component that holds warm state, such as a GPU inference server with the model loaded.

Behind the load balancer, add an **LLM proxy**. The request path becomes client, load balancer, API servers, LLM proxy, then the providers (OpenAI, Anthropic or self-hosted). The proxy shares rate-limit budgets across all API instances, routes between providers and centralises caching.

> **Warning: a default load balancer timeout can look like a model failure.** A timeout below the slowest normal LLM response cuts healthy calls off. Size it from P99, not from habit.

## Worked Example: A Document Assistant With a Self-Hosted Model

A team serves a document assistant with a self-hosted model and steady daytime traffic.

The API servers run as a Kubernetes Deployment, scaled by an HPA at 70% CPU. The model runs on GPU nodes selected with `nodeSelector` and `nvidia.com/gpu`. KEDA scales it on the Redis queue depth and scales down slowly, because new GPU nodes take minutes.

Serverless was rejected for the model. It needs a GPU. It must also stay warm, and a cold start would add 5 to 30 seconds. The vector database holds two million 1536-dimension vectors, so it needs about 12 GB plus HNSW overhead. It runs as a separate service in the same region, on a PersistentVolumeClaim with scheduled snapshots.

The load balancer timeout is set to about 1.5 times the measured P99, and an LLM proxy shares the rate-limit budget. Every choice followed from one question per component: what does this workload need, and which signal measures its load?

---

## Key Takeaways

- Serverless fits spiky, short, stateless calls; containers fit GPUs, long jobs, warm models and strict P99 targets; Cloud Run with minimum instances sits between.
- Scale CPU work with an HPA on CPU, and GPU work on queue depth with KEDA, scaling GPUs down slowly.
- Size the vector database for memory, run it separately in the same region, and persist and snapshot the index.
- Route on health, set timeouts from P99, use sticky sessions for warm state, and share rate limits through an LLM proxy.

## Check Yourself

1. **Name three reasons to choose containers over serverless for an AI service.**
   Any three of: the workload needs a GPU; jobs run longer than Lambda's 15-minute limit; the model must stay warm, since a cold start can add 5 to 30 seconds; or strict P99 targets cannot absorb a 1 to 3 second cold start.

2. **Why scale GPU inference on queue depth rather than CPU, and what tool does it?**
   The queue shows how much inference is waiting. KEDA can scale from a Redis or broker queue, which HPA cannot do alone.

3. **Your LLM calls have a P99 of 20 seconds. Roughly what load balancer timeout do you set?**
   About 30 seconds, roughly 1.5 times P99, so normal slow responses are not cut off.

