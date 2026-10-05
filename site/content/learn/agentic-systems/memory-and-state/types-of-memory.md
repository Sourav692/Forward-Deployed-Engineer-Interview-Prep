# Types of Memory

*One table for everything the agent remembers is simple to build, but facts, events and instructions each need their own store, write rule, and way of failing.*

◷ 6 min

"Long-term memory" is not one thing. Sort every remembered item by what it is for, then give each kind its own write rule and store, building on the scopes in [Why Agents Need State](/learn/agentic-systems/memory-and-state/why-agents-need-state).

**Objectives:**

- name four kinds of memory and the write rule, store and failure that go with each;
- explain why enterprise knowledge is retrieval, not memory;
- translate between the vocabularies used by the four source documents.

---

## Start From What an Item Is For

Three remembered items show the split. "Alice prefers concise answers" is a durable fact about a person. "This task succeeded this way last time" is a record of an event. "Always check the refund window before issuing a refund" is an instruction that changes how the agent behaves.

These need different write rules. The fact should overwrite itself when it changes. The event should append a new record every time. The instruction should change only after someone approves it. A single update rule cannot fit facts that overwrite, events that append, and instructions that need approval. Put them in one table with an extra column and that discipline becomes impossible to hold.

## Use Four Kinds of Memory

The sources converge on four kinds. The table merges their descriptions.

| Kind | Holds | Natural read | Write rule | Storage fit | Typical failure |
|---|---|---|---|---|---|
| Working | This step of this run: task, plan, tool results so far, current step | Assembled directly into the prompt | Replace finished steps with short summaries | The context window itself | Overflow; eviction that deletes instructions |
| Episodic | Past runs and tasks for this user | Similarity plus recency | Append a fresh record per completed task | A vector index over documents, or an append-only namespace | Unbounded growth, noisy retrieval |
| Semantic | Durable facts about a user or entity | Exact key lookup plus filter | Update in place under a stable key; supersede contradictions | Relational or property-graph store; a store with stable keys | Stale facts, unresolved contradictions |
| Procedural | How to do tasks: instructions, playbooks, skills | Match by task signature | Versioned, and promoted only through a gate | A versioned artifact registry | Promotion without a gate |

Working memory is the context window, so it belongs to the turn scope. The other three outlive the turn. Episodic and semantic memory usually live at the user scope. [Long-Term Memory: Write, Retrieve, and Forget](/learn/agentic-systems/memory-and-state/long-term-memory-write-retrieve-forget) covers how each is written and read. [Advanced Memory Architectures](/learn/agentic-systems/memory-and-state/advanced-memory-architectures) covers richer forms of procedural memory.

> **Warning: a vector store cannot pick the one correct value.** Some facts have exactly one right answer, such as a customer's tier or a contract's renewal date. Similarity search returns several plausible candidates and has no way to choose between them. Store those facts for exact lookup by key, not for nearest-neighbour search. "Why not put everything in a vector store?" is a common follow-up, and this is the answer.

## Keep Enterprise Knowledge Out of Memory

The FDE Handbook's customer-support design names three layers. Two of them are memory. The third is not.

| Layer | Holds | Example | Fails how |
|---|---|---|---|
| Short-term (conversational) | Context within the current session | "Where's my package?" then "Can you refund *it*?" | Lost context, so the agent asks again |
| Long-term (customer) | Preferences and history across sessions | Preferred language, channel, previous purchases, past support interactions | A stale preference, so personalisation is mildly wrong |
| Enterprise knowledge | Product docs, policies, FAQs, troubleshooting, served by RAG | "What is your refund policy?" | An outdated policy document, so the answer is wrong and possibly contractual |

The common mistake is to merge the second and third layers. Both feel like "things the system knows". But they fail in different ways, at different costs, and are refreshed on different schedules. A stale preference makes personalisation mildly wrong; an outdated policy makes an answer wrong in a way that can bind the business. Keep enterprise knowledge in the retrieval layer and customer memory in a per-user store. Merging them makes both harder to fix.

## Translate Between the Source Vocabularies

The four sources behind this module use different words for overlapping ideas. Read this table when a term in one source does not match another.

