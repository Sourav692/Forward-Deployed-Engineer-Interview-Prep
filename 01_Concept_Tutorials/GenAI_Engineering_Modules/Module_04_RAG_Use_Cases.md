# Module 4 – RAG Use Cases (Beginner Guide + Keywords)

Oct 4, 2026 · @Sourav Banerjee

## Overview

This module shows how the RAG ideas you already know get applied to three real-world domains. The pipeline (ingest, chunk, search, re-rank, answer) is almost the same each time. What changes is what the domain is afraid of: a wrong legal clause, a wrong medical fact, or a leaked internal document.

&#91;embedded content: shared RAG pipeline · 3 use-case extras\]

The top row is the shared pipeline. The three boxes underneath are what each use case adds on top of it.

The three use cases:

- **Use Case 1: Legal and Compliance RAG** for regulatory knowledge (contracts, policies, regulations).
- **Use Case 2: Healthcare Knowledge RAG** for medical information retrieval.
- **Use Case 3: Enterprise Knowledge Base RAG** for internal organizational knowledge.

The **bold keywords** are the exact terms to use in interviews.

## Use Case 1: Legal and Compliance RAG Systems for Regulatory Knowledge

The golden rule here: **precision over speed**. In legal work a wrong answer can cost real money or trigger a regulator, so every design choice leans towards being accurate and provable.

### Topic: System Design & Architecture

#### How would you design a RAG system for querying legal contracts at scale?

Think of it like a very careful paralegal who never answers without showing the page number.

- **Ingest** the contracts while keeping their structure: party names, clause numbers, effective dates, jurisdiction and document type are saved as **metadata** (labels you can filter on).
- **Hierarchical chunking**: keep whole sections as parent chunks and single clauses as child chunks.
- **Hybrid search**: **BM25** (exact keyword match) plus dense vector search, because lawyers type exact things like "Clause 8.4(b)".
- **Cross-encoder re-ranker**: a second model that reads query and clause together to put the best clause at position 1.
- **Mandatory citations**: every answer names the contract, section and clause.
- **Output validation**: a **faithfulness** check before the answer is shown.

Legal-specific rules: never mix text from two contracts in one chunk, tag chunks with version and effective date, and keep superseded documents in a separate index so "what did the old policy say?" still works.

#### What ingestion challenges are unique to legal documents?

Normal pipelines quietly break on legal files. The main troubles:

- **Cross-references**: "subject to Schedule 4, Clause 2.3(b)" means one chunk depends on another.
- **Defined terms**: "Company" is defined on page 1 and used on page 50. Chunking can separate the two.
- **Amendments and redlines**: you need **version-aware ingestion** to know which clause is currently in force.
- **Messy formats**: old scanned PDFs need **OCR**; DOCX with **tracked changes** needs the changes accepted before extraction; tables and signature blocks need special handling.
- **Confidentiality**: every document gets **access-control metadata** from day one.

In simple words: build a legal-specific parser that pulls out clause hierarchy, defined terms, parties and dates *before* chunking.

#### How would you handle long contracts that exceed context window limits?

An 80-page MSA (Master Service Agreement) is normal in legal, so you never feed the whole thing to the LLM.

- **Hierarchical indexing**: three levels (document summary, section summaries, clause chunks) linked parent to child.
- **Section-aware chunking**: never cut across a clause boundary; a very long clause is split into numbered sub-parts.
- **Query routing**: a specific clause question retrieves clauses; "summarize Party A's obligations" retrieves section summaries; comparison questions pull the same clause type from several contracts.
- **Context budget**: decide up front how many tokens go to the system prompt, retrieved clauses, history and answer, and use **contextual compression** to keep only the relevant sentences.

#### How would you design chunking specifically for contracts with clauses and sections?

Fixed-size chunking cuts clauses in half, so the LLM sees an incomplete obligation. Instead:

1. Use the document's **heading hierarchy** to find boundaries (clause 3.2(a) is a natural boundary).
2. Build three levels: LLM-written section summary, full clause text (the usual retrieval unit), and sub-clause pieces for very long clauses.
3. Add the parent header to each child chunk ("Section 8 - Liability Limitations: ...") and annotate defined terms.
4. Store metadata per chunk: **contract\_id**, section and clause number, **clause\_type** (indemnity, termination, payment), effective date, parties.

Why it pays off: "what are the termination rights?" becomes a filter on clause\_type = termination, far sharper than searching randomly split paragraphs.

#### Would you use semantic chunking or section-based chunking for legal text?

**Section-based chunking** first, **semantic chunking** only as a backup.

