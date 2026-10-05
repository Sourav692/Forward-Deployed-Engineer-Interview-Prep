# Customer Support Assistant: Knowledge, Actions, and Approval

*Letting the assistant answer and act autonomously cuts response time, while routing risky actions to a person keeps money and compliance under control.*

◷ 10 min

A support assistant is not one LLM doing everything. Give it separate capabilities for knowledge, actions and memory, and put a human between it and the actions that cost real money.

**Objectives:**

- explain why RAG and tool calling solve different problems and both belong in the design;
- decide when a request needs a planner and when it must not have one;
- split memory into three layers and say why enterprise knowledge stays apart from it;
- route high-risk actions through human approval;
- combine this design with the enterprise assistant into one spine, and name the four gaps both leave.

---

## Clarify What It Answers and What It Does

The prompt asks for a customer-support platform in the style of Salesforce Einstein plus Zendesk plus AI agents. It answers FAQs, creates and updates tickets, queries CRM, processes refunds and escalates cases. The interviewer wants to hear when to use RAG, agent orchestration, tool calling, MCP servers, human approval and memory, and what each costs.

| Question | Answer | What it decides |
|---|---|---|
| Answering only, or executing actions? | **Both** | Retrieval *and* action paths |
| Where does product knowledge live? | Docs, knowledge base, CRM, order management, ticketing | Exactly the shape RAG is built for |
| Can the AI make business decisions independently, such as a $5,000 refund? | No | Human-in-the-loop for sensitive operations |
| Scale? | ~1M conversations/day globally | Cost optimisation is first-class |
| Should it remember previous conversations? | Yes | Conversational memory on top of enterprise knowledge |

The functional list is to answer FAQs, search enterprise knowledge, create and update tickets, query CRM, process refunds, escalate, and keep conversation history. The non-functional list is availability, low latency, enterprise security, accuracy, easy onboarding of new systems, scale and cost.

## Draw Capabilities as Peers, Not a Pipeline

```
Customer
│
Web / Mobile / WhatsApp
│
API Gateway
│
Authentication Layer
│
AI Orchestrator Agent
┌──────────────┼──────────────┐
│              │              │
RAG Layer   Tool Calling    Memory
│              │              │
│         MCP Servers         │
│              │              │
Knowledge    CRM  Ticketing  Order Mgmt
Base         ERP  Payments   Inventory
│
Enterprise LLM
│
Human Approval
│
Customer Response
```

RAG, tool calling and memory sit side by side. The orchestrator draws on whichever one the request needs. They are not stages every request must pass through. This is the same lesson as the travel agent in [Reviewing an Agent Architecture](../T5.1_The_Design_Framework/05_Reviewing_an_Agent_Architecture.md): retrieval is something an agent calls when it needs it.

## Use RAG for Answers and Tools for Actions

The two solve different problems. "What is your refund policy?" is answered by retrieving from the knowledge base. "Refund my order" needs a business system to change. An LLM generates text; it cannot update an enterprise database by itself. RAG gives accurate, current answers instead of relying on model memory. Tool calling runs deterministic operations that are reliable and auditable in a way free text is not.

MCP fits on the action side. There are dozens or hundreds of backend systems. Rather than exposing thousands of APIs to the model, MCP servers for CRM, ticketing, payments and inventory each advertise their tools, and the assistant discovers them. REST stays the transport; MCP solves interoperability and discoverability. [Enterprise AI Assistant: Integration Layers at Scale](01_Enterprise_AI_Assistant_Integration_Layers_at_Scale.md) makes the same argument from the employee side.

## Save the Planner for Cross-System Requests

Not every request needs a planner. "Track my order" is one tool call. "My laptop arrived damaged. Refund the order, cancel the warranty, notify shipping, and create a high-priority ticket" needs planning across systems. Only then does a planner earn its cost. It decomposes the task across knowledge, CRM, refund, ticket, shipping and notification agents, and merges the results.

Handle simple requests with a single agent or a direct tool call, which is faster and cheaper. Reserve multi-agent orchestration for cross-system tasks.

## Split Memory Into Three Layers

| Layer | Holds | Example |
|---|---|---|
| **Short-term** | Context within the session | "Where's my package?" … "Can you refund it?": *it* is the same order |
| **Long-term customer** | Preferences and history across sessions | Language, channel, past purchases, past support interactions |
| **Enterprise knowledge** | Stored separately in RAG | Product docs, policies, FAQs, troubleshooting |

Keep enterprise knowledge apart from conversational memory. A stale preference and an outdated policy fail very differently. Mixing them makes both harder to find and fix. Separation improves accuracy and maintainability at once.

