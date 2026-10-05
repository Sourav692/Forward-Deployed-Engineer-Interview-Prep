# How Vector Search Works

*Exact nearest-neighbour search always finds the true closest match but is too slow at scale, so vector indexes give up a little recall for millisecond queries.*

◷ 8 min

Vector search is not keyword matching; it ranks stored chunks by how close their meaning sits to the question. This lesson follows a query from embedding to top-k result, through the index structures that make it fast and the filters that keep it scoped. What an embedding is and why similar meanings land close together is taught in [T2.1 How LLMs behave](/learn/llm-and-retrieval/how-llms-behave).

**Objectives:**

- describe dense search from query embedding to ranked result;
- explain why exact search does not scale and what approximate search gives up;
- compare HNSW, IVF, product quantization, and DiskANN, and name their tuning knobs;
- choose between pre-filtering, post-filtering, and filter-aware search;
- name what dense search is bad at, and where hybrid search comes in.

---

## Embed the Question Into the Same Space as the Chunks

An embedding turns text into a list of numbers, a vector, placed so that similar meanings land near each other. At indexing time every chunk is embedded and stored. At query time the question is embedded with the same model, and search returns the chunks whose vectors sit nearest.

Similarity is usually cosine similarity, which compares the angle between two vectors and ignores their length. That suits text embeddings because their direction carries meaning and their magnitude does not.

The same-model rule is strict. A vector from one model cannot be compared with a vector from another, even when both have the same number of dimensions. They live in different spaces. The retrieval tutorial describes a common on-call incident: a "quick embedding model upgrade" re-embeds the corpus but not the stored query-time vectors, or the reverse, and every similarity score quietly becomes meaningless. Pin the model explicitly, and re-embed everything when it changes.

## Replace Exact Search With Approximate Search at Scale

The simplest search compares the query vector with every stored vector. This exact, or brute-force, search always finds the true nearest match. It does not scale. For 1 million vectors of 1,536 dimensions, one query costs billions of floating-point operations.

So vector stores build an approximate nearest neighbour (ANN) index. It checks only a small fraction of the vectors and still returns results that the RAG fundamentals notes put at about 95 to 99% as accurate. For RAG, that small loss rarely matters; returning relevant chunks in under about 100 ms does. The trade is explicit: sub-linear query time, at the cost of occasionally missing the true nearest match.

This is what a vector store adds over a plain array of vectors in memory. It indexes on insert, answers "the k nearest to this one" quickly, and adds storage, filtering, scaling, and lifecycle features around that index. [Choosing a Database and Vector Store](/learn/llm-and-retrieval/chunking-and-indexing/choosing-a-database-and-vector-store) covers those features.

## Know the Four Index Families

Each index family trades speed, recall, and memory differently. The sources describe four.

**HNSW** (Hierarchical Navigable Small World) builds a multi-layer graph. Think of driving to a house. The sparse top layer is the highways, for reaching the right district fast. The middle layers are local roads. The dense bottom layer finds the exact house. Search starts at the top with a greedy walk toward the query, then drops a layer at a time to refine. It needs far fewer distance calculations than brute force and behaves roughly logarithmically in practice. Its cost is memory, because the whole graph usually sits in RAM.

**IVF** (inverted file index) groups vectors into clusters with k-means and searches only the clusters nearest the query. It is faster to build and uses less memory, and it can live on disk. It needs a training step and usually gives lower recall.

**Product quantization** (PQ) compresses each vector into small codes, trading a little accuracy for a large memory saving. One source gives 8 to 32 times less memory. Another gives a worked figure: a 1,536-dimension float32 vector of about 6 KB shrinks to about 192 bytes, roughly 30 times smaller. Scalar and INT8 quantization are simpler variants. IVF and PQ are often combined as IVF-PQ for billion-scale data.

**DiskANN** keeps the index on SSD rather than in RAM. Billion-scale search then runs on ordinary hardware, with slightly higher latency.

| Worry | Knob or choice |
|---|---|
| How good is the HNSW graph, and how long does it take to build? | `ef_construction` |
| How much recall do I trade for query speed? | `ef_search` in HNSW, `nprobe` in IVF |
| How many links per node, against memory? | `M` in HNSW |
| The index no longer fits in RAM | Quantization, IVF-PQ, or DiskANN |

The sources offer rules of thumb, not laws. One says tuned HNSW up to about 10 million vectors, and IVF or IVF-PQ beyond about 100 million.

> **Warning: a store's default distance metric may not be the model's.** The retrieval tutorial found that Chroma's HNSW index defaults to squared-L2 (Euclidean) distance unless cosine is set when the collection is created. Rankings change with no error, so it passes a smoke test and fails an evaluation. The metric cannot be changed on an existing collection without reindexing.

