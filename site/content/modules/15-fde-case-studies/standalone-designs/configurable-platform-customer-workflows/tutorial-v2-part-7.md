# Chapter 17: Design a Configurable Platform for Customer-Specific Workflows, part 7

## Coverage Notes

Self-review against the 20-item decomposition rubric (single pass — the source chapter's own structure already closes nearly every gap on first draft).

**Phase 1 — Problem Framing & Discovery**
- **Item 1 (Feature → business-outcome reframing):** Fully covered — Section 1 restates the prompt as a business outcome, not technology.
- **Item 2 (Stakeholder / persona mapping):** Fully covered — Section 1 names 8 stakeholder groups.
- **Item 3 (Clarifying questions that change the architecture):** Fully covered — Section 2's 6-question tree.
- **Item 4 (Requirements split + prioritisation):** Fully covered — Section 2 must-have functional vs. measurable NFRs.
- **Item 5 (Explicit non-goals / scope fence):** Fully covered — Section 2's 5-item MVP exclusion list.

**Phase 2 — Estimation & Architecture**
- **Item 6 (Back-of-envelope scale & capacity math):** Fully covered — Section 3's worked estimate, 4-step envelope, sensitivity table.
- **Item 7 (Unit economics / cost-driver breakdown):** Partial — cost-per-validated-version appears as one SLO dimension; no dedicated cost-driver table.
- **Item 8 (End-to-end architecture & data flow):** Fully covered — Section 4 architecture diagram, component table, sequence diagram.
- **Item 9 (Data model & API contracts):** Fully covered — Section 5's four records and four API contracts with auth/idempotency/error codes.
- **Item 10 (Build-vs-buy / vendor & model-selection trade-offs):** Absent — chapter focuses on configuration-vs-code and core-vs-adapter, not vendor/BPM selection.

**Phase 3 — Trade-offs, Security & Reliability**
- **Item 11 (Named trade-off pairs with balanced verdict):** Fully covered — Section 8's four trade-off pairs.
- **Item 12 (Threat model / security controls):** Fully covered — Section 6's four security controls.
- **Item 13 (Failure-mode & reliability drills):** Fully covered — Section 6's 4-part loop drill, 4 additional failure cases, 6-row policy table.
- **Item 14 (Testing strategy):** Fully covered — Section 5 contract/failure-injection tests; Section 6 publish-path invariant test.

**Phase 4 — Delivery, Governance & Communication**
- **Item 15 (Layered evaluation metrics & observability):** Fully covered — Section 7's 6 named metrics, 4-layer framework.
- **Item 16 (Phased rollout, risk register, rollback gates):** Fully covered — Section 7's 4-phase rollout, 4-row risk register, rollback triggers.
- **Item 17 (Regulatory / governance depth):** Absent — no data residency or industry-specific audit-regime discussion beyond the general audit trail.
- **Item 18 (Responsible-AI / risk framing beyond the obvious failure mode):** Absent — not an AI-application chapter; risk framing is entirely configuration safety and tenant isolation.
- **Item 19 (Change-management / adoption narrative):** Fully covered — Section 7's rollout narrative, named ownership, fork-count/adoption metrics.
- **Item 20 (Structured communication plan + self-scoring rubric):** Fully covered — Section 8's minute-by-minute plan, 90-second summary, scoring rubric, rehearsal checklist, practice plan.

Given the strength of first-pass coverage (only items 7, 10, 17, and 18 fall short, each reflecting genuine absence or reduced emphasis in the source material rather than an omission from this draft), no second or third review pass was needed.

### My Perspective on the Gaps

*The following is supplementary perspective from this reformatting pass, not sourced from the original chapter.*

**Item 7 — Unit economics / cost-driver breakdown.**
- I would build the cost model directly off the four-step capacity envelope in Section 3: cost per validated version (CPU/network cost of schema + policy + dependency + dry-run checks), cost per deployment (driven by fan-out across tenant instances and downstream sync jobs, not raw edit count), cost per plugin-execution-second in the sandbox, and storage cost for the append-only `ConfigDeployment` ledger and version graph.
- The interesting driver to name out loud is that validation cost scales with tenant behaviour, not platform design — a tenant with deeply branched forms or many rule clauses can push validation cost up without any change on the platform side, which is exactly why Section 3's expressive-power limits (max fields, max rule clauses, bounded plugin windows) are also a cost control, not just a safety control.
- I would present it as a per-tenant unit-cost line so a single noisy tenant's cost is visible rather than smeared into an aggregate platform number — that visibility is what lets you have the "should this tenant's customisation live in config vs. an adapter" conversation with real numbers instead of leverage as an abstraction.

**Item 10 — Build vs. buy / vendor and model-selection trade-offs.**
- The most concrete build-vs-buy decision hiding in this chapter is the workflow/rules engine itself: build the declarative engine described in Section 4-5, or buy a BPM/workflow-orchestration platform (e.g., a commercial rules engine or workflow-as-a-service product) and wrap it with the same control-plane/data-plane split.
- My heuristic: buy when the capability is a solved, commodity problem where a vendor is accountable for its own security posture and competes on that — identity/SSO federation is the textbook example, and it applies here too if the platform needs enterprise IdP integration for customer admins. Build the workflow engine itself, because the differentiator in this chapter is exactly the constrained, tenant-safe configuration model (validation, versioning, sandboxing) — that's the part no vendor can be accountable for on your behalf, and it's also the part the interview is testing.
- The adapter SDK is a middle case: buy/reuse connector frameworks for common systems (CRM, ticketing) where possible, but keep the adapter contract and permission model in-house since that's the trust boundary the chapter's security section (Section 6) depends on.

**Item 17 — Regulatory / governance depth.**
- Given the tenant-isolation architecture already in Section 4 (control plane vs. data plane, tenant-ID partitioning, per-tenant adapter scoping), the natural extension is data residency: if customers span jurisdictions, the configuration registry and workflow audit store may need region-pinned storage, and the `TenantConfig`/`ConfigDeployment` records in Section 5 would need a region field so the deployment ledger can prove where a tenant's data and execution actually lived.
- I would also connect this to the audit control already named in Section 6 ("audit configuration publishers and versions") — that same durable trail is much of the change-management evidence a SOC 2 audit (criterion CC8.1) or SOX IT general controls ask for: who approved, what was tested, what went live. It's a smaller piece of HIPAA if the workflow touches health data, because HIPAA's audit-control rule is about recording activity on systems that hold that data, not just config changes. So the gap is smaller than it looks; it mainly needs an explicit retention-period-per-regulation statement layered on top of the existing retention discussion in Section 5.
- I'd raise this proactively in an interview by naming one regulatory driver relevant to the customer vertical implied by the prompt (e.g., financial-services approval workflows implying SOX-style segregation of duties) and mapping it onto the existing approval-role and audit-trail mechanics rather than introducing new infrastructure.

**Item 18 — Responsible-AI / risk framing beyond the obvious failure mode.**
- This chapter genuinely has no AI component in the described architecture — the "intelligence" is entirely deterministic validation, policy, and rule evaluation — so forcing a responsible-AI narrative would be artificial. The honest interview move is to say so explicitly rather than bolt on generic AI-safety language.
- Where this could legitimately arise: if a future evolution added an AI-assisted config authoring tool (e.g., "suggest an approval graph from a natural-language description"), the same fail-closed philosophy from Section 6 would extend directly — treat AI-suggested configuration as untrusted input that must pass the same schema/policy/cycle-detection gates as human-authored config, never as a bypass around them.
- I would flag this trade-off if the interviewer pushes on it: an AI-assisted authoring layer increases the risk surface at exactly the boundary (Section 4's config editor → validator path) the chapter already treats as adversarial, so it changes the *volume* of untrusted input hitting the validator, not the trust model itself.

## Sources (checked 27 Sep 2026)

- [The Idempotency-Key HTTP Header Field (IETF draft -07)](https://www.ietf.org/archive/id/draft-ietf-httpapi-idempotency-key-header-07.html) — `422` for a reused key with a different body, `409` for a retry while the first request is still running, replay returns the original result
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) — meanings of `409 Conflict`, `412 Precondition Failed` for a failed `If-Match`, and the `422 Unprocessable Content` name
- [AICPA 2017 Trust Services Criteria (revised points of focus, 2022)](https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022) — SOC 2 change-management criterion CC8.1
- [PCAOB AS 2201: An Audit of Internal Control Over Financial Reporting](https://pcaobus.org/oversight/standards/auditing-standards/details/AS2201) — SOX audits test IT controls, including program changes and segregation of duties
- [45 CFR 164.312(b), HIPAA audit controls](https://www.law.cornell.edu/cfr/text/45/164.312) — HIPAA's audit rule covers activity on systems holding health data
