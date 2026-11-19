---
title: "Proving Business Impact"
subtitle: "Watch technical, product and business signals, separate the change's effect from everything else that moved, report estimated, released and realised value as three numbers, and recommend continue, expand, redesign or stop."
track: Discovery, Scoping and Delivery
module_group: Delivery and adoption
module_code: T20.6
module_name: "Adoption, change management and business impact"
lesson: 5
lessons: ["Rolling out with a way back", "Training and champions", "Measuring trust and overrides", "Diagnosing low adoption", "Proving business impact", "Practise adoption and value"]
level: intermediate
reading_time: "20 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "19 November 2026"
tags: [business impact, metrics, wrap-up report, baseline, comparison group, realised savings, override rate, recommendation]
---

## Start with the slide-deck saving

Caverly Logistics, a parcel carrier, runs an assistant its FDE built to draft fixes for failed deliveries at two of its three depots. The business case promised £480,000 a year. Six months after launch the sponsor's board slide said "£240,000 saved so far", and the finance director asked the FDE where the money was. Headcount had not changed and the budget line was almost the same. Two other things had moved in those six months: a large retail customer had added address checks at its checkout, which cut the slowest kind of exception, and the team had hired four new starters. The £240,000 was half the yearly estimate, written as if it had happened. Call this **the slide-deck saving**: a projected saving reported as a realised one.

> **What you'll learn**
>
> - Watch technical, product and business signals rather than infrastructure alone.
> - Write a wrap-up that compares the result with the original target and names the next bottleneck.
> - Separate the change's effect from everything else that moved, using a comparison group.
> - Report estimated savings, released capacity and realised cash as three labelled numbers, and correct projected savings presented as real.
> - Track whether trust lasts after handover, and recommend continue, expand, redesign or stop.

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

## Worked example: writing the Northwind wrap-up

Northwind's success metrics were set in writing at intake:

- First-response time under 5 minutes on the top three ticket categories.
- Zero-edit sends on 60% of eligible tickets by week 4.

A wrap-up built on this lesson reports each metric against its target, not against zero. It adds the product signal, such as how many eligible tickets used the drafts at all. It reports the override rate's trend and week-4 retention once measured. It closes with the largest failure type and the next bottleneck.

If zero-edit sends reached 45% rather than 60%, the report says so and explains which ticket categories held it back. The figure of 45% is hypothetical. The shape of the report is the point.

## Comparing against a baseline when other things changed

A **baseline** is the process measured before the change, by the method you use afterwards. The site's [baselines, value and ROI](../T6.2_Scoping_an_FDE_Project/08_Baselines_Value_and_ROI.md) lesson covers building one. After launch, the harder problem is that the world keeps moving. Volume, case mix, staffing and policy all change, and each moves the numbers.

Caverly's handling time at the two tool depots fell from 9.0 to 6.0 minutes per exception. The third depot, still without the tool, also fell, from 9.0 to 8.0 minutes, because the checkout change cut slow address exceptions everywhere. The fall that the tool explains is the difference between the two changes:

| Group | Before | After | Change |
| --- | --- | --- | --- |
| Tool depots | 9.0 minutes | 6.0 minutes | −3.0 |
| Comparison depot | 9.0 minutes | 8.0 minutes | −1.0 |
| Effect of the tool | Tool change minus comparison change | −3.0 − (−1.0) | −2.0 |

*Table 2: A difference-in-differences estimate. The comparison depot absorbs the checkout change that affected every depot.*

This method, **difference-in-differences**, assumes both groups would have moved in parallel without the change. Check that by comparing their trends for several months before launch.

Three more habits protect the comparison:

- **Measure per unit.** Minutes per exception, not team hours. Headcount changes, such as Caverly's new starters, then do not distort the result.
- **Split by case type.** If the mix shifts toward easy cases, an average can fall while no type got faster. Compare type by type, then reweight to the old mix. The reverse can happen too, a pattern known as Simpson's paradox.
- **Write down every other change** in the period, with its date, and say which ones the comparison controls for.

## Estimated, released and realised

