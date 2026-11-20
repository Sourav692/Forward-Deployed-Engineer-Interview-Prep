# Practise Connecting Enterprise Systems


## How to use this practice

These questions ask you to design a connector or recover one from a short brief. Answer aloud as if at a whiteboard. Sketch the systems, name the owner of each field, and work through the numbers. Then compare with the outline. The concept questions sit in each lesson's Interview angle.

The design questions are larger than the lesson questions. Give yourself five minutes for each before opening the outline.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Designing a connector between a customer relationship management (CRM) system and a ticketing system.
> - Ingesting from a SOAP (originally Simple Object Access Protocol) service and an SFTP (SSH File Transfer Protocol) file drop together.
> - Choosing the identity for each call and keeping shared tokens working.
> - Designing a two-way sync.
> - Recovering a stopped sync and proving the data is complete.

## Designing a connector

Taught in [CRM, ERP and ticketing systems](/learn/enterprise-integration/connecting-enterprise-systems/crm-erp-and-ticketing-systems) and [authenticating as whom](/learn/enterprise-integration/connecting-enterprise-systems/authenticating-as-whom).

<details>
<summary>Practice question 1. Trelleck Housing logs tenants' repair requests in its CRM. It wants each request to open a case in its ticketing system, and the case status to show on the tenant's CRM record. Design the connector.</summary>

- **Answer:** Map the fields first. The CRM owns the tenant, the tenancy and the repair description. The ticketing system owns case status and assignee. Status flows back one way only. Read new requests from the CRM's change events, or poll "changed since" every minute with a stored checkpoint. Create each case with the CRM request ID as its external key and upsert by that key. A retry then never opens a second case. Run as a service account with a narrow role, and tag its writes. Check what case creation triggers. The tenant should get one email, not two. Budget calls against both systems' limits. Send failures to a dead-letter queue with an alert, and reconcile open requests against open cases each night.
- **Trade-off:** Events are faster but can be missed. Polling is simpler and self-correcting but adds up to a minute of delay.
- **Follow-up to expect:** "The tenant edits the description after the case opens." Add it to the case as a comment, so the agent's notes are not overwritten.

</details>

## Identity and tokens

Taught in [authenticating as whom](/learn/enterprise-integration/connecting-enterprise-systems/authenticating-as-whom).

<details>
<summary>Practice question 2. Trelleck Housing wants its housing officers to ask an assistant about tenants' repair cases in the ticketing system and, once an officer approves, add a note to the case. A nightly job also builds a search index of all open cases. Thirty workers share the connections. Choose the identity for each kind of call and keep the tokens working.</summary>

- **Answer:** An officer's question runs on behalf of that officer, through the authorisation code flow, so the ticketing system applies her permissions and logs her name. An approved note also uses the approving officer's delegated token, so the change traces to a person. The nightly index runs as a service account with a read-only role on cases. Store each case's permissions with it in the index, refresh them on every sync, and filter every answer for the officer asking. Split readers and writers into separate clients with the smallest scopes. For tokens: one refresher per connection behind a lock with a lease, re-read the store after taking the lock, save the new access and refresh tokens together before use, refresh a few minutes early, and treat "invalid grant" as final: ask the officer to reconnect. Keep tokens encrypted and out of logs.
- **Trade-off:** Delegated access needs every officer's consent, and the assistant must explain permission refusals. A single service account is simpler, but your code must reproduce every permission rule the ticketing system already enforces.
- **Follow-up to expect:** "The administrator needs three weeks to approve the write scope." Ship questions on the read scope first and add notes when consent lands.

</details>

## Legacy ingestion

Taught in [legacy feeds: SOAP, SFTP and CSV](/learn/enterprise-integration/connecting-enterprise-systems/legacy-feeds-soap-sftp-and-csv).

