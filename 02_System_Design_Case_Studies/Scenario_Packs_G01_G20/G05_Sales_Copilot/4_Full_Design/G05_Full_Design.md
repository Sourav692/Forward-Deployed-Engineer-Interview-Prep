# Sales Copilot for Account Executives

*An assistant that knows the account better than the rep, without ever seeing more of the CRM than the rep may.*

◷ 28 min

Summarising an account is the easy part of a sales copilot. Every useful answer touches CRM records, call transcripts and pricing policy permissioned by territory, role and deal stage. One invented customer fact or unapproved claim can reach a customer's inbox. This page consolidates the group's prompts into one read for the day before. The group has no bespoke worked design, only a templated practice worksheet, so the CRM-permission and account-data detail here is added for this pack and marked where it appears.

| Case in the group | What it contributes here |
|---|---|
| #28 Sales Copilot for Account Executives (anchor) | Sections 1 to 12: the worksheet, answer key, requirements, evaluation, rollout and spoken answer |
| #48 OpenAI Q4 AI-Powered Sales or Account-Research Assistant | The explore list and success metrics in sections 1 and 10, the fabricated-fact follow-up in section 12 |
| #40 Reduce latency for an agentic CRM assistant | Section 13 |
| Incident 7, model regression missed by a weak eval suite (mapped to G13 in the sheet, walked here because it is a sales copilot) | Sections 10 and 14 |
| Concept tutorials on identity, connectors and the structured-data router | The permission and CRM-connector detail in sections 3, 6 and 7 |

---

## 1. Name the Workflow and the Risk Boundary Before Drawing Anything

Do not start with the model. Start with the workflow. Which B2B sales workflow is slow, risky or inconsistent today? Who decides at the end of it? Which risk cannot be automated? A copilot that saves ten minutes and sends one unapproved claim has lost more than it saved, so name the risk boundary before the first box.

The workflow is the pre-meeting hour. An account executive prepares for a meeting. They ask for an account summary, the opportunity risks, suggested discovery questions, email drafts and CRM update suggestions. Each of those five outputs sits on a different side of the risk boundary. The summary and risks are read-only assistance. The questions and drafts are draft-only. The CRM update is an action, and it needs explicit approval before write-back.

The three answer tiers show what the framing buys. The weak answer connects the documents to a vector database, uses an LLM to answer questions and adds a chatbot UI. It ignores the workflow, the permission boundaries, source freshness, evaluation, human approval and monitoring. The average answer builds RAG over the company data, adds citations and tests with sample questions. It never separates low-risk assistance from high-risk actions, never defines the data model or permission checks, and never explains rollout gates. The strong answer maps the workflow and the risk boundary first, then designs a permission-aware system. It ingests approved sources with metadata, freshness and ACLs. It uses hybrid retrieval with pre-generation permission filtering, generates cited answers, exposes uncertainty and missing evidence, and routes risky actions to human approval. It proves the system with golden cases, permission red-team tests, groundedness and citation metrics, latency and cost budgets, and a staged rollout from offline prototype to approved write-back.

Ask the questions that decide the design and write the answers where they stay visible.

| Question to ask | What the answer decides |
|---|---|
| What exact sales workflow is slow, risky or inconsistent today, and what decision does the user make at the end of it? | The five outputs and which side of the risk boundary each sits on |
| Who is the primary user, who reviews the output, and who owns the operational risk if the assistant is wrong? | The approver for drafts and CRM writes; the trace store's audience |
| Which tasks are read-only, which are draft-only, and which need explicit approval before write-back? | The tool allowlist and the approval gate |
| Which systems hold the trusted source of truth, and how do their permissions, freshness and ownership differ? | The connector map and the permission model per source |
| What are the top five recurring cases by volume and the top five highest-risk cases by impact? | Which requests get a deterministic route and which need the agent |
| What does a successful 30-day pilot prove: less handling time, higher accuracy, better compliance, fewer escalations, or satisfaction? | The success metrics agreed at intake |
| What must the assistant refuse or escalate instead of generating? | Pricing promises, unapproved claims, competitor facts without a source |
| What audit evidence must exist so security, legal or management can reconstruct why the system answered as it did? | The audit log schema |

Map the people, because each notices a different failure first.

