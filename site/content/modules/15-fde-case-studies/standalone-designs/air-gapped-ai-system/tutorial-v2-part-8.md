# Chapter 7: Design an AI System for an Air-Gapped Environment, part 8

## Coverage Notes

One self-review pass was run against the fixed 20-item/4-phase decomposition rubric.

**Phase 1 — Problem Framing & Discovery**
- **Item 1 (Feature → business-outcome reframing):** Fully covered — Section 1 outcome restatement and business-outcome bullets.
- **Item 2 (Stakeholder/persona mapping):** Fully covered — Section 1 stakeholder table.
- **Item 3 (Clarifying questions that change the architecture):** Fully covered — Section 2's six discovery questions and decision tree.
- **Item 4 (Requirements split + prioritisation):** Fully covered — Section 2 functional/nonfunctional lists and must/should/could.
- **Item 5 (Explicit non-goals/scope fence):** Fully covered — Section 2 "What the MVP will not support."

**Phase 2 — Estimation & Architecture**
- **Item 6 (Back-of-envelope scale & capacity math):** Fully covered — Section 3 replica formula and worked example.
- **Item 7 (Unit economics/cost-driver breakdown):** Absent — Section 3's Cost SLI and rollout cost discussion address cost control/drivers qualitatively, but no unit-economics view (e.g., cost per document or per analyst-hour) is built; no fabricated numbers added.
- **Item 8 (End-to-end architecture & data flow):** Fully covered — Section 4 component list, diagrams, happy-path sequence.
- **Item 9 (Data model & API contracts):** Fully covered — Section 5's three records and four API contracts.
- **Item 10 (Build-vs-buy/vendor & model-selection trade-offs):** Partial — Section 8 addresses model-size trade-offs but frames the system as built in-house end to end; no weighing of an off-the-shelf/vendor air-gapped platform against a custom build.

**Phase 3 — Trade-offs, Security & Reliability**
- **Item 11 (Named trade-off pairs with balanced verdict):** Fully covered — Section 8's four core trade-offs.
- **Item 12 (Threat model/security controls):** Fully covered — Section 6 "Threat-model the offline control plane."
- **Item 13 (Failure-mode & reliability drills):** Fully covered — Section 6 decision table and missing-transitive-package drill.
- **Item 14 (Testing strategy):** Fully covered — Section 5 and Section 6 contract tests and failure-injection tests.

**Phase 4 — Delivery, Governance & Communication**
- **Item 15 (Layered evaluation metrics & observability):** Fully covered — Section 7 technical health / user / business metric layers.
- **Item 16 (Phased rollout, risk register, rollback gates):** Fully covered — Section 7's four-phase rollout and risk register.
- **Item 17 (Regulatory/governance depth):** Absent — internal governance language (accreditation, approval gates, audit trails) is used extensively, but no specific regulatory framework (e.g., FedRAMP, ITAR, NIST 800-53) is named; left Absent rather than invented since the source deliberately stays framework-agnostic.
- **Item 18 (Responsible-AI/risk framing beyond the obvious failure mode):** Fully covered — present via a correctness/governance/integrity lens (signed provenance, fail-closed policy, audit evidence) rather than bias/fairness framing; not double-counted against item 12.
- **Item 19 (Change-management/adoption narrative):** Fully covered — Section 7's ownership/gates section and ownership-ladder framing.
- **Item 20 (Structured communication plan + self-scoring rubric):** Fully covered — Section 8's 50-minute pacing plan and 7-item rubric.

No further review passes were run — the single pass found no additional closeable gaps that the source material actually supports.

### My Perspective on the Gaps

*The following is supplementary perspective, not sourced from the original chapter — my own view on how to address these gaps live, grounded in this chapter's own architecture.*

