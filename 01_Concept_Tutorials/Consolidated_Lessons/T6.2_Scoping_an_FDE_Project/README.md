# T20.2 Scoping an FDE Project: Consolidated Lessons

These nine lessons are the site's teaching copy of module T20.2 "Scoping an FDE project". Each concept is taught once, in the house tutorial format. The site publishes them at `/learn/forward-deployed/scoping-an-fde-project`, in this order:

| # | Lesson | File | Site slug |
|---|---|---|---|
| 1 | Problem, Goal, and Definition of Done | [01](01_Problem_Goal_and_Definition_of_Done.md) | `problem-goal-and-definition-of-done` |
| 2 | Baselines, Value and ROI | [08](08_Baselines_Value_and_ROI.md) | `baselines-value-and-roi` |
| 3 | Build, Buy, Configure or No AI | [09](09_Build_Buy_Configure_or_No_AI.md) | `build-buy-configure-or-no-ai` |
| 4 | Sizing the Work a Demo Hides | [02](02_Sizing_the_Work_a_Demo_Hides.md) | `the-system-behind-the-screens` |
| 5 | Shrinking to a First Release | [04](04_Shrinking_to_a_First_Release.md) | `shrinking-to-a-first-release` |
| 6 | Estimates People Can Trust | [05](05_Estimates_People_Can_Trust.md) | `estimates-people-can-trust` |
| 7 | From Estimate to Build Plan | [06](06_From_Estimate_to_Build_Plan.md) | `from-estimate-to-build-plan` |
| 8 | Scoping in Practice | [07](07_Scoping_in_Practice.md) | `scoping-in-practice` |
| 9 | Practise Scoping and Value Questions | [10](10_Practise_Scoping_and_Value_Questions.md) | `practise-scoping-and-value-questions` |

On 19 November 2026 "The System Behind the Screens" and "Estimating AI Work as a Product" merged into "Sizing the Work a Demo Hides", because both taught one skill: finding the work a demo hides before sizing it. The merged lesson keeps the first lesson's slug, and `estimating-ai-work-as-a-product` redirects to it. Each teaching lesson opens with a short composite engagement scene.

## Sources

- `05_FDE_Delivery_and_Scoping/Scoping_An_FDE_Project/Scoping-an-FDE-Project-Complete-Guide.md`, Modules 1 to 4 and 6 to 8. The guide is based on the fdehandbook.com "Scope a Project" course (third-party). Its ideas are summarised here in our own words, and every lesson carries a credit line.

Module 5 of the guide ("Roll Out, Operate, and Prove the Result") is taught in T20.6, in `../T6.5_Adoption_and_Business_Impact/`. The source file stays in the repository unchanged. The site no longer publishes it as a separate lesson, and its old URL redirects to the first lesson here.

The lessons in files 08 to 10 were added for the Forward Deployed Engineering track (17 November 2026). They are the author's own, with fictional customers, and do not draw on the guide. The site orders the lessons by the module's `lessons` list in `site/src/lib/curriculum.ts`, not by file number.

Each lesson from the guide ends with a References entry naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