| User | Workflow | Failure they notice first | What the copilot gives them | Approval needed |
|---|---|---|---|---|
| Account executive | Prepares for the meeting, asks for summary, risks, questions, drafts, CRM updates | A wrong or invented account fact | A cited account brief, risk list grounded in CRM fields, drafts from approved messaging | None for read-only; every draft is theirs to send; every CRM write is previewed |
| Sales manager / reviewer | Reviews pipeline hygiene and outbound claims | A polished draft with an unsupported claim | Claim-level flags, escalation reasons, pipeline updates as proposals | Approves high-risk drafts and writes above the threshold |
| Admin / security | Owns CRM permissions, connector credentials, audit export | A rep seeing an account outside their territory | Permission-aware retrieval, connector registry, immutable audit | Signs off each source and each write tool |
| Executive sponsor | Tracks adoption and time saved | A tool nobody opens before meetings | Preparation-time reduction, adoption, conversion and meeting-quality metrics | Approves rollout stages |

The practice-set version of this prompt (a likely OpenAI-style case, not an official question) asks for account briefs. It lists what to explore:

- CRM, email, product-usage, support and public-data integrations
- entity resolution
- freshness and source prioritisation
- permission boundaries
- citation and provenance
- personalisation
- human review
- measuring seller adoption and time saved

Every item lands in a section below.

## 2. State Requirements as Testable Constraints

A requirement the customer cannot test is a preference. "Make the brief accurate" is a preference; "90 percent of claims supported by cited evidence, zero permission violations" is a constraint, and only the second changes the architecture. Split the functional list with MoSCoW so the launch gate is the smallest set that keeps the promise.

The must-haves are four. Support the core workflow: account summary, opportunity risks, discovery questions, email drafts and CRM update suggestions, in that order of risk. Return grounded answers with citations to approved source systems, and never answer an unsupported claim confidently. Apply user, role, tenant, region and sensitivity permissions before retrieval and again before final generation. Keep every write tool behind a preview and a human approval.

The should-haves belong in the first usable version. Show confidence, missing evidence and the escalation reason when the system is uncertain or the policy risk is high. Collect user feedback and reviewer corrections for evaluation, never for training without governance. Provide admin controls for source inclusion, document freshness, policy rules, blocked actions and audit export. Precompute the account snapshot before the meeting so the interactive path stays fast. Personalisation by segment and playbook, public-data enrichment, and conversion attribution can wait.

Declare the non-goals, because a sales copilot sprawls into a CRM replacement if nobody stops it:

- sending email on the rep's behalf
- writing to the CRM without a previewed, approved draft
- quoting prices or discounts outside the approved policy
- scoring or ranking leads (biased lead scoring is a named red-team risk)
- reading accounts outside the rep's territory or role
- long-term memory of a customer beyond the CRM record

The non-functional requirements are the operating constraints, stated so a test can fail them.

| Constraint | Stated so it can be tested |
|---|---|
| Latency | In this design, interactive answers in 3 to 8 seconds for normal questions. Longer workflows go asynchronous with progress state. The pre-meeting brief is precomputed, so the interactive ask reads a snapshot rather than fanning out to the CRM |
| Availability | Business-critical selling hours. Graceful degradation if the LLM, the vector store or the CRM is down: serve the last snapshot with a staleness label, or refuse |
| Cost | Token budgets, caching of stable documents, retrieval pruning, small models for classification, expensive reasoning only where the risk justifies it. Reported as cost per workflow |
| Security and privacy | SSO, RBAC and ABAC, source-level ACLs, encryption in transit and at rest, secrets management, no training on customer data unless the contract allows it |
| Audit and compliance | Immutable logs of queries, retrieved evidence, model version, policy decisions, approvals and final output |
| Reliability | Fail closed on permission uncertainty, stale data, missing citations and high-risk write actions |

Every must-have needs an owner in the architecture.

| Requirement | Primary component(s) |
|---|---|
| Five outputs by risk order | Intent router, snapshot service, draft generator, CRM write proposer |
| Grounded answers with citations | Approved-claims retriever, evidence selector, citation builder, claim verifier |
| Permissions before retrieval and before generation | Identity gateway, CRM permission mirror, ABAC pre-filter, policy post-check |
| Write tools behind preview and approval | Tool gateway, allowlist, draft store with approval status, idempotency keys |
| Confidence and escalation shown | Grader, output policy engine |
| Feedback for evaluation only | Feedback store separated from ground truth, SME approval step |
| Admin controls and audit export | Control plane, audit log |
| Precomputed snapshot | Scheduled snapshot job, snapshot cache keyed on account and rep permission signature |
