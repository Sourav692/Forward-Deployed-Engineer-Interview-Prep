# Run a Readiness Review

*A release gate answers "did the scores pass?". A readiness review answers "if this goes wrong next Tuesday, will we know, can we stop it, and who decided the risk was worth it?".*

Gates check numbers on every change. Before a significant release (a new system, a new tool that acts, a new customer segment) teams need a wider check: is the system ready to run in production, not just to pass its tests? A readiness review collects the evidence in one pack, reads it as a failure exercise, and ends in a recorded decision. Gaps that remain become explicit release decisions with an owner and an expiry date, instead of risks nobody remembers accepting.

**Objectives:**

- assemble a minimum evidence pack tied to one release version;
- run a readiness checklist across reliability, operability, AI quality, data and release;
- review each scenario as a failure exercise: prevention, detection, user impact, recovery;
- record remaining gaps as release decisions with an owner and an expiry date.

---

## Assemble the Evidence Pack

Everything the review reads should exist before the meeting, tied to the exact version being released: model, prompt, policy, tools, index and code.

- **Spec and scenarios:** what the system must and must not do.
- **Evaluation results:** golden-set scores by stratum, from [Release Gates: Safety, Quality, and Cost](/learn/production-ai/evaluation-and-release-gates/release-gates-safety-quality-and-cost).
- **Threat model and red-team results:** as in [Threat Model Each Request Path](/learn/production-ai/security-tenancy-prompt-injection/threat-model-each-request-path).
- **Operational evidence:** dashboards, alerts and a tested rollback.
- **Runbooks and owners:** who is on call and how to disable each tool.
- **Open gaps:** everything known not to be done.

If an item is missing, the review notes it as a gap. It does not wait for it or pretend it exists.

## Walk the Checklist

| Area | Ready means |
|---|---|
| Reliability | Retries, timeouts and fallbacks are in place for every dependency. Failure of any one dependency has a defined behaviour |
| Operability | Traces cover every step. Alerts fire on the outcome measures. Runbooks exist and someone has followed one |
| AI quality | Each stratum meets its target. Judges are calibrated. Known weak areas are listed |
| Data and side effects | Every action is idempotent and logged. Data retention and deletion work. Access controls are tested per tenant |
| Security | The threat model's top rows have controls. Red-team findings are fixed or accepted |
| Release | Rollout is staged. Rollback is tested and fast. A kill switch exists for each acting tool |

Each row gets one of three marks: met, met with a condition, or not met.

## Review It as a Failure Exercise

A checklist alone invites box-ticking. For the two or three scenarios that matter most, walk through a failure out loud:

1. **Prevention.** What stops this failure from happening?
2. **Detection.** If it happens anyway, which alert or measure shows it, and how fast?
3. **User impact.** What does the user experience while it is happening?
4. **Recovery.** Who acts, what do they do, and how long until users are safe?

Take "the provider returns slow, low-quality answers for an hour". Prevention: none possible. Detection: the p95 latency alert fires within five minutes, but no alert watches answer quality, so a quality drop would go unseen. That is a gap the checklist row "alerts fire on outcome measures" marked as met. The failure exercise found it.

## Turn Gaps Into Release Decisions

Few systems are perfect at launch. The danger is gaps that are silently carried, not gaps themselves. Every open gap becomes a recorded decision with four parts:

- **Risk:** likelihood, impact, how detectable it is and how reversible it is.
- **Decision:** fix before release, release with a mitigation, or accept.
- **Owner:** the person who accepted it, by role.
- **Expiry:** the date by which it must be fixed or reviewed again.

An accepted risk with no expiry becomes permanent by default. An expiry date forces the conversation to happen again.

## Reach a Verdict

The review ends in one of three verdicts, written down with the evidence-pack version:

- **Ready:** all rows met.
- **Ready with conditions:** each condition has an owner and a deadline, and the release may proceed.
- **Not ready:** at least one blocking row, such as a failed safety gate or no tested rollback.

Safety gates are never conditions. A system that leaks another tenant's data is not ready, whatever its other scores.

## Worked Example: Reviewing a Refund Agent

The refund agent from the security lessons is about to go live for all customers.

- **Evidence pack:** version `refund-agent 2.3` with prompt v31, refund policy v14 and model pinned to a specific version. Golden set 94% overall, approval logic 100%, zero leaks.
- **Checklist:** Reliability met. Operability met with a condition, because no alert watches the refund amount distribution. AI quality met. Data met. Security met. Release met.
- **Failure exercise:** "The agent issues many small refunds in a loop." Prevention: per-run spend cap. Detection: nothing specific. Recovery: the kill switch works but nobody would know to use it. This confirms the operability condition.
- **Gap decision:** add an alert on refunds per hour and amount per customer. Risk is medium likelihood, high impact, low detectability and partly reversible. Decision: release with a mitigation. A daily manual check of refund totals runs until the alert ships. Owner: Payments engineering lead. Expiry: two weeks.
- **Verdict:** ready with conditions.

---

## Key Takeaways

- A readiness review checks whether a system is ready to run in production, not only whether its scores passed.
- Assemble an evidence pack tied to one release version before the meeting.
- Walk the checklist across reliability, operability, AI quality, data, security and release.
- Review the top scenarios as failure exercises: prevention, detection, user impact and recovery.
- Every open gap is a release decision with risk, decision, owner and expiry. The verdict is ready, ready with conditions, or not ready, and safety gates are never conditions.

## Check Yourself

<details>
<summary>1. What does a failure exercise find that a checklist misses?</summary>

Gaps between rows. A checklist can mark "alerts exist" as met while no alert watches the failure that matters. Walking prevention, detection, impact and recovery for one scenario exposes it.

</details>

<details>
<summary>2. Why must an accepted gap have an expiry date?</summary>

Without one, the acceptance becomes permanent by default and nobody revisits it. The date forces the risk to be fixed or decided again.

</details>

<details>
<summary>3. Can a failed safety gate be released as a condition?</summary>

No. Safety gates such as cross-tenant leaks block the release. Conditions are for gaps that can be mitigated while the release proceeds.

</details>

## References

**Sources:** Related lessons: [Release Gates: Safety, Quality, and Cost](/learn/production-ai/evaluation-and-release-gates/release-gates-safety-quality-and-cost), [Reliability Is an Evidence System](/learn/production-ai/evaluation-and-release-gates/reliability-is-an-evidence-system) and [Failover, Graceful Degradation, and Kill Switches](/learn/production-ai/scaling-and-reliability/failover-graceful-degradation-and-kill-switches).

