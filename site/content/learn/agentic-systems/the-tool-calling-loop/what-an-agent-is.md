# What an Agent Is

*An agent is easy to build and hard to trust, because the same loop that lets it act also lets it act wrongly.*

An agent is not a framework, a model or a clever prompt; it is a loop with a stopping rule. Learn the three parts of that loop here, then build it line by line in [The Tool-Calling Loop From Scratch](/learn/agentic-systems/the-tool-calling-loop/the-tool-calling-loop-from-scratch).

**Objectives:**

- name the three components of an agent and draw the think, act and observe loop;
- explain why a one-step decision function produces multi-step behaviour;
- say why the hard part of an agent is trust, not tool selection;
- decide when a fixed workflow beats an agent.

---

## Separate Answering From Acting

Retrieval-augmented generation answers questions. An agent takes actions. That difference sets the stakes for everything else. A wrong answer is a bad answer. A wrong action refunds the wrong customer, closes the wrong ticket or sends the wrong email.

The word "agent" is used loosely enough to mean almost anything. So be precise. Strip away the framework vocabulary and an agent is a loop:

```
query ─▶ [ THINK: brain picks a tool or finishes ]
             │ tool call
             ▼
        [ ACT: execute the tool ]
             │ result
             ▼
        [ OBSERVE: add the result to what the brain knows ] ─▶ back to THINK
                                                              (until a final answer, or a guard stops it)
```

This is the ReAct pattern, short for Reason and Act. The model reasons about what to do, calls a tool, sees the result and reasons again. It is the default loop underneath almost every agent, and the one to reach for before anything fancier.

**Say it like this:** "An agent is a loop: a brain picks a tool or finishes, the loop runs the tool and feeds the result back, under a step budget."

## Name the Three Components

The loop has exactly three parts.

| Component | What it is | What it decides |
|---|---|---|
| Tools | The atomic things the agent can do | Nothing; they run when called |
| Brain | A decision function given the query and every observation so far | Call a tool, or finish |
| Loop | The runner that executes what the brain asks for and feeds the result back | When to stop: a final answer, or a guard |

In production the brain is a large language model. Nothing in the definition requires that, though. The Handbook's companion project ships a deterministic, rule-based brain that runs with no API key. An LLM makes the brain's decisions harder to predict, not different in kind.

## Declare What Each Tool Can Break

A tool is a name, a description, a function and one flag:

```python
@dataclass
class Tool:
    name: str            # unique id the agent references
    description: str     # what the model reads to pick a tool
    func: Callable       # the actual implementation
    destructive: bool = False   # True -> requires confirmation before running
```

The fourth field is the first safety decision in any agent. It is made when the tool is registered, not when it is called. `search_tickets` reads. `close_ticket` writes irreversibly. The tool declares which it is, and the loop treats the two differently from then on.

Tools live in a registry, a lookup from name to tool. Its `specs()` view lists each tool's name, description and destructive flag. That view *is* the tool-calling interface. "The model chooses a tool" means the model was shown this list and emitted one name plus arguments. So the description is prompt engineering: it is the only thing the brain has to go on.

The companion project's registry holds four tools over an in-memory ticket store.

| Tool | Does | Destructive |
|---|---|---|
| `search_tickets` | Find open tickets matching a query string | No |
| `get_ticket` | Fetch one ticket by id | No |
| `create_ticket` | Create a new ticket | No |
| `close_ticket` | Close (resolve) a ticket | **Yes** |

The store also defines two failure types. A `TransientError` is a temporary failure, such as a network blip or a 503, and is safe to retry. A `NotFoundError` is a permanent "no such record" and must not be retried. A tool's failures are part of its contract. [Typed Tool Results and Teachable Errors](/learn/agentic-systems/tool-design-mcp-a2a/typed-tool-results-and-teachable-errors) builds on that distinction.

## Let One-Step Decisions Produce Multi-Step Plans

The brain has one method and one contract. It receives the query and every observation so far. It returns a `Decision`, which is either a tool call or a final answer.

```python
Observation = Tuple[str, Any]     # (tool_name, result) — one past tool result

def decide(self, query: str, observations: List[Observation]) -> Decision: ...
```

Because the brain sees every observation, it reacts to what has happened. Asked to "close the ticket about login", it first decides `search_tickets(query="login")`. On the next call, now holding the search result, it decides `close_ticket` on the ticket it found. Nobody wrote a two-step plan. The plan emerged from a single-step function called repeatedly. That is the whole trick of ReAct.

