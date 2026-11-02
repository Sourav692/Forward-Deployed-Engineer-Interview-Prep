# Staff AI System Design: Claude Code and Codex Prompts

This skill authors a course through one evolving multi-tenant Enterprise AI Platform. Its curriculum covers 12 stages, 18 domains, and 56 modules. The curriculum map describes planned coverage; generated lessons and validation records show what has actually been created and checked.

## Read Stage 0 Before Running the Stage Prompts

Start with [Stage 0: Enterprise Use Case and Target Architecture](../10_AI_System_Design/stages/00-enterprise-overview/guide.html), or its [Markdown version](../10_AI_System_Design/stages/00-enterprise-overview/guide.md). It explains Alice’s complete supplier-assistance journey, customer requirements, target architecture, supporting flows, and how the twelve stages reach that destination.

Stage 0 is orientation. It does not add a thirteenth instructional stage, reassign any of the 56 modules, or imply that the target platform is already deployed. Stage 1 still begins with requirements and no implemented system.

## Installed Skill and Output Folder

Use the installed `architecture-driven-staff-ai-system-design` skill:

- Codex: `.agents/skills/architecture-driven-staff-ai-system-design/SKILL.md`
- Claude Code: `.claude/skills/architecture-driven-staff-ai-system-design/SKILL.md`

Read references and templates from the selected installation. Write all course artifacts directly beneath `10_AI_System_Design/` at the repository root. The stage paths below are relative to that folder. Shared state belongs in `10_AI_System_Design/architecture/` and `10_AI_System_Design/progress/`.

This document remains in `ai-system-design/`. Generated lessons go in `10_AI_System_Design/` without an additional workspace wrapper.

## Shared Requirements for Every Stage Prompt

Run the prompts in order, one stage per run. Each prompt asks the agent to read this section so it can be copied into either Claude Code or Codex.

1. Read the installed skill's `references/curriculum-map.json`, coverage matrix, stage contract, and relevant templates before planning. Pull first-taught modules, revisit modules, and D0–D3 depth targets from those references. Do not raise every module to D3.
2. Preserve one customer scenario and the actual evolving architecture. Read `architecture/current-system.md`, existing architecture decision records (ADRs), and the previous stage's `stage-state.json` beneath `10_AI_System_Design/`. If prerequisite artifacts are missing, label the reference baseline as hypothetical and identify the gap. Do not invent completed stages or claim unverified work passed.
3. In the requested stage directory, create `stage-plan.md`, a complete `guide.md`, a semantically equivalent standalone offline `guide.html`, and `stage-state.json`. Include before/after architecture diagrams, a request/data sequence, quantitative trade-offs with labelled assumptions, a worked example, failure evidence, metrics, Staff interview questions, recall exercises, and exit tests. Include runnable lab files only when needed.
4. Use plain English and explain why each component exists, how it works, its cost, what can fail, and how it connects to the system. Revisit earlier topics briefly and link to their original lessons. Build an interactive lab only when it explains a causal mechanism; include deterministic inputs, expected results, working controls, and reset behaviour.
5. Record meaningful decisions in `architecture/decisions/`. Update `architecture/current-system.md` only after producing the stage, preserving the distinction between accepted architecture and assumed baselines. Record actual authored and verified coverage in `progress/coverage-status.csv`; mark validation accurately in `stage-state.json`.
6. Run the skill's mapping/workspace validator and checks appropriate to the lesson. Test HTML offline, internal links, diagram consistency, and interactive behaviour when tools permit. Report checks not run and technical limitations. Link to the generated Markdown and HTML, and stop after the requested stage.

## Stage Prompts

### Stage 1: Build the MVP

Output: `10_AI_System_Design/stages/01-mvp/`

```text
Use the architecture-driven-staff-ai-system-design skill to create Stage 1: Build the MVP only. Read and follow the shared requirements in ai-system-design/START-HERE.md and the installed skill's stage contract and curriculum mapping.

Write this stage to 10_AI_System_Design/stages/01-mvp/. Keep shared architecture, ADRs, and coverage records under 10_AI_System_Design/. Start from requirements; do not invent an existing system.

Choose one concrete enterprise customer scenario and establish its requirements, illustrative workload, latency targets, and constraints. Keep the first design to an authenticated API, database, hosted-model adapter, and saved request history. Trace one request end to end and demonstrate a representative failure.

Produce all required artifacts, validate what you can, report unchecked items, and stop after Stage 1.
```

