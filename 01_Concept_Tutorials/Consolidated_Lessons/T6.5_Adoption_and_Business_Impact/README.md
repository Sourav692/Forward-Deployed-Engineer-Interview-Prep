# T20.6 Adoption and Business Impact: Consolidated Lessons

These six lessons are the site's teaching copy of module T20.6 "Adoption, change management and business impact". The module is Partly ready: the sources cover rollout, impact measurement and a short adoption checklist, but not change management in depth. The site publishes the lessons at `/learn/forward-deployed/adoption-and-impact`.

| # | Lesson | Site slug | Status |
|---|---|---|---|
| 1 | [Rolling Out With a Way Back](01_Rolling_Out_With_a_Way_Back.md) | `rolling-out-with-a-way-back` | Published |
| 2 | [Proving Business Impact](02_Proving_Business_Impact.md) | `proving-business-impact` | Published |
| 3 | [Diagnosing Low Adoption](03_Diagnosing_Low_Adoption.md) | `diagnosing-low-adoption` | Published |
| 4 | [Training and Champions](04_Training_and_Champions.md) | `training-and-champions` | Drafted |
| 5 | [Measuring Trust and Overrides](05_Measuring_Trust_and_Overrides.md) | `measuring-trust-and-overrides` | Drafted |
| 6 | [Practise Adoption and Value](07_Practise_Adoption_and_Value.md) | `practise-adoption-and-value` | Drafted |

On 19 November 2026 "Realised Versus Estimated Value" merged into "Proving Business Impact", which keeps its slug. `realised-versus-estimated-value` redirects to it.

## Sources

- `05_FDE_Delivery_and_Scoping/Scoping_An_FDE_Project/Scoping-an-FDE-Project-Complete-Guide.md`, Module 5 "Roll Out, Operate, and Prove the Result". The guide is based on the fdehandbook.com "Scope a Project" course (third-party); lessons 1 and 2 summarise it in our own words and carry a credit line.
- `01_Concept_Tutorials/FDE_Handbook/10_FDE_Delivery_Operating_Model/04_Gates_Risks_Metrics.md`, "The five metrics" (lesson 2).
- `05_FDE_Delivery_and_Scoping/Delivery_Framework/INTERVIEW_SCRIPT.md`, the Northwind success metrics (lesson 2).
- `03_Practice_Worksheets_and_Keys/Problem_Decomposition_Bank/FDE_Problem_Decomposition_Question_Bank.md`, case 17's adoption follow-up, case 4 and the rollout questions (lesson 3, own material).

The source files stay in the repository unchanged. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.

Lessons 4 to 7 were added for the Forward Deployed Engineering track on 17 November 2026. They are the author's own, with fictional customers, and do not draw on the sources above. They add the change-management coverage (training, champions, trust and realised value) the module lacked. The site orders the lessons by the module's `lessons` list in `site/src/lib/curriculum.ts`, not by file number.
