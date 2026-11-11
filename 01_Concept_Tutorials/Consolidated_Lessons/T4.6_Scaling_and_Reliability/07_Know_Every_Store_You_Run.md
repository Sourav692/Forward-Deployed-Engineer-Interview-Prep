# Know Every Store You Run

*Ask a team where their AI system keeps its state and most will say "the chat history". A production system keeps at least five kinds, and each needs an owner.*

◷ 7 min

A prototype keeps everything in one place: the conversation list in memory, maybe a vector index on disk. A production system spreads state across several stores with different jobs, lifetimes and owners. When nobody has listed them, three things go wrong. Retries create duplicate actions, a deletion request misses half the copies, and an incident review cannot reconstruct what happened. This lesson gives you the list and the questions to ask about each store.

**Objectives:**

- name the five kinds of state a production AI system keeps;
- separate the operational state that drives the system from the context shown to the model;
- tell an authoritative record from a derived one, and say why it matters;
- link every store with stable IDs so a run can be traced, retried and deleted.

---

## List the Five Stores

| Store | What it holds | Typical lifetime | Rebuilt from |
|---|---|---|---|
| Conversation | Messages between user and assistant | The session, or the retention period | Nothing. It is a record |
| Workflow state | Where a run is: step, plan, pending approvals, tool results, budgets | Until the run ends, plus a review period | Nothing while the run is live |
| Retrieval index | Chunks and embeddings of the knowledge sources | As long as the sources exist | The source documents |
| Memory | Facts and preferences kept across sessions | Until expired, corrected or deleted | Nothing, unless memories were derived from records |
| Artifacts and audit | Files produced, actions taken, decisions and their reasons | Set by policy or regulation | Nothing. It is the evidence |

Every row needs four answers written down: its **purpose**, its **owner**, its **retention** and **who may read it**. A store with no named owner is the one that grows without limit and turns up in the next security review.

## Keep Operational State Out of the Prompt

The model sees a context window: the system prompt, some recent messages, retrieved chunks and perhaps a summary. That is a view, assembled for one call. It is not where the system's state lives.

Workflow state belongs in a database the runtime controls: which step the run is on, which tools have already succeeded, how much budget is left, which approval is pending. The runtime reads that state, decides what to show the model, and writes back what the model's proposal changed. If the only record of "refund already issued" is a sentence in the transcript, a retried run may issue it again. [Durability and Idempotency](../T3.7_Agentic_Workflow_Platforms/04_Durability_and_Idempotency.md) covers how durable runs and idempotency keys prevent that.

The same applies to summaries. A conversation summary is **derived state**: a lossy copy made for the model's convenience. Keep the original messages as the record, and regenerate or correct the summary from them.

## Know Which Records Are Authoritative

An **authoritative record** is the one that wins when copies disagree. A **derived** store is built from it and can be rebuilt.

- The order system is authoritative for whether a refund happened. The agent's transcript only says it asked for one.
- Source documents are authoritative. The retrieval index is derived, which is why it can be rebuilt blue-green, as in [Scaling the Index and Access Control](02_Scaling_the_Index_and_Access_Control.md).
- The audit log is authoritative for what the AI system did and why.

Two rules follow. Never let a derived store make a decision that only the authoritative one should make, such as checking a refund against the transcript instead of the order system. And when you must delete, start from the authoritative record and follow every derived copy, including embeddings and caches.

## Link Everything With Stable IDs

Five stores are only manageable if their entries can be joined. Give every request, run and step an ID at the point it is created, and carry those IDs into every store and every trace.

- **Tenant and user IDs** on every row, for isolation and deletion.
- **A run ID** for each workflow execution, shared by its state, its tool calls and its artifacts.
- **A step ID and an idempotency key** for every side effect, so a retry can be recognised as a retry.
- **Source and version IDs** on retrieved chunks and memories, so you can show where an answer came from.

With those in place, three hard questions become queries. What did this run do? Which stores hold this user's data? Was this refund already issued for this step?

## Worked Example: A Deletion Request Across Five Stores

A customer of a support assistant asks for their data to be deleted.

1. **Conversation.** Delete their messages by user ID. Easy, because every message row carries it.
2. **Workflow state.** Finished runs older than the review period are already gone. Two recent runs remain, found by user ID, and are deleted.
3. **Retrieval index.** The customer once uploaded a contract, which was chunked and embedded. The chunks carry the source document ID, so the document and its chunks are removed and the index entries rebuilt.
4. **Memory.** Three memories carry the user ID and their provenance. All are deleted.
5. **Artifacts and audit.** Refund records must be kept for the period the finance regulator sets. The audit entries are kept, with the customer's personal fields removed and the reason for retention recorded.

Without the IDs from the previous section, step 3 would have been a manual search through embeddings. Without the store list, step 4 would have been missed entirely. [The Data Lifecycle Across Every Store](../T4.7_AgentOps/10_The_Data_Lifecycle_Across_Every_Store.md) builds the full deletion and retention policy on this list.

---

## Key Takeaways

- A production AI system keeps at least five kinds of state: conversation, workflow state, retrieval index, memory, and artifacts and audit.
- Each store needs a written purpose, owner, retention and reader list.
- Operational state lives in stores the runtime controls. The prompt is a view built from it, never the record.
- Authoritative records win over derived copies such as indexes, summaries and caches.
- Stable IDs for tenant, user, run, step and source make tracing, safe retries and deletion possible.

## Check Yourself

1. **Why is the transcript a poor place to record that a refund was issued?**
   It is a view for the model, not the authoritative record. A retried run reading a lossy or truncated transcript may issue the refund again. The order system and the run's workflow state should record it.

2. **What makes the retrieval index a derived store?**
   It is built from the source documents and can be rebuilt from them. That is why it can be replaced blue-green, and why a deletion must start from the source and propagate to the index.

3. **Which IDs would you add first to a prototype heading to production, and why?**
   Tenant and user IDs on every row, and a run ID shared by all stores. They make isolation, deletion and tracing possible. Then step IDs with idempotency keys for every side effect.

## References

**Sources:** written for this site. It links to [Durability and Idempotency](../T3.7_Agentic_Workflow_Platforms/04_Durability_and_Idempotency.md) and [Scaling the Index and Access Control](02_Scaling_the_Index_and_Access_Control.md), which teach the mechanisms this lesson relies on.
