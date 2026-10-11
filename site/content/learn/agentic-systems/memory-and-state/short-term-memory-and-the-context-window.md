# Short-Term Memory and the Context Window

*Replaying the whole conversation loses nothing but costs more every turn, while windows and summaries cap the cost by choosing what to lose.*

Short-term memory is not a store; it is what reaches the model on the next call. Persist the thread with a checkpointer, as set up in [Why Agents Need State](/learn/agentic-systems/memory-and-state/why-agents-need-state), then decide separately how much of it the model sees.

**Objectives:**

- keep a long conversation inside the context window without losing what matters;
- tell trimming what the model sees apart from removing what is stored;
- choose between full history, a sliding window and summarisation, and between an in-memory and a durable checkpointer.

---

## Treat the Context Window as a Budget

Think of short-term memory as a notepad on the desk for today's job. It holds the task, the plan, the tool results so far and the current step. It has a size limit. Track token usage, and replace finished steps with short summaries.

Long conversations break this quickly. Every message is a write, so the full history belongs in a database: each turn with user ID, session ID, turn number, timestamp and content, usually in a relational store. But 300 turns cannot be loaded into the window. A window cannot hold a conversation longer than itself. So choose which turns go in.

Module 9 suggests combining three signals. **Recency:** the last 5 to 10 turns. **Semantic relevance:** embed the new question and search a vector index of past turns. **Structural markers:** the first turns, which show what the conversation is for. Keep decisions, preferences and finished tasks as a structured summary too, so the model does not re-read raw chat to find them.

## Recognise the Legacy Chain Pattern

Before LangGraph, LangChain memory meant a `Memory` object attached to a `Chain`. It read prior turns into the prompt before the call and wrote the new turn back afterwards. Three classes share one interface, `load_memory_variables()` and `save_context()`. `ConversationBufferMemory` keeps the full history. `ConversationBufferWindowMemory` keeps the last *k* turns. `ConversationSummaryMemory` replaces old turns with an LLM-written summary.

```python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory()
memory.save_context({"input": "Hi, I'm Sam"}, {"output": "Hello Sam!"})
memory.load_memory_variables({})
# {'history': "Human: Hi, I'm Sam\nAI: Hello Sam!"}
```

`RunnableWithMessageHistory` brings the same idea to the LangChain Expression Language. It wraps a chain, fetches history for a `session_id` through a factory function, injects it at a placeholder, and appends the new turn.

```python
def get_session_history_db(session_id: str):
    return SQLChatMessageHistory(session_id=session_id, connection="sqlite:///chat_history.db")

chain_with_history = RunnableWithMessageHistory(
    chain, get_session_history_db, input_messages_key="input", history_messages_key="history"
)
chain_with_history.invoke({"input": "..."}, config={"configurable": {"session_id": "alice"}})
```

Here `session_id` plays the role `thread_id` plays in LangGraph: it is the isolation key. Swapping the in-process history for `SQLChatMessageHistory` is the same in-memory-to-durable move as swapping `MemorySaver` for `SqliteSaver`. Know this family; reach for a checkpointer and a `Store` for anything durable.

## Let a Checkpointer Persist the Thread

In LangGraph, do not hand-roll append-and-replay logic. Compile the graph with a checkpointer. Every `invoke()` then loads the checkpoint for the configured `thread_id`, runs the graph, and writes the new state back, one checkpoint per node step.

```python
from langgraph.checkpoint.sqlite import SqliteSaver

conn = sqlite3.connect("short_term_memory.db", check_same_thread=False)
checkpointer = SqliteSaver(conn)
agent = builder.compile(checkpointer=checkpointer)

cfg_a = {"configurable": {"thread_id": "thread-A"}}
agent.invoke({"messages": [HumanMessage("My favorite color is teal.")]}, cfg_a)
agent.get_state(cfg_a)          # inspect exactly what's checkpointed
```

"Short-term" describes scope, not lifetime. `SqliteSaver` and `PostgresSaver` write every checkpoint to disk, so a thread survives a restart. If history should die with the process, use `MemorySaver`. That is a different class, not a configuration flag.

| Option | Costs | Buys | Pick when |
|---|---|---|---|
| `MemorySaver` | Wiped on restart; single process | Zero setup | Local development, tests, a demo |
| `SqliteSaver` / `PostgresSaver` | A real database to run and back up | Survives restarts; inspectable with SQL | Anything a user expects to persist |

Treat `MemorySaver` as a demo default. Swap it the moment "the conversation vanished on redeploy" becomes a real complaint.

## Trim What the Model Sees, Then Decide What to Store

Replaying every turn grows the prompt, and the bill, with every message. Trimming is a separate decision from what the checkpointer keeps.

`trim_messages()` runs before the model call and shrinks only the list handed to the model. The checkpoint written after the step still holds the untrimmed history. To shrink the stored state, a node must emit `RemoveMessage(id=...)`:

```python
MAX_MESSAGES = 4

def truncate_messages_node(state):
    msgs = state["messages"]
    if len(msgs) <= MAX_MESSAGES:
        return {}
    to_drop = msgs[:-MAX_MESSAGES]
    return {"messages": [RemoveMessage(id=m.id) for m in to_drop]}   # only trims persisted state
```

The interview tutorial's notebook measured the effect. With a sliding window, token count plateaus once the window fills. With full replay, it grows linearly.

> **Warning: trimming the prompt does not trim the checkpoint.** If `trim_messages` is the only control, the model sees less but the checkpoint database keeps growing at the same rate. Use `trim_messages` for context-window and cost control. Use `RemoveMessage`, or a retention policy, when the stored history itself must shrink.

## Summarise When Old Facts Still Matter