### Stage 2: Distributed Execution

Output: `10_AI_System_Design/stages/02-distributed-execution/`

```text
Use the architecture-driven-staff-ai-system-design skill to create Stage 2: Distributed Execution only. Read and follow the shared requirements in ai-system-design/START-HERE.md and the installed skill's stage contract and curriculum mapping.

Write this stage to 10_AI_System_Design/stages/02-distributed-execution/. Keep shared architecture, ADRs, and coverage records under 10_AI_System_Design/. Read the actual Stage 1 artifacts in `10_AI_System_Design/stages/01-mvp/` before designing the change.

Separate interactive requests from document processing and long-running work. Explain durable job state, queue acknowledgement, retries, idempotency, and agent execution boundaries. Demonstrate worker failure and redelivery without claiming exactly-once external effects.

Produce all required artifacts, validate what you can, report unchecked items, and stop after Stage 2.
```

### Stage 3: Enterprise Knowledge

Output: `10_AI_System_Design/stages/03-enterprise-knowledge/`

```text
Use the architecture-driven-staff-ai-system-design skill to create Stage 3: Enterprise Knowledge only. Read and follow the shared requirements in ai-system-design/START-HERE.md and the installed skill's stage contract and curriculum mapping.

Write this stage to 10_AI_System_Design/stages/03-enterprise-knowledge/. Keep shared architecture, ADRs, and coverage records under 10_AI_System_Design/. Read the actual Stage 2 artifacts in `10_AI_System_Design/stages/02-distributed-execution/` before designing the change.

Add document connectors, ingestion, indexing, source synchronisation, and permission-filtered retrieval. Trace a document from ingestion to a cited answer. Demonstrate how updates, deletions, and access changes affect retrieval, including a restricted-document case.

Produce all required artifacts, validate what you can, report unchecked items, and stop after Stage 3.
```

### Stage 4: Scale the Application

Output: `10_AI_System_Design/stages/04-application-scaling/`

```text
Use the architecture-driven-staff-ai-system-design skill to create Stage 4: Scale the Application only. Read and follow the shared requirements in ai-system-design/START-HERE.md and the installed skill's stage contract and curriculum mapping.

Write this stage to 10_AI_System_Design/stages/04-application-scaling/. Keep shared architecture, ADRs, and coverage records under 10_AI_System_Design/. Read the actual Stage 3 artifacts in `10_AI_System_Design/stages/03-enterprise-knowledge/` before designing the change.

Use an illustrative traffic increase to identify a measured or explicitly modelled bottleneck. Compare stateless replicas, caching, database changes, and autoscaling. Show capacity calculations and cache invalidation trade-offs; distinguish measurements from estimates.

Produce all required artifacts, validate what you can, report unchecked items, and stop after Stage 4.
```

### Stage 5: Handle Overload and Fair Scheduling

Output: `10_AI_System_Design/stages/05-overload-fairness/`

```text
Use the architecture-driven-staff-ai-system-design skill to create Stage 5: Handle Overload and Fair Scheduling only. Read and follow the shared requirements in ai-system-design/START-HERE.md and the installed skill's stage contract and curriculum mapping.

Write this stage to 10_AI_System_Design/stages/05-overload-fairness/. Keep shared architecture, ADRs, and coverage records under 10_AI_System_Design/. Read the actual Stage 4 artifacts in `10_AI_System_Design/stages/04-application-scaling/` before designing the change.

Model one tenant flooding a shared model provider. Add admission control, bounded per-tenant queues, concurrency limits, and weighted scheduling. Compare FIFO, priority, round-robin, and weighted round-robin. Use a deterministic simulator to show backlog, rejection, and tenant fairness under fixed capacity; include deadlines and retry effects.

Produce all required artifacts, validate what you can, report unchecked items, and stop after Stage 5.
```

