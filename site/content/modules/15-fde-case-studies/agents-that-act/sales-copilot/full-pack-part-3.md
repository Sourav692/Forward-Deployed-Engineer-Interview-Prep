# Sales Copilot for Account Executives, part 3

## 8. Draft From Approved Claims and Preview Every Write

An email draft is the copilot's most visible output. It is also the most dangerous one, because it leaves the building. The rule is that every outbound claim traces to an entry in the approved-claims playbook, and the claim verifier blocks rather than warns on anything it cannot trace. Pricing and discount language comes only from the versioned policy, and the copilot refuses to quote outside it.

Personalisation is drawn from the account's own record and interactions: the rep's last thread, the customer's stated priorities from the transcript, the open escalation. It is never drawn from the model's sense of what a company like this probably cares about. Discovery questions follow the same rule, generated from the playbook's objection list and the gaps in the CRM record.

CRM update suggestions are proposals, not writes. The copilot proposes a stage change, a next step or a note. The rep sees a preview of the exact fields that would change. Approval routes the write through the tool gateway with an idempotency key, so a retried approval cannot write twice. Read tools run automatically. Write tools require a policy check, an idempotency key, preview mode and human approval for anything above the risk threshold. Sending mail, closing an opportunity, changing an amount and emailing externally sit above the threshold on day one.

## 9. Degrade on Everything Except Authorisation and Approval

Design the failure path with the happy path. Authorisation and approval fail closed. Everything else degrades visibly.

| Fails | Behaviour |
|---|---|
| Bad retrieval or missing context | Say what could not be checked; list the missing evidence; never fill from model memory |
| Hallucinated policy or procedure | Claim verifier blocks; pricing language only from the versioned policy |
| Cross-tenant or role-based data leakage | Pre-filter on tenant, territory and role; post-check on fresh attributes; zero-violation gate |
| Unsafe tool call or write-back action | Allowlist, preview, approval, idempotency key; nothing above the threshold executes |
| Stale documents or bad sync | Staleness label on the snapshot; nightly reconciliation; connector health alert |
| Cost or latency spike | Step caps, snapshot cache, deterministic routes; see section 13 |
| CRM down | Serve the last snapshot, labelled; no writes |
| Model provider down | Fail over to a secondary route; drafts queue with progress state |
| Prompt injection in a transcript or inbound email | Retrieved content is untrusted evidence; it may still sway the model, so write tools stay gated outside it and text cannot unlock them |
| Policy engine or approval service down | Fail closed. Refuse. Never fail open on authorisation or approval |

Scale is bounded by the precompute lane. At ten times the accounts, shard the snapshot job by territory. Make the connector registry config-driven, with one schedule per source, so one rate-limited source does not stall the others. The interactive path scales with the snapshot cache hit rate, not with the CRM's API limits.

## 10. Gate the Release on Claims, Not Fluency

An eval suite that measures grammar, tone and general groundedness will pass a model that writes beautifully and invents a security certification. The scenario incident in section 14 is exactly that: a 96.7 percent pass rate on 120 cases hid an 83.3 percent pass rate on the six regulated-claim cases that mattered. The gate therefore has slices, and the critical slices pass independently or the release does not ship.

| Metric | Good threshold | Bad threshold | Test dataset | Owner |
|---|---:|---:|---|---|
| Answer groundedness | ≥ 90% supported claims | < 80% | Golden Q&A plus SME review | FDE / SME |
| Permission violations | 0 | > 0 | Red-team set: same question from users with different roles, territories, tenants | Security |
| Citation accuracy | ≥ 95% correct citations | < 85% | Source-span audit of sampled drafts | SME |
| Task completion | ≥ 80% of target workflows completed with less manual effort | < 65% | Workflow replay tests | Product |
| Escalation quality | ≥ 95% correct escalation on high-risk cases | Missed high-risk case | Risk-labelled scenarios | Product / support |
| Unsupported-claim rate (added, from the incident) | Zero critical failures on regulated-claim slices; online rate at baseline | Any pending-approval or internal-only claim in an external draft | Claim-level suite: security certifications, ROI numbers, customer references, with negative examples the model must refuse | Legal / enablement |
| Latency and cost | p95 within target; cost per workflow below budget | Breach at peak | Load test plus production telemetry | Platform |

The OpenAI-style practice version adds the business metrics that prove adoption: preparation-time reduction, brief accuracy, citation coverage, sales-representative adoption, conversion improvement and meeting-quality improvement. Report them beside the safety metrics, because a copilot that is safe and unused has also failed.

Red-team the boundary directly:

- invented customer facts and disallowed pricing promises
- confidential account leakage across territories and tenants
- biased lead scoring, which is why scoring is a non-goal
- indirect prompt injection hidden in transcripts, email threads, tickets or uploaded files
- data exfiltration: summarise every account in the region, expose hidden metadata, reveal the tool schema
- unsafe automation: close, approve, refund, email externally, change priority without approval
- staleness and conflict: an old discount policy contradicting the current one, where the system must surface the conflict and prefer the approved current source

## 11. Roll Out From Read-Only to Approved Write-Back

Week one is not the whole diagram. It is one CRM connector, the territory mirror provably right for three reps in three territories, a golden set built from historical account briefs with the enablement team, and the permission red team standing.

