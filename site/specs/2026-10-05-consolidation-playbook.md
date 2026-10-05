# Consolidation Playbook

Date: 5 October 2026. Owner decision: every module whose lessons are reading material is rewritten the way T3.4 Memory and state was (PR #31). Each concept is taught once, in a natural order, in the house lesson shape, drawn only from the module's repository sources.

## Scope

- **Rewrite** every module with at least one `kind: 'sync'` lesson whose status is `ready` or `partly`. T3.4 is done.
- **Do not rewrite** `kind: 'live'` lessons: worksheets, scenario packs and standalone designs, the story bank, leadership principles, the hiring-manager round and the final-week reviews stay interactive practice pages. Only clean their display titles (see Naming).
- **Skip** `coming-soon` and `on-hold` modules.
- A Partly ready module keeps its `gapNote`; the rewrite covers only what the sources contain.

## Method

1. Read every source the module's lessons point to, in full, including lessons it lists under `seeAlso` that are homed in the same track.
2. List the concepts across all sources and group them into natural lessons: one idea per lesson, ordered from foundation to production, then an interview-practice lesson when the sources carry interview questions. Typical size: 3 to 7 lessons.
3. Write each lesson with the `tutorial-prose-style` skill: title, one-sentence trade-off tagline, objectives, imperative section headings, one worked example, a warning callout, key takeaways, three "Check yourself" questions, and a closing "Sources" line naming the source files and sections used.
4. Grounding: every claim, number, example and code idea comes from the sources. Nothing from outside knowledge. Where sources disagree, say so in the lesson.
5. Third-party material (credited lessons): summarise the ideas in new words, never copy sentences, lists or cheat sheets, and set `publish: 'credited'` with a credit line on every new lesson that draws on it.
6. Material that belongs to another module: when it is in the same track, place it in that module's rewrite. When it is in another track, leave it out and record it under "Handoffs" in the track's consolidation note; the integrator places it later.

## Naming

- Lesson titles name the concept: "Types of Memory", "Long-Term Memory: Write, Retrieve, Forget". Never "Module 9", "Chapter 7", "Topic 3", "Part 2", "Interview Tutorial", "Beginner Guide" or a source series name.
- Title case with the serial comma, British English, no emoji.
- Lesson slugs: kebab case of the title (`types-of-memory`).
- Files: `01_Concept_Tutorials/Consolidated_Lessons/<Code>_<Module_Title>/NN_<Title_With_Underscores>.md`, plus a short `README.md` listing the sources. Example: `Consolidated_Lessons/T3.4_Memory_and_State/02_Types_of_Memory.md`.
- Live lesson display titles drop series prefixes the same way ("Module 12 — Reliability & Failure Handling" becomes "Reliability and Failure Handling"). Case ids such as "G01" may stay where they identify a scenario.

## Wiring

- New lessons: `kind: 'sync'`, home = the module; add them to `LESSONS` next to the module's existing entries (not at the end of the array) and set the module's `lessons` in order.
- Retired lessons: set `publish: 'excluded'`, remove them from every module's `lessons` and `seeAlso` (replace a `seeAlso` with the new lesson that covers it), and add `'<module>/<old-slug>': '<module>/<new-slug>'` to the track's file in `site/src/lib/consolidation/tN.ts`. Redirects are derived from these entries automatically.
- Source files stay in the repository unchanged.
- Do not regenerate the table in `2026-10-05-canonical-homes.md`; the integrator does it once at the end. Update `site/scripts/baselines.json` with `npm run check:content -- --update-baseline` only when a count change is intended, and say why in the PR.
- Write a short note per track in `site/specs/consolidation/<Track>.md`: old-to-new lesson mapping per module, source conflicts found, and handoffs.

## Integration

Done on branch `content/consolidation-integration` after PRs #34 to #42 merged.

### Redirect hygiene

- One chain existed: `memory-and-state/module-09-memory-databases-caching-for-genai-systems` pointed at a T2.3 key that PR #40 retired. It now points straight at `chunking-and-indexing/choosing-a-database-and-vector-store`.
- `check:curriculum` now fails when a `RENAMED` value is itself a key (a chain), when a value is not a published lesson, and when a key is still published. All 106 entries pass.

### Handoffs

"Covered" means the concept was already taught in a published lesson of the target module. "Added" means a section was written into the named lesson, grounded only in the retired source the handoff names, with the source added to the lesson's Sources line. "Linked" means a `seeAlso` entry was added.

| From | Handoff | Result |
|---|---|---|
| T0–T1 | T1.2 caching and T4.5 caching | Linked both ways (`caching-in-genai-systems` in T1.2, `cache-answers-without-serving-wrong-ones` in T4.5). T4.5 is the canonical home for semantic caching. |
| T0–T1 | T1.4 release gates and rollout, from T4.7 | Linked: `gate-releases-on-quality` and `roll-out-changes-gradually` in T4.7. T1.4 already links `infrastructure-as-code-and-the-release-pipeline`. |
| T0–T1 | T4.4 authentication beyond API keys | Covered: T1.2 links `identity-verification-with-sso-and-oidc`; T1.2's gap note stands. |
| T0–T1, T6 | Senior FDE's day in T6.3 | Covered: T6.3 lists `a-senior-fdes-day`. |
| T0–T1 | T5.1 owns the full design method | Covered; no action. |
| T2 | T4.5: Module 1 Topic 10 caching | Covered by `caching-in-genai-systems`. |
| T2 | T3.4: Module 1 Topic 10 chat memory and session privacy | Covered by `short-term-memory-and-the-context-window` and `memory-in-production`. |
| T2 | T4.1: Module 1 Topic 12 guardrail families, PII, output validation, auditing | Added to `output-guardrails-and-refusals` ("Place Each Guardrail Where Its Failure Starts"), including the source conflict on input filtering. RBAC was already covered. |
| T2 | T4.1: `document_permissions` table (Module 9) and relational plus vector stores (Module 1 Topic 10) | Added to `permission-aware-ingestion` ("Give the Catalog a Schema That Outlives One Demo"). |
| T2 | T4.1: ACL pre- and post-filtering | Covered by `why-access-control-shapes-enterprise-rag`. |
| T2 | T4.2: Module 2 Topic 4 evaluation tools and CI gating | Added to `release-gates-safety-quality-and-cost` ("Run the Gate on Every Change, at Two Sizes"). |
| T2 | T4.2: RAGAS faithfulness detail | Covered: groundedness as the share of supported claims in `component-and-trajectory-metrics`; the thresholds stay in T2.2, where the conflict is stated. |
| T2 | T3.x supervisor patterns | Covered by T3.6. |
| T2 | LangSmith environment-variable gotcha | Not placed: a framework setup detail with no concept to teach. |
| T2 | `08_advanced_rag_techniques_INTERVIEW_TUTORIAL.md` origin | Open. The file names a `Comprehensive_RAG_Techniques` notebook collection as its source; the repository cannot confirm whether that is third-party. Owner to confirm; lessons drawing on it are unchanged. |
| T3.1–T3.3 | T3.4 memory (§1.8, §2, §3, §4 Q3, §5.2 Q7) | Covered by T3.4 lessons 1, 3, 4, 6 and 7. |
| T3.1–T3.3 | T3.5 interrupts, safe resume, `NodeInterrupt`, `RetryPolicy` | Added to `the-confirmation-gate-and-memoization` ("Resume From the Pause Without Repeating the Write") and `retries-and-fallbacks` ("Scope Framework Retries to the Failures That Pass"). Linked T2.5's `checkpoints-interrupts-and-human-approval` and `retries-fan-out-and-streaming` from T3.5. |
| T3.1–T3.3 | T3.6 supervisor, swarm, hierarchical, blackboard, deep agents | Supervisor, handoff, hierarchy and deep agents were covered. Added swarm and blackboard to `multi-agent-coordination-patterns` ("Use a Blackboard When the Next Contributor Depends on the Board"). |
| T3.1–T3.3 | T3.6 travel support mock (§6) | Added to `practise-multi-agent-systems` ("Rehearse a Full Mock: A Travel Support Agent"). |
| T3.1–T3.3 | T4.2 agent, RAG and tool evaluation; deterministic versus judge metrics | Covered by `component-and-trajectory-metrics`, `validating-llm-judges` and `release-gates-safety-quality-and-cost`. |
| T3.1–T3.3 | T4.3 tracing and no-repro debugging | Covered by `standard-tracing-and-customer-facing-dashboards` and `diagnosing-production-incidents`. |
| T3.1–T3.3 | T4.5 low-latency agent pipeline | Covered across T4.5 lessons 3, 4 and 6. |
| T3.1–T3.3 | T1/T2 role-track questions | Covered by the T2.2 and T2.4 practice lessons. |
| T3.1–T3.3 | T2.4 ChromaDB `n_results` warning | Added to `production-retrieval-pipelines` (alert when fewer than `k` results return). |
| T3.1–T3.3 | T4.4 link to The Model Context Protocol | Linked: `the-model-context-protocol` in T4.4. |
| T3.1–T3.3 | T4.5 link to Deterministic Context Assembly | Linked: `deterministic-context-assembly` in T4.5. |
| T3.5–T3.7 | T4 links to the research-platform case study | Linked: `anatomy-of-a-deployed-multi-agent-platform` in T4.7. |
| T4 operations | T2.3: 20M-documents §7 chunking by type, §8 parent-child | §8 was covered by `retrieve-small-return-large`; added the parent-held access rule there. Added the missing formats and "one chunker, many parsers" to `chunking-by-document-type` ("Write One Chunker and Many Parsers"). |
| T4 operations | T4.4/T4.1: guardrail and PII material in T4.7 lesson 6 | Linked: `red-teaming-and-layered-guardrails` in T4.4. |
| T4 quality | Quick reference §2 OpenTelemetry and §7 failure patterns, to T4.3 | §2 covered. Added §7 to `production-monitoring-metrics-drift-and-slos` ("Watch the Four Ways Quality Fails Quietly"). |
| T4 quality | §3 semantic caching (T4.5), §9 build versus buy (T4.7) | Covered by `caching-in-genai-systems` and `enterprise-rag-on-a-governed-lakehouse`. |
| T4 quality | §4 AgentOps on Databricks, §8 MLflow, rollback and A/B (T4.7) | Covered by `agentops-mapped-to-databricks`, `prompt-versioning-rollout-and-rollback` and `testing-prompt-changes`. |
| T4 quality | §5 eight-step guard pipeline (T3.5) | Covered by `the-eight-guard-checks`. |
| T4 quality | MRR glossary entry | Fixed: `MRR` is now "mean reciprocal rank" in the retrieval group. No page uses it for revenue, and the entry notes the other meaning. |
| T4 quality | T4.1 `seeAlso` to `observability` | Covered: already replaced by `the-run-trace`. |
| T5 | Guardrails, prompt injection and prompt versioning for the customer support case | Linked in T5.4: `prompt-injection-and-egress-control`, `red-teaming-and-layered-guardrails`, `prompt-versioning-rollout-and-rollback`. |
| T5 | Databricks RAG cross-link | Linked both ways: `enterprise-rag-on-a-governed-lakehouse` in T5.4, `access-controlled-rag-on-databricks` in T4.7. |
| T5 | Duplicate live T5.5 pages | No action: live pages are out of rewrite scope. |
| T6 | T7 behavioural drill link to cross-team ownership | Linked: `cross-team-ownership-and-cadence` in T7.2. |
| T6 | T4/T5 depth for decomposition cases; T5.5 live practice | Covered: the decomposition cases stay practice; T6.2, T6.4 and T6.5 list the live pages. |
| T7–T8 | Baseline refresh | `scripts/baselines.json` refreshed once here for all tracks. |

### Naming audit

No published lesson title or consolidated file name uses "Module", "Chapter", "Topic", "Part", "Interview Tutorial", "Beginner Guide" or a source series name. The one match, "The Twelve-Part Design Framework", names the framework's twelve parts rather than a series part, so it stays. Every synced lesson's H1 matches its curriculum title.
