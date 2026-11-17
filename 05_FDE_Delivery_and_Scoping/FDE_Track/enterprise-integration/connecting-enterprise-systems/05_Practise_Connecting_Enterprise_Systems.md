---
title: "Practise connecting enterprise systems"
subtitle: "Five practice questions: a CRM-to-ticketing connector, SOAP and SFTP ingestion, a two-way sync, a signed webhook receiver, and recovering a sync that stopped."
track: "Enterprise Integration"
module_group: Connectors
module_code: T22.1
module_name: "Connecting enterprise systems"
lesson: 5
lessons: ["CRM, ERP and ticketing systems", "Authenticating as whom", "Legacy feeds: SOAP, SFTP and CSV", "Rate limits, backlogs and two-way sync", "Practise connecting enterprise systems"]
level: intermediate
reading_time: "11 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "17 November 2026"
tags: [practice, interview, integration, connectors, sync, webhooks]
---

## How to use this practice

These questions ask you to design a connector or recover one from a short brief. Answer aloud as if at a whiteboard. Sketch the systems, name the owner of each field, and work through the numbers. Then compare with the outline. The concept questions sit in each lesson's Interview angle.

The design questions are larger than the lesson questions. Give yourself five minutes for each before opening the outline.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Designing a connector between a customer relationship management (CRM) system and a ticketing system.
> - Ingesting from a SOAP (originally Simple Object Access Protocol) service and an SFTP (SSH File Transfer Protocol) file drop together.
> - Designing a two-way sync and a signed webhook receiver.
> - Recovering a stopped sync and proving the data is complete.

## Designing a connector

Taught in [CRM, ERP and ticketing systems](01_CRM_ERP_and_Ticketing_Systems.md) and [authenticating as whom](02_Authenticating_as_Whom.md).

<details>
<summary>Practice question 1. Trelleck Housing logs tenants' repair requests in its CRM. It wants each request to open a case in its ticketing system, and the case status to show on the tenant's CRM record. Design the connector.</summary>

- **Answer:** Map the fields first. The CRM owns the tenant, the tenancy and the repair description. The ticketing system owns case status and assignee. Status flows back one way only. Read new requests from the CRM's change events, or poll "changed since" every minute with a stored checkpoint. Create each case with the CRM request ID as its external key and upsert by that key. A retry then never opens a second case. Run as a service account with a narrow role, and tag its writes. Check what case creation triggers. The tenant should get one email, not two. Budget calls against both systems' limits. Send failures to a dead-letter queue with an alert, and reconcile open requests against open cases each night.
- **Trade-off:** Events are faster but can be missed. Polling is simpler and self-correcting but adds up to a minute of delay.
- **Follow-up to expect:** "The tenant edits the description after the case opens." Add it to the case as a comment, so the agent's notes are not overwritten.

</details>

## Legacy ingestion

Taught in [legacy feeds: SOAP, SFTP and CSV](03_Legacy_Feeds_SOAP_SFTP_and_CSV.md).

<details>
<summary>Practice question 2. Ambleside Pharmacy Supply wants an assistant that answers questions about orders and stock. Orders come from the finance system's SOAP service. Stock comes as a comma-separated values (CSV) file a wholesaler drops on an SFTP server at about 03:00 each night. Design the ingestion.</summary>

- **Answer:** For orders, generate the client from the saved WSDL (Web Services Description Language) document. Poll for orders changed since a stored checkpoint, page through results, and save the checkpoint only after each page commits. Set timeouts and log faults in full. For stock, agree a marker file with row count and checksum. Claim each file by checksum, check the header and encoding, compare the count, and replace that night's stock through staging in one step. Label answers with their freshness: orders "as of a minute ago", stock "as of the 03:00 file". Alert if no file has arrived by 05:00 or faults rise.
- **Trade-off:** Strict validation means some nights the stock is a day old. Loose loading means it can be silently wrong.
- **Follow-up to expect:** "A corrected file arrives at 09:00 with the same name." Its checksum is new, so load it and replace that night's stock.

