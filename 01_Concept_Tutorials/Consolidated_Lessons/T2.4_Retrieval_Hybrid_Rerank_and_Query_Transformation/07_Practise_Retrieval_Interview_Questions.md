# Practise Retrieval Interview Questions

*Naming every retrieval technique is easy, but interviewers reward the candidate who names the failure first and can justify each added model call with a measurement.*

◷ 10 min

Retrieval questions rarely ask for a definition. They describe a symptom and wait to see whether the answer starts from the failure or from a favourite technique. Each answer below is short enough to say aloud and points at the lesson that teaches it.

**Objectives:**

- answer diagnosis, hybrid, query, reranking and control-loop questions in a sentence or two each;
- work a full retrieval design prompt against a scoring rubric;
- rehearse the follow-ups a sceptical staff engineer is likely to ask.

---

## Start Every Answer From the Failure

The weak answer to "how would you improve retrieval?" is "use a better embedding model". The strong answer names the failure, then the technique that targets it, then how to measure the change. Lessons 1 to 6 give the vocabulary. The questions below give the practice.

## Answer Diagnosis Questions

**1. "Your RAG system gives a confident, wrong answer. How do you debug it?"**
Look at the retrieved chunks before anything else. Irrelevant chunks mean a retrieval fault: chunking, the embedding model or the index. Relevant chunks with a wrong answer mean the prompt or the model ignored the context. Distinguish the two quickly. See [Measuring and Diagnosing Retrieval](01_Measuring_and_Diagnosing_Retrieval.md).

**2. "How do you prove a retrieval change helped without shipping and hoping?"**
Build a small labelled set of question-to-document pairs. Measure recall@k and mean reciprocal rank before and after the change. If an LLM judges answer quality on top, calibrate it against a human-reviewed sample, since judges favour longer, confident answers.

**3. "A customer asks for 99% retrieval accuracy. What do you say?"**
Reframe the request as a metric they can check, such as recall@k on their own labelled examples. Be honest that open-ended questions will not reach 99%, and set that expectation before building.

**4. "The customer has no labelled data and no time to label. How do you evaluate?"**
Mine support tickets or the FAQ for real questions with known answers. Or ask three or four power users for ten questions each. A small real set beats a large synthetic one.

## Answer Hybrid and Fusion Questions

**5. "When does hybrid search rescue recall that vector-only search loses?"**
When queries contain exact tokens that embeddings blur: error codes, ticket IDs, version strings, clause numbers. Name the fusion method, usually reciprocal rank fusion, and say the weight is tuned on labelled queries. See [Hybrid Search and Rank Fusion](02_Hybrid_Search_and_Rank_Fusion.md).

**6. "Explain reciprocal rank fusion without using the word 'score'."**
Each list awards a document a little credit for its position, more for higher places. Credit is summed across lists. A document placed second by two retrievers collects more than one placed first by only one, because agreement counts.

**7. "Your hybrid search's p99 latency grows with the corpus although it returns five results. Why?"**
The fusion normalises scores against every indexed document on each query. Cache the score statistics, or switch to rank fusion, which needs no normalisation.

## Answer Query-Side Questions

**8. "When would HyDE make retrieval worse?"**
On questions the corpus cannot answer, and on rare-term technical questions. The model writes a plausible wrong answer and retrieval finds chunks that resemble the fabrication. Pair HyDE with a relevance check. See [Query Transformation](03_Query_Transformation.md).

**9. "What one detail silently breaks HyDE?"**
Embedding the hypothetical answer with a different embedding model from the corpus. The vectors are then not comparable.

**10. "Multi-query fan-out with five rewrites is five times slower. How do you keep the benefit?"**
Run the five searches concurrently, since they are independent. Add a per-call timeout and fall back to fewer rewrites on partial failure.

**11. "When does self-query earn its extra model call?"**
When users type constraints such as "above 4.5" or "after 2020" in free text instead of using a filter control. Similarity search has no notion of greater-than.

## Answer Reranking Questions

**12. "What is the difference between a bi-encoder and a cross-encoder, and why use both?"**
A bi-encoder embeds query and document separately, so document vectors are precomputed and searchable at scale. A cross-encoder reads both together and scores the pair, which is far more accurate but cannot be precomputed. Retrieve with the first, rerank a shortlist with the second. See [Reranking and Post-Retrieval Filtering](04_Reranking_and_Post_Retrieval_Filtering.md).

**13. "p95 latency doubled after adding a reranker. What do you do?"**
Confirm the reranker is the cause by bypassing it. Then shrink the candidate set it scores. Next consider a lighter model, batching, or reranking only when the top scores are close.

**14. "When do you add a reranker rather than fix chunking?"**
Add a reranker when the right documents come back but rank badly. Fix chunking when the right documents never come back; reranking cannot fix recall.

**15. "Cross-encoder or LLM judge for reranking?"**
A cross-encoder in the hot path, for volume and latency. An LLM judge for low-volume or high-stakes queries, where its nuance is worth a model call per candidate.

## Answer Control-Loop Questions

**16. "What is Corrective RAG, and when do you reach for it?"**
It grades retrieved documents and only uses those that pass. Below a threshold it discards them and falls back, to a web search or a human queue. Use it when the corpus is known to have gaps. See [Retrieval Control Loops](05_Retrieval_Control_Loops.md).

**17. "What does Self-RAG add over grading documents?"**
It also checks the generated answer against the context, catching hallucination introduced during generation.

**18. "Why call agentic RAG 'agentic' when the retriever does not change?"**
Because the model now decides whether and when to search, as a tool call, instead of a pipeline always retrieving first.

**19. "Your Corrective RAG fallback fires too often, or never. Diagnose it."**
The fixed threshold is uncalibrated. Calibrate it per corpus on a held-out set, or use the gap between the top two scores.

