# Practise Memory and State Interview Questions

*A memory answer that names every technology still fails if it never says which scope a fact belongs to and how it is bounded.*

◷ 12 min

Interviewers rarely ask "what is episodic memory?"; they describe a symptom and wait for a scope, a key and a bound. Answer each prompt below out loud first, then compare with the outline and reread the lesson it points to.

**Objectives:**

- answer the common memory and state prompts in under a minute each;
- lead every answer with the scope and the isolation key;
- work through a full memory design against a scoring rubric.

---

## Lead With the Scope, Then the Bound

Most memory questions have the same skeleton. Say which scope the fact lives in: turn, thread, session or user. Say what keys it and where that key comes from. Say what stops it growing or going stale. Then, only if asked, name the technology.

An answer without a scope cannot be checked. "We'd store it in a vector database" leaves the interviewer to guess what is stored, for whom, and for how long. The outlines below follow the skeleton.

## Practise the State and Scope Questions

**1. "How do you handle state across turns?"**
Name the three scopes and where each lives. Run state is local. Thread state is keyed by conversation ID in a shared store, so any worker can resume. User memory is a separate, per-user store. Then add the checkpointer and what it buys: crash recovery and human-in-the-loop pauses. Close with the line that enterprise knowledge is not memory at all. → [Why Agents Need State](/learn/agentic-systems/memory-and-state/why-agents-need-state)

**2. "What is the difference between an agent's context window and its memory?"**
The context window is what the model sees on this call, and it is bounded and rebuilt every turn. Memory is the durable layer outside it: a checkpointer, a store, an index. Treating the window as storage is why an agent forgets something said minutes ago once the window fills. → [Short-Term Memory and the Context Window](/learn/agentic-systems/memory-and-state/short-term-memory-and-the-context-window)

**3. "How do session memory and long-term semantic memory differ in practice?"**
Session memory has a time-to-live and can span several threads within that window, keyed by `session_id`. Semantic memory has no expiry and is keyed by identity. Mention that sliding versus fixed expiry is a product decision. → [Why Agents Need State](/learn/agentic-systems/memory-and-state/why-agents-need-state)

**4. "Design the memory for a customer-support agent used across many separate sessions."**
Separate scopes for separate questions. A checkpointer by `thread_id` for the live conversation. A per-user store for durable facts such as plan tier and past issues. A TTL-scoped session layer if the product has a login session in between. Keep the policy documents in retrieval, not memory. Naming each fact's scope out loud is what the question tests. → [Types of Memory](/learn/agentic-systems/memory-and-state/types-of-memory)

## Practise the Memory-Type Questions

**5. "Why do you need three long-term memory types instead of one table with an extra column?"**
Each type has a different write rule. Semantic facts update in place under a stable key. Episodes append. Procedural instructions change only through a gate. One table makes it impossible to hold all three disciplines at once. → [Types of Memory](/learn/agentic-systems/memory-and-state/types-of-memory)

**6. "Why not put everything in a vector store?"**
Some facts have exactly one correct value, such as a renewal date. Similarity search returns several plausible values and cannot choose. Use exact key lookup for those, and vector search for open "what is relevant here?" questions. → [Types of Memory](/learn/agentic-systems/memory-and-state/types-of-memory)

**7. "Why should enterprise knowledge never live in the same store as customer memory?"**
They fail differently and refresh differently. A stale preference makes personalisation mildly wrong. An outdated policy gives a wrong, possibly contractual answer. Keep knowledge in the retrieval layer and customer memory in a per-user store. → [Types of Memory](/learn/agentic-systems/memory-and-state/types-of-memory)

## Practise the Short-Term Memory Questions

**8. "How is memory different in LangGraph from classic LangChain chains?"**
Classic `Memory` classes read and write prompt variables around one chain call, with no cross-thread or resumable story. A LangGraph checkpointer persists the whole graph state. That same mechanism enables human-in-the-loop pauses and time travel. Memory becomes a side effect of general persistence. → [Short-Term Memory and the Context Window](/learn/agentic-systems/memory-and-state/short-term-memory-and-the-context-window)

**9. "Your running summary keeps resetting between turns. Why?"**
The `summary` field has no reducer, and the next `invoke()` passed `"summary": ""` as input, overwriting the stored value. Pass only fields you mean to overwrite, or add a reducer. → [Short-Term Memory and the Context Window](/learn/agentic-systems/memory-and-state/short-term-memory-and-the-context-window)

**10. "How would you measure whether summarisation drops something that mattered?"**
Build an evaluation set of long conversations, each with a fact planted early and a question about it later. Check recall after summarisation. The same set lets you compare summarisation with a sliding window on task success, cost and latency, using conversations long enough to show the difference. → [Short-Term Memory and the Context Window](/learn/agentic-systems/memory-and-state/short-term-memory-and-the-context-window)

