# Document Review Copilot with a Policy Check, part 4

## 15. Deliver It in Sixty Minutes

Spend minutes in proportion to risk. The decision boundary, the citation verifier and the ingestion gate deserve more of the hour than the embedding model. Write the budget in the corner of the board. Say it once.

| Minutes | Phase |
|---|---|
| 0–8 | Clarify: the workflow, the decision owner, what the model must never decide (section 1) |
| 8–15 | The spine and the source map (section 3), the end-to-end diagram (section 4) |
| 15–35 | Deep dive: the extraction schema, the ingestion gate, span-level citation, the sensitive-data boundary (sections 5 to 8) |
| 35–45 | Failure modes, scale, the evaluation gate (sections 9 and 10) |
| 45–55 | Rollout, the red-team objections, the cost pivot (sections 11 to 13) |
| 55–60 | Close: three sentences, trade-offs, week one |

- The three-sentence close is this page's construction. A permission-aware drafting system extracts structure on every page with a cheap model and spends the strong model only on flagged risk.
- Every claim cites the exact span that supported it, and a verifier fails closed on any mismatch.
- A named human decides every material case. The release is gated on extraction accuracy, citation accuracy, escalation quality and zero sensitive-data violations.

The two-minute spoken answer, from the anchor's key:

> - I would start by clarifying the broken healthcare prior authorisation workflow, who uses the system, what decision they need to make, and what risk we cannot automate.
> - For Healthcare Prior Authorisation Assistant, I would design a permission-aware assistant around the workflow: staff prepares prior-auth package by checking payer policy, patient record facts, clinical criteria, missing documents, and drafts a submission for clinician approval.
> - The architecture would ingest approved sources from systems like EHR via FHIR, payer policy portals, document store, claims/prior-auth system, identity provider, audit/compliance logs, preserve metadata, freshness, and ACLs, then use hybrid retrieval with permission filtering before generation.
> - The LLM would produce cited answers, show uncertainty, and escalate when evidence is missing or risk is high.
> - Tool use would be allowlisted: read-only tools can run automatically, but any write-back or externally visible action needs preview and human approval.
> - I would evaluate with SME-approved golden cases, citation accuracy, groundedness, permission red-team tests, task completion, latency, and cost.
> - Rollout would be staged: offline prototype, shadow mode, read-only pilot, then limited approved actions with monitoring and rollback.
> - The production goal is not a flashy demo; it is a trusted workflow assistant that is secure, auditable, and measurably improves the business process.

The lines that carry the round, drawn from the sources and this page:

1. *"The AI produces an evidence-backed draft, not a final medical or payer decision."*
2. *"Extraction is cheap, judgement is expensive. Route pages to extraction, route only the flagged risks to the strong model."*
3. *"Answer correctness and citation correctness are separate evaluation dimensions."*
4. *"A correct answer with a wrong citation can be more dangerous than an answer that clearly refuses."*
5. *"Retrieval tuning cannot recover content that was dropped before indexing."*
6. *"If evidence is missing, stale, or conflicting, the assistant should not invent language. It should flag the gap."*
7. *"Constrain what the model can see and do before the answer is generated; do not apologise after the mistake."*
8. *"Never submit without approval. Autonomous submission is disabled by design."*

The follow-ups arrive in a predictable order.

| Follow-up | Answer |
|---|---|
| How would you prove the system is safe enough for production? (OpenAI-style claims practice prompt) | Evaluation against human decisions on historical cases; the four-dimension gate in section 10 with a red-team suite that blocks on any violation; shadow mode before any user sees a draft; rollout by claim type starting with extraction and triage |
| The business wants to skip the governance review for the MVP. What do you do? (OpenAI-style regulated-industry practice prompt) | Narrow the scope, use synthetic or masked data, start read-only or assistive, define explicit approval gates, and get security and legal review before production exposure. Speed comes from a smaller slice, not a skipped gate |
| What if the retrieved document contains malicious instructions? | Treat it as untrusted data: the system prompt keeps task apart from content, which lowers the risk but does not stop it, so retrieved text can never trigger an action or widen access; suspicious chunks are flagged; the red-team suite plants instructions in documents, emails and logs |
| What if the answer is correct but cites the wrong source? | Section 14: span-level verification fails closed, citation accuracy is its own eval, the citation is the span used |
| What if one customer sees another customer's data? | Tenant predicate on every retrieval and cache key, the Secure Multi-Tenant AI Platform case’s design; patient-level and matter-level scope in retrieval, never in the prompt |
| What should be human-approved versus automated? | Extraction, triage, summarisation and gap detection automated; any draft that leaves the system, any decision language and any external submission approved by the named human |
| How should the system behave when clinical notes conflict with payer rules? | Surface the conflict, prefer the approved current source, flag the case and escalate; never resolve it in the draft |
| What if the payer rule changed after the request was started? | Rule versioning by effective date; the request is judged against the version in force at the date of service, and a mismatch is counted and shown |

- Repair the common weak answers on the spot. "The answer is correct, so the citation is cosmetic" becomes citation faithfulness as a high-severity dimension.
- "Increase top-k or tell the model to read tables" becomes an ingestion gate, because absent content cannot be retrieved.
- "Put the user's role in the prompt" becomes permissions enforced in retrieval and tool execution.
- "Use a faster model if it is slow" becomes a latency budget by stage and tiered routing.
- "Test a few examples and ask users" becomes a golden set with human decisions, adversarial cases and launch gates.

---

## Level calibration

