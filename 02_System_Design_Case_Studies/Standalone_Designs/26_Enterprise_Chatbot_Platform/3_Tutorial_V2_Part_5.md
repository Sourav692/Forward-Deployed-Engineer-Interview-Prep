# Chapter 21 (Condensed): Enterprise Chatbot Platform — "Our Own ChatGPT", part 5

## Coverage Notes

One review pass was run against the fixed 20-item / 4-phase decomposition rubric (same rubric, same verdict as the full chapter — this is a compression of that review, not a re-analysis; nothing was added to or dropped from the underlying coverage assessment except the phase-19 correction noted below).

**Phase 1 — Problem Framing & Discovery**
- **Item 1 (Feature → business-outcome reframing):** Fully covered — Section 1, feature vs. business-result split (retire the invisible egress risk *and* deliver productivity).
- **Item 2 (Stakeholder/persona mapping):** Fully covered — Section 1, five-stakeholder table + jobs-to-be-done.
- **Item 3 (Clarifying questions that change architecture):** Fully covered — Section 1's six discovery questions + Section 2's deep-dive table.
- **Item 4 (Requirements split + prioritisation):** Fully covered — Section 2, must/should/could functional requirements.
- **Item 5 (Explicit non-goals/scope fence):** Fully covered — Section 2, five MVP exclusions.

**Phase 2 — Estimation & Architecture**
- **Item 6 (Back-of-envelope scale/capacity math):** Fully covered — Section 3, load shape, 800-concurrent-streams derivation, capacity worked backward.
- **Item 7 (Unit economics/cost-driver breakdown):** Fully covered — Section 3, $C_{user}$ equation + quadratic-history cost trap.
- **Item 8 (End-to-end architecture and data flow):** Fully covered — Section 4, dependency order + architecture/sequence diagrams.
- **Item 9 (Data model and API contracts):** Fully covered — Section 5, five records + four endpoints.
- **Item 10 (Build-vs-buy / vendor and model-selection trade-offs):** Fully covered — Section 1's discovery question 6, Section 2's deep-dive row, and Section 8's trade-off #1; this scenario is the natural home for this item since it's an explicit gap in the Chapter 2 tutorial.

**Phase 3 — Trade-offs, Security & Reliability**
- **Item 11 (Named trade-off pairs, balanced verdict):** Fully covered — Section 8, five trade-off pairs.
- **Item 12 (Threat model/security controls):** Fully covered — Section 6, isolation-layers table + unusual-threat-model framing.
- **Item 13 (Failure-mode/reliability drills):** Fully covered — Section 6, four named walkthroughs (permission laundromat, hidden instructions, stale revocation, provider outage).
- **Item 14 (Testing strategy):** Fully covered — Sections 5 & 6, permission-filter contract test, mid-stream failure injection, three boundary-proving tests.

**Phase 4 — Delivery, Governance & Communication**
- **Item 15 (Layered evaluation metrics/observability):** Fully covered — Section 7, metrics table + three-audiences framing.
- **Item 16 (Phased rollout, risk register, rollback gates):** Fully covered — Section 7, four-phase rollout + risk register.
- **Item 17 (Regulatory/governance depth):** Partial — retention, legal hold, eDiscovery, and works-council consultation are first-class, but named framework mechanics (GDPR lawful basis for employee monitoring, FINRA supervision, DPA clause detail) are not worked through.
- **Item 18 (Responsible-AI/risk framing beyond the obvious failure mode):** Partial — safety filtering and injection are covered in depth, but bias in an employee-facing assistant (e.g. systematically different career guidance across groups) is only implicit in the eval-set discussion; multilingual and accessibility degradation (a global, non-monolingual workforce; screen-reader behaviour for a streaming response) is also unaddressed and sits under this same "beyond the obvious failure mode" umbrella.
- **Item 19 (Change-management/adoption narrative):** Fully covered — Section 7's phased rollout and three-audiences framing, and Section 1's adoption-as-safety-outcome argument, directly address change management and adoption; the source's own gap list didn't call this out separately, but the content clearly supports "fully covered" here.
- **Item 20 (Structured communication plan + self-scoring rubric):** Fully covered — Section 8, 50-minute pacing plan + scoring rubric.

**Gaps carried forward from the source (named honestly, not invented to force a checkmark):** regulatory/governance depth (Item 17) and Responsible-AI/bias plus multilingual-accessibility framing (Item 18) are the two genuine gaps. Below is a supplementary point of view for each.

### My Perspective on the Gaps

- **Item 17 — Regulatory/governance depth.**
  - This scenario's regulatory surface is almost entirely about *employee monitoring*, which is a different animal from the customer-data regulations that show up in most other chapters — the frameworks most likely to surface here are GDPR/local-equivalent employee-monitoring provisions, works-council consultation requirements (already flagged in the risk register as the row "candidates rarely include"), and sector rules like FINRA/SEC supervision if the workforce includes regulated employees whose communications must be retained and reviewable.
  - I'd map each theme back to a component already in this architecture rather than inventing a new layer: lawful basis for monitoring conversations → the `retention_class` and `legal_hold` fields on `Conversation`, plus the fact that every admin read is itself audited (this is exactly the evidence a works council or regulator asks for — "who can read an employee's chat, and is that access itself logged"); data residency → the model-router's classification-and-region logic already described for restricted data classes.
  - The one piece genuinely missing is a documented **sub-processor map for the model provider itself** — when a commercial API vendor also has its own downstream sub-processors, the platform needs a data-flow diagram showing every party that could see even zero-retention-agreement prompt text, since that's exactly what GC's "prove it's not in a third party's training set" question in Section 1 is really asking about.
  - Interview framing: don't invent framework depth you don't have — name the works-council consultation explicitly (it's already the standout row in this chapter's own risk register) and connect GDPR-style monitoring concerns to the audit-on-every-admin-read design that's already built, rather than treating regulation as a bolt-on.