With the effect isolated, three numbers remain, and they are often confused:

- **Estimated saving.** The effect multiplied by volume and cost. Caverly: 2.0 minutes × 1,200 exceptions a day × 250 working days is 10,000 hours a year, or £320,000 at a loaded cost of £32 an hour. Over six months, 5,000 hours and £160,000.
- **Released capacity.** Hours that management removed or moved on purpose. Caverly cut 250 agency hours and 150 overtime hours a month, 2,400 hours over six months.
- **Realised cash.** Money that left a budget line. The cut agency hours cost £28 each and the overtime £40, so six months saved £78,000. After the tool's running cost of £6,000 a month, the net is £42,000.

The switcher sets the three side by side.

<div class="learning-widget evidence-switcher" id="value-switcher">
<p class="widget-intro">Caverly, six months after launch. Pick a view to see what each number means and who can rely on it.</p>
<div class="mode-controls" hidden role="group" aria-label="Value view">
<button type="button" data-mode="estimated" aria-pressed="false" aria-controls="estimated-result">Estimated</button>
<button type="button" data-mode="released" aria-pressed="false" aria-controls="released-result">Released</button>
<button type="button" data-mode="realised" aria-pressed="false" aria-controls="realised-result">Realised</button>
</div>
<section id="estimated-result" class="mode-panel" data-announcement="Estimated selected. 5,000 hours, worth 160,000 pounds at loaded cost."><h4>Estimated: 5,000 hours, £160,000</h4><ul><li>The tool's effect times volume and loaded cost.</li><li>Real time saved, spread across hundreds of shifts in small pieces.</li></ul><p>Use it to show the tool works. Do not call it money.</p></section>
<section id="released-result" class="mode-panel" data-announcement="Released selected. 2,400 hours removed on purpose."><h4>Released: 2,400 hours</h4><ul><li>Agency and overtime hours management chose to cut.</li><li>The other 2,600 hours went to onboarding the new starters and to slack.</li></ul><p>Use it to show what management did with the time.</p></section>
<section id="realised-result" class="mode-panel" data-announcement="Realised selected. 78,000 pounds gross, 42,000 pounds net."><h4>Realised: £78,000 gross, £42,000 net</h4><ul><li>Agency and overtime spend that stopped, from the ledger.</li><li>Net of six months' running cost.</li></ul><p>The only number finance can bank.</p></section>
<p class="switch-status" aria-live="polite"></p>
</div>

Figure 2 follows the slide's figure down to the cash.

```mermaid
flowchart TD
  A["Board slide: £240,000 'saved', half the yearly projection"] --> B["Remove the checkout effect: estimated £160,000, 5,000 hours"]
  B --> C["Released on purpose: 2,400 hours"]
  C --> D["Cash from agency and overtime cuts: £78,000"]
  D --> E["Net of running cost: £42,000"]
```

*Figure 2: From the slide to the ledger at Caverly, over six months. Each step is a different claim with a different owner.*

The gap between estimated and released is not failure. It is a decision nobody made. Freed time becomes cash only when someone cuts spend or avoids a hire.

## When projected savings are presented as real

Correct it quickly, privately first, and with a better version in hand. A wrong number on a board slide will be found, and when it is, every other number loses credibility.

1. **Talk to the sponsor before the next meeting.** Explain the difference between projected and realised, without blame.
2. **Bring the three numbers** with their method, agreed with finance, who will be asked anyway.
3. **Relabel, do not delete.** "Projected yearly saving £320,000. Realised to date £42,000 net. Capacity released 2,400 hours."
4. **Add the plan** that turns more of the estimate into cash, with an owner.

## When requirements are met and the outcome did not move

Sometimes every requirement passes and the business metric stays flat. The usual causes are that the tool improved a step that was not the bottleneck, that its output is not used downstream, or that the requirement measured activity rather than the outcome. Trace one case end to end, find where the time or error lives now, and check whether the original target was tied to that step. Report it plainly: delivered to specification, outcome unchanged, and why.

## Track trust and staying power after handover

