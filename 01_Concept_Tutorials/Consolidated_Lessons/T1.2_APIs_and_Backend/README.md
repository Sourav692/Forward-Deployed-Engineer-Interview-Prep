# T1.2 APIs and Backend: Consolidated Lessons

These seven lessons are the site's teaching copy of module T1.2 "APIs and backend for AI apps". Each concept is taught once, in the house tutorial format, drawing only on two repository sources. The site publishes them at `/learn/engineering-foundations/apis-and-backend`.

| # | Lesson | Site slug | Status |
|---|---|---|---|
| 1 | [Keep the Request Path Free](01_Keep_the_Request_Path_Free.md) | `keep-the-request-path-free` | Published |
| 2 | [Structure the Service and Decide What to Build](02_Structure_the_Service_and_Decide_What_to_Build.md) | `structure-the-service-and-decide-what-to-build` | Published |
| 3 | [Define the API Contract With Typed Schemas](03_Define_the_API_Contract_With_Typed_Schemas.md) | `define-the-api-contract-with-typed-schemas` | Published |
| 4 | [Protect the Endpoint From Abuse and Cost](04_Protect_the_Endpoint_From_Abuse_and_Cost.md) | `protect-the-endpoint-from-abuse-and-cost` | Published |
| 5 | [Build a Streaming Chat Endpoint](05_Build_a_Streaming_Chat_Endpoint.md) | `build-a-streaming-chat-endpoint` | Published |
| 6 | [Cache Answers Without Serving Wrong Ones](06_Cache_Answers_Without_Serving_Wrong_Ones.md) | `cache-answers-without-serving-wrong-ones` | Published |
| 7 | [Practise API and Backend Interview Questions](07_Practise_API_and_Backend_Interview_Questions.md) | `practise-api-and-backend` | Published |
| 8 | [Pagination, Filtering and Versioning](08_Pagination_Filtering_and_Versioning.md) | `pagination-filtering-and-versioning` | Drafted |
| 9 | [Authorise Every Object](09_Authorise_Every_Object.md) | `authorise-every-object` | Drafted |
| 10 | [Idempotent Writes and Long-Running Jobs](10_Idempotent_Writes_and_Long_Running_Jobs.md) | `idempotent-writes-and-long-running-jobs` | Drafted |

Lessons 8 to 10 are the author's own, added for the FDE track on 17 November 2026, with fictional customers. They do not draw on the two sources below, and each lists its own references. File numbers follow the folder, and the order on the site comes from the module's `lessons` array.

## Sources

- `01_Concept_Tutorials/GenAI_Engineering_Modules/Module_10_Backend_FastAPI_Deployment.md` (own material): the overview and the FastAPI Architecture and LLM Serving APIs sections. Its Deployment and Infrastructure and Production Operations sections are taught in T1.3 Cloud, containers and deployment.
- `01_Concept_Tutorials/FDE_Handbook/06_Cross_Cutting_Concerns/03_Caching_Streaming_CICD_BuildVsBuy.md` (own material): §1 semantic caching, §2 token streaming, §7 build vs buy, and the interview lens. Its CI/CD-rigor sections (§3 to §6: nightly regression runs, A/B testing, statistical rigor and prompt unit tests) are taught in the T1.3 lesson "Gate Releases on Quality".

The source files stay in the repository unchanged. The site no longer publishes `module-10-backend-fastapi-deployment` or `caching-streaming-cicd-buildvsbuy` as separate lessons; old URLs redirect to lessons here. Authentication beyond API keys and JWTs, secrets and per-tenant keys are taught in T16.6 (`identity-secrets-tenant-fairness`), which this module lists under "See also".

The two sources do not conflict. They overlap only on streaming: Module 10 covers the transport and endpoint mechanics, and the handbook adds that streaming is a perceived-latency, channel-layer decision taken after the "can I answer?" check. Lesson 5 teaches both.

Every claim, number and code idea in these lessons comes from the two sources. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
