# Enterprise AI Assistant: Integration Layers at Scale

*Every integration method the model can see costs prompt space and selection accuracy, while every method it cannot see needs code that already knows what to call.*

REST, function calling, MCP and agent frameworks are not rival choices. Treat them as four layers of one stack, and use the [twelve-part framework](/learn/ai-systems-design/design-framework/the-twelve-part-design-framework) to place each one.

**Objectives:**

- turn five clarifying answers into concrete design decisions for an assistant over 100+ applications;
- explain what REST, function calling, MCP and an agent framework each add, and why they stack;
- name the axis that separates REST from function calling;
- scale tool discovery with a tool registry and keep every call under the employee's identity.

---

## Ask the Five Questions That Reshape the Design

The prompt asks for an assistant like ChatGPT Enterprise across **100+ internal business applications**. Employees ask "What's my remaining vacation balance?", "Create a Jira ticket", "Show last month's sales" and "Book a meeting room". It also asks when to reach for REST APIs, MCP servers, function calling and agent frameworks. The test is whether you treat those as complementary layers.

Five clarifying answers move boxes before anything is drawn.

| Question | Answer | What it decides |
|---|---|---|
| Read-only, or can it act? | Read **and** write | Every containment mechanism for actions is in scope |
| Do backends already speak REST? | REST, GraphQL, SOAP and legacy SQL mixed | An abstraction over transports |
| Multi-step requests? | Yes: "schedule a meeting with John and send him the latest proposal" | An orchestration layer, not just function calling |
| Scale? | 50,000 employees globally, ~8,000 concurrent at peak | Stateless, horizontally scaled services |
| Does every employee see the same data? | No: Finance is walled off from HR | Identity propagation as a first-class requirement |

The functional list is short. The assistant holds a natural-language conversation, reads and writes enterprise applications, and runs multi-step workflows. It covers 100+ integrations, executes tools and uses enterprise authentication. The non-functional list asks for scale, availability, security, maintainability, extensibility and easy onboarding of new applications.

## Put Identity in Front of the Model

The high-level shape is a single column with a fan-out at the bottom.

```
Employee
│
Enterprise Chat UI
│
Authentication Layer
│
AI Gateway
│
LLM + Planner Agent
│
┌─────────────────┼─────────────────┐
│                  │                 │
Function Calls   MCP Servers     REST APIs
│                  │                 │
Business Apps    Business Apps   Business Apps
```

Authentication and the AI gateway sit in front of every request. No application ever trusts the LLM directly. It trusts the identity the gateway attaches. The planner then picks whichever integration path fits the task.

## Stack the Integration Methods as Layers

Each method solves a different problem, and each has a limit.

**REST APIs**, such as `GET /employees/123` or `POST /jira/ticket`, fit stable interfaces and deterministic operations that need no reasoning. They are fast, mature and easy to monitor. An LLM does not natively understand authentication, endpoint discovery, request schemas or parameter validation, though. REST alone never adds up to an assistant.

**Function calling**, such as `createTicket()` or `getVacation()`, works while the tool count is small. A model chooses well among twenty functions. At **1,500 functions across 100 applications** it breaks. Prompt size explodes, tool selection becomes inaccurate, and every schema must be maintained and re-embedded into prompts.

**MCP** puts one server in front of each application, such as SAP, Jira, Salesforce or HR. Each server advertises its resources, tools, prompts and capabilities. That solves discoverability: the assistant asks "what tools do you expose?" instead of hardcoding 1,500 schemas. MCP does not replace REST. REST remains the transport, and an MCP server may call REST, SOAP, SQL, Kafka or a legacy system internally.

**Agent frameworks** coordinate more than one decision across a multi-step task.

```
 agent framework     coordinates more than one decision across a multi-step task
       ▲
 MCP                 how the model DISCOVERS which functions exist, without 1,500 hardcoded schemas
       ▲
 function calling    the model's mechanism for DECIDING to invoke one thing
       ▲
 REST / SOAP / SQL   what actually EXECUTES
```

## Separate REST From Function Calling by Who Decides

The real distinction is who decides to make the call, not how it travels on the wire. With REST as a path, fixed application code already knows which endpoint to hit. The vacation page calls `GET /employees/123/vacation` when it renders. With function calling, the LLM decides from natural language whether to invoke something, and with what arguments.

That function is very often the same REST endpoint underneath. The wire call is identical, yet the costs differ. Another REST endpoint is cheap. Another function the model must choose between costs prompt space and selection accuracy. A model cannot choose well among options it cannot fit in its prompt. That ceiling is exactly what MCP removes.

## Reach for a Planner Only When the Task Needs One

A request needs an agent framework when no single function can coordinate it. "Prepare a renewal report for our top customers and email their managers" means finding customers, pulling CRM data, generating a report, creating charts, storing a PDF and sending an email. A planner decomposes it onto a task queue. Specialists for CRM, email, analytics and calendar execute their parts, and the results merge.

