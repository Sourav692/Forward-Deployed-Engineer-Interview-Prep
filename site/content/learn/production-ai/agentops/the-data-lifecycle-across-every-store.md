# The Data Lifecycle Across Every Store

*Deleting a user's chat history takes one query. Deleting everything the AI system learned from it takes a plan you wrote before the request arrived.*

Data in an AI system does not stay where it landed. A customer's message is stored, summarised, embedded, written into memory, sent to a model provider and quoted in a log. Each copy has its own lifetime and its own way of being found. A data lifecycle policy decides, for every copy, how long it lives, where it may go and how it is removed. This lesson walks through the policy and the deletion path that proves it works.

**Objectives:**

- trace where one piece of user data travels in an AI system;
- set retention by store, including chat history;
- check what model providers keep and for how long;
- design deletion that reaches every copy, and test it.

---

## Follow One Message Through the System

Take one support message: "My order 4471 arrived broken, my number is 07700 900123." In a typical assistant it ends up in at least seven places:

1. **The conversation store**, as the raw message.
2. **A conversation summary**, rewritten for later turns.
3. **Long-term memory**, if the system decided the phone number was worth remembering.
4. **The model provider**, which received it in the prompt.
5. **Traces and logs**, which recorded the prompt for debugging.
6. **The evaluation set**, if someone later picked this conversation as a test case.
7. **The audit log**, which recorded the refund it led to.

The stores from [Know Every Store You Run](/learn/production-ai/scaling-and-reliability/know-every-store-you-run) cover the first three and the last. Traces, evaluation data and the provider are the copies teams forget.

## Set Retention Store by Store

Write a retention rule for every store, with a reason. Shorter is safer, but some records must be kept.

| Store | Example retention | Why |
|---|---|---|
| Conversation history | 90 days, or until the user deletes it | Users want continuity; long histories add risk with little value |
| Summaries | Same as the conversation they came from | Derived state never outlives its source |
| Long-term memory | Until expired, corrected or deleted; reconfirm yearly | Stale memories cause wrong answers |
| Traces and logs | 30 days, with personal fields masked at write time | Enough for incident review |
| Evaluation sets | Only redacted or synthetic copies | Test data should not depend on a real person's consent |
| Audit log | The period a regulator or contract requires | Evidence of what the system did |

Chat history deserves an explicit decision because it is the easiest store to keep forever by accident. Tell users how long it is kept, let them delete it, and make deletion remove the summaries and memories built from it.

## Check What the Model Provider Keeps

Sending data to a model API is a data transfer. Before production, find out from the provider's terms and your contract:

- **Retention.** Does the provider store prompts and outputs, and for how long? Many offer a short abuse-monitoring window and zero-retention options for eligible customers.
- **Training use.** Is your data used to train models? For business APIs the usual answer is no by default, but confirm it in writing.
- **Region.** Where is the data processed and stored? This matters for customers with residency requirements.
- **Sub-processors.** Who else handles it?

Record the answers per provider in the system inventory from [Govern AI Systems by Risk Tier](/learn/production-ai/agentops/govern-ai-systems-by-risk-tier). If a provider keeps prompts for 30 days, your deletion promise has to say so, because you cannot delete their copy early.

## Reduce What You Store in the First Place

The cheapest data to delete is data you never kept.

- **Mask at write time.** Replace phone numbers, emails and account numbers in traces before they are stored.
- **Store references, not copies.** Keep the order ID, not the customer's address, when the order system already holds it.
- **Gate memory writes.** Store only facts a user would expect the system to remember, with their source.
- **Build evaluation sets from redacted or synthetic data.**

## Design Deletion That Reaches Every Copy

A deletion request should run as a workflow, not a support ticket that someone handles by hand.

1. **Find.** Query every store by tenant and user ID. This is why the stable IDs from the stores lesson matter.
2. **Delete or redact.** Remove the conversation, summaries, memories and evaluation copies. Remove the user's documents and rebuild their index entries. Redact personal fields in traces that must stay for a while.
3. **Keep what law requires.** Audit and financial records stay, with personal fields removed where possible and the legal basis recorded.
4. **Record the provider position.** Note any copy the provider still holds and when it expires.
5. **Confirm.** Log the deletion, with what was removed from where, and tell the user.

Then test it. Seed a test user with data in every store, run the deletion and query every store again. A deletion path that has never been tested will miss the store added last quarter.

## Worked Example: Export and Delete for One Customer

A customer asks first for a copy of their data, then for deletion.

- **Export.** The workflow queries every store by user ID and returns their messages, the memories kept about them ("prefers email contact", with source and date), and the refund decisions with their reasons. Seeing the memory surprises the customer, which is a sign the disclosure should mention memory more clearly.
- **Delete.** Conversations, summaries and memories are deleted. One uploaded photo of the broken item is removed from the document store and its embeddings rebuilt. Traces older than 30 days are already gone, and newer ones held only masked fields. The refund record stays for the required period with contact details removed. The provider's 30-day abuse-monitoring copy is noted in the confirmation.
- **Test.** The nightly deletion test, which seeds and deletes a synthetic user, had already caught that the evaluation set was missed when it was added. That gap was fixed before this real request arrived.

---

## Key Takeaways

- One user message spreads into summaries, memory, the provider, traces, evaluation data and audit logs.
- Set retention per store with a reason. Summaries never outlive their source, and chat history needs an explicit limit.
- Know each provider's retention, training use, region and sub-processors, and reflect them in what you promise users.
- Mask, reference and gate at write time, so there is less to delete.
- Run deletion as a tested workflow that finds, deletes or redacts, keeps only what law requires, and confirms.

## Check Yourself

<details>
<summary>1. Which copies of user data do teams most often forget?</summary>

Traces and logs, evaluation sets built from real conversations, and the model provider's own copy.

</details>

<details>
<summary>2. Why must summaries and memories be deleted with the conversation?</summary>

They are derived from it. Keeping them after the source is deleted keeps the user's data in another form and breaks the deletion promise.

</details>

<details>
<summary>3. How do you know the deletion path still works?</summary>

Test it on a schedule with a synthetic user seeded in every store, then query every store afterwards. New stores get caught when the test fails.

</details>

## References

**Sources:** It builds on [Know Every Store You Run](/learn/production-ai/scaling-and-reliability/know-every-store-you-run) and [Govern AI Systems by Risk Tier](/learn/production-ai/agentops/govern-ai-systems-by-risk-tier).

