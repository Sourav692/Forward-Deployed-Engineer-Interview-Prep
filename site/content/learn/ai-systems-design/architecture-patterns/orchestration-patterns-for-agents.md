# Orchestration Patterns for Agents

*Fixed control flow is cheap and predictable, while model-driven control flow adapts at the price of variable cost and harder failures.*

Naming a pattern is not the senior signal; naming it together with the number that proves it is working is. Learn the eight orchestration patterns as answers to a shape of work, each paired with one measurement, before the context, tool and reliability patterns in the lessons that follow.

**Objectives:**

- explain why a named pattern plus its measurement beats a description;
- choose among router, bounded loop, plan-then-execute, reflection, supervisor, pipeline, blackboard and event-driven designs;
- state the cost and the deciding metric of each.

---

## Name the Pattern and Its Measurement

A pattern that has no name gets rediscovered slowly, under time pressure, on a whiteboard. A name does three jobs at once. It compresses a paragraph into two words. It shows the problem has been met before. And it hands the interviewer a hook to probe, which turns a monologue into a design conversation.

The book this lesson draws on separates two levels. Naming a pattern reads as mid-level. Naming it with the measurement that justifies it reads as senior, because it treats architecture as a claim that data could refute rather than a matter of taste. Every pattern in this lesson and the next three carries such a measurement for that reason.

## Pick the Orchestration Shape First

Orchestration patterns decide the shape of decision-making. That choice comes first because it fixes the latency ceiling, the token profile and how far a failure can spread.

When the intents are few, known in advance and do not overlap, a router is enough. A small model picks one of n branches. It is cheap and predictable, but a wrong route fails silently, so watch the route distribution and how often a shadow model would have routed differently.

When each step depends on what the last one observed, use a bounded loop. The loop adapts, but its cost varies, so it needs four independent limits. Track how often runs end by hitting a budget, and the 95th-percentile step count.

When the subtasks are independent and known up front, plan then execute. The agent plans once and fans the work out in parallel. The catch is that it commits to the plan before seeing any evidence. Measure how often it has to replan and how often plans are valid.

## Add Critique, Delegation, and Stages When the Work Demands Them

Reflection fits when a second pass can see something the first could not. A critic with an information advantage revises a draft. Output improves at roughly twice the tokens, so track how often revisions are accepted and how often critics agree.

A supervisor fits when the work splits into distinct specialities. One coordinator delegates and then synthesises. The trace forms a tree and the run ends by construction. Measure coverage and the spend per worker.

A pipeline fits when the process already has named stages. The sequence is fixed and a stage may send work back a bounded number of times. Latency is predictable and each stage can be tested alone. Watch the pass rate per stage and the rate of sends back.

## Decouple When Order or Timing Is Unknown

Two patterns handle work whose order or timing cannot be fixed. A blackboard suits contributions that can arrive in any order: agents read and write a shared state. It decouples the agents but demands strict concurrency discipline, so the number to watch is the write-conflict rate.

An event-driven design suits work that arrives asynchronously over long horizons. It frees the work from the lifetime of a single request. Watch queue lag and the duplicate rate.

| If the work looks like this | Reach for | The number that says it is working |
|---|---|---|
| A handful of separate intents | Router | Route mix; shadow-model disagreement |
| Each step needs the last result | Bounded loop | Share of runs stopped by a budget; p95 steps |
| Independent subtasks, known up front | Plan then execute | Replan rate; plan validity |
| A draft a better-informed critic can fix | Reflection | Accepted revisions; critic agreement |
| Distinct specialities | Supervisor | Coverage; spend per worker |
| A process with named stages | Pipeline | Pass rate per stage; send-back rate |
| Contributions in unknown order | Blackboard | Write-conflict rate |
| Long-running, asynchronous arrivals | Event driven | Queue lag; duplicates |

> **Warning: a router fails quietly.** A misrouted request still gets an answer, just from the wrong branch, so nothing errors. Without a route-mix dashboard and a shadow comparison, misrouting is invisible until users complain.

## Worked Example: Routing Versus Looping an Ops Agent

An ops agent receives two kinds of request. "Restart the cache in staging" is one of a few known intents. A router sends it to a fixed branch in one cheap call, and the route mix shows whether restarts are drifting into the wrong branch.

"Find out why checkout latency doubled" is different. The next query depends on what the last log search showed. That calls for a bounded loop with limits, and its health shows in how often runs end by exhausting a budget.

The two requests justify two patterns, each with a number to watch. Saying "router for the known intents, bounded loop for investigations, and I'd watch the shadow disagreement and budget-termination rates" is the senior version of the same design.

---

## Key Takeaways

- Name a pattern together with the measurement that would show it earning its place.
- Router, bounded loop and plan-then-execute trade predictability against adaptivity.
- Reflection, supervisor and pipeline add critique, delegation or fixed stages, each with a cost.
- Blackboard and event-driven designs decouple work whose order or timing is unknown.

## Check Yourself

<details>
<summary>1. What turns naming a pattern from a mid-level into a senior signal?</summary>

Pairing it with the measurement that justifies it, which treats the architecture as a claim that data could refute.

</details>

<details>
<summary>2. When does plan-then-execute go wrong?</summary>

It commits to the plan before seeing evidence. If early results change the picture, the replan rate rises.

</details>

<details>
<summary>3. What does reflection cost, and what shows it is worth it?</summary>

About twice the tokens. The revision acceptance rate and critic agreement show whether the critic adds value.

</details>

