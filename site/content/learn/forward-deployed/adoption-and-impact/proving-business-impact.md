# Proving Business Impact


## Start with the busy dashboard

Ashby Lettings, a fictional letting agency, closed its tenant-query pilot with a slide that read "Live in 6 branches, 4,100 queries answered, 99.9% uptime". The sponsor asked one question: had tenants waited less for answers? Nobody knew. The team had measured the servers and the clicks, never the waiting time it was hired to cut. The renewal decision slipped by a quarter while they rebuilt the baseline.

Usage is easy to count and looks like success. Delivery is only done when the original problem measurably improved and the team can run the system. Call this **the activity report**: a wrap-up that says what shipped and how busy it was, with no line on what changed.

> **What you'll learn**
>
> - Watch technical, product and business signals rather than infrastructure alone.
> - Write a wrap-up that compares the result with the original target and names the next bottleneck.
> - Use delivery metrics that show trust being earned over time.

## Watch the workflow, not just the servers

Healthy servers do not mean a healthy product, and a busy product does not mean the business moved. Three kinds of signal answer three different questions.

| What is being asked | Kind of signal | Examples |
|---|---|---|
| Is the system up and fast? | Technical | Error rate, speed, queue length, AI timeouts, failed payment notifications |
| Are people getting through the workflow? | Product | Completion rate, drop-off, successful bookings, finished sessions |
| Did the business problem improve? | Business | Time to resolve, support cost, conversion, retention, customer satisfaction |

*Table 1: Three kinds of signal. Only the business row answers the question the project was funded to answer.*

Each layer can look healthy while the one above it fails, as Figure 1 shows.

```mermaid
flowchart LR
  T["Technical: up and fast?"] -->|"green does not prove"| P["Product: workflow completed?"]
  P -->|"green does not prove"| B["Business: problem improved?"]
  B --> R["Wrap-up against the scoped target"]
```

*Figure 1: Technical signals can be green while users abandon halfway, and product signals can be healthy while the business metric has not moved.*

## Report what changed, not what shipped

A good wrap-up compares the outcome with the original target and names the next bottleneck. Take a support assistant piloted with 25 agents:

- Median resolution time fell from 12 minutes to 7.
- Escalations stayed within 1 percentage point of normal.
- The largest failure type was outdated policy lookups.
- The next step is therefore automatic knowledge refresh and lookup-quality tests.

Every part of that report does work. The pilot size bounds the claim. The before-and-after figure ties to the scoped goal. The escalation figure shows the gain did not come at a hidden cost. The failure type sets the next piece of work.

Now read the 12-to-7 result against the scoped goal of "under 5 minutes". The pilot improved handling time substantially but did not reach that target. An honest wrap-up says so and names what stands between 7 and 5.

> **Warning: "we deployed it and people are using it" is not evidence of impact.** It reports activity. Delivery is done when the original problem measurably improved and the team can operate the system.

## Track trust and staying power after handover

The two-week delivery framework adds metrics that look past launch day:

- **Time to first value** measures how soon the customer saw something real.
- **The evaluation score at handover** records what was true when responsibility transferred.
- **The human-approval override rate** should fall over time as trust is earned. If it stays flat, the agent is not ready for less supervision.
- **Week-4 retention** asks whether the deployed system is still in use a month later. It stays empty until measured rather than showing a false zero.

A falling override rate needs one check before you relax supervision: spot checks on accepted answers, because people who stop reading also stop overriding. [Measuring trust and overrides](/learn/forward-deployed/adoption-and-impact/measuring-trust-and-overrides) covers that. The metrics are taught in full in [Risk Checks and Delivery Metrics](/learn/forward-deployed/delivery-stages-and-gates/risk-checks-and-delivery-metrics).

## Worked example: writing the Northwind wrap-up

Northwind's success metrics were set in writing at intake:

- First-response time under 5 minutes on the top three ticket categories.
- Zero-edit sends on 60% of eligible tickets by week 4.

A wrap-up built on this lesson reports each metric against its target, not against zero. It adds the product signal, such as how many eligible tickets used the drafts at all. It reports the override rate's trend and week-4 retention once measured. It closes with the largest failure type and the next bottleneck.

If zero-edit sends reached 45% rather than 60%, the report says so and explains which ticket categories held it back. The figure of 45% is hypothetical. The shape of the report is the point.

## Limits of this lesson

