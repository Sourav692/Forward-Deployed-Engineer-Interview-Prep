# Choosing and Changing Embedding Models

*A better embedding model can lift retrieval quality, but every stored vector belongs to the old model, so switching costs a full re-index.*

◷ 5 min

An embedding model is not a setting to tune casually. Pick it with real queries, watch it for drift, and treat a model change as a migration, building on [Embeddings and Similarity Search](/learn/llm-and-retrieval/how-llms-behave/embeddings-and-similarity-search).

**Objectives:**

- choose an embedding model on domain fit, language, latency and cost, then test it on your own data;
- tell embedding drift apart from data drift and detect each;
- plan a model change that does not break retrieval halfway through.

---

## Choose on Your Own Queries, Not a Leaderboard

General models handle everyday language well. Medical, legal or code content often does better with a model trained on that domain. Public benchmarks such as MTEB, the Massive Text Embedding Benchmark, are a fair baseline. They cannot show how a model handles a specific corpus and its users' wording.

Weigh four more things. Multilingual corpora need a multilingual model; the GenAI Engineering guide names multilingual-e5 and LaBSE. Bigger models are slightly better but slower and costlier, so a smaller model often gives the better trade-off. With labelled query-document pairs, fine-tuning through contrastive learning can improve retrieval a lot.

Then test. Build a labelled set of real queries with the chunks each should find, and compare candidates on retrieval metrics.

| Worry | Metric to compare models on |
|---|---|
| Does the right chunk appear anywhere in the top few? | Recall@K |
| How high does the first right chunk appear? | Mean reciprocal rank |
| Are the most relevant chunks at the very top? | nDCG (normalised discounted cumulative gain) |

## Separate Embedding Drift From Data Drift

Retrieval quality can decay for two different reasons. In data drift, the documents themselves change: new topics, formats or vocabulary. In embedding drift, the vector space itself changes. A model update, a preprocessing change, or new sources written in a different style can all cause it. Retrieval quality then drops quietly.

A model that drifted cannot announce it. Track Recall@K, mean reciprocal rank and nDCG over time, compare statistics of old and new embeddings such as mean, variance and clusters, and watch failed or low-confidence queries. To mitigate, re-embed the corpus when the model changes, fine-tune on domain query-document pairs, add keyword search alongside vectors, and keep evaluation running.

## Treat a Model Change as a Full Migration

Old chunks live in model A's vector space. New queries would arrive in model B's. Comparing across the two gives meaningless similarity scores, even when both vectors have the same dimension.

So a model change has four costs. It needs a full re-index, which is slow and costly for millions of documents. A partial swap breaks retrieval, because some chunks sit in the old space and some in the new. Re-embedding millions of tokens at once causes a cost spike. And the new model needs re-evaluation to prove it is really better.

The safe path is a blue-green deployment. Run the old and new indexes in parallel. Send a small share of traffic to the new one, validate it, then switch fully. Keep the old embeddings for rollback, and re-index during low-traffic hours.

> **Warning: a mixed index fails without an error.** The interview tutorial calls this a common on-call incident after a "quick embedding model upgrade". The corpus is re-embedded with a new model but stored query-time embeddings are not, or the reverse. Every score is still a number. It just no longer means anything.

## Worked Example: An Upgrade That Helped Offline and Hurt Production

A team upgrades its embedding model. The offline evaluation improves, but production retrieval gets worse. Two checks come first.

First, was the whole corpus re-embedded with the new model? If only new documents were, the index mixes two vector spaces and production queries compare across them. Second, does the evaluation set look like real production queries? An offline set that differs from what users actually ask can reward a model that production then punishes.

The fix follows the migration rule. Rebuild the full index under the new model beside the old one, route a slice of real traffic to it, and compare Recall@K on both before switching. A model change is a data migration, not a configuration edit.

---

## Key Takeaways

- Pick an embedding model on domain fit, language, latency and cost, then prove it with Recall@K, mean reciprocal rank and nDCG on your own queries.
- Data drift changes the documents; embedding drift changes the vector space, and both need ongoing measurement.
- Changing the model means re-embedding everything, so run old and new indexes side by side and keep a rollback.
- A mixed-model index produces meaningless scores with no error.

## Check Yourself

1. **Why is a public benchmark not enough to choose an embedding model?**
   It measures general tasks, not your corpus and your users' wording. Build a labelled set of real queries and compare candidates on Recall@K, mean reciprocal rank and nDCG.

2. **What is the difference between data drift and embedding drift?**
   Data drift is the documents changing in topic, format or vocabulary. Embedding drift is the vector space changing, for example after a model update or preprocessing change.

3. **Why can a model change not be rolled out chunk by chunk?**
   Chunks embedded by the old model and queries embedded by the new one live in different spaces. A partial swap compares incompatible vectors and breaks retrieval.

## References

**Sources:** `Module_01_RAG_Fundamentals_Core_Components.md` (GenAI Engineering guide): Topic 4 "How do you choose an embedding model for a special field, and how do you test it?", "What is embedding drift, and how is it different from data drift?" and "What problems appear if you change the embedding model later?". `04_rag_and_retrieval_INTERVIEW_TUTORIAL.md`: §1.2 deep dive on the default embedding model, §2 "Gotchas", and the §5.1 question on an embedding upgrade that improved offline evaluation but degraded production.
