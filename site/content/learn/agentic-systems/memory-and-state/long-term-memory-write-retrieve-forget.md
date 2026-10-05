# Long-Term Memory: Write, Retrieve, and Forget

*A stored fact can help a later answer or quietly contradict it, so long-term memory is won or lost when it is written, not when it is searched.*

◷ 11 min

Most teams start long-term memory at the vector index; start at the write policy instead. This lesson follows a fact through its life, written, read and eventually forgotten, using the memory kinds from [Types of Memory](/learn/agentic-systems/memory-and-state/types-of-memory).

**Objectives:**

- decide what earns a long-term write, and key it so it updates instead of duplicating;
- design a bounded, scoped, attributable read path;
- plan decay, consolidation and time-aware lookups so old facts fade or stay correct.

---

## Treat Memory as a Write Problem

The tempting design embeds every conversation turn and lets retrieval sort it out. After six months that store is full of low-value fragments. Retrieval returns plausible-looking noise. The agent confidently recalls a preference the user withdrew months ago.

Retrieval cannot return a better answer than the one that was stored. So the leverage is at write time. Store conclusions with their source attached: a fact, the date it was confirmed, and the ticket it came from. Do not store raw transcript fragments. When an interviewer asks "how would you design agent memory?", open with the write policy, not the vector index.

## Pass Four Gates Before Writing

A candidate memory should pass four checks before it is stored. Is it **durable**, still true next month rather than only now? Is it **reusable**, something a future run would read? Is it **attributable**, with a source, a timestamp and a confidence? Is it **permitted**, outside regulated categories such as health, payment and government IDs? Failing any of the first three means drop it. Failing the last means reject or redact it.

Enforce the permitted check on the write path. By the time a regulated fact is read, it is already stored, and the read path is too late.

Module 9 adds the signals that flag a candidate. Phrases like "I always prefer" or "please remember" are worth keeping, and so are decisions and action items. Small talk is not. A light classifier or extraction step saves the keepers into a structured memory store. Write each one as a typed record, subject, predicate and value, never as a raw turn. Leave raw intermediate tool outputs and one-off task details out of long-term memory unless the user restates them as a standing preference.

## Key Each Fact by What It Is

A checkpointer remembers only within one `thread_id`. To remember a person across conversations, LangGraph gives nodes and tools a `Store`: a namespaced key-value and search layer independent of thread state. Writes go to a namespace tuple that includes the user ID, so any thread for the same user can read them back.

```python
def call_model(state, config, *, store: BaseStore):
    user_id = config["configurable"]["user_id"]
    namespace = ("memories", user_id)
    memories = store.search(namespace)
    info = "\n".join(d.value["data"] for d in memories)
    ...
graph.invoke({"messages": [HumanMessage("Remember my name is Alice.")]},
             config={"configurable": {"user_id": "user123", "thread_id": 1}})
graph.invoke({"messages": [HumanMessage("What is my name?")]},
             config={"configurable": {"user_id": "user123", "thread_id": 2}})   # recalls "Alice"
```

`thread_id` answers "which conversation"; the namespace answers "which person". A system with only the first cannot remember anyone between sessions.

The key inside the namespace matters as much. Write a semantic fact under a stable key derived from what it is, so re-saving overwrites:

```python
@tool
def save_user_fact(key: str, value: str) -> str:
    """key like 'name' or 'preferred_language' — reused key overwrites, doesn't duplicate."""
    store = get_store()
    store.put(("semantic", _CURRENT_USER), key, {"value": value})
    return f"Saved {key}."
```

| Option | Costs | Buys | Pick when |
|---|---|---|---|
| Fresh key per write, e.g. `uuid4()` | Duplicate facts pile up silently | Simplest write path, no lookup first | Append-only records where repeats are expected (episodic) |
| Stable, reused key | Key space designed up front | Re-saving a fact overwrites it | Durable facts about an identity (semantic) |

