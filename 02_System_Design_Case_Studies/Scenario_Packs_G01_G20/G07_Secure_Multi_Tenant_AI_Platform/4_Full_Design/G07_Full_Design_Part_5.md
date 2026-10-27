# Secure Multi-Tenant AI Platform, part 5

## 14. Debug the Cross-Tenant Leak

The scenario's incident is the design's failure mode observed in production, and it tests whether debugging goes beyond "retrieval quality". Frame it as a multi-tenant isolation failure, never as a hallucination.

Acme uses an enterprise support copilot over customer contracts, escalation policies and entitlements. The vector database stores chunks from several enterprise customers in one collection, with `tenant_id`, `doc_tenant_id`, `visibility`, `source_connector`, `acl_hash` and `metadata_filter_version` on each chunk. The intended invariant is that `tenant_id` on the request matches `doc_tenant_id` on every retrieved chunk, and the ACL service authorises each chunk before it reaches the prompt. On 2026-07-08 a support agent asked whether Acme customers could receive premium onboarding under the 2026 renewal terms. The assistant said yes and cited a "Premium Success Addendum" that belonged to Globex.

```text
2026-07-08T09:12:44.129Z level=warn service=rag-api env=prod region=eu-central-1
  trace_id=trc_7f91c2 request_id=req_acme_88421 query_id=q_20260708_091244_19
  user_id=u_acme_support_044 tenant_id=acme user_role=support_agent
  workflow=contract_entitlement_answer retriever_version=2026-07-07
  metadata_filter_version=v3 filter_expression="visibility in ['public','internal']"
  expected_filter_expression="tenant_id == 'acme' AND visibility in ['public','internal']"

2026-07-08T09:12:44.388Z level=info service=vector-retriever
  trace_id=trc_7f91c2 collection=enterprise_contract_chunks index=contracts_hnsw_v22
  retrieval_k=12 returned_k=12 top_score=0.81
  retrieved_chunk_ids=[chk_globex_9921,chk_acme_1710,chk_acme_1709,chk_globex_9922]
  retrieved_doc_ids=[doc_globex_renewal_2026,doc_acme_msa_2025]
  doc_tenant_ids=[globex,acme,acme,globex]

2026-07-08T09:12:44.421Z level=error service=acl-enforcer
  trace_id=trc_7f91c2 acl_check=skipped reason="pre_authorized_connector_flag=true"
  connector=sharepoint connector_scope=tenant_shared acl_cache_key=acl:v2:sharepoint:contracts
  request_tenant_id=acme doc_tenant_id=globex policy_decision=not_evaluated

2026-07-08T09:12:45.221Z level=error service=response-evaluator
  trace_id=trc_7f91c2 eval=tenant_isolation_violation severity=critical
  response_served=true citation_doc_id=doc_globex_renewal_2026 citation_chunk_id=chk_globex_9921
  tenant_id=acme doc_tenant_id=globex human_review=false
```

**Detect.** Start from the known bad answer and open the full trace. Compare `tenant_id` on the request with `doc_tenant_id` on the retrieved chunks, read the filter expression the retriever actually used, and check whether ACL was evaluated per chunk. The telemetry already says it. The filter dropped the tenant equality. Two Globex chunks came back. The ACL check was skipped because of a connector flag. The response evaluator flagged a critical isolation violation after the response was served. Then query every trace on `metadata_filter_version=v3` for `tenant_id != doc_tenant_id`, and compare the canary cohort with the control cohort still on v2. Do not re-run the question in the UI; it may not reproduce the canary route, the cache state or the retrieval order. The path is trace-first: request, filter, retrieved chunks, ACL decision, prompt context, citation.

**Contain.** Disable `metadata_filter_version=v3`. Purge affected answer-cache entries. Block every response where any retrieved chunk has `tenant_id != doc_tenant_id`. Force human review for contract-entitlement answers generated in the incident window. Notify the customer, because a leaked clause can expose pricing, support commitments or regulated data.

**Root cause.** A retrieval deploy on 2026-07-07 introduced filter version v3 to support global product documentation. The filter builder treated connector-level "pre-authorised" documents as safe and omitted the tenant equality predicate for one SharePoint collection. The ACL service then skipped chunk-level checks because it trusted the connector-level scope. The rollout reached 15% of Acme traffic at 08:45 on 2026-07-08. Two layers failed together, which is exactly what section 6's independence rule exists to prevent.

**Prevent.** Make tenant isolation a non-bypassable server-side predicate. Add a hard post-retrieval invariant check before context assembly. Remove connector-level ACL shortcutting. Add an automated eval that fails deployment if cross-tenant chunks appear in retrieved context. Add a dashboard panel for `cross_tenant_retrieval_count` by tenant, connector, retriever version and filter version. Say why the enforcement lives outside the LLM and outside prompt instructions: a malicious user could deliberately query for rare phrases that retrieve neighbouring tenant documents if filters are weak.

