# Practise Reliability, Performance and Cost


## How to use this practice

These questions put you in a customer's estate when something stopped halfway, or when the customer says the system is slow, backed up or too expensive. Answer aloud in about two minutes, as if the customer's engineer is listening: say what you would check first, what you would change and how you would know it worked. Where a question gives numbers, do the arithmetic out loud. Then compare with the outline.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Recovering orders that were paid but never updated.
> - Making consumers safe against duplicate, late and stale events.
> - Stopping retry storms and breakers that keep reopening, and replaying dead-letter queues.
> - Explaining a growing queue when every graph looks calm, and working out drain time.
> - Designing load tests and backpressure for an AI service.
> - Choosing between a query fix, a cache and more capacity.
> - Testing context budgets, routing, fallbacks and batch jobs by cost per successful task.

## Half-finished payments and orders

Taught in [recovering half-finished work](/learn/fde-deploying-in-the-estate/reliability-performance-and-cost/recovering-half-finished-work).

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

Taught in [recovering half-finished work](/learn/fde-deploying-in-the-estate/reliability-performance-and-cost/recovering-half-finished-work).

<details>
<summary>Practice question 3. A payment provider sends Mossgiel webhooks for "payment succeeded" and "payment refunded". Some arrive twice and some arrive in the wrong order. How do you handle them?</summary>

- **Answer:** Verify the signature, store the raw event, and reply 200 quickly, then process from a queue. Skip any event ID you have already processed. For ordering, compare the event's timestamp or sequence with the payment's stored state, and never let "succeeded" overwrite "refunded". When in doubt, fetch the payment's current state from the provider's API and apply that. Alert on events that refer to unknown payments.
- **Trade-off:** Fetching current state costs an API call per event. Trusting event order risks reopening a refunded payment.
- **Follow-up to expect:** "How long do you keep event IDs?" Longer than the provider's retry window, often a few days.
- **Go deeper:** [The webhook receiver](/learn/enterprise-integration/receiving-webhooks-safely/the-webhook-receiver).

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

Taught in [recovering half-finished work](/learn/fde-deploying-in-the-estate/reliability-performance-and-cost/recovering-half-finished-work).

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

Taught in [recovering half-finished work](/learn/fde-deploying-in-the-estate/reliability-performance-and-cost/recovering-half-finished-work).

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

## Queues, load tests and backpressure

Taught in [latency, queues and load tests](/learn/fde-deploying-in-the-estate/reliability-performance-and-cost/latency-queues-and-load-tests).

<details>
<summary>Practice question 11. Hartfell Energy's document ingestion queue grows all day, but the workers' CPU sits at 10 per cent. Why, and what do you do?</summary>

- **Answer:** The workers are waiting, not working. Eight workers each process one document at a time, and each waits about 2 s on the text-extraction service. By Little's law they finish at most 8 ÷ 2 = 4 documents a second. If 5 arrive, the queue grows by 3,600 an hour while CPU stays low. Raise concurrency with more workers or asynchronous calls, within the extraction service's limits. Then measure throughput, not CPU.
- **Trade-off:** More concurrency moves the pressure to the extraction service. Fewer workers leave the backlog growing.
- **Follow-up to expect:** "The extraction service caps calls." Batch documents per call, or ask for a higher limit.

</details>

<details>
<summary>Practice question 12. After an outage, Hartfell's queue holds 54,000 messages. Consumers handle 60 a second and 45 arrive. How long until it clears, and what would clear it in 20 minutes?</summary>

- **Answer:** The backlog falls by 60 − 45 = 15 a second, so 54,000 ÷ 15 = 3,600 s, one hour. To clear in 20 minutes, 1,200 s, it must fall by 54,000 ÷ 1,200 = 45 a second. With 45 still arriving, consumers need 90 a second, one and a half times today's capacity. Check that the downstream system can take 90 a second before scaling consumers.
- **Trade-off:** Scaling for the backlog costs money for an hour. Waiting leaves data stale for that hour.
- **Follow-up to expect:** "Arrivals rise to 60." Then it never clears without more capacity.

</details>

<details>
<summary>Practice question 13. Design a load-test suite for Hartfell's assistant before it reaches all 3,000 field engineers.</summary>

