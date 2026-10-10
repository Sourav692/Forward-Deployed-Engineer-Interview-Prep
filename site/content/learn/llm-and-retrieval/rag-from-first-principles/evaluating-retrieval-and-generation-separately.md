# Evaluating Retrieval and Generation Separately

*One end-to-end score is cheap to compute, but it cannot say whether the search or the model caused a bad answer.*

◷ 6 min

A RAG system has two boxes, so it needs two report cards. Score retrieval with labelled chunks and generation against the context it received. Only then trust an end-to-end number, keeping the two-box picture from [What RAG Is and When to Use It](/learn/llm-and-retrieval/rag-from-first-principles/what-rag-is-and-when-to-use-it).

**Objectives:**

- explain why retrieval and generation must be evaluated apart;
- pick retrieval metrics and generation metrics, and say what each measures;
- design a small offline evaluation set and a production check for hallucination and drift.

---

## Split the Score Because the Failures Differ

A final-answer check cannot tell whether the search or the model caused a bad result. The two layers fail in opposite ways. Good generation on poor retrieval means the model is making things up from memory. Good retrieval with poor generation means the model ignored the right context. Only separate scores show which layer is broken.

A simple test isolates generation. Give the model perfectly curated context and check the answer. If it is fine with perfect context but bad with retrieved context, retrieval is the bottleneck.

## Score Retrieval With Labelled Chunks

Retrieval evaluation asks whether the right chunks came back. It needs questions labelled with their relevant chunk IDs, and no model at all.

| Worry | Metric |
|---|---|
| What share of the relevant chunks made the top K? | Recall@K |
| Of the top K, how many are actually relevant? | Precision@K |
| How high does the first right chunk appear? | Mean reciprocal rank: the average of 1 divided by its rank, so position 1 scores 1.0 and position 2 scores 0.5 |
| Are the best chunks at the very top? | nDCG, a ranking-aware score that rewards the most relevant chunks first |

Similarity statistics add a cheap signal. A consistently low average similarity suggests the embedding model does not fit the content. A narrow gap between top and bottom scores means the retriever is not discriminating well.

Precision alone is not enough. It can look perfect at K equal to 1 while missing every other chunk the answer needed.

## Score Generation for Faithfulness First

Generation evaluation asks whether the answer is good, given the context it received. Faithfulness is the core safety metric: is every claim in the answer supported by the retrieved context? An unfaithful answer is a hallucination, with invented facts, numbers or conclusions. It is dangerous because it sounds confident and fluent, so users rarely spot it.

Measure faithfulness with a second model acting as a judge, given the answer and the chunks and asked which claims are unsupported. The GenAI Engineering guide names RAGAS, which returns a score from 0 to 1; below about 0.8 should trigger a review. Add answer relevance, which asks whether it actually answers the question, and factual correctness against a ground-truth answer.

> **Warning: a judge model has its own biases.** The interview tutorial notes that model judges favour longer, more confident-sounding answers regardless of correctness, and can be swayed by position. Calibrate the judge against a human-reviewed sample, and prefer pairwise comparison over absolute scores where possible.

## Build a Small Offline Set Before Changing Anything

Offline evaluation runs on a fixed dataset with no live users. The sources size it at 100 to 200 labelled questions for retrieval, and 100 to 500 question-answer pairs for a full pipeline. Include ambiguous, multi-hop and out-of-scope questions. Score retrieval with Recall@5, mean reciprocal rank and Precision@5, and log every retrieved chunk and score. Score generation against ground truth, plus faithfulness and relevance.

Then run it on every change and alert on regressions. The guide's examples are Recall@5 down by more than 5%, or faithfulness below about 0.75. Its companion guide gives example thresholds of faithfulness 0.80, answer relevancy 0.75 and context recall 0.70. Wiring these into a release gate is covered in [Evaluation and release gates](/learn/production-ai/evaluation-and-release-gates).

No labels yet? Generate synthetic query-chunk pairs by asking a model to write questions each chunk answers, then have a human spot-check a sample. For a customer, mine support tickets or the FAQ for real questions with known answers, or ask three or four power users for ten questions each. A small real set beats a synthetic one.

## Watch Production for Hallucination and Drift

Offline tests cover known cases; production monitoring covers the real world. Run a lightweight faithfulness check on every response, flag low scores for human review, and track the hallucination rate daily. Have experts review a 1 to 2% sample monthly.

For drift, watch daily similarity distributions. A drop in average top-1 similarity from 0.85 to 0.72 means queries have shifted away from the content. Rising "I don't have information" answers, thumbs-down feedback and repeated queries point the same way. Re-run the offline evaluation weekly.

## Worked Example: A Confident, Wrong Answer

A RAG assistant returns a confident, wrong answer. Debug by stage, not by tweaking the prompt.

First, isolate the layer. Log and read the chunks that were retrieved. If they are irrelevant, the problem is retrieval: chunking, the embedding model or the index. If they are relevant but the answer is wrong, the problem is the prompt or the model ignoring context. Second, look at the scores: a top similarity around 0.55 means the query and the indexed content are not aligned. Third, check whether the answer was split across two chunks, whether the query was too short or ambiguous, and whether the index is stale. Finally, take 50 failing queries and measure Recall@5. Below about 60% means a systematic retrieval problem, not a one-off.

The example shows the payoff of separate scores. Each step narrows the fault to one box, and the fix then goes to that box.

---

## Key Takeaways

- Evaluate retrieval and generation apart, because each fails differently and one score hides which.
- Score retrieval with Recall@K, Precision@K, mean reciprocal rank and nDCG on questions labelled with their chunks.
- Score generation for faithfulness first, with a calibrated judge, then relevance and correctness.
- Build a small labelled set with hard cases, run it on every change, and alert on regressions.
- In production, check faithfulness on every response and watch similarity distributions for drift.
- Debug a wrong answer by reading the retrieved chunks before touching the prompt.

## Check Yourself

1. **The answer is fine with hand-picked context but wrong with retrieved context. Which layer is broken?**
   Retrieval. Generation works given the right evidence, so the search is not finding it.

2. **What does mean reciprocal rank measure, and what score does a first relevant hit at position 2 give?**
   How high the first relevant chunk ranks, averaged as 1 divided by its rank. Position 2 gives 0.5.

3. **Why calibrate a model judge against human labels?**
   Judges favour longer, confident answers and can be swayed by position. A human-reviewed sample shows how far to trust their scores.