**11. "What is the cost driver in summarisation-based memory?"**
One extra model call per compression trigger, on top of the normal per-turn call. In return, the prompt stays bounded indefinitely. → [Short-Term Memory and the Context Window](/learn/agentic-systems/memory-and-state/short-term-memory-and-the-context-window)

## Practise the Long-Term Memory Questions

**12. "How do you decide what is worth writing to long-term memory?"**
Lead with the write policy. A candidate must be durable, reusable, attributable and permitted. A durable, identity-level fact earns a write; a one-off task detail does not, unless it recurs. Name the rule, whether a model calls a memory tool or a fixed rule decides. → [Long-Term Memory: Write, Retrieve, and Forget](/learn/agentic-systems/memory-and-state/long-term-memory-write-retrieve-forget)

**13. "A long-running agent's memory keeps growing. How do you stop it becoming a liability?"**
Bound growth per type. Windows or summaries for short-term memory. Retention caps, decay and consolidation for episodes. Stable keys for semantic facts, so they never duplicate. Unbounded memory is first a cost problem and then a correctness problem: which of 40 saved facts is still true? → [Long-Term Memory: Write, Retrieve, and Forget](/learn/agentic-systems/memory-and-state/long-term-memory-write-retrieve-forget)

**14. "Memory reads are on the request's critical path. Where is the latency risk?"**
An unfiltered `store.search()` scales with how many memories exist, not with relevance, so it slows as a user's history grows. Add an embedding index and a real query, or partition and prune the namespace. Budget the memory lookup like any other dependency. → [Long-Term Memory: Write, Retrieve, and Forget](/learn/agentic-systems/memory-and-state/long-term-memory-write-retrieve-forget)

**15. "A preference from a month ago contradicts what the user just said. What does your system actually do?"**
Both statements are about the same predicate, so they must collide as typed facts under one key. The new value supersedes the old, which is kept one version back with a pointer. Then "you told me X last month, now Y" is answerable, and an evaluation that seeds contradictory histories proves the newer fact wins. → [Long-Term Memory: Write, Retrieve, and Forget](/learn/agentic-systems/memory-and-state/long-term-memory-write-retrieve-forget)

**16. "How would the agent answer 'who was the lead architect in Q3 2024?'"**
Store valid time and system time on every fact. Filter so the target time falls in the fact's valid interval and the fact was recorded by then. Saying "valid time versus system time" beats "we'd add a timestamp". → [Long-Term Memory: Write, Retrieve, and Forget](/learn/agentic-systems/memory-and-state/long-term-memory-write-retrieve-forget)

> **Warning: "the model decides" is not a write policy.** Interviewers push on what gets stored. Whether a model calls a memory tool or a fixed rule fires, name the rule: what is durable enough, who can see it, and what happens when it is contradicted. An answer that leaves storage to the model's judgement has no write policy to test.

## Practise the Architecture Questions

**17. "When would you use graph memory instead of a vector store?"**
When the answer chains facts that were never stated together, such as "who manages the person who leads the team that built X". Similarity search has no way to combine three separate facts. The cost is an extraction step and graph upkeep; the payoff is an inspectable reasoning path. → [Advanced Memory Architectures](/learn/agentic-systems/memory-and-state/advanced-memory-architectures)

**18. "An agent keeps re-solving the same class of task from scratch. How do you fix it without fine-tuning?"**
Give it procedural memory. Log successful trajectories, abstract the recurring ones into templates or verified skills, and retrieve by structural similarity. Fall back to full planning on a real miss. It changes what is retrieved, not the weights. → [Advanced Memory Architectures](/learn/agentic-systems/memory-and-state/advanced-memory-architectures)

**19. "How does workflow memory change your termination story?"**
A matched workflow runs in one shot, so there are fewer hops. But a structurally similar, wrong match executes the wrong plan just as confidently. Add a fallback for that case. → [Advanced Memory Architectures](/learn/agentic-systems/memory-and-state/advanced-memory-architectures)

## Practise the Production and Customer Questions

**20. "Two threads for the same user report different memories. How do you debug it?"**
Check the namespace and key first. A `thread_id` used as the long-term namespace collapses cross-thread memory into per-thread memory. A `user_id` taken from the model's tool-call arguments lets one user read or corrupt another's facts. Both are namespace bugs, not model bugs. → [Memory in Production](/learn/agentic-systems/memory-and-state/memory-in-production)

