# Practise Partner APIs and Bulk Transfer


## How to use this practice

These questions ask you to change a partner API safely or to plan a large transfer from a short brief. Answer aloud as if at a whiteboard. For API changes, say what partners see and when. For transfers, work through the numbers before you describe the design. Then compare with the outline. The concept questions sit in each lesson's Interview angle.

Give yourself five minutes for each question before opening the outline.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Classifying a change to a partner API and shipping it without breaking anyone.
> - Running a deprecation when a large partner is late.
> - Protecting an integration from a partner's API changes.
> - Planning a bulk transfer with batches, a concurrency cap and checkpoints, and proving it complete.

## Changing a partner API

Taught in [an API partners build against](/learn/enterprise-integration/partner-apis-and-bulk-transfer/an-api-partners-build-against).

<details>
<summary>Practice question 1. Huxley Freight's tracking API returns a shipment `status` with five values. Operations want a sixth, "held at customs". Two partners are known to reject unknown values. How do you ship it?</summary>

- **Answer:** A new enum value is additive in shape but breaks strict readers, so treat it with care. Check the documentation: if it never promised a closed list, add a sentence now that new values may appear. Contact the two strict partners first with a date and sandbox examples. For the rest, announce it in the changelog with a few weeks' notice. Until the date, send the new state as a new optional field, such as `customs_hold: true`, alongside the nearest existing status. On the date, start returning the new value.
- **Trade-off:** The interim field is extra surface to retire later. Shipping the value at once is simpler but breaks two partners.
- **Follow-up to expect:** "A third partner breaks anyway." Roll the value back behind a per-partner setting while they fix their reader.

</details>

<details>
<summary>Practice question 2. Morwenna Clinics is retiring version 1 of its appointments API in two months. One partner, which sends 60% of all bookings, has not started migrating. What do you do?</summary>

- **Answer:** Find out why before deciding anything. Call their technical contact. If version 2 lacks something they need, that is a gap to fix, not a delay to punish. If their project is stalled, agree a dated extension in writing for that partner only, and keep the date for everyone else. Offer an engineer for a week to pair with them. Measure their version 1 traffic weekly. Do not remove version 1 while 60% of bookings depend on it. That is an outage for patients, not a cleanup.
- **Trade-off:** An extension keeps version 1 running and signals that dates can move.
- **Follow-up to expect:** "Other partners ask for extensions too." Each gets the same test: a reason, a date and evidence of progress.

</details>

<details>
<summary>Practice question 3. Quantock Insurance's claims assistant reads vehicle values from a partner's valuation API. One morning valuations rise by about 20%. The partner has started including VAT (value added tax) without notice. What do you do now, and what do you change?</summary>

- **Answer:** Now: stop using affected valuations in claim decisions, flag claims valued since the change, and contact the partner to confirm. Correct the values by removing VAT if the partner confirms the rule, and re-run the flagged claims. Then change three things. Wrap the partner in one adapter that converts to your own model. Run a daily contract test against their sandbox with known vehicles and expected values. Alert on sudden shifts in the average valuation. Ask the partner for a written stability policy.
- **Trade-off:** Pausing decisions slows claims for a day, against paying out on wrong values.
- **Follow-up to expect:** "They say it was always meant to include VAT." Then your documentation of their contract is what settles it, so keep it.

</details>

## Moving large datasets

Taught in [moving large datasets](/learn/enterprise-integration/partner-apis-and-bulk-transfer/moving-large-datasets).

<details>
<summary>Practice question 4. Rowsley Lettings must move 800,000 tenancy records into a partner's platform. The partner offers an asynchronous bulk job: submit up to 10,000 records, poll for completion, then download per-item results. At most two jobs may run at once, and a job takes about 4 minutes. Plan the transfer.</summary>

- **Answer:** Read the source by tenancy ID with a cursor, 10,000 a job, so 80 jobs. With two at a time and 4 minutes each, that is 40 rounds, about 160 minutes. Record each job's ID range and status in a checkpoint table. When a job completes, download its results before marking it done. Upserts keyed on the tenancy ID make a resubmitted job harmless. Sort failures: retryable ones into a later job, permanent ones onto a review list. Then run a change pass from the start time and compare counts per ID range.
- **Trade-off:** Larger jobs mean fewer rounds but more to redo if one fails as a whole.
- **Follow-up to expect:** "A job fails entirely." Resubmit that range alone. The checkpoint shows which.

</details>

<details>
<summary>Practice question 5. Tolverne Outdoor sent 2,000,000 product records to a marketplace overnight. The marketplace reports 1,972,000. The script logged only "done". How do you find the gap, and what would you build next time?</summary>

- **Answer:** Fetch the marketplace's list of product IDs, page by page with a cursor, and compare it with the source in ID ranges of 100,000. The ranges with shortfalls show where to look. Within them, compare IDs directly. Re-send missing products as upserts and read any per-item errors. Next time: record a result for every record, sort failures into retryable and permanent, keep a checkpoint at the low-water mark, and finish with per-range counts and a field-by-field sample before reporting done.
- **Trade-off:** Fetching every ID back is a large read, but it is the only proof without per-item records.
- **Follow-up to expect:** "Most missing ones failed validation." Put them on a review list for the product team with the marketplace's reasons.

</details>

## Key takeaways

- Classify every partner API change by what strict and tolerant readers will do with it.
- Run deprecations per partner when needed, with dates and evidence.
- On the consumer side, wrap a partner in one adapter and test their sandbox daily.
- Plan a bulk transfer from the numbers: batch size, concurrency and time per call.
- Never report a transfer complete without per-range counts and a review list.

## Check yourself

<details>
<summary>1. In practice question 1, why is a new enum value not always additive?</summary>

Readers that reject unknown values break when it appears. It is additive only for clients that read tolerantly.

</details>

<details>
<summary>2. In practice question 4, why download a job's results before marking it done?</summary>

The results show which records failed. Marking the job done first would lose them if the process stopped.

</details>
