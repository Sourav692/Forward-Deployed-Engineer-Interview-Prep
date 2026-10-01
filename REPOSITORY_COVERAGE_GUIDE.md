# FDE Interview Preparation Coverage Guide

This guide explains what each repository folder contributes to Forward-Deployed Engineer interview preparation. The material is organized as a course: learn the core concepts in `Handbook/`, practise with the case studies and question banks, then rehearse with mocks, scorecards, and the last-day review material.

## How to use this repository

The most efficient path is:

1. Read `Handbook/00_Orientation` through `Handbook/08_AgentOps_And_Platform` to build the technical and FDE-delivery foundation.
2. Use `Handbook/09_AI_System_Design_Casebook`, `Case_Study_Groups/`, and `FDE/FDE_System_Design_Interview_20_Scenarios/` for timed design practice.
3. Build behavioral stories with `FDE/Behavioral_and_Leadership/` and practise problem decomposition with `Question_Banks/`.
4. Use the full GenAI system, mocks, labs, and `Last_Day_Prep/` to simulate the interview and close gaps.

## Top-level folders

| Folder | Primary interview capability | Materials included |
|---|---|---|
| `Handbook/` | Structured end-to-end FDE curriculum | 12 learning modules, worked examples, casebook, whiteboard scripts, delivery model, and storytelling guidance |
| `FDE/` | Direct interview practice | Behavioral worksheets, system-design scenarios, agentic-design reference, mocks, scorecards, labs, and senior-role context |
| `Case_Study_Groups/` | Repeated system-design rehearsal across realistic business contexts | 20 four-layer case packs plus standalone worksheets, answer keys, and tutorials |
| `Last_Day_Prep/` | Rapid pre-interview recall and execution | 18 concise revision modules, a trigger-to-concept cheat sheet, and interview roadmap |
| `Study_Guides/` | Technical depth for follow-up questions | RAG, agents, LangGraph, memory, multi-agent systems, cost/latency, chunking, and production operations tutorials |
| `Question_Banks/` | Problem-decomposition round practice | Vendor-neutral prompts, answer template, assessment criteria, pitfalls, and preparation plan |
| `OpenAI_Applied/` | OpenAI Applied AI Engineer-specific preparation | Decomposition-round coverage analysis and targeted sample questions |
| `Supplementary_Guides/` | Production judgment and delivery-framework reinforcement | Security, tenant isolation, tool safety, observability, cost/latency, AgentOps, and a delivery whiteboard script |
| `site/` | Interactive course delivery | The web application and generated course content; use when browsing the material as a site rather than files |

## Handbook

`Handbook/` is the primary learning sequence. Each module has a README with reading order and a checkpoint.

