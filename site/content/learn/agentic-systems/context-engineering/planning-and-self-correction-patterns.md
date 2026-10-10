# Planning and Self-Correction Patterns

*Planning ahead saves model calls and checking every step catches failures, but each extra structure costs latency and only pays off for the right kind of task.*

◷ 5 min

ReAct is the default loop, not the only one. Add a plan, a verifier or a critique step only when the task's shape asks for it, and keep the loop guards from [Control Placement](/learn/agentic-systems/context-engineering/control-placement) in every variant.

**Objectives:**

- choose between ReAct and plan-and-execute for a given task;
- explain what a verifier step catches that a plain planner and executor miss;
- tell Reflection from Reflexion and say when each is worth building.

---

## Plan First When the Steps Are Knowable

ReAct decides one step at a time. Each step is a model call, so cost and latency grow with the number of steps. In return, it adapts to every surprising tool result.

Plan-and-execute writes the whole multi-step plan first. An executor then runs the steps one by one. A router checks after each step: is the plan finished, are steps left, or does it need a replan?

The trade is one planning call plus one call per step, instead of a full reasoning call per step. That is cheaper and more predictable when the task has a known shape. But a plan written before running anything cannot survive contact with a result that contradicts it. So the replanning path is not optional. It regenerates the remaining plan, not the whole thing.

**Say it like this:** "If I can sketch the steps on a whiteboard before running anything, I plan first. If the next step depends on what the last tool returned, ReAct."

## Add a Verifier When Silent Failure Is Unacceptable

A plain planner and executor trusts every tool result. A tool error message is just a string, and nothing marks it as different from data. So errors flow straight into the final answer.

The Planner, Executor, Verifier pattern (PEV) adds a verifier after every execution step. Its only job is to judge whether the last result is usable. It does not move the task forward. On success, execution continues. On failure, the remaining plan is cleared, and the planner runs again with the failure attached. The new plan is then informed, not blind.

A retry counter caps the number of replans, so the loop ends even when the tool keeps failing.

| Option | Costs | Buys | Pick when |
|---|---|---|---|
| Planner and executor only | Bad tool output flows into the answer unnoticed | Fewer calls, lower cost and latency | Tools are reliable and a wrong answer is cheap to catch later |
| PEV, with a verifier | One extra model call per step | Detects and recovers from tool failures | Tools are flaky, or a confident wrong answer is expensive |

## Worked Example: The Flaky Search Tool

The source notebook runs both patterns against a deliberately flaky web-search tool. The tool returns "Error: Could not retrieve data. The API endpoint is currently unavailable."

The plain planner and executor treats that string as data. It goes on to state that Apple's research spend per employee is approximately $186,969, using an *estimated* employee count. The answer reads confidently and is wrong.

The PEV agent's verifier reads the same string and classifies it as a failure. The planner replans with a different query and recovers. An LLM-as-judge then scores both runs. The PEV agent wins on `error_handling_score`, even where its `task_completion_score` is similar.

The lesson is that the verifier's extra call is the price of noticing. It converts "confidently returned garbage" into "noticed, tried another way, and said when it gave up".

> **Warning: check the guard's boundary.** The same notebook guards replans with `if retries > 3`. That allows four planning passes, for retries 0 to 3, not three. Decide whether "max three retries" includes the first attempt, then write the comparison to match.

## Critique Within a Task, or Carry Lessons Across Tasks

Reflection is a generate, critique and revise loop. A draft is produced. A critique step, often the same model with a critique-focused prompt, scores it and lists concrete problems. The loop revises until a quality bar is met or an iteration cap is hit.

Reflexion goes one step further. It keeps the critique as a lesson and carries it into the agent's *next* similar task, instead of discarding it. The source's structured version records what was missing, what was unnecessary, and follow-up search queries. Those fields make the critique actionable rather than vague.

| Option | Costs | Buys | Pick when |
|---|---|---|---|
| Reflection | The critique is lost after the task | Simple and self-contained | One-shot generation |
| Reflexion | Needs somewhere to keep lessons across tasks | Improvement compounds over a stream of tasks | One agent handles many similar tasks |

Reflexion is Reflection plus long-term memory. Without a stream of related tasks, the stored lessons have nothing to apply to.

---

## Key Takeaways

- Plan-and-execute trades ReAct's call per step for one plan and cheaper execution, and needs a replanning path to survive surprises.
- A verifier after every step catches tool errors that a plain planner and executor would turn into confident wrong answers.
- Cap replans with a counter, and check whether the boundary condition allows one more pass than intended.
- Reflection critiques within one task; Reflexion keeps the critique as a lesson for later tasks, so it needs memory.

## Check Yourself

1. **A task decomposes into a known sequence of five steps. ReAct or plan-and-execute?**
   Plan-and-execute, with a replanning path, because the shape is known and planning first uses fewer calls.

2. **What does a verifier in PEV actually check?**
   Whether the last tool result is valid data rather than an error. It says nothing about task progress.

3. **When is Reflexion worth building over plain Reflection?**
   Only when the same agent handles a stream of similar tasks, so persisted lessons have something to apply to.

