# Practise Decomposition Interview Cases

*Memorising one sophisticated design is tempting, but decomposition rounds reward a repeatable method applied to a case nobody has seen before.*

Decomposition skill comes from repetition on varied cases, not from one rehearsed answer. Run each case below with the method from [The Discovery Conversation](/learn/forward-deployed/customer-discovery/the-discovery-conversation), out loud and against a clock, then compare with the outline.

**Objectives:**

- run a case in 45 minutes and produce the six required outputs;
- recognise the hard areas the interviewer will probe in each common case;
- answer the standard follow-up for each case from the decomposition, not from memory.

---

## Produce the Same Six Outputs Every Time

The question bank's preparation plan is specific. Practise 8 to 10 cases in 45-minute sessions. For each case, force out five clarifying questions, three to five workstreams, three measurable success metrics, two major trade-offs, three failure modes, and a phased plan from MVP to production.

A fixed output list makes practice comparable. It works across cases. It also exposes the weak step. That is useful. A case that ends with six workstreams but no metrics shows where to practise next.

## Practise the Knowledge and Search Cases

**1. "A global enterprise wants an assistant that answers employee questions from internal documents, policies and wikis."**
Start with the content. Workstreams: ingestion and freshness, chunking and metadata, hybrid versus vector-only retrieval with reranking, citations and grounding, access-control-aware retrieval. Risks: contradictory or stale documents, and prompt injection arriving inside retrieved content. Close with latency and cost controls and human escalation. Follow-up, "it gives a confident but wrong answer": separate retrieval failure from synthesis failure and measure each. → [Decomposing a Solution Into Workstreams](/learn/forward-deployed/customer-discovery/decomposing-a-solution-into-workstreams)

**2. "Information is spread across SharePoint, Slack, Google Drive, Confluence, Salesforce and databases. Build a unified search assistant."**
The hard part is not the model. The hard areas are identity resolution, permission propagation, connectors and incremental sync, deleted or revoked documents, source reliability, deduplication, freshness, ranking across different sources, citation and provenance, tenant isolation and search analytics. Follow-up, "a user loses access to a document tomorrow": treat revocation as part of incremental sync and permission propagation, so retrieval never serves a stale grant.

**3. "A large company wants a coding assistant grounded in its private repositories."**
Index the code first. Workstreams: repository indexing with incremental updates, code-aware chunking, symbol and dependency retrieval, access control and IDE integration. Distinguish generating code from explaining it. Add static analysis, test execution and secret scanning, and raise IP and licensing concerns. Follow-up, "does it improve productivity?": measure accepted suggestions and developer productivity, not suggestion volume. → [Success Metrics and Evaluation Data](/learn/forward-deployed/customer-discovery/success-metrics-and-evaluation-data)

## Practise the Workflow and Operations Cases

**4. "A company wants to transcribe calls, summarise them, extract actions and update its CRM."**
Treat it as a pipeline. It runs through audio ingestion, speaker diarisation, transcription, PII redaction, summarisation, action-item extraction, CRM integration, confidence scoring, human correction and a retention policy. Evaluate by call type and language. Follow-up, "no single correct summary": use rubrics, action-item precision and recall, field coverage, CRM update accuracy and user-edit distance. → [Success Metrics and Evaluation Data](/learn/forward-deployed/customer-discovery/success-metrics-and-evaluation-data)

**5. "A prototype works for 100 users; deploy it to 100,000."**
Cover capacity modelling, multi-tenancy, rate limits, queuing, caching, model routing, batch processing and streaming. Add cost controls, autoscaling, observability, reliability targets, rollbacks, a security review, a support model, change management and adoption measurement. The adoption follow-up is covered in [Diagnosing Low Adoption](/learn/forward-deployed/adoption-and-impact/diagnosing-low-adoption).

**6. "An assistant helps engineers diagnose production incidents."**
Start with the signals. Inputs are logs, metrics, traces, alerts, tickets and runbooks, correlated by time window and service topology, with retrieval of past incidents. Separate proposed remediation from executed remediation, keep an incident timeline and audit trail, and price false positives. Follow-up, "restart services automatically?": climb from read-only to suggested to approved to limited reversible action. → [Choosing the First Use Case](/learn/forward-deployed/customer-discovery/choosing-the-first-use-case)

## Practise the Data-Platform Cases

The bank flags five cases for candidates with a cloud data platform background. Each one tests whether data engineering can be connected to AI delivery.

| Case | What to connect |
|---|---|
| An enterprise AI data platform for structured, unstructured and streaming data | Lakehouse, batch and streaming ingestion, metadata and lineage, data quality, feature or retrieval pipelines, governance, evaluation datasets, production monitoring |
| A reusable RAG platform for many business units | Multi-tenant architecture, document ingestion, Delta-based processing, metadata, vector and keyword retrieval, ACL propagation, an evaluation framework, cost isolation, model and embedding versioning |
| Near-real-time fraud or anomaly detection with explanations | Streaming ingestion, feature freshness, detection versus investigation, alert prioritisation, human feedback, false positives, explainability, backtesting, online monitoring, drift |
| A copilot that diagnoses pipeline and data-quality issues | Catalog and lineage, pipeline logs, quality checks, schema evolution, incident history, natural-language investigation, safe remediation suggestions, read versus write, auditability |
| Productionising a notebook prototype | Reproducibility, CI/CD, evaluation gates, model and prompt versioning, secrets, monitoring, cost controls, security, SLAs, rollback, ownership and support |

> **Warning: do not over-index on generic LLM theory.** The bank's advice for a data-platform profile is to show the connection between enterprise data, architecture, evaluation, governance, production operations and customer outcomes. That connection is the differentiator, not model internals.

## Worked Example: Scoring One Practice Run

Take case 5, the prototype scaling to 100,000 users, and check a 45-minute attempt against the six outputs.

Five questions: what is the peak concurrency, which tenants share infrastructure, what latency target holds, what is the cost ceiling, and who supports it after launch? Four workstreams: capacity and routing, multi-tenancy and isolation, reliability and rollback, support and change management. Three metrics: p95 latency at peak, cost per request, weekly active users. Two trade-offs: caching against freshness, and model routing against quality. Three failure modes: rate-limit throttling at peak, one tenant starving others, and users who never adopt. Phased plan: one business unit, then several, then everyone, with a gate between each.

All six outputs are present. The run passes. If the metrics had been missing, the next practice session would start there.

---

## Key Takeaways

- Every practice case must produce questions, workstreams, metrics, trade-offs, failure modes and a phased plan.
- Knowledge and search cases turn on freshness, permissions and grounding.
- Workflow and operations cases turn on evaluation without a single right answer and on earned autonomy.
- Data-platform cases reward connecting data engineering to evaluation, governance and outcomes.

## Check Yourself

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