| Folder | Topics covered | Interview use |
|---|---|---|
| `00_Orientation/` | What an FDE does, the three roles, first ten minutes of a round, and how to use the handbook | Establishes the interview mindset: customer-facing, technical, and delivery-oriented |
| `01_LLM_Systems_Foundations/` | RAG fundamentals, chunking, retrieval fusion, tool-calling loops, agents, and LangGraph | Handles foundational GenAI architecture questions and lets you explain an agent clearly |
| `02_System_Design_Fundamentals/` | 12-part design framework, 15 principles, monolith vs. microservices, travel-agent example, 60-minute whiteboard method | Supplies the reusable structure for a system-design answer |
| `03_Robust_Agents/` | State and memory, guard checks, retries, fallbacks, memoization, confirmation gates, tool observability, sequential vs. parallel calls | Prepares you for reliability, safety, and agent-execution follow-ups |
| `04_Enterprise_RAG/` | ABAC, ingestion, hybrid retrieval, query expansion, reranking, query graphs, evaluation, guardrails, and observability | Covers the most common enterprise-RAG design deep dive |
| `05_Agentic_Workflow_Platforms/` | Event routing, deterministic workflows, durability, idempotency, approvals, spend caps, staged rollout | Helps distinguish production workflows from unconstrained chat agents |
| `06_Cross_Cutting_Concerns/` | Identity, secrets, tenant fairness, prompt injection, egress, structured data, connectors, caching, streaming, CI/CD, build vs. buy, scale | Addresses production trade-offs that separate an FDE answer from a prototype answer |
| `07_Multi_Agent_Systems/` | When multi-agent is justified, handoffs, reference architecture, failure isolation, evaluation, research-platform cases | Supports a principled answer on multi-agent design rather than using it by default |
| `08_AgentOps_And_Platform/` | Prompt versioning, rollout/rollback, red teaming, multi-channel escalation, infrastructure/CI/CD, AgentOps, Enterprise RAG on Databricks | Covers operating, governing, and deploying a production AI platform |
| `09_AI_System_Design_Casebook/` | Enterprise assistant, customer support, coding assistant, recruiting platform, logistics exception handling, coverage map, whiteboard scripts | Provides five worked designs and four timed whiteboard rehearsals |
| `10_FDE_Delivery_Operating_Model/` | Senior FDE day-to-day work, six-stage delivery, scoping to production in two weeks, gates, risks, metrics, and cross-team collaboration | Directly prepares delivery, prioritization, stakeholder, and execution questions |
| `11_Telling_The_Story/` | Deep-dive versus conversational interview formats, honest evidence framing, technical STAR stories | Helps communicate credible impact without overstating implementation ownership |
| `99_Appendices/` | Glossary, source map, interview Q&A log, progress checklist | Reference and tracking material |

## FDE

`FDE/` is the practice-heavy collection.

| Folder | Topics and materials |
|---|---|
| `Behavioral_and_Leadership/` | A story bank; leadership-principle worksheets and answer keys covering customer obsession, ownership, clarity, outcomes, standards, resourcefulness, rapid decisions, people development, trust, adversity, learning, accountability, talent, and staff-level impact. The `hiring_manager_round/` subfolder covers ambiguity/discovery, stakeholder influence, delivery under pressure, pushback, and scaling beyond yourself. |
| `System_Design and Delivery/` | Introductory design lessons, 12-part framework, design principles, monolith vs. microservices, enterprise assistant, customer support, coding assistant, recruiting platform, logistics assistant, project delivery, cross-team collaboration, and a logistics mock. HTML copies are rendered companions to the Markdown materials. |
| `FDE_System_Design_Interview_20_Scenarios/` | Worksheets, answer keys, and tutorial versions for 12 core enterprise-AI scenarios: RAG, multi-tenancy, text-to-SQL, customer support, air-gapped deployment, evaluation gates, batch inference, safe tool use, durable orchestration, observability, configurable workflows, and enterprise chat. `Version_3` is the worksheet/answer-key practice version; `Version_1` and `Version_2` are longer tutorials. |
| `Cracking_Agentic_AI_System_Design_Interviews/` | Focused chapters on tools/computer interfaces, orchestration and context engineering, retrieval/memory, learning systems, validation/measurement, design patterns, technical interviews, and system-design interviews. |
| `FDE_Interview_Book/` | Additional FDE interview-book reference material, including GenAI architecture patterns. |
| `Complete GEN AI FDE Interview System — Core + GenAI/` | A comprehensive prep package described in the next section. |
| `Senior_FDE_Day_to_Day.md` | A role-context reference for explaining senior FDE responsibilities, customer engagement, and operating cadence. |

### Complete GenAI FDE Interview System Core and GenAI

