# The Confirmation Gate and Memoization

*A cache saves time and money on repeated calls, but a cache that answers before the safety check can quietly approve an action nobody approved.*

◷ 9 min

A tool call is not a black box the loop can trust; it is where a toy loop becomes a real agent. Put the confirmation gate in front of everything else, then add a memo behind it, and read [Retries and Fallbacks](02_Retries_and_Fallbacks.md) for what happens when the call itself fails.

**Objectives:**

- name the four mechanisms inside a safe tool executor and the incident each prevents;
- explain the three properties that make a confirmation gate reliable;
- say why the gate must run before the cache, and what goes wrong if the order flips.

---

## Open the Tool Executor

A simple agent loop calls `execute_tool(...)` and moves on. In production that one call hides four mechanisms. Each exists because agents fail in a specific way.

| Mechanism | The incident it prevents |
|---|---|
| **Confirmation gate** | A refund, delete or send fired because the model was "pretty sure" |
| **Memoization** | The same read re-run, re-billed and re-waited-for every time the agent asks again |
| **Retry** | One network blip turning into a failed run |
| **Fallback** | One permanently dead dependency turning into a full outage instead of a degraded answer |

The Handbook's companion executor is under 130 lines. Every line is a decision. This lesson covers the first two mechanisms; the next lesson covers the other two.

## Ask the Questions in a Fixed Order

The executor reads as three questions asked of every call, in this order:

```python
def execute_tool(tool, args, *, logger, memo=None, confirm=None, retries=3):
    """Run a tool safely: confirmation gate -> cache -> retry."""
    if tool.destructive:                          # 1) is it destructive, and approved?
        approved = confirm(tool, args) if confirm else False
        if not approved:
            logger.log(tool.name, args, status="blocked", error="needs confirmation")
            raise ConfirmationRequired(tool.name, args)
    key = _args_key(tool.name, args)              # 2) have I already done exactly this?
    if memo is not None and key in memo:
        logger.log(tool.name, args, status="cache_hit", result=memo[key])
        return memo[key]
    ...                                           # 3) run it, retrying transient failures
```

First: is this destructive, and has someone said yes? Second: have I already done exactly this? Third: run it, and retry a bounded number of times if it fails transiently. The order is the design. A cache that sits in front of the gate can answer a destructive request without ever asking.

## Declare Destructiveness Once, at Registration

The gate's reliability comes from three properties.

**The flag is declared, not inferred.** `tool.destructive` is set when the tool is registered. At call time the gate asks "is this one of the tagged ones?", never "does this call look risky?" A judgement made fresh each time will eventually be made wrong.

**The default is deny.** With no policy supplied, `approved` is `False`. The executor ships two policies: `deny_destructive`, which always says no, and `always_approve`, for tests and trusted flows. An agent built carelessly cannot act destructively; someone has to opt in.

**The gate raises rather than returns.** `ConfirmationRequired` carries the tool name and the exact arguments. The loop turns it into a pause, `RunResult.blocked_on`, which the caller can show to a human and then resume. Nothing is silently skipped, and nothing proceeds.

One detail tends to bite. The exception stores its arguments on `call_args`, not `args`, because `BaseException.args` is a reserved attribute. Knowing that signals real hands-on experience.

## Key the Memo on the Tool and Its Arguments

Memoization serves a repeated call from a cache instead of running it again. The key must be stable: the same tool with the same arguments, in any order, maps to one entry.

```python
def _args_key(tool_name, args) -> str:
    return tool_name + "::" + json.dumps(args, sort_keys=True, default=str)
```

Within a session, `search_tickets("billing")` runs once, and the agent can ask again for free. The memo lives on the session and is shared across turns, so turn 3 benefits from turn 1. Each cache hit is logged with status `cache_hit`, so the saving is visible in the trace.

## Never Let a Cache Hit Route Around the Gate

A cache cannot be trusted to authorise anything it was never asked to check. Caching a destructive action's result would let a second, differently intended "delete this" return a stale answer instead of being evaluated fresh. The memo would quietly override the gate.

The ordering makes that impossible: the gate runs first, unconditionally, on every call. A destructive call either raises at the gate or arrives approved.

**The sources disagree on one detail.** In the Handbook's executor, an *approved* destructive call does continue to the memo check. Its key includes its arguments, so a second `close_ticket("TKT-3")` returns the cached "closed" result. The Handbook argues that is correct for an idempotent close. The cross-cutting guard material states the stricter rule: destructive calls skip the cache entirely and take the full authorisation path every time. The eight-check pipeline also caches only non-destructive results. Both agree on the rule that matters: a cache hit must never let a destructive call skip the gate. In an interview, give the stricter rule.

