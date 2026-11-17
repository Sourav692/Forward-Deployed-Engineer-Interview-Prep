# Practise Receiving Webhooks


## How to use this practice

These questions ask you to design a webhook receiver or repair one from a short brief. Answer aloud as if at a whiteboard. Draw the request path and the worker path separately, and say what each reply tells the provider. Then compare with the outline. The concept questions sit in the lesson's Interview angle.

Give yourself four minutes for each before opening the outline.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Designing a receiver that serves many tenants without mixing them.
> - Handling events that arrive late, twice or out of order.
> - Choosing replies during an outage so nothing is lost.
> - Repairing a receiver after duplicates or a leaked secret.

## Securing the endpoint

Taught in [the webhook receiver](/learn/enterprise-integration/receiving-webhooks-safely/the-webhook-receiver).

<details>
<summary>Practice question 1. Brantwood Clinics runs 40 physiotherapy clinics. Each clinic has its own account on an online booking platform, which sends `booking.created` and `booking.cancelled` webhooks. Brantwood wants one service that receives them all and updates each clinic's diary. Design the receiver.</summary>

- **Answer:** Register one endpoint path per clinic, such as `/webhooks/booking/{clinic}`, each with its own signing secret. Look up the secret from the path, cap the body size, and verify the HMAC over event ID, timestamp and raw bytes in constant time. Reject timestamps outside five minutes. Check the event's account ID matches the clinic on the path. Insert into an inbox table keyed by clinic and event ID, then reply 200. Workers update the diary, keyed on the booking ID, so a reprocessed row changes nothing.
- **Trade-off:** Forty secrets to store and rotate, against one leak exposing every clinic's bookings.
- **Follow-up to expect:** "A clinic closes." Return 410 on its path so the platform stops sending, and delete its secret.

</details>

## Order and acknowledgement

Taught in [the webhook receiver](/learn/enterprise-integration/receiving-webhooks-safely/the-webhook-receiver).

<details>
<summary>Practice question 2. Tolland Freight receives parcel status events from a carrier. Its tracking page sometimes shows "Out for delivery" for parcels already marked "Delivered". The logs show `delivered` arriving before `out_for_delivery` for the same parcel. Fix it.</summary>

- **Answer:** The carrier retries failed deliveries, so events overtake each other. Define the valid transitions for a parcel: collected, in transit, out for delivery, delivered, with exceptions such as returned. In the worker, apply an event only if it moves the parcel forward. If the event carries a sequence number or an event time, store the latest applied and skip older ones. Record skipped events for audit rather than dropping them silently. If the carrier offers a status lookup, fetch current state on any doubt.
- **Trade-off:** Strict forward-only rules can block a genuine correction, such as a parcel taken back to the depot. Model those as explicit transitions.
- **Follow-up to expect:** "Events have no sequence number." Use the transition rules alone, and fetch current state when an event conflicts with them.

</details>

<details>
<summary>Practice question 3. Sedgefield Insurance's claims receiver writes events to an inbox database. The database fails over and is unavailable for 25 minutes on a busy morning. What should the receiver reply during the outage, and what happens afterwards?</summary>

- **Answer:** Reply 503, with `Retry-After` if you can estimate recovery. Never 200, because nothing was stored. The provider treats it as a failure and retries on its schedule. Check that the schedule covers 25 minutes with margin: one that gives up after an hour is fine, one that gives up after ten minutes is not. When the database returns, retries arrive in a burst. Verification is cheap and the inbox insert is small, so the receiver absorbs it. Watch the age of the oldest unprocessed row until workers catch up. Finish with a "changed since" poll of the provider's API covering the outage, to find anything retries missed.
- **Trade-off:** A second, independent store for the inbox shortens the outage, at the cost of merging two stores afterwards.
- **Follow-up to expect:** "The provider gave up on some events." The poll finds them. That is why the poll exists.
- **Go deeper:** [Choosing the transport](/learn/enterprise-integration/framing-an-integration/choosing-the-transport).

</details>

## Recovering a receiver

Taught in [the webhook receiver](/learn/enterprise-integration/receiving-webhooks-safely/the-webhook-receiver).

<details>
<summary>Practice question 4. Pennock Foods notices that some wholesale orders are created twice, three days apart. Its receiver deletes event-ID records after one hour to keep the table small. The supplier's platform retries failed deliveries for 72 hours. Explain the duplicates and fix them.</summary>

- **Answer:** A delivery failed or timed out, and was retried later. By the time a late retry arrived, its event-ID record had been deleted, so the receiver claimed it as new. Keep event-ID records for at least the 72-hour retry period, plus a day of margin. Store only the ID, tenant and time, so the table stays small, and prune by age with an index. Key order creation on the supplier's order ID as well, so a duplicate event cannot create a second order even if the record is gone. Then find past duplicates by that order ID and cancel the extras with the customer's agreement.
- **Trade-off:** Longer retention costs storage. Shorter retention costs duplicate orders.
- **Follow-up to expect:** "How many rows is that?" Events a day times four days. At 50,000 a day, 200,000 small rows.

</details>

<details>
<summary>Practice question 5. Wolsey Travel's signing secret for a payments provider appears in a screenshot attached to a public support forum post. What do you do in the next hour?</summary>

- **Answer:** Treat it as leaked. In the provider's settings, generate a new secret. Deploy the receiver accepting both secrets, confirm deliveries verify with the new one, then remove the old. Remove the post. Review events received since the screenshot was posted: check each payment event against the provider's API by ID, since a forged event would have no match. Check whether the secret appears anywhere else, such as code or logs. Record the incident and how the secret reached a screenshot.
- **Trade-off:** A hard cut-over to the new secret alone is faster but rejects genuine events until the provider switches.
- **Follow-up to expect:** "Could a forged event already have done harm?" Only if a worker acted on it without the API check. Pause payment-driven actions until the review is done.

</details>

## References

1. Standard Webhooks, [Standard Webhooks specification](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md), accessed 17 November 2026. Retry schedules, 410 to disable an endpoint and multiple signatures during rotation.
2. IETF, [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110), accessed 17 November 2026. The meaning of 401, 410, 503 and `Retry-After`.
3. Site lesson: [The webhook receiver](/learn/enterprise-integration/receiving-webhooks-safely/the-webhook-receiver).

## Key takeaways

- One secret per tenant, chosen by the endpoint, and the event's account checked against it.
- Apply only valid forward transitions, and skip stale events with a record.
- During an outage reply 503, then poll for anything retries missed.
- Keep event-ID records longer than the provider's retry period, and key writes on business IDs too.
- Rotate a leaked secret with an overlap, then check recent events against the provider's API.

## Check yourself

<details>
<summary>1. Why must the receiver never reply 200 while its inbox is down?</summary>

The provider would stop retrying, and the event would exist nowhere.

</details>

<details>
<summary>2. Why key order creation on the supplier's order ID when you already record event IDs?</summary>

It is a second defence. If an event-ID record is missing for any reason, the business key still stops a second order.

</details>
