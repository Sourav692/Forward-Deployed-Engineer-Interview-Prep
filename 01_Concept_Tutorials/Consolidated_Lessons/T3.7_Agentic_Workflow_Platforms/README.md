# T16.4 Agentic Workflow Platforms: Consolidated Lessons

These seven lessons are the site's teaching copy of module T16.4 "Agentic workflow platforms". Each concept is taught once, in the house tutorial format, drawing only on the FDE Handbook's Agentic Workflow Platforms documents. The site publishes them at `/learn/agentic-systems/agentic-workflow-platforms`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [Why Workflow Automation Is a Trust Problem](01_Why_Workflow_Automation_Is_a_Trust_Problem.md) | `why-workflow-automation-is-a-trust-problem` |
| 2 | [Canonical Events and Routing](02_Canonical_Events_and_Routing.md) | `canonical-events-and-routing` |
| 3 | [Determinism Over Free Text](03_Determinism_Over_Free_Text.md) | `determinism-over-free-text` |
| 4 | [Durability and Idempotency](04_Durability_and_Idempotency.md) | `durability-and-idempotency` |
| 5 | [Approvals and Spend Caps](05_Approvals_and_Spend_Caps.md) | `approvals-and-spend-caps` |
| 6 | [Staged Rollout](06_Staged_Rollout.md) | `staged-rollout` |
| 7 | [Practise Agentic Workflow Platform Interview Questions](07_Practise_Agentic_Workflow_Platform_Interview_Questions.md) | `practise-agentic-workflow-platforms` |

## Sources

All sources are own material in `01_Concept_Tutorials/FDE_Handbook/05_Agentic_Workflow_Platforms/`:

- `01_The_Problem_In_Plain_English.md`
- `02_Canonical_Events_And_Channels.md`
- `03_Determinism_Over_Free_Text.md`
- `04_Durability_And_Idempotency.md`
- `05_Approvals_Spend_Caps_Staged_Rollout.md`
- `07_Coverage_Map.md`, used for the honest gaps and the likely interview follow-ups. It was never published as its own lesson.

`06_Module_Reference.md` is a function-by-function reference to the companion code and is not used: the lessons teach the concepts, not the package API.

The source files stay in the repository unchanged. The site no longer publishes the five Handbook documents as separate lessons; old URLs redirect to the matching lesson here. Every claim, number and code idea in these lessons comes from the sources above. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