### Stage 6: Enterprise Security

Output: `10_AI_System_Design/stages/06-enterprise-security/`

```text
Use the architecture-driven-staff-ai-system-design skill to create Stage 6: Enterprise Security only. Read and follow the shared requirements in ai-system-design/START-HERE.md and the installed skill's stage contract and curriculum mapping.

Write this stage to 10_AI_System_Design/stages/06-enterprise-security/. Keep shared architecture, ADRs, and coverage records under 10_AI_System_Design/. Read the actual Stage 5 artifacts in `10_AI_System_Design/stages/05-overload-fairness/` before designing the change.

Evolve the existing authentication and retrieval controls for multiple customer organisations. Show identity propagation, tenant-aware authorisation, trust boundaries, secrets, audit records, private connectivity, and data isolation. Demonstrate a cross-tenant access attempt and its enforcement outside the model.

Produce all required artifacts, validate what you can, report unchecked items, and stop after Stage 6.
```

### Stage 7: Reliability and Consistency

Output: `10_AI_System_Design/stages/07-reliability-consistency/`

```text
Use the architecture-driven-staff-ai-system-design skill to create Stage 7: Reliability and Consistency only. Read and follow the shared requirements in ai-system-design/START-HERE.md and the installed skill's stage contract and curriculum mapping.

Write this stage to 10_AI_System_Design/stages/07-reliability-consistency/. Keep shared architecture, ADRs, and coverage records under 10_AI_System_Design/. Read the actual Stage 6 artifacts in `10_AI_System_Design/stages/06-enterprise-security/` before designing the change.

Inject replica lag, worker crashes, dependency outages, and retries into the existing request and job paths. Choose consistency guarantees by data class. Explain duplicate effects, circuit breakers, failover, latency budgets, traces, and runbooks using observable failure signals and recovery steps.

Produce all required artifacts, validate what you can, report unchecked items, and stop after Stage 7.
```

### Stage 8: Production AI Quality and Releases

Output: `10_AI_System_Design/stages/08-evaluation-releases/`

```text
Use the architecture-driven-staff-ai-system-design skill to create Stage 8: Production AI Quality and Releases only. Read and follow the shared requirements in ai-system-design/START-HERE.md and the installed skill's stage contract and curriculum mapping.

Write this stage to 10_AI_System_Design/stages/08-evaluation-releases/. Keep shared architecture, ADRs, and coverage records under 10_AI_System_Design/. Read the actual Stage 7 artifacts in `10_AI_System_Design/stages/07-reliability-consistency/` before designing the change.

Introduce a model or retrieval regression and show how the release process detects it. Add versioned evaluation datasets, quality/cost/latency gates, canary or shadow tests, observability, and rollback. Include a worked release decision and distinguish simulated results from executed evaluations.

Produce all required artifacts, validate what you can, report unchecked items, and stop after Stage 8.
```

### Stage 9: Inference and GPU Infrastructure

Output: `10_AI_System_Design/stages/09-inference-gpu/`

```text
Use the architecture-driven-staff-ai-system-design skill to create Stage 9: Inference and GPU Infrastructure only. Read and follow the shared requirements in ai-system-design/START-HERE.md and the installed skill's stage contract and curriculum mapping.

Write this stage to 10_AI_System_Design/stages/09-inference-gpu/. Keep shared architecture, ADRs, and coverage records under 10_AI_System_Design/. Read the actual Stage 8 artifacts in `10_AI_System_Design/stages/08-evaluation-releases/` before designing the change.

Compare continued hosted inference with routing and self-hosted serving under explicit cost and latency assumptions. Explain the serving gateway, inference budget, GPU memory and placement, batching, and orchestration boundaries. Keep GPU and optimisation topics at their mapped depth; do not claim a simulator is a hardware benchmark.

Produce all required artifacts, validate what you can, report unchecked items, and stop after Stage 9.
```

### Stage 10: Fine-Tuning and Model Customization

Output: `10_AI_System_Design/stages/10-fine-tuning/`

