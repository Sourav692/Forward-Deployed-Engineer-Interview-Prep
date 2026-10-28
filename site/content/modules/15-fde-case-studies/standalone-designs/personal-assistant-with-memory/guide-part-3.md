# Personal Assistant With Memory, part 3

## 15. Deliver It in Forty-Five Minutes

Spend the time on scopes, bounds and isolation, because those are what the rubric scores. The model choice is a sentence.

| Minutes | Phase |
|---|---|
| 0–5 | Clarify the four promises and the 300ms question (section 1) |
| 5–10 | Requirements and the sizing arithmetic aloud (sections 2 and 3) |
| 10–18 | The diagram, one turn walked through read, reply and write (section 4) |
| 18–32 | Deep dive: scopes, bounding, write rules, pruning, search (sections 5 to 9) |
| 32–40 | Latency budget and isolation (sections 10 and 11) |
| 40–45 | Evaluation, failure modes and the cost pivot (sections 12, 13 and 16) |

The two-minute spoken answer *(own construction, built on the source answer)*:

> *I would split memory into four scopes, because each answers a different question. The live conversation is checkpointed by thread ID and folded into a running summary past about 15 turns, so prompt size stays flat. Session context sits under a session ID with a TTL. Stable facts like time zone live in a semantic namespace keyed by user ID, under stable keys that overwrite in place, with one prior version kept so contradictions are answerable. Completed tasks are appended to an episodic namespace, capped at the newest 100 per user, with older ones folded into a rolling digest. Episodes are searched through an embedding index filtered by user, so recall stays fast past a thousand items. On each turn, the reads fan out in parallel and fit well inside the 300 millisecond budget; every write, extraction and pruning step runs on a queue after the reply. User ID always comes from the auth session, never from the model. I would prove it with a recall harness that plants a fact and asks for it 20 turns and one conversation later, plus a false-memory rate and cross-user isolation tests.*

The lines that carry the round:

1. *"Thread ID answers which conversation; the user namespace answers which person."* (study guide)
2. *"If a fact can change, its key must be stable; if it is an event, a fresh key is correct."* (study guide)
3. *"Store everything in the thread, send the model a summary and the recent turns."* *(own construction)*
4. *"A scan is fine at five memories and wrong at five hundred."* (study guide)
5. *"Reads on the critical path, writes after the reply."* *(own construction)*
6. *"User ID comes from auth. Never from the model."* (source)
7. *"Enterprise knowledge is not memory; it is retrieval."* (Handbook Module 03)

The follow-ups, including the study guide's "skeptical staff engineer" prompts:

| Follow-up | Answer |
|---|---|
| Why three long-term memory types, not one table with an extra column? | Each has a different write rule (overwrite, append, approval-gated), and one table cannot hold three disciplines consistently |
| Justify shipping a scan instead of building the index first | Only for a pilot with a handful of facts per user; the index must land before tenure grows, and the latency metric tells when |
| A preference from a month ago contradicts what they just said | Overwrite with the new value, keep the old one a version back with its date, and mention the change if it matters to the task |
| Customer wants it to remember everything forever | Ask for retention and compliance requirements first; unbounded episodic memory is a cost and governance problem, not a free feature |
| Users report seeing each other's preferences | Audit namespace derivation; the usual cause is a `user_id` from the wrong place |
| Demo worked with 5 facts, pilot user has 500 | That is the scan becoming visible; add the index and the episode cap |
| Why not use a million-token context window? | The context window is working memory; it is wiped each conversation, costs tokens every turn and slows the first token |
| How would the assistant learn procedures as well as facts? | Workflow memory: abstract repeated successful task sequences into templates, retrieved by structural similarity; it pays off only on repetition |

## 16. Answer the Cost Pivot in Ten Minutes

The pivot is usually "memory made the bill go up; what do you cut?" Answer with the cost-drill card *(own construction, built on the cost study guides)*.

| Card field | Answer |
|---|---|
| Main cost driver | Input tokens: memory, summary and history re-sent on every turn; then the extra model calls for summarising and extracting |
| Cheapest lever first | Send top-k episodes, not all; fetch facts by key; fold history past ~15 turns; keep the stable prefix first so it caches; run extraction on a small model, in batches, off the reply path |
| Metric that proves it | Input tokens per turn by section (facts, digest, episodes, summary, turns); extraction and summary calls per 1,000 turns; cost per active user per day; recall on the harness |
| Do not | Stuff every memory into every prompt, or extract on every turn with the premium model |
| 60-second line | Storage is cheap; the cost is the model calls to write memory and the tokens to read it back. Retrieve a few relevant memories, summarise in steps, extract with a small model after the reply, and prove recall held with the harness. |

The cost study guide's first driver explains most surprises here. Input tokens grow with context: teams count the user's question and ignore the system prompt and hidden history, so the bill rises while traffic stays flat. Its fix list reads like this design: trim prompts, compress context, summarise history and cache static prompt parts. The study guide's FDE answer is the non-engineer version: cost scales with how often memory is written and searched, not with how much is stored.

