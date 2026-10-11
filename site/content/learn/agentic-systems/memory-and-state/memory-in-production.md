# Memory in Production

*Memory is what makes an agent feel personal, and the same memory leaks, lingers, and fails an audit when isolation and deletion come last.*

Most memory incidents are not model failures; they are namespace and lifecycle bugs. Design isolation, deletion and audit into the memory store from day one, using the scopes from [Why Agents Need State](/learn/agentic-systems/memory-and-state/why-agents-need-state) and the write path from [Long-Term Memory: Write, Retrieve, and Forget](/learn/agentic-systems/memory-and-state/long-term-memory-write-retrieve-forget).

**Objectives:**

- scope every memory read and write to one user and tenant, enforced below the application;
- design deletion that reaches every copy, and an audit trail for what the agent knows;
- split shared from private memory across agents, and spot the common production gotchas.

---

## Scope Every Read to One User

Scope memory strictly per user, and retrieve selectively rather than loading everything. There are two reasons.

**Isolation.** A memory store keyed only by `conversation_id`, with no user check, is a cross-user leak waiting for someone to guess an ID. Identity resolved at authentication is what keeps memory user-isolated. It is the same resolved identity that scopes document retrieval.

**Token budget.** The window is finite, and everything put in it displaces something else. Pull the three past interactions relevant to this question, not the last three hundred.

Module 9 makes the isolation concrete. Every row and every vector carries a mandatory, indexed `user_id` and `tenant_id`. Every database or vector query gets the user filter at the infrastructure level, so neither application code nor the model can skip it. Cache keys are namespaced too, for example `session:{user_id}:{session_id}:state` in Redis. Telling the model "you only see this user's data" is a second safety layer, never the main one. A leak here is a privacy violation, not just a bug.

The agentic design book pushes the boundary one level lower: enforce tenancy **inside the store**, with row-level security or physically separate indexes. An application-layer filter can fail open on an untested code path, and that failure is a cross-tenant data leak. Module 9 says "at the access layer"; the book says "inside the store". Both agree that the filter must not depend on application code remembering it.

The isolation key must come from trusted server-side configuration. Never take `user_id` from user input or from a model's tool-call argument. If the model can set the key, one user can read or corrupt another's facts.

> **Warning: an application-layer filter fails open.** A filter written in application code works until one code path forgets it. Put the user and tenant filter where no code path can skip it, in the store or the access layer, and source the key from the authenticated identity.

## Keep Long-Running Work Out of the Turn

A refund investigation, a warranty cancellation or a shipping enquiry can take minutes or hours. Holding a conversation turn open for that is wrong. A turn that waits on a two-hour job ties up the conversation for two hours.

Reply immediately, "Your request has been submitted", and let background workers finish. Keep the run's state in the durable store. The result can then be reported back in a later turn, or on another channel.

## Make Deletion Reach Every Copy

A regulated buyer audits three things. One tenant's memory can never leak to another. Deletion is actually complete. Every answer can point to its source.

Deletion is the hard one, because a fact is copied as it moves through the system. An erasure request must remove the fact itself, its vector, its lexical index entry, and every cached summary derived from it. For a GDPR Article 17 "right to be forgotten" request, soft deletion is not enough. Purge every tier in turn: hard-delete the rows in the relational store, delete the vectors from the embedding index, remove the subject from the BM25 postings, then invalidate and regenerate derived summaries. Miss one and the "deleted" fact is still recoverable. Design this fan-out from day one; retrofitting it is hard.

Retention is a decision too. A checkpointer that remembers every thread forever is a data-governance choice, not a default. Decide retention and deletion per thread up front. When a customer asks for an agent that remembers every conversation with every user, forever, ask about their retention and compliance requirements first. Unbounded episodic memory is a cost and governance problem, not a free feature.

## Make Every Answer Traceable to Its Memories

For any answer, the system should show which memory entries contributed and where each came from. That falls out of storing provenance in the schema, the source, timestamp and confidence from the write gates. A log line added later cannot give the same guarantee.

When a compliance team asks what lives in long-term memory and for how long, answer per namespace: what is stored, under what key, and whether and when it expires. TTL-scoped session memory and non-expiring semantic memory need different answers. When a customer asks for an audit trail of what the agent "knows" about a user, query the store by namespace and show the raw rows. Do not show the agent's own summary of itself. The FDE Handbook's session logger plays the same role for actions: one place to answer "what did this agent do for this user today?"

Module 9 adds the user's side: let users inspect and delete their memories, and audit memories for accuracy.

