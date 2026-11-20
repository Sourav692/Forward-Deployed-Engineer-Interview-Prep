---
title: "Practise Decomposition Interview Cases"
subtitle: "Memorising one sophisticated design is tempting, but decomposition rounds reward a repeatable method applied to a case nobody has seen before."
track: Discovery, Scoping and Delivery
module_group: Discovery and scoping
module_code: T20.1
module_name: Customer discovery and problem decomposition
lesson: 8
lessons: ["The discovery conversation", "Observing the work", "Stakeholder and workflow maps", "Choosing the first use case", "Success metrics and evaluation data", "Decomposing a solution into workstreams", "Practise discovery questions", "Practise decomposition interview cases"]
level: intermediate
reading_time: "16 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "19 November 2026"
tags: [practice, interview, decomposition, case study, data platform]
---

## How to use this practice

Decomposition skill comes from repetition on varied cases, not from one rehearsed answer. Run each case below with the method from [the discovery conversation](01_The_Discovery_Conversation.md), aloud and against a clock. For each case:

1. Set a 45-minute timer and work the case aloud, producing the six outputs listed in the next section.
2. Open the outline and compare. Note which output you missed.
3. Say the follow-up answer too, because interviewers usually push once.

Each section names the lesson that teaches its ideas. Cases 7 to 10 are discovery-first cases with fictional customers. For ten-minute drills where the industry itself is unfamiliar, use [practise breaking down the unknown](../../../05_FDE_Delivery_and_Scoping/FDE_Track/fde-in-the-field/fde-role-and-boundaries/07_Practise_Breaking_Down_the_Unknown.md).

> **What you'll practise**
>
> - Running a case in 45 minutes and producing the six required outputs.
> - Recognising the hard areas the interviewer will probe in each common case.
> - Answering the standard follow-up for each case from the decomposition, not from memory.
> - Finding the real problem before decomposing a solution.

## Produce the same six outputs every time

Practise 8 to 10 cases in 45-minute sessions. For each case, force out:

- Five clarifying questions.
- Three to five workstreams.
- Three measurable success metrics.
- Two major trade-offs.
- Three failure modes.
- A phased plan from MVP to production.

A fixed output list makes practice comparable across cases. It also exposes the weak step. A case that ends with six workstreams but no metrics shows where to practise next.

## Knowledge and search cases

Taught in [decomposing a solution into workstreams](02_Decomposing_a_Solution_Into_Workstreams.md) and [success metrics and evaluation data](03_Success_Metrics_and_Evaluation_Data.md).

<details>
<summary>Practice question 1. "A global enterprise wants an assistant that answers employee questions from internal documents, policies and wikis."</summary>

- **Answer:** Start with the content. Workstreams: ingestion and freshness, chunking and metadata, hybrid versus vector-only retrieval with reranking, citations and grounding, and access-control-aware retrieval. Risks: contradictory or stale documents, and prompt injection arriving inside retrieved content. Close with latency and cost controls and human escalation.
- **Trade-off:** Hybrid retrieval with reranking improves relevance but adds latency and cost per query.
- **Follow-up to expect:** "It gives a confident but wrong answer." Separate retrieval failure from synthesis failure and measure each.
- **Go deeper:** [Decomposing a solution into workstreams](02_Decomposing_a_Solution_Into_Workstreams.md).

</details>

<details>
<summary>Practice question 2. "Information is spread across SharePoint, Slack, Google Drive, Confluence, Salesforce and databases. Build a unified search assistant."</summary>

- **Answer:** The hard part is not the model. The hard areas are identity resolution, permission propagation, connectors and incremental sync, deleted or revoked documents, source reliability, deduplication, freshness, ranking across different sources, citation and provenance, tenant isolation and search analytics.
- **Trade-off:** Frequent incremental sync keeps permissions current but costs connector load and rate limits on each source.
- **Follow-up to expect:** "A user loses access to a document tomorrow." Treat revocation as part of incremental sync and permission propagation, so retrieval never serves a stale grant.

</details>

<details>
<summary>Practice question 3. "A large company wants a coding assistant grounded in its private repositories."</summary>

- **Answer:** Index the code first. Workstreams: repository indexing with incremental updates, code-aware chunking, symbol and dependency retrieval, access control and IDE integration. Distinguish generating code from explaining it. Add static analysis, test execution and secret scanning, and raise IP and licensing concerns.
- **Trade-off:** Generating code gives more value than explaining it, and more risk, so it needs the static analysis and tests.
- **Follow-up to expect:** "Does it improve productivity?" Measure accepted suggestions and developer productivity, not suggestion volume.
- **Go deeper:** [Success metrics and evaluation data](03_Success_Metrics_and_Evaluation_Data.md).

</details>

## Workflow and operations cases

