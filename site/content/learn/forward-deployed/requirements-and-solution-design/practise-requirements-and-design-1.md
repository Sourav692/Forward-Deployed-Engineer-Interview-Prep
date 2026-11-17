# Practise Requirements and Design, Part 1


## How to use this practice

These questions ask you to produce something: a requirement, a log entry, an architecture or a calculation. Answer aloud as if at a whiteboard, writing the key items down. Then compare with the outline. Part 2 covers technical readiness.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Writing requirements, stories and numeric targets.
> - Logging assumptions and assessing a change.
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

## Architecture

Taught in [from requirements to architecture](/learn/forward-deployed/requirements-and-solution-design/from-requirements-to-architecture).

<details>
<summary>Practice question 7. Design the architecture for an intake service that receives customer documents by email, web upload and partner API.</summary>

- **Answer:** Three entry points feed one intake queue, each writing the same record shape with a source tag. A worker scans files for malware, extracts metadata and stores files in object storage with the record in a database. Duplicates are caught by a hash of the file and sender. Downstream systems subscribe to an "accepted" event. Failed items go to a review queue with an owner.
- **Trade-off:** One queue simplifies processing but mixes priorities. Add a priority field if partner documents have a tighter deadline.
- **Follow-up to expect:** "Email volume spikes at month end." The queue absorbs it, and workers scale on queue depth.

</details>

<details>
<summary>Practice question 8. For each of these needs, pick an integration pattern: a price check during checkout, order submission to a supplier, a daily sales total, and stock changes that three systems need.</summary>

- **Answer:** Price check: synchronous, because the user waits and it must be fast, with a cache. Order submission: queued, because it must not be lost and the supplier may be slow. Daily sales total: batch, overnight. Stock changes: events, because several systems react and the sender should not call each one.
- **Trade-off:** Four patterns mean more to operate. Forcing one pattern everywhere makes some needs slow or fragile.
- **Follow-up to expect:** "The supplier wants synchronous calls." Keep the queue on our side and call them synchronously from the worker.

</details>

<details>
<summary>Practice question 9. A service receives 40 requests a second and each takes 1.5 seconds. How many workers do you need, and what else do you check?</summary>

- **Answer:** Little's law: 40 × 1.5 = 60 requests in flight on average, so at least 60 concurrent workers, plus headroom, say 80. Then check the peak rate, not the average, whether the 1.5 seconds rises under load, and whether any downstream limit caps us below 40 a second.
- **Trade-off:** Headroom costs idle capacity. Without it, a small burst queues every request.
- **Follow-up to expect:** "Response time doubles at peak." Then in-flight requests double too, to 120 at the same rate.

</details>

## Key takeaways

- A good story names a real user, a specific need and the reason.
- Numeric targets need a measure, a load and a check.
- Log assumptions with owners and dates, and assess every change before agreeing it.
- Pick the pattern per need, and size workers with Little's law plus headroom.

## Check yourself

<details>
<summary>1. In practice question 3, why accept 188 invoices instead of rejecting the batch?</summary>

The clerk only has to fix the 12 failures. Rejecting all 200 for a few bad files wastes the work on the good ones.

</details>

<details>
<summary>2. In practice question 9, what happens to in-flight requests if response time doubles?</summary>

They double, from 60 to 120 at the same arrival rate, so the worker pool must grow or requests will wait.

</details>