The two-week delivery framework adds metrics that look past launch day:

- **Time to first value** measures how soon the customer saw something real.
- **The evaluation score at handover** records what was true when responsibility transferred.
- **The human-approval override rate** should fall over time as trust is earned. If it stays flat, the agent is not ready for less supervision.
- **Week-4 retention** asks whether the deployed system is still in use a month later. It stays empty until measured rather than showing a false zero.

A falling override rate needs one check before you relax supervision: spot checks on accepted answers, because people who stop reading also stop overriding. [Measuring trust and overrides](05_Measuring_Trust_and_Overrides.md) covers that. The metrics are taught in full in [Risk Checks and Delivery Metrics](../T6.3_Delivery_Six_Stages_Gates_and_Two_Week_Launch/04_Risk_Checks_and_Delivery_Metrics.md).

## Continue, expand, redesign or stop

The review ends with a recommendation. Base it on the evidence, not on the effort spent.

| Recommendation | When the evidence shows |
| --- | --- |
| Continue | The outcome improved against a fair comparison, net value is positive or on a credible path, and adoption is stable |
| Expand | As for continue, plus the expansion checklist holds and the value scales with the new users |
| Redesign | A real effect exists but is blocked by a fixable cause, such as one case type, a workflow gap or capacity nobody released |
| Stop | No effect after a fair trial, costs exceed any realistic value, or the tool causes harm that cannot be fixed |

*Table 3: Four recommendations and the evidence each needs.*

Caverly's team recommended continuing at both depots and expanding to the third, on one condition: an agreed plan with finance to release capacity as agency contracts renewed. Stopping a tool that works because cash lags is a mistake, and so is expanding a tool whose savings nobody will collect.

## Limits of this lesson

- **Comparison groups are imperfect.** Parallel trends are an assumption. Show the pre-launch trends so readers can judge it.
- **Not all value is cash.** Faster service and fewer errors matter in their own units. Report them as such.
- **Sources of the figures.** The 25-agent pilot figures come from the scoping guide's example. The Northwind 45% figure is hypothetical.
- **Composite engagement.** Caverly Logistics and its figures are illustrative, not a real customer.

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

<details>
<summary>Interview question 4. How do you compare post-launch results with the baseline?</summary>

- **Answer:** Measure the same thing the same way as the baseline, per unit of work. List everything else that changed in the period. Use a comparison group that did not get the change, and take the difference between the two groups' changes. Split by case type so a mix shift does not fake an improvement.
- **Trade-off:** A comparison group delays the benefit for some users. Without one, you cannot separate the tool from the world.
- **Follow-up to expect:** "No comparison group exists." Use the trend before launch, or stagger the rollout to create one.

</details>

<details>
<summary>Interview question 5. Explain estimated savings, released capacity and realised savings.</summary>

- **Answer:** Estimated is the effect times volume and cost: time the tool saves. Released is the hours management removed or moved on purpose. Realised is cash that left a budget line, net of running cost. Each is smaller than the one before, and only the last is money finance can bank. Report all three, labelled.
- **Trade-off:** Three numbers are harder to present than one. One number invites the wrong one.
- **Follow-up to expect:** "How do you turn capacity into cash?" Agree with the customer, before launch, which spend will fall or which hire will be avoided.

</details>

<details>
<summary>Interview question 6. How do you decide whether to continue, redesign or stop?</summary>

- **Answer:** Against criteria agreed before the review. Continue when the outcome improved against a fair comparison, value is positive or on a credible path, and adoption holds. Redesign when an effect exists but a fixable cause blocks it. Stop when a fair trial shows no effect, cost exceeds realistic value, or harm cannot be fixed. Expand only if the checklist holds too.
- **Trade-off:** Stopping wastes the sunk effort. Continuing a failure wastes more.
- **Follow-up to expect:** "The sponsor wants to continue regardless." Record the evidence and the decision, and set a date to review again.

</details>

<details>
<summary>Interview question 7. You met every requirement, but the business outcome did not improve. What happened?</summary>