| Folder | Topics and materials |
|---|---|
| `01_CUSTOMER_DISCOVERY_AND_DECOMPOSITION/` | Ten business-domain case worksheets with answer keys: internal knowledge, sales, financial compliance, healthcare prior authorization, legal review, SRE triage, multi-tenant support, retail demand explanation, ServiceNow tickets, and executive dashboards. |
| `02_ARCHITECTURE_AND_SYSTEM_DESIGN/` | Diagram explanations for enterprise RAG, permission-aware retrieval, ingestion, agent tool calls, human approval, evaluation gates, tracing, MCP servers, agent-to-agent workflows, text-to-SQL safety, multi-tenancy, and incident debugging. |
| `04_EVALUATION_SECURITY_AND_RED_TEAM/` | Red-team fixture packs for testing unsafe, adversarial, or policy-breaking system behaviour. |
| `05_PRODUCTION_DEBUGGING_OBSERVABILITY_AND_OPTIMIZATION/` | Ten incident drills: cross-tenant retrieval, stale indexes, latency, cost spikes, bad citations, unsafe tool calls, evaluation regressions, parsing failures, prompt injection, and vector drift. |
| `07_MOCK_INTERVIEWS_AND_SCORECARDS/` | Short and full mock interviews for internal knowledge assistants, agentic support, financial red teaming, SRE triage, and multi-tenant SaaS. |
| `08_FINAL_READINESS_ASSESSMENT/` | The final readiness package and archived assessment entry points. |
| `11_HANDS_ON_LABS/` | A canonical GenAI FDE interview lab and a more advanced production-architecture reference. Supporting docs cover architecture, RAG, security, evaluation, observability, incident response, prompt versioning, MCP, A2A, text-to-SQL, and human approval. `99_ARCHIVE/` retains older lab material. |

## Case Study Groups

Each `G01`–`G20` folder follows the same practice pattern: a main interview guide, a deeper technical treatment, a concise cheat sheet, and the original/source pack. This makes each topic suitable for first-pass study, timed practice, and last-minute recall.

| Case folder | Scenario and FDE skills exercised |
|---|---|
| `G01_Enterprise_Knowledge_Assistant/` | Enterprise RAG, access control, ingestion, retrieval quality, citations, evaluation |
| `G02_Customer_Support_Automation/` | Support workflows, tool actions, escalation, knowledge grounding, service metrics |
| `G03_Tool_Using_Agent_With_Safety_Controls/` | Action safety, permissions, approval gates, auditability, failure containment |
| `G04_SRE_Incident_Response_Agent/` | Incident triage, observability, runbooks, human escalation, operational safety |
| `G05_Sales_Copilot/` | CRM context, account workflows, recommendations, user adoption, value measurement |
| `G06_NL_Over_Governed_Data/` | Text-to-SQL, semantic layers, governed data access, query validation, privacy |
| `G07_Secure_Multi_Tenant_AI_Platform/` | Tenant isolation, authorization, quotas, secure retrieval, platform boundaries |
| `G08_Document_Review_Copilot/` | Document ingestion, policy checks, citations, structured review, human-in-the-loop |
| `G09_Enterprise_Coding_Assistant/` | Code context, repository security, developer tooling, evaluation, rollout |
| `G10_High_Volume_Batch_Pipeline/` | Batch inference, throughput, queueing, retries, idempotency, cost/reliability trade-offs |
| `G11_Deep_Research_Agent/` | Planning, browsing/retrieval, source quality, multi-step research, synthesis controls |
| `G12_Scoping_To_Deployed_Agent/` | Customer discovery, MVP scope, delivery plan, staged launch, stakeholder alignment |
| `G13_Evaluation_And_Release_Gating/` | Golden datasets, offline/online evaluation, quality thresholds, release governance |
| `G14_Observability_And_Production_Diagnosis/` | Tracing, debugging, metrics, incident response, root-cause analysis |
| `G15_Agent_Platform_For_Non_Technical_Users/` | Configurable agent platform, governance, templates, capability boundaries, adoption |
| `G16_Real_Time_Call_Assistant/` | Low-latency speech/LLM workflows, real-time reliability, human handoff, privacy |
| `G17_Logistics_Exception_Handling/` | Operational workflows, shipment exceptions, tools, approvals, measurable business outcomes |
| `G18_Consumer_Scale_Chat_Service/` | Consumer scale, session state, safety, latency, capacity, product reliability |
| `G19_Model_Development_And_Post_Training/` | Data, fine-tuning/post-training, evaluations, safety, model-release decisions |
| `G20_LLM_Inference_Serving/` | Serving architecture, throughput, batching, routing, latency, GPU/cost trade-offs |

