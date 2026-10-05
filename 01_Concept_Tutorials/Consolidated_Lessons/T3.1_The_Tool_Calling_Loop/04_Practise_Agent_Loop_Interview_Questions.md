# Practise Agent Loop Interview Questions

*An answer that names a framework sounds fluent, but only an answer that names the mechanism shows it was ever built.*

◷ 7 min

"What is an agent?" is asked to see whether a candidate reaches for a framework name or for the mechanism. Answer each prompt below out loud first, then compare with the outline and reread the lesson it points to.

**Objectives:**

- answer the common agent-loop prompts in under a minute each;
- lead every answer with the mechanism: components, loop, guard;
- say where a human approves, and how the run pauses for it.

---

## Lead With the Mechanism, Then the Difficulty

Most agent-loop questions share a skeleton. Name the three components. Name the guard. Then say where the real difficulty is: the agent can act, so every design choice is about containing what happens when it is wrong. A framework name, if needed at all, comes last.

An answer that starts with a library cannot be checked. "We'd use a prebuilt ReAct agent" leaves the interviewer to guess whether the candidate knows what it does when a tool fails. The outlines below follow the skeleton.

## Practise the Definition Questions

**1. "What is an agent?"**
A loop. A brain picks a tool or finishes, the loop runs the tool and feeds the result back, and a step budget bounds it. The mechanics are easy. The hard part is that it can act, so every design decision is about containing what happens when it is wrong. → [What an Agent Is](01_What_an_Agent_Is.md)

**2. "Explain ReAct in one sentence."**
Reason, act, observe, repeat: the model reasons about what to do, calls a tool, sees the result and reasons again. It is the simplest agent architecture and the default before anything fancier. → [What an Agent Is](01_What_an_Agent_Is.md)

**3. "Workflow or agent? How do you choose?"**
Pick the least autonomous shape that solves the problem. When the paths through the system are few and known, a workflow such as routing or prompt chaining is predictable and cheap to test. Use an agent only when the model must decide what to do next based on the last result. → [What an Agent Is](01_What_an_Agent_Is.md)

**4. "Why is the destructive flag on the tool and not checked by the model?"**
The model is the part that may be wrong. Declaring the flag at registration lets the loop treat writes differently whatever the brain decides. → [What an Agent Is](01_What_an_Agent_Is.md)

**5. "What is the difference between a transient error and a not-found error, and why should an agent care?"**
A transient error, such as a network blip or a 503, is safe to retry. A not-found error is permanent; retrying wastes budget, and a fallback may help instead. → [What an Agent Is](01_What_an_Agent_Is.md)

## Practise the Loop-Building Questions

**6. "Write the agent loop on the whiteboard."**
Write the seven steps in order: the guard, think, the final-answer exit, resolve the tool, act through the safety layer, the pause for confirmation, observe. Narrate the guard and the pause as you go. Then say the two lines that mark a strong answer. The default policy denies every destructive tool, so the agent cannot close a ticket until it is given a policy that allows it. The brain sits behind a one-method contract, so swapping a rule-based router for a model changes nothing in the loop or its guards. → [The Tool-Calling Loop From Scratch](02_The_Tool_Calling_Loop_From_Scratch.md)

**7. "What does the session hold, and why not keep it on the agent?"**
History for follow-ups, a memo of tool results, and the logger's trace. They belong to one conversation, not to the agent, which serves many conversations. → [The Tool-Calling Loop From Scratch](02_The_Tool_Calling_Loop_From_Scratch.md)

**8. "Design an agent that books travel. Where does a human approve?"**
Before any payment or irreversible booking confirmation. Search and comparison steps need no approval. Show the pause: the run returns what it was about to do, and resumes only after a yes, without repeating anything already done. → [The Tool-Calling Loop From Scratch](02_The_Tool_Calling_Loop_From_Scratch.md)

## Practise the Termination Questions

**9. "How do you prevent an agent from looping forever?"**
Name concrete bounds: a step budget, a cost ceiling, a wall-clock timeout, and a cap on re-plans. "The model will figure out it is done" is not an answer. → [Loop Guards and Termination](03_Loop_Guards_and_Termination.md)

**10. "Design the state machine for an agent's execution loop."**
Name the states, such as planning, executing, waiting for approval, processing a result and terminated. Then name every path into terminated: success, budget exhausted, fatal error and human rejection. → [Loop Guards and Termination](03_Loop_Guards_and_Termination.md)

**11. "Your agent loops forever on 3% of requests. Diagnose and fix."**
Check the guard's boundary condition first; an off-by-one is a realistic root cause. Then read a looping trace for identical repeated tool calls, which mean the error message gives the model nothing new. Fix the error and route repeated failures to a re-plan or a human. → [Loop Guards and Termination](03_Loop_Guards_and_Termination.md)

**12. "Your step cap is 15. Defend that number."**
The source poses this as an open challenge and gives no formula for the number. Defend the behaviour instead: when the cap trips, the agent must resolve or hand off to a human. Pair the cap with a per-conversation cost ceiling that is logged and alerted on. → [Loop Guards and Termination](03_Loop_Guards_and_Termination.md)

## Worked Example: A Two-Minute Answer to "What Is an Agent?"

An interviewer asks the definition and then follows up. A strong answer runs like this.

"An agent is a loop with three parts. Tools are the things it can do; each declares whether it is destructive. A brain takes the query and everything observed so far and returns a tool call or a final answer. The loop runs the tool, feeds the result back, and stops on a final answer or when a guard trips. So 'close the ticket about login' becomes a search, then a close, without anyone writing that plan down."

The follow-up is "so what is hard about it?" The answer: "Not tool selection. It is trust. The close step is irreversible, so the default policy denies it and the run pauses for a human. Every later design choice, idempotency, retries, rollout, is about containing a brain that is sometimes wrong."

The answer never names a framework. It names three components, a guard, a pause and a reason. That is the shape every outline above follows.

> **Warning: do not over-claim autonomy.** Calling a fixed chain an agent, or proposing an agent where a router would do, reads as inexperience. Say which shape the task needs and why, before describing how to build it.

---

## Key Takeaways

- Lead with the mechanism: three components, one loop, one guard, then the difficulty.
- Definition questions test whether the agent is described as a loop with a guarded brain, not a library.
- Loop-building questions test the seven steps, the three exits and the deny-by-default policy.
- Termination questions test concrete budgets, named endings and a diagnosis from traces.
- A strong two-minute answer names no framework and still answers the follow-up about trust.

## Check Yourself

1. **What two sentences separate a strong whiteboard loop answer from a working one?**
   The default policy denies every destructive tool until a policy allows it. The brain is behind a one-method contract, so swapping it changes nothing in the loop or guards.

2. **Where does a travel-booking agent need human approval?**
   Before payment or an irreversible booking confirmation, not on search or comparison.

3. **What two checks diagnose a loop that runs to the guard on a small share of requests?**
   The guard's boundary condition, and the trace for identical repeated tool calls caused by unhelpful errors.

## References

**Sources:** `03_What_An_Agent_Actually_Is.md` (FDE Handbook): "Interview lens" and "Checkpoint". `04_Tool_Calling_Loop_From_Scratch.md`: "Interview lens" and "Checkpoint". `agent_fundamentals_and_advanced_agentic_systems_INTERVIEW_TUTORIAL.md`: §1.1 "Say this in an interview", §1.13, §4 questions 1, 2 and 8, §5.2 questions 1 and 2, the "Explain to a skeptical staff engineer" prompt about the 15-step cap, and §7 self-check question 13, with every answer rewritten in our own words and pointed at lessons 1 to 3 of this module.
