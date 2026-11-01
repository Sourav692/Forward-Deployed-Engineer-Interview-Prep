# Twelve-stage learning contract

One evolving system: **Enterprise AI Platform**. Each stage modifies the current architecture rather than replacing it with an unrelated design.

## Stage 1: Build the MVP
- **New problem:** A single enterprise user can authenticate, ask a question, receive a hosted-model response, and view a saved request.
- **Before:** No system exists; only requirements.
- **After:** An API application, database, minimal hosted-model adapter, and a documented baseline request path.
- **First-taught modules:** 1.1 Requirements and architecture methodology (D3), 1.2 Estimation and capacity planning (D3), 2.1 Networking fundamentals (D2), 2.2 APIs and streaming protocols (D3), 6.1 Database architecture (D2), 7.1 End-to-end AI application design (D3)
- **Stage evidence:** before/after diagram, request/data sequence, ADR, failure injection, metrics, interview checkpoint.

## Stage 2: Distributed Execution
- **New problem:** Document processing and long-running tasks block interactive requests or are lost on worker failure.
- **Before:** The verified architecture after Stage 1.
- **After:** Durable job API, queue, workers, retry boundaries, idempotency, and stored job state.
- **First-taught modules:** 4.1 Concurrency fundamentals (D3), 4.2 Messaging and event streams (D3), 4.3 Background execution systems (D3), 7.3 Agentic application system architecture (D3)
- **Stage evidence:** before/after diagram, request/data sequence, ADR, failure injection, metrics, interview checkpoint.

## Stage 3: Enterprise Knowledge
- **New problem:** Users need trustworthy answers from changing internal documents without exposing restricted files.
- **Before:** The verified architecture after Stage 2.
- **After:** Connector ingestion, search index, metadata, source synchronization, and permission-filtered retrieval.
- **First-taught modules:** 6.3 Object storage and data lifecycle (D1), 8.1 Document ingestion and indexing (D3), 8.2 Search architecture (D3)
- **Stage evidence:** before/after diagram, request/data sequence, ADR, failure injection, metrics, interview checkpoint.

## Stage 4: Scale the Application
- **New problem:** Traffic rises from a pilot to broad enterprise usage; latency and database load rise.
- **Before:** The verified architecture after Stage 3.
- **After:** Stateless replicas, caching, capacity math, autoscaling policies, and measured bottlenecks.
- **First-taught modules:** 6.2 Caching systems (D2), 12.1 Scaling and traffic engineering (D3)
- **Stage evidence:** before/after diagram, request/data sequence, ADR, failure injection, metrics, interview checkpoint.

## Stage 5: Handle Overload and Fair Scheduling
- **New problem:** One tenant floods a shared model provider; others miss latency targets and queues grow.
- **Before:** The verified architecture after Stage 4.
- **After:** Admission limits, bounded per-tenant queues, weighted scheduling, concurrency limits, rejection policies, and metrics.
- **First-taught modules:** 5.1 Rate limiting and admission control (D3), 5.2 Queuing and queueing theory (D2), 5.3 Backpressure and overload management (D3), 5.4 Fair scheduling and workload prioritization (D2), 5.5 AI workload management (D3)
- **Stage evidence:** before/after diagram, request/data sequence, ADR, failure injection, metrics, interview checkpoint.

## Stage 6: Enterprise Security
- **New problem:** Multiple customer organizations demand strict isolation, identity, audit, and private connectivity.
- **Before:** The verified architecture after Stage 5.
- **After:** Tenant-aware auth/authz, trust boundaries, auditing, secrets, private connectivity, and isolated data policies.
- **First-taught modules:** 2.3 Gateway and service communication (D3), 8.3 Enterprise retrieval governance (D3), 13.1 Identity and access control (D3), 13.2 Enterprise AI security (D3), 13.3 Multi-tenant platform design (D3)
- **Stage evidence:** before/after diagram, request/data sequence, ADR, failure injection, metrics, interview checkpoint.

