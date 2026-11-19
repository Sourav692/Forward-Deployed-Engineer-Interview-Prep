# Practise Requirements and Design


## How to use this practice

These questions ask you to produce something: a requirement, a log entry, a readiness check, an architecture or a calculation. Several come up when an interviewer plays a customer whose environment is messier than the brief. Answer aloud as if at a whiteboard, in about two minutes, writing the key items down. Then compare with the outline. The sections follow the order of the module's lessons.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Writing requirements, stories and numeric targets.
> - Logging assumptions and assessing a change.
> - Auditing systems, access, environments and data, and running time-boxed experiments.
> - Choosing integration patterns and sizing capacity.

## Requirements

Taught in [requirements you can test](/learn/forward-deployed/requirements-and-solution-design/requirements-you-can-test).

<details>
<summary>Practice question 1. A product owner writes: "As a user, I want the system to be easy, so that it works." What is wrong, and how do you fix it?</summary>

- **Answer:** No real user, no specific need and no reason that guides trade-offs. Ask who uses it and for which task, then rewrite: "As a warehouse picker, I want to confirm a pick by scanning the shelf label, so that I do not type codes with gloves on." Add criteria: a scan confirms in under a second, and a wrong shelf shows a clear error.
- **Trade-off:** Rewriting stories takes the product owner's time. Vague stories produce features nobody can accept.
- **Follow-up to expect:** "They have fifty stories like this." Fix the ten for the first release first.

</details>

<details>
<summary>Practice question 2. Write the functional and non-functional requirements for an expense-claim approval service.</summary>

- **Answer:** Functional: an employee submits a claim with receipts; the manager approves or rejects with a reason; claims over £500 also need finance approval; approved claims export to payroll weekly. Non-functional: 95% of pages load within 2 seconds at 300 users; 99.5% monthly availability during working hours; receipts kept 7 years; access by role, every approval logged.
- **Trade-off:** A long list takes a day to agree. Missing the retention and audit lines can fail the first audit.
- **Follow-up to expect:** "Which one changes the design most?" The approval rule over £500, because it adds a second step and a role.

</details>

<details>
<summary>Practice question 3. Write a user story with acceptance criteria for uploading a batch of invoices, including partial failure.</summary>

- **Answer:** Story: as an accounts clerk, I want to upload up to 200 invoices at once, so that month-end entry takes minutes. Criteria: all valid files are accepted and listed; if 12 of 200 fail validation, the 188 are accepted and the 12 are listed with reasons; a re-uploaded file with the same supplier and invoice number is flagged as a duplicate, not created again.
- **Trade-off:** Accepting partial batches means the clerk must fix stragglers. Rejecting the whole batch for one bad file wastes more time.
- **Follow-up to expect:** "What if the upload drops halfway?" The batch resumes from the last accepted file.

</details>

<details>
<summary>Practice question 4. Turn "it must be fast and scale" into numbers for a customer search page.</summary>

- **Answer:** Measure: time from query to results shown. Target: 95% within 800 milliseconds. Load: 150 searches a second at the daily peak, 400 during the yearly sale. Availability: 99.9% of searches succeed each month. Check: a load test at 400 a second before the sale, and monitoring on the 95th percentile.
- **Trade-off:** Designing for the sale peak costs more all year. Scaling up only for the sale needs a tested plan.
- **Follow-up to expect:** "Why 95% and not the average?" The average hides the slow searches users remember.

</details>

## Assumptions and changes

Taught in [managing change and scope creep](/learn/forward-deployed/requirements-and-solution-design/managing-change-and-scope-creep).

<details>
<summary>Practice question 5. Draft four entries for an assumption log on a document-search pilot.</summary>

- **Answer:** One: documents live in two shared drives only; owner, IT lead; check by day 3. Two: documents carry no access restrictions beyond department; owner, security; check by day 5. Three: users search in English only; owner, sponsor; check in the first user session. Four: 30,000 documents or fewer; owner, FDE; check by counting in week one. Each with what breaks if it is wrong.
- **Trade-off:** A log takes minutes per entry. A wrong access assumption can leak documents.
- **Follow-up to expect:** "Which is riskiest?" The access one, because being wrong exposes data, not only time.

</details>

<details>
<summary>Practice question 6. The customer asks to add a second language mid-build. Write the change-impact assessment.</summary>

- **Answer:** What and who: Welsh alongside English, asked by the service director. Why: legal duty for public services in Wales. Cost: 8 days for translation workflow, testing and a second evaluation set, plus translator fees. Moves: go-live by two weeks, or drop the reporting screen to keep the date. Decision: the sponsor, by Friday.
- **Trade-off:** A legal duty is a constraint, so the question is how, not whether. The note still lets the sponsor choose the trade.
- **Follow-up to expect:** "Why was it missed?" Add language to the discovery checklist for public-sector work.

</details>

## Systems and dependencies

Taught in [technical readiness before you commit](/learn/forward-deployed/requirements-and-solution-design/technical-readiness-before-you-commit).

