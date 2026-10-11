# Why Agents Need State

*Each agent turn can be stateless, but a conversation cannot, so the real design question is where every piece of state lives and how long it lasts.*

An agent turn is stateless in isolation; a conversation is not. Name the scope of each piece of state before choosing where to store it, then read [Types of Memory](/learn/agentic-systems/memory-and-state/types-of-memory) for what belongs inside each scope.

**Objectives:**

- name the three scopes of state, their lifetimes, and where each lives in production;
- say what a checkpointer gives you that a plain session store does not;
- choose between a sliding and a fixed expiry for time-limited session memory.

---

## Separate a Turn From a Conversation

A customer asks, "Where's my package?" and then, "Can you refund it?" The second question only works if something remembers what "it" is. The model call that answers it starts from nothing. So the memory has to come from outside the call.

There is a second reason state matters. An agent that survives a server restart mid-run only does so because its state lived somewhere other than the process that died. A process cannot resume from state that died with it. Treat "where does this state live?" as a reliability question, not just a convenience.

## Name Three Scopes Before Choosing Storage

State comes in three scopes. They have different lifetimes, so they need different storage.

| Scope | Lifetime | What it holds | Where it lives in production |
|---|---|---|---|
| Turn (one run) | One call to `agent.run()` | Observations, iteration count | Local variables, or graph state |
| Thread (one conversation) | Many turns of one conversation | History, tool-result memo, trace | A `Session` object, stored in Redis or a database by `conversation_id` |
| User | Across conversations | Preferences, past interactions, entitlements | A user profile store, scoped per user |

The turn and thread scopes are mechanical. The user scope is where "memory" in the product sense lives, and it needs the most care. [Memory in Production](/learn/agentic-systems/memory-and-state/memory-in-production) covers why.

**A note on words.** The FDE Handbook calls the middle scope a *session*. The LangGraph material calls the same thing a *thread*, keyed by `thread_id`, and keeps the word *session memory* for a separate, time-limited layer covered below. This lesson says *thread* for one conversation and *session memory* for the time-limited layer. In an interview, say which meaning you intend.

**Say it like this:** "Run state is local. Thread state is keyed by conversation ID in a shared store, so any worker can resume. User memory is a separate, per-user store."

## Read the Session Object as a Sketch of Production

The Handbook's companion project keeps thread state in one small object:

```python
@dataclass
class Session:
    history: List[Tuple[str, str]]   # (query, answer) pairs = memory
    memo: dict                       # tool-result cache (don't re-hit the API)
    logger: ToolCallLogger           # full observability trace
```

Each field does one job. **History** gives the model context for follow-ups such as "close *that* one". In the demo it is a list; with an LLM it is rendered into the prompt. **Memo** is shared across turns, so a repeated `search_tickets("billing")` in turn 3 is free if turn 1 already ran it. The test `test_session_memo_persists_across_turns` proves it. **Logger** collects every tool call across the conversation. It is the one place to answer "what did this agent do for this user today?"

In the project, `Agent.run` appends to `session.history` when it records a final answer. Tools receive the memo through `execute_tool(..., memo=session.memo)`. Graph-level run state lives in `AgentState` in the LangGraph version of the same agent.

## Move Thread State Out of the Process

In the demo the `Session` lives in memory. In production it moves to a store keyed by `conversation_id`, Redis or a database, so any worker can pick the conversation up. Add a **checkpointer** on top: LangGraph's `MemorySaver`, or a durable saver, which persists state after every node.

The checkpointer buys two things a plain session store does not.

1. **Crash recovery.** The process dies at step 4 of 7. The next worker loads the checkpoint and continues from step 5, not step 1. The Handbook's orchestrator module builds this by hand with a `next_step_index`, which shows exactly what a checkpoint is.
2. **Human-in-the-loop pauses.** A blocked tool call becomes `interrupt_before=["tools"]`. The graph checkpoints, waits minutes or days for approval, and resumes in a different process.

One guardrail applies to all of this: cap history and memo size. Both grow with the conversation. History costs tokens and the memo costs memory. Summarise or window old turns, and expire memo entries. [Short-Term Memory and the Context Window](/learn/agentic-systems/memory-and-state/short-term-memory-and-the-context-window) shows how.

## Give Session Memory a Clock

Some state should outlive one thread but not last forever. A login session and a shopping-cart context are the examples in the LangGraph notebooks. LangGraph's `Store` supports this with `TTLConfig`, keyed by `session_id` rather than `thread_id` or `user_id`.

```python
store = SqliteStore(conn, ttl=TTLConfig(default_ttl=30, refresh_on_read=True))  # 30 MINUTES
store.put(("session", session_id), "preference", {"value": "dark_mode"})
```

Session memory deliberately spans several threads under one `session_id`. The expiry style is a product decision. `refresh_on_read=True` gives a sliding expiry, so activity extends the session. `False` gives a fixed window, whatever the user does. Decide which one the product needs; do not leave the default unexamined.

> **Warning: expiry is not checked on every read.** A `store.get()` can still return an item after its time-to-live has passed. Expired items are only filtered once a sweep has deleted them. Run `start_ttl_sweeper()` on a schedule, or check the entry's age yourself if even a few seconds of staleness is unacceptable.

## Worked Example: One Support Conversation Across Three Scopes

Follow the package conversation through the three scopes.

In turn 1, "Where's my package?", the run calls an order-lookup tool. The observation and the iteration count live in the run's local state and vanish when the turn ends. The answer is appended to the thread's history, and the tool result goes into the memo.

Between turns, the worker that handled turn 1 restarts. Turn 2, "Can you refund it?", lands on a different worker. That worker loads the thread by `conversation_id`, finds the history, and resolves "it" to the same order. If the refund needs approval, the checkpointer pauses the graph until a human answers.

Across conversations, the customer's preferred language sits in the user store. Next week, in a brand-new thread, the agent still replies in that language.

Each fact lived exactly as long as its scope. That is the whole design: match every piece of state to the scope whose lifetime it shares, then store it where that scope survives.

---

## Key Takeaways

- A single model call starts from nothing, so a conversation's memory must live outside the call and outside the process.
- Name three scopes, turn, thread and user, because each has its own lifetime and its own storage.
- The `Session` object's history, memo and logger are a small sketch of production thread state.
- A checkpointer adds crash recovery and human-in-the-loop pauses on top of a plain session store; cap what it holds.
- Time-limited session memory sits between thread and user; choose sliding or fixed expiry on purpose, and sweep expired entries.

## Check Yourself

1. **Name the three scopes of state, their lifetimes, and where each lives in production.**
   Turn: one `agent.run()`, in local variables or graph state. Thread: one conversation, in a store keyed by `conversation_id` so any worker can resume. User: across conversations, in a per-user profile store.

2. **What two capabilities does a checkpointer give you that a plain session store does not?**
   Crash recovery, so a run that dies at step 4 of 7 resumes at step 5, and human-in-the-loop pauses, where the graph checkpoints and resumes in another process after approval.

3. **A session should expire 30 minutes after the user's last action. Which TTL setting do you pick, and what else do you run?**
   `refresh_on_read=True`, for a sliding expiry. Also run a TTL sweeper, because reads do not check the clock themselves.

