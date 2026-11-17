---
title: "Practise reliability, performance and cost, part 2"
subtitle: "Eleven practice questions on growing queues, drain time, load tests, backpressure and the cost of AI features per successful task."
track: "Deploying and Operating in the Customer's Estate"
module_group: Release and operate
module_code: T23.6
module_name: Reliability, performance and cost in their estate
lesson: 6
lessons: ["Recovering half-finished work", "Latency, queues and load tests", "Finding the real bottleneck", "AI cost per successful task", "Practise reliability, performance and cost, part 1", "Practise reliability, performance and cost, part 2"]
level: intermediate
reading_time: "14 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "17 November 2026"
tags: [practice, interview, queues, load testing, cost, AI system design]
---

## How to use this practice

These questions come up when a customer says the system is slow, backed up or too expensive. Answer aloud in about two minutes, and do the arithmetic out loud where a question gives numbers. Then compare with the outline. Part 1 covers recovering half-finished work.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Explaining a growing queue when every graph looks calm.
> - Working out drain time and the capacity a deadline needs.
> - Designing load tests and backpressure for an AI service.
> - Testing context budgets, routing, fallbacks and batch jobs by cost per successful task.
> - Breaking down what a RAG system costs.

## Queues, load tests and backpressure

Taught in [latency, queues and load tests](02_Latency_Queues_and_Load_Tests.md).

<details>
<summary>Practice question 1. Hartfell Energy's document ingestion queue grows all day, but the workers' CPU sits at 10 per cent. Why, and what do you do?</summary>

- **Answer:** The workers are waiting, not working. Eight workers each process one document at a time, and each waits about 2 s on the text-extraction service. By Little's law they finish at most 8 ÷ 2 = 4 documents a second. If 5 arrive, the queue grows by 3,600 an hour while CPU stays low. Raise concurrency with more workers or asynchronous calls, within the extraction service's limits. Then measure throughput, not CPU.
- **Trade-off:** More concurrency moves the pressure to the extraction service. Fewer workers leave the backlog growing.
- **Follow-up to expect:** "The extraction service caps calls." Batch documents per call, or ask for a higher limit.

</details>

<details>
<summary>Practice question 2. After an outage, Hartfell's queue holds 54,000 messages. Consumers handle 60 a second and 45 arrive. How long until it clears, and what would clear it in 20 minutes?</summary>

- **Answer:** The backlog falls by 60 − 45 = 15 a second, so 54,000 ÷ 15 = 3,600 s, one hour. To clear in 20 minutes, 1,200 s, it must fall by 54,000 ÷ 1,200 = 45 a second. With 45 still arriving, consumers need 90 a second, one and a half times today's capacity. Check that the downstream system can take 90 a second before scaling consumers.
- **Trade-off:** Scaling for the backlog costs money for an hour. Waiting leaves data stale for that hour.
- **Follow-up to expect:** "Arrivals rise to 60." Then it never clears without more capacity.

</details>

<details>
<summary>Practice question 3. Design a load-test suite for Hartfell's assistant before it reaches all 3,000 field engineers.</summary>

- **Answer:** Set pass rules first, such as time to first token under 2 s at p95 and errors under 1 per cent. Replace the model with a mock that returns realistic latency and token counts. Tests then cost little. Run a baseline at the expected rate, a spike at the 07:00 shift start, a stress run to the breaking point, a run with the vector database slowed, and a soak for hours. Finish with a short run against the real model to check its rate limits.
- **Trade-off:** A mock hides the model's own variability. Testing only against the real model is slow and costly.
- **Follow-up to expect:** "What fails first?" Usually the provider's tokens-per-minute limit.

</details>

<details>
<summary>Practice question 4. Hartfell's ingestion API accepts uploads faster than workers process them, and the queue's memory fills. Design backpressure.</summary>

- **Answer:** Bound the queue at a depth the workers clear in an agreed time. When it is full, the API returns 429 with Retry-After, and the upload client backs off. Workers take a few messages at a time. A slow downstream then slows intake. Give re-indexing jobs a lower priority than new work orders, and pause them first. Alert on queue depth and oldest message age, not only on errors.
- **Trade-off:** Rejecting uploads moves waiting to the client. Accepting everything risks losing the whole queue.
- **Follow-up to expect:** "The client cannot retry." Accept to durable storage, and process later from there.

</details>

## Cost of AI features

Taught in [AI cost per successful task](04_AI_Cost_per_Successful_Task.md).

<details>
<summary>Practice question 5. During a four-hour provider outage, Hartfell's fallback model answered all questions, and complaints rose. What do you change?</summary>

- **Answer:** The fallback was never measured against the same standard. Run it on the graded question set to know its success rate per task type. Allow it only for task types where it scores acceptably, such as lookups. For safety-related questions, return the manual section and a notice instead. Label fallback answers in logs and to users, and alert when the fallback share passes a threshold.
- **Trade-off:** Restricting the fallback serves fewer users during outages. Allowing everything serves weak answers.
- **Follow-up to expect:** "Could you use a second provider's top model?" Yes, after the same evaluation.