## Split Shared From Private Memory Across Agents

When several agents work together, split memory in two. **Shared memory** holds the task plan and status, each agent's results, shared facts, and who is doing what. **Private memory** holds each agent's current sub-task, its own reasoning, and its tool history.

Make the shared memory an **append-only log**. Agents add entries and never edit each other's, so there are no write conflicts. Each entry carries the agent ID, type, content, timestamp and a sequence number. The log is also the communication channel: a researcher writes, a verifier reads and writes, a writer reads both, with no direct agent-to-agent messages. Contradictions stay visible in the log. The orchestrator can spot them and start a resolution step instead of one agent silently overwriting another.

## Check the Gotchas Before the Pilot

The interview tutorial's notebooks surfaced eight production gotchas. Each looks like a model problem and is not.

| Symptom | Cause | First fix |
|---|---|---|
| History survives a restart you expected to wipe it | `SqliteSaver` and `PostgresSaver` write to disk; "short-term" is a scope | Use `MemorySaver` for RAM-only history |
| The prompt is trimmed but the database keeps growing | `trim_messages` filters only what the model sees | `RemoveMessage` or a retention policy |
| A read returns a session item after its TTL | Expired items are removed by a sweep, not checked on read | Run `start_ttl_sweeper()`, or check the entry's age |
| "Remember X" three times gives three rows | A fresh `uuid4()` key on every write | Key the fact by what it is |
| A tool works when called directly but fails in the agent, or the reverse | `get_store()` and `interrupt()` resolve only inside an active graph run | Drive tools through the compiled graph or a `ToolNode` |
| The agent's own output approves a change meant for a human | Approval passed as a tool argument the model can set | Block on `interrupt()` and resolve only through `Command(resume=...)` |
| One user's episodic memory keeps climbing | Every task is a fresh write with no cap | Keep the most recent N, or summarise older episodes |
| A running summary resets between turns | The `summary` field has no reducer and the next input overwrote it | Pass only fields you mean to overwrite, or add a reducer |

The approval gotcha matters most for procedural memory. A tool that proposes a behaviour change must block on `interrupt()`, with no code path that supplies the decision itself. Otherwise the model can approve its own instructions.

Two more checks from the same notebooks. A demo with 5 test facts hides the cost of an unfiltered `store.search()`; a pilot user with 500 shows it as latency and irrelevant results. And debugging two threads that disagree about one user starts with the namespace: a `thread_id` used by mistake as the long-term namespace collapses cross-thread memory back into per-thread memory.

## Worked Example: Users See Each Other's Preferences

A customer's pilot reports that users are seeing each other's remembered preferences. The same customer also wants memory that "just works" across their web app and their Slack bot.

Start with namespace derivation, not the model. The likely cause is a `user_id` taken from the wrong place: from a request field, or from a tool-call argument the model filled in. Move the key to the authenticated identity on the server side, and put the filter in the store or access layer so no path can skip it. Then check that no code path writes to a shared or global namespace by accident.

The cross-channel request is the same problem from the other side. The memory system does not care which channel wrote a fact. But both the web app and the Slack bot must resolve the person to the same `user_id` before memory can be shared. Unify the identity mapping first.

Both symptoms had one root cause: the isolation key was not owned by the identity layer. Fix that, and personalisation and isolation come from the same place.

---

## Key Takeaways

- Scope every memory read to one user, enforce the filter below application code, and source the key from authenticated identity, never the model.
- Reply at once to long-running work and let background workers finish, with state in the durable store.
- Deletion must fan out to rows, vectors, lexical postings and derived summaries; decide retention per thread up front.
- Store provenance so every answer can name the memories behind it, and audit by querying the raw rows.
- Give multiple agents private memory plus an append-only shared log that doubles as the channel and exposes conflicts.
- Most production memory bugs are namespace, lifecycle or run-context mistakes; check the eight gotchas before a pilot.
- Cross-user leaks and cross-channel gaps share one fix: let the identity layer own the isolation key.

## Check Yourself

1. **What are the two reasons memory reads must be scoped per user?**
   Isolation, so a guessed conversation ID cannot expose another user's memory, and token budget, so only the few relevant memories enter the window.

2. **A user exercises their right to be forgotten. What must the deletion reach?**
   The relational rows, the vectors, the lexical postings, and every cached summary derived from the erased facts. Soft deletion is not enough.

3. **How should a two-hour refund investigation interact with a conversation turn?**
   Reply immediately that the request was submitted, run the work in background workers with state in the durable store, and report the result in a later turn or another channel.

