# T4 Operations and Scale: Consolidation Note

Date: 5 October 2026. Scope: T4.3 Observability and production diagnosis, T4.5 Cost and latency optimisation (including the Module 9 "Caching in GenAI Systems" slice), T4.6 Scaling and reliability, T4.7 AgentOps, T4.8 Model adaptation and inference serving. Rewritten under `2026-10-05-consolidation-playbook.md`. T4.1, T4.2 and T4.4 are covered in `T4-quality-safety.md`.

New lessons live in `01_Concept_Tutorials/Consolidated_Lessons/T4.3_Observability_and_Diagnosis/`, `T4.5_Cost_and_Latency/`, `T4.6_Scaling_and_Reliability/`, `T4.7_AgentOps/` and `T4.8_Model_Adaptation_and_Serving/`, each with a README listing its sources. Redirects for retired lessons are in `site/src/lib/consolidation/t4.ts` under the "T4.3, T4.5–T4.8" comment.

Credit: lessons drawing on the third-party *GenAI FDE Cost and Latency Optimization Playbook* (through the repository's cram-sheet notes) or on Chapter 8 of *Cracking Agentic AI System Design Interviews* are `publish: 'credited'` with a credit line, and summarise those sources in new words. The production-operations tutorial's web-sourced interview answers (its §4) are not reused; its questions are, with answers rebuilt from repository concepts.

## T4.3 Observability and production diagnosis

Six lessons:

1. Logs, Metrics, and Traces (`logs-metrics-and-traces`)
2. The Run Trace (`the-run-trace`, credited)
3. Standard Tracing and Customer-Facing Dashboards (`standard-tracing-and-customer-facing-dashboards`)
4. Production Monitoring: Metrics, Drift, and SLOs (`production-monitoring-metrics-drift-and-slos`, credited)
5. Diagnosing Production Incidents (`diagnosing-production-incidents`, credited)
6. Practise Observability and Diagnosis Interview Questions (`practise-observability-and-diagnosis`, credited)

| Retired lesson | Redirects to |
|---|---|
| `observability` | `the-run-trace` |
| `observability-standards-failure-patterns` | `standard-tracing-and-customer-facing-dashboards` (failure patterns taught in T4.6 lessons 4 and 5) |
| `observability-standards-and-failure-patterns` | `standard-tracing-and-customer-facing-dashboards` (duplicate of the above) |
| `production-and-operations-interview-tutorial` | `practise-observability-and-diagnosis` (its other sections spread across T4.5, T4.6 and T4.7) |

T4.1's `seeAlso` now points at `the-run-trace` in place of `observability`.

## T4.5 Cost and latency optimisation

Eight lessons, all credited:

1. Why Cost and Latency Decide Production (`why-cost-and-latency-decide-production`)
2. The Eight Cost and Latency Drivers (`the-eight-cost-and-latency-drivers`)
3. Latency: Prefill, Decode, Streaming, and the Tail (`latency-prefill-decode-streaming-and-the-tail`)
4. Model Routing and Prompt Discipline (`model-routing-and-prompt-discipline`)
5. Caching in GenAI Systems (`caching-in-genai-systems`): Module 9 Topic 4 in full, plus exact, semantic and provider prompt caching and the cache-key rule
6. RAG and Agent Cost Controls (`rag-and-agent-cost-controls`)
7. Budgets and Spend Guardrails (`budgets-and-spend-guardrails`)
8. Practise Cost and Latency Interview Questions (`practise-cost-and-latency`)

| Retired lesson | Redirects to |
|---|---|
| `core-8-drivers-memorize` | `the-eight-cost-and-latency-drivers` |
| `cram-sheet-full-playbook` | `why-cost-and-latency-decide-production` |
| `cram-sheet-s15-s16` | `practise-cost-and-latency` |
| `additions-beyond-playbook` | `latency-prefill-decode-streaming-and-the-tail` |
| `cost-latency-cicd-rigor-and-build-vs-buy` | `caching-in-genai-systems` (CI/CD and build versus buy taught in T4.7) |
| `module-09-caching-in-genai-systems` | `caching-in-genai-systems` |

T2.1's `seeAlso` now points at `the-eight-cost-and-latency-drivers` in place of `core-8-drivers-memorize`. T3.4's short-term memory lesson still links to the T4.5 module page for caching; that link stays valid.

## T4.6 Scaling and reliability

Six lessons:

1. What Breaks at Twenty Million Documents (`what-breaks-at-twenty-million-documents`)
2. Scaling the Index and Access Control (`scaling-the-index-and-access-control`)
3. Capacity, Latency, and Cost at Scale (`capacity-latency-and-cost-at-scale`, credited)
4. Retries, Circuit Breakers, and Bulkheads (`retries-circuit-breakers-and-bulkheads`)
5. Failover, Graceful Degradation, and Kill Switches (`failover-graceful-degradation-and-kill-switches`)
6. Practise Scaling and Reliability Interview Questions (`practise-scaling-and-reliability`), with the production LLM gateway mock design as the capstone

| Retired lesson | Redirects to |
|---|---|
| `scaling-to-20m-documents` | `what-breaks-at-twenty-million-documents` |

The module's reliability content (retries, breakers, bulkheads, failover, degradation, kill switch) came from T4.3 sources in the same track; it now lives here, which matches the module's deliverable ("a degradation ladder").

## T4.7 AgentOps

Eight lessons:

1. Prompt Versioning, Rollout, and Rollback (`prompt-versioning-rollout-and-rollback`)
2. Testing Prompt Changes (`testing-prompt-changes`, credited)
3. AgentOps Mapped to Databricks (`agentops-mapped-to-databricks`)
4. Enterprise RAG on a Governed Lakehouse (`enterprise-rag-on-a-governed-lakehouse`), with build versus buy as its opener
5. Channel Adapters and Human Escalation (`channel-adapters-and-human-escalation`)
6. Red Teaming and Layered Guardrails (`red-teaming-and-layered-guardrails`)
7. Infrastructure as Code and the Release Pipeline (`infrastructure-as-code-and-the-release-pipeline`)
8. Practise AgentOps Interview Questions (`practise-agentops`)

| Retired lesson | Redirects to |
|---|---|
| `prompt-versioning-rollout-rollback` | `prompt-versioning-rollout-and-rollback` |
| `agentops-on-databricks` | `agentops-mapped-to-databricks` |
| `production-and-platform-judgment-agentops-on-databricks` | `agentops-mapped-to-databricks` (duplicate source, merged) |
| `enterprise-rag-on-databricks` | `enterprise-rag-on-a-governed-lakehouse` |
| `multi-channel-and-hitl-escalation` | `channel-adapters-and-human-escalation` |
| `red-teaming` | `red-teaming-and-layered-guardrails` |
| `infra-and-cicd` | `infrastructure-as-code-and-the-release-pipeline` |

T1.4's `seeAlso` now points at `infrastructure-as-code-and-the-release-pipeline` in place of `infra-and-cicd`.

## T4.8 Model adaptation and inference serving

Four lessons, all credited (Chapter 8; lesson 3 also the playbook). The module stays Partly ready and keeps its gap note: the sources do not cover fine-tuning methods or serving internals.

1. Four Learning Surfaces (`four-learning-surfaces`)
2. The Skill Library and Its Promotion Gate (`the-skill-library-and-its-promotion-gate`)
3. When Fine-Tuning Earns Its Cost (`when-fine-tuning-earns-its-cost`)
4. The Data Flywheel (`the-data-flywheel`)

| Retired lesson | Redirects to |
|---|---|
| `ch08-learning-in-agentic-systems` | `four-learning-surfaces` |

## Source conflicts

- **Where to start caching.** The GenAI engineering notes (Module 9 Topic 4) recommend a semantic cache for repeated chatbot questions; the platform-judgement notes call exact match the safer start and semantic caching the next step. The caching lesson states both and resolves them by traffic shape.
- **"Semantic" cache that is exact match.** The production-operations tutorial's `SemanticCache` hashes the text; the lesson flags the naming trap rather than presenting it as semantic.
- **Token estimates.** Two different word-count heuristics appear (`* 4 // 3` and `* 1.3`); both are taught as trend-only estimates, with a real tokenizer for budgets.
- **Price figures.** The companion notes' Anthropic price table is dated 2026-06-24; the routing lesson keeps the date and tells readers to recheck before quoting.
- **AWS versus Databricks release gate.** The handbook notes the AWS project built no release gate while the Databricks build did; the infrastructure lesson presents this as a project choice, not a platform difference, as the source does.

## Handoffs

- **To T2.3 Chunking and indexing:** `06_Scaling_To_20M_Documents.md` §7 "Chunking by document type" (natural split per format, one pipeline with many parsers) and §8 "Parent-child (small-to-big) chunking". Left out of T4.6; no longer published anywhere since `scaling-to-20m-documents` is retired.
- **To T4.4 / T4.1 (same track, other note):** the production-operations tutorial's input and output guardrail, PII masking and moderation material (§1.14–1.17) is taught compactly in T4.7 lesson 6 because it was homed in T4.3. The T4.4 or T4.1 owner may want to cross-link or absorb it.
- **Canonical-homes table:** not regenerated, per the playbook.
- `site/scripts/baselines.json` updated: diagrams 196 → 184 (the retired tutorial, Chapter 8 and handbook docs carried mermaid diagrams; the new lessons use text diagrams), synced lessons 196 → 209, internal links 1180 → 1195.
