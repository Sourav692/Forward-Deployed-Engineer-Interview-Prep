---
title: "Practise framing an integration"
subtitle: "Six practice questions: frame an integration from a vague brief, unwind a copy that became an owner, debug from integration state, and choose transports for webhooks, polling-only partners and a full order flow."
track: "Enterprise Integration"
module_group: "Integration design"
module_code: T22.2
module_name: "Framing an integration"
lesson: 3
lessons: ["Owners before boxes", "Choosing the transport", "Practise framing an integration"]
level: intermediate
reading_time: "11 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "20 November 2026"
tags: [practice, interview, integration, framing, transport, webhooks, polling]
---

## How to use this practice

These questions start from a short brief, as an integration design round often does. Answer aloud as if at a whiteboard. Tell the business story first, name each system by its job, give each fact an owner, then choose how data moves. Compare with the outline afterwards. The concept questions sit in each lesson's Interview angle.

Give yourself five minutes for each question before opening the outline.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Framing an integration with the boundary checklist before drawing boxes.
> - Spotting a copy that has become an owner, and moving readers back to the source of truth.
> - Choosing between webhooks, polling and REST, and combining them.
> - Acknowledging fast while slow work waits in a queue.

## Framing and ownership

Taught in [owners before boxes](01_Owners_Before_Boxes.md).

<details>
<summary>Practice question 1. Strathy Water wants an assistant that answers "why is my bill so high?". Meter readings come from a meter-reading system, bills from a billing system, and customer contacts from a CRM. The brief is one line: "connect them". Frame the integration.</summary>

- **Answer:** Start with the story: "When a customer asks about a bill, the assistant explains the charge from the readings behind it and offers the right next step." Name systems by job: meter reading records consumption, billing calculates charges, the CRM holds contacts and complaints. Run the checklist. Participants: those three plus the assistant and the billing team. Trigger: a customer's question, so this is a read at question time, not a sync. Data: reads only, nothing written back except a contact note in the CRM. Owners: readings belong to meter reading, charges to billing. Slow or down: if billing is down, say so and offer a callback instead of guessing.
- **Trade-off:** Reading at question time costs calls. A nightly copy is cheaper but must show its age next to every figure.
- **Follow-up to expect:** "Billing estimates some readings." Then the estimate flag is a billing fact, and the assistant must say when a bill is estimated.

</details>

<details>
<summary>Practice question 2. Wendover Building Society's integration database holds a copy of members' contact preferences. Marketing now edits preferences there because the core system's screen is slow. The two disagree for 3% of members. What do you do?</summary>

- **Answer:** The copy has become an owner without an owner. First, stop new edits to the copy, and route marketing's changes to the core system through the integration as writes. Second, settle the 3%. For each disagreement, ask the member's latest recorded choice, since consent has legal weight, and fix the core system, then re-read the copy from it. Third, restore the copy rules: nobody edits it, it carries its age, it hears every change, and a nightly comparison finds drift. Raise the slow screen as a separate problem.
- **Trade-off:** Marketing loses a fast screen until the core system's one is fixed or a proper write path exists.
- **Follow-up to expect:** "Marketing refuses." Take it to whoever owns consent compliance. A wrong preference is a regulatory risk, not a convenience.

</details>

<details>
<summary>Practice question 3. Your integration between a hospital's referral system and a clinic's booking system is failing. What state would you check first, and why would you expect the integration to hold it?</summary>

- **Answer:** Check the four kinds of state the integration owns. Delivery state shows which referrals were sent, acknowledged or failed. Checkpoints show how far through the referral system it has read, and whether that point has stopped moving. ID mappings show whether a referral is linked to an existing booking or would create a second one. The audit shows what was sent, under which identity, and the responses. The integration should hold these because no other system can, and none of them is a business fact.
- **Trade-off:** Keeping a full audit costs storage and needs a retention rule for patient data.
- **Follow-up to expect:** "The checkpoint is current but bookings are missing." Look at delivery state for failures the checkpoint moved past.

</details>

## Transport choice

Taught in [choosing the transport](02_Choosing_the_Transport.md).

