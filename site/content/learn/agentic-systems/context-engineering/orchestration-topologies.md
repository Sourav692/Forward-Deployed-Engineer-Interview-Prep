# Orchestration Topologies

*Each topology is cheap for the cases it fits and expensive for the rest, so real systems compose several and watch how traffic moves between them.*

◷ 5 min

No single orchestration shape fits a whole production system. Learn the six shapes, then compose them, placing each decision as [Control Placement](/learn/agentic-systems/context-engineering/control-placement) describes.

**Objectives:**

- choose among six orchestration topologies by when each fits, its latency and its main risk;
- describe a composed production shape and why it escalates only once;
- explain router drift and how to make it visible.

---

## Learn the Six Shapes

Six repeatable shapes describe how a system settles "what happens next".

| Topology | Fits when | Latency | Main risk |
|---|---|---|---|
| Sequential | The steps are known and must run in order | The sum of the steps, predictable | Rigid, with no way to recover |
| Router | The intents can be listed and do not overlap | One extra small call | A silent misroute that lowers quality |
| Parallel fan-out | The subtasks are truly independent | The slowest branch | Merge conflicts, and cost multiplies |
| Bounded loop | The next step depends on the last observation | Variable, so it needs limits | Oscillation and cycles that make no progress |
| Hierarchical | Specialities, tools or data scopes really differ | Overhead on every delegation | Coordination costs more than it saves |
| Event-driven | Work arrives asynchronously over long periods | Detached from the request | Ordering, duplicates and poison messages |

The bounded loop is the tool-calling agent loop. The hierarchical shape is where multi-agent systems begin; the multi-agent module covers supervisors, swarms and blackboards in depth.

## Know the Workflow Patterns by Their Other Names

The interview tutorial names the deterministic end of this space differently. **Routing** is one model call whose only job is to classify and dispatch. **Prompt chaining** is a fixed sequence of model calls with a validation gate between steps. **Evaluator-optimizer** pairs a generator with a separate evaluator. The evaluator grades the output against a rubric and sends feedback back until it passes or a round cap is hit.

The two sources use different vocabularies for overlapping ideas. Routing matches the router topology. Prompt chaining is a sequential topology with gates. Evaluator-optimizer is a small bounded loop with a grading step. Say which vocabulary you are using in an interview.

## Fan Out When the Worker Count Is Decided at Runtime

Some parallel work has a count nobody knows until the run starts. A planner might decide a report needs five sections, or nine. A fixed set of parallel branches cannot express that.

The orchestrator-worker pattern handles it. An orchestrator emits one unit of work per item the planner chose. LangGraph's `Send` is one way to express this. The units run in parallel. A reducer on shared state merges their outputs when they finish.

Fan-out raises a question that must have an answer before launch. One worker of ten fails: what happens? A partial result with a clear "1 of 10 failed" signal is defensible. So is aborting the whole job. Having no answer is not. The reducer must also tolerate a missing entry.

## Compose the Shapes Instead of Picking One

A realistic production system strings several shapes together. An event consumer receives the work. A router classifies it. Most classes run a fixed sequential workflow. The ambiguous remainder enters a bounded loop. Inside one loop step, independent lookups fan out in parallel.

A composed pattern adds one safety rule. A small router checks confidence and complexity. Confident, simple requests run the matching workflow. If that workflow fails structurally, it escalates to the bounded loop exactly once. The limit matters: a broken workflow must not quietly double the spend on every request.

**Say it like this:** "I'd compose these rather than pick one: route, run known classes as workflows, and send only the residue to a bounded loop."

## Measure Traffic Share, Not Just Correctness

A router can stay accurate on its test set while the traffic it sees changes. More and more requests then slide into the expensive loop. Nothing breaks, so nothing alerts. This router drift is the most common silent quality regression in production agents.

A log line cannot show a trend. Record every routing decision as a metric dimension, so traffic share per path becomes a time series. Watch that share continuously, not once at launch.

## Worked Example: The Ops Agent's Request Path

Return to the operations agent that edits configuration. A request arrives as an event. A small router labels it "timeout change". The timeout workflow runs its fixed steps and succeeds.

A second request is ambiguous: "something's off with the payment flags". The router has low confidence, so it goes to the bounded loop. In one step, the loop needs three independent lookups, so it fans them out and waits for the slowest.

A month later, the dashboard shows the loop's share of traffic has doubled. No test failed. The router's labels no longer cover a new kind of request, and the metric is the only thing that noticed.

> **Warning: an unbounded escalation path doubles spend silently.** If a failed workflow can fall into the loop without limit, every structural failure costs a workflow run plus a loop run. Escalate once, and count it.

---

## Key Takeaways

- Six shapes, sequential, router, parallel fan-out, bounded loop, hierarchical and event-driven, each fit one kind of work and carry one main risk.
- Routing, prompt chaining and evaluator-optimizer are the tutorial's names for the deterministic end of the same space.
- Use orchestrator-worker fan-out when the worker count comes from a runtime decision, and decide up front what a partial failure returns.
- Production systems compose shapes, and a failed workflow escalates to the loop only once.
- Record routing decisions as a metric dimension so router drift shows up as a trend.

## Check Yourself

1. **Which topology fits "the next step depends on what the last tool returned", and what is its main risk?**
   The bounded loop. Its risk is oscillation or cycling without progress, so it needs limits.

2. **One worker in a parallel fan-out of ten fails. What must the design say?**
   Whether the run returns partial results with a clear failure count or aborts entirely. Either is defensible; having no answer is not.

3. **Why is router drift invisible without a metric?**
   Every request still gets an answer, so nothing errors. Only the share of traffic reaching the expensive loop changes, and that only shows as a time series.

## References

**Sources:** `ch06_orchestration_context_engineering.md` (*Cracking Agentic AI System Design Interviews*, Ch. 6: "Six Orchestration Topologies" and its composed-orchestrator deep dive, summarised in our own words). `agent_fundamentals_and_advanced_agentic_systems_INTERVIEW_TUTORIAL.md`: §1.12 "Orchestrator-worker with dynamic fan-out", §1.13 "Workflow patterns", §4 question 7 (answer rewritten in our own words) and §7 question 7.
