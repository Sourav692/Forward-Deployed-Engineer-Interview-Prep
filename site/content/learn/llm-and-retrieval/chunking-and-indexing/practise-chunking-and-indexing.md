# Practise Chunking and Indexing Interview Questions

*A strong answer names the failure first and the technique second, while a weak one reaches for a bigger embedding model or a different chunk size without saying what broke.*

Interviewers rarely ask "what is chunking?"; they describe a broken system and watch how the candidate isolates the stage that failed. These questions are grouped by the lesson that teaches each idea, with a model answer for each.

**Objectives:**

- answer the common chunking, vector search, and parent retrieval questions in a few sentences each;
- debug a retrieval failure by isolating chunking, search, and generation in order;
- outline a full indexing design against a scoring rubric.

---

## Lead With the Failure, Then the Fix

Every answer in this lesson follows one pattern. Name what breaks, say why, then name the change that targets it. The FDE Handbook gives the shape of a strong answer to "how would you improve retrieval quality?" The weak answer is "use a better embedding model". The strong answer names the failure first: chunks that lost meaning, identifiers that dense search misses, or approximate ranking. Then it names the technique that targets that failure.

## Answer Chunking Questions

**Why is "split every 1,000 characters" wrong, and what matters more than size?**
A fixed cut lands mid-sentence or mid-table, so a chunk can say "10% credit" with no subject. Four rules matter more: split on structure, overlap a little, prefix the title and section, and inherit permissions. See [Why Retrieval Needs Chunks](/learn/llm-and-retrieval/chunking-and-indexing/why-retrieval-needs-chunks).

**An insurance knowledge base mixes Markdown guides with scanned PDFs. How should both be chunked?**
Detect the type at ingestion and route each to its own splitter: header-aware for Markdown, recursive with page metadata for PDF prose. One fixed splitter would separate rules from their headers and cut PDF text mid-sentence. PDF extraction quality is often the bigger risk. See [Chunking by Document Type](/learn/llm-and-retrieval/chunking-and-indexing/chunking-by-document-type).

**The assistant returned a docstring without its function body. Is it a chunking bug or a retrieval bug?**
Pull the raw chunk from the store and compare its boundaries with the source file. If the chunk itself is half a function, it is a chunking bug. Check whether the code splitter fails on a pattern such as decorators, nested functions, or multi-line signatures. If the chunk is complete but wrong, it is retrieval. Then re-run the splitter over the whole corpus and count chunks that do not start and end on a valid boundary.

**Fixed token chunks or custom structure-aware splitters, two weeks before launch?**
Decide by the document mix in scope. Ship fixed-size for unstructured text with monitoring. Add structure-aware splitters after launch for high-volume or high-risk types such as transaction tables and contract clauses. Each custom splitter adds maintenance whenever a source format changes.

**A header splitter treats `##` inside a fenced code block as a header. What breaks?**
It cuts inside the block, leaving one chunk with an unterminated fence and another with a dangling closing fence. Make the splitter fence-aware, or protect code blocks before splitting and reinsert them afterwards.

## Answer Vector Search Questions

**Why use approximate search instead of exact search?**
Exact search compares the query with every vector, which costs billions of operations per query at 1 million vectors of 1,536 dimensions. ANN indexes check a small fraction and stay about 95 to 99% as accurate. See [How Vector Search Works](/learn/llm-and-retrieval/chunking-and-indexing/how-vector-search-works).

**Which query does dense search win, and which does keyword search win?**
"Why is my data not showing up?" matches the backpressure guide by meaning, while keyword search finds no shared words. "What is MRD-5031?" is found at once by keyword search, while dense search may return the MRD-5030 guide. That is why production systems combine them.

**Retrieval quality changed after a store switch, though the embeddings did not. Why?**
A different default distance metric is the usual cause, such as Euclidean instead of cosine. Set the metric at collection creation; changing it later means reindexing.

**pgvector read latency spikes under load. What is the first check?**
Whether the vector column has an HNSW or IVFFlat index, rather than being scanned sequentially. See [Choosing a Database and Vector Store](/learn/llm-and-retrieval/chunking-and-indexing/choosing-a-database-and-vector-store).

**What breaks when a vector store grows past 100 million embeddings?**
Memory, at about 600 GB raw and nearly 1 TB with the HNSW graph. Then build time, in-place updates, backups, and full re-indexes on schema change. Fixes include sharding, INT8 quantization, incremental indexing, compaction, and versioned indexes with gradual traffic shifts. See [Vector Indexes in Production](/learn/llm-and-retrieval/chunking-and-indexing/vector-indexes-in-production).

## Answer Parent Retrieval Questions

