# Level 3: RAG and Retrieval Engineering

Ten small problems on how a RAG system finds, guards, and measures the documents it answers from.

| Notebook | Problems | Theory file | What it trains |
| --- | --- | --- | --- |
| [01_rank_and_search.ipynb](01_rank_and_search.ipynb) | 21 Rank Retrieved Documents; 22 Top-K Search over Embeddings; 27 Clean a Search Query | [01_rank_and_search_THEORY.md](01_rank_and_search_THEORY.md) | Scoring, ranking, and query cleaning that stay simple and explainable. |
| [02_index_health.ipynb](02_index_health.ipynb) | 23 Detect Stale Embeddings; 24 Validate an Embedding Record; 26 Batch Documents for Embedding | [02_index_health_THEORY.md](02_index_health_THEORY.md) | Keeping the index fresh, valid, and safely loaded. |
| [03_access_and_context.ipynb](03_access_and_context.ipynb) | 28 Inherit Document Permissions; 30 Pack Chunks into the Context Window | [03_access_and_context_THEORY.md](03_access_and_context_THEORY.md) | Controlling what the model may read: permissions and the token budget. |
| [04_debug_and_evaluate.ipynb](04_debug_and_evaluate.ipynb) | 25 Find Low-Confidence Retrievals; 29 Sample an Evaluation Set by Category | [04_debug_and_evaluate_THEORY.md](04_debug_and_evaluate_THEORY.md) | Finding weak retrieval and building a fair, repeatable test set. |
