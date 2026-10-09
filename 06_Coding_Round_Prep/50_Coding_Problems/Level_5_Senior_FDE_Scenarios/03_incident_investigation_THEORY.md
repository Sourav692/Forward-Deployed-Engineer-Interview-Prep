# Incident investigation: the ideas behind problems 41 and 50

When an AI product breaks for customers, a forward deployed engineer is often the one in the room. Two jobs come up again and again: sorting many reports into a few real causes, and rebuilding the story of what happened to one request. Both start with messy data and end with something a team can act on.

## Normalization

Normalization means cleaning values so that things that mean the same are written the same. For text, that usually means lowercasing, trimming and collapsing extra spaces.

Why it matters: support agents type "Vector DB Timeout", "vector db timeout " and "VECTOR DB  TIMEOUT". Without cleaning, one real cause looks like three small ones, and the team fixes the wrong thing first.

> Say it like this: "I clean the text before I group it, so one cause does not look like three."

## Keep unknowns visible

When a value is missing, put it in an explicit bucket like "unknown" instead of dropping it or crashing. Records you truly cannot place, such as an incident with no id, can be skipped on purpose.

Why it matters: if 40 percent of incidents have no root cause, that is itself a finding: the ticket form is broken or people are rushing. Hiding those incidents makes the report look cleaner and less true.

> Say it like this: "Missing causes go under unknown, so the gap is visible instead of hidden."

## Correlation ids

A correlation id, often called a request id, is one id attached to every log line produced while handling one request, across every service it touches.

Why it matters: a single question to a RAG assistant might hit the retriever, the model API and a CRM connector. Each writes its own logs. Without a shared request id, you cannot tell which retriever log belongs with which model timeout.

> Say it like this: "A timeline is only as good as the request ids and timestamps the system emits."

## Ordering and clock skew

To find what failed first, you sort events by time. Clock skew is when two servers' clocks disagree by a little, so their timestamps cannot be trusted to the exact second.

Why it matters: if the CRM server's clock runs two seconds fast, its error can appear before the model timeout that actually caused it. Saying this out loud shows you know a sorted list is a best guess, not proof.

> Say it like this: "I sort by timestamp, but I would mention clock skew, because servers do not share a perfect clock."

## Deduplication

Deduplication means removing repeated copies of the same record. The key is choosing what "same" means: the same request, time and event name is a duplicate; the same event name at a different time is a real repeat.

Why it matters: a retrying log shipper can send one event twice, which makes it look like the step ran twice. But removing every repeated "retry" event would hide that the system really retried three times.

> Say it like this: "I only drop exact duplicates, so real repeated steps stay in the timeline."

## Impact over count

The biggest group is not always the most important one. Severity and the number of customers affected matter more than raw incident count.

Why it matters: 30 minor incidents from one test tenant matter less than 3 critical incidents from three paying customers. Ranking by impact is what a staff-level engineer would bring to the triage meeting.

> Say it like this: "I would group by cause, then rank by customer impact and severity, not just count."

## How the problems use these ideas

- **Problem 41, Group Customer Incidents by Root Cause:** normalization merges different spellings, unknowns stay visible in their own bucket, and records with no id are skipped on purpose. Ranking by impact is the production next step.
- **Problem 50, Incident Timeline Reconstruction:** correlation ids group the events, sorting by time builds the story, exact duplicates are removed, and clock skew is the honest caveat.

## Using an AI assistant on these problems

- Give a messy sample in your prompt (extra spaces, `None`, missing id). Assistants write for clean input unless shown otherwise.
- Check how the AI tests for missing values. `if not ts` drops a valid timestamp of `0`; ask for `is None`.
- Ask what the function does with a record it cannot place. You want "skip on purpose" or "unknown bucket", never a crash in the middle of an incident.
- Ask the assistant to keep ids in input order, then add a test with two interleaved requests to prove the grouping works.

## Words to know

| Term | Plain meaning |
| --- | --- |
| Root cause | The underlying reason something failed, not just the visible symptom. |
| Normalization | Cleaning values so equal things are written the same way. |
| Correlation id | One id shared by every log line from one request. |
| Clock skew | Small differences between the clocks on different servers. |
| Deduplication | Removing repeated copies of the same record. |
| Distributed tracing | Tracking one request across many services as a tree of timed steps. |
| Postmortem | A written review after an incident: what happened, why, and what changes. |
