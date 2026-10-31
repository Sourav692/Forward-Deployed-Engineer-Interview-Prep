# Personal Assistant With Memory, part 2

## 7. Write Facts in Place and Events by Appending

Derive a fact's key from what the fact is, and an event's key from nothing at all. Re-stating "call me Sam" should update one row, not add a second. A fresh random key per write guarantees nothing ever overwrites.

The study guide states the rule as a pair. If a fact can change, its key must be stable. If a fact is a fresh event, a fresh key is correct. Mix them up and semantic memory quietly turns into a pile of duplicate facts.

**Handle a conflict explicitly.** The source answer overwrites the existing key and keeps the previous value one version back. That makes "you told me X last month, now Y" answerable instead of silently lost. Add a timestamp and the source turn to each value, so the assistant can say when it learned something *(own construction)*.

**Name what is not persisted.** The source answer keeps raw intermediate tool outputs and one-off task details in short-term or episodic memory only. They are promoted to semantic memory only when the user restates them as a standing preference. "Book me a window seat this time" is an episode. "I always want a window seat" is a fact.

Decide who chooses what to write *(own construction)*. A hard-coded rule is predictable but misses facts it did not anticipate. A model-driven writer, in the style of MemGPT's self-editing memory tools, catches more but can misjudge what is durable. Use a model extractor behind a policy filter. The model proposes; the policy decides which categories may be stored at all. Run the extractor on the write queue, never on the reply path.

## 8. Prune Episodes Into a Digest, Not Into Nothing

Cap episodic memory per user, because nothing else will. Every completed task is a fresh append with no natural ceiling, so a year-long user's row count only climbs. The source answer keeps the most recent 100 per user and folds older ones into a rolling digest rather than deleting them outright.

The digest keeps the gist of older activity at a fixed size. "Booked four trips to Lisbon this year" survives even after the four booking episodes are pruned *(own construction)*. The pruner runs as a background job on the write path, so pruning never costs a reply any latency.

Session memory needs the same discipline in a different form. A TTL marks entries for expiry, and sliding expiry extends the session on activity. The gotcha is that, in the LangGraph store, expiry is enforced by a sweep, not checked on every read. An expired entry can still be returned until the sweeper runs. That is true of `SqliteStore` and of `PostgresStore` by default; Postgres can set `omit_expired` to hide expired rows on read, and `InMemoryStore` has no TTL at all (checked Sep 2026). Schedule the sweeper, or check the entry's age if a few seconds of staleness matter.

## 9. Search With an Index, Not a Scan

Search long-term memory by relevance, because a scan's cost grows with how much has been stored. An unfiltered scan over a namespace is invisible at 5 facts and slow and noisy at 500. The source answer puts an embedding index on the semantic and episodic namespaces. Recall at 1,000+ saved items then becomes a vector query instead of a full scan, which keeps p95 under 300ms as history grows.

Many simple memory demos skip this. Their long-term search is an unfiltered scan or a similarity check by the model, with no real embedding index. That is the difference between working with 10 memories and working with 10,000.

Use each search shape for what it does best *(own construction)*:

| Worry | Search shape |
|---|---|
| What is this user's time zone? | Get by stable key; no search at all |
| What did I book for them last week? | Vector search on episodes, filtered by `user_id`, sorted by recency |
| Who is the manager of the person who organised that trip? | Graph memory: triples and a bounded-hop traversal |
| Did they ever mention a peanut allergy? | Keyword or field lookup, because exact recall matters more than similarity |

Semantic facts for one user are few, about 50 in the sizing, so fetch them all by key. Search is for episodes. Graph memory earns its extraction cost only when answers chain facts never stated together, so mention it and do not build it by default.

## 10. Spend the 300 ms Budget Deliberately

Budget memory like any other dependency, because a slow memory read can dominate p95 as easily as a slow retriever. The prompt allows 300ms added at p95. Spend it on reads in parallel and move every write after the reply.

A budget that fits *(own construction; figures are assumptions)*:

| Step | p95 assumption | Critical path? |
|---|---|---|
| Resolve `user_id` from the auth session | 5 ms | Yes |
| Embed the query for episode search | 40 ms | Yes, in parallel with key reads |
| Episode vector search, filtered by user, top-k | 60 ms | Yes, after the embedding |
| Semantic facts, digest, session state by key | 15 ms | Yes, in parallel |
| Thread checkpoint load | 20 ms | Yes, in parallel |
| Context assembly | 10 ms | Yes |
| **Critical-path total** | **≈ 115 ms** (5 + 40 + 60 + 10) | Leaves headroom for tail latency |
| Fact extraction, episode embed and index, summary fold, pruning | 1–3 s | No: queued after the reply |

A fact said in this thread is already in the checkpoint, so the long-term write can lag by seconds without anyone noticing. That is why every write can leave the critical path. The only freshness promise that matters is cross-conversation, and a queue that drains in seconds meets it.

Put timeouts on each read. When episode search misses its timeout, answer without it and log the miss rather than blowing the budget *(own construction)*.

## 11. Take `user_id` From Auth, Never From the Model

Read the isolation key from the server-side session on every request, because anything the model can set, a prompt can set. The source answer says `user_id` comes from server-side session or auth config, never from a tool-call argument the model could set. Every namespace tuple includes it.

The study guide's debugging advice follows. When two users see each other's memories, audit namespace derivation first. The usual cause is a `user_id` sourced from the wrong place. A `thread_id` used by mistake as the long-term namespace causes the opposite bug: memory collapses back to per-conversation.