<details>
<summary>Practice question 4. Kelso Veterinary Group receives lab results from a partner laboratory. The lab sends a webhook per result and has a REST API. Its webhook waits 8 seconds for a reply. Attaching a result to the clinic's practice system takes about 15 seconds. Design the receiving side.</summary>

- **Answer:** Treat the webhook as a signal. The receiver verifies the signature, checks the event ID, writes to a durable queue and replies 200 once the write is confirmed, in well under a second. A worker fetches the full result through the REST API, then attaches it to the practice system, keyed on the lab's result ID so a repeat changes nothing. A poll every 15 minutes asks the lab for results changed since the checkpoint, with a two-minute overlap, and feeds the same worker. Alert if the poll finds results the webhooks missed, and if any result waits in the queue for more than 30 minutes.
- **Trade-off:** The fetch doubles calls to the lab, in return for always holding the latest version.
- **Follow-up to expect:** "A result is amended later." The fetch reads the amended version, and the worker updates the attachment by result ID.

</details>

<details>
<summary>Practice question 5. Jevington Energy's field-service partner has no webhooks. Its REST API offers "jobs modified since" with pages of 100, and allows 1,000 calls an hour, shared with two other integrations that use about 400. Engineers need job updates within 10 minutes. About 300 jobs change in a busy 5 minutes. Design the polling.</summary>

- **Answer:** Poll every 5 minutes, which keeps the worst delay under 10. Ask for jobs modified since the last checkpoint minus one minute. A busy window returns about 300 jobs, three pages, so 12 polls an hour cost about 36 calls. That leaves wide headroom under the 600 the other integrations leave free. Advance the checkpoint only after every page is processed. Skip jobs whose version you have already handled. Alert when a poll fails twice in a row or the checkpoint is over 15 minutes old.
- **Trade-off:** Polling every minute would cut the delay but use more of a shared limit for mostly empty calls.
- **Follow-up to expect:** "A storm doubles the changes." Six pages a poll is 72 calls an hour, still within budget.

</details>

<details>
<summary>Practice question 6. Penrose Bikes sells through an online marketplace and fulfils from its own ERP. Orders, cancellations and shipping updates must flow between them. Frame the integration and choose a transport for each direction.</summary>

- **Answer:** Story: "A customer orders on the marketplace, Penrose ships it from its warehouse, and the customer sees tracking." Owners: the marketplace owns the order and cancellations. The ERP owns stock and shipments. Inbound orders: marketplace webhooks as signals, a REST fetch of the full order, and a backstop poll every 10 minutes. Acknowledge after a durable enqueue, then create the sales order in the ERP keyed on the marketplace order ID. Outbound shipments: a REST call to the marketplace when the ERP marks a parcel shipped, retried from a queue. The integration owns ID mappings, delivery state, checkpoints and audit.
- **Trade-off:** Two transports and a poll are more to run than one, but each covers a failure the others miss.
- **Follow-up to expect:** "A cancellation arrives after shipping." The ERP owns shipment, so the cancellation becomes a return, not a deletion. The full worked design of a marketplace integration, with stock, price and repair flows, is [designing a retailer marketplace integration](../a-worked-partner-integration/01_Designing_a_Retailer_Marketplace_Integration.md).

</details>

## References

1. The lessons linked under each heading in this module.

## Key takeaways

- Frame with the story and the boundary checklist before choosing any transport.
- Move readers back to the owner when a copy starts being edited.
- Debug an integration from its own state: delivery, checkpoints, mappings and audit.
- Combine a webhook signal, a REST fetch and a backstop poll, all feeding one idempotent worker.
- Size polling from the freshness needed and the rate limit left over.

## Check yourself

<details>
<summary>1. In practice question 1, why is the integration a read at question time and not a sync?</summary>

The trigger is a customer's question and nothing is written back except a note. Reading from the owners at that moment avoids keeping copies that drift.

</details>

<details>
<summary>2. In practice question 5, why subtract a minute from the checkpoint?</summary>

The partner's modified times can lag behind its writes. The overlap catches late ones, and skipping known versions makes the repeats harmless.

</details>
