# T5.4 Casebook: Classic AI Designs: Consolidated Lessons

These nine lessons are the site's teaching copy of module T5.4 "Casebook: classic AI designs". The site publishes them at `/learn/ai-systems-design/classic-ai-designs`.

The casebook is organised **per design case**, not per design pattern. Interviews arrive as a prompt ("design a coding assistant"), and each case teaches how one prompt's requirements move the boxes. The patterns themselves (circuit breakers, gateways, caches, approval gates) are already taught once in T5.1 and T5.3, so a per-pattern casebook would repeat those lessons and scatter each design across several pages. Overlap between cases is removed instead: the coverage map is folded into the customer support lesson, and the Databricks lesson teaches only what differs from the platform-agnostic access-controlled RAG design.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [Enterprise AI Assistant: Integration Layers at Scale](01_Enterprise_AI_Assistant_Integration_Layers_at_Scale.md) | `enterprise-ai-assistant-integration-layers-at-scale` |
| 2 | [Customer Support Assistant: Knowledge, Actions, and Approval](02_Customer_Support_Assistant_Knowledge_Actions_and_Approval.md) | `customer-support-assistant-knowledge-actions-and-approval` |
| 3 | [Coding Assistant: Context Engineering Under 300 ms](03_Coding_Assistant_Context_Engineering_Under_300_ms.md) | `coding-assistant-context-engineering-under-300-ms` |
| 4 | [Recruiting Platform: Explainable Ranking, Human Decisions](04_Recruiting_Platform_Explainable_Ranking_Human_Decisions.md) | `recruiting-platform-explainable-ranking-human-decisions` |
| 5 | [Logistics Exceptions: Designing Around a Policy Gate](05_Logistics_Exceptions_Designing_Around_a_Policy_Gate.md) | `logistics-exceptions-designing-around-a-policy-gate` |
| 6 | [Access-Controlled Enterprise RAG](06_Access_Controlled_Enterprise_RAG.md) | `access-controlled-enterprise-rag` |
| 7 | [Access-Controlled RAG on Databricks](07_Access_Controlled_RAG_on_Databricks.md) | `access-controlled-rag-on-databricks` |
| 8 | [Safe Workflow Automation for Non-Technical Users](08_Safe_Workflow_Automation_for_Non_Technical_Users.md) | `safe-workflow-automation-for-non-technical-users` |
| 9 | [Delivering an Agent in Two Weeks with Enforced Gates](09_Delivering_an_Agent_in_Two_Weeks_with_Enforced_Gates.md) | `delivering-an-agent-in-two-weeks-with-enforced-gates` |

## Sources

All own material, under `02_System_Design_Case_Studies/Classic_Design_Walkthroughs/Handbook_Casebook/`:

- `01_Enterprise_AI_Assistant.md`, lesson 1.
- `02_Customer_Support_Assistant.md` and `06_Agentic_Coverage_Map.md`, lesson 2.
- `03_Coding_Assistant.md`, lesson 3.
- `04_Recruiting_Platform.md`, lesson 4.
- `05_Logistics_Exception_Handling.md`, lesson 5.
- `whiteboard_scripts/01_Enterprise_RAG_With_Access_Control.md`, lesson 6.
- `whiteboard_scripts/02_Enterprise_RAG_On_Databricks.md`, lesson 7.
- `whiteboard_scripts/03_Agent_Platform_For_Non_Technical_Users.md`, lesson 8.
- `whiteboard_scripts/04_Scoping_Doc_To_Deployed_Agent_In_Two_Weeks.md`, lesson 9.

The source files stay in the repository unchanged. The site no longer publishes them as separate lessons; old URLs redirect to the matching lesson here. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
