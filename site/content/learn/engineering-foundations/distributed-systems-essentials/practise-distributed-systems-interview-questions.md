# Practise Distributed Systems Interview Questions


## How to use this practice

Each question puts you with a customer whose systems pass messages or copy data between organisations. Answer aloud as if the interviewer were the customer's architect. Name the failure first, then the mechanism, then what it costs. Compare your outline with the one below only after you have answered.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Choosing a broker and a delivery shape between two companies.
> - Challenging an exactly-once claim.
> - Making writes to a partner safe to retry when the partner offers no key.
> - Planning a dead-letter replay.
> - Designing a sync that recovers from gaps nobody reported.

## Queues and acknowledgements

Taught in [queues, topics and acknowledgements](/learn/engineering-foundations/distributed-systems-essentials/queues-topics-and-acknowledgements).

<details>
<summary>Practice question 1. Braithwaite Logistics wants its warehouse partner to send pick-and-pack events. Three Braithwaite teams need them: stock, billing and customer updates. The partner suggests calling one Braithwaite endpoint per event. What do you propose?</summary>

- **Answer:** Put a broker between the companies, run by Braithwaite. The partner publishes each event and counts it sent when the broker confirms it is stored. Use publish-subscribe with one subscription per team, so each team gets its own copy, reads at its own pace and acknowledges for itself. Each consumer acknowledges only after its own write commits and deduplicates by event ID. Agree the message contract, retention period and who watches the broker in writing.
- **Trade-off:** Braithwaite now runs and secures a broker, and each subscription needs its own monitoring.
- **Follow-up to expect:** "Billing is down for a day." Its subscription holds the events within retention, and billing catches up without affecting stock or customer updates.

</details>

<details>
<summary>Practice question 2. At Keld Lettings, the customer's architect says: "Our broker guarantees exactly-once delivery, so the rent ledger needs no duplicate check." How do you respond?</summary>

- **Answer:** Ask "exactly once between which two points?" A broker's exactly-once feature covers reads and writes inside the broker. The ledger is an outside database. A consumer can commit a ledger entry and crash before its acknowledgement or offset commit, and the broker redelivers. So delivery into the ledger is at-least-once. Make the effect exactly-once by recording each message ID under a unique constraint in the same transaction as the ledger entry, and treating a repeat as success.
- **Trade-off:** One extra insert per message, and a table to prune, against a duplicate rent charge.
- **Follow-up to expect:** "Show me the window." Commit succeeds, the process is killed before the acknowledgement, the message is delivered again on restart.

</details>

## Duplicates

Taught in [duplicates in both directions](/learn/engineering-foundations/distributed-systems-essentials/duplicates-in-both-directions).

<details>
<summary>Practice question 3. Ingleton Housing creates repair orders in a contractor's API. Calls time out about twice a day, and retries have created duplicate orders. The API accepts no idempotency key. What do you build?</summary>

- **Answer:** Store an operation row with a unique key, such as the repair ID plus "create", before the first call. Put that key in the contractor's client reference field on the order. On a timeout, search the contractor's orders for the reference before retrying, and retry only if none exists. If search is unavailable or slow to update, mark the operation "outcome unknown" and let a scheduled check resolve it, instead of retrying blind. Record the contractor's order ID on the row once known.
- **Trade-off:** A search per timeout adds load and depends on the contractor's search being current.
- **Follow-up to expect:** "The contractor has no reference field." Ask whether it rejects a second order for the same repair ID. If not, stop on timeout and reconcile daily.

</details>

## Pipeline health

Taught in [keeping a message pipeline healthy](/learn/engineering-foundations/distributed-systems-essentials/keeping-a-message-pipeline-healthy).

<details>
<summary>Practice question 4. Ambleby Travel's booking-change consumer has 9,000 messages in its dead-letter queue (DLQ) after a partner changed a date format. The fix is deployed. The product lead wants them replayed now. Plan it.</summary>

- **Answer:** First, group the DLQ by error. Only the date-format errors are in scope. Others stay parked. Filter to those, then dry run with a staleness check against each booking's current state, so changes already superseded are skipped. Replay the rest through the normal consumer, keyed by booking ID so each booking stays in order, at a rate below the partner's and the email service's limits. At 20 a second, 9,000 messages take 450 seconds, under 8 minutes. Record the operator, reason, filter and counts sent, skipped and failed again.
- **Trade-off:** The dry run and staleness check delay the replay by an hour, against emails telling travellers about changes they reversed.
- **Follow-up to expect:** "200 fail again." Leave them parked, group the new errors and treat them as a separate fix.

</details>

## Data syncs

Taught in [recoverable data syncs](/learn/engineering-foundations/distributed-systems-essentials/recoverable-data-syncs).

<details>
<summary>Practice question 5. Grisedale Water needs a copy of 1.2 million customer accounts from its billing vendor's API for a support assistant. The vendor offers change webhooks and a "modified since" filter, and no database access. Design the sync so gaps are found and repaired.</summary>

- **Answer:** Backfill once by account ID range, at a capped rate, to set the baseline. Use webhooks as the fast path. Every 10 minutes, read accounts modified since the checkpoint, cursoring on modified time plus account ID, with a 5-minute overlap. Advance the checkpoint only after the batch commits, stored with the copy. Ask the vendor how deletes appear. Reconcile nightly by comparing hashed buckets, then rows in buckets that differ, and report the repair count. Every path goes through one processor that upserts by account ID and lets the newer version win.
- **Trade-off:** Incremental reads and nightly reconciliation spend the vendor's API quota, which may limit how often each can run.
- **Follow-up to expect:** "Why not change data capture (CDC)?" There is no database access. The cursor plus reconciliation covers what it would have caught.

</details>

## References

1. The lessons linked under each heading in this module.
2. Go deeper: [durability and idempotency](/learn/production-ai/agentic-workflow-platforms/durability-and-idempotency), [retries and fallbacks](/learn/production-ai/robust-agents/retries-and-fallbacks) and [reliability and failure handling](/interview/final-week/module-12-reliability-and-failure-handling).

## Key takeaways

- A broker between companies decouples availability and rate. Publish-subscribe gives each team its own copy.
- Exactly-once stops at the broker's edge. Build exactly-once effect with a duplicate check in the consumer's own transaction.
- Without partner key support, send your own reference and look it up before retrying.
- Replay with filters, a staleness check, a rate cap and an audit record, through the normal consumer.
- A sync recovers from gaps only if incremental reads and reconciliation back up its events.

## Check yourself

<details>
<summary>1. In practice question 4, how long do 9,000 messages take at 20 a second?</summary>

450 seconds, 7.5 minutes.

</details>

<details>
<summary>2. In practice question 5, what finds an account the vendor deleted without telling you?</summary>

A deletions endpoint if the vendor offers one. Otherwise the nightly reconciliation, which finds accounts present in the copy and missing from the source.

</details>