</details>

## Two-way sync and events

Taught in [rate limits, backlogs and two-way sync](04_Rate_Limits_Backlogs_and_Two_Way_Sync.md).

<details>
<summary>Practice question 3. Bransdale Water wants contact details kept in step between its CRM and its field-service ticketing system, where engineers update phone numbers on site. Design the two-way sync.</summary>

- **Answer:** Write a field ownership table. Name and email belong to the CRM. Access notes belong to field service. Phone number is shared, with a written conflict rule. Store a base value per synced field. A change whose replaced value matches the base is applied. One that does not is a conflict for its field's rule or a review queue. Suppress echoes by tagging the connector's writes and skipping writes equal to the base. Make writes idempotent by record and field, honour both systems' limits, and sample records nightly to measure drift.
- **Trade-off:** Strict ownership is easy to run but annoys staff who cannot edit some fields. More shared fields mean more conflicts to staff.
- **Follow-up to expect:** "The systems already disagree on 12,000 records." Settle them before switching on. Apply owner rules to most, send the rest to review, then set the base.

</details>

<details>
<summary>Practice question 4. Morvah Freight receives parcel-status webhooks from a courier, signed with an HMAC (hash-based message authentication code) of the timestamp and body using a shared secret. The courier retries for up to three days. Design the receiver.</summary>

- **Answer:** Read the raw request bytes before parsing. Recompute the HMAC over the timestamp and those bytes as the courier documents, and compare in constant time. Reject requests older than five minutes. Insert the event ID into a table with a unique constraint and keep IDs for seven days, longer than the three-day retry period. A duplicate gets a success reply and nothing else. Write the event to a durable queue, then reply at once. Workers process it later and use the parcel's version to ignore older events. Accept two secrets during rotation.
- **Trade-off:** The ID table grows with traffic. A shorter retention risks processing a late retry twice.
- **Follow-up to expect:** "Why not process first, then reply?" Slow processing times out, the courier retries, and you get the duplicates you were avoiding.

</details>

## Recovery and proof

Taught in [backfills while live](../../fde-building-in-the-estate/customer-data-pipelines/05_Backfills_While_Live.md) and [rate limits, backlogs and two-way sync](04_Rate_Limits_Backlogs_and_Two_Way_Sync.md).

<details>
<summary>Practice question 5. Coverack Insurance's nightly sync from its CRM to an assistant's search index failed silently for four nights. How do you recover, and how do you show the business that the index is complete?</summary>

- **Answer:** The checkpoint is the last "changed since" time saved after a committed batch. Fix the cause, then pick a cutover: the normal sync owns tonight onwards, and a backfill owns the four missed days. Re-read those days with an overlap and upsert by record ID, so repeats change nothing. A "changed since" query usually misses deletions. Compare the full list of record IDs as well. Reconcile counts per day and a sample of records field by field. Record lineage on each record: run ID, source query and time. Add an alert when the checkpoint is more than 26 hours old.
- **Trade-off:** The full ID comparison costs one large read but is the only way to catch deletions.
- **Follow-up to expect:** "The CRM's quota is shared." Run the backfill outside business hours in its own lane, and tell the business the finish time.

</details>

## References

1. The lessons linked under each heading in this module.

## Key takeaways

- Start every connector with a field ownership map, then choose triggers, identity and keys.
- Make creates idempotent with an external key, and reconcile counts each night.
- Label freshness when answers combine live calls and nightly files.
- In two-way sync, compare with a stored base, and settle existing disagreements before switching on.
- A webhook receiver verifies, deduplicates and queues before it replies.

## Check yourself

<details>
<summary>1. In practice question 1, why store the CRM request ID on the case?</summary>

It makes case creation an upsert. A retried create finds the existing case instead of opening a second one.

</details>

<details>
<summary>2. In practice question 5, why is a "changed since" read not enough to recover?</summary>

Deleted records usually produce no change to read. Only a comparison of all record IDs finds them.

</details>
