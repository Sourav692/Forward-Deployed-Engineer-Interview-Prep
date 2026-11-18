# T20.1 Customer Discovery and Problem Decomposition: Consolidated Lessons

These eight lessons are the site's teaching copy of module T20.1 "Customer discovery and problem decomposition". Each concept is taught once, in the house tutorial format. The site publishes them at `/learn/forward-deployed/customer-discovery`, in the order below (the 7-step order lesson 1 teaches), which is not the file-number order.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [The Discovery Conversation](01_The_Discovery_Conversation.md) | `the-discovery-conversation` |
| 2 | [Observing the Work](06_Observing_the_Work.md) | `observing-the-work` |
| 3 | [Stakeholder and Workflow Maps](07_Stakeholder_and_Workflow_Maps.md) | `stakeholder-and-workflow-maps` |
| 4 | [Choosing the First Use Case](04_Choosing_the_First_Use_Case.md) | `choosing-the-first-use-case` |
| 5 | [Success Metrics and Evaluation Data](03_Success_Metrics_and_Evaluation_Data.md) | `success-metrics-and-evaluation-data` |
| 6 | [Decomposing a Solution Into Workstreams](02_Decomposing_a_Solution_Into_Workstreams.md) | `decomposing-a-solution-into-workstreams` |
| 7 | [Practise Discovery Questions](08_Practise_Discovery_Questions.md) | `practise-discovery-questions-1` |
| 8 | [Practise Decomposition Interview Cases](05_Practise_Decomposition_Interview_Cases.md) | `practise-decomposition-interview-cases` |

The practice page merged the former parts 1 and 2 on 19 November 2026. It keeps the part 1 slug, and `practise-discovery-questions-2` redirects to it. Each teaching lesson opens with a composite enterprise scene that the lesson then answers.

## Sources

- `03_Practice_Worksheets_and_Keys/Problem_Decomposition_Bank/FDE_Problem_Decomposition_Question_Bank.md` (own material).

The source file stays in the repository unchanged. The site no longer publishes it as a separate lesson; its old URL redirects to the first lesson here. Its adoption follow-up (case 17) is taught in T20.6 "Diagnosing Low Adoption".

Files 01 to 05 draw every claim, number and example from that source, except cases 7 to 10 in file 05 and the opening scenes (composite engagements, rewritten 19 November 2026). Observing the work, stakeholder and workflow maps, the practice questions and those four cases were added for the Forward Deployed Engineering track (17 November 2026) and are the author's own, with fictional customers. The site orders the lessons by the module's `lessons` list in `site/src/lib/curriculum.ts`, not by file number. Each lesson lists the sections it used under References. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
