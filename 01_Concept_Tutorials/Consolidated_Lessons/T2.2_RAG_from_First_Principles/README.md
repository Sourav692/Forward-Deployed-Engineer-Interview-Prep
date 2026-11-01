# T5.1 RAG from First Principles: Consolidated Lessons

These six lessons are the site's teaching copy of module T5.1 "RAG from first principles". Each concept is taught once, in the house tutorial format, drawing only on five repository sources. The site publishes them at `/learn/llm-and-retrieval/rag-from-first-principles`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [What RAG Is and When to Use It](01_What_RAG_Is_and_When_to_Use_It.md) | `what-rag-is-and-when-to-use-it` |
| 2 | [The RAG Pipeline End to End](02_The_RAG_Pipeline_End_to_End.md) | `the-rag-pipeline-end-to-end` |
| 3 | [Ingestion and Preprocessing](03_Ingestion_and_Preprocessing.md) | `ingestion-and-preprocessing` |
| 4 | [Grounded Generation](04_Grounded_Generation.md) | `grounded-generation` |
| 5 | [Evaluating Retrieval and Generation Separately](05_Evaluating_Retrieval_and_Generation_Separately.md) | `evaluating-retrieval-and-generation-separately` |
| 6 | [Practise RAG Fundamentals Interview Questions](06_Practise_RAG_Fundamentals_Interview_Questions.md) | `practise-rag-fundamentals` |

## Sources

- `01_Concept_Tutorials/FDE_Handbook/01_LLM_Systems_Foundations/01_What_RAG_Actually_Is.md` (own material).
- `01_Concept_Tutorials/GenAI_Engineering_Modules/Module_01_RAG_Fundamentals_Core_Components.md` (own material): Overview and Topics 1, 2, 7 (debugging), 9, 11 and 12 (prompt template and prompt injection). Topics 3 and 5 are taught in T6.2, Topics 6 to 8 in T7.1, and Topic 4 in T6.3.
- `01_Concept_Tutorials/GenAI_Engineering_Modules/Module_02_RAG_Frameworks_Tools_Implementation.md` (own material): Topic 4 "Evaluation Frameworks". Its framework topics are taught in T6.2 and T4.3.
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/04_rag_and_retrieval_INTERVIEW_TUTORIAL.md`: §1.1, the coverage gaps, and pipeline-level questions from §4 and §5. Its §4 answers link external guides; lesson 6 summarises those in our own words and carries a credit line.
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/08_advanced_rag_techniques_INTERVIEW_TUTORIAL.md` (own material): §1.1.

The source files stay in the repository unchanged. The site no longer publishes "What RAG Actually Is", the Module 1 RAG fundamentals guide or the Module 2 frameworks guide as separate lessons; old URLs redirect to the matching lesson here or in T4.3.

Every claim, number and code idea in these lessons comes from the sources. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
