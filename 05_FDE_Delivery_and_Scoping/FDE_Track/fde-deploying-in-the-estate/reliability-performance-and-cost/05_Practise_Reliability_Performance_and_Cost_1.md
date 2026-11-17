---
title: "Practise reliability, performance and cost, part 1"
subtitle: "Ten practice questions on half-finished payments, duplicate and stale events, retry storms, reopening breakers and dead-letter queues."
track: "Deploying and Operating in the Customer's Estate"
module_group: Release and operate
module_code: T23.6
module_name: Reliability, performance and cost in their estate
lesson: 5
lessons: ["Recovering half-finished work", "Latency, queues and load tests", "Finding the real bottleneck", "AI cost per successful task", "Practise reliability, performance and cost, part 1", "Practise reliability, performance and cost, part 2"]
level: intermediate
reading_time: "13 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "17 November 2026"
tags: [practice, interview, reliability, retries, idempotency, AI system design]
---

## How to use this practice

These questions put you in a customer's estate after something stopped halfway. Answer aloud as if the customer's engineer is listening: say what you would check first, what you would change, and how you would know it worked. Then compare with the outline. Part 2 covers latency, queues, bottlenecks and AI cost.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Recovering orders that were paid but never updated.
> - Making consumers safe against duplicate, late and stale events.
> - Stopping retry storms and breakers that keep reopening.
> - Writing retry policies and dead-letter queue runbooks.

## Half-finished payments and orders

Taught in [recovering half-finished work](01_Recovering_Half_Finished_Work.md).

<details>
<summary>Practice question 1. Mossgiel Retail's finance team finds 85 customers charged yesterday whose orders still show "awaiting payment". What do you do?</summary>

- **Answer:** Stop new cases first: make sure charge requests carry an idempotency key and that a timeout leads to a status lookup, not a blind retry. Then match the provider's charges for the day to orders by reference. For each order, check whether its stock is still reserved. Complete those that can be fulfilled through the normal order code path, and refund the rest. Tell each customer what happened. Add a job that flags orders charged but unpaid for over 15 minutes.
- **Trade-off:** Completing orders keeps the sale and may ship late. Refunding all is simpler and loses revenue.
- **Follow-up to expect:** "How did it happen?" The order update timed out after the charge succeeded, and nothing recorded the charge.

</details>

<details>
<summary>Practice question 2. Design how Mossgiel's checkout recovers when any of reserve stock, take payment or create shipment fails.</summary>

- **Answer:** Record each step's state and reference on the order. If reservation fails, stop with nothing to undo. If payment is declined, release the stock. If payment times out, look up the charge by key before deciding. If shipment creation fails, retry it with backoff, since the customer has paid. After a set time, refund and release the stock. Make every step and compensation idempotent, and reconcile stuck orders on a schedule.
- **Trade-off:** An orchestrator that holds the steps is easy to follow and becomes a central dependency. Services reacting to events stay independent and are harder to trace.
- **Follow-up to expect:** "The refund itself fails." Retry it, then route it to a person.

</details>

## Duplicate and stale events

Taught in [recovering half-finished work](01_Recovering_Half_Finished_Work.md).

<details>
<summary>Practice question 3. A payment provider sends Mossgiel webhooks for "payment succeeded" and "payment refunded". Some arrive twice and some arrive in the wrong order. How do you handle them?</summary>

- **Answer:** Verify the signature, store the raw event, and reply 200 quickly, then process from a queue. Skip any event ID you have already processed. For ordering, compare the event's timestamp or sequence with the payment's stored state, and never let "succeeded" overwrite "refunded". When in doubt, fetch the payment's current state from the provider's API and apply that. Alert on events that refer to unknown payments.
- **Trade-off:** Fetching current state costs an API call per event. Trusting event order risks reopening a refunded payment.
- **Follow-up to expect:** "How long do you keep event IDs?" Longer than the provider's retry window, often a few days.

</details>

<details>
<summary>Practice question 4. Mossgiel's stock levels sometimes jump back to old values for a few minutes. Events from the warehouse system are the suspect. What is wrong, and how do you fix it?</summary>

- **Answer:** A delayed or retried event carrying an older stock level is overwriting a newer one. Confirm by logging each event's version and arrival time for an affected item. Fix the consumer: store a version per item, and apply an event only if its version is newer. If the warehouse cannot send versions, use its own update time, or fetch the current level on each event. Replay the affected window once the fix is live.
- **Trade-off:** Version checks need a version from the source. Fetching on every event adds load on the warehouse system.
- **Follow-up to expect:** "Two events share a timestamp." Ask for a sequence number per item.

</details>

<details>
<summary>Practice question 5. Build an event consumer for Hartfell Energy's work-order updates that tolerates duplicates, gaps and old events.</summary>