```text
Use the architecture-driven-staff-ai-system-design skill to create Stage 10: Fine-Tuning and Model Customization only. Read and follow the shared requirements in ai-system-design/START-HERE.md and the installed skill's stage contract and curriculum mapping.

Write this stage to 10_AI_System_Design/stages/10-fine-tuning/. Keep shared architecture, ADRs, and coverage records under 10_AI_System_Design/. Read the actual Stage 9 artifacts in `10_AI_System_Design/stages/09-inference-gpu/` before designing the change.

Assess whether prompting, retrieval, or fine-tuning meets a customer behaviour requirement. For the justified customisation path, show dataset versions, training job control, experiment tracking, checkpoints, evaluation, registry, and approval. Respect the D0 target for distributed training rather than expanding it into a training implementation course.

Produce all required artifacts, validate what you can, report unchecked items, and stop after Stage 10.
```

### Stage 11: Global Multi-Region Platform

Output: `10_AI_System_Design/stages/11-multi-region/`

```text
Use the architecture-driven-staff-ai-system-design skill to create Stage 11: Global Multi-Region Platform only. Read and follow the shared requirements in ai-system-design/START-HERE.md and the installed skill's stage contract and curriculum mapping.

Write this stage to 10_AI_System_Design/stages/11-multi-region/. Keep shared architecture, ADRs, and coverage records under 10_AI_System_Design/. Read the actual Stage 10 artifacts in `10_AI_System_Design/stages/10-fine-tuning/` before designing the change.

Introduce data residency, regional demand, and regional failure requirements. Define regional control and data boundaries, routing, replication, disaster recovery, and capacity. Quantify recovery objectives and unit economics using labelled assumptions, and walk through one regional outage.

Produce all required artifacts, validate what you can, report unchecked items, and stop after Stage 11.
```

### Stage 12: Staff-Level Platform Architecture

Output: `10_AI_System_Design/stages/12-staff-platform/`

```text
Use the architecture-driven-staff-ai-system-design skill to create Stage 12: Staff-Level Platform Architecture only. Read and follow the shared requirements in ai-system-design/START-HERE.md and the installed skill's stage contract and curriculum mapping.

Write this stage to 10_AI_System_Design/stages/12-staff-platform/. Keep shared architecture, ADRs, and coverage records under 10_AI_System_Design/. Read the actual Stage 11 artifacts in `10_AI_System_Design/stages/11-multi-region/` before designing the change.

Synthesise the actual platform built through Stage 11 into a reference architecture and decision portfolio. Define platform abstractions, internal developer workflows, a phased migration, total cost of ownership, ownership boundaries, and an operating model. Include a Staff-level architecture defence, competing options, and a capstone review of verified coverage and remaining gaps.

Produce all required artifacts, validate what you can, report unchecked items, and stop after Stage 12.
```

## Focused Topic Prompt

Use this after Stage 5 exists, or require an explicitly hypothetical Stage 5 baseline.

```text
Use the architecture-driven-staff-ai-system-design skill to create module 5.4, Fair scheduling and workload prioritization, at its mapped D2 depth. Follow the shared requirements in ai-system-design/START-HERE.md. Ground the explanation in the actual Stage 5 architecture; label the reference baseline as hypothetical if Stage 5 has not been created.

Write matching guide.md and standalone offline guide.html to 10_AI_System_Design/topics/5.4-fair-scheduling/. Explain FIFO, priority, round-robin, weighted round-robin, and tenant limits. Include a deterministic visual lab with fixed capacity, visible queue and fairness results, reset behaviour, and a worked static case. Record topic coverage without claiming the whole stage is complete. Validate the artifacts and report checks not run.
```

## Validation Commands

Run from the repository root after lesson creation. Choose the command for the installed skill you used.

Codex:

```bash
python3 .agents/skills/architecture-driven-staff-ai-system-design/scripts/validate_skill.py --workspace 10_AI_System_Design
```

Claude Code:

```bash
python3 .claude/skills/architecture-driven-staff-ai-system-design/scripts/validate_skill.py --workspace 10_AI_System_Design
```

The validator checks curriculum mapping, stage artifact presence, and declared validation status. It does not prove lesson accuracy, learner mastery, or browser functionality; run and record those checks separately.
