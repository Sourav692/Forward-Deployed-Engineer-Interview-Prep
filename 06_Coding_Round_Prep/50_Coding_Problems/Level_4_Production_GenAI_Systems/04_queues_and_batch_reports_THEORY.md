# Work queues and batch reports: the ideas behind problems 34, 40

GenAI systems do a lot of work in the background: triaging tickets, embedding documents, re-indexing knowledge bases.
These two problems cover both ends of that work. Problem 34 decides what to do next. Problem 40 reports what happened,
in a form the team can act on.

## Priority queues and heaps

A priority queue hands out the most important item first, not the oldest. A heap is the data structure behind it: it
keeps the smallest item on top and makes adding and removing cheap. In Python this is the `heapq` module.

Why it matters: an AI triage worker should draft a reply to a VIP outage ticket before a password-reset question. Sorting
the whole list on every pop would work, but a heap is the standard tool and an interviewer expects you to reach for it.

> Say it like this: "I use `heapq` so the most urgent ticket is always on top without re-sorting the whole queue."

## Stable ordering with a tie-breaker

Stable ordering means items with the same priority come out in the order they went in. A tie-breaker is an extra value
that decides between equal items; here it is a sequence number that goes up by one on every push.

Why it matters: customers notice when a ticket that arrived first is answered last. There is also a Python trap: heap
entries are tuples, and if two priorities tie, Python compares the next field. Two dicts cannot be compared, so the code
crashes with `TypeError`. The sequence number fixes fairness and the crash in one move.

> Say it like this: "I push priority, then a sequence number, then the ticket, so ties come out in arrival order and
> Python never compares two dicts."

## Starvation

Starvation is when low-priority items never get processed because higher-priority ones keep arriving.

Why it matters: during a busy week, a steady stream of urgent tickets could leave normal tickets waiting for days. The
usual fix is aging: raise an item's priority the longer it waits. Mentioning this shows you think past the happy path.

> Say it like this: "A strict priority queue can starve normal tickets, so in production I would raise priority as a
> ticket waits."

## Low-cardinality error labels

Cardinality is the number of distinct values. A high-cardinality label has thousands of values, like raw error messages
that include ids and timings. A low-cardinality label groups them into a handful of types, like "timeout" or
"rate_limited".

Why it matters: a summary that lists "timeout after 31s", "timeout after 45s", and a thousand more rows tells the team
nothing. Grouping by error type shows at once that most failures were timeouts. Dashboards and metrics systems also slow
down or get expensive when labels have too many values.

> Say it like this: "I group failures by error type, not by raw message, so a thousand timeouts show up as one row the
> team can act on."

## Never hide a failure

Every input must land somewhere in the output. If the code only counts `status == "failed"`, a result with a missing or
unexpected status vanishes from the report.

Why it matters: a nightly embedding job that reports "990 succeeded, 0 failed" when 10 documents had a strange status is
worse than no report, because it builds false confidence. Treating anything that is not "success" as a failure, with a
clear "unknown" label, keeps the numbers honest.

> Say it like this: "Anything that is not a clear success counts as a failure, so the totals always add up and nothing
> slips through."

## Actionable output

Actionable means the output tells someone what to do next. For a queue, that is which ticket is next. For a batch
report, that is which error types to fix and which document ids to retry.

Why it matters: the point of a summary is the next decision. Keeping the failed ids lets the team retry exactly those
documents instead of re-running the whole batch.

> Say it like this: "A useful batch report tells the team what to fix and what to retry, not just that something
> failed."

## How the problems use these ideas

- **Problem 34 (ticket priority queue):** a heap for priority, a sequence number for stable ordering and to avoid
  comparing dicts, a default priority for missing fields, and starvation as the follow-up.
- **Problem 40 (batch failure summary):** low-cardinality labels (text before the colon), never hiding a failure
  (anything not "success" counts), an "unknown" label for missing errors, and failed ids for targeted retries.

## Using an AI assistant on these problems

- Ask for `(priority, sequence, ticket)` explicitly. Without it, assistants often push `(priority, ticket)`, which crashes
  on the first tie.
- Say which way priority runs ("lower number is more urgent"). Check the code does not flip it.
- For the summary, give the exact output shape, including an empty batch, so the assistant does not invent extra keys.
- Test with a `None` error and a missing status. Those are the inputs that crash or vanish in generated code.
- Ask the assistant to explain how labels are grouped; if its answer is "by full message", the report will not scale.

## Words to know

| Term | Plain meaning |
| --- | --- |
| Priority queue | A queue that hands out the most important item first. |
| Heap | A structure that keeps the smallest item on top; Python's `heapq`. |
| Stable ordering | Equal items come out in the order they went in. |
| Tie-breaker | An extra value used to order items that are otherwise equal. |
| Starvation | Low-priority work never runs because urgent work keeps arriving. |
| Aging | Raising an item's priority the longer it waits. |
| Cardinality | How many distinct values a label can take. |
| Batch job | A job that processes many items in one run, often overnight. |
