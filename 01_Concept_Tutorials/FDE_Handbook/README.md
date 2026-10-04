# The AI Engineering Handbook

**From first principles to production-grade agentic systems — and the Forward Deployed Engineer who ships them.**

This handbook turns system-design, delivery, and interview-preparation material into
one ordered curriculum. You can start with basic AI engineering knowledge and finish
able to scope, design, secure, evaluate, operate, and *explain* an enterprise AI
system under interview pressure.

The active course is theory and functional architecture. Where implementation detail
materially improves an explanation, the handbook points to a pinned revision of the
companion AI Engineering course instead of duplicating its projects here.

---

## The four levels

| Level | Who you are when you start | What you can do when you finish | Modules |
|---|---|---|---|
| 🟢 **1 · Foundations** | You know Python and have used an LLM API. | Explain RAG and agents from first principles; write a tool-calling loop from scratch and in LangGraph; run a structured system-design conversation. | 00 · 01 · 02 |
| 🟡 **2 · Building Production Systems** | You can build a demo. | Build agents that survive retries, crashes and bad tools; build an enterprise RAG system with attribute-based access control; build a deterministic agent-workflow platform for non-technical users. | 03 · 04 · 05 |
| 🟠 **3 · Scale, Security, Operations** | You can build one system for one customer. | Reason about identity, tenancy, observability, cost, prompt injection, 20-million-document scale, multi-agent orchestration and AgentOps — with real tools named. | 06 · 07 · 08 |
| 🔴 **4 · Design Mastery & the FDE Role** | You can build and operate. | Run a 60-minute AI system-design interview on any prompt; take a customer from scoping doc to production in two weeks; tell the story of what you built with honesty and precision. | 09 · 10 · 11 |

---

## Curriculum

### 🟢 Level 1 — Foundations

| Module | What it teaches | Docs | Implementation reference |
|---|---|---|---|
| [00 · Orientation](00_Orientation/README.md) | How to use this handbook, the three roles it prepares you for, and the habit that underlies all of them: ask before you architect. | 3 | — |
| [01 · LLM Systems Foundations](01_LLM_Systems_Foundations/README.md) | What RAG actually is; chunking, dense vs lexical retrieval, fusion, reranking; what an agent actually is; the ReAct loop from scratch and in LangGraph. | 5 | Companion course |
| [02 · System Design Fundamentals](02_System_Design_Fundamentals/README.md) | The 12-part framework, the 15 principles, monolith vs microservices, a worked example, and the 60-minute whiteboard method used by every script in this handbook. | 5 | — |

### 🟡 Level 2 — Building Production Systems

| Module | What it teaches | Docs | Implementation reference |
|---|---|---|---|
| [03 · Robust Agents](03_Robust_Agents/README.md) | Retry, fallback, memoization, confirmation gates, disambiguation; state and memory across turns; parallel vs sequential tool calls; per-call observability; the eight guard checks. | 5 | Companion course |
| [04 · Enterprise RAG](04_Enterprise_RAG/README.md) | Meridian Assist as a system-design case: ABAC access control, ingestion, hybrid retrieval, the query pipeline, output guardrails, evaluation, and observability. | 10 | `Enterprise_RAG_Platform` |
| [05 · Agentic Workflow Platforms](05_Agentic_Workflow_Platforms/README.md) | Canonical events and channel adapters, deterministic routing, durable and idempotent orchestration, approvals, spend caps, and staged rollout. | 7 | `Enterprise_Agentic_Workflow_Automation_Platform` |

### 🟠 Level 3 — Scale, Security, Operations

| Module | What it teaches | Docs | Implementation reference |
|---|---|---|---|
| [06 · Cross-Cutting Concerns](06_Cross_Cutting_Concerns/README.md) | Identity and secrets, tenant fairness, observability standards and failure patterns, semantic caching and streaming, CI/CD rigor, build vs buy, prompt injection and egress, structured-data routing, scaling to 20M documents. | 7 | — |
| [07 · Multi-Agent Systems](07_Multi_Agent_Systems/README.md) | When multi-agent is justified (and when it is not), handoffs, failure isolation, evaluation; two case studies — a nine-layer research platform on AWS and a supervisor-to-deep-agent evolution. | 5 | `Enterprise_Multi_Agent_AI_Research_Platform` |
| [08 · AgentOps & Platform](08_AgentOps_And_Platform/README.md) | Prompt versioning, canary rollout and rollback; AgentOps on Databricks with MLflow and Unity Catalog; Enterprise RAG on Databricks; multi-channel delivery and human escalation; red teaming; infrastructure and CI/CD. | 6 | Companion course |

### 🔴 Level 4 — Design Mastery & the FDE Role

| Module | What it teaches | Docs | Implementation reference |
|---|---|---|---|
| [09 · AI System Design Casebook](../../02_System_Design_Case_Studies/Classic_Design_Walkthroughs/Handbook_Casebook/README.md) | Five worked AI system designs (enterprise assistant, customer support, coding assistant, recruiting, logistics exception handling), the agentic coverage map, and four full 60-minute whiteboard scripts. | 6 + 4 scripts | — |
| [10 · FDE Delivery & Operating Model](10_FDE_Delivery_Operating_Model/README.md) | What an FDE does all day; the six-stage AI delivery framework; scoping-doc to production in two weeks; gates, risks and metrics; cross-team collaboration. | 7 | Functional architecture only |
| [11 · Telling the Story](11_Telling_The_Story/README.md) | How to narrate a build in 15–20 minutes or in open conversation; the proof-vs-cheat-sheet honesty discipline; nine worked narratives from real engagements as templates. | 2 + 9 stories | — |
| [99 · Appendices](99_Appendices/README.md) | Glossary, source map (every handbook doc → its original file), interview Q&A log, progress checklist. | 4 | — |

---

## How to read it

**Linear (recommended the first time).** Modules are numbered in dependency order. Each module's README lists its prerequisites, the reading order, and estimated time.

**By role.** If you already know where you are heading:

| Track | Path |
|---|---|
| **AI Engineer** (build RAG and agent systems) | 00 → 01 → 02 → 03 → 04 → 06 → 08 → 09 |
| **Agentic Systems Designer** (platforms, orchestration, safety) | 00 → 01 → 03 → 05 → 06 → 07 → 08 → 09 |
| **Forward Deployed Engineer** (customer-facing delivery) | 00 → 02 → 04 → 05 → 06 → 09 → 10 → 11 |

**By question.** Appendix A (glossary) and Appendix B (source map) index every concept and every document.

## Conventions

Every document opens with the same header block:

> **Level** 🟢 · **Module** 01 · **Doc** 1 of 5 · **Time** ~20 min
> **Prerequisites:** what you should have read first
> **Source material:** the original file(s) this was built from

and closes with a **Checkpoint** — questions you should be able to answer before moving on — and a **Next →** pointer.

Three recurring sections appear throughout:

- **Why this matters** — the problem the concept solves, before the concept itself.
- **Interview lens** — how the concept is tested in a design round and the sentence that carries it.
- **Implementation reference** — where the concept can be inspected in the pinned companion course.

## Companion implementations

This repository intentionally ships no labs. When you need to inspect code, use the
project mapping and immutable revision recorded in [`../COMPANION_COURSE.md`](../../00_Start_Here/COMPANION_COURSE.md).

## Where this came from

The handbook was assembled from the FDE source material, system-design cases,
production-judgment guides, and companion AI Engineering projects. Appendix B records
that provenance; a provenance path is not a promise that the implementation is copied
into this repository.

Appendix B maps every handbook document back to its source. The handbook is designed to grow: new modules slot into the level structure, and the source map records provenance as material is added.