## Stage 7: Reliability and Consistency
- **New problem:** Replica lag, crashes, dependency outages, and retries yield stale states or duplicate effects.
- **Before:** The verified architecture after Stage 6.
- **After:** Consistency choices by data class, circuit breakers, retries, failover, runbooks, and end-to-end traces.
- **First-taught modules:** 3.1 Distributed system fundamentals (D3), 3.2 Distributed state and transactions (D3), 12.2 Resilience and fault tolerance (D3), 12.3 Latency and performance (D3), 15.2 SRE and production operations (D3), 15.3 Performance and incident diagnosis (D3)
- **Stage evidence:** before/after diagram, request/data sequence, ADR, failure injection, metrics, interview checkpoint.

## Stage 8: Production AI Quality and Releases
- **New problem:** A model or retrieval change silently reduces accuracy or increases cost and latency.
- **Before:** The verified architecture after Stage 7.
- **After:** Versioned eval datasets, release gates, canary/shadow tests, observability, and rollback.
- **First-taught modules:** 14.1 Evaluation architecture (D3), 14.2 Release management and experimentation (D3), 15.1 Observability systems (D3)
- **Stage evidence:** before/after diagram, request/data sequence, ADR, failure injection, metrics, interview checkpoint.

## Stage 9: Inference and GPU Infrastructure
- **New problem:** Hosted provider spend and latency force evaluation of routing and self-hosted serving.
- **Before:** The verified architecture after Stage 8.
- **After:** Model-serving gateway, inference performance budget, self-hosted deployment option, and GPU placement boundaries.
- **First-taught modules:** 7.2 AI gateway and provider management (D3), 9.1 LLM execution and inference fundamentals (D2), 9.2 Model serving architecture (D2), 9.3 Inference performance optimization (D1), 10.1 GPU architecture fundamentals (D1), 10.2 Distributed GPU execution (D1), 10.3 GPU infrastructure and scheduling (D1), 16.1 Container and orchestration architecture (D2)
- **Stage evidence:** before/after diagram, request/data sequence, ADR, failure injection, metrics, interview checkpoint.

## Stage 10: Fine-Tuning and Model Customization
- **New problem:** Selected customers require specialized model behavior; ad-hoc training cannot be governed.
- **Before:** The verified architecture after Stage 9.
- **After:** Dataset/version pipeline, training job control, tracking, checkpoints, evaluation, registry, and approval.
- **First-taught modules:** 11.1 Fine-tuning fundamentals (D2), 11.2 Fine-tuning platform architecture (D1), 11.3 Distributed training infrastructure (D0), 14.3 Model and data lifecycle infrastructure (D2)
- **Stage evidence:** before/after diagram, request/data sequence, ADR, failure injection, metrics, interview checkpoint.

## Stage 11: Global Multi-Region Platform
- **New problem:** Data residency, regional traffic, outages, and enterprise SLAs change deployment constraints.
- **Before:** The verified architecture after Stage 10.
- **After:** Regional control/data boundaries, routing, DR, capacity planning, and governance.
- **First-taught modules:** 16.2 Cloud networking and deployment (D2), 17.1 AI unit economics (D3), 17.2 Infrastructure capacity planning (D2)
- **Stage evidence:** before/after diagram, request/data sequence, ADR, failure injection, metrics, interview checkpoint.

## Stage 12: Staff-Level Platform Architecture
- **New problem:** The platform must serve many internal teams and customers without becoming a fragile custom project.
- **Before:** The verified architecture after Stage 11.
- **After:** Reference architecture, ADR portfolio, phased migration, platform abstractions, TCO, operating model, and final defense.
- **First-taught modules:** 1.3 Design documentation and communication (D3), 3.3 Distributed architecture patterns (D2), 16.3 Internal AI developer platforms (D3), 17.3 Architecture economics (D3), 18.1 Architecture decision-making (D3), 18.2 Platform evolution and migration (D3), 18.3 Technical leadership through system design (D3)
- **Stage evidence:** before/after diagram, request/data sequence, ADR, failure injection, metrics, interview checkpoint.
