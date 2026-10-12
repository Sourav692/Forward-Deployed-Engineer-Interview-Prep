# Document Review Copilot with a Policy Check

*Extraction is cheap and judgement is expensive, and the copilot must never let the cheap step stand in for the expensive one.*

The three personas in this group look like three products: a prior-authorisation assistant, a compliance reviewer, a contract copilot. They are one system with one spine. A document comes in. Structure is extracted and compared against a policy, a playbook or clinical criteria. Gaps are flagged, risk is classified, and material cases go to a human who decides. This page consolidates the group's prompts into one read for the day before. The purchased answer keys are templated. So the argument here is built from their workflows, records, risks and rollout, plus the vendor's prior-authorisation case. Anything constructed for this page rather than taken from a source is labelled as such.

| Case in the group | What it contributes here |
|---|---|
| #30 Healthcare Prior Authorisation Assistant (anchor) | Sections 1 to 10: the design, the PHI boundary, the payer-rule versioning, the spoken answer; the vendor PDF's personas, workflow, red-team list and rollout phases |
| #29 Financial Compliance Document Reviewer | The rule-citation and risk-classification variant in sections 3 and 7; the red-team mock in section 12 |
| #31 Legal Contract Review Copilot | The clause-versus-playbook variant and fallback language in sections 3 and 7 |
| #47 OpenAI-style Q3 Claims-Processing Assistant (practice case) | The lower-risk-first ordering in section 10 and its follow-up in section 11 |
| #56 OpenAI-style Q12 Deploying AI in a Highly Regulated Industry (practice case) | The governance checklist in section 8 and its follow-up in section 11 |
| #89 Incident: correct answer, misleading citation | Section 14 |
| #92 Incident: PDF parser drops critical tables | Sections 6 and 14 |
| Self-drill for #30, cost per document | Section 13 |

---

## 1. Frame the Copilot as a Drafter, Never a Decider

Open by saying what the system is not. It does not make the clinical decision, the compliance ruling or the legal call. It gathers evidence, maps it to the governing rule, writes the draft and explains the risk. A named human approves. That is the whole design. Every component below exists to keep the cheap step from being mistaken for the expensive one.

> *"I would design this as a permission-aware prior-authorisation drafting system, not a clinical decision-maker. Every generated claim must point back to a source note, code, lab result, or payer rule. If evidence is missing, stale, or conflicting, the assistant should not invent language. It should flag the gap and route the case to a clinician."*

The three answer tiers from the answer keys show what that framing buys. The weak answer connects the documents to a vector database and lets an LLM answer, maybe behind a chatbot UI. It ignores the workflow, the permission boundary, source freshness, evaluation, human approval and monitoring. The average answer builds RAG with citations and tests it on sample questions. It never separates low-risk assistance from high-risk actions. It never defines the data model or the rollout gates. The strong answer maps the workflow and the risk boundary first. It ingests approved sources with metadata, freshness and ACLs. It filters by permission before generation. It cites every claim, exposes uncertainty and missing evidence, and routes risky actions to approval. It proves all of that with golden cases, permission red-team tests, groundedness and citation metrics, and latency and cost budgets. The rollout is staged: offline prototype, shadow mode, read-only pilot, approved write-back.

Ask the discovery questions the answer keys share. Add the vendor case's domain ones. Each answer decides a component.

| Question to ask | What the answer decides |
|---|---|
| Which exact review workflow is slow, risky or inconsistent today, and what decision does the user make at the end of it? | The scope of the first slice and the definition of done |
| Who is the primary user, who reviews the output, and who owns the risk if the assistant is wrong? | The approval routing and the audit trail's audience |
| Which tasks are read-only, which are draft-only, and which need explicit human approval before write-back? | The tool allowlist and the risk tiers |
| Which systems hold the trusted source of truth, and how do their permissions, freshness and ownership differ? | The connector list, the ACL mapping, the freshness SLO per source |
| What are the top 5 recurring cases by volume and the top 5 highest-risk cases by impact? | Where the cheap path and the expensive path each go |
| What answer must the assistant refuse or escalate instead of generating? | The output policy engine's refuse and escalate modes |
| What audit evidence must be stored so security, legal or management can reconstruct why the system answered? | The audit record's fields |
| Are payer rules structured policies, PDFs, web portals or internal documents? | The ingestion pipeline and the table-extraction gate |
| Are we allowed to generate text that goes directly to the payer, or only internal drafts? | Whether external submission exists at all in version one |
| How should the system behave when clinical notes conflict with payer rules? | The conflict policy: surface, prefer the approved current source, escalate |
| Which PHI fields are necessary, and what is excluded from prompts and logs? | Data minimisation and the log redaction rules |

Map the people. Each notices a different failure first. The vendor case names four for prior authorisation. The other two personas have their equivalents.