<details>
<summary>Practice question 3. Ambleside Pharmacy Supply wants an assistant that answers questions about orders and stock. Orders come from the finance system's SOAP service. Stock comes as a comma-separated values (CSV) file a wholesaler drops on an SFTP server at about 03:00 each night. Design the ingestion.</summary>

- **Answer:** For orders, generate the client from the saved WSDL (Web Services Description Language) document. Poll for orders changed since a stored checkpoint, page through results, and save the checkpoint only after each page commits. Set timeouts and log faults in full. For stock, agree a marker file with row count and checksum. Claim each file by checksum, check the header and encoding, compare the count, and replace that night's stock through staging in one step. Label answers with their freshness: orders "as of a minute ago", stock "as of the 03:00 file". Alert if no file has arrived by 05:00 or faults rise.
- **Trade-off:** Strict validation means some nights the stock is a day old. Loose loading means it can be silently wrong.
- **Follow-up to expect:** "A corrected file arrives at 09:00 with the same name." Its checksum is new, so load it and replace that night's stock.

</details>

## Two-way sync

Taught in [rate limits, backlogs and two-way sync](/learn/enterprise-integration/connecting-enterprise-systems/rate-limits-backlogs-and-two-way-sync).

<details>
<summary>Practice question 4. Bransdale Water wants contact details kept in step between its CRM and its field-service ticketing system, where engineers update phone numbers on site. Design the two-way sync.</summary>

- **Answer:** Write a field ownership table. Name and email belong to the CRM. Access notes belong to field service. Phone number is shared, with a written conflict rule. Store a base value per synced field. A change whose replaced value matches the base is applied. One that does not is a conflict for its field's rule or a review queue. Suppress echoes by tagging the connector's writes and skipping writes equal to the base. Make writes idempotent by record and field, honour both systems' limits, and sample records nightly to measure drift.
- **Trade-off:** Strict ownership is easy to run but annoys staff who cannot edit some fields. More shared fields mean more conflicts to staff.
- **Follow-up to expect:** "The systems already disagree on 12,000 records." Settle them before switching on. Apply owner rules to most, send the rest to review, then set the base.

</details>

## Recovery and proof

Taught in [backfills while live](/learn/fde-building-in-the-estate/customer-data-pipelines/backfills-while-live) and [rate limits, backlogs and two-way sync](/learn/enterprise-integration/connecting-enterprise-systems/rate-limits-backlogs-and-two-way-sync).

<details>
<summary>Practice question 5. Coverack Insurance's nightly sync from its CRM to an assistant's search index failed silently for four nights. How do you recover, and how do you show the business that the index is complete?</summary>

- **Answer:** The checkpoint is the last "changed since" time saved after a committed batch. Fix the cause, then pick a cutover: the normal sync owns tonight onwards, and a backfill owns the four missed days. Re-read those days with an overlap and upsert by record ID, so repeats change nothing. A "changed since" query usually misses deletions. Compare the full list of record IDs as well. Reconcile counts per day and a sample of records field by field. Record lineage on each record: run ID, source query and time. Add an alert when the checkpoint is more than 26 hours old.
- **Trade-off:** The full ID comparison costs one large read but is the only way to catch deletions.
- **Follow-up to expect:** "The CRM's quota is shared." Run the backfill outside business hours in its own lane, and tell the business the finish time.

</details>

## Key takeaways

- Start every connector with a field ownership map, then choose triggers, identity and keys.
- Make creates idempotent with an external key, and reconcile counts each night.
- Label freshness when answers combine live calls and nightly files.
- In two-way sync, compare with a stored base, and settle existing disagreements before switching on.
- Choose the identity per call, and let one worker refresh a connection's token at a time.

## Check yourself

<details>
<summary>1. In practice question 1, why store the CRM request ID on the case?</summary>

It makes case creation an upsert. A retried create finds the existing case instead of opening a second one.

</details>

<details>
<summary>2. In practice question 5, why is a "changed since" read not enough to recover?</summary>

Deleted records usually produce no change to read. Only a comparison of all record IDs finds them.

</details>