- **Answer:** Set pass rules first, such as time to first token under 2 s at p95 and errors under 1 per cent. Replace the model with a mock that returns realistic latency and token counts. Tests then cost little. Run a baseline at the expected rate, a spike at the 07:00 shift start, a stress run to the breaking point, a run with the vector database slowed, and a soak for hours. Finish with a short run against the real model to check its rate limits.
- **Trade-off:** A mock hides the model's own variability. Testing only against the real model is slow and costly.
- **Follow-up to expect:** "What fails first?" Usually the provider's tokens-per-minute limit.

</details>

<details>
<summary>Practice question 14. Hartfell's ingestion API accepts uploads faster than workers process them, and the queue's memory fills. Design backpressure.</summary>

- **Answer:** Bound the queue at a depth the workers clear in an agreed time. When it is full, the API returns 429 with Retry-After, and the upload client backs off. Workers take a few messages at a time. A slow downstream then slows intake. Give re-indexing jobs a lower priority than new work orders, and pause them first. Alert on queue depth and oldest message age, not only on errors.
- **Trade-off:** Rejecting uploads moves waiting to the client. Accepting everything risks losing the whole queue.
- **Follow-up to expect:** "The client cannot retry." Accept to durable storage, and process later from there.

</details>

## Finding the bottleneck

Taught in [finding the real bottleneck](/learn/fde-deploying-in-the-estate/reliability-performance-and-cost/finding-the-real-bottleneck).

<details>
<summary>Practice question 15. Mossgiel's product page takes 2.5 seconds at peak, and the team wants to put a cache in front of it before the sale. What do you do first?</summary>

- **Answer:** Read a trace before choosing a fix. Say it shows 1.9 s in one query that scans the whole prices table, because nothing indexes the brand and item it filters on. Add an index on those columns, check the new plan and measure again. If the query falls to a few milliseconds, the page may be fast enough without a cache. Cache only what is still expensive after the fix, with brand, item and a price version in the key, and delete entries on a price-change event so staff never see a stale price or another brand's. Add capacity last, once the work itself is efficient.
- **Trade-off:** A cache switched on today hides the slow query until a miss at the worst moment, such as just after a price change at peak. Fixing the query takes longer to ship.
- **Follow-up to expect:** "The trace shows time waiting for a connection, not in queries." Then the database is busy. Reduce the work per request before you enlarge any pool.

</details>

## Cost of AI features

Taught in [AI cost per successful task](/learn/fde-deploying-in-the-estate/reliability-performance-and-cost/ai-cost-per-successful-task).

<details>
<summary>Practice question 16. During a four-hour provider outage, Hartfell's fallback model answered all questions, and complaints rose. What do you change?</summary>

- **Answer:** The fallback was never measured against the same standard. Run it on the graded question set to know its success rate per task type. Allow it only for task types where it scores acceptably, such as lookups. For safety-related questions, return the manual section and a notice instead. Label fallback answers in logs and to users, and alert when the fallback share passes a threshold.
- **Trade-off:** Restricting the fallback serves fewer users during outages. Allowing everything serves weak answers.
- **Follow-up to expect:** "Could you use a second provider's top model?" Yes, after the same evaluation.

</details>

<details>
<summary>Practice question 17. Hartfell is changing to a new embedding model. A colleague says only changed passages need embedding. Is that right?</summary>

- **Answer:** Not this time. Vectors from different embedding models cannot be compared. Every passage must be re-embedded into a new index. Build it alongside the old one, compare retrieval on a graded set, then switch. Afterwards, re-embed only new or changed passages, detected by a hash of the text. Store the model version with each vector and in the hash key. A model change then forces a full rebuild by design.
- **Trade-off:** A full rebuild costs one large run. Mixing models in one index breaks retrieval quietly.
- **Follow-up to expect:** "How do you avoid downtime?" Keep serving the old index until the new one passes.

</details>

<details>
<summary>Practice question 18. Design an experiment to test a smaller context budget for a RAG assistant.</summary>

- **Answer:** Take a graded set of a few hundred real questions, with experts' expected answers. Run the current and proposed budgets on the same set. Measure success rate, cost per question, cost per successful task, latency and which passages were dropped from failed answers. Agree the decision rule first, such as adopt if cost per success falls and success drops under one point. Then run a small live trial behind a flag.
- **Trade-off:** A graded set takes expert time. Testing on live users risks failures in the field.
- **Follow-up to expect:** "Results differ by question type." Set budgets per type.

</details>

<details>
<summary>Practice question 19. Design model routing for Hartfell's assistant.</summary>