- Contracts are already organised by their authors, and lawyers ask by clause type ("show me the limitation of liability clause"), which is a structural question.
- Cross-references need clause boundaries intact; semantic chunking may cut at an arbitrary topic shift.
- Semantic chunking helps for unstructured text: recitals, legal briefs, opinions, case law, regulatory commentary.
- Hybrid approach: section-based for structured contracts, semantic for narrative documents, and route queries by document-type metadata.

### Topic: Retrieval and Accuracy

#### How would you ensure high-precision retrieval in compliance-sensitive queries?

**Precision** means every chunk you retrieve is truly on point. In compliance one wrong chunk can mislead the LLM, so stack several filters:

- **Metadata pre-filtering** by jurisdiction, document type, effective date and regulatory domain before any vector search.
- **Cross-encoder re-ranking** of the top \~20 candidates.
- **Similarity score threshold**: if nothing is good enough, say "insufficient information" instead of guessing.
- **Clause-type filtering**: a termination question only searches termination chunks.
- **Citation check** after generation: any claim without a source is flagged or removed.

#### How would you handle clause-level retrieval?

Treat each clause as its own addressable record with an ID, for example a **chunk\_id** like "MSA\_sec4\_clause4.2b", plus **clause\_type**, **parent\_section** and **contract\_id**.

- Query names a clause number: do an **exact metadata lookup**, no vector search needed.
- Query describes a clause type: filter by clause\_type, then run semantic search inside that set.
- **Small-to-big retrieval**: find the small sub-clause for precision, then expand to the parent clause or neighbouring clauses (4.2(a), 4.2(c)) so conditions and exceptions are not lost.

#### How do you prevent retrieving outdated regulatory documents?

Regulations expire and get replaced, so the index must know what is current.

- Give every document **effective\_date**, **expiry\_date** and **version** fields.
- Never delete an old version: mark it **status: superseded** with a **superseded\_by** pointer, so history still works but current answers skip it.
- Default filter: active, already effective, not expired. For historical questions let the user set a reference date.
- **Change detection pipeline**: watch official sources (RSS feeds, government portals), re-ingest automatically and alert the legal team.
- **Human validation gate**: a person approves new regulations before they go active, so a parsing error cannot corrupt a critical rule.

#### Would you implement hybrid search for legal use cases? Why?

Yes, it is close to essential, because legal queries are both exact and conceptual.

- Exact: "Section 8.4(b)", "Force Majeure", "GDPR Article 17" need keyword matching. Embeddings can blur similar-sounding concepts like indemnification vs limitation of liability.
- Conceptual: "what must the vendor do if data is breached?" has no exact phrase, and different contracts word the same idea differently ("termination for convenience" vs "right to cancel").
- Setup: **BM25** for exact terms, **dense vectors** for meaning, merged with **Reciprocal Rank Fusion (RRF)**, then a **re-ranker** for the final pass.

#### How would you reduce hallucinations and unsupported reasoning in compliance answers?

Control it at three layers, plus one hard architectural rule.

| Layer | What you do |
| --- | --- |
| Retrieval | Minimum confidence before generating; hybrid retrieval; 3 to 5 chunks, not one; clause-level retrieval with metadata filters |
| Prompt | Strict grounding instruction ("answer only from the documents"); quote the supporting text first; **structured output** with required citations |
| After generation | **Faithfulness / groundedness check**; reject or regenerate answers whose claims cannot be traced to a chunk |
| Architecture | Never answer from the model's own pretraining knowledge; if retrieval fails, say "no relevant information found in the indexed documents" |

Note: the course suggests avoiding visible **chain-of-thought** in production legal systems, because speculative reasoning is not legally defensible. Prefer an "answer + evidence" format with hidden or verifier-based reasoning.

### Topic: Risk and Guardrails

#### How would you ensure the system does not give legally misleading advice?

A disclaimer is not enough. Add a **policy enforcement layer**:

- **Query classification**: detect and block requests for legal advice, litigation strategy, court-outcome prediction or regulatory interpretation. Example: "Should we terminate based on Clause 8?" gets "I can summarize Clause 8, but I cannot give legal advice."
- **Extraction vs interpretation modes**: extraction returns exact clause text with minimal summary; interpretation is only for internal users with stronger guardrails.
- **Attorney review workflow**: high-risk queries go to a **human-in-the-loop**, and corrections are logged to improve the system.

#### How would you implement citation enforcement for every answer?

Every claim must be traceable to a contract, section and clause. Enforce it in four ways:

- **Prompt format**: "\[Contract Name, Section X, Clause Y.Z\]" after every statement.
- **Programmatic verification**: parse the answer, look up each cited chunk ID in the retrieved context and confirm the quoted text really is there; regenerate if not.
- **Output schema**: a **JSON schema** with a required citations array; answers without citations are rejected.
- **UI**: inline, clickable citations so a lawyer can verify the source in seconds.

#### How would you design fallback mechanisms when retrieval or answer confidence is low?

Do not trust one fixed similarity number (like 0.65): scores change with the embedding model, vector database, chunk size and query type. Use several **confidence signals** instead:

- **Relative similarity gap** between top-1 and top-k results.
- **Retriever agreement** between keyword and vector search.
- **Re-ranker confidence** and **groundedness score**.
- An **answerability classifier** that checks whether the context actually contains an answer, and refuses if not.

Then use tiers:

1. Low retrieval confidence: show the top clauses without interpretation and ask the user to refine.
2. Ambiguous query: ask a clarifying question before retrieving.
3. High-risk topic: return clauses only and require human review.
4. Retrieval failure: "The indexed documents do not contain information about this question."

#### How would you handle sensitive client data in legal RAG?

Legal files hold trade secrets and litigation strategy, so access control is enforced everywhere.

- **Ingestion**: tag each document with **client\_id**, **matter\_id** and **confidentiality\_level**.
- **Retrieval**: every query carries the user's permissions as a mandatory filter, enforced in the retrieval layer (not only the app), so the LLM never sees chunks the user cannot see.
- **Isolation**: a separate vector index per client for the most sensitive cases, **namespaces** for the rest, and **encryption at rest** with client-specific keys.
- **Retention**: delete chunks when a matter closes (soft delete, then hard purge) and keep an **audit log** of every access.
- **External LLMs**: sign data-processing agreements, consider **self-hosted** models, and **pseudonymize** client names in prompts.

#### How would you audit and log responses for regulatory review?

Law firms are regulated too, so every answer needs a paper trail.

- **Log per interaction**: interaction ID, timestamp, user, client matter, the query, retrieved chunk IDs with scores and document versions, the answer, citations, **faithfulness score**, and whether a human reviewed or flagged it.
- **Immutable log**: an append-only store such as **AWS CloudTrail** or **WORM** (write once, read many) storage, kept for as long as the rules require.
- **Review and export**: searchable by matter, date, attorney or document, and able to replay the exact context the LLM saw.
- **Periodic reports**: weekly query volumes, flagged answers, review outcomes and faithfulness trends; flag answers an attorney later corrected.

### Topic: Evaluation and Production

#### What metrics should be used to evaluate accuracy, reliability and safety of a legal RAG system?

Mix three groups, because automated numbers alone cannot prove legal correctness.

- **Retrieval metrics**: **Recall@k** (is the right clause in the top k?), **Precision@k** (how many retrieved clauses are relevant?), **nDCG** (are the best sources ranked highest?), and **coverage** (does the index even hold an answer?).
- **Generation metrics**: **faithfulness / groundedness** (tools like **RAGAS** can estimate it, but not perfectly), **citation correctness**, and **answer completeness** (obligations, exceptions, conditions).
- **Risk metrics**: **hallucination rate**, **unsafe interpretation rate**, and **escalation correctness** (does it refuse or escalate when it should?).
- **Human evaluation** by legal experts for interpretation accuracy.

Targets like "faithfulness above 0.90" are internal goals, not universal benchmarks, since scores depend on the judge model and dataset.

#### How would you involve legal experts in evaluation?

Only a lawyer can say if a clause was interpreted correctly, so build them into the loop:

- **Red team exercises**: senior attorneys ask hard scenarios they already know the answers to and score the replies.
- **Clause interpretation review** on a sample of answers, and an **edge case library** of ambiguous language and cross-references.
- **Ongoing routine**: weekly review of flagged answers, a monthly calibration session with the ML team.
- **Feedback button** ("this answer is incorrect" plus a correction field); corrections update the evaluation set, and repeated patterns trigger a review of chunking or documents.

#### How would you detect and manage regulatory or legal knowledge drift in production?

**Knowledge drift** means the law changed after you indexed it.

- **Proactive**: subscribe to official regulatory feeds, auto re-ingest on updates, and track **effective\_date**, **version**, **last\_verified\_date** and **superseded\_by**.
- **Version control**: mark old versions superseded rather than deleting, link versions together, and default to active ones.
- **Time-aware retrieval**: "as of 1 March 2023" should fetch the version valid then.
- **Reactive signals**: consistently low retrieval scores, questions about regulations missing from the index, and a rising "no answer found" rate.
- **Human review** of major legislative updates before they go live.

