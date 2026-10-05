# Practise Multi-Agent Interview Questions

*An impressive multi-agent design loses marks if it never says why one agent was not enough, or what stops the agents looping, leaking, or overspending.*

◷ 12 min

Most multi-agent questions test judgement before mechanics: interviewers want the simpler design named first. Answer each prompt below out loud, then compare with the outline and reread the lesson it points to.

**Objectives:**

- answer the common multi-agent prompts in under a minute each;
- lead every answer with the justification for the split, or the refusal to split;
- work through a full multi-agent design against a scoring checklist.

---

## Lead With the Justification, Then the Controls

Most multi-agent answers share one skeleton. First, say whether multiple agents are justified, and name the trigger. Second, name the pattern and what it costs per hop. Third, say what passes between agents and what scope it carries. Fourth, say what stops the run: the done flag, the hop cap, and the no-progress check. Finally, say how each agent is evaluated.

An answer that starts with the architecture cannot be checked. "We'd have a researcher, a writer, and a reviewer" leaves the interviewer to ask why. The outlines below follow the skeleton.

## Practise the Justification Questions

**1. "When is multi-agent worse than one agent with more tools?"**
Most of the time. It adds coordination overhead, message-passing latency, and failures a single agent cannot have, such as agents waiting on a peer that never signals done. Justify a split only by naming what it buys: real parallelism, distinct tool permissions per role, conflicting contexts, or too many tools for one agent to route well. → [When Multi-Agent Is Justified](/learn/agentic-systems/multi-agent-systems/when-multi-agent-is-justified)

**2. "Why not one agent?"**
Name the trigger and, ideally, the failure that showed it. The insurer's single agent carried 20+ tool schemas and full history, and failed on context bloat and tool confusion in testing. Close with the line that a pipeline of eight steps is still one agent. → [When Multi-Agent Is Justified](/learn/agentic-systems/multi-agent-systems/when-multi-agent-is-justified)

**3. "A customer asks for a team of AI agents."**
Ask what each agent would do differently. Often the honest answer is one agent, and saying so early builds trust. A legitimate reason to split is different departments needing different data access, enforced through per-agent tool permissions in code, not prompts. → [When Multi-Agent Is Justified](/learn/agentic-systems/multi-agent-systems/when-multi-agent-is-justified)

**4. "When would you collapse three agents into one?"**
When they share tools, share context, and never run concurrently. They are then three prompts, not three agents. → [When Multi-Agent Is Justified](/learn/agentic-systems/multi-agent-systems/when-multi-agent-is-justified)

## Practise the Pattern Questions

**5. "Supervisor or handoff?"**
A supervisor holds the plan and is easy to log, at one extra model call per hop. A handoff is cheaper and natural when the conversation should move, as in support tiers, but nothing holds the overall plan. → [Multi-Agent Coordination Patterns](/learn/agentic-systems/multi-agent-systems/multi-agent-coordination-patterns)

**6. "What does adding a management layer cost?"**
One routing call per level before any work happens. Add a level only when one router has too many agents to choose between well, roughly five or more. Measure routing calls as a share of all calls. → [Multi-Agent Coordination Patterns](/learn/agentic-systems/multi-agent-systems/multi-agent-coordination-patterns)

**7. "When would you use orchestrator-workers instead of a supervisor?"**
When the number and shape of subtasks are unknown until the task is inspected, such as a codebase migration grouped by dependencies. A supervisor suits roles fixed at design time. → [Multi-Agent Coordination Patterns](/learn/agentic-systems/multi-agent-systems/multi-agent-coordination-patterns)

**8. "When would you evolve a supervisor into a deep agent?"**
When the supervisor's own tool list starts to bloat as domains grow: the original trigger, one level up. Each sub-agent gets its own prompt, small toolset, and context. The cost is more infrastructure and more moving parts. → [From Supervisor to Deep Agent](/learn/agentic-systems/multi-agent-systems/from-supervisor-to-deep-agent)

