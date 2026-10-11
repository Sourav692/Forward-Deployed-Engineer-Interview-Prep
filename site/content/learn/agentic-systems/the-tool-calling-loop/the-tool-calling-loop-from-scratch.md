# The Tool-Calling Loop From Scratch

*A framework builds an agent in ten lines, but only the hand-written loop shows what those lines hide when the agent misbehaves.*

Ten framework lines build an agent, and none of them explain a failure in a design review. Write the ReAct loop in plain Python here, with every moving part explicit, after reading [What an Agent Is](/learn/agentic-systems/the-tool-calling-loop/what-an-agent-is) for the three components.

**Objectives:**

- write `Agent.run` from memory, including all three of its endings;
- say what the `Session` holds and why each field lives there rather than on the agent;
- trace a two-step run through the loop, with and without approval;
- explain why retries, caching and logging live outside the loop.

---

## Keep Turn State Separate From Run State

Two small dataclasses come before the loop. The first holds state that must survive across *turns* of a conversation, not just across iterations of one run. Most tutorials forget it.

```python
@dataclass
class Session:
    """State that persists ACROSS turns of a conversation."""
    history: List[Tuple[str, str]] = field(default_factory=list)   # (query, answer) pairs — memory
    memo: dict = field(default_factory=dict)                       # cache of tool results
    logger: ToolCallLogger = field(default_factory=ToolCallLogger) # the observability trace
```

History gives the brain context for follow-ups such as "close *that* one". The memo is shared across turns, so a repeated `search_tickets("billing")` in turn 3 is free if turn 1 already ran it. The logger records every tool call for the whole conversation. [Why Agents Need State](/learn/agentic-systems/memory-and-state/why-agents-need-state) shows where this object lives in production.

The second dataclass is what one run returns:

```python
@dataclass
class RunResult:
    answer: str
    iterations: int
    observations: List[Observation]
    blocked_on: Optional[Tuple[str, dict]] = None   # set if paused for confirmation
```

`blocked_on` is the first hint that a run has three endings, not two. It can finish. It can hit the guard. Or it can **pause** because a destructive tool needs a human's approval. That third ending is what makes the loop safe to point at a real system.

## Make Denial the Default

```python
class Agent:
    def __init__(self, registry, brain=None, *, max_iterations=6, confirm=deny_destructive):
        self.registry = registry
        self.brain = brain or RuleBasedBrain()
        self.max_iterations = max_iterations     # the loop guard — never run forever
        self.confirm = confirm                   # the confirmation policy for destructive tools
```

Two constructor arguments carry the safety posture. `max_iterations` bounds the loop. `confirm` is a policy: a function from a tool and its arguments to yes or no. Its default, `deny_destructive`, returns `False` every time. Out of the box, this agent cannot close a ticket. A caller must hand it a policy that says otherwise. An agent cannot misuse a permission it was never given. Defend that default in a review; it is a design choice, not an accident.

## Write the Loop in Seven Steps

```python
def run(self, query: str, session: Optional[Session] = None) -> RunResult:
    session = session or Session()
    observations: List[Observation] = []
    iterations = 0

    while iterations < self.max_iterations:                          # ① MAX-ITERATION GUARD
        decision: Decision = self.brain.decide(query, observations)  # ② THINK

        if decision.is_final:                                        # ③a the brain is done
            session.history.append((query, decision.final))
            return RunResult(decision.final, iterations, observations)

        tool = self.registry.get(decision.tool)                      # ③b the brain chose a tool
        try:
            result = execute_tool(                                   # ④ ACT — safely
                tool, decision.args,
                logger=session.logger,
                memo=session.memo,
                confirm=self.confirm,
            )
        except ConfirmationRequired as e:                            # ⑤ PAUSE for a human
            msg = f"Awaiting confirmation to run '{e.tool}' with {e.call_args}."
            return RunResult(msg, iterations, observations, blocked_on=(e.tool, e.call_args))

        observations.append((decision.tool, result))                 # ⑥ OBSERVE
        iterations += 1

    return RunResult("Stopped: hit the max-iteration guard.", iterations, observations)   # ⑦
```

| Step | Line | What it guarantees |
|---|---|---|
| ① | `while iterations < max_iterations` | The run terminates; the body executes at most six times, whatever the brain does |
| ② | `brain.decide(query, observations)` | The brain sees everything observed so far, which is how one-step decisions plan multi-step work |
| ③a | `decision.is_final` | The normal exit; the answer goes into session history so the next turn has context |
| ③b | `registry.get(decision.tool)` | The registry resolves the name; an unknown tool fails here, not deep inside execution |
| ④ | `execute_tool(...)` | The tool runs behind the safety layer: confirmation gate, memo cache and retry |
| ⑤ | `except ConfirmationRequired` | A destructive tool was refused; the run pauses and hands back exactly what was about to happen |
| ⑥ | `observations.append(...)` | The result becomes part of what the brain sees next |
| ⑦ | fall-through | The guard exit, which says so plainly rather than pretending to have an answer |

