# Why Retrieval Needs Chunks

*Small chunks give a sharp search vector but starve the model of context, while large chunks give context but blur the search, so chunking is a dial to tune, not a default to copy.*

◷ 6 min

A retriever can only return what a single chunk contains, so chunking decides what the system can possibly find. This lesson explains why documents are split, what goes wrong at each end of the size dial, and the few rules that matter more than the exact number. It assumes the pipeline from [T5.1 RAG from first principles](/learn/llm-and-retrieval/rag-from-first-principles).

**Objectives:**

- explain why whole documents are not indexed as single units;
- describe what breaks when chunks are too small or too large;
- apply four chunking rules that matter more than chunk size;
- validate a chunking choice with measurements instead of guesses.

---

## Split Documents Because Search and Context Both Have Limits

A chunk is a small, self-contained piece of a document, usually a few sentences or a paragraph. Each chunk is embedded, stored and searched on its own.

Four limits force the split. An embedding model cannot embed a 200-page document as one unit. Retrieved text must fit the model's context window. A 10-page document may hold only one relevant paragraph. And returning that exact paragraph is far more useful than returning the whole document. Think of a textbook index: it points to the page, not the whole book.

So chunking is not a storage detail. It decides whether the answer ever sits inside one retrievable unit. If it does not, no embedding model or reranker downstream can fix it.

## Treat Chunk Size as a Recall and Precision Dial

Chunk size pulls two ways at once. A small chunk holds one topic, so its vector is sharp and search is precise. A large chunk gives the model more surrounding context per hit, but its vector becomes a blurred average of several topics.

Both extremes fail in recognisable ways. Too small, and a lone sentence such as "It depends on the configuration" means nothing on its own. The model has to stitch fragments together, which raises hallucination risk. Too large, and retrieval finds the right document but the wrong section, and fewer chunks fit in the context window. The target is one clear idea with just enough surrounding context to stand alone.

The sources give starting ranges, not answers. The RAG fundamentals notes suggest 128 to 256 tokens for short facts such as FAQs and product specs, 256 to 512 for narrative text, and 512 to 1,024 for long technical documents. The chunking reference gives 500 to 1,000 characters (about 200 to 400 tokens) for prose. The retrieval tutorial frames 200 to 400 tokens as "small" and 1,000 or more as "large".

> **Warning: a chunk size copied from a default is a guess.** The only defensible way to pick a size is to measure answer quality at a few sizes on real questions. The advanced techniques notebook sweeps sizes such as 128 and 256, with overlap set to one fifth of the size, and scores faithfulness and relevancy with an LLM judge.

## Follow Four Rules Before Tuning the Number

The FDE Handbook argues that four rules matter far more than the chosen size.

First, split on structure, such as headings and sections, before falling back to size. Second, overlap a little, so a fact that straddles a boundary survives on one side. Third, prefix each chunk with its document title and section. Fourth, make every chunk inherit its parent document's permissions.

The title prefix is cheap and puts the subject inside the searchable text. A chunk that says only "10% credit" retrieves badly. One that says "Vertex Financial MSA › Service credits › 10% credit" retrieves well. The permission rule is not optional: a chunk is the unit of retrieval, so it is the unit of access control. Access control itself is covered in [T16.5 Enterprise RAG in production](/learn/production-ai/enterprise-rag-in-production).

## Set Overlap by What Sits at the Boundary

Overlap is text shared between neighbouring chunks. It keeps a sentence from being orphaned when a cut lands mid-thought.

For prose, the sources agree on roughly 10 to 20% of chunk size; the RAG fundamentals notes say 10 to 15%. Zero overlap on prose silently breaks retrieval for facts that straddle a boundary. Too much overlap creates redundancy and slows retrieval. Tabular rows are the exception: each row is an independent record, so overlap there is usually zero. [Chunking by Document Type](02_Chunking_by_Document_Type.md) covers these per-type choices.

## Measure Chunking at Two Levels

Chunking is not set once. Check it at the retrieval level and the answer level, then read some chunks.

| Worry | Measure |
|---|---|
| Do the top few chunks contain the answer? | Recall@K on a labelled set of 100 to 200 question-answer pairs |
| Is the best chunk near the top? | Mean reciprocal rank (one over the rank of the first relevant result) |
| Is the answer grounded in the retrieved chunks? | Faithfulness |
| Is the answer useful? | Answer relevance |
| Does each chunk make sense alone? | Read 20 to 30 retrieved chunks by hand |

The two levels point to different fixes. Low recall usually means chunks are too large or boundaries are wrong. Low faithfulness may mean chunks are too small and missing context. One more signal is free: if the model uses only half of each chunk, the chunks are too big.

Re-run these checks after any chunking change. Retrieval metrics belong to one chunking strategy, so a golden set built against an old strategy can mislead after a change.

## Worked Example: The Contract Cut Mid-Table

The FDE Handbook shows a contract split every 1,000 characters. One chunk ends with "Credits below 99.9% but above 99.5%:". The next begins "10% credit. Below 99.5%...". A question about service credits retrieves the second chunk, which says "10% credit" with no subject and no threshold.

Split on the "Service credits" heading instead and all three tiers land in one chunk: 10% below 99.9%, 25% below 99.5%, and 50% below 99.0%. Prefix it with the contract title and section, and the chunk carries its own subject into the search. The size barely changed. The boundary and the prefix did all the work.

---

## Key Takeaways

- Chunking decides what retrieval can possibly find, because the answer must sit inside one retrievable unit.
- Chunk size trades sharp search vectors against context per hit; published ranges are starting points only.
- Split on structure, overlap a little, prefix the title and section, and inherit permissions.
- Overlap of 10 to 20% suits prose; independent table rows need none.
- Measure at the retrieval level and the answer level, and re-measure after every chunking change.

## Check Yourself

1. **What goes wrong when chunks are too large?**
   The vector averages several topics, so retrieval finds the right document but the wrong section, and fewer chunks fit in the context window.

2. **Why prefix each chunk with its document title and section?**
   It puts the subject inside the searchable text. "10% credit" alone retrieves badly; the same text under the contract and section name retrieves well.

3. **Recall@K is low after a chunking change. What is the likely cause?**
   Chunks are probably too large or the boundaries cut through the answer. Check boundaries against the source and re-measure.

## References

**Sources:** `02_Chunking_Retrieval_Fusion.md` (FDE Handbook): "Chunking — why you cannot just index whole documents". `Module_01_RAG_Fundamentals_Core_Components.md`: Topic 3 "Chunking". `chunking-reference-by-doc-type.md`: §1 "Why Chunking Isn't One-Size-Fits-All", §2 "Core Parameters" and §6 "Databricks RAG Considerations" (golden-set alignment). `04_rag_and_retrieval_INTERVIEW_TUTORIAL.md`: §1.10 "Chunking strategies" and the "Chunk size" trade-off. `08_advanced_rag_techniques_INTERVIEW_TUTORIAL.md`: §1.2 "Chunk size".