| This module says | FDE Handbook layers | *Cracking Agentic AI System Design Interviews*, Ch. 7 | Memory and state interview tutorial | GenAI Engineering Module 9 |
|---|---|---|---|---|
| Working memory | Part of "short-term (conversational)" | Working tier | What reaches the model after trimming | Short-term memory, the context window (Topic 1); working memory (Topic 5) |
| Thread history | Short-term (conversational) | Not named as a tier | Short-term memory, checkpointer by `thread_id` | Long chat histories (Topic 1) |
| Session memory (time-limited) | Not used | Not used | Session memory, TTL-scoped by `session_id` | "Session state" means something else: a structured summary of preferences and decisions |
| Episodic memory | Part of "long-term (customer)": past interactions | Episodic tier | Episodic: one fresh record per task | Episodic memory: history of past tasks |
| Semantic memory | Part of "long-term (customer)": preferences | Semantic tier | Semantic: stable key, update in place | Semantic memory: general learned knowledge |
| Procedural memory | Not used | Procedural tier: versioned, evaluation-gated | Procedural: versioned, approval-gated | Procedural memory: strategies for doing tasks |
| Enterprise knowledge | Enterprise knowledge, served by RAG | Not a memory tier | Not covered | Not a memory type |

## Note Where the Sources Disagree

Three differences are worth knowing before an interview.

**Where semantic facts live.** The agentic design book puts single-valued facts in a relational or graph store and warns against a vector store. Module 9's first topic lists a vector database plus a relational database for long-term memory, and fetches memories by vector similarity. Module 9's fifth topic resolves this itself: vector search for "find memories relevant to this situation", structured queries for exact questions. Use both, each for its own question.

**What "semantic" means.** The book and the interview tutorial use it for durable facts about an identity. Module 9 uses it for general learned knowledge. Say which you mean.

**What gates procedural memory.** The interview tutorial gates a procedural change on human approval. The book gates it on an evaluation. Both agree on the principle: nothing becomes behaviour without a gate.

## Worked Example: Sorting a Support Agent's Memories

Take the support agent from [Why Agents Need State](/learn/agentic-systems/memory-and-state/why-agents-need-state) and sort what it encounters.

"Can you refund *it*?" needs the earlier turn. That is thread history, read straight into working memory. The customer's preferred language is a semantic fact; it goes under a stable key such as `preferred_language`, so restating it overwrites rather than duplicates. Last week's support interaction is an episode; it is appended as a fresh record and read back by recency and similarity. "Always check the refund window before X" is procedural; it changes only through a gate. "What is your refund policy?" is not memory at all; it is a retrieval question against the policy documents.

Five items, five homes. Each home was chosen by asking what the item is for and how it fails when it goes stale.

---

## Key Takeaways

- Sort each remembered item by what it is for: a fact, an event, or an instruction.
- Use four kinds of memory, working, episodic, semantic and procedural, each with its own write rule, store and failure.
- Enterprise knowledge is retrieval, not memory, because it fails and refreshes differently from customer memory.
- The four sources name these kinds differently; translate before comparing.
- The sources disagree on where semantic facts live, what "semantic" means, and what gates procedural memory.

## Check Yourself

1. **Why should a customer's renewal date not be stored only in a vector index?**
   It has exactly one correct value. Similarity search returns several plausible values with no way to choose. Store it for exact key lookup.

2. **Why should enterprise knowledge never be stored in the same place as customer memory?**
   They fail differently and refresh on different schedules. A stale preference mildly mis-personalises; an outdated policy gives a wrong, possibly contractual answer.

3. **Give the write rule for semantic, episodic and procedural memory.**
   Semantic: update in place under a stable key. Episodic: append a fresh record per task. Procedural: versioned, and changed only through an approval or evaluation gate.

## References

**Sources:** `02_State_Memory_Sessions.md` (FDE Handbook): "The three layers of memory". `ch07_knowledge_memory_retrieval.md` (*Cracking Agentic AI System Design Interviews*, Ch. 7): "The Four Memory Tiers", summarised in our own words. `07_memory_and_state_INTERVIEW_TUTORIAL.md`: §1.7 "The memory taxonomy" and §1.8 "Session memory". `Module_09_Memory_Databases_Caching_for_GenAI_Systems.md`: Topic 1 "How do I design short-term and long-term memory for an agent?" and Topic 5 "How do I design persistent memory and retrieval rules for a long-running agent?" and "How do I combine vector search and structured databases for agent memory?".