Step ⑤ deserves a second look. The run does not fail, and it does not proceed. It returns control to the caller with the tool and arguments it wanted to run. A UI, a Slack bot or a test now knows precisely what to ask the human.

## Keep Robustness Out of the Loop

Look at what the loop does not contain: no retry logic, no cache lookup, no logging calls. Those live inside `execute_tool`. The loop is the orchestration; robustness is a layer it calls.

Keeping them apart pays off twice. The loop stays short enough to read and test. And the same `execute_tool` can be reused unchanged when the loop is rebuilt in a framework such as LangGraph. A loop that hard-codes its retries has to be rewritten for every new orchestrator. The robust agents lessons open that layer up.

## Swap the Brain Behind One Contract

The loop never inspects how the brain decides. It calls `decide(query, observations)` and reads the `Decision`. The companion project ships two brains behind that contract.

`RuleBasedBrain` is a deterministic router. It classifies the query with regular expressions into an intent: `close_by_topic`, `lookup`, `search` or `create`. It then uses `len(observations)` to know which step of its plan it is on:

```python
if intent == "close_by_topic":
    if n == 0:  return Decision(tool="search_tickets", args={"query": arg})     # step 1: find it
    if n == 1:                                                                  # step 2: close first hit
        hits = observations[0][1]
        if not hits: return Decision(final=f"No open ticket found about '{arg}'.")
        return Decision(tool="close_ticket", args={"ticket_id": hits[0]["id"]})
    closed = observations[1][1]                                                 # step 3: report
    return Decision(final=f"Closed {closed['id']} — '{closed['subject']}'.")
```

It exists so the loop can be studied and tested with no API key and no randomness.

`make_llm_brain()` is the real thing. A system prompt asks the model for the single next action as JSON, either a tool name with arguments or a final answer. The observations are rendered into the prompt as `OBSERVATION` lines. The reply is parsed into a `Decision`. Same contract; the `Agent` class is untouched. The brain is replaceable; the loop and its guards are not.

## Worked Example: One Query, Two Policies

Run "close the ticket about login" with the `always_approve` policy.

```
iteration 0   brain.decide("close the ticket about login", [])
              → Decision(tool="search_tickets", args={"query": "login"})
              execute_tool → [{"id": "TKT-3", "subject": "Login page 500 error", ...}]
              observations = [("search_tickets", [...])]        (TKT-1 says "log in", two words — no match)

iteration 1   brain.decide(query, observations)          ← sees the search result
              → Decision(tool="close_ticket", args={"ticket_id": "TKT-3"})
              execute_tool → destructive → confirm(tool, args) → True → runs
              → {"id": "TKT-3", "status": "closed", ...}
              observations = [("search_tickets", [...]), ("close_ticket", {...})]

iteration 2   brain.decide(query, observations)          ← sees both results
              → Decision(final="Closed TKT-3 — 'Login page 500 error'.")
              return RunResult(answer=..., iterations=2, ...)
```

The test `test_multi_step_search_then_close` asserts exactly this: "Closed TKT-3" appears in the answer and `iterations == 2`.

Now run the same query with the default `deny_destructive`. Iteration 1 ends differently. `execute_tool` raises `ConfirmationRequired`, and `run()` returns with `blocked_on` set to `("close_ticket", {"ticket_id": "TKT-3"})`. The ticket stays open. The test `test_confirmation_blocks_destructive` covers it.

The loop code was identical in both runs. Only the policy changed, and it alone decided whether a real ticket closed. That is the point of putting the safety posture in constructor arguments rather than in the brain.

> **Warning: one unguarded exit undoes the rest.** A run has three endings: final answer, guard, and pause. Code that handles only the first treats a paused run as finished and a guard stop as an answer. Check `blocked_on` and the iteration count on every `RunResult` before showing anything to a user.

The companion project's 12 tests cover the loop, the guard, the gate, the memo, retry, fallback and disambiguation, and they all pass with no API key.

---

## Key Takeaways

- `Session` carries history, memo and logger across turns; `RunResult` reports one run, including whether it paused.
- The agent denies every destructive tool by default, so permission must be granted by policy.
- The loop has seven steps and three exits: a final answer, the guard, and a pause for confirmation.
- Retries, caching and logging live in `execute_tool`, which keeps the loop small and reusable.
- The brain sits behind a one-method contract, so a rule-based router and a model are interchangeable.

## Check Yourself

1. **What happens, step by step, when the brain requests `close_ticket` under the default policy?**
   The registry resolves the tool, `execute_tool` sees it is destructive and asks `deny_destructive`, which says no. It raises `ConfirmationRequired`, and `run()` returns a `RunResult` with `blocked_on` set to the tool and its arguments. The ticket stays open.

2. **Why does robustness live in `execute_tool` rather than in the loop?**
   The loop is orchestration. Keeping retry, cache and logging in a layer it calls keeps the loop testable and lets a framework version reuse that layer unchanged.

3. **How does `RuleBasedBrain` know which step of a multi-step plan it is on?**
   It counts the observations so far: none means search, one means close the first hit, two means report.

