# Embeddings

## Topic 4: Embeddings

An embedding turns a piece of text into a long list of numbers (a **vector**) that captures its meaning. It is how a computer "understands" that two sentences are about the same thing.

### What are embeddings, and how do they power search by meaning?

Texts with similar meaning get similar vectors. "How do I reset my password?" and "Steps to change my login credentials" share almost no words, yet their vectors are very close. That is **semantic retrieval**.

In a RAG system:

- **At indexing time**, every chunk is converted to a vector and stored.
- **At query time**, the question is converted to a vector too.
- The system finds the closest chunks using **cosine similarity** or **dot product**.
- Those chunks are passed to the LLM as context.

This is much stronger than keyword search for natural-language questions.

### How do you choose an embedding model for a special field, and how do you test it?

- **Domain alignment:** general models handle everyday language, but medical, legal, or code content often does better with domain-trained models (for example biomedical or code embeddings).
- **Benchmarks:** **MTEB (Massive Text Embedding Benchmark)** is a good baseline, but always test on your own queries and documents.
- **Multilingual needs:** pick models like **multilingual-e5** or **LaBSE**.
- **Latency and cost:** bigger models are slightly better but slower and costlier; a smaller model often gives the better trade-off.
- **Fine-tuning:** with labelled query-document pairs, **contrastive learning** can improve retrieval a lot.

How to test: build a labelled set of real queries, then compare models on **Recall@K**, **MRR**, and **nDCG (Normalized Discounted Cumulative Gain)**.

### What is embedding drift, and how is it different from data drift?

- **Data drift:** the documents themselves change (topics, formats, vocabulary).
- **Embedding drift:** the embedding space changes, for example after a **model update**, a **preprocessing change**, or new sources with a different writing style, so retrieval quality quietly drops.

Detect it by: tracking Recall@K, MRR, and nDCG over time, comparing the statistics of old and new embeddings (mean, variance, clusters), and monitoring failed or low-confidence queries.

Mitigate it by: **re-embedding** the corpus when you switch models, fine-tuning on domain query-document pairs, using **hybrid retrieval (BM25 + vector search)**, and keeping continuous evaluation running.

### How do embedding size and model choice affect quality and speed?

- **Dimensions** (the length of the vector) affect storage, compute cost, and index performance, but not quality by themselves. Two 768-dimension models can perform very differently.
- Higher dimensions mean more memory and slightly slower **ANN (Approximate Nearest Neighbor)** search, using indexes like **HNSW** or **IVF**.
- Rough guide: **384 to 768** is efficient for large collections, **768 to 1536** is the usual balance, and **above 3000** costs more with diminishing returns.
- The model's architecture and training data matter far more than its dimension.

### What problems appear if you change the embedding model later?

Old chunks live in "Model A's vector space", and new queries would be in "Model B's". Comparing them gives meaningless similarity scores.

- **Full re-indexing** is required, which is slow and costly for millions of documents.
- **Partial swaps break retrieval**, because some chunks are in the old space and some in the new.
- **Cost spike** from re-embedding millions of tokens at once.
- **Re-evaluation** is needed to confirm the new model is truly better.

Safe approach: run the old and new indexes in parallel (**blue-green deployment**), send a small share of traffic to the new one, validate, then switch fully. Keep the old embeddings as a backup for **rollback**, and re-index during low-traffic hours.