<details>
<summary>Practice question 7. How do you find a project's dependencies and the source of truth for its data?</summary>

- **Answer:** Trace the data the design uses back to where each fact is first recorded, system by system, and name an owner for each. List everything the build needs from someone else: access, data feeds, approvals, other teams' changes, each with a date. Where two systems hold the same fact, the one that records the real event is the source of truth.
- **Trade-off:** Tracing takes a week of conversations. Guessing the source of truth puts a reconciliation problem inside your build.
- **Follow-up to expect:** "The owners disagree." Take it to the sponsor with the evidence of which system records the event.

</details>

<details>
<summary>Practice question 8. The core system is a legacy application, and its only administrator works two days a week. How do you plan?</summary>

- **Answer:** Book their days early and protect them with their manager. Prepare questions so their time goes on what only they know, and record every session as documentation the customer keeps. Do anything that does not need them in between: read exports, profile data, build against a copy. Log their availability as a dependency on the plan.
- **Trade-off:** Leaning on one expert creates a single point of failure. Writing their knowledge down reduces it for everyone.
- **Follow-up to expect:** "They are leaving next month." Raise it with the sponsor now, and make knowledge capture the first task.

</details>

<details>
<summary>Practice question 9. You discover undocumented scripts that run overnight and change the data you plan to read. What do you do?</summary>

- **Answer:** List the scheduled jobs on the server, read each script, and note what it reads and writes and when. Watch one night's run and compare the data before and after. Schedule your reads after the scripts finish, or read from a source they do not touch. Document them for the customer, with an owner.
- **Trade-off:** Reading old scripts is slow. A job that rewrites a table under your integration causes intermittent errors that take longer to find.
- **Follow-up to expect:** "Can you switch them off?" Not without the owner, because something else may depend on them.

</details>

## Access and environments

Taught in [technical readiness before you commit](/learn/forward-deployed/requirements-and-solution-design/technical-readiness-before-you-commit).

<details>
<summary>Practice question 10. Data access is delayed by three weeks. What can the team still do?</summary>

- **Answer:** Build against synthetic data shaped like the real schema. Write the tests, the evaluation set questions and the deployment pipeline. Prepare the data-cleaning code from the schema and any sample. Run usability sessions on mock screens. Report the dependency and its new date to the sponsor weekly, with what slips if it moves again.
- **Trade-off:** Synthetic data hides real data problems. Plan a profiling week as soon as access lands.
- **Follow-up to expect:** "Can you use a copy on your laptop?" No. Data stays in the customer's approved environment.

</details>

<details>
<summary>Practice question 11. Everything works in the sandbox. What do you check before trusting it for production?</summary>

- **Answer:** Differences in software versions, data volume and quality, rate limits, permissions, network paths and configuration. Run one small real read against production early, with approval, and compare the results with the sandbox. Many sandboxes have no rate limits and clean data, so production behaves differently.
- **Trade-off:** Early production access needs approvals. Finding the differences at go-live costs more.
- **Follow-up to expect:** "Production access is forbidden before go-live." Ask for a staging copy refreshed from production, masked if needed.

</details>

<details>
<summary>Practice question 12. Your pilot used a clean sample, and the real extract is much worse. What do you do?</summary>

- **Answer:** Profile the real extract: missing values, formats, duplicates and coverage. Size the cleaning work and how much of the pilot result still holds. Re-run the evaluation on a random sample of real data and report the new numbers honestly. Then re-plan with the sponsor: more time for data work, a narrower first release, or both.
- **Trade-off:** Reporting a worse result is uncomfortable. Launching on the clean-sample result fails publicly.
- **Follow-up to expect:** "Who chose the sample?" Find out, and ask for random samples from now on.

</details>

<details>
<summary>Practice question 13. Should you integrate with change events from the source system or with its periodic exports?</summary>

- **Answer:** It depends on how fresh the data must be and what the system offers. Events suit near-real-time needs, if the system emits them reliably. Exports suit daily needs and systems without events. Test before deciding: check whether events exist and arrive reliably over a week, and whether the export schedule meets the freshness requirement.
- **Trade-off:** Events are fresher but need handling for missed or duplicate messages. Exports are simpler but stale between runs.
- **Follow-up to expect:** "Events sometimes go missing." Add a periodic full reconciliation alongside them.

</details>

## Checklists, profiling and experiments

Taught in [technical readiness before you commit](/learn/forward-deployed/requirements-and-solution-design/technical-readiness-before-you-commit).

<details>
<summary>Practice question 14. Write a technical readiness checklist for the first week of an engagement.</summary>

- **Answer:** Systems listed with owners and change processes. Accounts and service accounts working. Permissions confirmed at least privilege. Network path tested from where code will run. Rate limits, quotas and export schedules recorded. A real data extract profiled. Sandbox and production differences noted. Source of truth named for each key field. Each item ticked only with evidence.
- **Trade-off:** A checklist can become box-ticking. Requiring evidence keeps it honest.
- **Follow-up to expect:** "Which items slip first?" Network paths and service accounts, because they need several teams.

</details>

