# Control Placement

*A reasoning model can handle any request, but every decision it owns is paid for on every request and resists testing.*

Orchestration is not about which framework runs the agent. It is about where each "what happens next?" decision lives, so audit those decisions before choosing a topology in [Orchestration Topologies](/learn/agentic-systems/agentic-workflow-patterns/prompt-chaining-with-quality-gates).

**Objectives:**

- name the three places a control decision can live, and what each costs;
- apply the "one level down" test to every decision in a design;
- explain why the least autonomous option that works is the default.

---

## Treat Control as a Resource

Every step an agent takes follows a decision about what to do next. Someone or something makes that decision. It can be fixed code, a small classifier model, or the large reasoning model itself.

The three homes differ in price and in how far they can be trusted.

| Where the decision is made | What it costs per request | Can you test it? | Copes with the unexpected? |
|---|---|---|---|
| Fixed code (a hard-wired edge) | Nothing | Completely | No, only the cases someone foresaw |
| A small model (classifier or router) | Little | Yes, against a labelled set | Only inside the labels defined for it |
| The reasoning model | A full model call | Hardly | Yes |

The table is a ladder. Each rung up buys flexibility and pays for it in cost and predictability. A decision placed too high is paid for on every request, for as long as the system runs.

## Ask Whether Each Decision Could Live One Level Down

Teams tend to hand the reasoning model far more decisions than it needs. The reason is usually convenience, not necessity. A prompt that says "decide what to do" is quicker to write than a router and a workflow.

The fix is a habit. Walk through every decision in the design and ask: could this live one level down? A decision about which of four known request types arrived belongs in a small classifier. A decision about the fixed steps for a known request type belongs in code. Only the genuinely open-ended remainder needs the reasoning model.

## Pick the Least Autonomous Option That Works

The interview tutorial frames the same idea as a choice between a workflow and an agent. A workflow wires the control flow in advance: routing, prompt chaining, or an evaluator-optimizer loop. An agent lets the model decide what to do next.

A workflow cannot cope with cases outside its wired paths. In return it is predictable, cheap to trace and cheap to test. An agent handles open-ended tasks. In return its step count is unpredictable, its cost and latency are hard to bound, and it needs loop guards.

So escalate only when the model must decide *what to do next*, not merely fill in a template. Every piece of autonomy the task does not need is unpredictability bought for nothing. When the paths through the system are few and can be listed, a workflow wins.

**Say it like this:** "I pick the least autonomous shape that solves the problem. Routing and classification I pin to a workflow on purpose, because determinism there is cheap to buy and valuable to keep."

## Worked Example: An Ops Agent With Write Access

Picture an internal operations agent. About sixty engineers use it. It can write to a configuration service, and it receives requests such as "bump this timeout" or "roll back that flag".

Give everything to the reasoning model and each request costs a full model call. The behaviour on "bump the timeout on service X" also changes from run to run.

Audit the decisions instead. Which kind of request is this? That is a small classifier, tested against labelled examples. Which steps does a timeout change need? Fixed code, because the steps are known and ordered. What to do with a request that fits no known type? That residue goes to the reasoning model, inside a bounded loop.

The reasoning model now sees only the requests that need it. The common requests are cheap, testable and identical every time. That is control placement: spend the expensive, untestable decision-maker only where novelty requires it.

> **Warning: convenience compounds.** A decision left in the reasoning model "for now" is never revisited unless someone audits it. The cost recurs on every request, and the decision stays untested. Make the audit an explicit design step.

---

## Key Takeaways

- Every step follows a control decision that lives in code, a small model or the reasoning model, each with its own cost and testability.
- Push each decision as far down that ladder as it will go by asking whether it could live one level down.
- Prefer a workflow whenever the paths can be listed, and escalate to an agent only when the model must choose the next action.
- In a mixed system, the reasoning model should see only the residue that no cheaper decision-maker can handle.

## Check Yourself

1. **Name the three places a control decision can live, and the main weakness of each.**
   Fixed code cannot handle anything unforeseen. A small model only handles the labels it was trained on. The reasoning model costs a full call per decision and resists testing.

2. **An interviewer asks, "What did you make deterministic on purpose, and why?" What is a strong answer?**
   Routing and classification steps, pinned to a workflow rather than left to the model. Determinism there is cheap and keeps behaviour testable.

3. **When is a full tool-calling agent justified over a workflow?**
   When the model genuinely has to decide what to do next, because the set of paths cannot be listed in advance.

