# Interview Learning Roadmap: Full Practice and Checklists

### Full Case-Study Practice

These should be solved **without looking at the earlier reviews**.

#### Case 1: Customer Support Agent

> A large e-commerce company wants an AI customer-support system that can answer questions, check orders and issue refunds.

Cover:

```text
Discovery
→ Requirements
→ Architecture
→ RAG
→ Tools
→ Policy
→ Scale
→ Cost/Latency
→ Evaluation
```

---

#### Case 2: Enterprise Knowledge Assistant

> A multinational company wants a ChatGPT-style assistant over millions of internal documents, but employees have different access permissions.

Focus on:

```text
RAG
Permission-aware retrieval
Scale
Latency
Security
Evaluation
```

---

#### Case 3: Logistics Exception Agent

> A logistics company wants AI to detect shipment exceptions and automatically resolve routine cases.

Focus on:

```text
Events
Agents
Tools
Policy
HITL
Idempotency
Reliability
Audit
```

---

#### Case 4: SRE Incident Agent

> An enterprise wants an AI agent that investigates production incidents and can execute remediation actions.

Focus on:

```text
Tools
Observability
Agent reasoning
Permissions
Policy
HITL
Kill switch
Audit
```

---

#### Case 5: Deep Research Agent

> Build an enterprise research agent that searches multiple sources and may run for 10–20 minutes.

Focus on:

```text
Async execution
Queue
Checkpoint
Agent bounds
Cost
Long-running state
Evaluation
```

---

#### Case 6: Multi-Tenant AI Platform

> Build a shared AI platform supporting 100 enterprise customers and multiple LLM providers.

Focus on:

```text
API Gateway
Model Gateway
Multi-tenancy
Quotas
Fairness
Model routing
Cost attribution
Observability
```

---

## Recommended Learning Sequence

### Phase 1: Problem Decomposition

```text
Review 1 — Discovery
Review 2 — Functional Requirements
Review 3 — Non-Functional Requirements
```

**Outcome:** Understand before designing.

---

### Phase 2: Architecture

```text
Review 4 — Core Components
Review 5 — RAG
Review 6 — Agents
Review 7 — Tools
Review 8 — Policy / HITL
```

**Outcome:** Build the right system.

---

### Phase 3: Production Scale

```text
Review 9  — Scaling
Review 10 — Latency
Review 11 — Cost
Review 12 — Reliability
```

**Outcome:** Turn the POC into production.

---

### Phase 4: Production Quality

```text
Review 13 — Evaluation
Review 14 — Release
Review 15 — Observability
Review 16 — Security
```

**Outcome:** Safely operate the system.

---

### Phase 5: Interview Mastery

```text
Review 17 — Trade-Offs
Review 18 — Full Case Studies
```

At this stage:

> **Stop adding terminology. Start solving cases.**

---

## Trigger → Concept Cheat Sheet

Skip memorising definitions.

Train yourself to hear a customer/interviewer statement and automatically recognise the architecture concern.

| Interviewer Says                               | Your Brain Should Trigger                                  |
| ---------------------------------------------- | ---------------------------------------------------------- |
| **"100K users"**                         | Horizontal scaling, stateless workers, rate limits, queues |
| **"Traffic suddenly spikes"**            | Queue, admission control, backpressure                     |
| **"One tenant generates huge traffic"**  | Noisy neighbor, quota, fair queue                          |
| **"Traffic exceeds capacity"**           | Admission control, load shedding                           |
| **"Multiple enterprise customers"**      | Multi-tenancy, isolation, quotas, cost attribution         |
| **"Request sometimes takes 20 seconds"** | Stage tracing, P95/P99                                     |
| **"Chat feels slow"**                    | Streaming, TTFT, fewer sequential hops                     |
| **"Three independent APIs"**             | Parallelisation                                            |
| **"External API is slow"**               | Timeout, cache, async, fallback                            |
| **"External API keeps failing"**         | Retry, backoff, circuit breaker                            |
| **"Action happened twice"**              | Idempotency                                                |
| **"Message may arrive twice"**           | At-least-once + idempotent consumer                        |
| **"Background job keeps failing"**       | Retry → DLQ                                               |
| **"Agent runs 10 minutes"**              | Async + queue + durable state                              |
| **"Agent crashes halfway"**              | Checkpoint + resume, reconcile uncertain actions           |
| **"Human approves tomorrow"**            | Durable state + HITL                                       |
| **"Need conversation history"**          | Session state                                              |
| **"Need long-term preferences"**         | Memory                                                     |
| **"Prompt keeps growing"**               | Bounded context + summarisation                            |
| **"Repeated questions"**                 | Cache                                                      |
| **"Information changes frequently"**     | TTL / freshness                                            |
| **"Need company documents"**             | RAG                                                        |
| **"Need current order status"**          | Live API/tool                                              |
| **"RAG can't find answer"**              | Recall, chunking, hybrid search                            |
| **"RAG retrieves junk"**                 | Precision, filtering, reranking                            |
| **"Different document permissions"**     | Permission-aware retrieval                                 |
| **"Unsupported AI claims"**              | Grounding, citations, fallback                             |
| **"Different request types"**            | Router                                                     |
| **"Multiple workflow steps"**            | Orchestrator                                               |
| **"Routing is deterministic"**           | Code/rules before LLM                                      |
| **"Agent keeps calling tools"**          | Execution bounds                                           |
| **"Agent accesses production"**          | Controlled tools                                           |
| **"Agent modifies customer data"**       | Policy + executor + audit                                  |
| **"Large refund needs approval"**        | Deterministic policy + HITL                                |
| **"Agent has powerful credentials"**     | Least privilege                                            |
| **"Policy unavailable"**                 | Fail-closed for risky actions                              |
| **"Agent behaving dangerously"**         | Kill switch                                                |
| **"Multiple models/providers"**          | Model gateway                                              |
| **"Model provider unavailable"**         | Provider fallback                                          |
| **"AI bill exploded"**                   | Model routing, context, cache, calls                       |
| **"Who caused the spend?"**              | Cost attribution                                           |
| **"Need cheaper AI"**                    | Cost per successful task                                   |
| **"New prompt/model"**                   | Offline eval + release gate                                |
| **"Test on real traffic safely"**        | Shadow                                                     |
| **"Gradual production rollout"**         | Canary                                                     |
| **"Only some tenants get feature"**      | Feature flag                                               |
| **"New version performs badly"**         | Rollback                                                   |
| **"Is the agent good?"**                 | Offline + online evaluation                                |
| **"Good answer, task failed"**           | Task success                                               |
| **"Wrong tool used"**                    | Trajectory/tool evaluation                                 |
| **"Exact pass/fail checks"**             | Deterministic evaluator                                    |
| **"Semantic quality"**                   | LLM/human judge                                            |
| **"Why was this slow?"**                 | Observability/tracing                                      |
| **"Why did AI take this action?"**       | Audit                                                      |
| **"Latency commitment"**                 | SLI → SLO → SLA                                          |
| **"Worker dies"**                        | Stateless compute + durable state                          |
| **"Failure shouldn't affect everyone"**  | Blast-radius reduction                                     |
| **"Sensitive enterprise data"**          | AuthN, AuthZ, least privilege, audit                       |
| **"Safe enterprise agent"**              | Defense in depth                                           |