- **Item 18 — Responsible-AI framing (bias) and multilingual/accessibility.**
  - The natural Responsible-AI layer for *this* chapter isn't general fairness auditing — it's bias in an assistant that mediates internal advice at scale: if "Ask Finance" or a career-guidance assistant gives systematically different quality or tone of answers by department, seniority, or (via names/writing style in the prompt) demographic signal, that's a governance problem specific to an internal tool used by 40,000 people who may not question its authority the way they'd question a search engine.
  - Concretely, I'd extend the existing eval-set and canary approach (already used for injection detection in Section 6) to include a **demographic-parity slice** on sampled groundedness and thumbs-down rate — cutting the existing quality metrics by department and by a coarse language/locale signal, rather than building an entirely separate fairness pipeline.
  - On multilingual/accessibility specifically: the platform's permission-filtered retrieval and output-scanning logic were designed and tested (per Section 6's test suite) against English-language corpora; a real global rollout needs the same contract tests re-run against non-English content, since a DLP or classification scanner tuned on English text can both over-block and under-block in other languages — and the streaming relay's typed-event design (token/citation/route_change/blocked/done) already gives assistive technology a clean hook to announce state changes, so accessibility here is more a testing and QA gap than an architecture gap.
  - Interview framing: connect this back to the platform's own adoption argument — a governed tool that works less well for non-English-speaking or assistive-technology-using employees quietly reproduces the exact shadow-IT risk this whole project was funded to eliminate, just for a narrower population.

## Level calibration

For an internal "own ChatGPT" serving 40,000 employees, the levels separate on whether permissions and adoption are the design or features bolted onto chat.

| Level | Sounds like | Missing |
|---|---|---|
| Senior | "SSO, streaming chat, permission-filtered retrieval with citations, and a model router behind provider adapters. I size on concurrent streams, 40 turns a second times a 20-second stream is 800 connections, and compact history with a pinned head." | Per-turn re-authorisation, the assistant-scope intersection, and what happens when an ACL lookup or an audit write fails. |
| Staff | "Identity is set at the session and re-checked every turn, an assistant's effective scope is its scope intersected with the viewer's live permissions, and every layer fails closed. Rollout adds one risk class per phase, gated on zero boundary violations, and the DLP false-positive rate has an owner." | Whether to build at all, which data classes need self-hosting, and the legal and works-council commitments. |
| Principal | "First ask what rules out buying a vendor's enterprise tier; the likely answer is hybrid: buy the model, build orchestration, connectors and governance, and self-host only the data classes that require it. Success is consumer-AI egress down with weekly active use up, and the works council is consulted before the beta, not after." | Whether building beats a vendor seat on cost needs measured cost per active user from the beta, not the estimate. |

## Sources (checked 27 Sep 2026)

- [Microsoft 365 Copilot enterprise pricing](https://www.microsoft.com/en-us/microsoft-365-copilot/pricing/enterprise) — $30/user/month list price, paid yearly, on top of a Microsoft 365 licence
- [Works Constitution Act (BetrVG), English translation](https://www.gesetze-im-internet.de/englisch_betrvg/englisch_betrvg.html) — section 87(1) no. 6: works-council co-determination over technical devices that monitor employee behaviour or performance
- [Works Councils Act (WOR), article 27](https://wetten.overheid.nl/BWBR0002747/) — Dutch works-council consent right over systems that can monitor staff attendance, behaviour or performance
- [Dutch Data Protection Authority: works council and privacy booklet](https://www.autoriteitpersoonsgegevens.nl/uploads/imported/ap_or_privacy-boekje.pdf) — the regulator's guide to that consent right
- [AWS: Application Load Balancer attributes](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-load-balancer-attributes.html) — default connection idle timeout is 60 seconds
- [nginx: ngx_http_proxy_module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) — `proxy_read_timeout` defaults to 60 s, measured between reads
- [The Idempotency-Key HTTP Header Field (IETF draft -07)](https://www.ietf.org/archive/id/draft-ietf-httpapi-idempotency-key-header-07.html) — `409` for a request still in flight, `422` for a reused key with a different body
- [Claude prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — caching works on a stable prompt prefix
- [Azure OpenAI quotas and limits](https://learn.microsoft.com/en-us/azure/foundry/openai/quotas-limits) — provider capacity is set as tokens-per-minute and requests-per-minute quotas
- [FINRA Rule 3110](https://www.finra.org/rules-guidance/rulebooks/finra-rules/3110) — supervision and review of correspondence and internal communications
- [SEC Rule 17a-4](https://www.law.cornell.edu/cfr/text/17/240.17a-4) — broker-dealers must keep business communications for three years
