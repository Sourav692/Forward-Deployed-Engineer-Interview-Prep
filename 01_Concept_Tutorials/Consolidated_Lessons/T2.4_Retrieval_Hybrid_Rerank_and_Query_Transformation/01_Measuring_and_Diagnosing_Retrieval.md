# Measuring and Diagnosing Retrieval

*A wider net catches more of the right passages but also more noise, so every retrieval change has to be judged by what it found and what it missed, not by how the answer reads.*

◷ 7 min

A better embedding model is the weak answer to "how would you improve retrieval?". Name the failure first, measure it, and only then pick the technique that targets it; the pipeline itself is covered in [RAG from first principles](/learn/llm-and-retrieval/rag-from-first-principles).

**Objectives:**

- define precision, recall, recall@k and mean reciprocal rank, and say what top-k does to each;
- isolate a bad answer to retrieval or to generation in a few steps;
- map each common retrieval failure to the technique in this module that fixes it.

---

## Treat Retrieval as the Ceiling on the Answer

A retriever decides what context the model sees. Accuracy, cost, latency and hallucination rate downstream are all bounded by that context. A generator cannot use a passage it never received. So retrieval quality is the first thing to measure, and the last thing to assume.

Retrieval comes in three kinds. Dense retrieval compares embeddings, so it finds text that means the same thing. Sparse retrieval, such as BM25, scores keyword matches, so it finds text that says the same thing. Hybrid retrieval runs both and merges them, as [Hybrid Search and Rank Fusion](02_Hybrid_Search_and_Rank_Fusion.md) explains.

## Balance Precision Against Recall With Top-k

Precision asks whether what came back is relevant. Recall asks whether anything important was missed. Top-k, the number of results taken back, moves the two in opposite directions.

| Setting | What happens | Fits |
|---|---|---|
| k too small | Relevant passages are missed (low recall) | — |
| k too large | Irrelevant passages dilute the context (low precision) | — |
| High precision, low recall | A strict net | Simple factual questions; customer support |
| High recall, low precision | A wide net | Exploratory or complex questions; medicine |

The usual way out is to retrieve wide, then cut. Take the top 20, then let a reranker keep the best 5. That pattern is the subject of [Reranking and Post-Retrieval Filtering](04_Reranking_and_Post_Retrieval_Filtering.md). A similarity threshold is a second dial: lowering it raises recall, raising it raises precision. The RAG fundamentals guide suggests finding where the F1 score, the balance of the two, peaks.

## Measure With Labelled Queries, Not Impressions

Three metrics carry most retrieval work. Each one answers a question a worried engineer would ask.

| Worry | Metric |
|---|---|
| Did the right passage appear anywhere in the top k? | Recall@k: the share of truly relevant documents found in the top k |
| How high did the first right passage rank? | Mean reciprocal rank: the average of 1/rank of the first correct hit |
| Was the whole ranking in a sensible order? | nDCG, a ranking-quality score |

Precision alone can mislead. With k=1 it can look perfect while missing every other passage the generator needed. Recall@k catches that.

Build the labelled set before changing anything. Pair real or synthetic questions with the documents that answer them. Without labels, ask an LLM to write questions each chunk answers, then have a human spot-check a sample. For a customer, mine support tickets or FAQs for real questions with known answers, or ask three or four power users for ten questions each. A small real set beats a large synthetic one. Then measure before and after every change to chunk size, reranker or hybrid weight.

> **Warning: a tiny corpus makes every technique look perfect.** The FDE Handbook's enterprise platform ran six retrieval strategies on a 22-document golden set. Every one scored recall@k of 1.00, and the differences were noise. That table cannot justify any technique. Its value is that the harness exists, so the same table on a 200,000-document corpus can.

## Isolate the Failing Stage First

A confident wrong answer has two possible causes. Either retrieval brought back the wrong passages, or the passages were right and the model ignored them. Print the retrieved chunks before touching anything else. Irrelevant chunks point at chunking, the embedding model or the index. Relevant chunks with a wrong answer point at the prompt or the model.

The RAG fundamentals guide gives a six-step order for poor retrieval in production:

1. Log and read the retrieved chunks to separate a retrieval failure from a generation failure.
2. Check similarity scores. A top score around 0.55 means the query and the indexed content are not aligned.
3. Check chunking. The answer may have been split across two chunks.
4. Check the query. Short or ambiguous questions need rewriting or expansion.
5. Check index freshness. A stale index is a common silent failure.
6. Run a structured evaluation. Take 50 failing queries and measure recall@5; below about 60% means a systematic problem.

