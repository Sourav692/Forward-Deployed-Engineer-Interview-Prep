# Practise AI Delivery


## How to use this practice

These questions ask you to design something: a prompt, a schema, a pipeline, an evaluation set or a recovery path. Answer aloud as if at a whiteboard, sketching the parts. Then compare with the outline.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Designing extraction prompts, schemas and review thresholds.
> - Propagating permission changes and deletions.
> - Making agents recover, stop and ask for approval properly.
> - Building evaluation sets and retrieval experiments.
> - Testing for injection and mapping data flows.
> - Designing a voice and screenshot support flow.

## Extraction

Taught in [extraction you can trust](/learn/fde-building-in-the-estate/ai-delivery-in-customer-estates/extraction-you-can-trust).

<details>
<summary>Practice question 1. Write the outline of a prompt that extracts fields from supplier emails, which anyone can send.</summary>

- **Answer:** State the task and list the exact fields with types. Put the email inside clear delimiters and say that nothing inside them is an instruction. Allow `null` with a reason for any field not present. Ask for the source span of each money field. Give no free-text field and no tools. Code then validates every field before use.
- **Trade-off:** A strict prompt drops useful context a free-text field might hold. That context is also what an attacker would use.
- **Follow-up to expect:** "The email says to ignore your instructions." The output can only hold listed fields, so the instruction has nowhere to go.

</details>

<details>
<summary>Practice question 2. Design the schema and validation for extracting Hallam Clinic's supplier invoices.</summary>

- **Answer:** Schema: supplier ID, invoice number, invoice date, line items (description, quantity, unit price in pence), VAT in pence, total in pence, purchase order number, each with an evidence span. Nullable fields carry a reason. Validation in code: lines plus VAT equal total, supplier exists, purchase order is open and matches the supplier, invoice not already paid.
- **Trade-off:** Pence avoids rounding errors but needs conversion at display. Pounds as decimals invite floating-point mistakes.
- **Follow-up to expect:** "Some invoices have no purchase order." Allow `null` with a reason and send those to review.

</details>

<details>
<summary>Practice question 3. Penwith Insurance wants to classify incoming claim emails and extract the claim number, with as little manual review as is safe. Design it.</summary>

- **Answer:** Classes: new claim, update, complaint, other and unclear. Extract the claim number and check it exists. Label 500 emails, measure per-class and per-field error, and compute review volume and escaped errors for a few confidence thresholds. Route complaints and unclear emails to people always. Pick the threshold that fits review capacity, with the business owner.
- **Trade-off:** A lower threshold sends more to review. A higher one lets more errors through.
- **Follow-up to expect:** "Error rates change next quarter." Re-measure quarterly and after any model or prompt change.

</details>

## Permissions and deletions

Taught in [permissions, deletions and citations](/learn/fde-building-in-the-estate/ai-delivery-in-customer-estates/permissions-deletions-and-citations).

<details>
<summary>Practice question 4. Design how document updates, deletions and permission changes in Hallam's file store reach the assistant.</summary>

- **Answer:** Subscribe to the store's change events. An update re-ingests the document and replaces its chunks by document ID. A deletion removes chunks, embeddings and cache entries built from it. A permission change rewrites the access list on its chunks and clears dependent cache entries. A nightly job compares IDs and access lists between source and index. Alert when lag passes the agreed limit, such as 15 minutes.
- **Trade-off:** Events are fast but get lost. The nightly sweep is slow but complete. Use both.
- **Follow-up to expect:** "The store has no events." Poll for changes by modified time, and shorten the sweep interval.

</details>

## Agents

Taught in [agents that touch business systems](/learn/fde-building-in-the-estate/ai-delivery-in-customer-estates/agents-that-touch-business-systems).

<details>
<summary>Practice question 5. Tarrow's agent keeps calling the stock tool and the order tool in turn and never finishes. What do you do?</summary>

- **Answer:** Stop it in code: cap tool calls per task, detect the same call with the same arguments repeating, and set a spend ceiling. On any limit, hand the case to a person with the trace. Then read the traces for the cause, often a tool result the model cannot act on, such as an ambiguous stock status. Make that result explicit.
- **Trade-off:** Tight caps stop some long legitimate tasks. Loose caps waste money and time.
- **Follow-up to expect:** "How do you set the cap?" From the step counts of successful traces, with headroom.

</details>

<details>
<summary>Practice question 6. A call to Brisco's billing system to apply a credit times out. Did it happen? What does the agent do?</summary>

- **Answer:** The outcome is unknown, not failed. Query the billing system by idempotency key or by account and amount. If the credit exists, record it and continue. If not, retry with the same key. If the system can answer neither way, stop and hand the case to a person with the details, and tell the customer it is being checked.
- **Trade-off:** Checking adds a call and latency. A blind retry risks a double credit.
- **Follow-up to expect:** "The status endpoint lags." Wait and re-check a set number of times before escalating.

</details>

<details>
<summary>Practice question 7. Design checkpointing for a Tarrow agent that rebooks a delivery, refunds the fee and emails the customer, so a crash at any point recovers.</summary>

- **Answer:** Store run state in a database after each step: step name, status, idempotency key and result. Assign each external action its key before calling. On restart, load the state, skip steps marked done, and for any step marked started, repeat it with the same key or query its status. Send the email last, with its own key, so a customer is never told about a refund that did not happen.
- **Trade-off:** A workflow engine gives this for free but adds infrastructure. A hand-built table is simpler and easy to get wrong.
- **Follow-up to expect:** "The refund succeeded but rebooking fails for good." Record partial completion and hand it to a person.

</details>

