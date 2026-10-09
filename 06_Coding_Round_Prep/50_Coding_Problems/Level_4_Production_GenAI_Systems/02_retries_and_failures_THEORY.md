# Retries, dead letters, and timeouts: the ideas behind problems 32, 36, 38

Everything a GenAI app depends on fails sometimes: the model API, the vector store, the document connector. These three
problems are about failing well. Retry what is worth retrying, stop before it gets worse, park what cannot be fixed, and
give every slow call a clear label.

## Transient versus permanent errors

A transient error is temporary and may work on the next try: a timeout, a dropped connection, a short rate limit. A
permanent error will fail every time: a malformed request, a missing permission, a corrupt file.

Why it matters: retrying a permanent error wastes money and time and fills logs with noise. Retrying a transient error
often turns a failure into a success. So the first question for any retry logic is "which errors?", not "how many times?".

> Say it like this: "Before I retry anything, I sort the error: timeouts and connection drops get retried, bad requests
> go straight back to the caller."

## Exponential backoff and jitter

Backoff means waiting between retries. Exponential backoff doubles the wait each time (1s, 2s, 4s). Jitter adds a small
random amount to each wait.

Why it matters: when a model provider is struggling, thousands of clients retrying instantly make it worse. Doubling the
wait gives the service room to recover. Jitter stops all those clients from retrying at exactly the same moment, which
would create a fresh spike every few seconds.

> Say it like this: "I double the wait each time so I do not hammer a struggling service, and in production I add jitter
> so clients do not retry in lockstep."

## Idempotency

An operation is idempotent if doing it twice has the same effect as doing it once. Reading a document is idempotent.
Sending an email or creating a support ticket is not.

Why it matters: a timeout does not tell you whether the other side did the work. If an agent's "create ticket" tool times
out and you retry blindly, the customer may get two tickets. Safe retries on writes need an idempotency key: a unique id
the server uses to spot and ignore the duplicate.

> Say it like this: "I only retry writes blindly if they are idempotent; otherwise I send an idempotency key so a repeat
> is ignored."

## Bounded retries and dead-letter queues

Every retry loop needs an end: a maximum number of attempts. A dead-letter queue (DLQ) is a separate place where jobs go
after they run out of attempts or hit a permanent error.

Why it matters: a poison message (a job that crashes the worker every time) retried forever blocks the queue and burns
money. A DLQ takes it out of the way but keeps it, with its error and history, so someone can fix the cause and replay
it. Nothing is lost and nothing loops.

> Say it like this: "A dead-letter queue is not a bin; it is where failed jobs wait, with their context, until someone
> can fix and replay them."

## Timeouts and service levels

A timeout is the longest you are willing to wait for a call. A service level agreement (SLA) is a promise to a customer,
for example "answers within 10 seconds".

Why it matters: a user staring at a spinner for 40 seconds has already given up. Labelling slow calls clearly
(success, partial, timeout) lets the app pick the right fallback: keep a partial streamed answer, switch to a faster
model, or show a friendly error. Labelling after the fact is only half the job; production code also cancels the call
when the limit passes.

> Say it like this: "I classify each call so the app knows which fallback to use, and in production I enforce the limit
> while the call is running, not just afterwards."

## Injecting sleep and measurements

Instead of calling `time.sleep` inside the retry function, the sleep function is passed in. Instead of timing the call
inside the classifier, the measured latency is passed in.

Why it matters: tests can record the waits instead of actually waiting, so a test of five retries runs in milliseconds
and you can check the exact backoff sequence.

> Say it like this: "I pass `sleep` in as an argument, so my tests check the backoff delays without waiting for them."

## How the problems use these ideas

- **Problem 32 (retry with backoff):** transient versus permanent errors, exponential backoff, bounded attempts, and an
  injected `sleep`. Idempotency is the main follow-up question.
- **Problem 36 (dead-letter routing):** bounded retries, permanent errors skipping straight to the DLQ, and failing safe
  when the attempt counter is missing.
- **Problem 38 (timeouts):** SLAs, clear labels that drive the fallback choice, and rejecting impossible inputs such as
  negative latency.

## Using an AI assistant on these problems

- Name the retryable exceptions in the prompt. Without that, assistants write `except Exception`, which retries
  everything.
- Ask for an injected `sleep` argument and check that the code never calls `time.sleep` directly.
- Read the loop's last iteration carefully: assistants often sleep once more after the final failure, or swallow the
  last error and return `None`.
- For the DLQ rule, state what happens when `attempts` is missing. The common default of 0 can create an endless loop.
- Check boundary operators (`>` versus `>=`) against your examples. These are where off-by-one bugs hide.

## Words to know

| Term | Plain meaning |
| --- | --- |
| Transient error | A temporary failure that may work on the next try. |
| Exponential backoff | Waiting longer before each retry, usually doubling. |
| Jitter | A small random extra wait so clients do not retry at the same time. |
| Idempotent | Safe to do twice; the second time changes nothing. |
| Idempotency key | A unique id that lets the server ignore a repeated request. |
| Dead-letter queue (DLQ) | A holding area for jobs that keep failing, kept for debugging and replay. |
| Poison message | A job that fails every time it is processed. |
| SLA | A promise to a customer about speed or uptime. |
