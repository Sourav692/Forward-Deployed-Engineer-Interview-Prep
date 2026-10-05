# T2.3 Chunking and Indexing: Consolidated Lessons

These eight lessons are the site's teaching copy of module T2.3 "Chunking and indexing". Each concept is taught once, in the house tutorial format, drawing only on repository sources. The site publishes them at `/learn/llm-and-retrieval/chunking-and-indexing`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [Why Retrieval Needs Chunks](01_Why_Retrieval_Needs_Chunks.md) | `why-retrieval-needs-chunks` |
| 2 | [Chunking by Document Type](02_Chunking_by_Document_Type.md) | `chunking-by-document-type` |
| 3 | [How Vector Search Works](03_How_Vector_Search_Works.md) | `how-vector-search-works` |
| 4 | [Choosing a Database and Vector Store](04_Choosing_a_Database_and_Vector_Store.md) | `choosing-a-database-and-vector-store` |
| 5 | [Vector Indexes in Production](05_Vector_Indexes_in_Production.md) | `vector-indexes-in-production` |
| 6 | [Retrieve Small, Return Large](06_Retrieve_Small_Return_Large.md) | `retrieve-small-return-large` |
| 7 | [Advanced Index Structures](07_Advanced_Index_Structures.md) | `advanced-index-structures` |
| 8 | [Practise Chunking and Indexing Interview Questions](08_Practise_Chunking_and_Indexing_Interview_Questions.md) | `practise-chunking-and-indexing` |

## Sources

All under `01_Concept_Tutorials/`:

- `RAG_and_Agent_Topic_Guides/chunking/chunking-lab-and-drills.md` (own material).
- `RAG_and_Agent_Topic_Guides/chunking/chunking-reference-by-doc-type.md` (own material).
- `RAG_and_Agent_Topic_Guides/parent_document_retrieval_INTERVIEW_TUTORIAL.md` (own material; its interview answers cite external guides, so the practice lesson that rewrites them carries a credit line).
- `FDE_Handbook/01_LLM_Systems_Foundations/02_Chunking_Retrieval_Fusion.md` (own material): chunking and dense search. Its fusion, query rewriting and reranking sections are taught in T2.4.
- `GenAI_Engineering_Modules/Module_09_Memory_Databases_Caching_for_GenAI_Systems.md` (own material): Topics 2 and 3. Its memory topics are taught in T3.4 and its caching topic in T4.5.
- Slices of `GenAI_Engineering_Modules/Module_01_RAG_Fundamentals_Core_Components.md` (Topics 3 and 5), `GenAI_Engineering_Modules/Module_02_RAG_Frameworks_Tools_Implementation.md` (Topic 3), `RAG_and_Agent_Topic_Guides/04_rag_and_retrieval_INTERVIEW_TUTORIAL.md` (§1.2, §1.3, §1.10, §1.13, §1.14 and matching gotchas and trade-offs; its web-sourced interview section is not used) and `RAG_and_Agent_Topic_Guides/08_advanced_rag_techniques_INTERVIEW_TUTORIAL.md` (§1.2, §1.3, §1.11 to §1.14, §1.22 and matching gotchas and trade-offs).

The source files stay in the repository unchanged. Every claim, number and code idea in these lessons comes from them, and each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