**21. "Users report the agent remembers things it shouldn't. What is your first move?"**
Audit every namespace and key derivation. Confirm the isolation key always comes from trusted server-side configuration, and that no path writes to a shared namespace by accident. Enforce the filter in the store or access layer, not only in application code. → [Memory in Production](/learn/agentic-systems/memory-and-state/memory-in-production)

**22. "How do you guarantee the model cannot approve its own procedural-memory change?"**
The proposing tool blocks on `interrupt()`, and the only way to resume is `Command(resume=...)` on the paused thread. No code path lets the model's output supply the approval. → [Memory in Production](/learn/agentic-systems/memory-and-state/memory-in-production)

**23. "The customer wants the agent to remember every conversation with every user, forever. What do you push back on?"**
Ask about retention and compliance requirements before defaulting to unbounded storage. Be ready to say, per namespace, what is stored, its key and its expiry. Unbounded episodic memory is a cost and governance problem, and deletion must reach every derived copy. → [Memory in Production](/learn/agentic-systems/memory-and-state/memory-in-production)

**24. "Explain the cost of long-term memory to a non-engineer."**
Storage is cheap. The real cost is the model calls that extract or summarise what to save, and the calls that answer using it. Cost scales with how often memory is written and searched, not with how much is stored. → [Long-Term Memory: Write, Retrieve, and Forget](/learn/agentic-systems/memory-and-state/long-term-memory-write-retrieve-forget)

## Worked Example: Design a Personal Assistant That Remembers Users for Months

**The prompt.** Design the memory layer for a personal assistant used daily by the same users over months. It must hold a live conversation, recall stable preferences from weeks ago, remember recent tasks, and never mix up two users' data. Keep added memory latency under 300 ms at p95.

**What a strong answer covers.** It separates thread memory from user memory and names each isolation key. It gives semantic, episodic and, where relevant, session memory their own write and read rules. It bounds growth. It names a real search mechanism rather than an unfiltered scan. It budgets memory latency explicitly. It states where `user_id` comes from. It says what happens on a conflict, and what is never persisted.

**An outline answer.**

Short-term memory is a `PostgresSaver` checkpointer per `thread_id`. A summarisation node folds the buffer at about 15 turns, so cost stays flat on long chats.

Semantic memory lives in a store namespaced `("semantic", user_id)`, with stable keys such as `"timezone"` and `"preferred_name"`. Restating a preference overwrites it, and the previous value is kept one version back for conflicts.

Episodic memory lives in `("episodic", user_id)`, one fresh record per completed task. It is pruned to the most recent 100 per user, and older episodes are summarised into a rolling digest rather than deleted.

The store's embedding index covers both namespaces. Recall over 1,000 or more saved items is then a vector query, not a full scan, which is what keeps p95 under 300 ms as history grows.

`user_id` is read from server-side session and authentication configuration on every request, never from a tool-call argument, and every namespace includes it.

Raw intermediate tool outputs and one-off task details stay out of semantic memory, unless the user restates them as a standing preference.

Every rubric line maps to one decision in the outline. That is the test of a memory design answer: each requirement in the prompt has a named scope, key and bound.

## Practise by Building

Two take-home tasks from the interview tutorial make strong portfolio pieces. First, build an evaluation harness that plants a fact early in long synthetic conversations, asks for it 20 turns later, and scores full history, sliding window and summarisation on recall and cost. Second, sketch a support agent that must remember each customer's plan tier and open tickets across a web widget and email, where EU customer data cannot leave the EU. Assign each fact a scope, thread, session, semantic or episodic, and say where each store physically runs.

---

## Key Takeaways

- Lead every memory answer with the scope, the isolation key and the bound, then name technology if asked.
- Scope questions test whether thread, session and user memory are kept apart, with enterprise knowledge in retrieval.
- Memory-type questions test write rules: overwrite, append or gate, and exact lookup for single-valued facts.
- Short-term questions test the difference between what is stored and what the model sees, and the cost of compression.
- Long-term questions test the write policy, growth bounds, latency, contradictions and time.
- Architecture questions test whether each advanced design is matched to its specific failure.
- Production questions are almost always namespace, retention or approval-channel bugs, not model bugs.
- A full design answer maps every requirement in the prompt to a scope, a key and a bound.

## Check Yourself

1. **What scopes short-term memory in LangGraph, and what scopes cross-thread long-term memory?**
   `thread_id`, through the checkpointer; and a `Store` namespace, usually keyed by `user_id`.

2. **Semantic versus episodic memory, in one line?**
   Stable facts updated in place under a stable key, versus past events appended as fresh records.

3. **Name one thing a strong candidate should build that the source notebooks do not have.**
   An evaluation harness that measures memory recall, not just conversational fluency.