Taught in [success metrics and evaluation data](03_Success_Metrics_and_Evaluation_Data.md) and [choosing the first use case](04_Choosing_the_First_Use_Case.md).

<details>
<summary>Practice question 4. "A company wants to transcribe calls, summarise them, extract actions and update its CRM."</summary>

- **Answer:** Treat it as a pipeline: audio ingestion, speaker diarisation, transcription, PII redaction, summarisation, action-item extraction, CRM integration, confidence scoring, human correction and a retention policy. Evaluate by call type and language.
- **Trade-off:** Writing to the CRM automatically saves effort but spreads extraction errors. Confidence scoring decides which updates need a person.
- **Follow-up to expect:** "There is no single correct summary." Use rubrics, action-item precision and recall, field coverage, CRM update accuracy and user-edit distance.
- **Go deeper:** [Success metrics and evaluation data](03_Success_Metrics_and_Evaluation_Data.md).

</details>

<details>
<summary>Practice question 5. "A prototype works for 100 users. Deploy it to 100,000."</summary>

- **Answer:** Cover capacity modelling, multi-tenancy, rate limits, queuing, caching, model routing, batch processing and streaming. Add cost controls, autoscaling, observability, reliability targets, rollbacks, a security review, a support model, change management and adoption measurement.
- **Trade-off:** Caching and model routing cut cost but can return stale or weaker answers.
- **Follow-up to expect:** "Usage is low after launch." That is an adoption problem, not a scaling one.
- **Go deeper:** [Diagnosing low adoption](../T6.5_Adoption_and_Business_Impact/03_Diagnosing_Low_Adoption.md).

</details>

<details>
<summary>Practice question 6. "An assistant helps engineers diagnose production incidents."</summary>

- **Answer:** Start with the signals. Inputs are logs, metrics, traces, alerts, tickets and runbooks, correlated by time window and service topology, with retrieval of past incidents. Separate proposed remediation from executed remediation, keep an incident timeline and audit trail, and price false positives.
- **Trade-off:** A sensitive assistant catches more incidents and raises more false alarms that engineers learn to ignore.
- **Follow-up to expect:** "Should it restart services automatically?" Climb from read-only to suggested to approved to limited reversible action.
- **Go deeper:** [Choosing the first use case](04_Choosing_the_First_Use_Case.md).

</details>

## Data-platform cases

Taught in [decomposing a solution into workstreams](02_Decomposing_a_Solution_Into_Workstreams.md).

Five cases suit candidates with a cloud data platform background. Each one tests whether data engineering can be connected to AI delivery. Practise each with the six outputs.

| Case | What to connect |
|---|---|
| An enterprise AI data platform for structured, unstructured and streaming data | A governed data platform, batch and streaming ingestion, metadata and lineage, data quality, feature or retrieval pipelines, governance, evaluation datasets, production monitoring |
| A reusable RAG platform for many business units | Multi-tenant architecture, document ingestion, versioned table processing, metadata, vector and keyword retrieval, ACL propagation, an evaluation framework, cost isolation, model and embedding versioning |
| Near-real-time fraud or anomaly detection with explanations | Streaming ingestion, feature freshness, detection versus investigation, alert prioritisation, human feedback, false positives, explainability, backtesting, online monitoring, drift |
| A copilot that diagnoses pipeline and data-quality issues | Catalog and lineage, pipeline logs, quality checks, schema evolution, incident history, natural-language investigation, safe remediation suggestions, read versus write, auditability |
| Productionising a notebook prototype | Reproducibility, CI/CD, evaluation gates, model and prompt versioning, secrets, monitoring, cost controls, security, SLAs, rollback, ownership and support |

*Table 1: Five data-platform cases and what each one must connect.*

> **Warning:** Do not over-index on generic LLM theory. For a data-platform profile, show the connection between enterprise data, architecture, evaluation, governance, production operations and customer outcomes. That connection is the differentiator, not model internals.

## Discovery-first cases

Taught in [observing the work](06_Observing_the_Work.md), [stakeholder and workflow maps](07_Stakeholder_and_Workflow_Maps.md) and [choosing the first use case](04_Choosing_the_First_Use_Case.md).

These four cases test whether you find the real problem before decomposing a solution. The customers are fictional.

<details>
<summary>Practice question 7. "Our legal team wants a chatbot that answers questions about our contracts."</summary>

- **Answer:** Ask what goes wrong today before scoping a chatbot. Suppose staff turn out to draft from old contract templates because three versions sit in different folders. The problem is document versioning, not question answering. Workstreams: one approved template library with owners and version history, retirement of old copies, and a check at drafting time. A question-answering assistant can come later, grounded in the approved library only.
- **Trade-off:** Fixing the library first delays the visible chatbot. Building the chatbot first ships confident wrong answers.
- **Follow-up to expect:** "They still want the chatbot." Scope it after the library exists, because a chatbot over three conflicting versions gives confident wrong answers.
- **Go deeper:** [Observing the work](06_Observing_the_Work.md).