> *"I would treat this as a critical data isolation incident. First I would disable the new filter version and stop serving answers from suspicious traces. Then I would inspect the trace for request tenant, retrieved chunk tenant, filter expression, and ACL decision. The telemetry already shows tenant_id=acme, doc_tenant_id=globex, and acl_check=skipped, so the root cause is likely the filter/ACL path, not the model. The fix is to enforce tenant equality as a hard backend invariant before context assembly, add post-retrieval validation, purge affected cache, and add a deployment gate that fails on cross-tenant retrieval."*

| Criterion | Strong signal | Weak signal |
|---|---|---|
| Problem framing | Identifies a critical multi-tenant isolation failure | Calls it a generic bad answer |
| Telemetry interpretation | Compares request tenant, document tenant, filter version, ACL decision | Looks only at latency or model output |
| Root-cause reasoning | Traces the filter builder and the ACL shortcut | Blames prompt quality |
| Production debugging | Uses traces, canary cohort, cache audit, invariant checks | Reproduces manually in the UI only |
| Security/privacy awareness | Mentions confidentiality, blast radius, customer notification | Ignores data-leak impact |
| Mitigation quality | Rollback, block invariant violations, purge cache, add gates | "Improve the prompt" |
| Communication clarity | Explains severity and remediation to security, product and the customer | Gives a vague engineering update |

---

## Level calibration

On this design the levels separate on how many boundaries enforce the tenant scope on their own, and who proves it, not on how the model is served.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Derives tenant context once from the verified token, never the request body, and makes it immutable. Enforces it with row-level security, tenant-keyed caches and a vector filter plus the post-retrieval tenant check, and meters budget before inference so a tenant over quota degrades alone. | Everything past the request path: queue and dead-letter envelopes, logs, per-tenant keys, verified offboarding, and an adversarial suite that blocks promotion on one unexplained failure. |
| Staff | Adds the queue, log and key layers so all seven enforce independently, weighted fair queuing behind per-tenant token buckets, and an isolation suite Security engineering owns as the release gate. Rolls out internal tenants first, then small shared tenants on conservative quotas, with named owners and rollback by tenant and region. | What breaks at 10x, 5,000 tenants and 2,000 QPS: cache churn and noisy neighbours push pooled-plus-quotas towards partitioning, and nobody has said when shared stops being the right default. |
| Principal | Turns the dedicated tier into a policy with measurable thresholds and an exception review path, priced by `C_tenant = C_fixed/N + C_usage + C_isolation`, never "big customers get dedicated". Keeps policy central and enforcement regional, so residency covers logs, backups and derived indexes, and a control-plane outage never carries stale state into an irreversible action. | The actual dedicated-tier thresholds, RPO and RTO per region, and the backup erasure window depend on the customers' contracts and residency rules, so they wait for discovery. |

## Key Takeaways

- The feature is one application for 500 tenants; the business result is a cost-efficient shared platform with defensible isolation and a dedicated path for exceptions.
- Requirements are stated so a test can fail them: five must-haves, three measurable safety goals, an exclusion list, and a component owner for every constraint.
- Sizing is for load shape, not average: 200 QPS at 20x skew means a few tenants drive peak, and the unit-economics equation decides where the isolation premium is paid.
- One diagram splits the control plane that decides from the data plane that enforces, with the fail-closed branch drawn on it.
- Tenant context is derived once from verified identity, never the request body, and becomes immutable before any expensive work.
- Seven isolation layers enforce independently, the store refuses unscoped reads, and the tenancy level is chosen and justified with a named escalation path.
- Quotas and budgets are applied before the call, and fairness is a separate mechanism from rate limits.
- Policy is defined centrally and enforced regionally, and a control-plane outage never continues stale state into an irreversible action.
- Security defects fail closed, capacity pressure degrades, metadata leaks quarantine.
- The release gate is an adversarial isolation suite, with cross-tenant incidents at zero and per-tenant p95 measured separately.
- Rollout goes internal tenants, isolation suite, small shared tenants, then a dedicated tier by policy, each phase with an owner and a go/no-go.
- The fifty minutes are spent in proportion to risk, with four trade-off pairs and the row-tag follow-up ready.
- The cost pivot is answered with the same architecture: meter before the call, attribute per tenant, key caches on tenant and permission.
- The cross-tenant leak is debugged trace-first, contained by rollback and cache purge, and prevented by a non-bypassable predicate plus a deployment gate.

## Check Yourself