## Use Case 2: Healthcare Knowledge RAG Systems for Medical Information Retrieval

The golden rule here: **patient safety**. The system is a reference tool for clinicians. It finds and quotes trusted sources; it never diagnoses or prescribes.

### Topic: Architecture & Data

#### What are the ingestion challenges for medical research papers?

Medical papers are dense and structured in ways plain text extraction cannot handle.

- **Sections mean different things**: the same sentence in Methods vs Conclusion carries a different weight.
- **Mixed content**: tables of trial results, dosage charts and formulas get skipped or garbled by normal extractors.
- **Inline citations** like "\[14,27\]" add noise to embeddings.
- **Authority levels differ**: **PubMed** peer-reviewed papers, **arXiv** preprints and internal hospital research are not equally trustworthy.
- **Versioning**: a 2019 protocol may clash with the 2024 revision if both sit in the index.
- **Poor scans**: old PDFs with weak **OCR**, especially tables and chemical notation.

Fixes: use a structure-aware parser like **GROBID** (splits abstract, methods, results, references), tag chunks with their **section type**, and flag preprints so they rank below peer-reviewed work.

#### How would you process medical tables, charts and clinical data?

Tables hold the most precise facts (dosages, trial outcomes, lab ranges), so losing them hurts.

- **Tables**: use a layout-aware extractor such as **AWS Textract**, **Adobe PDF Extract** or GROBID. Turn each table into a plain sentence ("Drug A cut LDL by 34% vs 18% on placebo") and also keep the original as structured **JSON**. Tag it with **content\_type: clinical\_table**.
- **Charts and figures**: a **vision model** (for example **GPT-4V** or a medical image model) writes a description of the key clinical finding, stored together with the caption.
- **Clinical values**: **normalize units** (mg/dL, mmol/L, mEq/L) to one canonical unit with conversion metadata, and tag numeric ranges so they can be queried in a structured way.

#### How would you handle domain-specific terminology and abbreviations?

To a general model "MI", "HTN", "CABG" and "GFR" are just letters, but to a doctor they are everyday words.

- **At ingestion**: build an **abbreviation expansion dictionary** from **UMLS**, **SNOMED CT** and hospital glossaries, and write "MI (myocardial infarction)" so both forms are embedded. Keep the abbreviation; doctors search with it.
- **Embedding model**: pick a biomedical one such as **BioBERT**, **PubMedBERT** or **MedCPT**, which know that "MI", "heart attack" and "myocardial infarction" mean the same. A general model like **ada-002** misses rare drug names, procedure codes and clinical shorthand.
- **At query time**: run **query expansion** with the same dictionary ("STEMI management" also searches "ST-elevation myocardial infarction"), and use a medical **NER** (Named Entity Recognition) model to spot drugs, conditions and procedures for metadata filtering.

#### How would you ensure updates when medical guidelines change?

An outdated guideline is a patient safety problem, so freshness is a process, not an afterthought.

- **Source monitoring**: follow feeds from **AHA**, **WHO**, **CDC**, **NICE** and specialty societies, check weekly, and re-ingest on change. Hospital-internal protocols plug into the document management system.
- **Version control**: chunks carry **version**, **effective\_date** and **source\_authority**; old versions become **status: superseded** (still searchable for audit, hidden by default).
- **Human validation gate**: a clinical informatics officer or senior physician signs off before an update goes live.
- **Staleness alerts**: warn administrators if a guideline was not re-verified for over 90 days, and show **last\_verified\_date** in the UI.

#### How would you handle multilingual medical research?

Important evidence is published in Chinese, Japanese, German, French and more.

- **Ingestion**: detect language with **langdetect**, translate with a medical-aware service such as **NLLB** or **DeepL** (with a medical glossary), keep both original and translation (the original is the source of truth for citations), and tag **original\_language**.
- **Multilingual embeddings**: use something like **multilingual-E5** or a fine-tuned multilingual BioBERT, because English-only models cannot match Spanish queries to Spanish documents.
- **Translation quality flag**: give translated chunks a confidence score. Low-confidence ones, especially drug names, doses or procedures, go to a **human medical translator** before they become searchable. Never auto-translate and show dosage information unchecked.

### Topic: Safety and Risk

#### How do you prevent the system from generating unsafe medical advice?

Safety must be built into the architecture, not just the prompt.