## Practise the State and Termination Questions

**9. "How do agents communicate?"**
Through shared state, not direct calls. Each agent returns updates, the graph merges them, and the graph decides who runs next. Any key more than one agent writes needs a reducer. Direct calls would bypass the graph's checkpoints. → [Shared State, Routing, and Termination](/learn/agentic-systems/multi-agent-systems/shared-state-routing-and-termination)

**10. "Four agents ran, one result came back. What did you forget?"**
A reducer. All four wrote one key with last-write-wins semantics. Use `Annotated[list, operator.add]` and synthesise at the end. → [Shared State, Routing, and Termination](/learn/agentic-systems/multi-agent-systems/shared-state-routing-and-termination)

**11. "How do you keep routing safe when you add an agent?"**
Structured output with a `Literal` over real agent names, with both the `Literal` and the routing map derived from one list. Log the router's `reasoning` field for every hop. → [Shared State, Routing, and Termination](/learn/agentic-systems/multi-agent-systems/shared-state-routing-and-termination)

**12. "Your supervisor and worker are stuck rejecting and retrying. Fix it."**
Layer three defences. A hard hop cap returns partial results with a reason. A no-progress check catches the same agent getting the same input twice. Feedback specific enough lets the worker change its approach. Add an explicit done flag so the end is a value, not a hope. → [Shared State, Routing, and Termination](/learn/agentic-systems/multi-agent-systems/shared-state-routing-and-termination)

## Practise the Handoff and Security Questions

**13. "What passes between agents?"**
A small, defined package, not the full conversation. It holds the case ID, what was asked, what was attempted, why it was insufficient, what was gathered, and the permission scope. Full history makes each hop pay for every earlier one. → [Handoffs and Permission Scope](/learn/agentic-systems/multi-agent-systems/handoffs-and-permission-scope)

**14. "Why carry permission scope rather than re-derive it?"**
A receiver that re-resolves identity, or runs as a service principal, can gain wider access than the request had. The same tenant, clearance, region, and compartments travel with the case. → [Handoffs and Permission Scope](/learn/agentic-systems/multi-agent-systems/handoffs-and-permission-scope)

**15. "Where do guardrails live in a multi-agent system?"**
Outside the model, at the graph level. Validate tool arguments before execution, enforce per-agent tool permissions in the runtime rather than in prompts, and require human approval for irreversible actions. The model proposes; the system decides. → [Handoffs and Permission Scope](/learn/agentic-systems/multi-agent-systems/handoffs-and-permission-scope)

## Practise the Failure, Evaluation, and Cost Questions

**16. "Ten agents run in parallel and one fails. What does the user get?"**
Whatever was decided in advance; the question tests whether anyone decided. Abort the batch, or return partial results with the failure attached. For research, partial results with a gap note are usually right. → [Failure Isolation and Evaluation](/learn/agentic-systems/multi-agent-systems/failure-isolation-and-evaluation)

**17. "The ticketing system is down. What still works?"**
With a breaker and budget per agent, only the Record agent is affected. Triage that knows agent health still routes pure knowledge questions to the Answer agent. → [Failure Isolation and Evaluation](/learn/agentic-systems/multi-agent-systems/failure-isolation-and-evaluation)

**18. "How would you evaluate a multi-agent system?"**
Score each agent with its own golden set, and measure routing accuracy as a classifier. Score handoff completeness. Evaluate the trajectory as well as the outcome, since a right answer through wasted hops is fragile. Keep the leak gate at zero across every agent and handoff. → [Failure Isolation and Evaluation](/learn/agentic-systems/multi-agent-systems/failure-isolation-and-evaluation)

