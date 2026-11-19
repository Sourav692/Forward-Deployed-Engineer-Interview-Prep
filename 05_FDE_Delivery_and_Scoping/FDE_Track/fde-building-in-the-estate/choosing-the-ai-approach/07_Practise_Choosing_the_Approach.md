---
title: "Practise choosing the approach"
subtitle: "Eight practice questions on measuring a baseline, comparing and costing models, running inside a customer's boundary, sizing self-hosted inference, combining techniques and drawing a workflow."
track: "Building Inside the Customer's Estate"
module_group: AI delivery
module_code: T21.4
module_name: Choosing the AI approach
lesson: 7
lessons: ["Rules, classical ML or an LLM", "Picking a model for a customer", "Hosted or open-weight", "Self-hosted inference capacity", "Prompting, RAG or fine-tuning", "Workflow or agent", "Practise choosing the approach"]
level: intermediate
reading_time: "12 min"
source: "Forward Deployed Engineering track"
author: Sourav Banerjee
last_updated: "20 November 2026"
tags: [practice, interview, model selection, token cost, inference capacity, workflows]
---

## How to use this practice

These questions ask you to produce something: a baseline plan, a comparison, a cost, a diagnosis, a test plan or a design. Answer aloud as if at a whiteboard, and write the numbers down. Then compare with the outline.

Every customer, price and figure below is fictional. Check a provider's current prices before quoting one in a real engagement.

> **What you'll practise**
>
> - Measuring a baseline and splitting a request across rules and a model.
> - Comparing two models on cost and quality, and costing a workload from token counts.
> - Choosing a deployment when the work must stay inside the customer's environment.
> - Diagnosing GPU memory under load and planning a capacity and acceptance test.
> - Combining retrieval and style, and drawing a process as a workflow.

## Rules, classical ML or an LLM

Taught in [rules, classical ML or an LLM](01_Rules_ML_or_an_LLM.md).

<details>
<summary>Practice question 1. Kestrel Telecom wants an LLM to sort 20,000 customer emails a month into five queues. Keyword rules route 78% correctly today, and agents fix the rest. One queue, number transfers to another network, must be actioned within one working day. How do you decide what to build?</summary>

- **Answer:** Label a sample first: about 500 recent emails, labelled by two senior agents, with number-transfer emails over-sampled so there are at least 50. Measure three baselines on it: everything to the largest queue, the agents' current accuracy from the reassignment log, and the existing rules. Report recall for number transfers on its own line. Then split by decision type. A transfer request carries a code the customer received from their network, so a rule can catch it. Only the emails the rules cannot place go to a model, and it ships only if it beats all three baselines per queue.
- **Trade-off:** Labelling 500 emails costs the agents a day or two. Without it, nobody can say whether the model beats the 78% the rules already reach.
- **Follow-up to expect:** "The sponsor wants an LLM anyway." Show the per-queue table. If the rules already clear the bar on transfers, the LLM adds cost there and no safety.

</details>

## Choosing and costing a model

Taught in [picking a model for a customer](02_Picking_a_Model_for_a_Customer.md).

<details>
<summary>Practice question 2. Kestrel Telecom wants reply suggestions for its chat agents. Model A passes 84% of a 300-chat test, Model B 91%, against a bar of 88%. B costs ten times as much per token. What do you recommend?</summary>

- **Answer:** Cost both at full volume first. At 400,000 suggestions a month, 2,000 input and 150 output tokens each, A at $0.50 and $2 per million costs $400 + $120 = $520. B at $5 and $20 costs $4,000 + $1,200 = $5,200. A fails the bar, so it is not yet a candidate. Read A's failures: if they cluster in one kind of chat, route that kind to B and retest. Otherwise B is the answer at $4,680 a month more, and the customer decides if 7 points are worth it.
- **Trade-off:** Routing saves money but adds a rule to maintain and two models to evaluate.
- **Follow-up to expect:** "Agents wait for the suggestion." Then compare p95 latency too, measured at peak.

</details>

<details>
<summary>Practice question 3. Oakham Legal will summarise 50,000 documents a month, about 4,000 tokens in and 300 out each. Prices are $2 per million input and $10 per million output tokens. Cost it.</summary>

- **Answer:** Input: 50,000 × 4,000 = 200 million tokens, × $2 = $400. Output: 50,000 × 300 = 15 million tokens, × $10 = $150. Base cost $550 a month. Then add what the worksheet misses: evaluation runs, say a 200-document set rerun 20 times a month, which is 4,000 documents or 8%, and about 5% for retries. That gives about $622. Confirm the token counts with the provider's counter on real documents.
- **Trade-off:** A careful estimate takes an hour of measuring. A guess per page can be wrong by a factor of two.
- **Follow-up to expect:** "Volume triples next year." Cost scales with tokens, so about $1,865, before any caching discount.

</details>

## Running inside the customer's environment

Taught in [hosted or open-weight](03_Hosted_or_Open_Weight.md).

<details>
<summary>Practice question 4. Oakham Legal's policy says client documents never leave the firm's own data centre, and it uses no public cloud. How do you deliver a model?</summary>

