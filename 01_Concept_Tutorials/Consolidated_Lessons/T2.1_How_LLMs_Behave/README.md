# T2.1 How LLMs Behave: Consolidated Lessons

These three lessons are the site's teaching copy of module T2.1 "How LLMs behave, for engineers". Each concept is taught once, in the house tutorial format, drawing only on two repository sources. The site publishes them at `/learn/llm-and-retrieval/how-llms-behave`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [Embeddings and Similarity Search](01_Embeddings_and_Similarity_Search.md) | `embeddings-and-similarity-search` |
| 2 | [Choosing and Changing Embedding Models](02_Choosing_and_Changing_Embedding_Models.md) | `choosing-and-changing-embedding-models` |
| 3 | [Context Windows, Temperature, and Token Limits](03_Context_Windows_Temperature_and_Token_Limits.md) | `context-windows-temperature-and-token-limits` |

## Sources

- `01_Concept_Tutorials/GenAI_Engineering_Modules/Module_01_RAG_Fundamentals_Core_Components.md` (own material): Topic 4 "Embeddings", Topic 9 "Generation" (context windows, temperature, token limits) and Topic 11 (faithfulness levers).
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/04_rag_and_retrieval_INTERVIEW_TUTORIAL.md` (own material): §1.2 "Embeddings and cosine similarity", §2 "Gotchas" and one §5.1 question.

The module stays Partly ready. The sources hold no coherent material on tokens and tokenisation, sampling beyond temperature, or token cost estimation, so those gaps remain. The site no longer publishes the Module 1 embeddings slice as a separate lesson; its old URL redirects to lesson 1 here.

Every claim, number and code idea in these lessons comes from the sources. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