**19. "How do you debug a bad multi-agent answer?"**
Use a trace keyed by run ID that records, per hop, which agent ran, why the supervisor chose it, what it saw, and what it returned. Find the first hop where the path diverged. Most bad outputs are bad routing, so check routing consistency first. → [Failure Isolation and Evaluation](/learn/agentic-systems/multi-agent-systems/failure-isolation-and-evaluation)

**20. "Your system is accurate but too expensive. Trim it without hiding failure."**
Account first, by agent and by hop. Then collapse pass-through agents, send only hard steps to the expensive model, cache prompt prefixes, and pass summaries. Every cut ships with an evaluation number showing quality held. → [Failure Isolation and Evaluation](/learn/agentic-systems/multi-agent-systems/failure-isolation-and-evaluation)

## Practise the Case-Study Questions

**21. "Is a search, summarise, write, and critique loop multi-agent?"**
Name the definition in use. By the FDE Handbook's test, it is a pipeline with a loop and a gate that shares one context and tool set. The coordination-patterns guide would call the generator and Critic an evaluator-optimizer pair. What justifies the split is the Critic's independent judgement and the bounded retry. → [Anatomy of a Deployed Multi-Agent Platform](/learn/agentic-systems/multi-agent-systems/anatomy-of-a-deployed-multi-agent-platform)

**22. "Why centralise data-asset resolution at the supervisor?"**
Independent retrieval per specialist could resolve one question to different tables. One extra hop buys a single, auditable source of truth. → [From Supervisor to Deep Agent](/learn/agentic-systems/multi-agent-systems/from-supervisor-to-deep-agent)

**23. "How long would this take to build properly?"**
Longer than the demo. Termination, partial failure, and per-agent permissions are where the real time goes. → [Failure Isolation and Evaluation](/learn/agentic-systems/multi-agent-systems/failure-isolation-and-evaluation)

> **Warning: do not lead with the framework.** Naming a library answers none of the skeleton's questions. An answer that starts with tools and agent names, and never says why or what stops it, reads as architecture by fashion.

## Rehearse a Full Mock: A Travel Support Agent

A 45-minute mock tests whether the controls appear without prompting. The agent fundamentals tutorial sets this one. A travel booking company wants an agent for customer support: lookups on existing bookings, changes and cancellations, and policy questions. Weather disruptions bring thousands of conversations at once. No conversation may be lost mid-flight, and no refund over $200 may go out without a human check.

Pick the least autonomous shape that works. A supervisor over three specialists fits: a read-only booking lookup, a policy question-answerer over the policy documents with no side-effecting tools, and a change-or-cancel agent that alone can write to the booking system. Prefer the supervisor over peer handoff here, because refunds need every routing decision logged in one place. Then say what needs no agent at all. "What is the baggage allowance?" is a direct retrieval lookup, wired as a workflow.

Place the approval gate precisely. The change-or-cancel agent computes the refund in plain code, with no model call for the number. Above $200 it raises an interrupt before the refund tool runs. The refund call is keyed by booking ID plus a generated request ID, so an approved resume cannot pay twice.

Close with state, limits, and operations. Keep each conversation as a thread in a durable checkpointer such as Postgres, never an in-memory saver. Keep cross-session customer history in a separate store, read once at the start of a thread. Cap each conversation at 15 steps before it must resolve or go to a human, and alert on a per-conversation cost ceiling. Retry only the booking-system calls on transient network errors. Send malformed tool calls back to the supervisor to re-plan. Stream the reply so customers see progress during a spike. Trace every model and tool call, and alert on approval wait time, because a backlog of pending refunds is itself an incident.

| Did the answer... | Points to |
|---|---|
| Justify the topology? | Supervisor over three specialists, with the audit reason |
| Place the human gate and protect the resume? | Interrupt above $200, idempotent refund key |
| Separate thread state from customer history? | Durable checkpointer plus a separate store |
| Bound the run? | Step cap, cost ceiling, hand-off to a human |
| Split retry from escalation? | Retry transient errors, re-plan bad calls |
| Cover scale and observability? | Threads in a database, streaming, traced spans |
| Refuse an agent where none is needed? | Policy lookup as a plain workflow |

