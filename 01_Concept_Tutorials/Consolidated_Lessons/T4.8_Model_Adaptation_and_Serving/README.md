# T16.12 Model Adaptation and Inference Serving: Consolidated Lessons

These four lessons are the site's teaching copy of module T16.12 "Model adaptation and inference serving". Each concept is taught once, in the house tutorial format, drawing only on repository sources. The site publishes them at `/learn/production-ai/model-adaptation-and-serving`. The module stays Partly ready: the sources do not cover fine-tuning methods or serving internals such as GPU sizing.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [Four Learning Surfaces](01_Four_Learning_Surfaces.md) | `four-learning-surfaces` |
| 2 | [The Skill Library and Its Promotion Gate](02_The_Skill_Library_and_Its_Promotion_Gate.md) | `the-skill-library-and-its-promotion-gate` |
| 3 | [When Fine-Tuning Earns Its Cost](03_When_Fine_Tuning_Earns_Its_Cost.md) | `when-fine-tuning-earns-its-cost` |
| 4 | [The Data Flywheel](04_The_Data_Flywheel.md) | `the-data-flywheel` |

## Sources

- `01_Concept_Tutorials/Agentic_System_Design_Book/ch08_learning_in_agentic_systems.md`, Chapter 8 of *Cracking Agentic AI System Design Interviews* (third-party; its ideas are summarised in our own words, and every lesson here carries a credit line).
- `01_Concept_Tutorials/Cost_and_Latency_Optimization/CRAM_SHEET_FULL_PLAYBOOK.md`, notes on the third-party *GenAI FDE Cost and Latency Optimization Playbook*: fine-tuning, GPU hosting and self-hosted versus managed rows (lesson 3 only, summarised in our own words).

The source files stay in the repository unchanged. The old lesson "Chapter 8 — Learning in Agentic Systems" now redirects here. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