- **Answer:** Each message goes through fixed steps. Validate its shape and send malformed ones to a dead-letter queue. Look up the event ID and skip it if processed. Load the work order's stored version, apply the event only if newer, and log older ones as stale. If the event refers to an unknown work order, park it and retry later. Write the change and the event ID in one transaction. Retry transient errors with backoff, then dead-letter.
- **Trade-off:** Strict checks drop events a lenient consumer would apply. Lenient ones corrupt state.
- **Follow-up to expect:** "How do you test it?" Replay a recorded stream with duplicates and shuffled order added.

</details>

## Retries and breakers

Taught in [recovering half-finished work](01_Recovering_Half_Finished_Work.md).

<details>
<summary>Practice question 6. When Mossgiel's orders database slows, its load jumps about 60-fold and it falls over. What is happening, and what do you change?</summary>

- **Answer:** This is a retry storm. Retries at several layers multiply: three layers making 4 attempts each turn one request into up to 64 database calls. Confirm by comparing incoming requests with database queries during the slowdown. Keep retries at one layer, nearest the database, and make the others fail fast. Add exponential backoff with jitter, a retry budget of about 10 per cent and a circuit breaker. Return errors to users quickly instead of holding them.
- **Trade-off:** Fewer retries show more errors during brief blips. Many retries turn a blip into an outage.
- **Follow-up to expect:** "Clients outside your control retry too." Send Retry-After and rate-limit per client.

</details>

<details>
<summary>Practice question 7. The circuit breaker on Hartfell's call to its document search service opens, closes and reopens every minute. What do you do?</summary>

- **Answer:** The breaker lets full traffic back after one successful trial, and the service fails again under load. Check the service's own health, error rate and latency, not only the breaker's view. Lengthen the cool-down, allow a small share of traffic in the half-open state, and close only after several successes. Look for the service's real limit and cap your concurrency below it. Serve a degraded answer, such as cached results, while it is open.
- **Trade-off:** A slower close keeps users on the degraded path longer. A fast close keeps the flapping.
- **Follow-up to expect:** "Several clients share the service." Coordinate limits, since each breaker reopening adds load.

</details>

<details>
<summary>Practice question 8. Write a retry policy for Mossgiel's calls to a warehouse API that allows 20 requests a second and returns 429 when exceeded.</summary>

- **Answer:** Rate-limit on the client to stay under 20 a second, so 429s are rare. On a 429 or 503, wait for the Retry-After value if present, else back off exponentially from 500 ms with full jitter, capped at 10 s. Retry timeouts only for idempotent calls or calls with a request key. Never retry a 400. Stop after five attempts and send the work to a queue for later. Count retries and alert when they pass 10 per cent of calls.
- **Trade-off:** A client-side limit wastes capacity when others are quiet. No limit wastes calls on rejections.
- **Follow-up to expect:** "Several instances share the limit." Use a shared limiter, or split the rate between them.

</details>

## Dead-letter queues

Taught in [recovering half-finished work](01_Recovering_Half_Finished_Work.md).

<details>
<summary>Practice question 9. After a two-hour outage, Hartfell's dead-letter queue holds 14,000 work-order updates. The team wants to replay them all now. What do you advise?</summary>

- **Answer:** Not all at once. Group the messages by error first, and fix each cause. Check staleness: an update may be older than a newer one already applied, and a version-checking consumer will drop it safely. Replay through the normal idempotent consumer, rate-limited so live traffic is unaffected. Start with a sample, check the results, then continue. Count successes and repeat failures, and send repeat failures to a person.
- **Trade-off:** A slow, careful replay leaves data out of date for longer. A fast one can overload the system that has only now recovered.
- **Follow-up to expect:** "Some messages are malformed." Fix and resubmit them, or discard with a record.

</details>

<details>
<summary>Practice question 10. Write the runbook for Mossgiel's order-events dead-letter queue.</summary>

- **Answer:** Alert when the queue holds any message older than 15 minutes or more than 100 messages. Step one, read samples and group by error. Step two, fix the cause or confirm the downstream is healthy. Step three, check staleness and that the consumer is idempotent. Step four, replay a sample at a set rate, then the rest. Step five, record counts replayed, failed and discarded, with reasons. Name an owner, retention and who approves discards.
- **Trade-off:** A strict runbook slows the on-call engineer. Ad hoc replays repeat past mistakes.
- **Follow-up to expect:** "Can replays be automatic?" Only for errors already known to be transient.

</details>

## References

1. The lessons linked under each heading in this module.

## Key takeaways

- Find out what happened before retrying or undoing a timed-out step.
- Consumers skip processed event IDs and drop events older than the stored version.
- Retry at one layer, with backoff, jitter, a budget and a breaker.
- Replay dead-letter queues by cause, at a limited rate, through the idempotent consumer.

## Check yourself

<details>
<summary>1. In practice question 3, why reply 200 to the webhook before processing it?</summary>

Slow replies make the sender time out and send again, which adds duplicates. Storing the event first and processing from a queue keeps replies fast and nothing is lost.

</details>

<details>
<summary>2. In practice question 7, why does the breaker keep reopening?</summary>

One successful trial lets full traffic back, and the still-weak service fails again under that load.

</details>
