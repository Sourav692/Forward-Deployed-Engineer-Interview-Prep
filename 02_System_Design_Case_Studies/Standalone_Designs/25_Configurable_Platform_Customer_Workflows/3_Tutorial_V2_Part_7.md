# Design a Configurable Platform for Customer-Specific Workflows, part 7

## Coverage Notes

We reviewed this guide once against our 20-point checklist for design case studies. Almost every point was met on that first pass, so the notes below record the result and flag where the guide is thin.

**Phase 1 — Problem Framing & Discovery**
- **Item 1 (turning the feature request into a business outcome):** Met. Section 1 states what the business gains before it names any technology.
- **Item 2 (who the stakeholders are):** Met. Section 1 lists 8 stakeholder groups.
- **Item 3 (questions whose answers reshape the design):** Met by the interview tree of six questions in Section 2.
- **Item 4 (splitting and ranking requirements):** Met. Section 2 keeps must-have functional needs apart from non-functional targets that can be measured.
- **Item 5 (what is out of scope):** Met. Section 2 names five things the MVP leaves out.

**Phase 2 — Estimation & Architecture**
- **Item 6 (rough sizing and capacity arithmetic):** Met. Section 3 runs a worked estimate, a four-step envelope and a sensitivity table.
- **Item 7 (cost per unit, split by driver):** Partly met. Section 3 lists cost per validated version among its SLO dimensions, yet no table separates cost into its drivers.
- **Item 8 (the whole architecture and how data moves through it):** Met. Section 4 gives the architecture diagram, a table of components and a sequence diagram.
- **Item 9 (records and API contracts):** Met. Section 5 specifies the four records and the four API contracts, and each contract states its auth, idempotency and error codes.
- **Item 10 (whether to build or buy, and which vendor or model):** Not met. The guide compares configuration with code and core with adapters, but never weighs vendors or BPM products against each other.

**Phase 3 — Trade-offs, Security & Reliability**
- **Item 11 (named trade-offs, each with a fair verdict):** Met by the four pairs in Section 8.
- **Item 12 (threats and the controls that answer them):** Met by Section 6, which sets out four security controls.
- **Item 13 (drills for failure modes and reliability):** Met. Section 6 runs a loop drill in four parts, four more failure cases and a policy table with six rows.
- **Item 14 (how the system is tested):** Met. Section 5 includes contract tests and failure-injection tests; Section 6 adds a test for the publish-path invariant.

**Phase 4 — Delivery, Governance & Communication**
- **Item 15 (metrics in layers, plus observability):** Met. Section 7 names 6 metrics inside a framework of four layers.
- **Item 16 (staged rollout, risk register and gates for rollback):** Met. Section 7 sets out four rollout phases, a risk register with four rows and the conditions that trigger rollback.
- **Item 17 (depth on regulation and governance):** Not met. Beyond the general audit trail, the guide says nothing about data residency or industry audit regimes.
- **Item 18 (responsible AI and risks past the obvious failure):** Not met. No AI component exists in this design; every risk it frames concerns safe configuration and keeping tenants apart.
- **Item 19 (how people adopt the change):** Met. Section 7 tells the rollout story, assigns owners and tracks adoption and the number of forks.
- **Item 20 (a structured talk plan and a rubric to score yourself):** Met. Section 8 provides the minute-by-minute plan, the 90-second summary, a scoring rubric, a rehearsal checklist and a practice plan.

Four items fall short: 7, 10, 17 and 18. Each gap is a deliberate choice of scope or emphasis in the design, not something lost while writing it up, so a single review pass was enough.

### My Perspective on the Gaps

*These notes reach beyond the core design. Use them if an interviewer presses on one of the gaps.*

**Item 7 — cost per unit, split by driver.**
- Base the cost model on Section 3's four-step capacity envelope. Four lines are enough. Line one prices each validated version: the CPU and network spent on schema, policy, dependency and dry-run checks. Line two prices each deployment; fan-out to tenant instances and downstream sync jobs drives it, while raw edit volume barely matters. Line three is the price of each second a plugin runs in the sandbox. Line four is storage for the version graph and the append-only `ConfigDeployment` ledger.
- Say one driver out loud: tenants, not the platform design, set validation cost. Forms with deep branching or rules with many clauses make validation dearer even when nothing on the platform side moves. So the limits on expressive power in Section 3 (maximum fields, maximum rule clauses, bounded plugin windows) control cost as much as they control safety.
- Report cost per tenant, line by line. One noisy tenant then shows up clearly instead of disappearing into a platform total. That view turns "should this customisation sit in config or in an adapter?" into a debate about real figures rather than about leverage in the abstract.

