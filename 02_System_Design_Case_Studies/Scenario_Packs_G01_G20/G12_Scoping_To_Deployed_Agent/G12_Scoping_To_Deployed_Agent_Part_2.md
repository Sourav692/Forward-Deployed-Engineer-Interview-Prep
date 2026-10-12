# Scoping Doc to Deployed Agent in Two Weeks, part 2

## 5. Walk the Fourteen Days in Order

The order is not optional. Configuring against unconnected data fails, evaluating against an unsigned golden set proves nothing, and limited production without a tested undo is a gamble. So transitions are a state machine with hard gates, not a checklist.

| Days | Stage | What has to be true to leave it | Northwind evidence in the demo | Signed by |
|---|---|---|---|---|
| 0 | Intake | Measurable metrics, a named SME, named sources; otherwise refused | `case_study.json` accepted | — |
| 1–2 | Scoping and qualification | Metrics written down and measurable; SME assigned; security review started | `scoping_questionnaire.pdf`, `success_metrics_signoff.pdf`; Zendesk and Confluence connectors pulled; "SEC-2026-0142 review report, no blocking findings" | Security reviewer |
| 3–4 | Data readiness | Sources connected; access live and verified, not "requested" | "Read-only Zendesk (OAuth read scope), Confluence (scoped token) and Salesforce (read-only integration user) access verified live"; escalation check runs on day 3 | Customer SME |
| 5–7 | Configure, do not code | Assembled from the library and configured for this customer | Triage prompt, golden-set harness, PII policy pulled; Northwind escalation policy built custom; `golden_set_v1.json` | Customer SME ("golden_set_v1.json reviewed, 40 cases approved") |
| 8–9 | Evaluate and iterate | Golden set signed off as representative; baseline clears the bar | "eval_baseline_report.pdf - 0.83 vs 0.75 agreed baseline" (scripted value, no eval harness run) | FDA |
| 10–11 | Shadow mode | Agent sees real traffic, decides, takes no action; humans compare | 5 shadow approvals, 2 overridden; "rollback_runbook.md - tested in staging, verified <2min" (scripted text, not timed) | FDA |
| 12–13 | Limited production | Agent acts for real with a human approving, and a tested rollback | 6 approvals, 1 overridden; cumulative override rate 0.27 | — |
| 14 | Go/no-go and handover | The day-1 metric was met; runbook, dashboards, owner handed over | "Week-2 metrics: first-response 4m12s, 63% zero-edit sends" (scripted evidence text in the demo, not measured); `handover_runbook.md`, `dashboards_live.url` | Sponsor |

The table's last two evidence columns come from `scripts/run_engagement_demo.py`. Shadow mode and limited production are the same two-step trust ladder as Module 05's `SHADOW` and `LIVE`. Never let a system's first real action also be the first time nobody is watching.

## 6. Make Every Gate a Decision With a Named Authority

A checkbox is a status. A gate is a decision with a named authority behind it.

```
  Naive version:  "security review complete: [x]"     <- a checkbox anyone can tick
  This version:   sign_off(gate, signer, evidence)
                    signer.role must be in gate.allowed_roles   <- deny overrides
                    evidence must be non-empty                  <- "approved" is not evidence
                    every earlier gate must already be PASSED   <- no signing out of order
```

| Gate | Blocks entry to | Signed by |
|---|---|---|
| `security_review_passed` | Data readiness | Security reviewer |
| `data_access_granted` | Configure | Customer SME |
| `golden_set_signed_off` | Evaluate | Customer SME |
| `eval_baseline_met` | Shadow mode | Forward Deployed Architect |
| `rollback_tested` | Limited production | Forward Deployed Architect |
| `success_metrics_met` | Go/no-go, deploy | Executive sponsor |

Three ordered deny rules decide every sign-off, and every attempt is logged, allowed or denied.

| # | Rule | Denies when |
|---|---|---|
| 1 | `wrong_role` | The signer's role is not in the gate's `allowed_roles`, with no exception for seniority |
| 2 | `no_evidence` | An approval has no artefact behind it |
| 3 | `prior_gate_incomplete` | An earlier-stage gate has not passed |

Seniority is not an override, and the reason is the same one that keeps an LLM from enforcing its own access control. The person closest to the work is not automatically the person authorised to certify it is safe.

Two pairs of gates sound alike and check different things, which makes them a favourite follow-up. `security_review_passed` asks whether it is safe to touch this customer's systems at all. `data_access_granted` asks whether the agreed sources actually connected. One is a go-ahead; the other confirms the thing done afterwards worked. `golden_set_signed_off` certifies the exam is fair, judged by the SME who knows the business. `eval_baseline_met` certifies the agent passed it, judged by the FDA. A representative set with a failing score, or a rigorous score against a bad set, both correctly fail.

The Northwind stall answers "are the gates real?" in three rows:

| Who is asking | What actually happened |
|---|---|
| The FDA, wanting to sign off the security gate themselves | Denied, `wrong_role`. Only a security reviewer can sign that gate, however senior the FDA is |
| The customer SME, signing the data-access gate with "looks good" as evidence | Denied, `no_evidence`. An approval with no artefact behind it is not a sign-off |
| Anyone, on day 3, with data access still not granted | The system escalated automatically; nobody had to notice and raise it |

## 7. Refuse at Intake Rather Than Start a Clock

Immeasurable-metric refusal is the cheapest, highest-signal move in the design, so say it before drawing a single box. Intake raises `ScopingRefused` and creates no engagement at all. It is the delivery version of Module 04's refusal to index a document with no usable ACL.

The SME requirement is refused at intake for a structural reason. Two of the six gates need an SME signature, and every later gate waits on them. An engagement with no SME cannot finish, and it is better to know on day 0 than on day 8.

The trade-off has a revisit condition. A strategic customer may be accepted despite the risk. Then intake needs an explicit override path with its own sign-off, never a silent bypass.

## 8. Turn Reuse Into a Number

"Productised process, not bespoke heroics" is the thesis of this problem type, and a thesis on a slide proves nothing. So every asset a stage needs is either pulled from the library or built custom and logged, with no third option.

```
  Every stage needs an asset (a connector, a prompt template, a guardrail policy...)
  Pull it from the library?  -> reused = true
  Not there yet?             -> build it custom, reused = false, LOGGED

  accelerator_reuse_rate = reused pulls / total pulls
```

The library holds connectors, prompt templates, an eval harness, guardrail policies and dashboard templates. By name: `zendesk_connector`, `confluence_connector`, `salesforce_connector`, `support_triage_prompt`, `groundedness_prompt`, `golden_set_harness` ("recall@k / MRR / groundedness / leak-rate harness"), `pii_redaction_policy`, `destructive_action_gate`, `eval_baseline_dashboard`, `cost_attribution_dashboard`.

In the Northwind demo run the rate is 83%: 5 of 6 assets came straight from the library, and one guardrail policy was custom. A rising custom-build count is the early signal that two weeks is about to slip. Tracked across engagements, the ratio says whether the framework works or is quietly turning bespoke again.

Be honest about what the library is not. The entries are named assets, not the connector code or the eval harness. The real harness exists one project over, in the RAG platform, and wiring the Evaluate stage to call it is on the punch list. The gate mechanism is real; the number behind one piece of evidence is not yet.

## 9. Make Risk Mitigations Checks, Not Reminders

A reminder fires only if someone is watching. A check fires anyway, and lands in the permanent event log.

| Risk | Mitigation | How it is enforced | Built? |
|---|---|---|---|
| Data access delays | "Start day 1, escalate day 3" | `check_escalation_triggers()` raises it once if `data_access_granted` is pending on day 3 | Yes |
| Scope creep | Change-control on the signed scope | A `request_scope_change()` requiring the sponsor role, reusing `sign_off()`'s pattern | No, sized as low effort |
| Unmeasurable success criteria | Refuse to start | `intake()` raises `ScopingRefused` | Yes |
| No customer SME | Contractual prerequisite | Also enforced at `intake()` | Yes |

> *"I'd rather show you three of four real and name the honest gap on the fourth than claim all four and get caught on it under a follow-up."*

## 10. Raise the Evidence Bar Behind Each Signature

A gate can be structurally real and still be a rubber stamp. The right role must sign, which is a genuine control. But "does the gate exist" and "what counts as sufficient evidence" are separate questions.

| What a thorough security review should include | Does a generic "security review passed" checkbox prove it happened? |
|---|---|
| Basic output validation | No, a quality check, not a security check |
| Retrieval and tool-selection accuracy | No |
| Task success on real test cases | No, that is the evaluation gate |
| **Adversarial testing: prompt injection, permission-boundary probes** | **This is what a security review should mean, and free-text evidence cannot prove it happened** |
| Ongoing production monitoring | No, continuous, not a gate |

The fix is a checklist, not a sentence. Adversarial testing done, permission boundaries tested and data agreements signed must all be present before the gate passes. That is intake's discipline applied to what a signature attests to.

Three more gaps sit in the delivery process itself, easy to miss because attention is on what gets deployed. The process holds live customer credentials in two windows: when sources first connect, and when the agent first runs against the real environment. Those credentials need a vault, engagement scope and revocation at handover. The golden set built with the SME often contains real customer data, so it follows that customer's sensitivity tier rather than one default. And many engagements at once is a tenancy decision, not only a capacity one: are two customers' gate evidence and test sets separated by a tag or physically?

> *"A gate proving access was granted proves a human attested it's live. It doesn't prove the credentials enabling that access were ever handled safely during the engagement — stored in a vault, scoped only to what this engagement needs, revoked cleanly at handover."*