A sliding window loses anything that scrolls out. Summarisation keeps a condensed record of everything older. Once the buffer crosses a threshold, a node asks the model to fold it into an updated summary, then evicts the summarised messages. The next call gets the summary plus only the freshest raw turns.

```python
def summarize_buffer_node(state: SummarizationState):
    buffer, current_summary = state["buffer"], state.get("summary", "")
    if len(buffer) < MESSAGE_THRESHOLD:
        return {}
    new_summary = llm.invoke([system, HumanMessage(
        f"Previous summary:\n{current_summary or '(none)'}\n\nNew turns:\n{buffer_text}\n\nProduce an updated summary."
    )]).content
    return {"summary": new_summary, "buffer": [RemoveMessage(id=m.id) for m in buffer]}
```

The trade is one extra model call per compression step for a prompt that stays bounded indefinitely. The failure to volunteer: the summariser drops something it judged unimportant, and it matters later.

Module 9 adds an order and a timing. **Compress the cheapest loss first:** shorten long tool outputs, then summarise older turns, then keep only recent turns plus the most relevant ones. **Gate every call on a token count:** keep a buffer for the answer, and act at about 80% of the limit. **Start early:** begin summarising in the background at about 60%, so the summary is ready in time. Its sliding-window recipe makes a running summary every 20 turns or so. The interview tutorial's worked design folds the buffer at about 15 turns instead. Neither number is a rule; both are examples.

One state-schema trap catches summarisation nodes. If the `summary` field has no reducer, passing `"summary": ""` as input to the next `invoke()` overwrites what the previous step wrote. Pass only the fields you mean to overwrite, or add a reducer.

## Choose the Strategy by Turn Count and Loss Tolerance

| Option | Costs | Buys | Pick when |
|---|---|---|---|
| Full history replay | Tokens and latency grow linearly with turns | No information loss | Short or low-turn conversations |
| Sliding window (`RemoveMessage`) | Anything outside the window is gone | Flat, bounded token cost | Only the last few turns ever matter |
| Summarisation | An extra model call per compression; lossy | Bounded cost and a record of older turns | Long conversations where old facts still matter |

Full history is the right baseline to start from and the wrong thing to ship. Move to a window or a summary as soon as turn count is unbounded.

The same reasoning separates LangChain's `Memory` classes from a LangGraph checkpointer plus `Store`. The `Memory` classes answer "what goes in the next prompt". They are quick to attach to one linear chain, but have no cross-thread story. The checkpointer answers "can this run pause, resume, and be inspected at any past step". It costs more design up front, a state schema and namespaces. In return it gives cross-thread memory, human-in-the-loop pauses, time travel and resumability. That second problem is strictly bigger, and the `Memory` classes were never built for it.

## Cache Tool Results, Never Reasoning Steps

Working memory is not a cache, but a cache can sit beside it inside the loop. The `Session` memo from lesson 1 is exactly that: a repeated `search_tickets("billing")` is free the second time.

Module 9 draws the line. **Cache** tool-call results that have not changed, such as a customer lookup, planning output for similar tasks, and documents retrieved for the task. **Do not cache** reasoning steps that depend on the growing context: the same visible input still arrives with a different history. **Never cache** tool calls with side effects, such as `send_email` or `update_database`; those must run every time. Scope tool-result caches to the current task and expire them when it ends. Keep longer-lived caches for stable reference data only.

Answer caches, semantic caches and invalidation are a cost topic, covered in [T4.5 Cost and latency](/learn/production-ai/cost-and-latency).

## Worked Example: A Support Thread That Reaches Turn 300

A long-running support thread passes 300 turns. Every turn is already a row in the relational store, so nothing is lost by leaving turns out of the prompt.

Before each call, the agent counts tokens. At about 60% of the limit, a background summarisation starts. At about 80%, the gate acts. First, long tool outputs from old turns are shortened. Next, older turns are folded into the running summary. The prompt then holds the summary, the opening turns that state the customer's problem, the last 5 to 10 turns, and any older turns a vector search finds relevant to the new question. A repeated order lookup inside the current task comes from the memo; the refund call itself always runs.

The checkpoint keeps the thread durable, the summary keeps it affordable, and the model only ever sees a bounded prompt. That split, persist everything and show a budgeted slice, is what short-term memory means in production.

---

## Key Takeaways

- Treat the context window as a budget: keep the full history in a database and choose what enters the prompt by recency, relevance and structure.
- The legacy `Memory` classes and `RunnableWithMessageHistory` solve "what goes in the next prompt"; know them, but use a checkpointer for durable threads.
- A checkpointer persists the thread by `thread_id`; "short-term" is a scope, and `MemorySaver` is the only class that forgets on restart.
- Trimming the prompt does not shrink the checkpoint; `RemoveMessage` or a retention policy does.
- Summarisation buys bounded cost with older facts kept, at the price of an extra call and lossy compression; compress the cheapest loss first.
- Choose full history, window or summary by turn count and how much loss the task tolerates.
- Cache stable tool results inside the loop, but never reasoning steps or calls with side effects.

## Check Yourself

1. **You trimmed the prompt, but the checkpoint database is still growing. Why?**
   `trim_messages` only filters what the model sees in that call. The stored state shrinks only when a node emits `RemoveMessage` or a retention policy runs.

2. **Short-term memory survived a restart you expected to wipe it. Why?**
   `SqliteSaver` and `PostgresSaver` write to disk; "short-term" means scoped by `thread_id`, not short-lived. Use `MemorySaver` for RAM-only history.

3. **Which of these should an agent cache inside one task: a customer lookup, a reasoning step, a `send_email` call?**
   Only the customer lookup, if it has not changed. Reasoning depends on growing history, and side-effecting calls must run every time.

