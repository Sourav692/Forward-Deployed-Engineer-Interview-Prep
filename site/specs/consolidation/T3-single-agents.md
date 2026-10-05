# T3 Single Agents: Consolidation Note (T3.1 to T3.3)

Date: 5 October 2026. Scope: T3.1 "What an agent is: the tool-calling loop", T3.2 "Tool design, the agent-computer interface, MCP and A2A" and T3.3 "Context engineering and orchestration". T3.4 was consolidated earlier (PR #31). T3.5 to T3.7 are handled in a separate pass.

New lessons live in `01_Concept_Tutorials/Consolidated_Lessons/T3.1_The_Tool_Calling_Loop/`, `T3.2_Tool_Design_MCP_and_A2A/` and `T3.3_Context_Engineering_and_Orchestration/`. Each folder has a README listing its sources. Redirects for retired lessons are in `site/src/lib/consolidation/t3.ts` under the `// T3.1–T3.3` comment.

## Mapping

### T3.1 `the-tool-calling-loop` (4 lessons, all own material)

| Old lesson | Status | Now taught in |
|---|---|---|
| `what-an-agent-actually-is` (FDE Handbook 03) | excluded, redirects | `what-an-agent-is` |
| `tool-calling-loop-from-scratch` (FDE Handbook 04) | excluded, redirects | `the-tool-calling-loop-from-scratch` |
| `agent-fundamentals-and-advanced-agentic-systems-interview-tutorial` | excluded, redirects | `practise-agent-loop-interview-questions` (plus slices in T3.1 to T3.3, see handoffs) |

New order: What an Agent Is; The Tool-Calling Loop From Scratch; Loop Guards and Termination; Practise Agent Loop Interview Questions.

### T3.2 `tool-design-mcp-a2a` (7 lessons, credited: Chapter 5)

| Old lesson | Status | Now taught in |
|---|---|---|
| `ch05-tool-use-agent-computer-interface` | excluded, redirects | `the-agent-computer-interface` |

New order: The Agent-Computer Interface; Tool Schema Design; Typed Tool Results and Teachable Errors; The Tool Gateway and Code Sandboxing; The Model Context Protocol; Tool Selection at Scale; Practise Tool Design Interview Questions. The module stays Partly ready; its `gapNote` (the A2A protocol) is unchanged because no source covers A2A.

### T3.3 `context-engineering` (7 lessons; six credited to Chapter 6, one own)

| Old lesson | Status | Now taught in |
|---|---|---|
| `ch06-orchestration-context-engineering` | excluded, redirects | `control-placement` |

New order: Control Placement; Orchestration Topologies; Planning and Self-Correction Patterns (own material only); The Four Context Operations; Deterministic Context Assembly; Context Rot and Sub-Agent Isolation; Practise Context and Orchestration Interview Questions.

No `seeAlso` anywhere in `curriculum.ts` pointed at the retired lessons, so none needed replacing. No live lessons sit in these modules, so no display titles needed cleaning.

## Source conflicts

- **Topology names.** Chapter 6 names six topologies (sequential, router, parallel fan-out, bounded loop, hierarchical, event-driven). The interview tutorial names workflow patterns differently (routing, prompt chaining, evaluator-optimizer, orchestrator-worker). Orchestration Topologies maps one set onto the other.
- **Retry guard boundary.** The interview tutorial's Planner-Executor-Verifier notebook guards with `retries > 3`, which allows four planning passes. Loop Guards and Termination and Planning and Self-Correction Patterns both point this out rather than repeating the number as "three".
- **How much an error should explain.** The interview tutorial (§1.2) says every tool error should be specific enough to change the model's next action. Chapter 5 says a denial must never explain itself to the model, or the model learns to work around the policy. Typed Tool Results and Teachable Errors follows Chapter 5 for denials, keeps the reason in the human-readable trace, and says so on the page.
- **Error vocabulary.** The FDE Handbook splits tool failures into `TransientError` and `NotFoundError`; Chapter 5 uses five typed result states. Typed Tool Results and Teachable Errors presents both and shows how they line up.

## Handoffs

The interview tutorial (`agent_fundamentals_and_advanced_agentic_systems_INTERVIEW_TUTORIAL.md`) was homed in T3.1 but covers most of the track and beyond. Its T3.1 to T3.3 sections are taught here. The rest is not taught by any of these lessons and should be placed by the owning module or the integrator:

| Material | Section | Owner |
|---|---|---|
| Short-term vs long-term memory, checkpointer choice, `MemorySaver` amnesia, summarisation middleware | §1.8, §2, §3, §4 Q3, §5.2 Q7 | T3.4 (already consolidated; check nothing is missing) |
| Human-in-the-loop interrupts and safe resume, `NodeInterrupt` gotcha, node-level `RetryPolicy` and its gotcha, idempotent resume | §1.10, §1.11, §2, §5.2 Q4 and Q9, §7 Q2, Q3 and Q14 | T3.5 Robust agents |
| Supervisor, swarm and hierarchical topologies, blackboard, deep agents, single vs multi-agent and supervisor vs swarm trade-offs, multi-agent failure question, order-support take-home | §1.6, §1.7, §1.9, §3, §4 Q5, §5.2 Q5 and Q8, §7 Q4 and Q12 | T3.6 Multi-agent systems |
| Mock design: real-time travel support agent (rubric and worked answer) | §6 | T3.6 or a track-level practice page |
| Agent, RAG and tool evaluation; deterministic vs LLM-as-judge metrics | §1.14, §3, §5.1, §7 Q8 and Q9 | T4.2 Evaluation (other track) |
| Observability and tracing; debugging a bad run with no repro | §1.15, §4 Q10, §7 Q15, §5.3 Q8 | T4.3 Observability (other track) |
| Low-latency agent pipeline | §4 Q6 | T4.5 Cost and latency (other track) |
| Applied AI and FDE role-track questions (RAG debugging, customer scoping, data residency) | §5.1, §5.3 | T2 RAG modules and T1 delivery modules (other tracks) |
| ChromaDB `n_results` warning | §2 | T2.4 Retrieval (other track) |
| Chapter 5 sandboxing and MCP security link to prompt-injection and the "lethal trifecta" | ch05 MCP deep dive | T4.4 Security may cross-link to The Model Context Protocol |
| Chapter 6 prefix caching quantified in a later chapter | ch06 assembly key points | T4.5 Cost and latency may cross-link to Deterministic Context Assembly |