**20. "What stops a retrieval-as-tool agent from looping forever?"**
A call cap enforced in code, separate from the overall step budget, plus a structured empty result the model can act on.

## Answer Delivery Questions

**21. "A customer's data cannot leave their network. What changes?"**
Where the embedding model and the generator run: inside the customer's network or a compliant private endpoint. Every embedding call moves with them, including HyDE probes, HyPE question generation and graph extraction. The retrieval logic itself is unchanged. Name the trade-off up front: a lower model-quality ceiling and more infrastructure to own.

**22. "The demo works on 50 documents and fails on the customer's 500,000. How do you find out why?"**
Log real production queries from day one and check retrieval first. Compare document structure between the test set and the customer's, since structure mismatch is the most common cause.

**23. "What will this cost per month?"**
Count the model calls per query, including rewriting, HyDE, LLM reranking and any control-loop grading. Multiply by volume and per-call token cost. A "smart" retrieval loop can cost 5 to 10 times a plain retriever per query.

**24. "The customer's data spans SAP, Salesforce and Postgres. How do you avoid a months-long unification project?"**
Give the agent one retrieval tool per source and unify at the answer layer, with a thin identifier mapping, instead of migrating schemas.

## Work a Mock Design Prompt

**The prompt:** design support search for a software company with three sources. They are a 5,000-article help-centre wiki, a ticket history full of exact error codes, and release notes with version numbers. About 50 articles arrive a day. p95 latency must stay under 1.5 seconds. Answers must never ignore an exact error code the customer typed.

**What a strong answer covers:**

- hybrid search, because of the error codes and version strings;
- a control loop chosen for this scenario's real failure, not by default;
- a reranker chosen for the latency budget;
- a latency budget per stage that sums under 1.5 seconds;
- incremental ingestion without a nightly full reindex;
- an explicit low-confidence fallback;
- the three sources treated deliberately, not as one blended index;
- a live signal that the system is working.

**An outline answer.** Run BM25 and vector search per source and fuse them, tuning the weight per source, since tickets are token-heavy and wiki articles semantic. Choose Corrective RAG-style grading over Self-RAG: the known failure is new, undocumented error codes, a coverage gap. Below threshold, route the case to a human queue with the context attached, not to a public web search. Rerank the fused top 20 with a cross-encoder; an LLM judge would break the budget.

Budget roughly 40 ms for fusion retrieval, using cached score statistics rather than a full scan. Allow about 80 ms for reranking 20 candidates and 50 ms for routing across sources. That leaves about 1.3 seconds for generation, which should stream. Append new articles, tickets and notes incrementally, each tagged with a `source` field for filtering. Track the fallback rate as the live signal. A rising rate flags a coverage gap before customers see bad answers.

## Practise by Building

Three take-home tasks from the sources make good portfolio pieces. First, build plain RAG over a small document set with 15 labelled questions and report recall@5 and mean reciprocal rank. Then add one improvement and report the change with numbers, plus a paragraph on when not to ship it. Second, take a five-query fan-out and make it concurrent, with per-call timeouts, a fallback to fewer rewrites, a total latency cap, and timing logs. Third, implement fusion over three corpora: support tickets with error codes, legal clauses and narrative documents. Tune the weight per corpus, compare recall@5 with dense-only search, and explain why the weights differ.

## Rehearse the Sceptic's Follow-Ups

Prepare a short spoken answer to each.

- "You added query rewriting, HyDE, fusion, reranking and corrective grading. Justify every model call before this ships."
- "Why does a reranker sometimes wreck p95 latency, and how do you keep its accuracy without the tail?"
- "Give a concrete case where raw similarity scores would mislead a merge, and say why ranks do not."
- "Your corrective-grading threshold was picked once. Why should it hold when the corpus grows tenfold?"

---

## Key Takeaways

- Start every retrieval answer from the failure, then the technique, then the measurement.
- Diagnosis questions test whether retrieval and generation faults are separated and measured.
- Hybrid questions test exact tokens versus paraphrase, and why fusion uses ranks.
- Query questions test the specific gap each rewrite closes and its hidden failure.
- Reranking questions test the bi-encoder versus cross-encoder split, latency and the limits on recall.
- Control-loop questions test matching a loop to a failure and bounding it in code.
- Delivery questions test data boundaries, scale, cost and per-source tools.

## Check Yourself

1. **Name the three failures that hybrid search, RRF and reranking each target.**
   Exact identifiers that embeddings blur; merging scores on incomparable scales; first-stage ranking that is approximate by design.

2. **A reranker improved offline metrics but production answers did not change. Where do you look?**
   Whether the reranked order actually changes what reaches the prompt, and whether generation uses that order.

3. **Name one thing a strong candidate should build that the source notebooks lack.**
   An offline retrieval evaluation set, measuring recall@k and mean reciprocal rank, that gates every retrieval change.

## References

**Sources:** `04_rag_and_retrieval_INTERVIEW_TUTORIAL.md`: §4 "Top 10 interview questions", §5 "Role tracks" (questions and take-home tasks), §6 "Mock system design" and §7 "Self-check". `08_advanced_rag_techniques_INTERVIEW_TUTORIAL.md`: §4, §5, §6 "Mock system design" and §7. Several §4 answers in both tutorials draw on external interview guides (among them The Interview Guys, DesignGurus, prachub, OptyxStack, Exponent and DataCamp); every answer here is rewritten in our own words and pointed at lessons 1 to 6 of this module. `02_Chunking_Retrieval_Fusion.md` (FDE Handbook): "Interview lens" and "Checkpoint". `04_Retrieval_Hybrid_Rerank.md` (FDE Handbook): "Interview lens" and "Checkpoint".