Channels have to agree on identity before memory can be shared. A web app and a chat bot both need to resolve to the same `user_id` at the identity layer. The memory system does not care which channel wrote a fact.

Governance follows from the same design *(own construction, building on the FDE track questions)*:

| Governance ask | Design answer |
|---|---|
| What does the assistant know about me? | Query the namespaces directly and show the rows, not the model's summary of itself |
| Forget that I said X | Delete the semantic key and its prior version; scrub matching episodes and the digest |
| Delete my account | The deletion job clears checkpoints, session state, facts, episodes, digest, vectors and caches, then confirms |
| How long is each thing kept? | Named per scope: thread retention, session TTL, facts until changed, newest 100 episodes |
| EU data stays in the EU | The residency map pins the user's stores to a region; the index is sharded by user, so it follows |

## 12. Measure Recall, Not Fluency

Measure whether the assistant remembers, not whether it sounds as if it does. A fluent answer that invents a preference is worse than one that asks again. Few worked examples cover memory-quality evaluation, so building it is the strong move.

The harness comes from the study guide's take-home. Plant a fact early in a long synthetic conversation. Ask for it 20 turns later. Score full history, sliding window and summarisation against each other on recall and cost. Extend it across conversations for this design: plant in thread A, ask in thread B a simulated week later *(own construction)*.

| Worry | Metric that answers it |
|---|---|
| Does it recall what it should? | Recall of planted facts, same thread and across threads |
| Does it invent what it never heard? | False-memory rate: answers that assert a fact never stated |
| Did the summary drop something that mattered? | Recall of planted facts after a summary fold |
| Does it duplicate facts? | Rows per stable key per user; should be exactly 1 |
| Is episode search finding the right task? | Recall@k on labelled "which task did I mean" questions |
| Is memory within budget? | Added latency p95 per store and in total |
| Is it isolated? | Cross-user read tests at zero, run before every release |
| Is growth bounded? | Episodes per user at the cap; prompt tokens per turn flat past the threshold |

Every metric except the last two is *own construction* built on the study guide's recall harness. Gate changes to the extraction prompt, summary threshold or cap on this suite, because each one changes what the assistant remembers.

## 13. Name the Failure Modes Before They Do

Volunteer how the design breaks, because a design with no failure modes has not been examined. Most of these come from the study guide's gotchas and FDE questions; the rest are *(own construction)*.

| Failure | Symptom | Fix |
|---|---|---|
| Random key per write | "Remember X" three times makes three rows | Key facts by what they are |
| Trimmed prompt, untrimmed store | Storage grows while prompts look bounded | Retention policy on checkpoints |
| Summary reset by stray input | The running summary never accumulates | Pass only fields meant to overwrite; add a merge rule |
| Unbounded episodes | A year-long user's search slows and gets noisy | Cap at 100, fold into the digest |
| Scan instead of index | Fine at 5 facts, slow at 500 | Embedding index with a user filter |
| `user_id` from the model | One user reads another's facts | Identity from auth only |
| Expired session still readable | A read returns an entry past its TTL | Scheduled sweeper, or check age on read |
| Stale preference wins | Assistant uses last month's value | Overwrite with one version kept; ask when a new statement contradicts an old one *(own construction)* |
| Extractor over-stores | Transient details become "facts" | Policy filter on categories; promote only restated preferences |
| Memory poisoning *(own construction)* | Text from an email or web page is saved as a user preference | Write only from the user's own turns; never from tool output |

## 14. Score Yourself Against the Rubric

Use the source's rubric as the checklist for the answer, because it is the only scored artefact the source gives for this prompt. Each line points to where this page answers it.

| Rubric item (verbatim from the source) | Answered in |
|---|---|
| Separates thread-scoped short-term memory from user-scoped long-term memory, and names the isolation key for each | Section 5 |
| Distinguishes semantic (stable facts), episodic (past tasks), and possibly session memory, with a different write/read pattern for each | Section 5 table |
| Bounds growth: a retention/pruning policy for episodic memory, stable keys for semantic memory | Sections 7 and 8 |
| Names a real search mechanism (embedding index + query) for long-term recall, not an unfiltered scan | Section 9 |
| Addresses the latency budget for memory reads/writes explicitly, not just for the LLM call | Section 10 |
| States the isolation guarantee: where `user_id` comes from, and that it's never model-controlled | Section 11 |
| Says what happens when memory conflicts (an old preference contradicts a new one) — not left unhandled | Section 7 |
| Names what's NOT persisted (transient task details that don't deserve a long-term write) | Section 7 |

The source's strong answer, compressed to one line per point with its figures intact:

| Point | Source answer |
|---|---|
| Short-term | Durable checkpointer keyed by `thread_id`; a summary node folds the buffer once it crosses ~15 turns |
| Semantic | Namespace `("semantic", user_id)`, stable keys like `"timezone"` and `"preferred_name"`, overwrite in place |
| Episodic | Namespace `("episodic", user_id)`, one append per completed task, pruned to the most recent 100, older ones summarised into a rolling digest |
| Search | Embedding index on both namespaces, so recall at 1,000+ items is a vector query; this keeps p95 under 300ms |
| Isolation | `user_id` from server-side session or auth config on every request, never from a tool-call argument |
| Conflicts | Overwrite, with the previous value kept one version back |
| Not persisted | Raw tool outputs and one-off task details, unless restated as a standing preference |