<details>
<summary>Practice question 15. How do you profile a customer dataset in a day?</summary>

- **Answer:** Get a random sample or the full extract. Count rows by month, site and type to check coverage. Measure missing values per column, distinct values for codes, duplicate keys and impossible values such as negative quantities or end dates before start dates. Compare against what the design assumes, and list the gaps with their size.
- **Trade-off:** A day gives a first view, not every problem. It finds the big gaps before they shape the plan.
- **Follow-up to expect:** "A third of a key field is empty." Check whether the information sits elsewhere, such as free text, before dropping it.

</details>

<details>
<summary>Practice question 16. Design a time-boxed experiment to test incremental sync from a legacy API.</summary>

- **Answer:** Question: does the "modified since" filter return every changed record? Pass criterion, written first: over three nights, it returns all and only the records that differ from a full export. Time box: four days. Method: take a full export each night, run the incremental query, and compare. If it fails, plan a periodic full reconciliation alongside it.
- **Trade-off:** Four days delays the build. A silent sync gap corrupts data for months.
- **Follow-up to expect:** "It misses records edited by a batch job." Combine incremental reads with a weekly full comparison.

</details>

<details>
<summary>Practice question 17. How do you test feasibility and usability at the same time?</summary>

- **Answer:** Run the feasibility experiment on real data, then put its output in front of two or three users within the same time box. Ask them to use it for a real task and watch where they hesitate. Record both results: whether it works technically and whether it helps the decision. Drop ideas that pass one test and fail the other.
- **Trade-off:** Users seeing rough output can lower their confidence. Explain it is an experiment and keep sessions short.
- **Follow-up to expect:** "Users love it but it is not feasible at scale." Look for a narrower version that is.

</details>

## Architecture

Taught in [from requirements to architecture](/learn/forward-deployed/requirements-and-solution-design/from-requirements-to-architecture).

<details>
<summary>Practice question 18. Design the architecture for an intake service that receives customer documents by email, web upload and partner API.</summary>

- **Answer:** Three entry points feed one intake queue, each writing the same record shape with a source tag. A worker scans files for malware, extracts metadata and stores files in object storage with the record in a database. Duplicates are caught by a hash of the file and sender. Downstream systems subscribe to an "accepted" event. Failed items go to a review queue with an owner.
- **Trade-off:** One queue simplifies processing but mixes priorities. Add a priority field if partner documents have a tighter deadline.
- **Follow-up to expect:** "Email volume spikes at month end." The queue absorbs it, and workers scale on queue depth.

</details>

<details>
<summary>Practice question 19. For each of these needs, pick an integration pattern: a price check during checkout, order submission to a supplier, a daily sales total, and stock changes that three systems need.</summary>

- **Answer:** Price check: synchronous, because the user waits and it must be fast, with a cache. Order submission: queued, because it must not be lost and the supplier may be slow. Daily sales total: batch, overnight. Stock changes: events, because several systems react and the sender should not call each one.
- **Trade-off:** Four patterns mean more to operate. Forcing one pattern everywhere makes some needs slow or fragile.
- **Follow-up to expect:** "The supplier wants synchronous calls." Keep the queue on our side and call them synchronously from the worker.

</details>

<details>
<summary>Practice question 20. A service receives 40 requests a second and each takes 1.5 seconds. How many workers do you need, and what else do you check?</summary>

- **Answer:** Little's law: 40 × 1.5 = 60 requests in flight on average, so at least 60 concurrent workers, plus headroom, say 80. Then check the peak rate, not the average, whether the 1.5 seconds rises under load, and whether any downstream limit caps us below 40 a second.
- **Trade-off:** Headroom costs idle capacity. Without it, a small burst queues every request.
- **Follow-up to expect:** "Response time doubles at peak." Then in-flight requests double too, to 120 at the same rate.

</details>

## Key takeaways

- A good story names a real user, a specific need and the reason.
- Numeric targets need a measure, a load and a check.
- Log assumptions with owners and dates, and assess every change before agreeing it.
- Trace each fact to the system that records the event, and log every dependency with a date.
- Protect scarce experts' time, and read overnight scripts before integrating with the data they touch.
- Profile real data early, and run experiments with pass criteria written first.
- Pick the pattern per need, and size workers with Little's law plus headroom.

## Check yourself

<details>
<summary>1. In practice question 3, why accept 188 invoices instead of rejecting the batch?</summary>

The clerk only has to fix the 12 failures. Rejecting all 200 for a few bad files wastes the work on the good ones.

</details>

<details>
<summary>2. In practice question 10, why should data not be copied to a laptop to save time?</summary>

The data must stay in the customer's approved environment. Copying it breaks their controls and their trust.

</details>

<details>
<summary>3. Why combine incremental sync with a periodic full comparison?</summary>

Incremental filters can miss records changed by other processes. The full comparison catches what the filter misses.

</details>

<details>
<summary>4. In practice question 20, what happens to in-flight requests if response time doubles?</summary>

They double, from 60 to 120 at the same arrival rate, so the worker pool must grow or requests will wait.

</details>
