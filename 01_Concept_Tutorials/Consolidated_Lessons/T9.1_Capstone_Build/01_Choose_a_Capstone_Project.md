# Choose a Capstone Project

*A broad capstone shows range but rarely finishes, so pick one companion project that matches the interview area most in need of proof.*

◷ 3 min

This repository teaches the theory; the runnable systems live in a separate companion repository. Pick one of its seven projects as the capstone base. Then read [Build From a Pinned Revision](02_Build_From_a_Pinned_Revision.md) before writing any code.

**Objectives:**

- match an FDE topic to the companion project that implements it;
- choose one capstone by the interview area you need to prove;
- say what this module does and does not yet provide.

---

## Know What This Module Provides Today

The capstone module asks for an end-to-end system with evaluation and operations. The repository does not yet hold capstone briefs or hands-on lab code. What it does hold is a map from each FDE topic to a working implementation in the companion repository. This lesson is that map, used as a capstone menu.

The material is theoretical and interview-focused by design. Runnable implementations live in the split projects repository, [`Sourav692/ai-engineering-demystified-14-projects`](https://github.com/Sourav692/ai-engineering-demystified-14-projects). They are not copied here.

## Pick One Project From the Map

Seven companion projects cover the FDE topics. Each sits under `projects/` at the pinned revision.

| FDE topic | Companion project |
|---|---|
| Enterprise RAG and access control | `03_enterprise_realtime_capstones/01_enterprise_rag_platform/` |
| Agentic workflow platforms | `03_enterprise_realtime_capstones/02_enterprise_agentic_workflow_platform/` |
| Multi-agent research systems | `03_enterprise_realtime_capstones/03_enterprise_multi_agent_research_platform/` |
| Deterministic FDE delivery framework | `03_enterprise_realtime_capstones/04_fde_delivery_framework/` |
| Real-time voice agents | `03_enterprise_realtime_capstones/05_realtime_voice_ai_agent_with_rag/` |
| Customer-support agents | `02_retrieval_agent_projects/05_ai_powered_customer_support/` |
| Tool-calling foundations and robust agents | `01_foundational_projects/01_agent_tool_calling_foundations/` |

Choose by the expected round, not by size. One finished project with evidence beats three half-built ones.

## Make Evaluation Part of the Capstone

The common mistake in this module is a demo without evaluation. A demo shows the system working once. An evaluation shows how often it works and how it fails.

The material's own standard applies here. For each claim the capstone makes, mark whether it is demonstrated in code or only asserted. That coverage-map habit is what makes the project defensible in a deep dive.

> **Warning: a capstone without an evaluation is a demo.** Interviewers probing a project deep dive ask how you know it works. Plan the evaluation before the features.

## Worked Example: Choosing for an FDE Loop

A candidate's weakest area is enterprise RAG with access control. They pick `01_enterprise_rag_platform`. They do not start from the multi-agent research platform, although it looks more impressive.

They fork the project at the pinned revision. Before adding features they write down the claims they want to prove, such as zero leaks on a golden set. Each claim gets a test or a measurement. The chosen project now answers the interview area they most needed, with evidence behind it.

---

## Key Takeaways

- The module has no capstone briefs or lab code yet; the companion-project map is the menu.
- Seven companion projects cover the FDE topics; pick one by the interview area you need to prove.
- Plan the evaluation first, and mark every claim as demonstrated or asserted.

## Check Yourself

1. **Where do the runnable implementations live?**
   In the split projects repository, `Sourav692/ai-engineering-demystified-14-projects`, not in this repository.

2. **Which companion project matches customer-support agents?**
   `projects/02_retrieval_agent_projects/05_ai_powered_customer_support/`.

3. **What separates a capstone from a demo?**
   An evaluation: evidence of how often the system works and how it fails, with each claim marked as demonstrated or asserted.

## References

**Sources:** `00_Start_Here/COMPANION_COURSE.md`: the introduction and "Current canonical project mappings". `01_Concept_Tutorials/FDE_Handbook/00_Orientation/01_How_To_Use_This_Handbook.md`: the "Honest about what is proven" principle. The module's own objective and common mistake come from the course curriculum.