## Put a Human Between the Assistant and Risky Actions

Human approval is required for high-risk or high-value actions. Examples are refunds above a threshold, VIP escalations, account deletion, legal or compliance requests, and changes to payment information.

```
Refund Request → AI Validation → Approval Required? ─yes─▶ Manager Approval Queue → Approved → Execute Refund
                                          └──no──▶ Execute
```

The assistant validates first, so most requests never reach a person. Only those crossing a risk or value threshold go to a manager queue before execution.

> **Warning: the LLM never bypasses application authorisation.** Every tool call propagates enterprise identity, OAuth, RBAC/ABAC and audit. Business systems stay the source of truth. An approval queue protects nothing if the model can reach the refund system under its own authority.

## Scale to 10M Conversations a Day

At 50M customers and 10M conversations a day, seven moves carry the load. Keep gateways, orchestrators and LLM routing stateless behind load balancers. Partition embeddings by product, region, language and business unit instead of searching everything. Put a semantic cache in front, so "What is your return policy?" and "Where is my order?" never invoke the LLM.

Run refunds, warranty cancellations and shipping investigations asynchronously. The assistant replies "your request has been submitted" at once. Rate-limit per user, per tenant and per tool, with circuit breakers. Route by cost: an FAQ goes to a small model, and a refund investigation to a large reasoning model. Propagate identity on every tool call as the warning above requires.

Globally, run regional gateways and orchestrators. Partition knowledge indexes by geography where residency requires it. Keep stateless services active-active and customer data within compliance boundaries. Route each user to the nearest healthy region.

The full request path puts the semantic cache immediately after the gateway and rate limiter. A repeated question never reaches the orchestrator. On a miss, the path runs orchestrator, specialist agents, then the shared capability layer. That layer holds RAG over partitioned vector stores, short- and long-term memory, MCP tool calls and a model gateway. Backend systems follow, then the approval queue for high-risk actions, then the response, with monitoring over the whole path.

| Technology | Best use | Advantages | Trade-offs |
|---|---|---|---|
| RAG | Enterprise knowledge retrieval | Accurate, current | Indexing and embedding pipeline |
| Tool calling | Deterministic business actions | Reliable, auditable | Limited to predefined tools |
| MCP | Standardised integrations | Discoverability, extensibility | An extra abstraction layer |
| Agent framework | Multi-step workflows | Modular, parallel | Orchestration complexity |
| Human approval | High-risk operations | Governance, compliance | Response time |
| Memory | Personalised conversations | Better experience | Lifecycle management, privacy |
| Semantic cache | Repeated questions | Latency and cost | Invalidation complexity |

## Combine Both Assistant Designs Into One Spine

This design and the enterprise assistant are complementary. The enterprise assistant goes deep on integration methods and tool discovery at scale. It never mentions RAG, memory or human approval. The support assistant covers the full agent loop: RAG, memory, human-in-the-loop and model routing. It does not revisit the tool-registry scaling problem. Together they cover nearly every concept an agentic design round expects.

```
  Client channels            web · mobile · WhatsApp · chat UI     both
  Authentication             OAuth / SSO / JWT                     both
  API Gateway                routing · quota                       both
  Semantic Cache             repeated queries, no LLM call         both
  Orchestrator / Planner     decomposes the request                both
  ── parallel capabilities, reached from the orchestrator ──
  RAG / knowledge retrieval  vector DB · docs · policies        Support
  Tool / function calling    deterministic actions                 both
  MCP servers                per-app tool discovery                both
  Tool registry at scale     loads only relevant tools       Enterprise
  Memory                     short-term + long-term             Support
  Specialised agents         CRM · refund · ticket · …             both
  ── converge ──
  Model gateway / routing    small for FAQs, large for reasoning Support
  Human approval queue       high-value / high-risk actions      Support
  Response                   streamed, trace-id retained           both
  ── cross-cutting ──
  Async execution · rate limiting · RBAC/ABAC · audit · observability
  Multi-region · data residency                                    both
  Guardrails & prompt-injection defence                     GAP IN BOTH
  DR / chaos testing                                        GAP IN BOTH
```

Both cases agree on one principle: the application, never the LLM, is the source of truth. Both apply RBAC/ABAC, identity propagation per tool call and audit logging.

## Raise the Four Gaps Both Designs Leave

Four concepts are missing from both cases, and a senior interviewer waits for them.

