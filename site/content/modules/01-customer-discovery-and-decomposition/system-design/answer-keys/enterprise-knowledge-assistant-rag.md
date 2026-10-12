# Enterprise Knowledge Assistant with RAG - Answer Key

Try the worksheet before you read this key. It shows what a strong GenAI FDE candidate asks, designs, measures, secures and explains on the way from a demo to a production system.

## Strong discovery questions
- Drive, SharePoint, Slack, the wiki and tickets will sometimes contradict each other. Which one wins for each kind of content, and what do we do when they clash?
- Must access rights mirror the upstream systems live, or may a periodic sync trail behind? That choice fixes where the ACL checks sit.
- Can the assistant combine several sources into one answer, or may it only repeat retrieved passages? Should a citation land on the exact passage, or is the document enough?
- How current do policies, tickets and project updates need to be? Once a file is deleted or access is revoked, how quickly must retrieval stop returning it?
- Who uses this day to day? Who investigates a bad answer, and who carries the risk if the assistant shows someone too much?
- What p95 latency are we aiming for, and which residency, retention and cost limits apply?
- Who is allowed to read audit logs and answer traces? What must a trace hold so someone can rebuild how an answer was produced?
- If retrieval fails or two sources conflict, should we refuse, answer with a stale-content label, or hand off to a person?

## Strong functional requirements
- Core workflow: an employee asks a work question. The assistant resolves their groups, pulls back only passages they may see, and replies with citations at passage level.
- Pull in tickets, wikis, Slack, SharePoint and Drive as deltas. One changed file should never force us to rebuild the whole index.
- Store each version of a document with its ACL metadata. Then we can answer the question "which content was open to this person on that date?"
- Combine keyword and vector retrieval, then rerank. Dense search can blur policy IDs, error codes and ticket numbers, and keyword matching keeps them exact.
- Cite every answer, and decline when the evidence is thin. A correct refusal is worth more than a confident hallucination.
- Capture feedback signals that are safe to keep for evaluation. Do not store every raw prompt by default.

## Strong non-functional requirements
- Latency: never settle for "fast enough". Pick a percentile target, then divide the p95 budget between generation, reranking, retrieval, ACL filtering and identity.
- Availability: when a connector, an index or a model provider goes down, degrade in the open. Offer partial coverage, a staleness label or a refusal, and never guess silently.
- Security: one user must never see another user's content. Effective permissions filter the candidates before any text reaches the model, and each revocation spreads to every index and cache.
- Compliance: write an audit trail nobody can alter. It holds request IDs, the citations the user actually saw, ACL and index version stamps, and the event IDs from each upstream system.
- Reliability: three things fail closed: the permission check, deletion sync and citation validation. Weaker retrieval is an acceptable way to degrade. Background reindexing goes on a queue.
- Cost: work out embedding, index and token cost separately. This case assumes 50 million chunks, and at that size I'd expect keeping the index fresh to cost more than the first embedding run.

## Architecture explanation
- Keep two planes apart. The control plane holds policy, config, credentials, connector schedules and evaluation rules. The data plane handles live questions, fetches evidence, enforces permissions and returns responses.
- Ingestion runs asynchronously. Connectors push into a queue that takes both events and backfill: events bring near-real-time changes, and backfill picks up anything missed, including during outages.
- A parser, OCR step and chunker turn PDFs, slides, tickets and chat threads into one shape. An ACL normaliser translates each source's permission scheme into a single internal model.
- Each chunk goes into two indexes. The keyword index handles exact names, IDs and policy wording, and the vector index handles paraphrase. The blended score is `S_hybrid = α·S_vector + (1−α)·S_keyword`.
- Questions travel a synchronous path, ordered by risk. First authenticate, then resolve groups, and only then rewrite the question, and only where the rewrite keeps its meaning.
- The retriever applies ACL filters while it selects candidates. A document the user cannot open therefore never becomes evidence. A reranker and a context-budget manager then cut the survivors down.
- One LLM gateway owns prompts, model choice and guardrails. A citation builder adds passage references, and an output policy engine can redact or abstain.
- An evaluation and trace store keeps feedback and traces with privacy protected. Caches only save time and are cleared whenever a permission changes. They are never the permission model.