**Why index small chunks but return large ones?**
A large chunk's vector blurs across topics and hurts recall for single-topic queries. Small children give sharp vectors, and the parent swap restores context after the match. See [Retrieve Small, Return Large](/learn/llm-and-retrieval/chunking-and-indexing/retrieve-small-return-large).

**Confident wrong answers continue after switching to parent retrieval. How should it be debugged?**
Isolate the stage. Check the raw child hits first: wrong children mean a search or embedding problem. Then check the resolved parent, which exposes chunk-size or boundary problems. Then check generation. Recall can also rise while one query type worsens, because irrelevant parent text distracts the model.

**How can parent retrieval be shown to beat naive chunking?**
Build an evaluation set of question, expected answer, and expected source. Measure retrieval as recall@k on parent ids, and measure generation quality separately, holding the model constant. The source notebooks did not include this harness, so it is worth building.

**A reranker doubles p95 latency. Should it stay?**
Measure the quality gain against the latency cost. If it stays, rerank the top children before the parent swap; short children are far cheaper to rerank than long parents.

**When should an agent call parent retrieval rather than plain vector search?**
When it must reason over or quote substantial context. A plain child search is cheaper for confirming that a fact exists. Deduplicate parents in code so the model never treats one source as two.

**The customer cannot send documents to an external embedding API. What changes?**
Swap in a self-hosted or in-VPC embedding model. The retriever, vector store, and docstore interfaces do not depend on which embedding function is injected, and all stores stay inside the boundary.

**Documents update nightly. What does ingestion need?**
Stable, content-derived ids. Without them, each run creates new random ids and duplicate parents accumulate.

> **Warning: do not answer "99% retrieval accuracy" with a yes.** Ask what the number means, recall@k or exact match, and build the customer's evaluation set before committing to any figure.

## Outline a Full Indexing Design

The parent document tutorial poses this design question. A support agent answers from about 5,000 internal articles growing by about 20 a day. Answers need enough context to be trusted, p95 latency must stay under 2 seconds, and the system must not degrade at 50,000 articles.

| Rubric item | Strong answer |
|---|---|
| Retrieval pattern | Two-splitter parent retrieval, justified by the precision and context trade-off |
| Concrete sizes | Children of about 300 to 400 characters; parents of about 1,500 to 2,000 characters |
| Persistent stores | pgvector for vectors and a Postgres docstore, so one database |
| Incremental ingestion | Ids from a hash of article id and last-modified time; the daily job writes idempotently, no full re-index |
| Latency budget | Embedding about 100 to 150 ms, HNSW search about 50 to 100 ms, docstore about 20 to 50 ms, about 1.5 s for generation, streamed |
| Quality measurement | 50 to 100 questions from real tickets before launch; recall@k tracked weekly |
| Low-confidence behaviour | Cap k at 3 or 4; below a similarity threshold, say there is no confident answer |
| Scaling to 50,000 | HNSW index once past a few thousand vectors; the shared Postgres choice still holds |

Every rubric line maps to one decision with a number attached. That is the test: a vague answer names components, while a strong one sizes them.

## Worked Example: Explain It to a Sceptical Staff Engineer

The parent document tutorial ends with three pushbacks. Practise each aloud.

"Why not retrieve the whole document and skip chunking?" Because a whole-document vector blurs every topic together. Large documents can also exceed the context window, and child-only mode already shows the risk.

"This adds a second store. Why not embed bigger chunks?" Because bigger chunks bring back the blurred vector, the problem being solved. The docstore is a plain key-value store, and putting it in the same Postgres as the vectors keeps one database.

"The stores can drift apart. Why is that acceptable?" Because indexing and deletion are treated as one operation with content-derived ids. A retried write overwrites instead of duplicating. Each answer names the failure the design prevents, which is the pattern this lesson started with.

---

## Key Takeaways

- Lead every answer with the failure, then the technique that targets it.
- Chunking questions test boundaries, routing by document type, and debugging chunk versus retrieval bugs.
- Vector search questions test ANN trade-offs, dense versus keyword strengths, metrics, indexes, and scale.
- Parent retrieval questions test the small-to-big split, stage-by-stage debugging, evaluation, and idempotent ingestion.
- A full design answer attaches a number to every rubric line.

## Check Yourself

1. **A candidate says "use a better embedding model" to fix retrieval. What is missing?**
   The failure. A strong answer first names what broke, such as lost chunk meaning, missed identifiers, or approximate ranking, then the fix for it.

2. **How do you tell a chunking bug from a retrieval bug?**
   Pull the raw chunk and compare its boundaries with the source. An incomplete chunk is a chunking bug; a complete but wrong chunk is a retrieval bug.

3. **Name one thing a strong candidate should build that the source notebooks lack.**
   An evaluation harness that compares parent retrieval with naive chunking on recall@k and answer quality.