## Worked Example: Design a Research System With a Supervisor and Workers

The prompt: "Design a research system that answers broad questions with cited reports."

Start with the justification. The sub-questions of a broad topic are independent, so parallelism is a real gain. The latency becomes that of the slowest worker, not the sum. That names the trigger.

Then the pattern. A supervisor plans N queries. Workers run them in parallel, and a synthesiser merges the results. Volunteer the honest trade-off: if the decomposition is predictable, the supervisor's planning call is pure overhead, so hardcode it.

Then state and termination. The shared `findings` key uses `operator.add`, so parallel writes accumulate. A hop cap and a budget of model calls per run bound the cost. A no-progress check stops repeated identical delegations. A failed worker writes an error marker, and the report is returned with the gap noted.

Then evaluation. Score the planner's decomposition and each worker's retrieval separately. Score the trajectory as well as the final report, and keep a per-hop trace with the supervisor's reasoning.

Check the answer against this list.

| Did the answer... | Points to |
|---|---|
| Name why multiple agents are justified here? | Parallelism over independent sub-questions |
| Name the pattern and its cost? | Supervisor, planning call, and when to hardcode it |
| Say how parallel results merge? | A reducer on `findings` |
| Say what stops the run? | Hop cap, call budget, and no-progress check |
| Decide partial failure? | Partial report with the gap noted |
| Say how it is evaluated? | Per agent, trajectory, and outcome |

A strong answer covers all six without being asked. The point is not the diagram but the reasons and limits around it.

---

## Key Takeaways

- Lead every answer with whether a split is justified and which trigger fired.
- Name the pattern and its cost per hop or per level, and know when to hardcode the plan.
- State that agents talk through shared state, that shared keys need reducers, and how termination works.
- Say what the handoff package holds and that permission scope travels with it.
- Decide partial failure in advance, isolate failures per agent, and evaluate per agent and per trajectory.
- Use the case studies to show escalation justified by measured failure, and say which definition of multi-agent you use.
- In a full mock, volunteer the human gate, the safe resume, the run limits, and the parts that need no agent.

## Check Yourself

1. **An interviewer asks you to design "a team of agents" for a support inbox. What is your first move?**
   Ask what each agent would do differently and whether one agent with good tools would do. Split only for a named reason, such as distinct tool permissions per domain, and say so out loud.

2. **What three defences stop a supervisor and worker looping forever?**
   A hard hop cap that returns partial results with a reason, a no-progress check on repeated identical delegations, and feedback specific enough for the worker to change its approach. An explicit done flag ends a finished run.

3. **What is the highest-value thing to log in a multi-agent run, and why?**
   The supervisor's routing reasoning for each hop. Most bad multi-agent outputs come from bad routing, and the reasoning is free labelled data for debugging and evaluating the router.

## References

**Sources:** `07_multi_agent_systems_INTERVIEW_TUTORIAL.md`: §1 "Say this in an interview" prompts, §3 one-liners, §4 "Top 10 interview questions" (restated in new words), §5 "Role tracks", and §6 "Self-check". FDE Handbook, Multi-Agent Systems: the "Interview lens" and "Checkpoint" sections of `01_When_Multi_Agent_Is_Justified.md`, `02_Reference_Architecture_Handoffs.md`, `03_Failure_Isolation_And_Evaluation.md`, `04_Case_Study_Research_Platform.md`, and `05_Case_Study_Supervisor_To_Deep_Agent.md`. `multi_agent_coordination_patterns.md`: "Cross-Pattern Comparison Summary". `agent_fundamentals_and_advanced_agentic_systems_INTERVIEW_TUTORIAL.md`: §6 "Mock system design: a real-time customer support agent for a travel booking platform" (prompt, rubric and worked answer, restated in new words).