| Week | Gate |
|---|---|
| 0-1 | Define the workflow, the risk boundary, success metrics, source owners, approval rules and non-goals |
| 1-2 | Ingest a limited approved corpus; offline prototype with no write-back and no external communication |
| 2-3 | Golden dataset from historical cases and SME-approved answers; red-team and permission tests; claim-level slices |
| 3-4 | Shadow mode against historical and live cases; compare with the rep's own briefs without showing output |
| 5 | Read-only pilot with citations, confidence, feedback capture and an escalation path |
| 6-8 | Draft-only workflow actions behind human approval; every high-risk action stays gated |
| After | Expand sources and users only while eval metrics, incident rate, latency and cost hold; keep the rollback plan |

Close on the trade-offs and what would change them.

| Decision | Chose | Would revisit if |
|---|---|---|
| Precomputed snapshot over live fan-out | Precompute on the calendar trigger, re-check permissions at serve time | Meetings were mostly unscheduled, then a fast partial snapshot on open |
| Fixed CRM operations over NL-to-query | Fixed, reviewed operations through the tool gateway | The question set were genuinely open-ended and a validated query layer existed |
| Block over warn on unapproved claims | Block | Never for external drafts; warn is acceptable only for internal notes |
| Draft-then-approve write-back | Every write previewed and approved | Low-risk field updates such as "last contacted" earned auto-approval after a clean pilot |

## 12. Deliver It in Sixty Minutes

Spend minutes in proportion to risk. The permission model, the claim boundary and the write gate deserve more of the hour than the retrieval stack.

| Minutes | Phase |
|---|---|
| 0–8 | Workflow, decision owner, risk boundary, the five outputs by risk (section 1) |
| 8–15 | Sources and their permission models, the core records (section 3) |
| 15–25 | The end-to-end diagram, precompute versus ask versus write-back (sections 4 and 5) |
| 25–40 | Deep dive: CRM permissions and territory, structured versus semantic, claims and previews (sections 6 to 8) |
| 40–50 | Failure modes, evaluation slices, rollout gates (sections 9 to 11) |
| 50–60 | Close: spoken summary, trade-offs, week one |

The two-minute spoken answer:

> *I would not start with the model. I would start by clarifying the broken B2B sales productivity workflow, who uses the system, what decision they need to make, and what risk we cannot automate. For Sales Copilot for Account Executives, I would design a permission-aware assistant around the workflow: AE prepares for account meeting, asks for account summary, opportunity risks, suggested discovery questions, email drafts, and CRM update suggestions. The architecture would ingest approved sources from systems like Salesforce/HubSpot, Gong/Zoom transcripts, emails/calendar, product docs, pricing/discount policy, customer support history, data warehouse, preserve metadata, freshness, and ACLs, then use hybrid retrieval with permission filtering before generation. The LLM would produce cited answers, show uncertainty, and escalate when evidence is missing or risk is high. Tool use would be allowlisted: read-only tools can run automatically, but any write-back or externally visible action needs preview and human approval. I would evaluate with SME-approved golden cases, citation accuracy, groundedness, permission red-team tests, task completion, latency, and cost. Rollout would be staged: offline prototype, shadow mode, read-only pilot, then limited approved actions with monitoring and rollback. The production goal is not a flashy demo; it is a trusted workflow assistant that is secure, auditable, and measurably improves the business process.*

The lines that carry the round:

1. *"The five outputs sit on three sides of the risk boundary: read-only, draft-only, and approved write-back."*
2. *"The brief is built before the meeting, as the rep, and re-checked at serve time. Precompute is an optimisation, never a permission model."*
3. *"A count that includes a peer's territory is as much a leak as a forbidden document."*
4. *"Risks come from CRM fields and transcripts the system fetched, never from what a typical deal looks like."*
5. *"Every outbound claim traces to an approved-claims entry, and the verifier blocks, it does not warn."*
6. *"Read tools run. Write tools preview, approve, and carry an idempotency key."*
7. *"A 96.7 percent pass rate hid the six cases that mattered. Critical slices pass independently or nothing ships."*
8. *"Fail closed on authorisation and approval. Degrade on everything else."*

The follow-ups arrive in a predictable order.

| Follow-up | Answer |
|---|---|
| What if the model generates a fabricated customer fact? | By design and by test. Every fact in a brief carries a citation to a record or transcript the system fetched; the reasoning layer refuses to fill a missing field from model memory; the claim verifier blocks any outbound claim without an approved source. Test it with a golden set that includes accounts with deliberately sparse records and score groundedness per claim, not per answer. Online, monitor the unsupported-claim rate against baseline |
| How do you stop a rep seeing accounts outside their territory? | Mirror the CRM's sharing model, org-wide defaults, owner, role hierarchy, territory and field-level security, into attributes on every record; compile territory and role into the retrieval pre-filter; re-check on fresh attributes at serve time; invalidate snapshots on any territory change; hold structured counts to the same zero-violation gate |
| Why not let the copilot update the CRM directly? | A CRM write is an externally consequential action. Propose, preview the exact fields, approve, then write through the tool gateway with an idempotency key. After a clean pilot, low-risk fields may earn auto-approval; amounts, stages and closes never do on day one |
| How do you keep answers fast when the CRM is slow? | Precompute the snapshot on the calendar trigger and serve from cache; route common asks deterministically; parallelise the read-only calls that remain; cap agent steps; see section 13 |
| How would you know the eval suite is good enough? | Compare offline pass rates with online failure modes by slice. If a slice is small and critical, it gets its own gate. Add negative examples the model must refuse |

Repair the weak answers on the spot. "RAG with a vector database and ask GPT" becomes a workflow with a risk boundary and permission-aware retrieval. "Sales reps will review the drafts" becomes a claim verifier that blocks, with human review as the second line. "The model is too creative" becomes an eval and launch-gate problem with slice-based gates. "We'll add the CRM write later" becomes a tool gateway designed on day one with preview and approval.
