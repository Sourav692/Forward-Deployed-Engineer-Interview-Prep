# Document Review Copilot with a Policy Check, part 3

## 9. Degrade on Everything Except the Decision

Design the failure path with the happy path. One rule organises the table: the human decision, the permission check and the citation fail closed. Everything else degrades visibly, with the gap labelled.

| Fails | Behaviour |
|---|---|
| Parser drops tables or pages on a high-risk document | Ingestion fails; document reprocessed with OCR and table fallback; affected questions blocked until the corrected index is live |
| Rule version missing or stale for the date of service | Draft refused; policy-version mismatch counted; reviewer told which version was expected |
| Evidence missing, conflicting, or a note says "rule out" | Gap flagged, no language invented, case escalated to the clinician or analyst |
| Citation span does not match the claim | Response rejected; low citation-accuracy answers routed to human review |
| Wrong patient or matter in scope | Closed: patient-level restriction in retrieval, never in the prompt |
| Retrieved document carries embedded instructions | Treated as untrusted data (this lowers but does not stop injection), so it can never trigger an action or widen access; suspicious chunks flagged; red-team test in the gate |
| LLM, vector store or a source system down | Partial packet with gaps labelled, or refusal; overnight batch queued; never a silent guess |
| User asks to "just submit it anyway" | Refused; autonomous submission is disabled by design |
| Approval workflow unavailable | Fail closed. Nothing leaves. |

Say what breaks first at scale. Bulk surveillance is a batch problem, so tier the screening. Rules and small classifiers run on everything. The LLM runs only on borderline cases. Low-risk traffic is sampled. Interactive drill-down keeps its own p95 under 10 s by precomputing embeddings and policy matches and prioritising high-risk queues. Strong-model cost stays bounded only if the flagged tier stays a small fraction of pages, which is an assumption to check. That fraction is the metric to watch.

## 10. Gate the Release on Extraction, Citation and Escalation

The answer keys share one evaluation table. The vendor case adds workflow and safety metrics on top. A groundedness score alone cannot be the gate, because the citation incident passed one. The gate covers four separate dimensions, each with its own dataset.

| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Extraction accuracy on a sampled audit | Agreed bar per field; high-risk fields audited every release | Any drop on a high-risk field | Sampled documents with SME-labelled fields | SME / eval |
| Answer groundedness | >= 90% supported claims | < 80% | Golden Q&A + SME review | FDE / SME |
| Citation accuracy at span level | >= 95% correct citations | < 85% | Source-span audit with clause-level labels | SME |
| Permission and PHI violations | 0 | > 0 | ACL and PHI red-team suite | Security |
| Escalation quality | >= 95% correct escalation on high-risk cases | Missed high-risk case | Risk-labelled scenarios | Product / compliance |
| Task completion | >= 80% workflows completed with less manual effort | < 65% | Workflow replay tests | Product |
| Unsupported claim rate | Blocked or flagged, trending to zero | Any unsupported claim in an approved packet | Evidence-faithfulness review | SME |
| Reviewer override rate and edits | Falling over the pilot; spikes investigated | Rising | Production telemetry | Product |
| p95 latency and cost per document | Within budget; cost per true issue found tracked | Breach | Load test + telemetry | Platform |

The vendor case's workflow metrics belong on the operational dashboard, kept apart from safety. They are first-pass approval rate, time to prepare a packet, coordinator rework, clinician review time, and denial rate by payer and category. For compliance the equivalents are recall on high-risk violations, false-positive review burden, escalation precision, prompt-injection resilience, audit completeness and model drift by product line.

Red-team the boundary with the vendor case's ten tests. They are concrete, and each maps to one control:

- missing diagnosis code
- outdated payer rule
- conflicting clinical notes
- patient record from the wrong patient
- payer rule requiring step therapy not found in the EHR
- prompt injection hidden inside an uploaded payer PDF
- a clinician note that says "rule out" treated as confirmed
- medical necessity not documented
- a user who asks to "just submit it anyway"
- a coordinator who tries to open a restricted patient record

The claims-processing follow-up asks how to prove the system is safe enough for production. This section is the answer. Evaluate against human decisions on historical cases. Block the release on any red-team violation. Roll out by claim type, starting with extraction and triage.

## 11. Roll Out in Shadow, Then One Category at a Time

Week one covers one document type and one policy source, not the whole diagram. It needs the extraction schema agreed with the SMEs and a golden set built from historical cases with their human decisions. The answer keys and the vendor case describe the same staircase.