1. **Why is tenant_id on every row insufficient?** It is one defence layer that covers nothing in caches, blob stores, indexes, background jobs, analytics or admin tooling, and it fails the first time a developer omits the predicate. Enforcement has to exist independently in several layers.
2. **Where does tenant context come from, and why not the request body?** From verified identity, because a signed token, verified claim or server-side session can be authenticated and logged, while a client-set header or JSON field can be spoofed, replayed or forwarded across tenants.
3. **What is the fail-closed rule for a missing predicate?** Reject with a security error and never substitute a default tenant; log identity, trace, operation and the missing-scope fact; keep in-flight retries failing closed.
4. **A cache key omits the tenant id and the database is still protected. What kind of incident is it?** A security incident, because a shared cache can replay another tenant's object; disable the path, invalidate, rebuild from scoped reads, and add a negative test asserting a cross-tenant lookup is a miss.
5. **What is the difference between a rate limit and a fair queue?** A rate limit is a ceiling on one tenant's own allotment; a fair queue decides the order of service under load so a large tenant's burst cannot delay a small tenant who never exceeded any limit.
6. **What does the unit-economics equation say about when to pay for isolation?** `C_tenant = C_fixed/N + C_usage + C_isolation`: pooled economics win when most tenants can share safely, and the isolation premium is paid only where a requirement demands it.
7. **What are the three tenancy levels and the honest default?** Shared infra with a tenant id on every row, a separate schema or namespace per tenant, and a dedicated deployment per tenant. Start at level 1 with the database enforcing the tenant and a named escalation path for regulated customers.
8. **In the incident, which two layers failed and why did that matter?** The filter builder dropped the tenant predicate for pre-authorised connectors and the ACL service skipped chunk checks because it trusted connector scope. Two layers failing together is exactly what independent enforcement is meant to make impossible.
9. **What is the sixty-second cost answer?** Make tenant_id and permission_signature first-class in every service, and meter before the call because budgets are contractual.

## References

All paths are relative to the repository root.

| Section | Source |
|---|---|
| 1, 2, 4, 9, 10, 11, 12 | `03_Practice_Worksheets_and_Keys/System_Design_Worksheets/02_secure_multi_tenant_ai_platform.md` and its `answer_keys/02_secure_multi_tenant_ai_platform_answer_key.md` |
| 1 to 5, 8 to 12 (tutorial material, diagrams, isolation test, drills, rollout, trade-offs, follow-ups) | `02_System_Design_Case_Studies/Scenario_Tutorials_Long_Form/Version_2/chapter-2-secure-multi-tenant-ai-platform-tutorial_v2.md` |
| 5, 6, 7 (SSO/OIDC, envelope encryption, per-tenant keys, fair queuing) | `01_Concept_Tutorials/FDE_Handbook/06_Cross_Cutting_Concerns/01_Identity_Secrets_Tenant_Fairness.md` |
| 6 (tenancy levels, the store enforces the tenant, escalation path) | `01_Concept_Tutorials/FDE_Handbook/06_Cross_Cutting_Concerns/04_Prompt_Injection_Egress_Tenancy.md` |
| 6 (two-layer enforcement, referenced not repeated) | `02_System_Design_Case_Studies/Scenario_Packs_G01_G20/G01_Enterprise_Knowledge_Assistant/4_Full_Design/G01_Full_Design.md`, section 6 |
| 13 | `01_Concept_Tutorials/Cost_and_Latency_Optimization/CRAM_SHEET_S15_S16.md`, §16 case 4 and §15 scenario 5; `CASE_STUDY_INDEX.xlsx`, Drill Add-ons row 41 |
| 14 | `FDE/Complete GEN AI FDE Interview System — Core + GenAI/05_PRODUCTION_DEBUGGING_OBSERVABILITY_AND_OPTIMIZATION/04_PRODUCTION_INCIDENT_LOGS/01_cross_tenant_retrieval.md` |
| Not included | The V1 long tutorial, the V2 section 5 request-handling code walkthrough and API contract surface, the V2 drill diagrams for queue, quota and control-plane outage (rendered as prose in section 9), and the site mirror under `site/content/` |

### Fact-check sources (checked 27 Sep 2026)

- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) — trust only verified tokens, claims or sessions, never client-set fields
- [New name for Azure Active Directory (Microsoft Learn)](https://learn.microsoft.com/en-us/entra/fundamentals/new-name) — Azure AD is now Microsoft Entra ID
- [PostgreSQL docs: Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) — owners, superusers and BYPASSRLS roles skip RLS unless FORCE ROW LEVEL SECURITY is set
- [HHS: Guidance on HIPAA & Cloud Computing](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html) — HIPAA does not require single-tenant hosting
- [OCC Bulletin 2023-17: Interagency Guidance on Third-Party Relationships](https://www.occ.gov/news-issuances/bulletins/2023/bulletin-2023-17.html) — bank rules are risk-based, not a single-tenant mandate
- [AWS KMS cryptography essentials (envelope encryption)](https://docs.aws.amazon.com/kms/latest/developerguide/kms-cryptography.html) — what per-tenant data keys wrapped by a master key protect
- [Demers, Keshav, Shenker 1989: Analysis and Simulation of a Fair Queueing Algorithm](https://dl.acm.org/doi/10.1145/75247.75248) — fair queuing shares a saturated resource proportionally
- [RFC 2697: A Single Rate Three Color Marker](https://www.rfc-editor.org/rfc/rfc2697) — a token bucket meters rate; it does not schedule fairly
- [ICO: Right to erasure](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-erasure/) — backups can be kept "beyond use" until overwritten on schedule
- [GDPR Article 17: Right to erasure](https://gdpr-info.eu/art-17-gdpr/) — the erasure duty itself
- [OWASP GenAI LLM08:2025 Vector and Embedding Weaknesses](https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/) — cross-tenant leaks from missing vector access controls