If a fact can change, its key must be stable. If it is a fresh event, a fresh key is right. Mixing these up is how semantic memory quietly turns into episodic memory.

> **Warning: a fresh random key on every save duplicates facts.** Ask an agent to "remember X" three times with `store.put(namespace, str(uuid.uuid4()), ...)` and the store holds three rows, not one. A later read may return the stale one first.

When a new fact contradicts an old one on the same predicate, **supersede** the old one rather than deleting it. Keep it with a pointer to its replacement, so the system can still explain why it believed the old value at the time. A small history per key also makes "you told me X last month, now Y" answerable.

## Worked Example: The Retracted Vendor Instruction

The agentic design book describes a scheduling assistant. In January a user told it always to book travel through one vendor. In February the firm switched vendors, and the user said so. Through May, the assistant still proposed the original vendor about one time in four.

Both statements had been stored as separate episodic entries. Retrieval returned whichever was more similar to the current request, and the January wording often ranked higher. Nothing linked the two entries, because neither had been turned into a fact about the same predicate.

The fix had three parts. Extract typed facts, so contradicting statements about one predicate collide by construction. Supersede the older fact instead of letting both coexist. Add an evaluation suite that seeds contradictory histories and checks that the newer fact wins, and make it part of the release gate.

The lesson generalises: a contradiction that is never stored as a contradiction can never be resolved at read time.

## Bound Every Read

Every memory read should be **bounded by tokens**, **scoped by tenant**, and **attributable to a source**. Without those three, memory becomes a source of randomness in the prompt.

The book's read path runs dense (embedding) search and lexical BM25 search in parallel, each filtered by tenant inside the store. It fuses the two candidate lists, drops superseded facts, loads the remaining facts with their provenance, and packs them under a token limit. Fuse by **rank**, not raw score. Cosine similarity and BM25 sit on scales that cannot be compared, and BM25 scores drift as the corpus grows. Reciprocal rank fusion scores each item as the sum of `1/(k + rank)` across lists, with `k = 60` as the usual default. Only position matters, so the result stays stable when either index is retuned.

Module 9 frames the same job as **retrieval gating**: keep irrelevant memories out with a similarity filter, recency weighting, usefulness scoring, and a top-k cap. Its example score is about 0.6 × similarity + 0.25 × recency + 0.15 × usage frequency. Its query pattern runs a vector search with metadata filters (agent, memory type, last 90 days), takes the top 20, re-ranks them by that combined score, and keeps the best 10.

The two sources pull in slightly different directions. The book warns against weighted sums of raw scores on different scales; Module 9's re-rank is a weighted sum of different signals. Module 9 presents its weights as an example, not a rule. Fuse search lists by rank, and treat any weighted re-rank as something to measure.

Module 9 also gives the storage layout behind this read path. Each memory has metadata in a relational table: agent ID, user ID, `memory_type`, created and last-accessed times, access count, relevance score, tags. Its full text sits in a document store and its embedding in a vector database. Vector search answers open questions such as "find memories relevant to this situation". Structured queries answer exact ones such as "all decisions about project X in the last 30 days".

One scaling note from the interview tutorial: an unfiltered `store.search()` over a namespace scans everything the user has saved. That works with 10 memories and fails with 10,000. Configure an embedding index on the store and pass a real query. For how vector search works underneath, see [T2.3 Chunking and indexing](/learn/llm-and-retrieval/chunking-and-indexing).

## Forget on a Schedule

Facts should fade on a schedule, not accumulate forever. Module 9 warns about four risks of storing too much. **Context contamination:** old and new facts conflict, so more memory means a noisier signal. **Compounding errors:** a wrong conclusion saved once is reused until it becomes a false belief. **Cost and noise:** top-k over millions of memories costs more and returns marginal results. **Privacy:** sensitive information kept forever can resurface in the wrong context.

Three mechanisms bound it.

