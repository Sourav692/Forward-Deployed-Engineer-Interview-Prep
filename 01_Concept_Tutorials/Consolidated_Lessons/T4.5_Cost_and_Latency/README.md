# T16.10 Cost and Latency Optimisation: Consolidated Lessons

These eight lessons are the site's teaching copy of module T16.10 "Cost and latency optimisation". Each concept is taught once, in the house tutorial format, drawing only on repository sources. The site publishes them at `/learn/production-ai/cost-and-latency`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [Why Cost and Latency Decide Production](01_Why_Cost_and_Latency_Decide_Production.md) | `why-cost-and-latency-decide-production` |
| 2 | [The Eight Cost and Latency Drivers](02_The_Eight_Cost_and_Latency_Drivers.md) | `the-eight-cost-and-latency-drivers` |
| 3 | [Latency: Prefill, Decode, Streaming, and the Tail](03_Latency_Prefill_Decode_Streaming_and_the_Tail.md) | `latency-prefill-decode-streaming-and-the-tail` |
| 4 | [Model Routing and Prompt Discipline](04_Model_Routing_and_Prompt_Discipline.md) | `model-routing-and-prompt-discipline` |
| 5 | [Caching in GenAI Systems](05_Caching_in_GenAI_Systems.md) | `caching-in-genai-systems` |
| 6 | [RAG and Agent Cost Controls](06_RAG_and_Agent_Cost_Controls.md) | `rag-and-agent-cost-controls` |
| 7 | [Budgets and Spend Guardrails](07_Budgets_and_Spend_Guardrails.md) | `budgets-and-spend-guardrails` |
| 8 | [Practise Cost and Latency Interview Questions](08_Practise_Cost_and_Latency_Interview_Questions.md) | `practise-cost-and-latency` |

## Sources

- `01_Concept_Tutorials/Cost_and_Latency_Optimization/CORE_8_DRIVERS_MEMORIZE.md`, `CRAM_SHEET_FULL_PLAYBOOK.md` and `CRAM_SHEET_S15_S16.md`: notes on the third-party *GenAI FDE Cost and Latency Optimization Playbook* (Tobias Weissmann). Its ideas are summarised in our own words, and every lesson here carries a credit line.
- `01_Concept_Tutorials/Cost_and_Latency_Optimization/ADDITIONS_BEYOND_PLAYBOOK.md` (own companion notes; its price table is dated 2026-06-24 and must be rechecked before quoting).
- `01_Concept_Tutorials/Production_and_Platform_Judgment/03-cost-latency-cicd-rigor-and-build-vs-buy.md` (own material; its CI/CD and build-versus-buy sections are taught in T16.8).
- `01_Concept_Tutorials/GenAI_Engineering_Modules/Module_09_Memory_Databases_Caching_for_GenAI_Systems.md`, Topic 4 "Caching in GenAI Systems" (own material; its memory topics are taught in T11.2 and its database topics in T6.2).
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/12_production_and_operations_INTERVIEW_TUTORIAL.md`: caching, routing, streaming and token budgets (own material; its web-sourced interview answers are not reused).

The source files stay in the repository unchanged. The site no longer publishes the six old T16.10 lessons separately, including the Module 9 caching slice; old URLs redirect to the matching lesson here. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