- **Scope**: the tool is a clinical knowledge retrieval tool; it does not diagnose, prescribe or give patient-specific recommendations.
- **Retrieval grounding**: generate only when a retrieved source directly addresses the query. Say "the guideline states X", never "so you should do X".
- **High-risk query classifier** before retrieval (patient scenarios, dosing, emergency triage, contraindications in special groups): redirect with a disclaimer or escalate to a physician.
- **Zero hallucination tolerance**: a **faithfulness check** on every answer (the course uses 0.85 as a block/flag line), and any number such as a dose or lab threshold must be cited from a retrieved source.

#### Would you allow open-ended answers or restrict responses to retrieved context only?

Restrict to **retrieved context only**, no exceptions for clinical output.

- The LLM's training data can be out of date (a 2023 model misses a 2024 guideline update).
- A model may confidently quote advice that was superseded or only fits one patient group.
- Doctors need the **source** (a top-class guideline vs a small observational study), not just the claim.

A good answer quotes and attributes it: "According to the 2023 ACC/AHA Heart Failure Guidelines, Section 4.2...". When retrieval fails, say plainly that no current guideline was found, show the closest citation and point to a specialist. No best-effort guess from general knowledge.

#### How would you implement medical disclaimers?

A disclaimer buried in a footer does not count in a clinical tool.

- **Session-level**: every session opens with what the tool is (a reference tool, not a replacement for clinical judgment).
- **Per-response, by content type**: dosage (verify against prescribing information and patient factors), diagnostic criteria (needs clinical correlation), conflicting sources (judgment required).
- **High-risk queries**: an extra note recommending direct physician review.
- **Enforced in the output schema**: a required **disclaimer field**, so no clinical answer can leave without one. The UI shows it prominently, with a **click-through acknowledgment** for high-risk answers.

#### How do you design guardrails for high-risk queries?

High-risk means emergencies, pediatric dosing, oncology protocols, drug interactions and anything about a named patient. A lightweight **risk classifier** (keyword patterns plus a small fine-tuned **intent classifier**) runs first and sorts queries into tiers:

| Risk tier | Examples | What the system does |
| --- | --- | --- |
| Low | General knowledge | Normal pipeline, standard disclaimer |
| Medium | Treatment protocols | Retrieval confidence above 0.80, citation for every claim, guideline-specific disclaimer |
| High | Dosing, emergencies, pediatric, rare diseases | Show source text with no LLM interpretation, escalation message, clinical review within 24 hours |

If the query looks like it involves a real patient (age, weight, lab values), generation is blocked completely.

#### What would you do if retrieved sources contradict each other?

Contradictions are common: an old trial says benefit, a newer meta-analysis says harm.

- **Detect**: after retrieval, ask an LLM "do these sources make conflicting recommendations?" and flag the query before generating.
- **Show, don't hide**: never silently pick one. Present both ("2019 ESC guideline says X, 2023 ACC update says Y") and say clinical judgment is needed.
- **Ordering rules**: newer date first, note the **evidence level** (RCT above observational above expert opinion), and note source authority (national guideline body above single-institution protocol).
- **Escalate**: contradictions about dosing, contraindications or emergency care always go to human clinical review.

### Topic: Retrieval and Evaluation

#### How would you evaluate retrieval relevance in medical systems?

Relevance has two sides: **semantic** (same topic) and **clinical** (actually applicable to this patient context).

- **Gold dataset**: 300 to 500 clinical queries labeled by physicians, from broad ("treatment for Type 2 diabetes") to very specific ("GLP-1 agonist dosing with eGFR below 30").
- **Metrics**: **Recall@5**, **MRR** (is the most authoritative source ranked first?), and a physician-given **clinical relevance score** (1 to 3).
- **Specialist review**: a monthly manual review of 50 to 100 queries, and tracking where automated scores and physicians disagree.

#### What metrics matter most in healthcare RAG: precision or recall?

Both, for different jobs.

- **Recall** wins for safety queries: missing a contraindication or interaction warning is a safety failure.
- **Precision** wins for decision support: a doctor asking for first-line options needs the top 3 results to be on point, and noise raises the chance of a wrong answer.
- In practice use two stages: **high-recall retrieval (top 20)**, then **high-precision re-ranking (top 5)**, with different recall targets per query category.

#### How would you test the system with real clinical scenarios?

Generic test queries miss real clinical failure modes. Build **100 to 200 scenarios** with physicians, each with a correct answer, expected citations and things that must not appear.

Check per scenario: right source retrieved, answer faithful to it, caveats included, no critical safety info omitted, and useful to a physician. Then roll out in stages:

1. **Internal testing** by the ML team with automated metrics.
2. **Clinical testing** with 3 to 5 physicians using real questions.
3. **Blind testing**: physicians compare RAG answers with their own without knowing which is which.
4. **Shadow deployment** for 4 to 6 weeks in parallel with real workflows before any live use.

#### How would you measure hallucination rate?

In healthcare a made-up dose or study is a safety risk, so measure it from several angles.

- **Automated faithfulness** with **RAGAS** or a medical-adapted judge LLM, tracked daily with an alert if the average drops below 0.88.
- **Specific patterns**: **numeric hallucinations** (every dose or threshold must exist in a chunk), **citation fabrication** (cited source must exist in the index), and **population extrapolation** (dropping the "in adults with X" qualifier).
- **Human sample**: physicians review about 2% of production answers and grade them from fully accurate to dangerous. The **dangerous inaccuracy rate** is the main safety metric, and the target is zero.

#### How would you design human-in-the-loop review?

Human review is a patient safety mechanism, and may be a regulatory need. Use three tiers:

- **Tier 1, automated pass-through** (low risk): high retrieval confidence (above 0.85), high faithfulness (above 0.90), delivered with citations and disclaimers.
- **Tier 2, async review** (medium risk): delivered with a "pending clinical review" flag; a reviewer approves or corrects within about 4 hours.
- **Tier 3, synchronous review** (high risk): the answer is held until a reviewer approves it. If nobody is available within the **SLA**, show only the raw source text.

Reviewers use a queue showing query, context and answer side by side, with one-click approve, flag or escalate. Every decision is logged and feeds the evaluation dataset.

### Topic: Scalability

#### How would you scale the system for multiple hospitals?

Use a **multi-tenant architecture**: many hospitals share one platform but stay isolated.

- **Isolation**: each hospital gets its own **namespace** or index partition for its protocols and formularies; shared published guidelines and research live in a shared index. A query searches the hospital index plus the shared one and merges the results.
- **Access control**: Hospital A cannot see Hospital B's protocols, and **role-based access** applies inside a hospital (a nurse vs a specialist).
- **Per-hospital customization**: which sources are indexed, which guidelines win, disclaimer wording, and optionally a hospital-specific re-ranker.
- **Operations**: per-hospital dashboards, **separate ingestion pipelines** so one big upload does not slow others, and per-hospital **SLAs** with dedicated capacity.

#### How would you separate patient-specific data from general medical knowledge?

This is a hard boundary because patient data falls under **HIPAA** (US) and **GDPR** (EU).

- **General knowledge index**: guidelines, papers, drug references, protocols. No patient identifiers (**PHI**), so it can use standard cloud and managed vector DBs.
- **Patient data store**: records, labs, notes, in a HIPAA-compliant environment with **end-to-end encryption**, open only to that patient's care team.
- **Assemble at query time**: fetch the dosing guideline from the general index and the patient's relevant values (for example eGFR) from the patient store, and never store the two together.
- **LLM context**: guideline text plus patient values only, with **pseudonymized** identifiers and nothing identifying sent to external LLM APIs. The prompt forbids inventing extra patient details.
- **Audit**: general access logged per session; patient data access logged per record with physician identity, timestamp and fields accessed.

## Use Case 3: Enterprise Knowledge Base RAG Systems for Internal Organizational Knowledge

The golden rule here: **the right person sees the right, current document**. Employees from HR, IT, Legal and Engineering all search one system, so access control, freshness and handling messy questions matter most.

### Topic: System Design

#### How would you design a multi-department knowledge RAG system?

The challenge: each department has its own documents and rules, yet employees want one search box.

- **Shared index with department namespaces**: all chunks sit in one vector store, tagged with **department**, **doc\_type** and **access\_level**, so cross-department search works when allowed.
- **Separate collections for sensitive content**: HR compensation, legal documents and executive communications live apart with stricter access and are never part of general search.
- **Unified query layer**: one API that checks the employee's role, decides which collections they can see and builds the retrieval filter before touching the vector store.

Example layout: a shared general index (IT docs, onboarding, company policies), plus HR, Legal and Engineering collections.

#### How would you implement access control based on employee roles?

Enforce it at the **retrieval layer**, not only in the app. An app-level check is one bug away from leaking a restricted file.

- **Tagging**: each chunk gets an **allowed\_roles** field (all\_employees, hr\_team, engineering, manager\_and\_above), copied from the source system's permissions.
- **Enforcement**: look up the user's role in the **identity provider** (**Active Directory**, **Okta**) and add a mandatory metadata filter at the vector DB level so code cannot skip it.
- **Hierarchy**: managers inherit employee permissions plus manager documents; admins see everything but with stricter audit logging.
- **Dynamic updates**: because the filter uses a live role lookup, a role change or departure takes effect without touching the stored metadata.

