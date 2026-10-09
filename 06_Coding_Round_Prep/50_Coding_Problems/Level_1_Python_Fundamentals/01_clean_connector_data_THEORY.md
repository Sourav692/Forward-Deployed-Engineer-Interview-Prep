# Clean Data from Connectors: the ideas behind problems 1 and 2

Most enterprise AI work starts with data that someone else produced: a CRM, a ticketing system, a spreadsheet export.
That data arrives late, twice, half-filled or in the wrong shape. These two problems train the habit of cleaning it at
the door, before it reaches a prompt, a model call or a customer-facing action.

## At-least-once delivery

Most webhook and queue systems promise that a message arrives at least once, not exactly once. If the sender does not
get a quick "received" reply, it sends the message again.

In a GenAI workflow this means the same "contact updated" event can trigger two model calls and two follow-up emails.
You pay twice, and the customer looks careless in front of their own clients.

> Say it like this: "I assume every webhook can arrive more than once, so the handler has to be safe to repeat."

## Idempotency

An operation is idempotent when doing it twice has the same effect as doing it once. The usual way to get there is an
idempotency key: a unique id you record the first time, and check before acting again.

For webhooks the key is the event id. If the id is already in your "processed" store, you skip the event. In an
interview a Python set is enough; in production the store must be shared by every server, or two servers can each
process one copy.

> Say it like this: "I make the handler idempotent by recording each event id the first time and skipping repeats."

## Untrusted input

Untrusted input is any data your code did not create itself. Connector payloads, user uploads and model outputs all
count. You check them before you rely on them.

A record with no event id cannot be deduplicated, so processing it is a gamble. A CRM record with `Email` instead of
`email` would crash a naive lookup or produce an empty prompt field. Checking shape first turns these into choices
you make on purpose (skip, flag, or fail) instead of surprises.

> Say it like this: "Connector data is untrusted, so I check its shape before any business logic touches it."

## Canonical schema

A canonical schema is the one agreed shape your system uses inside, no matter where the data came from. Every source
is mapped into it at the edge.

If Salesforce says `Full Name`, HubSpot says `name` and a CSV says `NAME`, the prompt builder should still see one key,
`name`. The prompt template, the retrieval filters and the evaluation scripts can then all be written once.

> Say it like this: "I map every source into one fixed shape at the edge, so nothing downstream has to guess field names."

## Deterministic transformations

A deterministic function always gives the same output for the same input. No randomness, no hidden state, no reliance
on dict ordering accidents.

Customers will ask why a field changed ("why is this email lowercase?"). A small, rule-based normalizer can be
explained line by line. Using an LLM to clean data may look clever, but you cannot promise the same answer twice, and
you cannot easily audit it.

> Say it like this: "I keep the cleanup rule-based so I can explain any change to the customer and test it easily."

## How the problems use these ideas

- **Problem 1, Deduplicate Webhook Events.** At-least-once delivery creates the duplicates. Idempotency, keyed on
  `event_id`, removes them. Untrusted input is why events without a usable id are skipped on purpose, and arrival
  order is kept because downstream steps may depend on it.
- **Problem 2, Normalize Messy CRM Records.** The canonical schema is the four fixed keys. Untrusted input is why keys
  are matched loosely and blank values become `None`. Deterministic transformation is why the rules are a plain alias
  list, and why only the email is lowercased.

## Using an AI assistant on these problems

- Spell out the tie-break rule in your prompt ("first copy wins", "first alias in this list wins"). Assistants often
  pick the opposite by default.
- Ask for "standard library only, no sorting" for the dedupe. Assistants like to reach for `dict` or `set` tricks that
  lose order.
- After the code comes back, read how it reads keys: `record["x"]` crashes on a missing key, `record.get("x")` does not.
- Check what the function does with blank strings and non-string values. This is where generated code is most often
  wrong.
- Run the edge cases first (missing id, empty record), not just the happy path.

## Words to know

| Term | Plain meaning |
|------|---------------|
| Webhook | An HTTP call a SaaS tool makes to your server when something changes |
| At-least-once delivery | A message may arrive more than once, but should not be lost |
| Idempotent | Safe to run twice; the second run changes nothing |
| Idempotency key | A unique id used to spot a repeat of the same request or event |
| Canonical schema | The single internal shape all sources are mapped into |
| Alias | Another name for the same field, such as `e-mail` for `email` |
| Deterministic | Same input always gives the same output |
