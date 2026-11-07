# Vector Indexes in Production

*An ANN index is built for fast reads, not frequent edits, so keeping it current, affordable, and consistent as documents change is most of the operating work.*

◷ 6 min

Most vector index failures in production raise no error; answers just get worse. This lesson covers how to keep an index fresh as documents change, what breaks as it grows, and which silent failures to watch for, after the store choice in [Choosing a Database and Vector Store](04_Choosing_a_Database_and_Vector_Store.md).

**Objectives:**

- re-ingest changed documents so queries never see two versions at once;
- explain why updates are deletes plus inserts, and why indexes need compaction;
- plan for memory, build time, and schema change at 100 million vectors and beyond;
- name the silent failures of a vector index and the signal that catches each.

---

## Update by Replacing, Not Editing

ANN indexes such as HNSW are not built for frequent in-place edits. So an "update" is usually a delete plus an insert. Store `document_id`, `chunk_id`, and a version on every chunk, so all chunks of a changed document can be found and replaced together.

Frequent updates fragment the index over time. Run periodic index maintenance, or compaction, to restore it. Deletes follow the same pattern: delete logically first, so the chunk is hidden from queries, and remove it physically later.

## Re-Ingest Changed Documents in a Fixed Order

The GenAI databases notes give a five-step loop for corpora that change often.

1. Detect the change through webhooks or change APIs from sources such as SharePoint, Confluence, Notion, or Google Drive, and put the document on an ingestion queue.
2. Prioritise. A compliance policy change is more urgent than a blog edit; rank by document type and by how often the document is retrieved.
3. Re-ingest. Mark old chunks pending replacement, then parse, chunk, and embed the new version. Insert the new chunks as active, delete the old vectors, and mark the old records superseded.
4. Make the swap as atomic as possible, and always filter queries on `status = active`, so no query sees both versions.
5. Soft-delete removed documents first, then hard-delete them in a background job after a retention period.

The status filter in step 4 is what makes the rest safe. Without it, a query that lands mid-swap can retrieve the old and new policy side by side.

> **Warning: the vector index and the relational records can drift apart.** They are written by separate calls. A crash between them, or a delete on one side only, leaves a vector whose record is missing, or the reverse. Never write one without the other in production code. Use stable, content-derived ids so a retried write overwrites instead of duplicating.

## Plan for Memory and Rebuilds at Large Scale

Scale changes the problem from search speed to memory and rebuild time. The vector-store notes put 100 million vectors at 1,536 dimensions at about 600 GB raw, and nearly 1 TB once the HNSW graph is added.

| What breaks at 100 million or more | Fix the sources give |
|---|---|
| Memory: the index no longer fits one machine | Shard across machines; compress with INT8 quantisation |
| Index build takes many hours; a new embedding model means a full re-index | Incremental indexing: new vectors go into a small flat index that merges into the main one later |
| HNSW cannot update in place | Logical deletes plus regular compaction, with offline rebuilds in quiet hours |
| Backups are huge to copy | Stream changes to object storage and rebuild from the last checkpoint |
| New metadata, embedding model, or chunking means re-indexing everything | Keep versioned indexes and shift traffic gradually with index routing |
| Managed cost reaches tens of thousands of dollars a month | Self-host, and take on all the work above |

The whole index does not always need to sit in RAM. In-memory HNSW is fastest but needs the most memory. Disk-based indexes such as DiskANN and IVF-PQ handle much larger datasets, slightly more slowly. Some stores memory-map the index and keep the often-used parts of the graph in RAM. Tiered storage combines these: recent vectors in memory with HNSW, older ones on disk with DiskANN, with routing deciding which tier to query. The choice is low latency with heavy RAM, or compression and disk with a little more latency.

Sharding splits vectors across nodes, searches them in parallel, and merges the top-k results. Managed services do this automatically.

## Find Where the Latency Goes

When search is slow, the index is only one suspect. Index placement matters, in memory or on disk. So does `ef_search`, which trades recall for latency. Embedding the query often dominates, at about 50 to 150 ms. A separate vector service adds a network hop. Fetching full results from PostgreSQL or an object store adds more, which batching or caching reduces.

Measure each stage before tuning the index. Tuning the index cannot win back time spent embedding the query.

## Watch for Silent Failures

Many index failures produce no error, just worse answers. Each needs its own signal.

| What fails | Signal and response |
|---|---|
| Index corruption after a crash | Take snapshot backups; compare index counts with the relational database |
| Embedding API is down | Use a circuit breaker and fall back to keyword-only search |
| Stale index: updates lag behind documents | Monitor the lag and alert on it |
| Memory pressure causes swapping and huge latency spikes | Monitor the process's resident memory |
| Cold start: the index must load into RAM before serving | Use a readiness probe and connection draining |
| Embedding rate limits under load | Expect them at ingestion more than at query time; batch calls, back off, and cache embeddings for unchanged content |

Watch online signals too. A user rephrasing the same question right after an answer means retrieval missed. Measuring retrieval quality with a golden set is covered in [T6.1 Retrieval: hybrid, rerank, query transformation](/learn/llm-and-retrieval/retrieval-hybrid-rerank).

## Worked Example: A Policy Change Mid-Morning

A compliance team updates the refund policy in Confluence at 10:00. The webhook puts the document on the ingestion queue, and its type ranks it above a pending batch of blog edits.

The worker marks the old policy's chunks pending replacement. It chunks and embeds the new version with the pinned model and records the model version on each chunk. It inserts the new chunks as active, deletes the old vectors, and marks the old document record superseded. Every query filters on `status = active`, so a question at 10:01 sees either the old policy or the new one, never both.

At the end of the week, compaction reclaims the space the deleted vectors left behind. Each step answers one failure: priority answers staleness, the status filter answers mixed versions, and compaction answers fragmentation.

---

## Key Takeaways

- ANN indexes update by delete plus insert, and need periodic compaction.
- Re-ingest changed documents in a fixed order and filter every query on active status.
- At 100 million vectors, memory, build time, deletes, backups, and schema change dominate; shard, quantise, index incrementally, and version indexes.
- Measure each latency stage first; query embedding often costs more than the search.
- Most index failures are silent, so give each one a monitor and a fallback.

## Check Yourself

1. **Why must every query filter on `status = active` during re-ingestion?**
   Without it, a query that lands mid-swap can retrieve old and new versions of the same document side by side.

2. **The embedding API goes down. What should retrieval do?**
   Open a circuit breaker and fall back to keyword-only search rather than failing the whole answer.

3. **Switching embedding models at 100 million vectors means a full re-index. How do the sources make that safe?**
   Build a versioned index and shift traffic to it gradually with index routing, using incremental indexing for new vectors.

## References

**Sources:** `Module_09_Memory_Databases_Caching_for_GenAI_Systems.md`: Topic 2 "What goes wrong when storing millions of embeddings?" and "How do I update embeddings when documents change often?"; Topic 3 "What affects vector search speed at scale?" and "What can fail in production?". `Module_01_RAG_Fundamentals_Core_Components.md`: Topic 5 "How do you scale a vector database to millions of embeddings?" and "How do you handle updates, deletions, and monitoring?". `Module_02_RAG_Frameworks_Tools_Implementation.md`: Topic 3 "What breaks when a vector DB grows to 100M+ embeddings?". `parent_document_retrieval_INTERVIEW_TUTORIAL.md`: the store-drift gotcha and interview questions 3 and 4, rewritten in our own words.