| User | Workflow | Failure they notice first | What the copilot gives them | Approval role |
|---|---|---|---|---|
| Coordinator, analyst or contract reviewer | Selects the case, gathers the packet, checks required evidence, identifies what is missing | A packet that comes back incomplete or wrong | Draft with citations, a missing-evidence list, a denial-risk or deviation explanation | Prepares; does not approve |
| Clinician, compliance manager or counsel | Reviews the draft, confirms necessity or risk, overrides wrong suggestions, approves | Language that reads as a decision they did not make | An editable draft where every claim links to its source, with confidence and escalation reason | Approves, rejects, edits, or asks for more documentation |
| Revenue-cycle, surveillance or legal-ops manager | Tracks denial patterns, false-positive burden, turnaround | A tool that adds review time without improving first-pass rate | Dashboards separating operational from safety metrics | Approves rollout stages |
| Compliance or privacy officer | Reviews audit logs, access controls, PHI handling | A record accessed without a reason, or PHI in a log | Immutable audit of evidence IDs, policy versions, edits and approvals; least-privilege access | Any violation blocks release |

Scope out loud before drawing. One document type, one policy source, draft-only. Internal drafts, not external submission. Human approval on every material case. Two assumptions are worth stating if withheld. The assistant is administrative drafting, and the professional judgement stays with the reviewer. A source that lacks ACL metadata is excluded from production retrieval until it is mapped.

## 2. State Requirements as Testable Constraints

A requirement the reviewer cannot test is a preference. Say so. "Catch the risky ones" is a preference. "Recall above the agreed bar on severe violations, with the false-positive burden below the analyst's budget" is a constraint. Only the second one changes the architecture. Split the functional list with MoSCoW. The launch gate is then the smallest set that keeps the promise.

The must-haves are five. Each is a test. Retrieve the governing rule for the case. That is the payer-policy version by payer, plan, procedure, diagnosis and date of service, the regulatory obligation by jurisdiction and product, or the playbook position by clause type. Extract the relevant evidence or clauses from the document and the records, mapped to that rule. Generate a draft with a citation to the exact source span for every claim, and never invent language where evidence is missing. Identify missing evidence, outdated or conflicting documentation and rule gaps, and route ambiguous or high-risk cases to the named human. Keep a complete audit trail of retrieved rules, generated text, reviewer actions and final state.

The should-haves belong in the first usable version. Produce a denial-risk, deviation-risk or violation-risk explanation before the case leaves the system. Let the reviewer edit, approve, reject or override the draft in place. Show confidence, missing evidence and the escalation reason whenever the system is uncertain. Collect reviewer corrections for evaluation, never for model training without governance. Provide admin controls for source inclusion, document freshness, policy rules, blocked actions and audit export. Version every rule source so a decision is judged against the rule in force at the time of the request. Autonomous submission, fine-tuning, cross-tenant review and external communication can wait, and most of them should never arrive.

Declare the non-goals:

- no clinical, regulatory or legal decision by the model
- no submission to a payer, regulator or counterparty without an approver
- no generated text sent externally in version one
- no PHI or privileged content in prompts or logs beyond what the task needs
- no learning from reviewer edits without a governance step

The non-functional requirements are the operating constraints, each stated so a test can fail it.

| Constraint | Stated so it can be tested |
|---|---|
| Latency | Interactive questions 3 to 8 s; packet generation under 10 to 20 s per the vendor case; bulk surveillance runs overnight as batch with an interactive p95 under 10 s for analyst drill-down. Longer workflows go asynchronous with progress state |
| Availability | Business-critical hours with graceful degradation when the LLM, the vector store or a source system is down: partial packet with gaps labelled, or refusal, never a silent guess |
| Cost | Token budgets, caching for stable policy documents, retrieval pruning, small models for classification and extraction, the strong model routed only to flagged risk. Reported as cost per document and cost per true issue found |
| Security and privacy | SSO; RBAC and ABAC; source-level ACLs and patient-level access restrictions; encryption in transit and at rest; secrets management; no training on customer data unless the contract allows; PHI minimised in prompts and redacted from logs |
| Audit and compliance | Immutable log of queries, retrieved evidence IDs, policy versions, model and prompt version, policy decisions, reviewer edits, approvals and final output, with full evidence traceability for every generated statement |
| Reliability | Fail closed on permission uncertainty, stale rules, missing citations and any high-risk write action. Degrade on retrieval quality. Low hallucination tolerance for clinical, payer or policy claims |

Every must-have then needs an owner in the architecture. This table is the proof.

| Requirement | Primary component(s) |
|---|---|
| Governing rule by version | Policy ingestion pipeline, rule versioning store, rule retriever |
| Evidence and clause extraction | Parser with table extraction, extraction service with schema, evidence mapper |
| Draft with span-level citations | Drafting service, citation builder, citation verifier |
| Missing evidence and gap detection | Completeness and risk checker |
| Route material cases to a human | Risk tiering, review queue, approval workflow |
| Complete audit trail | Audit and compliance layer, trace store |
| No cross-user or cross-patient disclosure | Identity mapping, permission-aware retrieval, output policy engine |
| Fail closed on missing citation | Citation verifier, output policy engine |