> **Warning: the cache is not a second authorisation path.** If memoization ever runs before the destructive check, a repeated request inherits an approval that was given for a different moment and a different intent. Keep the gate first, and keep destructive results out of the cache unless the action is idempotent by design.

## Resume From the Pause Without Repeating the Write

Pausing is the easy half of human approval. The hard half is resuming without running a side effect a second time. A resume that re-executes a write turns one approval into two refunds.

LangGraph builds the pause into the graph. A node raises `NodeInterrupt` with a message for the reviewer, the checkpointer saves state at that point, and the run stops. In the interview tutorial's hotel-booking notebook, a compliance check raises it on a booking request that looks like SQL injection. The interrupted node has not committed its write, so a resume re-enters cleanly instead of replaying earlier steps.

A hand-built gate needs the same guarantee. Give every call that is not a pure read an idempotency key: an id the caller supplies and the system remembers, so a repeated call returns the first result instead of acting twice. A refund tool keyed by booking ID plus a generated request ID cannot double-pay, even if a human approves and the run resumes twice.

Read the paused state, not the printed stream. A run stopped by `NodeInterrupt` ends abruptly, with the interrupt buried in the saved state's task list. It is easy to mistake for a crash. Check the state's `next` field, which names the node waiting to run, and the interrupts on its tasks. That is how logs tell "waiting for approval" apart from "failed". [Checkpoints, Interrupts, and Human Approval](../T2.5_LangChain_and_LangGraph/06_Checkpoints_Interrupts_and_Human_Approval.md) covers the framework mechanics in full.

## Worked Example: Two Requests to Close a Ticket

A support agent handles "find the login ticket and close it".

The agent first calls `search_tickets("login")`. It is not destructive, so the gate lets it through. The memo has no entry, so it runs, returns TKT-3, and the result is cached. A minute later, the agent searches again for the same thing. The memo returns the cached list with status `cache_hit`, and no call reaches the ticket system.

Next it proposes `close_ticket("TKT-3")`. The tool was registered as destructive. No confirmation policy was supplied, so the gate denies by default, logs `blocked`, and raises `ConfirmationRequired` with `call_args={"ticket_id": "TKT-3"}`. The run pauses and shows the pending action to a human. Only when someone approves does the close proceed.

The read was cheap the second time, and the write never happened without a yes. That is the whole job of the first two mechanisms: save work on reads, and never save a step on writes.

---

## Key Takeaways

- A tool executor hides four mechanisms, each tied to one production incident: the confirmation gate, memoization, retry, and fallback.
- The executor asks its questions in a fixed order: gate first, cache second, retry third.
- The gate is reliable because destructiveness is declared at registration, the default is deny, and a block raises a resumable pause.
- The memo keys on the tool name plus sorted arguments and is shared across turns of one session.
- A cache hit must never route around the gate; the sources differ only on whether an approved destructive result may be cached.
- A pause is only safe if the resume cannot repeat a write, so key every side-effecting call and read the paused state to tell waiting from failed.

## Check Yourself

1. **Why does the confirmation gate run before the cache check, and what would go wrong if the order were reversed?**
   The gate must see every call. If the cache came first, a repeated destructive request could return a cached result without ever being authorised, so the memo would silently override the gate.

2. **Name the three properties that make the gate reliable rather than decorative.**
   The destructive flag is declared at registration rather than judged per call; the default policy denies; and a block raises `ConfirmationRequired` with the exact arguments, so the run pauses visibly instead of skipping or proceeding.

3. **Two calls arrive: `search_tickets` with `{"query": "auth", "limit": 5}` and the same call with the keys in the other order. How many times does the tool run?**
   Once. The memo key sorts the arguments before serialising them, so both calls map to the same entry, and the second is logged as a `cache_hit`.

4. **A run that hit `NodeInterrupt` looks like it crashed. How do you tell, and what must hold before it resumes?**
   Read the saved state: `next` names the node waiting to run and the tasks carry the interrupt, which a crash does not leave. Before resuming, every side-effecting call must be idempotent, for example a refund keyed by booking ID plus a request ID, so a repeated resume cannot act twice.

## References

**Sources:** `01_Retry_Fallback_Memo_Confirm.md` (FDE Handbook, Robust Agents): "Why this matters", "The composed executor", "1 · The confirmation gate" and "2 · Memoization". `05_The_Eight_Guard_Checks.md`: "6 · Memoization — the ordering rule" and "The pipeline, in order". `05-guarding-tool-calls.md` (Production and Platform Judgment): "6. Memoization". `agent_fundamentals_and_advanced_agentic_systems_INTERVIEW_TUTORIAL.md`: §1.10 "Human-in-the-loop: interrupts and safe resume", the §2 gotcha "`NodeInterrupt` looks like it crashed the graph", §6 approval gate, and §7 questions 3 and 14.