- **This lesson reports results. It does not prove cause.** Separating the tool's effect from everything else that changed is taught in [realised versus estimated value](/learn/forward-deployed/adoption-and-impact/realised-versus-estimated-value).
- **The 45% figure and Ashby Lettings are illustrative.** The 25-agent pilot figures come from the scoping guide's example.

## Interview angle

Each answer is an outline to say in about two minutes. Open each question and try it aloud before reading.

<details>
<summary>Interview question 1. Every dashboard is green. How do you know the product is working?</summary>

- **Answer:** Green dashboards answer the technical question only: is it up and fast. I check the product layer next, whether people finish the workflow or drop off, by step. Then the business layer, the metric the project was funded to move, against its baseline. Each layer can be healthy while the one above it fails, so I report all three.
- **Trade-off:** Business metrics are slower and noisier than server metrics. Server metrics alone can hide a product nobody finishes.
- **Follow-up to expect:** "Which one goes in the weekly update?" The business metric against target, with one product and one technical line beneath it.

</details>

<details>
<summary>Interview question 2. Your pilot improved the key number but missed its target. How do you write the wrap-up?</summary>

- **Answer:** Lead with the result against the target, not against zero: for example 12 minutes down to 7, against a goal of under 5. State the pilot size, the side-effect check, such as escalations unchanged, and the largest remaining failure type. Then say what stands between 7 and 5 and the next piece of work to close it. A missed target reported plainly keeps the sponsor's trust.
- **Trade-off:** Plain reporting can make a good pilot look like a miss. Hiding the gap costs more when someone finds it.
- **Follow-up to expect:** "The sponsor wants to present it as a win." Agree on wording that shows both the gain and the gap.

</details>

<details>
<summary>Interview question 3. Which metrics tell you a deployment can run with less supervision?</summary>

- **Answer:** The human-approval override rate trending down over several weeks, confirmed by spot checks that accepted answers are right. The evaluation score holding at or above its handover level. Week-4 retention showing people still use it. If overrides stay flat, keep supervision where it is and find out which cases people correct.
- **Trade-off:** Relaxing supervision early saves reviewer time and risks errors at scale. Keeping it too long wastes the time the tool was meant to save.
- **Follow-up to expect:** "Overrides dropped to near zero overnight. Good news?" Not until spot checks confirm it. A sudden drop often means people stopped reading.

</details>

## References

1. Google SRE, [Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/), accessed 18 November 2026. The four golden signals of latency, traffic, errors and saturation, the technical layer of Table 1.
2. Kerry Rodden, Hilary Hutchinson and Xin Fu, Google Research, [Measuring the User Experience on a Large Scale: User-Centered Metrics for Web Applications](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/), accessed 18 November 2026. The HEART framework for mapping product goals to user-centred metrics, the product layer.
3. `05_FDE_Delivery_and_Scoping/Scoping_An_FDE_Project/Scoping-an-FDE-Project-Complete-Guide.md`, Module 5 Topics 5.2 "Watch the workflow, not just the servers" and 5.4 "Report what changed, not only what shipped", and Module 1 Topic 1.2 (the 12-to-under-5 goal), summarised in our own words. The guide is itself based on the fdehandbook.com "Scope a Project" course.
4. `01_Concept_Tutorials/FDE_Handbook/10_FDE_Delivery_Operating_Model/04_Gates_Risks_Metrics.md`, "The five metrics", and `05_FDE_Delivery_and_Scoping/Delivery_Framework/INTERVIEW_SCRIPT.md`, the Northwind success metrics. Taught on the site in [Risk Checks and Delivery Metrics](/learn/forward-deployed/delivery-stages-and-gates/risk-checks-and-delivery-metrics).

## Key takeaways

- Watch technical, product and business signals. Only business signals show the funded problem improved.
- Report the result against the original target, with pilot size, side effects and the next bottleneck.
- Say plainly when a pilot improved but missed its target, and name what stands in the way.
- Track override rate and week-4 retention to see whether trust and use last beyond launch.

## Check yourself

<details>
<summary>1. Servers are healthy and error rates are low. Why is that not proof the product works?</summary>

Technical signals say nothing about whether users complete the workflow or whether the business metric improved.

</details>

<details>
<summary>2. What four elements make the 25-agent pilot report convincing?</summary>

The pilot size, the before-and-after figure for the goal, the side-effect check on escalations, and the largest failure type with the next step.

</details>

<details>
<summary>3. What does a falling override rate tell you?</summary>

Humans are correcting the agent less often, so trust is being earned and supervision can begin to relax, once spot checks confirm the accepted answers are right.

</details>