The project's `RuleBasedBrain` makes these decisions with regular expressions. Its LLM version keeps the same `decide()` contract but asks a model to emit `{"tool": ..., "args": ...}` or `{"final": ...}` as JSON. The loop does not change. Swapping the brain is the only difference between the offline demo and a real agent.

## Treat the Guard as Part of the Definition

The loop's `while` condition is not a detail:

```
while iterations < max_iterations:          # ← guard
    decision = brain.decide(query, observations)
    if decision.is_final:
        return decision.final
    result = execute_tool(decision.tool, decision.args)
    observations.append((decision.tool, result))
    iterations += 1
return "Stopped: hit the max-iteration guard."
```

An LLM brain can decide to call a tool forever. The tool may keep failing, the answer may be unreachable, or the prompt may be adversarial. A loop without a bound is not an agent; it is an unbounded process spending a budget. So the max-iteration guard belongs in the definition, not in a later hardening pass. [Loop Guards and Termination](/learn/agentic-systems/the-tool-calling-loop/loop-guards-and-termination) covers the other budgets.

## Locate the Hard Part: Trust

Getting a model to pick the right tool is not the hard part. Those mechanics were solved years ago. The hard part is trust.

An agent is a button that can refund real money, send a real email or close a real ticket. Every later design question reduces to one: how does someone trust that the agent will only do what they meant, even when the brain is wrong, the network retries a request or the server crashes mid-run? A model cannot be the safety mechanism for its own mistakes. That is why the `destructive` flag sits on the tool, why execution has a confirmation gate, and why the production lessons spend more time on idempotency and staged rollout than on prompting. It is a systems and safety problem wearing an AI costume.

## Choose the Least Autonomous Shape That Works

Not every task needs an agent. Below an agent on the autonomy spectrum sit fixed workflows. Routing is one model call that classifies and dispatches. Prompt chaining is a fixed sequence of calls with checks between them. Evaluator-optimizer pairs a generator with a grader that triggers regeneration.

| Option | Costs | Buys | Pick when |
|---|---|---|---|
| Workflow | Cannot handle cases outside the wired paths | Predictable, cheap to trace and test | The set of paths is small and known |
| Agent | Unpredictable step count, harder to bound cost and latency, needs guards | Handles open-ended tasks a workflow cannot anticipate | The model must decide *what to do next*, not fill a template |

Every bit of autonomy that is not needed is unpredictability bought for nothing. Escalate to a tool-calling loop only when the next step genuinely depends on what the last tool returned. [Control Placement](/learn/agentic-systems/context-engineering/control-placement) extends this into a habit for every decision in a system.

> **Warning: a chain is not an agent.** A fixed sequence of model calls, however long, has no brain choosing the next step. Calling it an agent in an interview signals that the mechanism was never understood. Name the loop, the brain's choice and the guard, or call it a workflow.

## Worked Example: Closing a Login Ticket

A support lead types "close the ticket about login". Follow the three components.

The registry offers four tools; the brain sees their specs. On its first decision it has no observations, so it calls `search_tickets` with "login". The loop runs the tool and records the result: one open ticket, "Login page 500 error". On its second decision the brain sees that result and asks for `close_ticket` on that ticket. The tool is destructive, so the loop does not simply run it; a confirmation policy decides first. On its third decision the brain sees the closed ticket and returns a final answer.

Three decisions, one loop and one destructive flag produced a two-step plan nobody wrote down. The same structure, given a model that misreads the search result, would close the wrong ticket. That is why the guard and the gate are part of the design from the first line.

---

## Key Takeaways

- An agent acts rather than answers, so its mistakes cost more than a wrong answer.
- Three components, tools, a brain and a loop, define every agent.
- A tool declares whether it is destructive at registration, and its description is the only thing the brain reads.
- A one-step decision function, called repeatedly with every observation, produces multi-step plans.
- The max-iteration guard is part of what makes the loop an agent rather than an unbounded process.
- The hard part of agents is trust: containing what happens when the brain is wrong.
- Pick a fixed workflow whenever the paths are enumerable; use an agent only when the next step depends on the last result.

## Check Yourself

1. **Why is `destructive` a field on `Tool` rather than a check the brain performs?**
   The brain is the part that may be wrong. Declaring the flag at registration lets the loop treat writes differently whatever the brain decides.

2. **Why does a single-step `decide()` function produce multi-step behaviour?**
   It receives every observation so far, so each call reacts to the results of the previous ones. Search, then close, emerges without a written plan.

3. **Finish the sentence: "The hard part of agents is not the loop, it is ___."**
   Trust: making sure the agent does only what was meant, even when the brain is wrong, a request is retried or the server crashes.

