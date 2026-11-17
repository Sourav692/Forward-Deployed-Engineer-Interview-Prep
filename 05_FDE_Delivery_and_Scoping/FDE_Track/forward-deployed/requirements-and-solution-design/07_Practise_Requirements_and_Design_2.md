---
title: "Practise requirements and design, part 2"
subtitle: "Eleven practice questions on technical readiness: legacy systems, real data, access delays, environments and short experiments."
track: Discovery, Scoping and Delivery
module_group: Discovery and scoping
module_code: T20.3
module_name: Requirements and solution design
lesson: 7
lessons: ["Requirements you can test", "Managing change and scope creep", "Technical readiness before you commit", "From requirements to architecture", "Decision records and design reviews", "Practise requirements and design, part 1", "Practise requirements and design, part 2"]
level: intermediate
reading_time: "16 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "17 November 2026"
tags: [practice, interview, technical readiness, data profiling, legacy systems, customer scenario]
---

## How to use this practice

These questions come up when an interviewer plays a customer whose environment is messier than the brief. Answer aloud in two minutes, then compare. Most ideas come from [technical readiness before you commit](03_Technical_Readiness_Before_You_Commit.md). Part 1 covers requirements and architecture.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Auditing systems, dependencies and the source of truth.
> - Working around legacy systems, scarce experts and slow access.
> - Profiling data and running time-boxed experiments.

## Systems and dependencies

<details>
<summary>Practice question 1. How do you find a project's dependencies and the source of truth for its data?</summary>

- **Answer:** Trace the data the design uses back to where each fact is first recorded, system by system, and name an owner for each. List everything the build needs from someone else: access, data feeds, approvals, other teams' changes, each with a date. Where two systems hold the same fact, the one that records the real event is the source of truth.
- **Trade-off:** Tracing takes a week of conversations. Guessing the source of truth puts a reconciliation problem inside your build.
- **Follow-up to expect:** "The owners disagree." Take it to the sponsor with the evidence of which system records the event.

</details>

<details>
<summary>Practice question 2. The core system is a legacy application, and its only administrator works two days a week. How do you plan?</summary>

- **Answer:** Book their days early and protect them with their manager. Prepare questions so their time goes on what only they know, and record every session as documentation the customer keeps. Do anything that does not need them in between: read exports, profile data, build against a copy. Log their availability as a dependency on the plan.
- **Trade-off:** Leaning on one expert creates a single point of failure. Writing their knowledge down reduces it for everyone.
- **Follow-up to expect:** "They are leaving next month." Raise it with the sponsor now, and make knowledge capture the first task.

</details>

<details>
<summary>Practice question 3. You discover undocumented scripts that run overnight and change the data you plan to read. What do you do?</summary>

- **Answer:** List the scheduled jobs on the server, read each script, and note what it reads and writes and when. Watch one night's run and compare the data before and after. Schedule your reads after the scripts finish, or read from a source they do not touch. Document them for the customer, with an owner.
- **Trade-off:** Reading old scripts is slow. A job that rewrites a table under your integration causes intermittent errors that take longer to find.
- **Follow-up to expect:** "Can you switch them off?" Not without the owner, because something else may depend on them.

</details>

## Access and environments

<details>
<summary>Practice question 4. Data access is delayed by three weeks. What can the team still do?</summary>

- **Answer:** Build against synthetic data shaped like the real schema. Write the tests, the evaluation set questions and the deployment pipeline. Prepare the data-cleaning code from the schema and any sample. Run usability sessions on mock screens. Report the dependency and its new date to the sponsor weekly, with what slips if it moves again.
- **Trade-off:** Synthetic data hides real data problems. Plan a profiling week as soon as access lands.
- **Follow-up to expect:** "Can you use a copy on your laptop?" No. Data stays in the customer's approved environment.

</details>

<details>
<summary>Practice question 5. Everything works in the sandbox. What do you check before trusting it for production?</summary>

- **Answer:** Differences in software versions, data volume and quality, rate limits, permissions, network paths and configuration. Run one small real read against production early, with approval, and compare the results with the sandbox. Many sandboxes have no rate limits and clean data, so production behaves differently.
- **Trade-off:** Early production access needs approvals. Finding the differences at go-live costs more.
- **Follow-up to expect:** "Production access is forbidden before go-live." Ask for a staging copy refreshed from production, masked if needed.

</details>

