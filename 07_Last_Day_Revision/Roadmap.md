# FDE AI System Design: Interview Learning Roadmap

Use this roadmap to practise five decisions:

- What should I ask the customer?
- What requirement does the answer create?
- Which component or pattern meets it?
- Why does the system need that component?
- What trade-off does the choice introduce?

---

# 0. The FDE Interview Mental Model

Start with the customer problem, then work through the design:

```mermaid
flowchart TD
    N0["Discover business problem and current workflow"]
    N1["Confirm functional requirements and operating limits"]
    N2["Design data, reasoning, and controlled actions"]
    N3["Stress-test scale, latency, cost, failures, and security"]
    N4["Evaluate and release"]
    N5["Observe outcomes and revisit trade-offs"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N5 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

Follow this chain throughout the interview:

```mermaid
flowchart TD
    N0["Customer need"]
    N1["Requirement"]
    N2["Constraint or problem"]
    N3["Architecture decision"]
    N4["Trade-off"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

- Ask about the problem before choosing technology.

---

# Review 1: FDE Problem Decomposition

## Goal

- Take a vague customer request and turn it into a well-defined engineering problem.

## Topics

### Business Problem

- What problem are we solving?
- Why does the customer want AI?
- What business outcome matters?
- What happens if we do nothing?

### Current Workflow

- Existing human workflow
- Existing systems
- Manual steps
- Bottlenecks
- Current failure points

### Users & Personas

- End customers
- Internal employees
- Administrators
- Human reviewers

### Scale

- Number of users
- Requests/day
- Peak traffic
- Concurrency
- Expected growth

### Data

- Structured vs unstructured
- Static vs real-time
- Data sources
- Freshness
- Permissions

### AI Autonomy

```mermaid
flowchart TD
    N0["Choose permitted autonomy"]
    N1["Answer"]
    N2["Recommend"]
    N3["Take action"]
    N4["High-risk action with required controls"]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N0 --> N4
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

### Success Criteria

- Business KPIs
- AI quality
- Task success
- Latency
- Reliability
- Cost

## Discovery Mental Model

- Why: business problem.
- Today: current workflow.
- Who: users.
- How much: workload and scale.
- What data: knowledge and live systems.
- How far: answer, recommend, or act.
- Success: measurable outcome.

## Practice Questions

1. A bank says, "We want an AI agent for customer support." What are the first 5–7 questions you would ask before discussing architecture?
2. A logistics customer says, "Our operations team spends too much time resolving shipment exceptions." How would you understand the current workflow before proposing AI?
3. The customer immediately says, "We want a multi-agent architecture." How would you determine whether multi-agent is required?
4. A customer says they want to reduce support cost by 30%. What additional success metrics would you define before designing the system?
5. What questions would you ask to determine whether the AI should answer, recommend, or autonomously act?

---

# Review 2: Functional Requirements

## Goal

Translate discovery into:

> What must the system do?

## Topics

### Understand

- Accept user requests
- Understand intent
- Support required modalities

### Maintain Context

- Session context
- Conversation history
- Workflow state

### Retrieve

- Enterprise knowledge
- Relevant context
- Permission-aware information

### Route

- RAG
- Agent
- Tool
- Workflow
- Human

### Reason

- Answer
- Recommendation
- Plan
- Decision proposal

### Use Tools

- APIs
- Databases
- CRM
- ERP
- Internal systems

### Act

- Update tickets
- Cancel orders
- Issue refunds
- Create incidents

### Escalate

- Missing or conflicting evidence
- High-risk actions requiring review
- Policy-required escalation
- Tool failure that cannot be recovered safely

### Audit & Feedback

- Decisions
- Evidence
- Actions
- Approvals
- User feedback

## Functional Mental Model

```mermaid
flowchart TD
    N0["Required capabilities"]
    N1["Understand and retain context"]
    N2["Retrieve authorised evidence"]
    N3["Route and reason"]
    N4["Read tools and act if permitted"]
    N5["Approval and failure behaviour"]
    N6["Audit and outcome feedback"]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N0 --> N4
    N0 --> N5
    N0 --> N6
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N5 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2,N6 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

## Practice Questions

1. For an enterprise customer-support agent, define 6–8 functional requirements.
2. A support agent must answer policy questions, check order status, and issue eligible refunds. Break these into functional requirements.
3. Which requirements would tell you that the system needs conversation state?
4. How would functional requirements change if the system moves from answer-only to taking actions?
5. When should human escalation be considered a functional requirement?

---

# Review 3: Non-Functional Requirements

## Goal

Define:

> How well must the system work?

## Topics

- Scalability
- Latency
- Reliability
- AI quality
- Security
- Safety
- Cost
- Observability
- Auditability

## NFR Mental Model

- Scale
- Latency
- Reliability
- Quality
- Security
- Safety
- Cost
- Observability
- Auditability

## Practice Questions

1. The customer says, "The system should be fast." How would you turn that into a measurable NFR?
2. The system serves 50 enterprise customers and 100K total users. Which NFRs become especially important?
3. A refund agent handles financial actions. Which NFRs would you prioritise and why?
4. How would the NFRs differ between a real-time voice agent and a 10-minute deep-research agent?
5. What AI-quality NFRs would you define beyond traditional uptime and latency?

---

# Review 4: Core Architecture Building Blocks

## Goal

- Know each building block and the requirement that justifies it.

## Topics

### API Gateway

```mermaid
flowchart TD
    N0["User"]
    N1["API Gateway"]
    N2["AI application"]
    N0 --> N1
    N1 --> N2
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
```

Handles:

- Authentication
- Authorisation
- Tenant context
- Rate limits
- Quotas
- Request validation

### Model Gateway

```mermaid
flowchart TD
    N0["AI application"]
    N1["Model Gateway"]
    N2["Permitted model providers"]
    N0 --> N1
    N1 --> N2
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
```

Handles:

- Model routing
- Provider abstraction
- Retry/fallback
- Provider limits
- Token/cost tracking

### Router

- Intent routing
- Agent routing
- Tool routing

### Orchestrator

- Workflow state
- Branching
- Tool calls
- Retry
- Checkpoints

### State Store

- Session state
- Workflow state
- Approval state

### Cache

- Response
- Semantic
- Retrieval
- Tool result

### Queue / Event Bus

- Async work
- Bursts
- Background jobs
- Long-running workflows

## Component Selection Rule

```mermaid
flowchart TD
    N0["Component responsibility"]
    N1["Why it is needed"]
    N2["Customer requirement that justifies it"]
    N0 --> N1
    N1 --> N2
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
```

## Practice Questions

1. Explain the difference between an API Gateway and Model Gateway in 30 seconds.
2. When would you introduce an orchestrator rather than putting everything inside one agent?
3. A customer has three LLM providers and wants automatic fallback. Which component owns this responsibility?
4. When would you add a queue rather than processing the request synchronously?
5. The interviewer points to one of your architecture boxes and asks, "Why do you need this?" How would you justify components based on requirements rather than technology preference?

---

# Review 5: RAG and Enterprise Data

## Goal

- Design practical enterprise RAG without unnecessary theoretical depth.

## Core Flow

```mermaid
flowchart TD
    N0["Sources"]
    N1["Parse"]
    N2["Chunk"]
    N3["Embed and index with permissions, metadata, and versions"]
    N4["Identity and question"]
    N5["Authorised search"]
    N6["Retrieve candidates"]
    N7["Rerank if useful"]
    N8["Select context"]
    N9["Supported answer"]
    N10["Cite evidence"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N4 --> N5
    N5 --> N6
    N6 --> N7
    N7 --> N8
    N8 --> N9
    N9 --> N10
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4,N8 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N5,N9 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2,N6,N10 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3,N7 c3
```

## Topics

- Chunking
- Embeddings
- Vector search
- Keyword/hybrid search
- Metadata filtering
- Reranking
- Recall
- Precision
- Permission-aware retrieval
- Static vs live data
- Groundedness

## Practice Questions

1. Your RAG system frequently fails to retrieve the correct document. What would you investigate?
2. It retrieves the correct document but also returns many irrelevant chunks. What problem is this and how would you improve it?
3. Why should current order status normally come from an API instead of RAG?
4. Two employees have different document permissions. How would you prevent unauthorised information from entering the LLM context?
5. The customer says, "The model is hallucinating." What parts of the RAG pipeline would you investigate before simply changing the model?

---

# Review 6: Agentic Architecture

## Goal

- Know when agents are useful and how to prevent uncontrolled execution.

## Topics

- Workflow vs agent
- Single vs multi-agent
- Routing
- Agent trajectory
- Tool calling
- Execution bounds
- Durable execution

## Core Flow

```mermaid
flowchart TD
    N0["Task"]
    N1["Select next step"]
    N2["Validate, authorise, and check budget"]
    N3["Controlled tool"]
    N4["Observe result"]
    N5["Continue?"]
    N6["More work within bounds"]
    N7["Complete, stop, or escalate"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N6 --> N1
    N5 --> N7
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N5 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2,N6 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3,N7 c3
```

## Practice Questions

1. When would you choose a deterministic workflow instead of an agent?
2. A customer wants separate RAG, refund, order and escalation agents. Would you accept this architecture immediately? What would you ask first?
3. An agent occasionally executes 20–30 tool calls for a simple request. How would you control it?
4. What happens if a long-running agent crashes after completing 8 of 10 steps?
5. How would you explain agent trajectory and why it matters for evaluation?

---

# Review 7: Tools, Actions and Enterprise Integration

## Goal

- Move from chatbot architecture to production action-taking systems.

## Core Pattern

```mermaid
flowchart TD
    N0["Agent recommendation"]
    N1["Policy and required approval"]
    N2["Executor"]
    N3["Enterprise system"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

## Topics

- Controlled tool layer
- Crm/erp/api integrations
- Read vs write tools
- Executor
- Idempotency
- Timeout
- Retry
- Circuit breaker

## Practice Questions

1. Why would you avoid giving an LLM direct unrestricted access to a production CRM?
2. An agent issues a refund, the API times out, and the agent retries. How do you prevent a double refund?
3. A downstream ERP API frequently takes 30 seconds or fails. How would you protect the agent workflow?
4. Why might you separate the agent's decision from the actual execution?
5. How would you treat a read-only `get_order_status` tool differently from an `issue_refund` tool?

---

# Review 8: Guardrails, Policy and Human Approval

## Goal

- Safely allow agents to perform real business actions.

## Core Pattern

```mermaid
flowchart TD
    N0["Agent recommends"]
    N1["Policy decides"]
    N2["Executor acts"]
    N0 --> N1
    N1 --> N2
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
```

## Topics

- Deterministic policy
- Risk classification
- HITL
- Fail-open vs fail-closed
- Kill switch
- Least privilege

## Practice Questions

1. Refunds below $100 can happen automatically, while refunds above $500 require manager approval. Where should this rule live?
2. Why shouldn't the LLM itself be the final authority for a deterministic financial policy?
3. The policy service becomes unavailable during a $10,000 transaction. Should the system fail-open or fail-closed, and why?
4. How would you design a workflow where human approval may take several hours?
5. What would a kill switch disable in an action-taking agent?

---

# Review 9: Scaling AI Systems

## Goal

Handle:

> "Great. Now scale it to 100K users."

## Topics

- Throughput
- Concurrency
- Horizontal scaling
- Stateless workers
- Rate limiting
- Admission control
- Backpressure
- Queueing
- Fair queueing
- Noisy neighbour
- Load shedding
- Multi-tenancy

## Practice Questions

1. Your prototype supports 100 users. The customer now expects 100K users. Walk through what changes.
2. Tenant A suddenly consumes 70% of model capacity and Tenant B starts experiencing poor latency. What is happening?
3. Explain the difference between rate limiting and admission control.
4. Incoming traffic is 10K requests/sec but the system can process only 5K. What mechanisms would you consider?
5. Why would you prefer stateless workers + external durable state when horizontally scaling agents?

---

# Review 10: Latency Optimisation

## Goal

- Diagnose latency before optimising.

## Latency Decomposition

```mermaid
flowchart TD
    N0["End-to-end latency"]
    N1["Queue wait"]
    N2["Retrieval"]
    N3["Model calls"]
    N4["Agent and orchestration overhead"]
    N5["Tools"]
    N6["Network"]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N0 --> N4
    N0 --> N5
    N0 --> N6
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N5 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2,N6 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

## Topics

- P50/P95/P99
- TTFT
- Streaming
- Parallelisation
- Sequential LLM hops
- Retrieval latency
- Tool latency
- Queue latency
- Async processing

## Practice Questions

1. Average latency is 3 seconds but P99 is 25 seconds. What does this tell you?
2. Your agent calls CRM, order and ticket APIs sequentially. Each takes 1 second. What obvious optimisation would you consider?
3. The model itself takes only 2 seconds but total latency is 12 seconds. How would you investigate?
4. When does streaming improve perceived latency without actually reducing total compute time?
5. A research task takes five minutes. Would you continue optimising it as a synchronous API request or change the interaction model?

---

# Review 11: Cost Optimisation

## Goal

- Understand and control AI economics.

## Cost Decomposition

```mermaid
flowchart TD
    N0["Task cost"]
    N1["Model usage"]
    N2["Input tokens"]
    N3["Output tokens"]
    N4["Retrieval"]
    N5["Tools"]
    N6["Compute"]
    N7["Retries and rework"]
    N0 --> N1
    N1 --> N2
    N1 --> N3
    N0 --> N4
    N0 --> N5
    N0 --> N6
    N0 --> N7
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N5 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2,N6 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3,N7 c3
```

## Topics

- Model routing
- Context optimisation
- Caching
- Reduce model calls
- Deterministic logic
- Agent bounds
- Batch processing
- Cost attribution
- Cost per successful task

## Practice Questions

1. The customer's LLM bill doubles after launching an agent. What would you inspect first?
2. Why might model routing reduce cost without materially reducing quality?
3. Conversation history grows indefinitely and token cost keeps increasing. What would you change?
4. Why is cost per successful task often more meaningful than cost/request?
5. Your architecture uses five LLM calls for every request. How would you determine whether all five are necessary?

---

# Review 12: Reliability and Failure Handling

## Goal

Answer:

> "What happens when something fails?"

## Topics

- Timeout
- Retry
- Exponential backoff
- Jitter
- Circuit breaker
- Idempotency
- Graceful degradation
- Model fallback
- DLQ
- Checkpointing
- Blast radius

## Failure Mental Model

```mermaid
flowchart TD
    N0["Classify failure"]
    N1["Bound waiting"]
    N2["Check retry safety"]
    N3["Choose fallback or safe degradation"]
    N4["Recover or escalate"]
    N5["Record actual status"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N5 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

## Practice Questions

1. Your primary model provider becomes unavailable. What happens next?
2. A tool API returns intermittent 503 errors. What retry strategy would you use?
3. Why can aggressive retries make an outage worse?
4. A recommendation feature fails. Should the entire customer-support system become unavailable?
5. A background event fails processing after several retries. What should happen next?

---

# Review 13: AI Evaluation

## Goal

- Make AI quality measurable.

## Topics

### RAG

- Retrieval relevance
- Recall
- Groundedness
- Correctness

### Agents

- Routing
- Tool selection
- Tool arguments
- Trajectory
- Task success

### Evaluation Types

- Deterministic
- Non-deterministic
- Offline
- Online

## Key Principle

- A good answer must still be checked against actual task completion.

## Practice Questions

1. How would you evaluate a customer-support system containing both RAG and action-taking agents?
2. Give examples of deterministic checks for an agent.
3. Which checks require semantic or non-deterministic evaluation?
4. The final response sounds perfect, but the agent used the wrong tool and never actually cancelled the order. How should evaluation catch this?
5. Why do we need both offline and online evaluation?

---

# Review 14: Release and Change Management

## Goal

- Safely ship AI changes.

## Core Flow

```mermaid
flowchart TD
    N0["Version candidate"]
    N1["Offline evaluation"]
    N2["Release gate"]
    N3["Shadow and/or scoped canary"]
    N4["Observe"]
    N5["Expand if criteria pass"]
    N6["Stop or roll back if criteria fail"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N4 --> N6
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N5 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2,N6 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

## Topics

- Versioning
- Release gates
- Canary
- Shadow traffic
- Feature flags
- Rollback
- Kill switch

## Practice Questions

1. Your team creates a new prompt that performs better on 20 examples. Would you immediately deploy it?
2. Explain when you would use shadow traffic vs canary deployment.
3. How would you release a new agent to only two enterprise customers first?
4. Which artifacts should be versioned besides the model itself?
5. Production quality suddenly drops after a new release. What mechanisms should allow you to respond quickly?

---

# Review 15: Observability and Production Operations

## Goal

- Understand what is happening inside the system after deployment.

## Topics

- Logs
- Metrics
- Distributed traces
- AI telemetry
- Audit
- SLI
- SLO
- SLA

## Trace Mental Model

```mermaid
flowchart TD
    N0["Request"]
    N1["Router"]
    N2["Workflow or agent"]
    N3["Retrieval"]
    N4["Model calls"]
    N5["Enterprise tools"]
    N6["Response and actual outcome"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N2 --> N4
    N2 --> N5
    N3 --> N6
    N4 --> N6
    N5 --> N6
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N5 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2,N6 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

## Practice Questions

1. A user says, "My request took 18 seconds yesterday." What telemetry would you inspect?
2. Explain the difference between logging, metrics and tracing using an agent request.
3. Which AI-specific telemetry would you capture beyond normal infrastructure metrics?
4. Compliance asks, "Why did the agent issue this refund?" What information should be available?
5. Explain SLI vs SLO vs SLA using an AI assistant latency example.

---

# Review 16: Security and Enterprise Multi-Tenancy

## Goal

- Make the system enterprise-ready.

## Topics

- Authentication
- Authorisation
- RBAC
- Permission-aware RAG
- Least privilege
- Tenant isolation
- Secrets
- Sensitive data
- Data residency
- Defence in depth

## Core Mental Model

```mermaid
flowchart TD
    N0["Authenticate identity"]
    N1["Resolve trusted tenant and scope"]
    N2["Authorise data and tools"]
    N3["Check business policy"]
    N4["Approval if required"]
    N5["Execute permitted action"]
    N6["Audit"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N5 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2,N6 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

## Practice Questions

1. Employee A can access HR documents while Employee B cannot. How should this affect retrieval?
2. Why is filtering unauthorised documents after generation a weak security design?
3. What permissions would you give a refund agent following least-privilege principles?
4. A shared platform serves 50 enterprise tenants. What needs tenant isolation?
5. A European customer says their data cannot leave a particular region. What architectural concerns does this introduce?

---

# Review 17: Trade-Off Thinking

## Goal

- Explain why you made architecture decisions.

## Core Principle

> "I'm choosing X because of requirement Y. The trade-off is Z."

## Topics

### Cost ↔ Quality ↔ Latency

```mermaid
flowchart TD
    N0["Quality"]
    N1["Cost"]
    N2["Latency"]
    N0 --- N1
    N1 --- N2
    N2 --- N0
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
```

- Required security, safety, and correctness constraints still apply.

### Common Trade-Offs

- More retrieval may improve recall; check noise, latency, and cost.
- More agents may help independent work; measure coordination and model-call overhead.
- Caching reduces repeated work; enforce freshness and permission scope.
- A stronger model may help difficult tasks; compare quality, latency, and total task cost.
- More autonomy can reduce human work; preserve policy, approval, and safe execution.
- Async delivery releases the client while work continues; it still needs capacity and completion tracking.

## Practice Questions

1. You can improve answer quality by adding another LLM critic, but it adds 3 seconds and 40% cost. How would you reason about the decision?
2. The customer wants maximum retrieval recall but also very low latency. What trade-off would you discuss?
3. When might you intentionally choose a smaller model even if a larger model performs slightly better?
4. Caching tool responses reduces latency dramatically. What new risk does caching introduce?
5. The interviewer asks, "Why did you choose this architecture instead of a simpler one?" How would you structure your answer?

---

# Review 18: End-to-End FDE Interview Execution

## Goal

- Combine everything into one repeatable interview flow.

```mermaid
flowchart TD
    N0["Discover business problem and current workflow"]
    N1["Confirm functional requirements and operating limits"]
    N2["Design data, reasoning, and controlled actions"]
    N3["Stress-test scale, latency, cost, failures, and security"]
    N4["Evaluate and release"]
    N5["Observe outcomes and revisit trade-offs"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N5 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

## Full Case-Study Practice

- These should be solved without looking at the earlier reviews.

### Case 1: Customer Support Agent

> A large e-commerce company wants an AI customer-support system that can answer questions, check orders and issue refunds.

Cover:

```mermaid
flowchart TD
    N0["Discover support workflow"]
    N1["Confirm requirements"]
    N2["Design policy retrieval and live tools"]
    N3["Control refund actions"]
    N4["Stress-test scale, latency, and cost"]
    N5["Evaluate task outcomes"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N5 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

---

### Case 2: Enterprise Knowledge Assistant

> A multinational company wants a ChatGPT-style assistant over millions of internal documents, but employees have different access permissions.

Focus on:

- RAG
- Permission-aware retrieval
- Scale
- Latency
- Security
- Evaluation

---

### Case 3: Logistics Exception Agent

> A logistics company wants AI to detect shipment exceptions and automatically resolve routine cases.

Focus on:

- Events
- Agents
- Tools
- Policy
- HITL
- Idempotency
- Reliability
- Audit

---

### Case 4: SRE Incident Agent

> An enterprise wants an AI agent that investigates production incidents and can execute remediation actions.

Focus on:

- Tools
- Observability
- Agent reasoning
- Permissions
- Policy
- HITL
- Kill switch
- Audit

---

### Case 5: Deep Research Agent

> Build an enterprise research agent that searches multiple sources and may run for 10–20 minutes.

Focus on:

- Async execution
- Queue
- Checkpoint
- Agent bounds
- Cost
- Long-running state
- Evaluation

---

### Case 6: Multi-Tenant AI Platform

> Build a shared AI platform supporting 100 enterprise customers and multiple LLM providers.

Focus on:

- API Gateway
- Model Gateway
- Multi-tenancy
- Quotas
- Fairness
- Model routing
- Cost attribution
- Observability

---

# Recommended Learning Sequence

## Phase 1: Problem Decomposition

- Review 1 — Discovery
- Review 2 — Functional Requirements
- Review 3 — Non-Functional Requirements

- Outcome: Understand before designing.

---

## Phase 2: Architecture

- Review 4 — Core Components
- Review 5 — RAG
- Review 6 — Agents
- Review 7 — Tools
- Review 8 — Policy / HITL

- Outcome: Build the right system.

---

## Phase 3: Production Scale

- Review 9  — Scaling
- Review 10 — Latency
- Review 11 — Cost
- Review 12 — Reliability

- Outcome: Turn the poc into production.

---

## Phase 4: Production Quality

- Review 13 — Evaluation
- Review 14 — Release
- Review 15 — Observability
- Review 16 — Security

- Outcome: Safely operate the system.

---

## Phase 5: Interview Mastery

- Review 17 — Trade-Offs
- Review 18 — Full Case Studies

At this stage:

- Practise the full cases using the concepts from reviews 1–16.

---

# Trigger → Concept Cheat Sheet

- - Use each statement to identify a concern, then ask what the workload needs.
- Confirm the requirement before adding a component.

| Interviewer Says                               | Your Brain Should Trigger                                  |
| ---------------------------------------------- | ---------------------------------------------------------- |
| "100K users" | Clarify active users, peak rates, concurrency, and task duration before sizing capacity |
| "Traffic suddenly spikes"            | Queue, admission control, backpressure                     |
| "One tenant generates huge traffic"  | Noisy neighbour, quota, fair queue                          |
| "Traffic exceeds capacity"           | Admission control, load shedding                           |
| "Multiple enterprise customers"      | Multi-tenancy, isolation, quotas, cost attribution         |
| "Request sometimes takes 20 seconds" | Stage tracing, P95/P99                                     |
| "Chat feels slow"                    | Streaming, TTFT, fewer sequential hops                     |
| "Three independent APIs"             | Parallelisation                                            |
| "External API is slow"               | Timeout, cache, async, fallback                            |
| "External API keeps failing"         | Retry, backoff, circuit breaker                            |
| "Action happened twice"              | Idempotency                                                |
| "Message may arrive twice"           | At-least-once + idempotent consumer                        |
| "Background job keeps failing"       | Retry → DLQ                                               |
| "Agent runs 10 minutes"              | Async + queue + durable state                              |
| "Agent crashes halfway"              | Checkpoint + resume, reconcile uncertain actions           |
| "Human approves tomorrow"            | Durable state + HITL                                       |
| "Need conversation history"          | Session state                                              |
| "Need long-term preferences"         | Memory                                                     |
| "Prompt keeps growing"               | Bounded context + summarisation                            |
| "Repeated questions"                 | Cache                                                      |
| "Information changes frequently"     | TTL / freshness                                            |
| "Need company documents"             | RAG                                                        |
| "Need current order status"          | Live API/tool                                              |
| "RAG can't find answer"              | Recall, chunking, hybrid search                            |
| "RAG retrieves junk"                 | Precision, filtering, reranking                            |
| "Different document permissions"     | Permission-aware retrieval                                 |
| "Unsupported AI claims"              | Grounding, citations, fallback                             |
| "Different request types"            | Router                                                     |
| "Multiple workflow steps"            | Orchestrator                                               |
| "Routing is deterministic"           | Code/rules before LLM                                      |
| "Agent keeps calling tools"          | Execution bounds                                           |
| "Agent accesses production"          | Controlled tools                                           |
| "Agent modifies customer data"       | Policy + executor + audit                                  |
| "Large refund needs approval"        | Deterministic policy + HITL                                |
| "Agent has powerful credentials"     | Least privilege                                            |
| "Policy unavailable"                 | Fail-closed for risky actions                              |
| "Agent behaving dangerously"         | Kill switch                                                |
| "Multiple models/providers"          | Model gateway                                              |
| "Model provider unavailable"         | Provider fallback                                          |
| "AI bill exploded"                   | Model routing, context, cache, calls                       |
| "Who caused the spend?"              | Cost attribution                                           |
| "Need cheaper AI"                    | Cost per successful task                                   |
| "New prompt/model"                   | Offline eval + release gate                                |
| "Test on real traffic safely"        | Shadow                                                     |
| "Gradual production rollout"         | Canary                                                     |
| "Only some tenants get feature"      | Feature flag                                               |
| "New version performs badly"         | Rollback                                                   |
| "Is the agent good?"                 | Offline + online evaluation                                |
| "Good answer, task failed"           | Task success                                               |
| "Wrong tool used"                    | Trajectory/tool evaluation                                 |
| "Exact pass/fail checks"             | Deterministic evaluator                                    |
| "Semantic quality"                   | LLM/human judge                                            |
| "Why was this slow?"                 | Observability/tracing                                      |
| "Why did AI take this action?"       | Audit                                                      |
| "Latency commitment"                 | SLI → SLO → SLA                                          |
| "Worker dies"                        | Stateless compute + durable state                          |
| "Failure shouldn't affect everyone"  | Blast-radius reduction                                     |
| "Sensitive enterprise data"          | AuthN, AuthZ, least privilege, audit                       |
| "Safe enterprise agent"              | Defence in depth                                           |

---

# Final Interview Mental Model

```mermaid
flowchart TD
    N0["Discover business problem and current workflow"]
    N1["Confirm functional requirements and operating limits"]
    N2["Design data, reasoning, and controlled actions"]
    N3["Stress-test scale, latency, cost, failures, and security"]
    N4["Evaluate and release"]
    N5["Observe outcomes and revisit trade-offs"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1,N5 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

---

# Final Interview Checklist

Before finishing any architecture, mentally ask:

- Did I understand the business problem?
- Did I understand the current workflow?
- Did I define functional requirements?
- Did I define measurable NFRs?
- Is every major architecture box justified?
- Where does data come from?
- Does AI answer, recommend or act?
- What requires human approval?
- Does it scale?
- What makes it slow?
- What makes it expensive?
- What happens when dependencies fail?
- How is it secured?
- How do I measure AI quality?
- How do I release changes safely?
- How do I observe it in production?
- What are my major trade-offs?

---

# The Core FDE Principle

Use the customer’s requirement to justify each design choice:

```mermaid
flowchart TD
    N0["Customer statement"]
    N1["Requirement"]
    N2["Constraint"]
    N3["Component or pattern"]
    N4["Trade-off"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

Example:

```mermaid
flowchart TD
    N0["Customer approval threshold: refunds above 500 dollars"]
    N1["Encode high-risk approval policy"]
    N2["Keep authority outside model reasoning"]
    N3["Policy and durable human review"]
    N4["Controlled execution with approval delay"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

Another example:

```mermaid
flowchart TD
    N0["100K expected users"]
    N1["Clarify active users, rates, and concurrency"]
    N2["Find model and tool capacity limits"]
    N3["Use justified limits, queues, and worker scaling"]
    N4["More infrastructure and bounded waiting"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    classDef c0 fill:#dbeafe,stroke:#2563eb,color:#172554
    class N0,N4 c0
    classDef c1 fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class N1 c1
    classDef c2 fill:#dcfce7,stroke:#15803d,color:#14532d
    class N2 c2
    classDef c3 fill:#fef3c7,stroke:#b45309,color:#78350f
    class N3 c3
```

> “This component meets requirement ___. Its trade-off is ___.”

---

# One-Line FDE Framework

- Start with the customer problem and confirm measurable requirements.
- Draw the smallest happy path that meets them.
- Test scale, latency, cost, failures, security, AI quality, and operations.
- Add components only when a requirement justifies them.

---


## Sources (checked 27 Sep 2026)

- [Google SRE Book - Service Level Objectives](https://sre.google/sre-book/service-level-objectives/): SLI, SLO and SLA definitions
- [Google SRE Workbook - Canarying Releases](https://sre.google/workbook/canarying-releases/): canary as a partial, time-limited rollout that is evaluated
- [AWS Builders' Library - Timeouts, retries and backoff with jitter](https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter): retries can amplify an outage; backoff and jitter
- [Azure Architecture Center - Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker): stop calling a failing dependency for a while
- [Amazon SQS Developer Guide - Dead-letter queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html): retry, then move to a DLQ
- [Stripe API reference - Idempotent requests](https://docs.stripe.com/api/idempotent_requests): idempotency keys prevent a double refund on retry
- [Temporal blog - Idempotency and durable execution](https://temporal.io/blog/idempotency-and-durable-execution): at-least-once delivery; checkpoints don't stop duplicate side effects
- [OWASP GenAI LLM08:2025 Vector and Embedding Weaknesses](https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/): permission-aware retrieval
- [OWASP GenAI LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/): least privilege and controlled tools for agents