## Data model / integration assumptions
- Document(id, source, version, owner, acl_policy_id, deleted_at); Chunk(id, document_id, text, embedding_ref, offsets, metadata); QueryTrace(id, actor_hash, retrieval_set, model_version, latency, outcome).
- The indexes hold derived search state, not the truth. When we are unsure, we read the system of record again rather than trust the index.
- No chunk may outlast the access and freshness guarantees of its parent document. A `deleted_at` value acts as a tombstone: it removes the document from retrieval but keeps its history.
- Schedulers, webhooks and operator retries will all submit the same work twice. Sync and delete are therefore idempotent, and a second delete never brings derived chunks back.
- Every versioned piece is visible in the trace: the retrieval policy, the embedding model, the connector checkpoint, the API and the schema. Re-chunking changes the retrieval model, so it must show up too.

## Red-team risks
- cross-department permission leaks, content left stale by a missed deletion, made-up citations, prompt injection hidden in enterprise content, secrets building up in traces
- Indirect prompt injection placed in a ticket, a wiki page or a pasted note. Anything retrieved is untrusted evidence, not an instruction.
- Permission-boundary tests: users with different groups, regions and entitlements ask the same question, including users whose membership changes mid-session.
- Exfiltration attempts, such as asking for a summary of a confidential corpus, probing for hidden metadata, or pulling out system prompts and tool schemas.
- Fabricated citations, where the model points at a document that was never in the retrieval set. After generation, check each citation against live authorisation.
- Stale or conflicting content: a file that was removed or superseded keeps surfacing near the top. The named drill is a connector that misses deletion events.

## Rollout plan
- Week 0-1: agree the workflow, the riskiest constraint, how we measure success, who owns each system and what we will not build.
- Week 1-2: bring in one low-risk corpus. Check ingestion, ACL normalisation, retrieval and citation format, with nothing written back.
- Week 2-3: write the access-leakage tests. They try deleted documents, out-of-date ACLs, roundabout wording and every role. One exposure is enough to stop the release.
- Week 3-4: evaluate silently on real employee questions while users carry on with the legacy workflow.
- Week 5: give one user segment a read-only pilot. It cites its evidence, declines when unsure, collects feedback and offers a route to a person.
- Week 6-8: add sources one at a time. Every new source comes with a named owner, a dashboard for freshness, rules for reconciliation and a trigger for rolling back.
- After pilot: keep expanding only if no leak appears and cost, latency, freshness and groundedness stay healthy. Practise the reconciliation drill.

## Evaluation plan
I chose these thresholds for this case. They are not industry standards, so be ready to defend them rather than recite them.

| Metric | What it proves | Strong threshold | Dataset / method |
|---|---|---|---|
| Permission leakage count | Nobody saw content or a citation they lacked access to | Zero; a single case triggers a rollback review | Red-team ACL tests over stale groups and every role |
| Grounded answer rate | Claims rest on retrieved evidence rather than model memory | No sustained fall of more than 5 points from baseline | Labelled set from silent mode plus sampled traffic |
| Citation precision and recall | The cited passages back the answer, and the right sources were chosen | Above the agreed bar; no unexplained 5-point drop | Human or SME review of a sample |
| Freshness lag | Updates and deletions reach retrieval within the agreed window | Inside the freshness SLO for each content class | Connector telemetry compared with index timestamps |
| Retrieval recall | Relevant documents make it into the candidate set | Tracked per query type and used to tune α | Representative queries split by type |
| p95 latency and cost per answer | The system fits its interaction budget at a sensible cost | p95 on target when load hits the assumed 100 QPS peak | Load test plus production telemetry |