One more check belongs early. An embedding model upgrade can improve the offline score and degrade production. Look for a corpus that was only partly re-embedded, since vectors from two models do not share a space. Look too for an evaluation set that does not match real query traffic.

## Map Each Failure to Its Technique

Every technique in this module targets one named failure. Pick by the failure, never by default.

| Failure seen | Technique | Lesson |
|---|---|---|
| Exact codes, IDs or acronyms are missed | Hybrid search with BM25 | [Hybrid Search and Rank Fusion](02_Hybrid_Search_and_Rank_Fusion.md) |
| Two result lists have incomparable scores | Reciprocal rank fusion | [Hybrid Search and Rank Fusion](02_Hybrid_Search_and_Rank_Fusion.md) |
| The user's words differ from the document's | Multi-query rewriting | [Query Transformation](03_Query_Transformation.md) |
| Short questions do not look like long answers | HyDE | [Query Transformation](03_Query_Transformation.md) |
| One question is really several | Decomposition | [Query Transformation](03_Query_Transformation.md) |
| "Filter by date, author or type" | Self-query retrieval | [Query Transformation](03_Query_Transformation.md) |
| The right chunk is retrieved but ranked low | Reranking | [Reranking and Post-Retrieval Filtering](04_Reranking_and_Post_Retrieval_Filtering.md) |
| Five near-duplicates fill the top five | MMR | [Reranking and Post-Retrieval Filtering](04_Reranking_and_Post_Retrieval_Filtering.md) |
| Long chunks full of filler | Contextual compression | [Reranking and Post-Retrieval Filtering](04_Reranking_and_Post_Retrieval_Filtering.md) |
| The corpus does not have the answer | Corrective RAG | [Retrieval Control Loops](05_Retrieval_Control_Loops.md) |
| Chunks too small for context, too large for precision | Parent-document retrieval | [Chunking and indexing](/learn/llm-and-retrieval/chunking-and-indexing) |

Reranking cannot fix a recall problem. If the right document is not in the candidate set at all, fix chunking or add hybrid search first. Rerank only when the right document comes back but ranks badly.

## Worked Example: The Topically Right, Factually Empty Hit

A support bot's top result for a refund question is about refunds but never states the refund window. The chunk is "about" the right topic without holding the fact. Reading the retrieved chunks shows retrieval, not generation, is at fault. A score check shows the top hit at 0.6, which is weak alignment. The chunk boundaries show the window sentence landed in the next chunk.

The fix is chunking, not a reranker, because the fact-bearing chunk never reached the candidate set. Re-measuring recall@5 on the failing questions confirms the change. That is the method in one case: isolate the stage, name the failure, apply its technique, measure.

---

## Key Takeaways

- Retrieval bounds everything downstream, so measure it first.
- Top-k and the similarity threshold trade precision against recall; retrieve wide and cut with a reranker.
- Use recall@k, mean reciprocal rank and nDCG on a labelled query set, and measure every change.
- Print the retrieved chunks first to split retrieval failures from generation failures.
- Choose each technique by the failure it targets; reranking cannot fix missing recall.

## Check Yourself

1. **Why is precision alone not enough to judge a retriever?**
   At k=1 it can look perfect while every other passage the generator needed is missing. Recall@k measures what was missed.

2. **The retrieved chunks are relevant but the answer is still wrong. Where is the fault?**
   In generation: the prompt or the model ignoring context, not in retrieval.

3. **When does adding a reranker not help?**
   When the right document is not in the candidate set at all. Reranking reorders candidates; it cannot add a missing one.

## References

**Sources:** `Module_01_RAG_Fundamentals_Core_Components.md` (GenAI Engineering Modules): Topic 7 "Retrieval" (top-k, precision and recall, debugging steps, noise reduction). `04_rag_and_retrieval_INTERVIEW_TUTORIAL.md`: "Coverage gaps" (retrieval evaluation) and §5.1 role-track answers on recall@k, eval sets and embedding upgrades, rewritten in our own words. `rag_retrieval_strategies.md`: introduction, "Basic Similarity Search" and "Choosing a Strategy: Decision Checklist". `02_Chunking_Retrieval_Fusion.md` (FDE Handbook): "Interview lens". `04_Retrieval_Hybrid_Rerank.md` (FDE Handbook): "What the numbers actually say".