**Decay.** Score each fact on salience that decays with age, using a configurable half-life such as 90 days, unless it keeps being retrieved and used. Module 9 describes the same idea as scoring by similarity and recency of use. Decay per predicate, not globally: a customer's tier barely ages, while this week's on-call engineer ages fast.

**Consolidation.** Run a background job, off the request path, that clusters episodic facts by subject and predicate. It resolves contradictions, merges duplicates, marks old facts superseded, and distils many episodes into stable semantic traits.

**Retention.** Episodic memory has no natural ceiling, because every completed task is a fresh write. Apply a time-to-live or keep the most recent N per user. The interview tutorial's worked design keeps the most recent 100 episodes per user and summarises older ones into a rolling digest rather than deleting them. Module 9 adds two human controls: let users inspect and delete their memories, and audit memories for accuracy.

At millions of episodic observations these become one lifecycle. Working memory is discarded at the end of the session. Nearline episodic memory keeps a vector index and a fact log with recency decay. An offline semantic profile holds batch-distilled, consolidated traits. Data moves down the tiers as it ages.

## Record When a Fact Was True, Not Just When It Was Saved

A fact has two timelines. **Valid time** is the real-world interval in which it was true. **System time** is when the database recorded it. Mix them up and an agent asked "who was the lead architect in Q3 2024?" answers with today's architect.

Store both on every fact. At query time, filter so the target time falls inside the fact's valid interval and the system had recorded the fact by then. A more similar but out-of-period fact is skipped. This removes historical anachronisms by construction and does not slow the embedding search. In an interview, "valid time versus system time" is a sharper answer than "we would add a timestamp".

---

## Key Takeaways

- Retrieval cannot beat what was stored, so design the write policy first and store sourced conclusions, not transcripts.
- Gate every write on durable, reusable, attributable and permitted, and enforce regulated categories on the write path.
- Namespace long-term memory by user and key semantic facts by what they are; supersede contradictions instead of deleting them.
- The retracted-vendor case shows that contradictions must collide at write time to be resolvable at read time.
- Bound every read by tokens, scope it by tenant inside the store, keep provenance, and fuse search lists by rank.
- Forget on purpose: decay per predicate, consolidate offline, and cap episodic growth.
- Store valid time and system time, and filter on both for questions about the past.

## Check Yourself

1. **The same user states the same preference twice. Does the store end up with one row or two?**
   One, if the fact is written under a stable key such as `preferred_language`. Two, if each write uses a fresh `uuid4()` key.

2. **Why fuse dense and lexical results by rank rather than by a weighted sum of their scores?**
   Their scales cannot be compared and BM25 scores drift as the corpus grows. Reciprocal rank fusion uses only position, so it stays stable across reindexing.

3. **A user has been active for a year. What does their episodic memory look like, and what keeps it bounded?**
   Without a policy, it grows with every task. Bound it with a TTL or a most-recent-N cap, decay by salience, and offline consolidation into semantic traits.

## References

**Sources:** `ch07_knowledge_memory_retrieval.md` (*Cracking Agentic AI System Design Interviews*, Ch. 7): "Memory Is a Write Problem", "The Write Policy", "The Retrieval Contract", "Consolidation, Decay, and Forgetting", "Hierarchical Memory Compaction and Lifecycle Garbage Collection" and "Bitemporal Memory", summarised in our own words. `07_memory_and_state_INTERVIEW_TUTORIAL.md`: §1.6 "Cross-thread long-term memory", §1.7 code, "Coverage gaps", §2 gotchas "A fresh random key on every write" and "Episodic memory grows without bound", §3 trade-off "Fresh-key writes vs. stable-key update-in-place", §6 worked answer. `Module_09_Memory_Databases_Caching_for_GenAI_Systems.md`: Topic 1 "How does the system remember important facts and forget the rest?"; Topic 5 "How do I design persistent memory and retrieval rules for a long-running agent?", "What is the risk of storing too much memory?" and "How do I combine vector search and structured databases for agent memory?".