- **Answer:** Confirm the policy text with its owner, because "no cloud" rules out a managed model in a cloud account too. That leaves an open-weight model on the firm's own GPUs. Shortlist models whose licences allow commercial use, test them on a labelled sample of the firm's documents, and size the hardware with a capacity test. Name who will run serving, patching, on-call and upgrades after you leave.
- **Trade-off:** Full control of data and model version, in exchange for hardware lead times, GPUs paid for busy or idle, and a team to run them.
- **Follow-up to expect:** "They expect the quality of the best hosted model." Show the gap on their own sample. Narrow tasks often close most of it.

</details>

## Self-hosted inference capacity

Taught in [self-hosted inference capacity](04_Self_Hosted_Inference_Capacity.md).

<details>
<summary>Practice question 5. Mirelle Pharma's research team serves a 14-billion-parameter model on one 48 GB GPU. With 20 users on long documents, requests fail with out-of-memory errors. Diagnose it and propose fixes.</summary>

- **Answer:** Weights at 16 bits take 28 GB. With the server using 90% of memory, about 43 GB, and about 3 GB of working memory, roughly 12 GB is left for the cache. At a measured 0.2 MB per token, an 8,000-token request needs 1.6 GB, so about 7 fit, not 20. Fixes: store weights at 8 bits, freeing 14 GB so about 16 fit, after rerunning the evaluation set. Cap input length, queue requests with a visible status, or add a GPU. Also check the server's memory and maximum-length settings, since a full cache should queue requests, not crash.
- **Trade-off:** Smaller weights fit more requests but may lose accuracy. A second GPU costs more but keeps quality.
- **Follow-up to expect:** "Which fix first?" The settings and a queue, because they cost nothing.

</details>

<details>
<summary>Practice question 6. Arden Bank will run a self-hosted model for live chat help, with a peak of 120 concurrent chats. Plan the capacity and acceptance test.</summary>

- **Answer:** Profile the real peak and the length mix from chat logs. Test on hardware and settings identical to production. Replay anonymised real chats, ramp to 180 concurrent, one and a half times the peak, then hold the peak for two hours to catch slow leaks. Measure time to first token, p95 time to a full answer, errors, queue length and cache use. Kill one server mid-test to check failover. Rerun the quality set under load. Agree the bar in writing first, such as p95 time to first token under 1.5 seconds at 120 concurrent with no errors.
- **Trade-off:** A full test takes days of setup. Skipping it moves the discovery to go-live.
- **Follow-up to expect:** "When do you rerun it?" Before any model, server or traffic change.

</details>

## Prompting, RAG or fine-tuning

Taught in [prompting, RAG or fine-tuning](05_Prompting_RAG_or_Fine_Tuning.md).

<details>
<summary>Practice question 7. Kestrel Telecom's assistant must quote current tariffs, which change every month, in Kestrel's brand voice. Which techniques do you use?</summary>

- **Answer:** Retrieval for the tariffs, from the published catalogue, with each entry's effective dates so only current prices reach the prompt. Style through the prompt template: voice rules and three approved example answers. Evaluate facts and style separately on the same test set. If style stays below the bar after examples, add a light fine-tune for voice only, and keep the facts in retrieval.
- **Trade-off:** Retrieval keeps prices current but can fetch the wrong tariff, so evaluate retrieval on its own. Fine-tuning for voice adds a retraining cycle.
- **Follow-up to expect:** "A tariff changes at midnight." Tie the index update to the catalogue's publishing step, and filter by effective date.

</details>

## Workflow or agent

Taught in [workflow or agent](06_Workflow_or_Agent.md).

<details>
<summary>Practice question 8. Oakham Legal wants AI to review its 6,000 monthly expense claims with receipts. Design it.</summary>

- **Answer:** Draw it as a workflow, because the steps are known. Rules check eligibility, policy limits and duplicates. A model step reads each receipt and extracts merchant, date, amount and category. Rules compare those with the claim. Matches within policy go to the manager for approval as today. Mismatches, low-confidence extractions and claims over limits go to a finance reviewer with the reason shown. Nothing needs an agent, because no step's path depends on what it finds.
- **Trade-off:** A workflow is cheaper and easier to audit than an agent, but it will not handle a case nobody drew. Route those to the reviewer.
- **Follow-up to expect:** "A receipt is in another currency." Add a rule that converts at the firm's published rate for the claim date.

</details>

## References

1. The lessons linked under each heading in this module.

## Key takeaways

- Measure the current process and the existing rules before any model, and report the costly category on its own line.
- Cost every model at full volume before comparing, and never treat a model that fails the bar as the cheap option.
- Read the customer's boundary policy word for word before choosing between managed and self-hosted models.
- Size self-hosted inference from memory arithmetic, then prove it with real inputs above the peak.
- Put changing facts in retrieval and style in the prompt, or in a light fine-tune.
- Draw a process before adding autonomy, and route the cases nobody drew to a person.

## Check yourself

<details>
<summary>1. In practice question 2, why is Model A not the cheaper choice?</summary>

It fails the 88% bar, so it does not meet the requirement at any price. Only designs that pass are compared on cost.

</details>

<details>
<summary>2. In practice question 5, why does 8-bit storage let about 16 requests fit instead of 7?</summary>

Weights shrink from 28 GB to 14 GB, so the cache grows from about 12 GB to about 26 GB, which holds about 16 requests at 1.6 GB each.

</details>