<details>
<summary>Practice question 8. What must an approval request from Tarrow's agent show a supervisor?</summary>

- **Answer:** The exact action and arguments: customer, order, amount, method. The policy rule that allows it and any limit it exceeds. The agent's reason and the evidence, such as the damage photo. What changes in the system, before and after. An expiry time. Approve and reject buttons, with a reason field for rejection. The approval stores a hash of the action.
- **Trade-off:** More detail slows each approval. Less detail turns approval into a click without a check.
- **Follow-up to expect:** "Supervisors approve everything." Sample approvals for review and show the approver their rejection rate.

</details>

## Evaluation

Taught in [evaluating on the customer's work](/learn/fde-building-in-the-estate/ai-delivery-in-customer-estates/evaluating-on-the-customers-work).

<details>
<summary>Practice question 9. Design an experiment to choose between keyword, vector and hybrid search for Brisco's tariff assistant.</summary>

- **Answer:** Take 300 real questions from logs, with team leaders labelling the passage that answers each. Run each search mode on the same index and record whether the passage is in the top five, and its rank. Report by question type, such as codes, dates and plain questions. Also measure latency. Pick the mode that wins on the types that matter, and keep the set for later changes.
- **Trade-off:** Labelling 300 questions takes days. Choosing by a demo takes minutes and is often wrong.
- **Follow-up to expect:** "Hybrid wins by one point." Check whether that is within noise before adding its cost.

</details>

<details>
<summary>Practice question 10. Build an evaluation set for Hallam's HR policy assistant.</summary>

- **Answer:** Pull 400 questions from the HR inbox and search logs across a year. Stratify by topic: leave, pay, conduct, sickness. Add questions whose answer changed with a recent policy update, and questions the policies do not answer, where the right response is to decline. Have HR advisers write the expected answer and source. Freeze a test split.
- **Trade-off:** Advisers' time is scarce. Without them the labels are guesses.
- **Follow-up to expect:** "Policies change in April." Date every label and re-label the affected cases.

</details>

<details>
<summary>Practice question 11. Penwith's retrieval finds the right passage 85% of the time, and answers are correct 92% of the time when it does. How do you report accuracy, and what do you fix first?</summary>

- **Answer:** If independent, end to end is about 0.85 × 0.92 = 78%. Measure it directly on the same set and report all three numbers. Then attribute failures: of 100 cases, about 15 fail at retrieval and about 7 at generation. Retrieval is the larger loss. Start with ingestion and search, then the prompt.
- **Trade-off:** Stage metrics need traces stored per case. One end-to-end number hides where to work.
- **Follow-up to expect:** "Some answers are right without the passage." Count them, and check they are not guesses.

</details>

## Untrusted content

Taught in [untrusted content in customer data](/learn/fde-building-in-the-estate/ai-delivery-in-customer-estates/untrusted-content-in-customer-data).

<details>
<summary>Practice question 12. Write the adversarial test cases for Penwith's claims agent.</summary>

- **Answer:** One per untrusted input: hidden text in a PDF asking to email the file out, an instruction in an email signature, a command in a garage's notes returned by a tool, text in a photo asking to change bank details, and a request to reveal the system prompt. Each asserts on tool calls, such as no outbound message to an unlisted domain. Run them every release.
- **Trade-off:** The suite needs new cases as attacks change. A fixed suite gives false comfort.
- **Follow-up to expect:** "A case starts failing." Block the release and trace which layer let it through.

</details>

<details>
<summary>Practice question 13. Draw the data-flow inventory for Brisco's billing assistant.</summary>

- **Answer:** Rows: call notes into ingestion, documents into the vector store, prompts to the model provider, responses to agents, logs and traces, answer cache, evaluation sets built from logs, and backups. For each: data classes, who can access it, location, retention and deletion method. Mark untrusted inputs. Review it with Brisco's security and privacy teams.
- **Trade-off:** Keeping it current takes discipline. A stale inventory fails the first erasure request.
- **Follow-up to expect:** "Which row worries you most?" Logs, because they copy everything and are kept longest.

</details>

## Voice and screenshots

Taught in [voice and multimodal in operations](/learn/fde-building-in-the-estate/ai-delivery-in-customer-estates/voice-and-multimodal-in-operations).

<details>
<summary>Practice question 14. Design a Tarrow support flow where customers describe a website fault by phone and send a screenshot.</summary>

- **Answer:** The voice agent takes the description and sends a text link to upload a screenshot. A multimodal model reads the order number and error from the image. The agent checks the order exists and reads back what it sees for confirmation. The screenshot is redacted and kept for 30 days. Known errors get a scripted fix. Anything else goes to staff with the transcript and image.
- **Trade-off:** The upload step adds friction. Without it, staff ask the same questions again.
- **Follow-up to expect:** "The screenshot shows someone else's card details." Redact before storage and never send that region to the model.

</details>

## Key takeaways

- Extraction needs listed fields, nullable values, checks in code and thresholds from measured error.
- Permission changes and deletions travel by event, with a nightly sweep behind them.
- Agents need step caps, idempotency keys, checkpoints and exact approvals.
- Evaluate on real labelled work, by stage and by slice.
- Test injection against tool calls, and keep a data-flow inventory current.

## Check yourself

<details>
<summary>1. In practice question 6, why is a timeout not a failure?</summary>

The credit may have been applied before the answer was lost. Only a status check or a retry with the same key is safe.

</details>

<details>
<summary>2. In practice question 11, which stage loses more cases, and by how many per hundred?</summary>

Retrieval, about 15 per hundred against about 7 for generation, since 92% of the 85 retrieved cases is about 78.

</details>
