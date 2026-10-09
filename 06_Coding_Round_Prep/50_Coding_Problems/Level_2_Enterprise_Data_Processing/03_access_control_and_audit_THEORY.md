# Access Control and Audit: the ideas behind problems 12, 17

When a GenAI system reads company documents and calls tools in customer systems, two questions come up in every security review. Can a user ever see something they should not? And afterwards, can we prove who did what? These two problems answer those questions in small, testable functions.

## Tenant isolation

**What it is.** A tenant is one customer company on a shared platform. Tenant isolation means one tenant's data and actions never reach another tenant.

**Why it matters.** Many GenAI products keep all customers' chunks in one search index. If a filter forgets the tenant check, a user at Company A can get a chunk from Company B's board minutes in their answer. That is not a bug report, it is a breach. The tenant check comes first and has no exceptions, not even for chunks marked public.

> Say it like this: "The tenant check comes first and nothing overrides it, not even a public flag."

## Fail closed

**What it is.** When information needed for a safety decision is missing or unclear, the system picks the safe outcome: deny, block, or refuse. Failing open is the opposite: allow when unsure.

**Why it matters.** Chunks often arrive with missing access labels after a connector bug. Failing open would put every unlabelled HR document in front of every employee. Failing closed means some answers get worse until the labels are fixed, which is a much cheaper mistake. The same idea applies to audit events: an event with no request ID cannot be traced, so the function refuses to create it.

> Say it like this: "If access data is missing I treat the chunk as private, because a missing label should cost an answer, not leak a document."

## Filter before the prompt

**What it is.** Permission checks run on retrieved chunks before they are placed in the model's prompt, not on the model's answer afterwards.

**Why it matters.** Once text is in the prompt, the model can quote it, summarise it, or hint at it in ways no output filter will reliably catch. Retrieval returns the most similar chunks, not the allowed ones, so filtering at this point is required. Better still is filtering inside the search itself, so forbidden chunks are never fetched.

> Say it like this: "I filter before the prompt is built, because the model cannot un-see text."

## Audit trail

**What it is.** An audit trail is a record of actions that answers who, what, when, and in which request. Good audit records are structured (fixed fields, not free text) and cannot be edited later.

**Why it matters.** When an agent sends an email or updates a ticket on a customer's behalf, compliance teams need to trace each action back to a user and a request. A fixed shape with tenant, user, tool, request ID and timestamp makes the trail searchable. Allowing the time to be passed in also makes the function easy to test.

> Say it like this: "Audit logs are part of the product when agents call customer tools, so every event has tenant, user, tool, request ID and time."

## Redaction

**What it is.** Redaction replaces secret or personal values with a placeholder such as `[REDACTED]` before data is stored or shown.

**Why it matters.** Tool arguments often carry API keys, passwords or tokens. Logs are read by many people and kept for a long time, so a secret in a log is a secret shared widely. Redaction must look inside nested objects, must match names loosely (`db_password`, `API_KEY`), and must work on a copy so the real tool call still gets the real value.

> Say it like this: "I redact a copy of the args, including nested values, so secrets never reach the log and the real call still works."

## How the problems use these ideas

- **Problem 12, Filter RAG Chunks by User Permissions.** Applies tenant isolation first, then fails closed on missing roles. It only accepts `public` when the value is exactly True, and it runs before prompt construction.
- **Problem 17, Audit Log Generation.** Builds a structured audit event, fails closed when tenant, user or request ID is missing, and redacts secrets recursively on a copy of the arguments.

## Using an AI assistant on these problems

- Spell out the fail-closed rule in the prompt ("missing roles means not allowed"). Assistants often default to allowing chunks with no roles.
- Check that the tenant check is a separate, first condition and is not mixed into an `or` where a public flag could skip it.
- Ask the AI to show what happens with `roles: None` and `public: "false"`. These two inputs catch most weak filters.
- For audit code, check that it builds a new dict instead of editing `args` in place, and that it handles nested dicts and lists.
- Ask for a time parameter so the event can be tested with a fixed timestamp.

## Words to know

| Term | Plain meaning |
| --- | --- |
| Tenant | One customer company on a shared platform. |
| Tenant isolation | One customer's data never reaches another customer. |
| Role | A group label, like "finance", that grants access to some documents. |
| ACL | Access control list: who is allowed to see a document. |
| Fail closed | When unsure, choose the safe outcome: deny or block. |
| Audit trail | A tamper-proof record of who did what, when, and why. |
| Request ID | A unique ID that ties together everything that happened in one request. |
| Redaction | Replacing a secret value with a placeholder before it is stored. |
