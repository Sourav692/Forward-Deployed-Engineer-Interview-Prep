# Chapter 13: Design a Reliable Workflow Orchestration System, part 9

## Coverage Notes

This tutorial was self-reviewed against the fixed 20-item decomposition rubric across two passes. The second pass narrowed, but didn't close, the gaps in unit-economics framing (cost SLI and cost-per-workflow language) and in regulatory/compliance breadth. Both are still marked Partial below.

**Phase 1 — Problem Framing & Discovery**
- **Item 1 (Feature → business-outcome reframing):** Fully covered — Section 1 outcome-first restatement.
- **Item 2 (Stakeholder/persona mapping):** Fully covered — Section 1 stakeholder map, jobs-to-be-done.
- **Item 3 (Clarifying questions that change architecture):** Fully covered — Section 2 question tree.
- **Item 4 (Requirements split + prioritisation):** Fully covered — Section 2 must/should/could, functional vs nonfunctional.
- **Item 5 (Explicit non-goals/scope fence):** Fully covered — Section 2 "What the MVP Will Not Support."

**Phase 2 — Estimation & Architecture**
- **Item 6 (Back-of-envelope scale & capacity math):** Fully covered — Section 3 workflow/activity/storage/throughput estimates.
- **Item 7 (Unit economics/cost-driver breakdown):** Partial — cost treated as one of the six SLIs in Section 3, no worked infra cost-per-workflow calculation.
- **Item 8 (End-to-end architecture & data flow):** Fully covered — Section 4 component map, trust boundaries, sequence diagrams.
- **Item 9 (Data model & API contracts):** Fully covered — Section 5 four core records, four API endpoints.
- **Item 10 (Build-vs-buy/vendor & model-selection trade-offs):** Absent — only a passing aside in Section 8's follow-up drills, not developed.

**Phase 3 — Trade-offs, Security & Reliability**
- **Item 11 (Named trade-off pairs with balanced verdict):** Fully covered — Section 8, four trade-off pairs.
- **Item 12 (Threat model/security controls):** Fully covered — Section 6, four security controls.
- **Item 13 (Failure-mode & reliability drills):** Fully covered — Section 6, five named drills with detect/contain/recover/prevent.
- **Item 14 (Testing strategy):** Fully covered — Sections 5 and 6, idempotency contract test and crash-replay failure-injection test.

**Phase 4 — Delivery, Governance & Communication**
- **Item 15 (Layered evaluation metrics & observability):** Fully covered — Section 7, six-layer scorecard.
- **Item 16 (Phased rollout/risk register/rollback gates):** Fully covered — Section 7, four-phase plan with owner/exit-criteria/rollback-trigger, plus risk register.
- **Item 17 (Regulatory/governance depth):** Partial — audit evidence, retention, residency/data-minimisation covered; no named external regulatory framework (SOX, GDPR, etc.).
- **Item 18 (Responsible-AI/risk framing beyond obvious failure mode):** Partial — one aside on LLM-step policy checks in Section 5, not a developed theme.
- **Item 19 (Change-management/adoption narrative):** Fully covered — Section 7, operator training, adoption metrics, versioned migration.
- **Item 20 (Structured communication plan + self-scoring rubric):** Fully covered — Section 8, 50-minute plan, scoring rubric, 90-second summary, practice loop.

**Overall**: 16/20 items fully covered, 3 partial (unit economics, regulatory/governance depth, responsible-AI framing), 1 absent (build-vs-buy/vendor trade-offs). These gaps reflect the source chapter's own emphasis — a deep dive on durable execution, idempotency, and crash recovery for a workflow orchestrator, not a cost-modelling or compliance-framework chapter — and the tutorial does not fabricate content the source does not support.

### My Perspective on the Gaps

*The following is supplementary perspective from this reformatting pass — not sourced from the original chapter. It is offered as one way to address each gap live in an interview, grounded in this chapter's own architecture.*