## Filter on Metadata Before the Answer Is Lost

Many questions carry a constraint that is not about meaning: a document type, a user, a date, a customer tier. For "What is the refund policy for enterprise customers?", filter on `customer_tier = "enterprise"` and run vector search within it. Filtering improves precision without hurting recall.

Where the filter runs matters. Three styles exist.

| Style | How it works | Risk |
|---|---|---|
| Post-filtering | Search first, then drop results that fail the filter | Good results outside the first top-k are never seen |
| Pre-filtering | Filter first, then search the remaining set | Can slow ANN when the filtered set is small or scattered |
| Filter-aware traversal | The filter is applied during the graph search itself | Needs a store that supports it |

Post-filtering is fast but can filter out the only good hits if k was too small. Filter-aware traversal keeps quality and avoids wasted work. Filters also need clean values. One notebook ran the same query with `{"category": "billing"}` and `{"category": "Billing"}`. Only the casing written at ingestion matched, because the filter was an exact, case-sensitive string match. Normalise filter values at both ingestion and query time.

## Pair Dense Search With Keywords for Exact Identifiers

Dense search is brilliant at paraphrase. It is bad at exact identifiers. `MRD-5031`, `MRD-5030`, and `MRD-4290` look alike, so they embed to nearly the same place. Ask "What is MRD-5031?" and dense search may return the MRD-5030 guide. Keyword scoring (BM25) treats a rare token as strong evidence and finds MRD-5031 at once. It has no idea, though, that "data not showing up" and "commit lag" describe the same problem.

Enterprise corpora are full of error codes, product codes, and ticket IDs, and users ask in plain language, so most production systems use both. Combining dense and keyword search (hybrid search), merging the lists, and reranking are covered in [T2.4 Retrieval: hybrid, rerank, query transformation](/learn/llm-and-retrieval/retrieval-hybrid-rerank).

## Worked Example: One Query Through the Index

A user asks, "What is the refund policy for enterprise customers?" over 1 million chunks of 1,536 dimensions each.

The query is embedded with the same pinned model as the corpus, costing about 50 to 150 ms; query embedding often dominates search time. The store applies the `customer_tier = "enterprise"` filter during traversal. HNSW enters at its sparse top layer, walks greedily toward the query, and descends to the dense bottom layer. It compares the query with a small fraction of the million vectors rather than all of them. It returns the top five by cosine similarity, probably including the true nearest five, in well under 100 ms.

Each step maps to one decision: same model, right metric, filter during search, and an index sized to RAM. Get any one wrong and the search still returns five chunks. They are just not the right five, and nothing raises an error.

---

## Key Takeaways

- Dense search embeds the query with the corpus's model and returns the nearest chunks by cosine similarity; mixing models breaks every score.
- Exact search does not scale, so ANN indexes trade a few points of recall for millisecond queries.
- HNSW is fast and accurate but RAM-hungry; IVF, PQ, and DiskANN trade recall or latency for memory.
- Filter during or before search, not after, and normalise filter values.
- Dense search misses exact identifiers, which is why production systems add keyword search.

## Check Yourself

1. **Why is approximate search acceptable for RAG?**
   It returns results about 95 to 99% as accurate as exact search in milliseconds; for RAG, that small recall loss matters less than speed.

2. **Retrieval quality changed after switching vector stores, but the embeddings did not. What is a likely cause?**
   A different default distance metric, such as Euclidean instead of cosine. Set the metric when the collection is created.

3. **What is the risk of post-filtering?**
   Good results outside the first top-k are filtered away unseen, so a strict filter can leave few or no hits.

## References

**Sources:** `02_Chunking_Retrieval_Fusion.md` (FDE Handbook): "Dense (vector) search", "Lexical (BM25) search", and "The point". `Module_01_RAG_Fundamentals_Core_Components.md`: Topic 5 "Vector Database". `Module_02_RAG_Frameworks_Tools_Implementation.md`: Topic 3 "How do different vector DBs actually do the approximate nearest neighbour (ANN) search?" and "How do metadata filtering and hybrid search differ across vector DBs?". `Module_09_Memory_Databases_Caching_for_GenAI_Systems.md`: Topic 3 "How do vector databases search so fast?" and "What affects vector search speed at scale?". `04_rag_and_retrieval_INTERVIEW_TUTORIAL.md`: §1.2 "Embeddings and cosine similarity", §1.3 "Vector stores", and the embedding-model and Chroma distance gotchas. `08_advanced_rag_techniques_INTERVIEW_TUTORIAL.md`: the router metadata-filter gotcha.
