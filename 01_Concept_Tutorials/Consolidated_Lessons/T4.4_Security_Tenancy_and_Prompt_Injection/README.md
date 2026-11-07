# T16.6 Security, Tenancy and Prompt Injection: Consolidated Lessons

These six lessons are the site's teaching copy of module T16.6 "Security, tenancy and prompt injection". Each concept is taught once, in the house tutorial format, drawing only on the repository sources below. The site publishes them at `/learn/production-ai/security-tenancy-prompt-injection`.

| # | Lesson | Site slug |
|---|---|---|
| 1 | [Identity Verification with SSO and OIDC](01_Identity_Verification_with_SSO_and_OIDC.md) | `identity-verification-with-sso-and-oidc` |
| 2 | [Secrets and Per-Tenant Encryption Keys](02_Secrets_and_Per_Tenant_Encryption_Keys.md) | `secrets-and-per-tenant-encryption-keys` |
| 3 | [Prompt Injection and Egress Control](03_Prompt_Injection_and_Egress_Control.md) | `prompt-injection-and-egress-control` |
| 4 | [Tenant Isolation Levels](04_Tenant_Isolation_Levels.md) | `tenant-isolation-levels` |
| 5 | [Fair Sharing Between Tenants](05_Fair_Sharing_Between_Tenants.md) | `fair-sharing-between-tenants` |
| 6 | [Practise Security and Tenancy Interview Questions](06_Practise_Security_and_Tenancy_Interview_Questions.md) | `practise-security-and-tenancy` |

## Sources

- `01_Concept_Tutorials/FDE_Handbook/06_Cross_Cutting_Concerns/04_Prompt_Injection_Egress_Tenancy.md` (own material).
- `01_Concept_Tutorials/FDE_Handbook/06_Cross_Cutting_Concerns/01_Identity_Secrets_Tenant_Fairness.md` (own material).
- `01_Concept_Tutorials/Production_and_Platform_Judgment/01-identity-secrets-and-tenant-fairness.md` (own material; a near-duplicate of the Handbook document above).
- `01_Concept_Tutorials/Production_and_Platform_Judgment/Cross_Cutting_System_Design_Quick_Reference_v2.md`, §1 "Real Identity" and §6 "Fair Resource Sharing" (own material).
- Same-track context from `01_Concept_Tutorials/FDE_Handbook/04_Enterprise_RAG/05_The_Query_Graph.md` and `06_Output_Guardrails.md`, which the T16.5 lessons teach; these lessons link to them rather than re-teach them.

The source files stay in the repository unchanged. The site no longer publishes the first four as separate lessons; old URLs redirect to the matching lesson here.

The quick reference's other sections are taught elsewhere: §2 "Standard Tracing" and §7 "Failure Pattern Detection" belong to T16.9 Observability; §3 "Semantic Caching" and §9 "Build vs. Buy" to T16.10 Cost and latency; §4 "AgentOps on Databricks" and the rollout, A/B and rollback parts of §8 to T16.8 AgentOps; the evaluation parts of §8 are taught in T16.7 Evaluation and release gates; and §5 "Guarding Tool Calls" to T16.3 Robust agents.

Every claim, number and code idea in these lessons comes from the sources. Where two sources describe different mechanisms under the same name, the lesson says so: the enterprise RAG client's circuit breaker (3 consecutive outage exhaustions, 30 s) guards the model provider, while the quick reference's per-tenant breaker (50% errors, 60 s) guards other tenants. Each lesson ends with a Sources line naming the sections it used. Edit these files, not the generated copies under `site/content/learn/`, then run `npm run sync` from `site/`.
