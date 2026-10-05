# Practise Context and Orchestration Interview Questions

*An answer that names a pattern sounds fluent, but only an answer that says where each decision lives and what the model saw can be checked.*

◷ 5 min

Interviewers rarely ask for a definition here; they describe a symptom or a cost and wait for a mechanism. Answer each prompt out loud first, then compare with the outline and reread the lesson it points to.

**Objectives:**

- answer the common orchestration and context prompts in under a minute each;
- lead diagnosis answers with "reconstruct what the model saw";
- defend a pattern's extra cost with the failure it prevents.

---

## Lead With the Mechanism, Then the Pattern

Most questions in this area share one skeleton. Say where the decision lives, or what the model saw at the failing step. Then name the pattern that changes it. Then say what it costs.

An answer that starts with "maybe the model isn't good enough" cannot be checked. An answer that starts with "first I'd rebuild the exact context at that step" can.

## Practise the Orchestration Questions

**1. "Walk me through where the decisions live in your design."**
List each decision and say whether code, a small model or the reasoning model makes it. For each one in the reasoning model, ask whether it could live one level down. Auditing like this signals experience running a system at cost. → [Control Placement](01_Control_Placement.md)

**2. "What did you make deterministic on purpose, and why?"**
Routing and classification steps, pinned to a workflow. Determinism there is cheap and keeps the behaviour testable. → [Control Placement](01_Control_Placement.md)

**3. "When would you use a workflow pattern instead of a full agent?"**
When the paths through the system are few and can be listed. The model then does not need to own control flow. → [Control Placement](01_Control_Placement.md)

**4. "Which orchestration topology would you use?"**
Compose several rather than picking one. Route first, run known classes as fixed workflows, send the ambiguous residue to a bounded loop, and fan out independent lookups inside a step. Add that routing decisions are recorded as metrics, so drift shows. → [Orchestration Topologies](02_Orchestration_Topologies.md)

**5. "One worker in your parallel fan-out fails. What happens to the other nine?"**
Give an explicit policy. Either return partial results with a clear "1 of 10 failed" signal, or abort the whole job. Make sure the merge step tolerates a missing entry. → [Orchestration Topologies](02_Orchestration_Topologies.md)

## Practise the Planning Questions

**6. "ReAct or plan-and-execute?"**
If the steps can be sketched before running anything, plan first, with a replanning path. If each step depends on the last tool result, use ReAct. → [Planning and Self-Correction Patterns](03_Planning_and_Self_Correction_Patterns.md)

**7. "Compare a plain planner and executor with PEV on a flaky tool."**
The plain version treats the tool's error string as data and produces a confident wrong figure. The verifier in PEV classifies the string as a failure, triggers a replan with a different query, and recovers. → [Planning and Self-Correction Patterns](03_Planning_and_Self_Correction_Patterns.md)

**8. "Convince me the verifier's extra call is worth it, with a number."**
The cost is one extra model call per step. Price it against a confident wrong answer in a domain where that is expensive, such as finance or anything customer-facing. In the source comparison, the verifier is what wins on the error-handling score. → [Planning and Self-Correction Patterns](03_Planning_and_Self_Correction_Patterns.md)

## Practise the Context Questions

**9. "The agent loses track after 20 steps. What do you do?"**
Reconstruct exactly what the model saw at the step where it went wrong. Check whether instructions or the goal were evicted. Then check context rot: is the window full of stale results? The fixes are sectioned assembly with non-evictable instructions, per-step selection, and isolating subtasks. → [Deterministic Context Assembly](05_Deterministic_Context_Assembly.md)

**10. "Answer quality degrades on long runs, but every component tests clean. Diagnose it."**
Start by rebuilding the context at the failing step, not by blaming the model. Check instruction eviction first, then context rot. Ask whether any test runs past the compaction threshold. → [Context Rot and Sub-Agent Isolation](06_Context_Rot_and_Sub_Agent_Isolation.md)

**11. "How would you keep a research agent's context small?"**
Isolate each research subtask in its own window and return only the conclusion. Keep each sub-agent's trace linked from the parent span, so a wrong conclusion stays explainable. → [Context Rot and Sub-Agent Isolation](06_Context_Rot_and_Sub_Agent_Isolation.md)

**12. "What is context engineering, in one line?"**
Choosing on purpose what enters a fixed-size window at each step, through four operations: write, select, compress and isolate. → [The Four Context Operations](04_The_Four_Context_Operations.md)

---

## Key Takeaways

- Lead with where each decision lives or what the model saw, then name the pattern and its cost.
- Orchestration questions test control placement, topology composition and an explicit partial-failure policy.
- Planning questions test whether the task's shape justifies a plan, a verifier or a critique step.
- Context questions almost always start with reconstructing the failing step's context, then instruction eviction, then rot.

## Check Yourself

1. **What is the first move in any "it degrades on long runs" question?**
   Reconstruct exactly what the model saw at the failing step.

2. **Name the four context operations.**
   Write, select, compress and isolate.

3. **What must a fan-out design state before launch?**
   What a partial failure returns: partial results with a failure count, or a full abort.

## References

**Sources:** `ch06_orchestration_context_engineering.md` (*Cracking Agentic AI System Design Interviews*, Ch. 6: its interview pointers on control placement, composed topologies and long-run degradation, summarised in our own words). `agent_fundamentals_and_advanced_agentic_systems_INTERVIEW_TUTORIAL.md`: §3 "ReAct vs. Plan-and-Execute" one-liner, §4 question 7, §5.2 questions 6 and 10, §7 question 13 and the "explain to a skeptical staff engineer" prompt on PEV, with every answer rewritten in our own words and pointed at lessons 1 to 6 of this module.
