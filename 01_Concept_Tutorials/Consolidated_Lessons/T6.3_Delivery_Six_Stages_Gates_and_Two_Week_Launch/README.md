# T20.5 Delivery: Six Stages, Gates, and Two-Week Launch: Consolidated Lessons

These eleven lessons are the site's teaching copy of module T20.5 "Delivery: six stages, gates, two-week launch". Each concept is taught once, in the house tutorial format, drawing only on nine repository sources. The site publishes them at `/learn/forward-deployed/delivery-stages-and-gates`.

| # | Lesson | File | Site slug | Status |
|---|---|---|---|---|
| 1 | [Telling a Delivery Story in Six Stages](01_Telling_a_Delivery_Story_in_Six_Stages.md) | `01` | `telling-a-delivery-story-in-six-stages` | Published |
| 2 | [Delivery as a Repeatable Process](02_Delivery_as_a_Repeatable_Process.md) | `02` | `delivery-as-a-repeatable-process` | Published |
| 3 | [Role-Gated Stage Gates](03_Role_Gated_Stage_Gates.md) | `03` | `role-gated-stage-gates` | Published |
| 4 | [Risk Checks and Delivery Metrics](04_Risk_Checks_and_Delivery_Metrics.md) | `04` | `risk-checks-and-delivery-metrics` | Published |
| 5 | [Securing the Delivery Process](05_Securing_the_Delivery_Process.md) | `05` | `securing-the-delivery-process` | Published |
| 6 | [Cross-Team Ownership and Cadence](06_Cross_Team_Ownership_and_Cadence.md) | `06` | `cross-team-ownership-and-cadence` | Published |
| 7 | [Pilots That Predict Production](08_Pilots_That_Predict_Production.md) | `08` | `pilots-that-predict-production` | Published |
| 8 | [Onboarding a New Customer Integration](11_Onboarding_a_New_Customer_Integration.md) | `11` | `onboarding-a-new-customer-integration` | Published |
| 9 | [Handover and Ownership](09_Handover_and_Ownership.md) | `09` | `handover-and-ownership` | Published |
| 10 | [Practise the Two-Week Delivery Round](07_Practise_the_Two_Week_Delivery_Round.md) | `07` | `practise-the-two-week-delivery-round` | Published |
| 11 | [Practise Pilots and Handover](10_Practise_Pilots_and_Handover.md) | `10` | `practise-pilots-and-handover` | Published |

## Sources

- `01_Concept_Tutorials/FDE_Handbook/10_FDE_Delivery_Operating_Model/02_End_To_End_AI_Delivery_Six_Stages.md` to `05_Cross_Team_Collaboration.md` (own material).
- `05_FDE_Delivery_and_Scoping/Delivery_Framework/README.md`, `docs/01-theory.md`, `docs/02-architecture-end-to-end.md`, `docs/05-security-gate-depth-and-tenant-scale.md` and `INTERVIEW_SCRIPT.md` (own material). The theory doc and the interview script quote their problem prompt, and build on the stages, gates, risks and metrics, from the DevRev interview preparation guide. Lessons 2, 3, 4 and 7 draw on that framing, summarise it in our own words and carry a credit line.

The source files stay in the repository unchanged. The site no longer publishes them as separate lessons; old URLs redirect to the matching lesson here. The former `a-day-in-the-life` lesson (`01_A_Day_In_The_Life.md`) duplicated T0.2's "A Senior FDE's Day", so its URL now redirects there and this module lists that lesson as a see-also.

Every claim, number and example in these lessons comes from the sources. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.

Lessons 8 to 10 were added for the Forward Deployed Engineering track on 17 November 2026. They are the author's own, with fictional customers, and do not draw on the sources above. Lesson 11, "Onboarding a new customer integration", was added for the Integration plan on 18 November 2026. It is the author's own, with fictional customers, and the practice lesson `10` gained one question for it. The site orders the lessons by the module's `lessons` list in `site/src/lib/curriculum.ts`, not by file number. On 19 November 2026 the order changed to follow the engagement: the gated process and its risk and security checks first, then cross-team running, then pilot, launch and handover.
