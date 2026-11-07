# T1.3 Cloud, Containers and Deployment: Consolidated Lessons

These seven lessons are the site's teaching copy of module T1.3 "Cloud, containers and deployment". Each concept is taught once, in the house tutorial format, drawing only on two repository sources. The site publishes them at `/learn/engineering-foundations/cloud-containers-deployment`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [Package the Service and Keep Secrets Out](01_Package_the_Service_and_Keep_Secrets_Out.md) | `package-the-service-and-keep-secrets-out` |
| 2 | [Choose a Runtime and Scale It](02_Choose_a_Runtime_and_Scale_It.md) | `choose-a-runtime-and-scale-it` |
| 3 | [Gate Releases on Quality](03_Gate_Releases_on_Quality.md) | `gate-releases-on-quality` |
| 4 | [Roll Out Changes Gradually](04_Roll_Out_Changes_Gradually.md) | `roll-out-changes-gradually` |
| 5 | [Observe the Running Service](05_Observe_the_Running_Service.md) | `observe-the-running-service` |
| 6 | [Degrade Gracefully and Load Test](06_Degrade_Gracefully_and_Load_Test.md) | `degrade-gracefully-and-load-test` |
| 7 | [Practise Deployment Interview Questions](07_Practise_Deployment_Interview_Questions.md) | `practise-deployment` |

## Sources

- `01_Concept_Tutorials/GenAI_Engineering_Modules/Module_10_Backend_FastAPI_Deployment.md`, Topic 3 "Deployment & Infrastructure" and Topic 4 "Production Operations" (own material).
- `01_Concept_Tutorials/FDE_Handbook/06_Cross_Cutting_Concerns/03_Caching_Streaming_CICD_BuildVsBuy.md`, sections 3 to 6 on scheduled regression runs, A/B testing, statistical rigour and prompt unit tests (own material).

The source files stay in the repository unchanged. The site no longer publishes `module-10-deployment-and-operations` as a separate lesson; its old URL redirects here. The overview and Topics 1 and 2 of Module 10, and sections 1, 2 and 7 of the caching document (semantic caching, token streaming, build versus buy), are taught in T1.2 APIs and backend. `infra-and-cicd` (T16.8) stays a see-also lesson for this module.

## Source notes

- The two sources give different example canary sizes: the CI/CD pipeline example uses 10% of traffic, the model-upgrade example starts at 5% of users. Both are examples, and the lessons keep each in its own context.
- Module 10 says an HPA scales on CPU "and on a custom metric like queue depth", then says KEDA can scale from a queue "which HPA cannot do on its own". Lesson 2 keeps both statements: HPA for CPU-bound tiers, KEDA for queue-driven GPU scaling.

Every claim, number and code idea in these lessons comes from the two sources; worked-example scenarios apply the sources' figures. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
