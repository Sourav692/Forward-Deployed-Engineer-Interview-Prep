# T7.1 Retrieval: Hybrid, Rerank, and Query Transformation: Consolidated Lessons

These seven lessons are the site's teaching copy of module T7.1 "Retrieval: hybrid, rerank, query transformation". Each concept is taught once, in the house tutorial format, drawing only on repository sources. The site publishes them at `/learn/llm-and-retrieval/retrieval-hybrid-rerank`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [Measuring and Diagnosing Retrieval](01_Measuring_and_Diagnosing_Retrieval.md) | `measuring-and-diagnosing-retrieval` |
| 2 | [Hybrid Search and Rank Fusion](02_Hybrid_Search_and_Rank_Fusion.md) | `hybrid-search-and-rank-fusion` |
| 3 | [Query Transformation](03_Query_Transformation.md) | `query-transformation` |
| 4 | [Reranking and Post-Retrieval Filtering](04_Reranking_and_Post_Retrieval_Filtering.md) | `reranking-and-post-retrieval-filtering` |
| 5 | [Retrieval Control Loops](05_Retrieval_Control_Loops.md) | `retrieval-control-loops` |
| 6 | [Production Retrieval Pipelines](06_Production_Retrieval_Pipelines.md) | `production-retrieval-pipelines` |
| 7 | [Practise Retrieval Interview Questions](07_Practise_Retrieval_Interview_Questions.md) | `practise-retrieval` |

## Sources

- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/04_rag_and_retrieval_INTERVIEW_TUTORIAL.md` (own material; its §4 answers quote and link external interview guides, so lessons that use them are summarised in our own words and carry a credit line).
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/08_advanced_rag_techniques_INTERVIEW_TUTORIAL.md` (own material built from a notebook collection; its §4 answers cite external guides and are treated the same way).
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/retrieval_strategies/rag_retrieval_strategies.md` (own material).
- `01_Concept_Tutorials/FDE_Handbook/04_Enterprise_RAG/04_Retrieval_Hybrid_Rerank.md` (own material).
- `01_Concept_Tutorials/FDE_Handbook/01_LLM_Systems_Foundations/02_Chunking_Retrieval_Fusion.md`, the retrieval, fusion, query and reranking sections (own material; its chunking section is taught in T6.2).
- `01_Concept_Tutorials/GenAI_Engineering_Modules/Module_01_RAG_Fundamentals_Core_Components.md`, Topics 6 "Query Expansion", 7 "Retrieval" and 8 "Hybrid Search and Re-Ranking" (own material).

The source files stay in the repository unchanged. The site no longer publishes the first four as separate lessons; old URLs redirect to the matching lesson here. Chunking, vector stores, parent-document retrieval, contextual retrieval and the index structures in the advanced-RAG tutorial (hierarchical indices, RAPTOR, GraphRAG, multi-modal) are taught in T6.2 Chunking and indexing. Access control during retrieval is taught in T15.5 Enterprise RAG in production.

Every claim, number and code idea in these lessons comes from the sources. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