| Gap | Why it matters | Where to bring it from |
|---|---|---|
| **Guardrails and prompt-injection defence** | Neither treats retrieved documents or tool output as untrusted input, or validates model output before it triggers an action | Security and governance in [Scale, Reliability, and Security](../T5.1_The_Design_Framework/03_Scale_Reliability_and_Security.md); architectural injection defence, separate channels and red teaming elsewhere in the curriculum |
| **Prompt management and versioning** | System prompts are implied but never treated as versioned, tested artefacts | Prompt management as a versioned component in [Architecture, Data, and Request Flow](../T5.1_The_Design_Framework/02_Architecture_Data_and_Request_Flow.md) |
| **Disaster recovery and chaos testing** | Multi-region appears for latency and residency, but neither walks through losing a region or the LLM provider | Chaos testing, multi-region failover and reliability versus availability in [Scale, Reliability, and Security](../T5.1_The_Design_Framework/03_Scale_Reliability_and_Security.md) |
| **Explicit capacity estimation** | Both state a target (1M or 10M conversations/day; 50K–200K employees) but neither derives RPS, storage or bandwidth | Capacity estimation in [The Twelve-Part Design Framework](../T5.1_The_Design_Framework/01_The_Twelve_Part_Design_Framework.md); the coding assistant's latency budget; the logistics design's event-throughput sizing |

Walk the spine top to bottom when you draw an agentic assistant, and check every row. Raise the four gap rows unprompted in the cross-cutting step of the [60-minute method](../T5.2_The_60_Minute_Whiteboard_Method/02_Deep_Dive_Failure_Modes_and_the_Close.md).

## Worked Example: The Damaged Laptop

A customer writes: "My laptop arrived damaged. Refund the order, cancel the warranty, notify shipping, and create a high-priority ticket." The gateway authenticates the customer, and the semantic cache misses because the request is specific. The orchestrator sees four actions across systems, so the planner decomposes it.

Short-term memory resolves "the order" to the laptop order from earlier in the session. The refund agent drafts the refund through the payments MCP server. Its value crosses the approval threshold, so it goes to the manager queue rather than executing. Meanwhile the warranty, shipping and ticket agents act through their own MCP servers, under the customer's identity. The cancellation and investigation run asynchronously. The customer gets "your request has been submitted" at once.

Every capability played its own part. Memory resolved a reference, tools acted, the planner coordinated, and approval held back the one action that moves real money. No step needed RAG, and none was forced through it.

---

## Key Takeaways

- Five clarifying answers (act as well as answer, scattered knowledge, no autonomous $5,000 refunds, ~1M conversations/day, remembered history) set the shape.
- RAG, tool calling and memory are peer capabilities the orchestrator calls, not a pipeline.
- RAG answers from current knowledge; tools perform auditable actions; MCP makes many backends discoverable.
- Use a planner only for cross-system requests; simple ones go to a single agent or tool call.
- Keep short-term, long-term customer and enterprise knowledge apart, because they fail differently.
- Route refunds above a threshold, VIP escalations, deletions, legal requests and payment changes through human approval, after AI validation.
- Scale with statelessness, partitioned embeddings, a semantic cache after the gateway, async work, rate limits and model routing.
- The enterprise and support designs combine into one agentic spine.
- Both leave four gaps: guardrails, prompt versioning, disaster recovery, and derived capacity numbers.

## Check Yourself

1. **Why are RAG, tool calling and memory peers rather than a pipeline?**
   Each request needs a different subset. "Track my order" needs one tool call and no retrieval. Forcing every request through all three adds latency and cost for nothing.

2. **Enterprise knowledge is listed as a memory layer. Why is it stored separately?**
   It lives in RAG, not conversation memory. A stale preference and an outdated policy fail differently, so keeping them apart makes each easier to find and fix.

3. **Name the four gaps both assistant designs leave, and when to raise them.**
   Guardrails and prompt-injection defence, prompt versioning, disaster recovery and chaos testing, and explicit capacity estimation. Raise them unprompted in the cross-cutting part of the round.

## References

**Sources:** `02_System_Design_Case_Studies/Classic_Design_Walkthroughs/Handbook_Casebook/02_Customer_Support_Assistant.md`: "The prompt", Steps 1 to 4 (problem space, three peers, RAG vs tool calling, where MCP fits, multi-agent orchestration, three layers of memory, human approval workflow, scaling to 50M customers), "Trade-offs", "The detailed end-to-end design", "Summary" and "What this case does not cover". `06_Agentic_Coverage_Map.md`: "Why this matters", "The combined architecture", "Concept by concept", "What neither covers" and "How to use this map".
