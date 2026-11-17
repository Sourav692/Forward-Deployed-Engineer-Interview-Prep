# Practise Customer Data Pipelines


## How to use this practice

These questions ask you to design part of a pipeline from a short brief. Answer aloud as if at a whiteboard, sketch the tables or the flow, and work through the numbers. Then compare with the outline. The backfill question sits in the [backfills while live](/learn/fde-building-in-the-estate/customer-data-pipelines/backfills-while-live) lesson's Interview angle.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Designing an incremental read that survives tied timestamps.
> - Deciding a match when the evidence conflicts.
> - Keeping daily totals right when late data arrives twice.

## Incremental loads

Taught in [incremental loads and watermarks](/learn/fde-building-in-the-estate/customer-data-pipelines/incremental-loads-and-watermarks).

<details>
<summary>Practice question 1. Lowther Grocers' stock-movements table stores <code>updated_at</code> to the second, and a stock count can write 2,000 rows in the same second. Your sync reads 5,000 rows per page. Design the incremental read.</summary>

- **Answer:** Order by `updated_at` and then the movement ID, and save both as the checkpoint. Each page reads rows whose pair is greater than the saved pair, so a page that ends inside a tied second continues from the right row. Start each run 10 minutes behind the checkpoint to catch late commits, and upsert by movement ID so re-read rows change nothing. Write the page, then save the checkpoint. Reconcile daily counts per store against the source to catch deletes and anything missed.
- **Trade-off:** The lookback re-reads rows every run, which costs source load. A shorter window risks missing long transactions.
- **Follow-up to expect:** "Can you not use `>=` on the timestamp alone?" It re-reads the whole tied second every page, and with 2,000 ties and upserts it works but repeats work. The composite cursor is exact.

</details>

## Entity resolution

Taught in [duplicates and entity resolution](/learn/fde-building-in-the-estate/customer-data-pipelines/duplicates-and-entity-resolution).

<details>
<summary>Practice question 2. At Kilbride Energy, a CRM account and a meter-registry record share an email and a mobile number. The names differ ("J. Harper" and "Joanne Harper-Lee"), the supply addresses differ, and the registry has no date of birth. Should they merge?</summary>

- **Answer:** Not automatically. The shared email and mobile are strong agreements, the names may be one person after marriage, and the missing date of birth gives no evidence either way. But different supply addresses could mean one customer with two properties, such as a landlord, which must stay two accounts linked to one person. Score it into the review band. The reviewer sees both records and recent bills side by side. Record the decision as a reversible link, never a merge of billing accounts.
- **Trade-off:** Review costs staff time. A wrong automatic merge can send one person's bill to another address.
- **Follow-up to expect:** "There are 8,000 of these." Sample 200, measure how reviewers decide, and add rules for the common patterns, such as one person with several properties.

</details>

## Late and repeated data

Taught in [schema drift and late data](/learn/fde-building-in-the-estate/customer-data-pipelines/schema-drift-and-late-data).

<details>
<summary>Practice question 3. Norland Rail's on-train card terminals upload sales when they get signal. Some sales arrive two days late, and a terminal that times out mid-upload sends its whole batch again. How do you keep daily revenue right?</summary>

- **Answer:** Store each sale by event time, not arrival time. Deduplicate on terminal ID plus the terminal's sequence number against every sale in the last seven days of event time, which covers the two-day lateness with margin. Publish each day as provisional the next morning and final on day three. A sale arriving after final goes into the current period as a labelled adjustment. Reconcile the final day against the card acquirer's settlement file.
- **Trade-off:** A seven-day deduplication window costs more lookups than one night's. A shorter one counts replays twice.
- **Follow-up to expect:** "The terminal reuses sequence numbers after a reset." Add the reset count or the batch's start time to the key, and ask the vendor how resets are marked.

</details>

## Key takeaways

- A composite cursor of timestamp and key handles ties exactly. A lookback and upserts handle late commits.
- Conflicting evidence goes to review, and accounts with money attached are linked, never merged.
- Store late data by event time, deduplicate across the whole lateness window, and label provisional days.

## Check yourself

<details>
<summary>1. In practice question 1, why does the checkpoint hold the movement ID as well as the timestamp?</summary>

With 2,000 rows in one second and pages of 5,000, a page can end inside the tied second. The ID says where inside it to continue.

</details>

<details>
<summary>2. In practice question 3, why must the deduplication window be longer than two days?</summary>

A replayed batch can arrive up to two days after its first copy. A shorter window would not hold the first copy to compare against.

</details>
