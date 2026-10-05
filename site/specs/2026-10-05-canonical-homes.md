# Canonical Lesson Homes

Date: 5 October 2026. Phase 0 tasks DATA-03 (report) and PM-03 (owner decision) of `2026-10-05-production-implementation-plan.md`.

Every lesson in `src/lib/curriculum.ts` has exactly one home module (`Lesson.home`). The home module teaches it. Every other module that uses the lesson lists it under `seeAlso` and links to the home lesson, so no lesson page is duplicated. Regenerate this table with `npm run check:curriculum -- --homes`.

**Status: signed off by the owner on 5 October 2026 (PM-03).**

## Rules for choosing a home

Apply these in order when a new lesson is used by more than one module.

1. **A required track wins over an optional one.** T1 and T9 are optional, so many learners never open them. A lesson shared with a required track lives there, and the T1 or T9 module links to it.
2. **A lesson lives where its source folder is taught in sequence.** A Handbook chapter belongs to the module that walks through that chapter's folder in order.
3. **Every scenario pack and standalone design lives in T5.5 Scenario library.** Topic modules link to them. These are already published under `/modules/15-fde-case-studies`, so for them the home sets only the breadcrumb.
4. **When two lessons overlap inside one module, move one to the module whose scope it serves.** For example, `a-day-in-the-life` moved from T0.2 to T6.3, because T0.2 already has `senior-fde-day-to-day` and its scope says delivery detail lives in T6.3.
5. **When one file covers two modules' topics in separate H2 sections, publish it as slices.** The home keeps its slug and the original URL, and publishes the file minus the sections that belong elsewhere (`sections: { exclude: [...] }`). Each moved part becomes a new lesson with its own slug, homed in the module it serves, that publishes only those sections (`sections: { include: [...] }`). Headings are matched exactly, every H2 goes to exactly one slice (or is excluded on purpose), and `check:curriculum` fails on overlap or a missing heading. A repository link to the file opens the slice holding the link's anchor, else the home part. Current slices:
   - `module-10-backend-fastapi-deployment` (T1.2) keeps the overview, FastAPI and LLM serving; `module-10-deployment-and-operations` (T1.4) takes "Topic 3: Deployment & Infrastructure" and "Topic 4: Production Operations".
   - `module-01-rag-fundamentals-core-components` (T2.2) keeps every topic except embeddings; `module-01-embeddings` (T2.1) takes "Topic 4: Embeddings".
   - `module-09-memory-databases-caching-for-genai-systems` (T2.3) keeps the overview, Topic 2 and Topic 3; `module-09-caching-in-genai-systems` (T4.5) takes "Topic 4: Caching in GenAI Systems"; "Topic 1: Memory Design in AI Systems" and "Topic 5: Memory & Caching for Agent Systems" are excluded on purpose, because the T3.4 consolidated lessons teach them.
   - `scoping-an-fde-project-complete-guide` (T6.2) keeps modules 1 to 4 and 6 to 8; `scoping-roll-out-and-prove-the-result` (T6.5) takes "Module 5: Roll Out, Operate, and Prove the Result", with the same credit line.

Lessons of kind `live` (already published under `/modules/...` or `/fde-last-day-prep`) are linked from Learn rather than copied, whatever their home.

## Consequence for module pages (FE-07)

Under rule 1, T1.5 Distributed systems essentials owns no lessons: everything it teaches is homed in a required track. (T1.4 Cloud, containers and deployment was in the same position until rule 5 gave it the deployment slice of Module 10.) Its module page must present `seeAlso` lessons as the main reading list, not as a footnote. The same layout applies to any module whose `lessons` list is empty.

To change a home, edit `home` on the lesson in `curriculum.ts`, then move its slug from the old module's `lessons` to its `seeAlso` and the other way round. The check fails until both sides agree.

## Consolidated modules

Some modules were assembled from several overlapping sources, so one concept was taught three or four times in different words. A consolidated module replaces those sources with a short run of lessons written once, in the house tutorial format, drawn only from the original sources (grounding rule) and credited where a third-party source contributed. The original files stay in the repository. Their curriculum entries become `publish: 'excluded'` and leave every reading list, `RENAMED` maps each retired lesson key to the lesson that now teaches its material, and `next.config.ts` redirects the old URLs permanently. An excluded lesson may be listed in no module; `check:curriculum` allows that only for `excluded` lessons.

**T3.4 Memory and state is the pilot** (October 2026, owner review before merge). Seven lessons in `01_Concept_Tutorials/Consolidated_Lessons/T3.4_Memory_and_State/` replace four sources:

| Old lesson (T3.4) | Now | Redirect target |
|---|---|---|
| `state-memory-sessions` | Excluded; taught by lessons 1, 2 and 6 | `why-agents-need-state` |
| `memory-and-state-interview-tutorial` | Excluded; taught by lessons 1, 3, 5, 6 and 7 | `short-term-memory-and-the-context-window` |
| `ch07-knowledge-memory-retrieval` | Excluded; summarised in lessons 2, 4, 6 and 7 (credited) | `long-term-memory-write-retrieve-forget` |
| `module-09-memory-databases-caching-for-genai-systems` | Moved to T2.3 as "Databases and Vector Search for GenAI Systems", minus Topics 1, 4 and 5; Topic 4 is a new slice `module-09-caching-in-genai-systems` in T4.5; Topics 1 and 5 are taught by lessons 1 to 6 | `chunking-and-indexing/module-09-memory-databases-caching-for-genai-systems` |

The new lessons, in order: `why-agents-need-state`, `types-of-memory`, `short-term-memory-and-the-context-window`, `long-term-memory-write-retrieve-forget`, `advanced-memory-architectures`, `memory-in-production`, `practise-memory-and-state`. T3.5 now lists `why-agents-need-state` under `seeAlso` in place of `state-memory-sessions`.

## Multi-use lessons

| Lesson | Home | Also used by | Kind |
|---|---|---|---|
| `a-day-in-the-life` | T6.3 | T0.2 | sync |
| `code-review-bug-drills` | T8.4 | T1.1 | live |
| `identity-secrets-tenant-fairness` | T4.4 | T1.2 | sync |
| `infra-and-cicd` | T4.7 | T1.4 | sync |
| `durability-and-idempotency` | T3.7 | T1.5 | sync |
| `retry-fallback-memo-confirm` | T3.5 | T1.5 | sync |
| `module-12-reliability-and-failure-handling` | T8.3 | T1.5 | live |
| `core-8-drivers-memorize` | T4.5 | T2.1 | sync |
| `retrieval-hybrid-rerank` | T2.4 | T4.1 | sync |
| `why-agents-need-state` | T3.4 | T3.5 | sync |
| `evaluation-golden-sets-judges` | T4.2 | T4.1 | sync |
| `observability` | T4.3 | T4.1 | sync |
| `g13-evaluation-and-release-gating` | T5.5 | T4.2 | live |
| `g07-secure-multi-tenant-ai-platform` | T5.5 | T4.4 | live |
| `g14-observability-and-production-diagnosis` | T5.5 | T4.3, T6.6 | live |
| `scale-prototype-to-production` | T5.5 | T4.6, T6.4 | live |
| `g18-consumer-scale-chat-service` | T5.5 | T4.6 | live |
| `g10-high-volume-batch-pipeline` | T5.5 | T4.6 | live |
| `g19-model-development-and-post-training` | T5.5 | T4.8 | live |
| `g20-llm-inference-serving` | T5.5 | T4.8 | live |
| `g12-scoping-to-deployed-agent` | T5.5 | T6.2 | live |
| `prioritize-ai-use-cases` | T5.5 | T6.4, T6.5 | live |
| `build-when-customer-data-is-poor` | T5.5 | T6.4 | live |
| `decomposition-classics-67-68-69` | T5.5 | T6.4 | live |
| `internal-knowledge-assistant` | T8.1 | T6.1 | live |
| `sales-copilot` | T8.1 | T6.1 | live |
| `financial-compliance-reviewer` | T8.1 | T6.1 | live |
| `healthcare-prior-auth-assistant` | T8.1 | T6.1 | live |
| `legal-contract-copilot` | T8.1 | T6.1 | live |
| `sre-triage-agent` | T8.1 | T6.1 | live |
| `multi-tenant-saas-support` | T8.1 | T6.1 | live |
| `retail-demand-explainer` | T8.1 | T6.1 | live |
| `service-now-ticket-agent` | T8.1 | T6.1 | live |
| `executive-dashboard-copilot` | T8.1 | T6.1 | live |
| `gates-risks-metrics` | T6.3 | T6.5 | sync |
| `deep-dive-and-conversational-formats` | T7.1 | T9.2 | sync |
| `proof-vs-cheat-sheet-honesty` | T7.1 | T9.2 | sync |
| `communicates-with-clarity` | T7.3 | T7.5 | live |

38 lessons are used by more than one module.
