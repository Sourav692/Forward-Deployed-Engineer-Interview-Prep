# Define Working With SLIs and SLOs

*An AI system can be up, fast and wrong. If your objectives only cover the first two, your dashboards will be green on the day users give up.*

◷ 7 min

[Production Monitoring: Metrics, Drift, and SLOs](04_Production_Monitoring_Metrics_Drift_and_SLOs.md) sets latency targets on the right percentiles. Latency is one layer of "working". For an AI system, working also means the integration calls succeed, the workflow finishes, the user gets what they came for, and the answer is grounded and safe. This lesson defines objectives across all of those layers, ties them to an error budget that changes behaviour, and links them back to the offline evaluations that predicted them.

**Objectives:**

- distinguish an SLI, an SLO and an SLA;
- choose indicators across five layers, from infrastructure to AI quality;
- set outcome-based objectives such as task completion and unsafe-action rate;
- write an error-budget policy and link production signals to offline evaluation.

---

## Separate the Three Terms

- A **service level indicator (SLI)** is a measurement: the share of requests answered within 3 seconds, the share of tasks completed.
- A **service level objective (SLO)** is a target for an indicator over a window: 99% of requests within 3 seconds over 28 days.
- A **service level agreement (SLA)** is a promise to a customer, with consequences if missed, such as service credits.

SLOs are internal and should be stricter than any SLA, so you notice trouble before a contract does. An SLO also needs a window. "95% grounded" means nothing until you say over which period and which traffic.

## Measure Working in Five Layers

| Layer | Example SLI | What a failure here looks like |
|---|---|---|
| Infrastructure | Availability, p95 latency, error rate | The service is down or slow |
| Integration | Success rate of calls to each tool and API, by version; auth failures | The CRM rejects calls after a token change |
| Workflow | Share of runs that reach the final step; duplicate side effects | Runs stall at the approval step, or refunds post twice |
| Product outcome | Task completion; escalation to a human; repeat contact within a day | Users finish the chat but call support anyway |
| AI quality | Grounded-answer rate on sampled traffic; refusal rate; unsafe-action rate | Answers sound right and cite the wrong policy |

Infrastructure SLOs come free with most platforms. The bottom three layers are the ones that tell you whether the system is useful, and they need deliberate instrumentation. A sampled, judged grounded-answer rate is more work than an error counter. It is also the only signal that catches a fluent wrong answer.

## Choose Outcome SLOs Carefully

Outcome indicators are the hardest to define, because "the user got what they needed" is not logged anywhere. Use proxies and say what they are:

- **Task completion:** the workflow reached its intended end state, such as a refund issued or a ticket resolved, not just "the chat ended".
- **Escalation rate:** the share of conversations handed to a person. Too high means the system is not helping. Near zero may mean it is not escalating when it should.
- **Repeat contact:** the same user returning about the same issue within a day suggests the first answer failed.
- **Unsafe-action rate:** actions blocked by policy, or reversed after the fact, per thousand runs. Its target is close to zero and it pages someone.

Thumbs-up and thumbs-down buttons are weak on their own. Few users press them, and a thumbs-down can mean "wrong", "slow" or "I did not like the policy". Pair them with completion and repeat contact before drawing conclusions.

## Spend an Error Budget

An SLO of 99% task completion leaves a 1% **error budget**: the failures you can afford in the window. The budget is useful only if spending it changes what the team does. Write the policy before you need it:

- **Budget healthy:** ship changes at the normal pace.
- **Half spent in the first week:** slow down, and review each release with the owner.
- **Budget exhausted:** freeze feature releases for this system. Only reliability fixes ship until the indicator recovers.

Name the work that stops. "We will be careful" is not a policy. "Prompt and model changes stop until grounded rate is back above 93% for seven days" is.

## Link Production Back to Offline Evaluation

Observability shows what happened. Evaluation judges whether it was good. They answer different questions, and the system needs both joined together.

- **Stamp versions everywhere.** Every trace carries the prompt, model, policy and index version, as [The Run Trace](02_The_Run_Trace.md) describes. Every offline result carries the same.
- **Compare like with like.** When production grounded rate falls, check whether the offline score for the same version predicted it. If offline said 95% and production shows 88%, the golden set no longer matches real traffic.
- **Feed failures back.** Turn sampled production failures into new golden cases with stable case IDs. The next release is then measured against the traffic that broke the last one.

## Worked Example: SLOs for a Claims Assistant

A claims assistant helps customers file insurance claims.

- **Infrastructure:** 99.5% availability and p95 time-to-first-token under 1.5 seconds, over 28 days.
- **Integration:** 99% success on calls to the policy system, measured per client version.
- **Workflow:** 97% of started claims reach "submitted" or a deliberate hand-off. Zero duplicate submissions.
- **Outcome:** repeat contact within 24 hours under 8%.
- **AI quality:** 92% grounded answers on 200 judged samples a day. Unsafe actions under 1 per 10,000 runs, paging on any occurrence.

In week two, the grounded rate drops to 89%. The traces show all failing samples used index version `claims-idx-41`, built the day before. The offline score for that index was 94%, but the golden set had no cases on a newly added product line. The team rolls back the index, adds twenty cases for the new product, and the error-budget policy pauses prompt changes until the rate holds above 92% for a week.

---

## Key Takeaways

- An SLI is a measurement, an SLO is a target over a window, and an SLA is a contractual promise. Keep SLOs stricter than SLAs.
- Measure working in five layers: infrastructure, integration, workflow, product outcome and AI quality.
- Outcome SLOs use proxies such as task completion, escalation, repeat contact and unsafe-action rate. Thumbs alone are too ambiguous.
- An error budget matters only with a written policy that names the work that stops.
- Join production and offline evaluation through versions and case IDs, and turn production failures into new golden cases.

## Check Yourself

1. **Why are infrastructure SLOs not enough for an AI system?**
   The service can be available and fast while giving wrong or unsafe answers. Only workflow, outcome and AI-quality indicators catch that.

2. **What makes an error budget more than a number?**
   A written policy that says what changes when it is spent, such as freezing prompt and model releases until the indicator recovers.

3. **Production grounded rate is 88% but the offline score for the same version was 95%. What does that suggest?**
   The golden set no longer represents real traffic. Find the failing cases in traces, add them to the set, and re-measure.

## References

**Sources:** written for this site. It builds on [Production Monitoring: Metrics, Drift, and SLOs](04_Production_Monitoring_Metrics_Drift_and_SLOs.md) and [The Run Trace](02_The_Run_Trace.md). The SLI, SLO and error-budget definitions follow Google's *Site Reliability Engineering* book (2016). The worked example's figures are illustrative.
