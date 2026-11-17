# Practise Working in Customer Code


## How to use this practice

These questions are practical: an interviewer may ask you to write the code, sketch it on a whiteboard or talk it through. Answer aloud first, naming the steps, data structures and checks you would use. Then compare with the outline. The outlines describe the code in words, so you can write it in whichever language the interview uses.

Every customer and figure below is fictional.

> **What you'll practise**
>
> - Tracing a wrong number and shrinking a failure to a minimal reproduction.
> - Keeping one validation contract in Python and TypeScript.
> - Keeping the latest record per key, and fetching with bounds and timeouts.
> - Reviewing a change that hides errors.

## Finding the code behind a number

Taught in [reading an unfamiliar codebase](/learn/fde-building-in-the-estate/working-in-customer-code/reading-an-unfamiliar-codebase).

<details>
<summary>Practice question 1. Jessop Engineering's sales dashboard shows £1.20 million for the third quarter, and finance says £1.26 million. You have the repository and a copy of the database. Find the code responsible.</summary>

- **Answer:** Open the dashboard with the network panel and read the request and reply. If the reply says 1.20 million, the backend computes it. Search for the route, follow it to the query, and run that query by hand. Then compare rows, not totals: export the order IDs behind each figure and find the ones in finance's list only. The £60,000 of missing orders usually share a cause, such as a date boundary, a time zone, a status filter, a currency conversion or a join that drops rows. Check `git log` on the query for a recent change.
- **Trade-off:** Comparing row by row takes longer than reading code. It shows the cause directly instead of a theory.
- **Follow-up to expect:** "The dashboard is higher than finance." Look for duplicate rows from a join, or refunds counted as sales.

</details>

## One contract in two languages

Taught in [choosing the language and keeping code maintainable](/learn/fde-building-in-the-estate/working-in-customer-code/choosing-the-language-and-keeping-code-maintainable).

<details>
<summary>Practice question 2. Hythe Shipping's booking form and booking API must apply the same rules: container ID of four letters and seven digits, gross weight from 1 to 30,480 kg, a departure date not in the past, and a known port. Write them in TypeScript and Python and keep them in step.</summary>

- **Answer:** Write the rules once as a JSON Schema, or as a Pydantic model that exports one, and generate or check the Zod schema in TypeScript from it in CI. Use one error shape on both sides: field, code, message. Load the port list from the API rather than hard-coding it in the form. Define "not in the past" against one clock, such as the departure port's local date, and say which. Add a file of about 30 examples marked valid or invalid, and run it in both test suites. The API's check stays authoritative.
- **Trade-off:** Generation needs a build step both teams accept. Shared examples are lighter but cover only the cases listed.
- **Follow-up to expect:** "The rules differ by customer." Keep the rules as data in one place, never as branches copied into each side.

</details>

## Minimal reproductions

Taught in [reproduce, isolate, fix](/learn/fde-building-in-the-estate/working-in-customer-code/reproduce-isolate-fix).

<details>
<summary>Practice question 3. Garrow Software's invoice export fails for one account out of 3,000 with a character-encoding error. Build a minimal reproduction.</summary>

- **Answer:** Capture the four inputs: the account's export settings, its data, the version and the environment. The settings show the export encoding set to Windows-1252 for an old accounting system. Take the failing invoice, anonymised with the unusual characters kept. Halve its 64 lines until one remains, about six runs. Strip fields until one is left: a product description containing an emoji, which Windows-1252 cannot represent. The reproduction is one invoice, one line, that character and that setting. It becomes the regression test.
- **Trade-off:** Halving costs a few runs. Guessing at encoding bugs without it often fixes the wrong field.
- **Follow-up to expect:** "What is the fix?" Agree a policy with the customer: replace unrepresentable characters and report them, or reject with a clear message.

</details>

## The latest record per key

Taught in [data handling for real exports](/learn/fde-building-in-the-estate/working-in-customer-code/data-handling-for-real-exports).

<details>
<summary>Practice question 4. Hythe receives daily files of customer address changes. A customer can change address several times, and some files arrive a day late. Keep the latest address per customer.</summary>

- **Answer:** Stream each file and keep a dictionary keyed by customer ID, holding the change with the newest effective time. Compare effective times, never file order, so a late file cannot overwrite a newer address. Break ties with the source's sequence number, or an agreed rule. Treat a deletion as a record too, so a later stale update cannot bring the customer back. Make reruns harmless: loading the same file twice gives the same result. When customer IDs do not fit in memory, upsert into the database only where the incoming time is newer.
- **Trade-off:** The dictionary is fast but bounded by memory. The conditional upsert scales but costs a database write per change.
- **Follow-up to expect:** "Two changes have the same time and no sequence." Quarantine the pair for review.

</details>

## Bounded fetches

Taught in [concurrency without surprises](/learn/fde-building-in-the-estate/working-in-customer-code/concurrency-without-surprises).

<details>
<summary>Practice question 5. Fetch prices for 500 parts from a supplier API that allows 10 concurrent calls. Calls take about 0.3 seconds, some hang. Return what you can within 25 seconds.</summary>

- **Answer:** Share one HTTP client. Put a semaphore of 10 around each call, and give each call a 3-second timeout. Start all 500 tasks behind the semaphore, and wrap the whole fetch in a 25-second deadline. At the deadline, cancel what is still running and collect the finished results. Return two things: prices by part number, and a list of missing parts with the reason, such as timeout, error or not reached. At normal speed, 500 calls take 50 rounds of 0.3 seconds, about 15 seconds, leaving room for a few timeouts and one retry of rejected calls with backoff.
- **Trade-off:** A tighter deadline returns faster with more gaps. A looser one is more complete but slower for the user.
- **Follow-up to expect:** "The client library blocks." Run calls in a thread pool of 10 instead, and set the timeout inside the library.

</details>

## Reviewing a change that hides errors

Taught in [reviewing AI-generated changes](/learn/fde-building-in-the-estate/working-in-customer-code/reviewing-ai-generated-changes).

<details>
<summary>Practice question 6. An assistant's change to Jessop's order sync wraps each database write in a handler that logs the error and moves on. Review it and say what you would ask for.</summary>

- **Answer:** The handler catches every error, so a failed write looks the same as a successful one and orders go missing without trace. Ask which errors are expected. A duplicate key on a rerun can be skipped, logged with the order ID and counted. Everything else, such as a lost connection or a constraint violation, should fail the batch. Ask for a run summary of written, skipped and failed counts, a non-zero exit status when anything fails, and an alert. Ask for a test that makes the write fail and checks the job reports failure.
- **Trade-off:** Failing the batch delays good orders behind one bad one. Continuing silently loses orders nobody knows about.
- **Follow-up to expect:** "The business wants good orders through anyway." Then quarantine the failures with reasons, and alert on the count.

</details>

## Key takeaways

- Compare rows, not totals, when two numbers disagree.
- Keep one source for a validation rule, and shared examples that both sides must pass.
- Shrink a failure by halving lines, fields and settings until one cause remains.
- Compare event times, never file order, when keeping the latest record.
- Bound concurrency, time out every call and say what is missing.
- Catch only the errors you can handle, and make every other failure loud.

## Check yourself

<details>
<summary>1. In practice question 3, why does halving 64 lines take about six runs?</summary>

Each run halves the lines that might contain the cause: 64, 32, 16, 8, 4, 2, then 1. Two to the power six is 64.

</details>

<details>
<summary>2. In practice question 4, why record deletions instead of removing the customer?</summary>

A stale update from a late file could otherwise recreate the deleted customer. The deletion record, with its time, wins the comparison.

</details>