**Item 10 — whether to build or buy, and which vendor or model.**
- Here the obvious build-or-buy question is the workflow and rules engine. You could build the declarative engine laid out in Sections 4 and 5. Or you could buy a BPM or workflow-orchestration product (a commercial rules engine, say, or workflow-as-a-service) and keep the same split between control plane and data plane around it.
- A rule of thumb: buy what is already solved and commoditised, where the vendor owns its security record and competes on it. Identity and SSO federation is the standard example, and it fits here if customer admins must log in through an enterprise IdP. Build the workflow engine, though. What sets this platform apart is its constrained, tenant-safe configuration model, with validation, versioning and sandboxing. No vendor can take responsibility for that in your place. It is also what the interviewer wants to see you design.
- The adapter SDK falls between the two. Where a connector framework already exists for a common system, such as CRM or ticketing, reuse or buy it. Keep the adapter contract and its permission model in-house: the security design in Section 6 depends on that trust boundary.

**Item 17 — depth on regulation and governance.**
- Section 4 already isolates tenants: it separates control plane from data plane, partitions data by tenant ID and scopes each adapter to one tenant. Data residency extends that. When customers live under different jurisdictions, the configuration registry and the workflow audit store may need storage fixed to a region. Section 5's `TenantConfig` and `ConfigDeployment` records would each gain a region field. The deployment ledger could then show where every tenant's data was held and where its workflows ran.
- Tie this to the audit control in Section 6, which logs who published each config version. That durable log already answers most of what a SOC 2 auditor (criterion CC8.1) or a review of SOX IT general controls asks about change management: who signed off, what was tested and what shipped. It does less for HIPAA if the workflow handles health data, because HIPAA's audit-control rule targets activity on any system storing that data, beyond config changes alone. The real gap is therefore modest. What it mostly lacks is an explicit retention period per regulation, added to the retention rules Section 5 already sets.
- Bring this up in an interview before anyone asks. Pick one regulation that matches the customer's industry; SOX-style segregation of duties for approval workflows in financial services is a good example. Then show how the existing approval roles and audit trail satisfy it, with no new infrastructure.

**Item 18 — responsible AI and risks past the obvious failure.**
- Nothing in this design is AI. Its "intelligence" consists of deterministic validation, policy checks and rule evaluation. Bolting on a responsible-AI story would sound hollow. Tell the interviewer that directly instead of reaching for generic AI-safety wording.
- That may change. A later release might add an AI helper for authoring, say one that drafts an approval graph from a plain-language description. The fail-closed stance of Section 6 applies unchanged. Whatever the AI proposes is untrusted input. It passes through the same schema, policy and cycle-detection gates as config a person wrote, and it never gets a route around them.
- Under pressure from the interviewer, state the trade-off. AI-assisted authoring adds risk at the very boundary this design already treats as hostile: the path from config editor to validator in Section 4. It raises the *volume* of untrusted input that reaches the validator. The trust model stays the same.

## Level calibration

On a shared workflow platform for ten customers, the levels separate on how far the answer goes past "make it configurable".

| Level | Sounds like | Missing |
|---|---|---|
| Senior | "One workflow runtime, declarative configs in a versioned registry, a validator on publish and an adapter SDK for integrations. Save stays fast while validation and deployment run queued and idempotent, and an approval loop fails closed for that version." | Who authors and approves configs, how a new version reaches one tenant before the rest, and who owns rollback. |
| Staff | "Split the control plane from the data plane: publish immutable versions, expose them behind a tenant flag and gate on the tenant test harness. Ownership is explicit: product owns templates, customers own values, integrations own adapters, ops own the `ConfigDeployment` ledger, and rollout starts with one willing customer admin." | Which variations earn a place in core, how old schema generations retire, and whether to build the engine at all. |
| Principal | "Pick the workflow family the company wants to own and promote a capability to core only when its leverage is proven. Build the constrained configuration model, buy commodity pieces like identity federation, and run a deprecation policy with a small number of supported generations. Fork count and upgrade time per tenant are what the organisation steers by." | Which differences truly recur, and what upgrade promise customers expect, need the first customers' real change requests to settle. |

## Sources (checked 27 Sep 2026)

- [The Idempotency-Key HTTP Header Field (IETF draft -07)](https://www.ietf.org/archive/id/draft-ietf-httpapi-idempotency-key-header-07.html) — `422` for a reused key with a different body, `409` for a retry while the first request is still running, replay returns the original result
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) — meanings of `409 Conflict`, `412 Precondition Failed` for a failed `If-Match`, and the `422 Unprocessable Content` name
- [AICPA 2017 Trust Services Criteria (revised points of focus, 2022)](https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022) — SOC 2 change-management criterion CC8.1
- [PCAOB AS 2201: An Audit of Internal Control Over Financial Reporting](https://pcaobus.org/oversight/standards/auditing-standards/details/AS2201) — SOX audits test IT controls, including program changes and segregation of duties
- [45 CFR 164.312(b), HIPAA audit controls](https://www.law.cornell.edu/cfr/text/45/164.312) — HIPAA's audit rule covers activity on systems holding health data