| Stage | Gate |
|---|---|
| Week 0-1 | Define the workflow, the risk boundary, success metrics, source owners, approval rules and non-goals |
| Week 1-2 | Ingest a limited approved corpus; offline prototype with no write-back and no external communication |
| Week 2-3 | Golden dataset from historical cases and SME-approved answers; red-team and permission tests |
| Week 3-4 | Shadow mode: drafts generated, compared with human decisions, never shown to end users; thresholds calibrated by risk category |
| Week 5 | Read-only pilot with citations, confidence, feedback capture and an escalation path; coordinators use drafts, every request needs the approver |
| Week 6-8 | Draft-only workflow actions behind human approval; one high-volume low-risk category first, such as imaging authorisation or one business unit |
| After | Outcome measurement: approval rate, denial reasons, preparation time, override rate. Expand payers, categories or document types only while eval metrics, incident rate, latency and cost hold; keep the rollback plan |

The OpenAI-style claims practice prompt gives the ordering rule for what to automate. Extraction, triage, summarisation and missing-information detection come first. Adjudication comes only after evaluation and governance. This ordering applies the risk tiers over time.

## 12. Survive the Red-Team Round

The financial-compliance mock is the adversarial version of this design. It is the round to rehearse. Its customer wants "the AI to review all advisor messages and tell us which ones are risky". The demo caught banned phrases, missed subtle promissory language and followed instructions embedded inside emails. Frame it as regulated decision support; the model never makes the compliance judgement. Extract evidence, map it to policy clauses, propose risk labels with confidence, and preserve an audit trail. Launch requires high recall on severe violations, controlled false positives and explicit resistance to adversarial instructions.

The interviewer pushes five objections in order. Prepare an answer for each.

| Objection | Answer |
|---|---|
| They want a prototype fast, no discovery | A 3 to 5 day discovery-and-prototype sprint: one workflow, only approved sources, a small eval set, a demo on real examples. Speed without pretending a broad assistant is production-ready |
| The first version should cover everything | Split scope into read-only, draft, and action layers; ship read-only or draft-only first; action needs approval until evaluation and telemetry earn it |
| Just add a disclaimer | A disclaimer does not stop permission leakage, stale data, wrong citations, unsafe tool calls or over-trust. Constrain what the model sees and does before generation, do not apologise after |
| 18 seconds per answer | Set the budget: batch overnight for bulk, p95 under 10 s for drill-down; decompose by stage; parallelise, cache embeddings, cut top-k before rerank, stream, small model for low risk. Do not remove citation verification; make it asynchronous for low-risk explanatory answers only |
| Too expensive at scale | Cost per true issue found, not per request. Tiered screening: rules and small classifiers for bulk, the LLM only for borderline cases. Never downgrade the model globally; route by risk |

Have the mock's five follow-ups ready. A retrieved document with malicious instructions is untrusted data: it can still sway the model, so it can never trigger an action or widen access. The red-team suite plants such instructions in documents, tickets, emails and logs. A correct answer that cites the wrong source is the incident in section 14. One customer seeing another's data is a tenant predicate on every retrieval, which G07 owns. Cost after launch is the tiered screening above. What is human-approved versus automated is the risk tiers in section 8.

The scoring rubric rewards the same things in every dimension: quantified business value and failure cost; an explained data flow with auth, eval gates and rollback; threat-modelled misuse, adversarial tests and launch gates; and a phased launch with incident response and executive-ready honesty about limits. The debrief advice is to give concrete numbers: the p95 target, the acceptable false-positive rate, the minimum citation accuracy, the launch-blocking security threshold, and the expected ROI.

## 13. Answer the Cost Pivot in Ten Minutes

The interviewer's pivot after a good design is "the copilot costs too much per document". The self-drill on the index answers it with the same architecture. The cheap-to-expensive boundary in section 4 exists for this.

| | |
|---|---|
| Dominant driver | Input tokens on long documents, and every page going through the strongest model |
| Cheapest lever first | Extract only the relevant sections first; dedupe templated documents by hash; cheap model for extraction, strong model only on flagged risk; batch the non-urgent queue off-peak |
| Metric that proves it | Cost per document; tokens per document; escalation rate; extraction accuracy on a sampled audit |
| Do not | Send the whole document to the premium model every time |

The sixty-second line: extraction is cheap, judgement is expensive. Route pages to extraction. Route only the flagged risks to the strong model. Prove quality by sampling. Every strong cost answer uses four verbs in order. Measure, by tracing and attributing first. Route, matching model and path to risk. Bound, with limits on tokens, top-k, timeouts and budgets. Cache safely, with tenant, permission and version in the key.

## 14. Debug the Incidents on This Design

Both scenario incidents are questions about where the design would have caught the failure. Answer each as detect, contain, root cause, prevent. Read the telemetry aloud. The numbers are the argument.

### Correct answer, misleading citation

