# T4 Quality and Safety: Consolidation Note

Date: 5 October 2026. Scope: T4.1 Enterprise RAG in production, T4.2 Evaluation and release gates, T4.4 Security, tenancy and prompt injection. Rewritten under `2026-10-05-consolidation-playbook.md`. T4.3 and T4.5 to T4.8 are handled separately.

New lessons live in `01_Concept_Tutorials/Consolidated_Lessons/T4.1_Enterprise_RAG_in_Production/`, `T4.2_Evaluation_and_Release_Gates/` and `T4.4_Security_Tenancy_and_Prompt_Injection/`, each with a README listing its sources. Redirects for retired lessons are in `site/src/lib/consolidation/t4.ts`.

## T4.1 Enterprise RAG in production

Seven lessons, all own material:

1. Why Access Control Shapes Enterprise RAG (`why-access-control-shapes-enterprise-rag`)
2. The Seven Access Rules (`the-seven-access-rules`)
3. Pushing Policy Into the Index (`pushing-policy-into-the-index`)
4. Permission-Aware Ingestion (`permission-aware-ingestion`)
5. The Security-First Query Graph (`the-security-first-query-graph`)
6. Output Guardrails and Refusals (`output-guardrails-and-refusals`)
7. Practise Enterprise RAG Interview Questions (`practise-enterprise-rag`)

| Retired lesson | Redirects to |
|---|---|
| `why-enterprise-changes-the-problem` | `why-access-control-shapes-enterprise-rag` |
| `access-control-abac` | `the-seven-access-rules` (its second half is taught in lesson 3) |
| `ingestion-pipeline` | `permission-aware-ingestion` |
| `the-query-graph` | `the-security-first-query-graph` |
| `output-guardrails` | `output-guardrails-and-refusals` |

The module's `seeAlso` now points at `the-evaluation-pyramid` in place of the retired `evaluation-golden-sets-judges`.

## T4.2 Evaluation and release gates

Six lessons, all `publish: 'credited'` with a Chapter 12 credit line, because each draws on *Cracking Agentic AI System Design Interviews* Ch. 12 (summarised in new words):

1. The Evaluation Pyramid (`the-evaluation-pyramid`)
2. Component and Trajectory Metrics (`component-and-trajectory-metrics`)
3. Golden Sets and Sample Size (`golden-sets-and-sample-size`)
4. Validating LLM Judges (`validating-llm-judges`)
5. Release Gates: Safety, Quality, and Cost (`release-gates-safety-quality-and-cost`)
6. Practise Evaluation and Release-Gate Interview Questions (`practise-evaluation-and-release-gates`)

| Retired lesson | Redirects to |
|---|---|
| `evaluation-golden-sets-judges` | `golden-sets-and-sample-size` |
| `ch12-validation-and-measurement` | `the-evaluation-pyramid` |

Sources: `FDE_Handbook/04_Enterprise_RAG/07_Evaluation_Golden_Sets_Judges.md`, `Agentic_System_Design_Book/ch12_validation_and_measurement.md` and §8 of `Production_and_Platform_Judgment/Cross_Cutting_System_Design_Quick_Reference_v2.md`.

## T4.4 Security, tenancy and prompt injection

Six lessons, all own material:

1. Identity Verification with SSO and OIDC (`identity-verification-with-sso-and-oidc`)
2. Secrets and Per-Tenant Encryption Keys (`secrets-and-per-tenant-encryption-keys`)
3. Prompt Injection and Egress Control (`prompt-injection-and-egress-control`)
4. Tenant Isolation Levels (`tenant-isolation-levels`)
5. Fair Sharing Between Tenants (`fair-sharing-between-tenants`)
6. Practise Security and Tenancy Interview Questions (`practise-security-and-tenancy`)

| Retired lesson | Redirects to |
|---|---|
| `prompt-injection-egress-tenancy` | `prompt-injection-and-egress-control` |
| `identity-secrets-tenant-fairness` | `identity-verification-with-sso-and-oidc` |
| `identity-secrets-and-tenant-fairness` | `identity-verification-with-sso-and-oidc` |
| `cross-cutting-system-design-quick-reference-v2` | `practise-security-and-tenancy` |

T1.2 APIs and backend listed `identity-secrets-tenant-fairness` under `seeAlso`; it now lists `identity-verification-with-sso-and-oidc`.

Sources: `FDE_Handbook/06_Cross_Cutting_Concerns/01_Identity_Secrets_Tenant_Fairness.md` and `04_Prompt_Injection_Egress_Tenancy.md`, `Production_and_Platform_Judgment/01-identity-secrets-and-tenant-fairness.md` (a near-duplicate of the Handbook identity document) and §1 and §6 of the quick reference.

## Source conflicts

- **Judge calibration size.** The Handbook calibrates its groundedness judge on 6 hand-labelled cases (100% agreement, mean absolute error 0.033). Chapter 12 sets a floor of at least 100 labelled cases and a kappa of 0.60. Lesson T4.2/4 states both.
- **Canary significance.** The quick reference promotes a canary on 72% against 75.2% from a 250-query arm at p = 0.03. Chapter 12's sizing rule needs roughly 3,000 cases per arm for a 3-point change near that rate (derived from the chapter's formula; the book does not state the figure). Lesson T4.2/5 states both.
- **Circuit breakers.** The Handbook's model-provider breaker trips after 3 consecutive outage exhaustions for 30 s. The quick reference describes a separate per-tenant breaker at a 50% error rate for 60 s. They are different breakers, and T4.4/5 says so.
- **Fair sharing.** The quick reference draws an even 33% capacity split; the Handbook names weighted fair queuing. T4.4/5 presents the even split as the simple case.

## Handoffs

The retired quick reference (`Cross_Cutting_System_Design_Quick_Reference_v2.md`) covered nine topics, but only §1 and §6 belong to T4.4 and §8's evaluation parts to T4.2. The rest is no longer published from T4.4 and should be placed by the owners below:

| Quick-reference section | Hand off to |
|---|---|
| §2 OpenTelemetry tracing, §7 failure-pattern detection | T4.3 Observability and production diagnosis |
| §3 Semantic caching, §9 Build versus buy | T4.5 Cost and latency optimisation |
| §4 AgentOps on Databricks; §8 MLflow registration, rollback procedure and 50/50 A/B test | T4.7 AgentOps |
| §5 The 8-step tool-call guard pipeline | T3.5 Robust agents (other track) |

Most of §2, §3, §8 and §9 already have full-length homes in T4.3 and T4.5 lessons; the integrator should confirm nothing is lost.

Other notes for the integrator:

- `site/src/lib/glossary.ts` defines `MRR` only as "monthly recurring revenue". The T4.2 lessons (and the retired Handbook evaluation lesson before them) use MRR for mean reciprocal rank, so the hover text is wrong on those pages.
- The T4.1 `seeAlso` entry `observability` belongs to T4.3; if T4.3 retires it, replace it with the covering lesson.