## Weak answer
I'd plug the enterprise sources into a vector database and let an LLM answer from the top hits. This falls short because it skips the permission boundary and assumes retrieval quality is the hard part. It also says nothing about deletions, checking citations, evaluation or tracing a bad answer back to its cause.

## Average answer
I'd put RAG on top of the company's content, with hybrid search and a reranker so an exact policy ID still matches. Answers would carry citations, and results would be filtered by permission. That is an improvement, but gaps remain. It never says whether permissions apply before or after retrieval, it has no plan for a missed deletion, and it does not decide which parts fail open and which fail closed.

## Strong answer
I'd begin with the outcome: grounded, cited answers that respect source permissions and freshness. Permission fidelity is the constraint everything rests on, since an assistant that leaks does more harm than having none. During ingestion I'd normalise each source's ACLs and store them with version and tombstone metadata. Retrieval is hybrid and filtered by permission before the model sees anything. After that come reranking, grounded generation, a citation check and abstention when evidence is weak. Access is checked when the question arrives. Precomputing is fine only for permissions that seldom change, so no shortcut quietly becomes the security policy. To prove it, I'd run a leakage suite, track groundedness and rehearse deletion reconciliation. Using RAG is the easy part. The real job is showing the system keeps permissions safe and can be audited.

## Interviewer scorecard
| Area | 1 - Weak | 3 - Average | 5 - Strong |
|---|---|---|---|
| Problem framing | Goes straight to a vector DB and a chat UI | Identifies users and one success metric | Turns the feature into an outcome and calls out permission fidelity as the dangerous constraint |
| Requirements | A generic "answer questions accurately" | Covers functional needs and a few constraints | MoSCoW split, percentile limits, stated non-goals, each requirement traced to a component |
| Architecture | An LLM plus a vector index | A sensible RAG pipeline with reranking | Separate control and data planes, ACL normaliser, permission filter ahead of generation, output policy |
| Data/integration | Refers to sources loosely | Names the three core records | Named owners, retention rules, tombstones, sync and delete that are safe to repeat, versioned boundaries |
| Evaluation | "We would test accuracy" | A small golden set plus latency checks | Tests for leakage, plus groundedness, citation precision, freshness lag and the thresholds that raise alerts |
| Safety/security | Talks about privacy in general | Adds RBAC and audit logging | Threat-models injection, stale ACLs and fake citations; states fail-open or fail-closed for each component |
| Rollout | Releases to everyone on day one | Pilot group once testing is done | Low-risk corpus, leakage gate, silent evaluation, one source at a time, rollback drills |
| Communication | Dumps a diagram or waves hands | Clear walkthrough, but generic | Opens with outcome and risk, gives time in line with the stakes, states assumptions |

## Final 2-minute spoken answer
I wouldn't open with the model. First I'd ask whose workflow changes, what success looks like, and which constraint hurts most if we ignore it. In this case the risk is getting permissions wrong. Retrieval quality comes second. An assistant that gives great answers but leaks is worse than no assistant. So I'd frame the goal as a business outcome. Employees get answers to work questions from approved content in Drive, SharePoint, Slack, wikis and tickets. Every answer carries citations and draws only on material they could already open. On the ingestion side, everything is asynchronous. Connectors feed a queue of events and backfill. Content is parsed and chunked, and an ACL normaliser maps each source's permission model onto one internal model. Then each chunk lands in both a keyword index and a vector index. The question path is synchronous, and I'd order it by risk. Authenticate and resolve groups. Rewrite the question only where its meaning holds. Retrieve with permission filters in place before any candidate exists. Then rerank, trim to the context budget, generate through a gateway, check every citation, and abstain if the evidence is weak. ACLs get checked at query time, and I'd precompute only where permissions are stable. For proof, I'd run access-leakage tests, measure groundedness, citation precision and freshness lag, and rehearse a deletion-reconciliation drill. Rollout goes from one low-risk corpus to silent evaluation, then adds sources one by one with a rollback ready. A demo that answers well is not the target. What we want is a service the company can run, audit and rely on.