- **Answer:** The requirements and the outcome have come apart. Common causes: the tool sped up a step that was not the bottleneck, its output is not used downstream, or the requirements measured activity. Trace a case end to end, find where time or error now lives, and report plainly: delivered to specification, outcome unchanged, and the next step.
- **Trade-off:** Admitting it is uncomfortable. Hiding it costs trust when the outcome data arrives.
- **Follow-up to expect:** "How would you prevent it?" Tie each requirement to the outcome metric at scoping.

</details>

<details>
<summary>Interview question 8. The sponsor presented projected savings to the board as realised savings. What do you do?</summary>

- **Answer:** Speak to the sponsor privately before the next meeting, without blame. Bring the three numbers, estimated, released and realised, agreed with finance. Propose relabelling the slide, not deleting it, and add a plan that converts more of the estimate into cash, with an owner.
- **Trade-off:** Correcting a sponsor risks the relationship. A wrong board number, once found, risks the whole programme.
- **Follow-up to expect:** "The sponsor refuses." Make sure finance has the correct figures, and record that you raised it.

</details>

## References

1. Google SRE, [Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/), accessed 18 November 2026. The four golden signals of latency, traffic, errors and saturation, the technical layer of Table 1.
2. Kerry Rodden, Hilary Hutchinson and Xin Fu, Google Research, [Measuring the User Experience on a Large Scale: User-Centered Metrics for Web Applications](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/), accessed 18 November 2026. The HEART framework for mapping product goals to user-centred metrics, the product layer.
3. *Scoping an FDE Project: Complete Guide*, Module 5 Topics 5.2 "Watch the workflow, not just the servers" and 5.4 "Report what changed, not only what shipped", and Module 1 Topic 1.2 (the 12-to-under-5 goal), summarised in our own words. The guide is itself based on the fdehandbook.com "Scope a Project" course.
4. *Gates, Risks and Metrics*, "The five metrics", and interview script, the Northwind success metrics. Taught on the site in [Risk Checks and Delivery Metrics](../T6.3_Delivery_Six_Stages_Gates_and_Two_Week_Launch/04_Risk_Checks_and_Delivery_Metrics.md).
5. Wikipedia, [Difference in differences](https://en.wikipedia.org/wiki/Difference_in_differences), accessed 17 November 2026. The method and its parallel trend assumption.
6. Wikipedia, [Simpson's paradox](https://en.wikipedia.org/wiki/Simpson%27s_paradox), accessed 17 November 2026. How a hidden variable can reverse an overall comparison.
7. The site's [baselines, value and ROI](../T6.2_Scoping_an_FDE_Project/08_Baselines_Value_and_ROI.md) lesson, for building the baseline.
8. The author's own field experience, the basis for the three value numbers and the recommendation table.

## Key takeaways

- Watch technical, product and business signals. Only business signals show the funded problem improved.
- Report the result against the original target, with pilot size, side effects and the next bottleneck, and say plainly when a pilot missed it.
- Measure per unit, list every other change, and use a comparison group to isolate the effect.
- Report estimated savings, released capacity and realised cash as three labelled numbers. Correct a projected saving shown as real, early and privately.
- When requirements pass and the outcome does not, find where the work now waits.
- Track override rate and week-4 retention to see whether trust and use last, and recommend continue, expand, redesign or stop from evidence agreed in advance.

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

<details>
<summary>4. Why is the tool's effect at Caverly 2.0 minutes and not 3.0?</summary>

The comparison depot fell by 1.0 minute without the tool, because of the checkout change. Only the extra 2.0 minutes at the tool depots belong to the tool.

</details>

<details>
<summary>5. Caverly estimated 5,000 hours saved over six months but released 2,400. Is the gap a failure?</summary>

Not of the tool. It is capacity nobody chose to remove. It becomes value only when someone cuts spend, avoids a hire or moves the time to other work on purpose.

</details>

<details>
<summary>6. Why measure minutes per exception instead of total team hours?</summary>

Team hours move with headcount, such as Caverly's four new starters. A per-unit measure stays comparable when staffing changes.

</details>