- **Answer:** Start with three classes: lookups, explanations and safety-related questions. Classify with rules, then a small model if rules miss too many. Send lookups to a cheap model, explanations to a stronger one, and safety questions to the strongest with a required citation. Let the cheap model escalate when unsure. Measure success and cost per class weekly on graded samples, and log every route.
- **Trade-off:** More classes save more and add misrouting. One model avoids misroutes and costs more.
- **Follow-up to expect:** "The classifier is wrong 5 per cent of the time." Bias errors towards the stronger model.

</details>

<details>
<summary>Practice question 20. Hartfell summarises 40,000 work orders each night in batches of 1,000 and keeps hitting rate limits and timeouts. Users of the live assistant wait for answers too. What do you change?</summary>

- **Answer:** Move the nightly job to the provider's batch processing, which costs less and does not compete with live traffic for the same limits. If that is not available, use smaller batches sized to the tokens-per-minute limit, with backoff, and run off-peak. Make each item idempotent. A failed batch can then retry safely. Stream the live assistant's answers. Engineers then see text within a second.
- **Trade-off:** Batch results arrive hours later. Smaller live batches take longer overall.
- **Follow-up to expect:** "A batch fails halfway." Retry only the failed items, by item ID.

</details>

<details>
<summary>Practice question 21. Hartfell's assistant handled 50,000 tasks last month: $2,000 in model costs, $500 in infrastructure, 80 per cent success, and $3 per failure downstream. What is the cost per successful task?</summary>

- **Answer:** Failures: 20 per cent of 50,000 is 10,000, at $3 each, $30,000. Total cost: $2,000 + $500 + $30,000 = $32,500. Successes: 40,000. Cost per successful task: $32,500 ÷ 40,000 ≈ $0.81. The model bill is about 6 per cent of it. Raising success by five points would save more than halving the model bill.
- **Trade-off:** Including failure cost needs an agreed estimate. Leaving it out hides most of the cost.
- **Follow-up to expect:** "Where does the $3 come from?" Desk time per escalation, agreed with the customer.

</details>

<details>
<summary>Practice question 22. Build a cost breakdown for a new RAG assistant before launch.</summary>

- **Answer:** Follow the request path and the jobs behind it. Ingestion: parsing, the first full embedding run, then daily changed content. Storage: vector database and document store. Each query: query embedding, search, reranking, and generation input and output tokens. Then evaluation runs, logging and failure handling. Multiply each by expected volume, add the failure cost, and divide by expected successful tasks. Mark which inputs are estimates.
- **Trade-off:** A detailed model takes time and still has guesses. A single token estimate misses ingestion and failures.
- **Follow-up to expect:** "Which line usually surprises?" Repeated full re-embedding and long prompts.

</details>

## Key takeaways

- Find out what happened before retrying or undoing a timed-out step.
- Consumers skip processed event IDs and drop events older than the stored version.
- Retry at one layer, with backoff, jitter, a budget and a breaker.
- Replay dead-letter queues by cause, at a limited rate, through the idempotent consumer.
- A growing queue with low CPU means waiting. Compute throughput from concurrency and wait time.
- Drain time is backlog ÷ (capacity − arrivals). Work backwards from a deadline to the capacity it needs.
- Read a trace before choosing a fix. Fix the query before caching it, and add capacity last.
- Judge context budgets, routing, fallbacks and batching by cost per successful task.

## Check yourself

<details>
<summary>1. In practice question 3, why reply 200 to the webhook before processing it?</summary>

Slow replies make the sender time out and send again, which adds duplicates. Storing the event first and processing from a queue keeps replies fast and nothing is lost.

</details>

<details>
<summary>2. In practice question 7, why does the breaker keep reopening?</summary>

One successful trial lets full traffic back, and the still-weak service fails again under that load.

</details>

<details>
<summary>3. In practice question 12, why is the needed capacity 90 a second and not 45?</summary>

45 a second is the rate the backlog must fall. New messages still arrive at 45, so consumers must handle both.

</details>

<details>
<summary>4. In practice question 15, why fix the query before adding a cache?</summary>

A cache leaves the slow query in place. Every miss, such as just after a price change at peak, still pays its full cost.

</details>

<details>
<summary>5. In practice question 17, why must every passage be re-embedded?</summary>

Vectors from different embedding models are not comparable. Old and new vectors cannot share an index.

</details>