**Item 7 — Unit economics / cost-driver breakdown (Partial).**
- I'd build a rough cost-per-workflow number directly from components this chapter already named: `HistoryEvent` storage (Section 5) at the base-case ~400GB raw (Section 3) is a small monthly storage bill before replication: about $9 on S3 Standard or about $32 on gp3 block storage at AWS US East list prices (checked Sep 2026) — cheap relative to the "manual repair count" line already in the scorecard (Section 7).
- I'd expect the real cost driver in this system to be operator time, not infrastructure: `cost per workflow ≈ infra marginal cost + (manual repair rate × loaded operator cost per incident)`.
- That formula ties directly to the compensation-rate and manual-repair-count SLIs the chapter already tracks, so I would present it as "we already have the inputs to compute this, we just haven't multiplied them yet" rather than inventing a new metric.

**Item 10 — Build vs. buy / vendor and model-selection trade-offs (Absent).**
- I would say explicitly: the durable-execution core (state machine, history store, replay engine) is the kind of infrastructure a managed durable-execution product already solves well, so "buy the execution runtime, build the workflow definitions and activities" is a defensible default for most teams.
- Reserve build effort for what's genuinely differentiated: the compensation policy per business action (Section 6's fail-closed/degrade/queue/human-intervention table), the idempotency-key boundary choices (Section 5), and the domain-specific saga logic (the `order_workflow` function itself).
- General heuristic to say out loud: buy commodity execution infrastructure that a vendor is accountable for keeping durable and available; build only the business-specific state machine and policy layer that no vendor can define correctly on your behalf.

**Item 17 — Regulatory / governance depth (Partial).**
- I'd name concrete frameworks the interviewer is likely probing for, each tied to a component this chapter already built: PCI-DSS scope reduction if the orchestrator ever touches card data (push that to the payment gateway and keep only opaque references, consistent with Section 6's "keep secrets out of history" control).
- SOX-style controls if approval is a financial authorisation step — the `ActivityReceipt` record and audit-log fields from Section 5 already give the evidentiary trail a SOX auditor would ask for.
- GDPR/data-minimisation if any internal system touches customer PII — the retention policy on `HistoryEvent` (Section 5) is the natural enforcement point, so I'd frame governance as "policy applied to records we already have," not a separate workstream.

**Item 18 — Responsible-AI / risk framing beyond the obvious failure mode (Partial).**
- The chapter's only AI-adjacent point is that LLM-driven steps need "typed validation and policy checks" before changing state (Section 5). I'd extend that concretely: an LLM misclassifying or mis-routing an approval could silently auto-approve something that should have gone to a human — an irreversible business effect exactly like the ones Section 6's failure-policy table already says to fail closed on.
- So the responsible-AI framing bolts directly onto the existing decision table rather than needing a new framework: any model output that could trigger payment, approval completion, or repair mutations gets treated as untrusted input, gated behind the same human-review lane the chapter already reserves for irreversible or ambiguous compensation.

## Sources (checked 27 Sep 2026)

- [IETF draft-ietf-httpapi-idempotency-key-header-07](https://www.ietf.org/archive/id/draft-ietf-httpapi-idempotency-key-header-07.html) — 400 for a missing key, 409 while the first request is in flight, 422 for a reused key with a different payload
- [Datatracker: Idempotency-Key header draft status](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) — expired Internet-Draft, not an RFC
- [Stripe API: Idempotent requests](https://docs.stripe.com/api/idempotent_requests) — provider-side idempotency keys; keys can be pruned after 24 hours
- [AWS Architecture Blog: Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) — capped exponential backoff with jitter
- [AWS Price List API: Amazon S3, us-east-1](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/us-east-1/index.json) — S3 Standard at $0.023 per GB-month
- [Amazon EBS pricing](https://aws.amazon.com/ebs/pricing/) — gp3 at $0.08 per GB-month in US East
- [PCI SSC: PCI DSS Tokenization Guidelines](https://listings.pcisecuritystandards.org/documents/Tokenization_Guidelines_Info_Supplement.pdf) — tokenisation can reduce PCI DSS scope; tokens that can start a transaction may stay in scope
- [GDPR Article 5 (EUR-Lex)](https://eur-lex.europa.eu/eli/reg/2016/679/oj) — data minimisation and storage limitation principles