Every strong cost answer follows four verbs in order. Measure tokens per prompt section first. Route extraction and summarising to a small model. Bound episodes, summary length and top-k. Cache safely, with the stable prefix first and the user's scope in every key.

---

## Level calibration

For this assistant, the levels separate on how far the answer goes past the four memory scopes into identity, deletion and proof that recall holds.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | "Thread checkpoints keyed by `thread_id` with a summary past about 15 turns, semantic facts under stable keys, episodes appended and capped at 100 per user, and an embedding index so reads fit inside the 300ms budget." | Where `user_id` comes from, what happens when a new preference contradicts an old one, and how to prove recall rather than fluency. |
| Staff | "`user_id` comes from auth, never the model, and every channel resolves to it first. Writes queue after the reply, a deletion job clears every store, index and cache, and a recall harness plus cross-user tests gate changes to the extraction prompt, summary threshold and cap." | Who owns the memory policy, retention and residency as the customer's compliance rules change. |
| Principal | "Memory is a product surface: users see, correct and erase it, retention is named per scope, the residency map pins stores to a region, and enterprise knowledge stays out of memory because it refreshes on a different cadence." | The customer's retention and compliance answers, plus real tenure data, decide whether 100 episodes and 30-day thread retention are right. |

## Key Takeaways

- Clarify the four promises hidden in "remembers you" and settle that the 300ms budget is for reads.
- Requirements are testable: recall 20 turns later, zero cross-user reads, flat prompt size, deletion everywhere.
- The sizing shows the 100-episode cap bounds the index and the ~15-turn summary is a cost line.
- One diagram shows resolve, read in parallel, assemble, reply, then write from a queue.
- Four scopes with four keys: thread, session, semantic and episodic, each with its own write rule.
- Store every turn, and send a running summary plus recent turns; trimming the prompt does not trim storage.
- Key facts by what they are, append events, keep one prior version, and never persist transient details as facts.
- Cap episodes at 100 and fold older ones into a digest; sweep expired sessions on a schedule.
- Fetch facts by key and search episodes through an index filtered by user.
- In my budget, reads fit in about 115 ms in parallel; every write leaves the critical path.
- `user_id` comes from auth on every request, and governance follows from the namespaces.
- Measure recall of planted facts and false memories, not fluency.
- Volunteer the failure modes: random keys, unbounded episodes, scans, model-supplied identity, memory poisoning.
- The source rubric has eight lines, and each maps to a section.
- The 45 minutes go to scopes, bounds and isolation.
- Memory cost is writes and read-back tokens: retrieve a few, summarise in steps, extract small and late.

## Check Yourself

1. **What four promises hide in "remembers you"?** Hold the conversation, keep preferences, recall past tasks, and keep users apart.
2. **Why does the 100-episode cap matter for latency as well as storage?** It bounds the index each user's search runs over, which keeps the vector query fast as tenure grows.
3. **Why is summarising every ~15 turns a cost decision?** Each fold is an extra model call; at the assumed 30 turns a day it adds about 7% more calls.
4. **What key does each scope use?** `thread_id` for the conversation, `session_id` with a TTL for the session, `(semantic, user_id)` plus a stable key for facts, `(episodic, user_id)` plus a fresh key for tasks.
5. **Why does trimming the prompt not shrink the database?** Trimming filters what the model sees; only an explicit removal or a retention policy deletes stored history.
6. **"Call me Sam" is said twice. One row or two?** One, if the key is `preferred_name`; two, if each write gets a random key.
7. **What happens when a new preference contradicts an old one?** Overwrite, keep the old value one version back with its date, so the change is answerable.
8. **"Book a window seat this time." Semantic or episodic?** Episodic; it becomes semantic only if restated as a standing preference.
9. **Why can every memory write leave the critical path?** The fact is already in the thread checkpoint, so only the cross-conversation copy lags, by seconds.
10. **Where must `user_id` come from, and why?** The server-side auth session; anything the model can set, a prompt can set.
11. **How would you test that memory works?** Plant a fact, ask 20 turns later and in a new conversation; score recall, false memories and cost.
12. **What is the sixty-second cost answer?** Storage is cheap; the model calls to write memory and the tokens to read it back are not. Retrieve a few memories, summarise in steps, extract with a small model after the reply.

## References

### Fact-check sources (checked 27 Sep 2026)

- [LangGraph `TTLConfig` source](https://github.com/langchain-ai/langgraph/blob/main/libs/checkpoint/langgraph/store/base/__init__.py): `refresh_on_read` gives sliding expiry; `omit_expired` defaults to off; sweeping deletes expired items
- [LangGraph `SqliteStore` source](https://github.com/langchain-ai/langgraph/blob/main/libs/checkpoint-sqlite/langgraph/store/sqlite/base.py): `get` does not filter expired rows; `sweep_ttl` and `start_ttl_sweeper` delete them
- [LangGraph `PostgresStore` source](https://github.com/langchain-ai/langgraph/blob/main/libs/checkpoint-postgres/langgraph/store/postgres/base.py): optional `omit_expired` read filter; the sweeper must be started explicitly
- [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560): the model edits its own memory through function calls