`Case_Study_Groups/Standalone/` adds individual practice topics: recruiting platform, travel agent, air-gapped AI, reliable orchestration, customer-specific workflows, enterprise chat, production LLM gateway, use-case prioritization, prototype-to-production scaling, poor customer data, self-adapting agents, memory assistants, and classic decomposition cases (911 response time, bank fraud, medication errors).

## Last Day Prep

`Last_Day_Prep/` is a compact recall tool, not a replacement for the case practice. Its 18 modules cover:

1. Problem decomposition
2. Functional requirements
3. Non-functional requirements
4. Architecture building blocks
5. RAG and enterprise data
6. Agentic architecture
7. Tools, actions, and integrations
8. Guardrails, policy, and human approval
9. Scaling
10. Latency
11. Cost
12. Reliability and failure handling
13. Evaluation
14. Release and change management
15. Observability and operations
16. Security and multi-tenancy
17. Trade-off thinking
18. End-to-end interview execution

Also use `trigger-to-concept-cheat-sheet.md` to translate interviewer prompts into the concepts you should discuss, and `Rapid_Revision_Guide.md`/`Roadmap.md` to sequence final review.

## Study Guides

`Study_Guides/` is for technical follow-up depth and implementation-level discussion.

| Folder or material | Topics covered |
|---|---|
| Root tutorials | LangChain foundations, LangGraph, RAG/retrieval, advanced RAG, agent fundamentals, agent memory/state, multi-agent systems, and production/operations |
| `chunking/` | Chunking strategies by document type, drills, and a reference guide |
| `retrieval_strategies/` | Query expansion, metadata filters, hybrid retrieval, reranking, parent-document retrieval |
| `Cost_Latency_Optimization/` | Cost/latency cram sheets, playbooks, and trade-off practice |
| `multi_agent/` | Coordination patterns and execution-flow examples |
| `callbacks/` | Callback and instrumentation concepts |
| `reference/` | External reference PDFs for RAG/agent production failures and asynchronous agent operations |
| `TOPIC_DOCS_MAP.md` | Map from interview topics to the most relevant guides |

## Question Banks and role specific material

- `Question_Banks/FDE_Problem_Decomposition_Question_Bank.md` is the main vendor-neutral decomposition bank. It includes high-priority prompts, cloud-data-platform-relevant cases, interviewer evaluation criteria, a reusable answer structure, common mistakes, and a preparation plan.
- `OpenAI_Applied/` adapts that preparation to OpenAI Applied AI Engineer interviews. Read the coverage-gap analysis first, then use `Sample_Questions/` for targeted decomposition practice.

## Supplementary Guides

`Supplementary_Guides/` reinforces the production and delivery judgment often tested in later-round FDE interviews.

| Folder | Topics covered |
|---|---|
| `FDE_Delivery_Framework/` | Scoping-to-production theory, end-to-end architecture, security-gate depth, tenant-scale implications, and a 60-minute whiteboard script |
| `Production_and_Platform_Judgment/` | Identity/secrets/fairness, observability and failure patterns, caching/streaming/CI-CD/build-vs-buy, guarded tool calls, AgentOps on Databricks, and a consolidated quick reference |
| `Resources/` | Supporting resource material |

## Repository support files

- `README.md` explains the repository scope and the intended course structure.
- `COMPANION_COURSE.md` points to the separately maintained hands-on AI Engineering course; use it if you need implementation depth beyond the FDE labs included here.
- `site/specs/` documents the course website's content architecture and design decisions. It is useful for maintainers, but is not core interview-prep material.

## Coverage at a glance

The repository covers the full FDE interview loop: customer discovery and decomposition; functional and non-functional requirements; LLM, RAG, agents, tools, and multi-agent design; security and enterprise governance; reliability, evaluation, observability, cost, and latency; delivery planning and stakeholder leadership; behavioral stories; system-design cases; and full mock interviews. The heaviest coverage is enterprise GenAI system design and production delivery, with dedicated materials for both individual-contributor and senior/staff-level FDE expectations.
