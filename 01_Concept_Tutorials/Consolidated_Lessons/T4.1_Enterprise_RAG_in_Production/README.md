# T15.5 Enterprise RAG in Production: Consolidated Lessons

These seven lessons are the site's teaching copy of module T15.5 "Enterprise RAG in production". Each concept is taught once, in the house tutorial format, drawing only on the FDE Handbook's Enterprise RAG documents. The site publishes them at `/learn/production-ai/enterprise-rag-in-production`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [Why Access Control Shapes Enterprise RAG](01_Why_Access_Control_Shapes_Enterprise_RAG.md) | `why-access-control-shapes-enterprise-rag` |
| 2 | [The Seven Access Rules](02_The_Seven_Access_Rules.md) | `the-seven-access-rules` |
| 3 | [Pushing Policy Into the Index](03_Pushing_Policy_Into_the_Index.md) | `pushing-policy-into-the-index` |
| 4 | [Permission-Aware Ingestion](04_Permission_Aware_Ingestion.md) | `permission-aware-ingestion` |
| 5 | [The Security-First Query Graph](05_The_Security_First_Query_Graph.md) | `the-security-first-query-graph` |
| 6 | [Output Guardrails and Refusals](06_Output_Guardrails_and_Refusals.md) | `output-guardrails-and-refusals` |
| 7 | [Practise Enterprise RAG Interview Questions](07_Practise_Enterprise_RAG_Interview_Questions.md) | `practise-enterprise-rag` |

## Sources

All own material, from `01_Concept_Tutorials/FDE_Handbook/04_Enterprise_RAG/`:

- `01_Why_Enterprise_Changes_The_Problem.md`
- `02_Access_Control_ABAC.md`
- `03_Ingestion_Pipeline.md`
- `05_The_Query_Graph.md`
- `06_Output_Guardrails.md`

The source files stay in the repository unchanged. The site no longer publishes them as separate lessons; old URLs redirect to the matching lesson here. Three sibling documents are taught elsewhere: `04_Retrieval_Hybrid_Rerank.md` under T7.1, `07_Evaluation_Golden_Sets_Judges.md` under T15.7 and `08_Observability.md` under T15.9. `09_Module_Reference.md` and `10_Coverage_Map.md` are code references and are not published.

Every claim, number and code idea in these lessons comes from the five sources. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