On this design, the levels differ in which checks an answer treats as release gates rather than quality knobs. How fluent the draft reads does not separate them.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | Keeps the copilot a drafter: a small model extracts typed fields on every page, deterministic compare flags gaps, and the strong LLM drafts only flagged cases. Pulls the payer rule in force on the date of service, fails closed on any span mismatch, and routes material cases to a named clinician. | The gates that prove it: a coverage gate that fails a table-heavy PDF instead of warning, and a citation gate kept apart from groundedness, since 0.91 groundedness hid 0.38 citation accuracy. |
| Staff | Adds the parser coverage gate on high-risk policies and separate datasets for extraction, citation span accuracy, escalation and PHI leaks, with Security owning the zero-violation red-team suite. Rolls out shadow, then read-only pilot, then one low-risk category, with regression tests on parser releases and a rollback for citation-generator releases. | What happens as personas and sources multiply: who owns rule versions across payers, regulations and playbooks, and whether cost per true issue holds if the flagged fraction grows. |
| Principal | Makes the spine a platform: one control plane of rule versions, extraction schemas, risk tiers and eval gates that prior authorisation, compliance and contracts plug into by swapping schema, rule and approver. Treats every parser, chunker or citation change as a release gated on offline eval, and keeps adjudication out until evaluation and governance earn it. | The false-positive budget, per-field extraction bars and which PHI may reach the model provider depend on each customer's reviewers and contracts, so they wait for discovery. |

## Key Takeaways

- The copilot drafts and explains; a named human decides, and every component exists to keep that boundary.
- Requirements are stated so a reviewer can fail them: five must-haves as the launch gate, latency by workflow, cost per true issue found.
- Three personas are one spine: document in, structured extraction, comparison against a rule, gaps and risk, human approval.
- One diagram splits control plane from data plane, and the cheap-to-expensive boundary sits between extraction and drafting.
- The extraction schema is the seam; a low-confidence field is flagged, never filled.
- A high-risk document with low table coverage fails ingestion, because a model cannot reason over what never reached the index.
- The citation is the span that supported the claim, and a verifier fails closed on any mismatch.
- Sensitive data is a boundary on where content travels, and the regulated-industry checklist already has a home in the design.
- The decision, the permission check and the citation fail closed; everything else degrades with the gap labelled.
- The release gate has four dimensions with four datasets, and groundedness alone is not one of them.
- Rollout starts in shadow mode and expands one category at a time, extraction and triage before any adjudication.
- You win the red-team round by narrowing scope, refusing disclaimers as controls, and pricing cost per true issue found.
- The same architecture answers the cost pivot: cheap extraction everywhere, the strong model only on flagged risk.
- Answer incidents on this design by reading the telemetry aloud and naming the gate that was missing.

## Check Yourself

1. **Why is a correct answer with a wrong citation treated as high severity?** The reviewer relies on the citation and repeats it in a negotiation or submission, so a wrong citation launders an unsupported claim; answer correctness and citation correctness are separate dimensions.
2. **What did the citation incident's release gate check, and what did it miss?** It checked answer groundedness, which scored 0.91, and never evaluated citation span accuracy separately, which scored 0.38.
3. **Why does increasing top-k not fix the parser incident?** The threshold matrix on pages 31 to 33 was never chunked or indexed; retrieval cannot return content that is absent from the index.
4. **What should the ingestion gate have done with 52.9% table coverage on a trading policy?** Failed the job, because the document is a high-risk policy with tables; it only warned because the document was classified as plain policy text.
5. **Where does the strong model run, and why?** Only on the flagged risk tier after cheap extraction on every page, because extraction is a narrow, schema-bound task whose output can be checked, and judgement is the expensive step.
6. **A payer rule requires step therapy and the EHR shows none. What is the right output?** A flagged gap routed to the clinician, never an invented treatment history.
7. **How is "which version of the rule" decided?** By payer, plan, procedure, diagnosis and date of service against a versioned rule store with effective and expiry dates; a mismatch is counted and shown.
8. **What is the answer to "add a disclaimer and let users decide"?** A disclaimer does not prevent leakage, stale data, wrong citations, unsafe actions or over-trust; the system constrains what the model sees and does before generation.
9. **What is the sixty-second cost answer?** Extraction is cheap and judgement is expensive: route pages to extraction, route only flagged risks to the strong model, dedupe by hash, batch the non-urgent queue, and prove quality by sampling.

## References

### Fact-check sources (checked 27 Sep 2026)

- FDE problem-decomposition question bank: claims and regulated-industry practice cases
- [HL7 FHIR R5 Subscriptions framework](https://hl7.org/fhir/R5/subscriptions.html): event-driven FHIR needs Subscriptions; otherwise you poll
- [FINRA Books and Records (SEA 17a-4, FINRA 4511)](https://www.finra.org/rules-guidance/key-topics/books-records): retention of advisor communications; WORM or audit-trail storage
- [FINRA Rule 3110: Supervision](https://www.finra.org/rules-guidance/rulebooks/finra-rules/3110): supervisory review of correspondence
- [Unstructured partitioning (infer_table_structure)](https://docs.unstructured.io/open-source/core-functionality/partitioning): layout-aware parsers keep table structure that plain loaders flatten
- [OWASP GenAI LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/): no fool-proof prevention; limit what the model can do
- [MSRC: How Microsoft defends against indirect prompt injection attacks (Jul 2025)](https://www.microsoft.com/en-us/msrc/blog/2025/07/how-microsoft-defends-against-indirect-prompt-injection-attacks): separating task from content lowers but does not remove the risk

