# T4.2 Evaluation and Release Gates: Consolidated Lessons

These six lessons are the site's teaching copy of module T4.2 "Evaluation and release gates". Each concept is taught once, in the house tutorial format, drawing only on three repository sources. The site publishes them at `/learn/production-ai/evaluation-and-release-gates`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [The Evaluation Pyramid](01_The_Evaluation_Pyramid.md) | `the-evaluation-pyramid` |
| 2 | [Component and Trajectory Metrics](02_Component_and_Trajectory_Metrics.md) | `component-and-trajectory-metrics` |
| 3 | [Golden Sets and Sample Size](03_Golden_Sets_and_Sample_Size.md) | `golden-sets-and-sample-size` |
| 4 | [Validating LLM Judges](04_Validating_LLM_Judges.md) | `validating-llm-judges` |
| 5 | [Release Gates: Safety, Quality, and Cost](05_Release_Gates_Safety_Quality_and_Cost.md) | `release-gates-safety-quality-and-cost` |
| 6 | [Practise Evaluation and Release-Gate Interview Questions](06_Practise_Evaluation_Interview_Questions.md) | `practise-evaluation-and-release-gates` |

## Sources

- `01_Concept_Tutorials/FDE_Handbook/04_Enterprise_RAG/07_Evaluation_Golden_Sets_Judges.md` (own material).
- `01_Concept_Tutorials/Agentic_System_Design_Book/ch12_validation_and_measurement.md`, Chapter 12 of *Cracking Agentic AI System Design Interviews* (third-party; its ideas are summarised in our own words, and every lesson here carries a credit line).
- `01_Concept_Tutorials/Production_and_Platform_Judgment/Cross_Cutting_System_Design_Quick_Reference_v2.md`, §8 "CI/CD Rigor for AI Systems" only (own material). Its rollout, rollback and A/B material belongs to T4.7 AgentOps.

The source files stay in the repository unchanged. The site no longer publishes the first two as separate lessons; old URLs redirect to the matching lesson here.

Two source conflicts are named in the lessons. The Handbook calibrates its judge on 6 labelled cases, while Chapter 12 asks for at least 100 (lesson 4). The quick reference promotes a canary on a 3-point gain from a 250-query arm, which Chapter 12's sample-size rule says is far too small (lesson 5).

Every claim, number and code idea in these lessons comes from the three sources. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
