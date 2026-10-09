# Workflows and deadlines: the ideas behind problems 44 and 49

Enterprise AI work rarely finishes in one message. An onboarding agent collects answers over days. A support assistant has a contract that says how fast it must reply. Both problems are about work that stretches over time, and about checking it with rules you can test.

## Durable state, not prompt memory

Durable state is data saved outside the model, usually in a database, that says where a workflow stands. Prompt memory is the chat history the model sees. They are not the same thing.

Why it matters: if the only record that security approval happened is a line in the chat history, it can be cut off when the history gets long, or a user can claim it happened. A saved field like `security_approval: true`, written by our code, is something we can check and audit.

> Say it like this: "Prompt memory is not workflow state. Real workflows need saved state and clear steps."

## What counts as done

Each step needs a clear rule for "filled in". A key that exists is not enough: blank text, `None`, or `False` for an approval all mean the step is not done.

Why it matters: a model that extracts answers from chat may write `"use_case": " "` or `"security_approval": false`. A check that only asks "is the key there?" would wave the customer through to deployment without a real approval.

> Say it like this: "A step is done only when it has a real value, not just a key."

## Expiry

Expiry means old, unfinished work stops being valid after a set time. An onboarding session that sat idle for a week should start over, because the answers may be stale.

Why it matters: a deployment region chosen two months ago may no longer match the customer's data rules. Expiring idle sessions forces a fresh, current answer for anything that matters.

> Say it like this: "Unfinished workflows expire, so we never act on stale answers."

## Time as an input

Functions that depend on the current time should take `now` as a parameter instead of reading the clock inside.

Why it matters: an SLA report that reads the clock gives a different answer every time it runs, which makes it hard to test and hard to re-run for an audit. With `now` passed in, you can replay last month's report exactly.

> Say it like this: "I pass the current time in, so the result is repeatable and easy to test."

## SLAs and open work

An SLA, or service level agreement, is a contract promise such as "high-priority tickets get a reply within five minutes". A breach is any ticket that took longer than its limit.

Why it matters: SLA reports decide service credits and renewals. The classic bug is ignoring tickets with no reply yet. Those are often the worst offenders, so the clock for them runs until now.

> Say it like this: "For SLA logic, open items matter, because no reply can already be a breach."

## Boundaries and business rules

Contracts are specific about edges: is a reply at exactly five minutes on time? Do weekends count? Is the clock paused while waiting on the customer?

Why it matters: getting the boundary wrong by one second can flip hundreds of tickets into breaches and trigger credits the customer did not earn. A clear rule ("over the limit is a breach; exactly at the limit is fine") with a test for it prevents that argument.

> Say it like this: "I confirm the boundary rule with the customer and write a test for the exact limit."

## How the problems use these ideas

- **Problem 44, Multi-Step Workflow State:** durable state in a dict, a strict rule for what counts as done, and expiry of idle sessions with `now` passed in.
- **Problem 49, SLA Breach Detection:** open tickets measured up to `now`, priority-specific limits, a tested boundary, and unknown priorities skipped on purpose.

## Using an AI assistant on these problems

- Say "do not call time.time(); use the now argument" in the prompt, then search the AI's code for `time.` to be sure.
- Ask for the exact missing-value rule. Assistants often write `step in state` or `get(...) or now`, which treat blank text, `False` or a timestamp of `0` the wrong way.
- Ask for one test exactly at the limit and one just over it. This is the fastest way to catch `>` versus `>=`.
- Ask the assistant what happens to a ticket or step it does not recognise. You want a clear, deliberate choice, not a crash.

## Words to know

| Term | Plain meaning |
| --- | --- |
| Durable state | Data saved outside the model, so it survives restarts and long chats. |
| State machine | A set of steps with clear rules for moving from one step to the next. |
| Expiry | Unfinished work stops being valid after a set time. |
| SLA | Service level agreement: a contract promise about speed or uptime. |
| Breach | A case that broke the SLA promise. |
| Business calendar | The hours and days that count toward a deadline. |
| Clock injection | Passing the current time into a function instead of reading it inside. |