<details>
<summary>Practice question 6. Your pilot used a clean sample, and the real extract is much worse. What do you do?</summary>

- **Answer:** Profile the real extract: missing values, formats, duplicates and coverage. Size the cleaning work and how much of the pilot result still holds. Re-run the evaluation on a random sample of real data and report the new numbers honestly. Then re-plan with the sponsor: more time for data work, a narrower first release, or both.
- **Trade-off:** Reporting a worse result is uncomfortable. Launching on the clean-sample result fails publicly.
- **Follow-up to expect:** "Who chose the sample?" Find out, and ask for random samples from now on.

</details>

<details>
<summary>Practice question 7. Should you integrate with change events from the source system or with its periodic exports?</summary>

- **Answer:** It depends on how fresh the data must be and what the system offers. Events suit near-real-time needs, if the system emits them reliably. Exports suit daily needs and systems without events. Test before deciding: check whether events exist and arrive reliably over a week, and whether the export schedule meets the freshness requirement.
- **Trade-off:** Events are fresher but need handling for missed or duplicate messages. Exports are simpler but stale between runs.
- **Follow-up to expect:** "Events sometimes go missing." Add a periodic full reconciliation alongside them.

</details>

## Checklists, profiling and experiments

<details>
<summary>Practice question 8. Write a technical readiness checklist for the first week of an engagement.</summary>

- **Answer:** Systems listed with owners and change processes. Accounts and service accounts working. Permissions confirmed at least privilege. Network path tested from where code will run. Rate limits, quotas and export schedules recorded. A real data extract profiled. Sandbox and production differences noted. Source of truth named for each key field. Each item ticked only with evidence.
- **Trade-off:** A checklist can become box-ticking. Requiring evidence keeps it honest.
- **Follow-up to expect:** "What fails most often?" Network paths and service accounts, because they need several teams.

</details>

<details>
<summary>Practice question 9. How do you profile a customer dataset in a day?</summary>

- **Answer:** Get a random sample or the full extract. Count rows by month, site and type to check coverage. Measure missing values per column, distinct values for codes, duplicate keys and impossible values such as negative quantities or end dates before start dates. Compare against what the design assumes, and list the gaps with their size.
- **Trade-off:** A day gives a first view, not every problem. It finds the big gaps before they shape the plan.
- **Follow-up to expect:** "A third of a key field is empty." Check whether the information sits elsewhere, such as free text, before dropping it.

</details>

<details>
<summary>Practice question 10. Design a time-boxed experiment to test incremental sync from a legacy API.</summary>

- **Answer:** Question: does the "modified since" filter return every changed record? Pass criterion, written first: over three nights, it returns all and only the records that differ from a full export. Time box: four days. Method: take a full export each night, run the incremental query, and compare. If it fails, plan a periodic full reconciliation alongside it.
- **Trade-off:** Four days delays the build. A silent sync gap corrupts data for months.
- **Follow-up to expect:** "It misses records edited by a batch job." Combine incremental reads with a weekly full comparison.

</details>

<details>
<summary>Practice question 11. How do you test feasibility and usability at the same time?</summary>

- **Answer:** Run the feasibility experiment on real data, then put its output in front of two or three users within the same time box. Ask them to use it for a real task and watch where they hesitate. Record both results: whether it works technically and whether it helps the decision. Drop ideas that pass one test and fail the other.
- **Trade-off:** Users seeing rough output can lower their confidence. Explain it is an experiment and keep sessions short.
- **Follow-up to expect:** "Users love it but it is not feasible at scale." Look for a narrower version that is.

</details>

## References

1. The site's [technical readiness before you commit](03_Technical_Readiness_Before_You_Commit.md) lesson.
2. The site's [managing change and scope creep](02_Managing_Change_and_Scope_Creep.md) lesson, for the dependency log.

## Key takeaways

- Trace each fact to the system that records the event, and log every dependency with a date.
- Protect scarce experts' time and turn it into documentation.
- Read overnight scripts before integrating with the data they touch.
- Profile real data early, and run experiments with pass criteria written first.

## Check yourself

<details>
<summary>1. In practice question 4, why should data not be copied to a laptop to save time?</summary>

The data must stay in the customer's approved environment. Copying it breaks their controls and their trust.

</details>

<details>
<summary>2. Why combine incremental sync with a periodic full comparison?</summary>

Incremental filters can miss records changed by other processes. The full comparison catches what the filter misses.

</details>