An account executive asked whether a customer could terminate for convenience with 30 days' notice. The assistant answered correctly. It cited Section 12.4, the Data Processing Addendum, instead of Section 8.2, Termination for Convenience.

```text
2026-07-08T11:28:03.331Z level=warn service=citation-verifier
  trace_id=trc_cite_2088 request_id=req_legal_33102 tenant_id=acme
  query="Can Contoso terminate for convenience with 30 days notice?"
  answer_supported=true answer_clause_id=clause_8_2
  citation_doc_id=doc_contoso_msa_2026 citation_clause_id=clause_12_4
  citation_span_match=false citation_generation_version=cite_v5

2026-07-08T11:28:03.401Z level=info service=reranker
  trace_id=trc_cite_2088 retrieved_chunk_rank_for_true_clause=7
  top_ranked_chunk_id=chk_12_4_dpa top_ranked_score=0.74
  true_supporting_chunk_id=chk_8_2_term score=0.68
  reranker_features=[semantic_similarity,heading_match] missing_feature=clause_type_boost

2026-07-08T11:28:04.010Z level=error service=response-evaluator
  trace_id=trc_cite_2088 eval=bad_citation severity=high
  grounding_score=0.91 citation_accuracy_score=0.38
  policy_action=allowed reason="answer_supported=true AND grounding_score>0.85"
```

Detect: `answer_supported=true` with `citation_span_match=false`, and the true clause ranked seventh. Contain: roll back to `cite_v4`. Require citation span match for legal workflows. Route low citation-accuracy answers to human review. Root cause: `cite_v5` changed citation selection from "quote the exact supporting span" to "select the most concise citation from retrieved context". The verifier allowed it because it over-weighted groundedness and under-weighted span matching. The release gate never evaluated citation accuracy separately. Prevent: split evaluation into answer correctness, citation correctness and quote-span faithfulness. Add clause-type features to the reranker. Require the citation to come from the span that supports the answer, and highlight the exact clause in the UI.

> *"I would treat this as a high-severity citation faithfulness issue. The telemetry shows `answer_supported=true` but `citation_span_match=false`, with the real clause ranked 7th. I would roll back the citation generator, require span-level verification, and add separate citation accuracy evals. In legal workflows, a correct answer with a wrong citation can be more dangerous than an answer that clearly refuses."*

### PDF parser drops critical tables

A compliance reviewer asked what approval is needed for a restricted-list trade exception above €5M. The assistant gave the general escalation process. It missed the table row requiring Head of Compliance plus Legal sign-off.

```text
2026-07-08T07:44:12.002Z level=warn service=pdf-parser
  document_id=doc_trade_policy_2026_v4 source_file=TradingPolicy_2026_v4.pdf
  parser_version=pdf_extract_v3.2 page_count=48
  table_count_detected=17 table_count_extracted=9 table_extraction_coverage=52.9%
  layout_confidence=0.61 ocr_fallback_triggered=false ingestion_status=success

2026-07-08T08:02:31.515Z level=info service=chunker
  document_id=doc_trade_policy_2026_v4 chunks_created=184
  pages_with_no_text=[31,32,33] missing_sections=[restricted_list_threshold_matrix]
  chunking_strategy=heading_aware_v2 embedding_model=text_embed_v5

2026-07-08T10:19:07.724Z level=error service=response-evaluator
  trace_id=trc_parse_8827 request_id=req_fin_55019
  query="approval needed for restricted-list trade exception above €5M"
  expected_source_page=32 retrieved_pages=[12,13,14,21]
  table_required=true table_chunk_present=false answer_completeness_score=0.46
```

Detect: 17 tables detected and 9 extracted, 52.9% coverage, pages 31 to 33 with no text, `ingestion_status=success` anyway. Contain: reprocess with OCR and table-extraction fallback. Validate pages 31 to 33 by hand. Disable autonomous answers on restricted-list threshold questions until the corrected index is live. Root cause: the parser upgrade from `pdf_extract_v2.9` to `pdf_extract_v3.2` regressed on rotated landscape tables. The ingestion gate treated low coverage as a warning, because the document was classified as plain policy text rather than policy with tables. Prevent: classify table-heavy policies correctly and fail ingestion below the coverage threshold. Add visual and table regression tests to parser releases. Store page-level coverage in retrieval metadata, and warn at retrieval time when a query targets a section with ingestion warnings. Retrieval tuning cannot recover content that was dropped before indexing.

> *"The telemetry shows the parser detected 17 tables but extracted only 9, with pages 31–33 missing. The relevant threshold matrix was never indexed. I would reprocess with OCR/table fallback, block affected answers, and add ingestion gates so high-risk PDFs fail if table coverage is low."*