</details>

<details>
<summary>Practice question 6. Hartfell is changing to a new embedding model. A colleague says only changed passages need embedding. Is that right?</summary>

- **Answer:** Not this time. Vectors from different embedding models cannot be compared. Every passage must be re-embedded into a new index. Build it alongside the old one, compare retrieval on a graded set, then switch. Afterwards, re-embed only new or changed passages, detected by a hash of the text. Store the model version with each vector and in the hash key. A model change then forces a full rebuild by design.
- **Trade-off:** A full rebuild costs one large run. Mixing models in one index breaks retrieval quietly.
- **Follow-up to expect:** "How do you avoid downtime?" Keep serving the old index until the new one passes.

</details>

<details>
<summary>Practice question 7. Design an experiment to test a smaller context budget for a RAG assistant.</summary>

- **Answer:** Take a graded set of a few hundred real questions, with experts' expected answers. Run the current and proposed budgets on the same set. Measure success rate, cost per question, cost per successful task, latency and which passages were dropped from failed answers. Agree the decision rule first, such as adopt if cost per success falls and success drops under one point. Then run a small live trial behind a flag.
- **Trade-off:** A graded set takes expert time. Testing on live users risks failures in the field.
- **Follow-up to expect:** "Results differ by question type." Set budgets per type.

</details>

<details>
<summary>Practice question 8. Design model routing for Hartfell's assistant.</summary>

- **Answer:** Start with three classes: lookups, explanations and safety-related questions. Classify with rules, then a small model if rules miss too many. Send lookups to a cheap model, explanations to a stronger one, and safety questions to the strongest with a required citation. Let the cheap model escalate when unsure. Measure success and cost per class weekly on graded samples, and log every route.
- **Trade-off:** More classes save more and add misrouting. One model avoids misroutes and costs more.
- **Follow-up to expect:** "The classifier is wrong 5 per cent of the time." Bias errors towards the stronger model.

</details>

<details>
<summary>Practice question 9. Hartfell summarises 40,000 work orders each night in batches of 1,000 and keeps hitting rate limits and timeouts. Users of the live assistant wait for answers too. What do you change?</summary>

- **Answer:** Move the nightly job to the provider's batch processing, which costs less and does not compete with live traffic for the same limits. If that is not available, use smaller batches sized to the tokens-per-minute limit, with backoff, and run off-peak. Make each item idempotent. A failed batch can then retry safely. Stream the live assistant's answers. Engineers then see text within a second.
- **Trade-off:** Batch results arrive hours later. Smaller live batches take longer overall.
- **Follow-up to expect:** "A batch fails halfway." Retry only the failed items, by item ID.

</details>

<details>
<summary>Practice question 10. Hartfell's assistant handled 50,000 tasks last month: $2,000 in model costs, $500 in infrastructure, 80 per cent success, and $3 per failure downstream. What is the cost per successful task?</summary>

- **Answer:** Failures: 20 per cent of 50,000 is 10,000, at $3 each, $30,000. Total cost: $2,000 + $500 + $30,000 = $32,500. Successes: 40,000. Cost per successful task: $32,500 ÷ 40,000 ≈ $0.81. The model bill is about 6 per cent of it. Raising success by five points would save more than halving the model bill.
- **Trade-off:** Including failure cost needs an agreed estimate. Leaving it out hides most of the cost.
- **Follow-up to expect:** "Where does the $3 come from?" Desk time per escalation, agreed with the customer.

</details>

<details>
<summary>Practice question 11. Build a cost breakdown for a new RAG assistant before launch.</summary>

- **Answer:** Follow the request path and the jobs behind it. Ingestion: parsing, the first full embedding run, then daily changed content. Storage: vector database and document store. Each query: query embedding, search, reranking, and generation input and output tokens. Then evaluation runs, logging and failure handling. Multiply each by expected volume, add the failure cost, and divide by expected successful tasks. Mark which inputs are estimates.
- **Trade-off:** A detailed model takes time and still has guesses. A single token estimate misses ingestion and failures.
- **Follow-up to expect:** "Which line usually surprises?" Repeated full re-embedding and long prompts.

</details>

## References

1. The lessons linked under each heading in this module.

## Key takeaways

- A growing queue with low CPU means waiting. Compute throughput from concurrency and wait time.
- Drain time is backlog ÷ (capacity − arrivals). Work backwards from a deadline to the capacity it needs.
- Load test AI services with a mock model, then confirm limits against the real one.
- Judge context budgets, routing, fallbacks and batching by cost per successful task.

## Check yourself

<details>
<summary>1. In practice question 2, why is the needed capacity 90 a second and not 45?</summary>

45 a second is the rate the backlog must fall. New messages still arrive at 45, so consumers must handle both.

</details>

<details>
<summary>2. In practice question 6, why must every passage be re-embedded?</summary>

Vectors from different embedding models are not comparable. Old and new vectors cannot share an index.

</details>