#### How would you handle document versioning?

When a policy changes, the old version should not vanish, it just should not be the default answer.

- **Version metadata** on every chunk: **document\_id**, **version**, **effective\_date**, **status**, **supersedes**.
- **Default filter**: **status: active** on every query.
- **Supersession workflow**: uploading a new version automatically marks the old one superseded; the new one is reviewed before it becomes active. Both stay in the index.
- **Historical queries**: "show me the remote work policy as of January 2024" is routed by effective\_date.

#### How would you prevent outdated policy retrieval?

An employee following an old leave or security policy can cause real compliance or HR trouble.

- **Freshness fields**: **expiry\_date** or **review\_due\_date**; overdue documents become **pending\_review** and rank lower, while superseded or archived ones are excluded.
- **Ingestion-triggered invalidation**: a new upload with the same **document\_id** automatically marks all older chunks superseded.
- **Staleness warnings**: if the retrieved policy is over 12 months old with no newer version, add a note asking the user to verify with HR. Alert owners about documents untouched for 24 months.
- **Owner reminders**: a message 30 days before the review due date; until it is confirmed, answers carry a caveat.

#### How would you structure metadata for better filtering?

Good metadata at ingestion pays off on every future query; without it you only have semantic search. A typical schema:

| Field | Why it matters |
| --- | --- |
| **department**, **doc\_type** | Scoped search ("only HR policies") |
| **audience**, **allowed\_roles** | Who may see it in cross-department queries |
| **status**, **effective\_date**, **version** | Keeps outdated content out of default results |
| **tags** | Catches casual wording ("WFH policy" finds "remote work policy") |
| **region** | US and EU employees may follow different rules |
| **owner**, **review\_due\_date** | Who maintains it and when it needs review |

Automate it: take department and doc\_type from the file path and document management system, extract effective\_date with a **date extraction model**, and auto-generate tags with a **keyword extraction model**.

### Topic: Retrieval and Query Handling

#### How would you handle vague employee queries like "leave policy"?

"Leave policy" could be annual, sick, parental, bereavement or unpaid leave. A plain vector search returns a blur of all of them. Handle it in steps:

1. **Use context**: in a multi-turn chat, earlier mentions of "baby" suggest parental leave.
2. **Query expansion**: add synonyms (PTO, time off, vacation days, sick leave) to improve recall.
3. **Grouped results with clarification**: show "I found several kinds of leave, which one?" with clickable options instead of a blended answer.
4. **One targeted question** if it is still too vague ("personal, medical or a new child?").

#### Would you implement query rewriting? How do you limit latency, cost and retrieval drift?

Yes, but carefully, because over-rewriting can change what the employee meant.

- **Where it helps**: follow-ups ("what about managers?" becomes "leave policy for managers"), internal jargon ("PIP" becomes "performance improvement plan"), casual phrasing ("can I work from home?" becomes "remote work eligibility policy").
- **Intent-preserving prompt**: tell the model to keep the meaning, add nothing new and not answer the question.
- **Dictionary expansion first**: a cheap, deterministic glossary lookup before any LLM call.
- **Conditional rewriting**: skip the LLM for already clear queries.
- **Multi-query retrieval** (optional): 2 to 3 variants merged, only for hard queries.
- **Operations**: a **small fast model**, **caching** of repeated rewrites, and monitoring for **query drift** (rewrites that retrieve worse than the original).

#### How would you handle multiple departments having similar documents?

Every department has its own onboarding guide and its own data-handling or security policy.

- **Metadata tagging**: always keep the source department, and attribute answers ("According to Engineering's onboarding guide...").
- **Query-time department inference**: use the employee's department as a **soft signal** to rank their own documents first; if the query names a department, apply a **hard filter**.
- **Conflict surfacing**: if two departments disagree (MFA on all systems vs only external ones), show both and suggest checking with a department head. Log these conflicts in an **admin review queue** so owners can fix them.

#### How would you measure retrieval performance in enterprise RAG?

Employees do not label what should have been returned, so you build your own ground truth.

- **Eval dataset**: 100 to 200 labeled question-document pairs made with HR, IT and department admins, including edge cases and "no good document exists" queries. Keep it living: add every reported failure.
- **Metrics**: **Recall@5** (tracked weekly), **MRR** (most users read only the first result), **no-result rate** (a rise suggests coverage gaps), and **user-reported failures** (thumbs-down).
- **Proxy signals from usage**: an immediate **follow-up query** or a **contact with HR** right after using the tool suggests the answer failed.