| | Single agent | Multi-agent |
|---|---|---|
| Shape | One tool, short workflow, deterministic execution | Planning required, many domains, independent specialists, long-running |
| Example | "Create a Jira ticket": an orchestrator would be overhead | "Analyse quarterly sales, identify declining regions, prepare a deck, notify leadership" |

| Technology | Best use |
|---|---|
| REST API | Direct application communication |
| Function calling | Small, deterministic tool execution |
| MCP | Enterprise tool discovery and standardised AI integration |
| Agent framework | Multi-step planning, orchestration, reasoning |

## Scale Discovery With a Tool Registry

Growth to 500+ applications and 200,000 employees breaks naive discovery first. Loading every MCP server up front does not scale. Put a **tool registry** between the planner and the universe of MCP servers. It loads only the servers relevant to the current task, which keeps the prompt small.

The rest of the scaling plan is familiar. Cache employee profiles, the org hierarchy and the holiday calendar. Keep the planner, authentication, gateway and LLM routing stateless behind load balancers. Rate-limit with user and application quotas, and add circuit breakers against runaway agents, accidental loops and prompt abuse. Run long workflows asynchronously: return "task accepted" with a job ID and let workers execute.

Observability gives every execution a full trace: prompt, selected tools, reasoning, API calls, latency, cost and errors. For a global deployment, use regional AI gateways and region-local MCP servers for apps hosted in each geography. Add a global identity provider with regional token validation, read replicas and regional caches. Run stateless services active-active with geo-DNS, and keep HR and financial data in jurisdiction.

> **Warning: no application trusts the LLM; applications trust enterprise identity.** Every request propagates the user's identity, an OAuth token, RBAC/ABAC checks and audit logs. If an application accepted a call because the model asked, the model could reach anything any user can. The LLM must never bypass the authorisation an application already enforces.

## Worked Example: One Request Through Every Layer

Take "schedule a meeting with John and send him the latest proposal". The request first passes authentication, so it carries the employee's identity. The AI gateway attaches that identity and applies the user's quota. The planner sees two steps across two domains, so it uses the agent framework.

For each step, the planner asks the tool registry which MCP servers matter. Only the calendar and document servers load, not all 100+. The model then uses function calling to decide on a calendar booking with John and a send of the proposal. Each MCP server executes its function through REST or whatever transport its application speaks. Each application checks the employee's own permissions before acting.

That one request touched all four layers, and each did a different job. REST executed. Function calling decided. MCP made the functions discoverable. The agent framework coordinated two decisions.

## Weigh the Four Methods Honestly

| Criteria | REST | Function calling | MCP | Agent framework |
|---|---|---|---|---|
| Scalability | High | Medium | High | Medium |
| Maintainability | High | Medium | Very high | Medium |
| Discoverability | Poor | Medium | Excellent | Good |
| Security | Mature | Good | Excellent | Good |
| Extensibility | Medium | Medium | Excellent | High |
| AI-native | No | Yes | Yes | Yes |

Know what this design leaves out. It has no RAG, no memory, no human-approval workflow, no guardrails or prompt-injection defence, and no model routing. It goes deep on integration and discovery at scale and stops there. Pair it with [Customer Support Assistant: Knowledge, Actions, and Approval](/learn/ai-systems-design/classic-ai-designs/customer-support-assistant-knowledge-actions-and-approval), which covers the other half.

---

## Key Takeaways

- Five clarifying answers (read and write, mixed backends, multi-step, 50,000 employees, walled-off data) shape the design before any box.
- Authentication and the AI gateway sit in front of every request, so applications trust identity rather than the model.
- REST executes, function calling decides, MCP makes functions discoverable, and agent frameworks coordinate several decisions.
- REST and function calling differ by who decides to call, not by the wire call.
- Use a planner only when no single function can coordinate the request.
- A tool registry loads only relevant MCP servers; the other scaling moves are caching, statelessness, quotas, async jobs and tracing.
- Weigh the methods by scalability, discoverability and security, and pair this design with the support assistant for RAG, memory and approval.

## Check Yourself

1. **At what point does function calling break, and what changes it?**
   Around 1,500 functions across 100 applications. Prompts explode and selection gets inaccurate. MCP lets the assistant discover tools per application instead of hardcoding every schema.

2. **If a function's implementation is the same REST endpoint, why call them different layers?**
   Because the axis is who decides. Fixed code calls REST; the model decides to call a function. An extra endpoint is cheap, but an extra function costs prompt space and selection accuracy.

3. **What does a tool registry do that loading every MCP server does not?**
   It loads only the servers relevant to the current task. That keeps the prompt small as the estate grows to 500+ applications.