**Item 7 — Unit economics/cost-driver breakdown.**
- I would build the unit-economics view directly from the replica formula already in Section 3, rather than inventing new numbers: cost per document = (GPU-hours consumed by the model server + storage/index amortisation + telemetry/audit storage) / documents processed in the window.
- The fixed-GPU-pool constraint actually makes this easier to reason about than in a cloud system — since replicas can't elastically scale, the "cost driver" question collapses to "what fraction of the fixed pool does this workload consume," which ties straight back to the 477-replica worked example: I'd frame it as "cost per analyst-hour saved" versus "GPU-hours burned," and use the sensitivity table's baseline-vs-10x comparison as the cost-scaling argument instead of a dollar figure I can't defend.
- In a live interview I'd say the honest thing: I don't have the customer's GPU procurement cost or analyst fully-loaded cost, so I'd sketch the formula shape (cost = fixed hardware amortisation + operational/audit overhead, divided by throughput) and ask the interviewer for one real number to anchor it, rather than fabricate a cost-per-document figure.

**Item 10 — Build-vs-buy/vendor and model-selection trade-offs.**
- Given this chapter's own component list (Section 4's nine components), I'd explicitly split buy-vs-build by component rather than treating the whole system as one build decision: the offline registry/package mirror, local identity provider integration, and telemetry stack are exactly the kind of commodity infrastructure I'd buy or adopt from an existing accredited vendor product where one exists on the approved products list, because I'd expect building a bespoke air-gapped package mirror to burn months re-solving a problem the customer's own accreditation program has likely already blessed a vendor for.
- Conversely, I'd build in-house exactly the pieces that are unique to this program's mission: the document pipeline's redaction/extraction logic, the release-manifest schema, and the verify_bundle integrity gate from Section 5 — because no vendor can be accountable for domain-specific redaction correctness or for a manifest schema tailored to this customer's audit policy.
- General heuristic to say out loud: buy anything that is a solved, security-commoditised problem where vendors already carry the right government credentials (identity brokers, package mirrors, base OS images). For on-prem products that usually means a Common Criteria listing on NIAP's Product Compliant List and a published DISA STIG, not FedRAMP, which only covers cloud services. Build only the boundary logic and mission-specific pipeline that is unique to the customer's workflow and that the chapter's own MVP list (Section 2) already marks as must-have.

**Item 17 — Regulatory/governance depth.**
- I would name a plausible governance framework out loud even though the source stays framework-agnostic, because in a real interview silence here reads as inexperience: for a US government air-gapped enclave I'd reference NIST SP 800-53 Rev 5 control families (SC for system/communications protection, AU for audit, CM for configuration management) as the natural mapping for the chapter's own controls — the signed release manifest maps to CM-3/CM-14 (configuration change control and signed components), the offline audit event log maps to AU-2/AU-12, and the fail-closed dependency policy maps to SC-7 boundary protection.
- I'd also mention that if the workload touches export-controlled technical data, ITAR/EAR handling rules could shape which analysts can even see certain documents — which would feed back into Section 1's stakeholder table as a new constraint from the compliance officer.
- The way I'd frame it live: "I don't know which specific framework governs this enclave, but the controls I've already described — signed provenance, append-only audit, fail-closed promotion — map cleanly onto NIST 800-53's CM and AU families, so the architecture doesn't have to change once we learn the exact framework, only the evidence formatting does."

## Sources (checked 27 Sep 2026)

- [NIST SP 800-53 Rev 5 control catalog (OSCAL JSON, usnistgov/oscal-content)](https://github.com/usnistgov/oscal-content/tree/main/nist.gov/SP800-53/rev5) — control titles for CM-3, CM-14, AU-2, AU-12 and SC-7
- [FedRAMP](https://www.fedramp.gov/) — FedRAMP authorises cloud services, not on-prem products
- [NIAP Product Compliant List](https://www.niap-ccevs.org/product/pcl) — Common Criteria listing for commercial IT products used in national security systems
- [DISA Security Technical Implementation Guides](https://www.cyber.mil/stigs/) — DoD configuration guides for operating systems and other products
- [SLSA provenance specification v1.0](https://slsa.dev/spec/v1.0/provenance) — build provenance attestations
- [Python `hmac.compare_digest`](https://docs.python.org/3/library/hmac.html#hmac.compare_digest) — constant-time comparison to reduce timing attacks