---

## Final Interview Mental Model

```text
                 CUSTOMER
                    ↓
            WHY ARE WE BUILDING?
                    ↓
                DISCOVERY
                    ↓
              REQUIREMENTS
                    ↓
               HAPPY PATH
                    ↓
         ┌──────────┼──────────┐
         ↓          ↓          ↓
        DATA        AI       ACTION
        RAG       Agents      Tools
                              ↓
                       Policy / Human
                    ↓
              PRESSURE TEST
                    ↓
         ┌──────────┼──────────┐
         ↓          ↓          ↓
       Scale      Latency     Cost
         └──────────┼──────────┘
                    ↓
               FAILURES
                    ↓
              EVALUATION
                    ↓
                RELEASE
                    ↓
          OBSERVE + OPERATE
                    ↓
               TRADE-OFFS
```

---

## Final Interview Checklist

Before finishing any architecture, mentally ask:

```text
□ Did I understand the BUSINESS problem?

□ Did I understand the CURRENT workflow?

□ Did I define FUNCTIONAL requirements?

□ Did I define measurable NFRs?

□ Is every major architecture box JUSTIFIED?

□ Where does DATA come from?

□ Does AI ANSWER, RECOMMEND or ACT?

□ What requires HUMAN approval?

□ Does it SCALE?

□ What makes it SLOW?

□ What makes it EXPENSIVE?

□ What happens when dependencies FAIL?

□ How is it SECURED?

□ How do I measure AI QUALITY?

□ How do I RELEASE changes safely?

□ How do I OBSERVE it in production?

□ What are my major TRADE-OFFS?
```

---

## The Core FDE Principle

Do **not** memorise architectures.

Memorise:

```text
Customer says X
      ↓
Requirement Y
      ↓
Problem / Constraint Z
      ↓
Component / Pattern A
      ↓
Trade-off B
```

Example:

```text
"Refunds above $500 are risky."
              ↓
High-risk actions need approval
              ↓
LLM cannot be final authority
              ↓
Policy Engine + HITL
              ↓
Safer execution
but additional latency
```

Another example:

```text
"We expect 100K users."
          ↓
High concurrency
          ↓
Finite model capacity
          ↓
Rate Limit + Queue
+ Horizontal Scaling
          ↓
Better resilience
but more infrastructure
```

> **Interview rule:** Don't name a component until you can explain which requirement caused you to introduce it.

---

## One-Line FDE Framework

> **Start from the customer problem, turn discovery into measurable requirements, build the simplest happy-path architecture, and then pressure-test it across scale, latency, cost, reliability, security, AI quality and operations, adding components only when a requirement justifies them.**

---

### Sources (checked 27 Sep 2026)

- [Google SRE Book - Service Level Objectives](https://sre.google/sre-book/service-level-objectives/): SLI, SLO and SLA definitions
- [Google SRE Workbook - Canarying Releases](https://sre.google/workbook/canarying-releases/): canary as a partial, time-limited rollout that is evaluated
- [AWS Builders' Library - Timeouts, retries and backoff with jitter](https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter): retries can amplify an outage; backoff and jitter
- [Azure Architecture Center - Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker): stop calling a failing dependency for a while
- [Amazon SQS Developer Guide - Dead-letter queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html): retry, then move to a DLQ
- [Stripe API reference - Idempotent requests](https://docs.stripe.com/api/idempotent_requests): idempotency keys prevent a double refund on retry
- [Temporal blog - Idempotency and durable execution](https://temporal.io/blog/idempotency-and-durable-execution): at-least-once delivery; checkpoints don't stop duplicate side effects
- [OWASP GenAI LLM08:2025 Vector and Embedding Weaknesses](https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/): permission-aware retrieval
- [OWASP GenAI LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/): least privilege and controlled tools for agents