</details>

<details>
<summary>Practice question 8. "The head of operations wants one dashboard showing everything."</summary>

- **Answer:** Ask which decisions they make each week and what they look at to make them. "Everything" usually hides three or four decisions, each needing a few numbers. Workstreams: a decision list with owners, the metrics behind each with their system of record, data quality checks, and a first screen for the most frequent decision.
- **Trade-off:** A decision-led screen shows less than "everything", which can disappoint at first. It gets used.
- **Follow-up to expect:** "Every team wants its own tab." Add tabs only when a named decision needs them.
- **Go deeper:** [Stakeholder and workflow maps](07_Stakeholder_and_Workflow_Maps.md).

</details>

<details>
<summary>Practice question 9. "Leadership has set aside budget for an AI pilot. Find us something to do with it."</summary>

- **Answer:** Treat it as a search for a problem, not a technology placement. List candidate processes with their volume, cost and pain, rank them on value, risk and data readiness, and run short discovery on the top two. Recommend the one with a measurable baseline, even if the answer turns out to need little AI.
- **Trade-off:** A problem-first search may spend the AI budget on a process fix. That is the honest result if it moves the metric.
- **Follow-up to expect:** "They want something visible." Pick a visible process from the ranked list, not a visible model.
- **Go deeper:** [Choosing the first use case](04_Choosing_the_First_Use_Case.md).

</details>

<details>
<summary>Practice question 10. "Make our customer onboarding faster." Turn this into a problem statement and a metric.</summary>

- **Answer:** Ask how long onboarding takes now, where customers wait and what "faster" means to the sponsor. Write the problem statement as who, what and cost: "Business customers wait a median of 12 working days from signed contract to first login, mostly for identity checks, and 9% cancel in that time." The metric follows: median days from contract to first login, and cancellations in that window.
- **Trade-off:** A median hides the slowest customers. Track the cancellations too, because they show the cost.
- **Follow-up to expect:** "Nobody measures it." The first workstream is measuring the last 50 onboardings.
- **Go deeper:** [Problem, goal, and definition of done](../T6.2_Scoping_an_FDE_Project/01_Problem_Goal_and_Definition_of_Done.md).

</details>

## Worked example: scoring one practice run

Take practice question 5, the prototype scaling to 100,000 users, and check a 45-minute attempt against the six outputs.

| Output | What the run produced |
|---|---|
| Five questions | Peak concurrency, which tenants share infrastructure, the latency target, the cost ceiling, and who supports it after launch |
| Four workstreams | Capacity and routing, multi-tenancy and isolation, reliability and rollback, support and change management |
| Three metrics | p95 latency at peak, cost per request, weekly active users |
| Two trade-offs | Caching against freshness, and model routing against quality |
| Three failure modes | Rate-limit throttling at peak, one tenant starving others, and users who never adopt |
| Phased plan | One business unit, then several, then everyone, with a gate between each |

*Table 2: One practice run checked against the six outputs.*

All six outputs are present, so the run passes. If the metrics had been missing, the next practice session would start there.

## References

1. *FDE Problem Decomposition Question Bank* (the author's own question bank): cases 1, 7, 13, 14, 15 and 17, "Cases Especially Relevant to a Cloud Data Platform Background" (A to E) and "Recommended Preparation Plan". Cases 7 to 10 here, the discovery-first cases, are the author's own.
2. The ten customer-discovery worksheets in the Case Study Worksheets module, the written practice for this method.
3. The lessons linked under each heading in this module.

## Key takeaways

- Every practice case must produce questions, workstreams, metrics, trade-offs, failure modes and a phased plan.
- Knowledge and search cases turn on freshness, permissions and grounding.
- Workflow and operations cases turn on evaluation without a single right answer and on earned autonomy.
- Data-platform cases reward connecting data engineering to evaluation, governance and outcomes.
- Discovery-first cases reward finding the real problem before naming a solution.

## Check yourself

<details>
<summary>1. What six outputs should every practice case produce?</summary>

Five clarifying questions, three to five workstreams, three measurable success metrics, two major trade-offs, three failure modes, and a phased MVP-to-production plan.

</details>

<details>
<summary>2. What makes unified search across many sources harder than search over one wiki?</summary>

Identity resolution, permission propagation, revoked documents, deduplication, freshness and ranking across different source types.

</details>

<details>
<summary>3. What is the goal of a decomposition round, in one sentence?</summary>

To show that an ambiguous customer problem can be turned into a measurable, safe, deployable and adoptable production solution, not to design the most sophisticated system.

</details>
