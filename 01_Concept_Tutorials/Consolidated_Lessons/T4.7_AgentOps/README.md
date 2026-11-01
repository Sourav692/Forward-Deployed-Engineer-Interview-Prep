# T15.8 AgentOps: Versioning, Rollout, CI/CD, and Red Teaming: Consolidated Lessons

These lessons are the site's teaching copy of module T15.8 "AgentOps: versioning, rollout, CI/CD, red teaming". Each concept is taught once, in the house tutorial format, drawing only on repository sources. The site publishes them at `/learn/production-ai/agentops`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [Prompt Versioning, Rollout, and Rollback](01_Prompt_Versioning_Rollout_and_Rollback.md) | `prompt-versioning-rollout-and-rollback` |
| 2 | [Testing Prompt Changes](02_Testing_Prompt_Changes.md) | `testing-prompt-changes` |
| 3 | [AgentOps Mapped to Databricks](03_AgentOps_Mapped_to_Databricks.md) | `agentops-mapped-to-databricks` |
| 4 | [Enterprise RAG on a Governed Lakehouse](04_Enterprise_RAG_on_a_Governed_Lakehouse.md) | `enterprise-rag-on-a-governed-lakehouse` |
| 5 | [Channel Adapters and Human Escalation](05_Channel_Adapters_and_Human_Escalation.md) | `channel-adapters-and-human-escalation` |
| 6 | [Red Teaming and Layered Guardrails](06_Red_Teaming_and_Layered_Guardrails.md) | `red-teaming-and-layered-guardrails` |
| 7 | [Infrastructure as Code and the Release Pipeline](07_Infrastructure_as_Code_and_the_Release_Pipeline.md) | `infrastructure-as-code-and-the-release-pipeline` |
| 8 | [Practise AgentOps Interview Questions](08_Practise_AgentOps_Interview_Questions.md) | `practise-agentops` |

Lessons 3 and 4 are Databricks-specific and are not published on the site (`publish: 'excluded'` in `site/src/lib/curriculum.ts`). They wait for a platform track, listed under future additions in the production plan; their old URLs redirect to lesson 1 and to the access-control lesson of T15.5.

## Sources

- `01_Concept_Tutorials/FDE_Handbook/08_AgentOps_And_Platform/01_` to `06_` (own material).
- `01_Concept_Tutorials/Production_and_Platform_Judgment/04-agentops-on-databricks.md` (own material; it duplicates handbook doc 2 and is merged into lesson 3).
- `01_Concept_Tutorials/Production_and_Platform_Judgment/03-cost-latency-cicd-rigor-and-build-vs-buy.md`: nightly regression, A/B testing, statistical rigour, prompt unit tests and build versus buy (own material).
- `01_Concept_Tutorials/RAG_and_Agent_Topic_Guides/12_production_and_operations_INTERVIEW_TUTORIAL.md`: unit testing with mocks, red teaming, guardrails, moderation and PII masking (own material; web-sourced interview answers not reused).
- `01_Concept_Tutorials/Cost_and_Latency_Optimization/` notes on the third-party *GenAI FDE Cost and Latency Optimization Playbook* (lesson 2 only, summarised in our own words, with a credit line).

The source files stay in the repository unchanged. The site no longer publishes the seven old T15.8 lessons separately; old URLs redirect to the matching lesson here. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