#### How would you reduce irrelevant or low-quality chunk retrieval?

Irrelevant chunks are a top cause of wrong answers. Layer these fixes:

- **Metadata pre-filtering**: a leave question searches only HR and all\_employees documents.
- **Hybrid retrieval**: **BM25** plus vector similarity plus metadata filters, so exact policy names and product codes are not missed.
- **Cross-encoder re-ranker** for sharper relevance scoring.
- **Similarity thresholding**, tuned carefully and combined with re-ranker score, metadata and keyword matches, since some good documents score low because of vocabulary differences.
- **Contextual compression**: keep only the relevant sentences, which also saves tokens.
- **Better chunking**: about 300 to 800 tokens, never split tables or bullet lists, and strip boilerplate such as headers, footers and navigation menus. Poor chunking hurts even with a good retriever.

### Topic: Production and Monitoring

#### How would you monitor system usage and performance?

Watch three levels: infrastructure, quality and business usage.

- **Infrastructure**: end-to-end **latency P50/P95/P99**, vector search latency separate from LLM latency, error rates by type, and embedding queue depth.
- **Quality**: average top-1 similarity score, **faithfulness** distribution, no-result rate, and a weekly automated eval run.
- **Usage**: queries per day by department, top topics (they reveal content gaps), user retention (are people coming back, or going back to searching **SharePoint**?), and peak times.
- **Tooling**: **structured JSON logs** with a trace ID, **Prometheus** metrics shown in **Grafana** dashboards, plus a business dashboard for HR and product leaders.

#### How would you collect user feedback?

Employees are busy, so feedback must be one click.

- **Inline**: **thumbs up/down** on each answer; after thumbs down, a one-tap reason (wrong answer, outdated, did not understand, incomplete) and an optional free-text box.
- **Implicit signals**: an immediate follow-up, the same question rephrased, or abandonment (compare against thumbs-down rate to tell success from giving up).
- **Targeted prompts** when confidence is low, with a link to contact HR directly.
- **Admin channel**: admins flag a document as outdated or wrong, which triggers a review and **temporarily suppresses** it from retrieval.

#### How would you improve the system iteratively?

Tie improvements to specific failure types, not gut feeling. A **weekly cycle**:

1. **Triage**: cluster last week's thumbs-down feedback (retrieval miss, outdated content, incomplete, wrong department) and pick the biggest group.
2. **Root cause**: is the document missing (coverage gap) or present but not retrieved (retrieval quality)? Was a new version missed? Is department metadata or role filtering wrong?
3. **Fix and validate**: add missing documents, add the failing query to the eval set and test parameter changes, or fix tagging and re-ingest.
4. **Measure**: rerun the eval set and compare **Recall@5** and **MRR** against the baseline.

Monthly: review the top 20 queried topics for coverage and find departments with low adoption.

#### How would you detect content drift in internal documents?

**Content drift** means the index no longer matches current company practice, usually because re-ingestion fell behind.

- **Freshness tracking**: compare **last\_ingested\_date** with **source\_last\_modified\_date** (SharePoint, Confluence) daily; alert if over 5% of a department's documents are out of sync.
- **Query failure patterns**: rising thumbs-down or no-result rate on one topic.
- **Embedding distribution monitoring**: embed newly uploaded documents and check whether they land far from the existing index, which signals a new topic area.
- **Active detection**: hook into change feeds (**SharePoint webhooks**, **Confluence change API**) to re-ingest within 24 hours, and flag documents with no re-verification for 6 months.

#### How would you support thousands of concurrent employees with low latency and reliability?

Scale the API, the retrieval layer and the LLM usage separately.

- **Stateless, horizontally scalable API** behind a **load balancer**, with **auto-scaling** on CPU, queue depth or latency.
- **Semantic caching**: many people ask similar questions. Combine embedding similarity with metadata filters so a cached answer is never shown to someone without permission, and invalidate the cache when a document changes.
- **Vector DB scaling**: **read replicas**, **sharding** by namespace, department or domain, and distributed indexing.
- **LLM throughput** (usually the bottleneck): response caching, batched embeddings, rate-limit handling and request queuing.
- **Graceful degradation**: if the LLM is slow or down, still return the top documents, highlighted passages and citations.
- **Rate limits**: do not use many API keys to dodge limits (it can break provider terms). Use higher enterprise quotas, multiple regions or deployments, and multiple model providers.
