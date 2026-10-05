# Failure Isolation and Evaluation

*Each agent needs its own limits and its own score, which multiplies the work of operating the system but keeps one failure from hiding in another.*

◷ 7 min

A multi-agent system promises that one agent's failure degrades the others rather than crashing them, and that a wrong answer can be traced to the agent that caused it. Neither promise holds by accident, so build the limits and the per-agent evaluation that [Handoffs and Permission Scope](04_Handoffs_and_Permission_Scope.md) assumed.

**Objectives:**

- name three failure-isolation mechanisms and the failure each prevents;
- decide in advance what a parallel run returns when one agent fails;
- evaluate each agent, each handoff, and the trajectory, not only the final answer.

---

## Give Each Agent Its Own Breaker and Budget

A failure limiter must be scoped per agent, not shared across the system. A circuit breaker is a switch that stops calls to a failing dependency for a while. If one shared breaker trips because the record system is down, it blocks the Answer agent too, though that agent never touches the record system.

So give each specialist its own pool, its own breaker, and its own budget. A breaker on the record system's connector should open for the Record agent and leave the Answer agent alone. This is the bulkhead pattern, which keeps compartments apart so one flood does not sink the ship, applied at the agent boundary.

## Cap the Hops Per Case

Two agents that can hand a case back and forth can loop forever: triage, escalate, triage, escalate. Cap the total hops per case. When the cap is hit, force a final outcome: answered, escalated, or failed safely.

This is the single agent's maximum-iteration guard, one level up. Halt and report; never let a run continue without limit. [Shared State, Routing, and Termination](03_Shared_State_Routing_and_Termination.md) adds the no-progress check that catches a loop before the cap.

## Route Around Unhealthy Specialists

If the record system is down, the Answer agent must still answer a pure knowledge question. One specialist's outage must not take down specialists that do not depend on it.

That only works if triage knows which specialists are healthy. A request that needs only healthy specialists proceeds. A request that needs an unhealthy one degrades to what can still be done, or escalates.

| Mechanism | What it prevents | The same idea elsewhere |
|---|---|---|
| A breaker and budget per agent | One outage becoming a platform outage | The bulkhead pattern |
| A hop cap with a forced outcome | Agents passing a case back and forth forever | The maximum-iteration guard and the step budget |
| Routing that knows agent health | Total failure on a partial outage | Graceful degradation |

## Decide Partial Failure Before It Happens

Ten agents run in parallel and one raises an error. What does the user get? The answer is whatever was decided in advance, and the real test is whether anyone decided at all. Without a decision, the default applies, and nine successes are lost to one failure.

There are two honest choices: abort the batch, or return partial results with the failure attached. For research tasks, partial results with an explicit note of the gap are usually right. Implement it by catching the error inside the agent's node and writing an error marker into state, so the merge step sees the gap.

## Score Each Agent, Not Only the Result

A wrong final answer can come from any agent. Did triage route correctly? Did the Record agent use the right operation and arguments? Did Escalation attach useful context? So evaluate each agent separately, with its own golden set: a fixed set of cases with known correct outcomes. Triage cases carry expected routes. Record cases carry expected operations and arguments. Escalation cases carry the expected queue and context fields.

Triage is a classifier, so measure it like one. Label a set of requests with the correct agent and score the supervisor's routing accuracy. The supervisor's logged `reasoning` field supplies the debugging data for free.

Then score the handoff itself. Did the receiver get everything it needed? Measure the fraction of handoffs where the receiver's first action was a lookup the package should already have contained.

| Level | What to measure |
|---|---|
| Per agent | Triage route accuracy, Record operation and argument correctness, Escalation context completeness, and Drafting tone and channel fit |
| Handoff | Completeness: the receiver re-derived nothing |
| End to end | Retrieval quality, answer groundedness and refusals, as for a single agent |
| Security | Leak rate of zero across every agent and every handoff, as a release gate |

## Evaluate the Trajectory as Well as the Outcome

Outcome evaluation asks whether the final answer was right. Trajectory evaluation asks whether the system took a sensible path. Did the supervisor route correctly? Did agents stay in role? How many hops did it take?

The interview tutorial argues trajectory matters more for multi-agent systems. A system that reaches the right answer through six wasted hops is one prompt change away from not reaching it.

Debugging uses the same view. Keep a trace keyed by run ID. For every hop, record which agent ran, why the supervisor chose it, what inputs the agent saw, and what it returned. Most bad multi-agent output comes from bad routing rather than bad agents, so find the first hop where the path diverged. When the same question gets different answers, check routing consistency before blaming the agents.

> **Warning: the leak gate does not soften between agents.** A restricted document forwarded by one agent to the wrong place is exactly as serious as one shown in the main answer. Score the leak rate across every agent's context, every record written, and every reply drafted, and keep it at zero as a gate.

## Worked Example: Trimming an Expensive System Without Hiding Failure

A multi-agent system is accurate, but each query costs too much. The fix starts with accounting, not cutting. Split the cost per run by agent and by hop. That shows whether the money goes on routing calls, agent calls, or retries.

The breakdown shows routing is a large share. Two agents only pass messages along. Collapse them, because they add calls and buy nothing. Route only the hard steps to the most expensive model. Cache prompt prefixes that repeat across calls. Pass summaries at each handoff instead of the full history.

Each cut ships with an evaluation number showing quality held. Run the same evaluation set before and after, and compare quality, cost, and latency. The tutorial notes that a single agent usually wins on two of those three, which is why every cut needs the number.

The method is the point. Per-hop accounting finds the cost, and per-agent evaluation proves the cut did not move the failure somewhere harder to see.

---

## Key Takeaways

- Scope each breaker and budget to one agent, so one outage stays its own.
- Cap hops per case and force a final outcome, so agents cannot pass a case back and forth forever.
- Make triage aware of agent health, so a knowledge question survives a ticketing outage.
- Decide in advance what a parallel run returns on partial failure; for research, partial results with the gap noted.
- Score each agent and each handoff with its own golden set, and keep the leak gate at zero across all of them.
- Evaluate the trajectory as well as the outcome, and trace every hop with the supervisor's reasoning.
- Trim cost by accounting per agent and per hop first, then prove each cut with an evaluation number.

## Check Yourself

1. **Why does a shared global circuit breaker fail a multi-agent system?**
   One specialist's outage trips a safeguard that then blocks unrelated specialists. A breaker scoped per agent keeps the record system's outage from stopping the Answer agent.

2. **How do you measure handoff correctness directly?**
   Count the fraction of handoffs where the receiving agent's first action was a lookup the package should already have contained, such as re-asking the user or re-running a finished retrieval.

3. **Why does trajectory evaluation matter more for multi-agent systems?**
   A right answer reached through wasted hops is fragile. Checking routing, role discipline, and hop count shows a system that is one prompt change from failing, even when the outcome looks correct.

## References

**Sources:** `03_Failure_Isolation_And_Evaluation.md` (FDE Handbook, Multi-Agent Systems): "Failure isolation", "Evaluating a multi-agent system", "The evaluation shape, extended", and "Interview lens". `07_multi_agent_systems_INTERVIEW_TUTORIAL.md`: §1.4 on partial failure, the §2 gotcha "One parallel agent fails and takes the whole run with it", §4 questions 4, 5, 9 and 10, §5.2 questions 2 and 4, and §5.3 questions 2, 3 and 5.
