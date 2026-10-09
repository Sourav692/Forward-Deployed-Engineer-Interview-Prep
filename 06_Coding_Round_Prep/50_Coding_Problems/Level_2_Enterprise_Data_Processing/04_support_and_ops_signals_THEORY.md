# Support and Operations Signals: the ideas behind problems 14, 16

A forward deployed engineer spends a lot of time turning noisy input into a clear signal: "these three tenants are slow" or "this message needs a human now". Both problems here take messy real-world data and return a decision a support team can act on. The interesting part is not the loop, it is knowing what the signal can and cannot tell you.

## Messy input should not crash the tool

**What it is.** Robust parsing means reading data that may be broken or incomplete, skipping the bad parts on purpose, and carrying on.

**Why it matters.** Log lines come from many services, and some will be missing a tenant or carry a latency of `"n/a"`. A script that crashes on the first broken line gives you nothing during an incident, which is exactly when you need it. Using `.get()` and checking types lets the tool skip bad lines and still report on the good ones.

> Say it like this: "Logs are messy, so I skip broken lines on purpose and still report on the rest, rather than crash in the middle of an incident."

## Averages versus percentiles

**What it is.** An average adds up all values and divides by the count. A percentile such as p95 is the value that 95 percent of requests are faster than.

**Why it matters.** If 95 requests take 200 ms and 5 take 10 seconds, the average looks fine at about 700 ms, while one user in twenty waits ten seconds and files a complaint. The average is fine for a first pass in an interview, but a real latency investigation looks at p95 and p99 and at traces that show where the time went.

> Say it like this: "I'll use the average for this exercise, but for a real complaint I'd check p95 and traces, because an average hides the slow tail."

## Sample size

**What it is.** Sample size is how many data points a conclusion is based on.

**Why it matters.** A tenant with one slow request is not a slow tenant. Flagging on tiny samples sends engineers chasing noise and worries customers for nothing. A minimum sample count is a simple, explainable guard.

> Say it like this: "I only flag a tenant once it has enough requests to trust, so one slow call doesn't trigger an alert."

## False alarms versus misses

**What it is.** A false positive (false alarm) flags something that is fine. A false negative (miss) fails to flag something that is a problem. Making a rule stricter reduces one and increases the other.

**Why it matters.** For escalation, a miss can mean an angry customer about to cancel waits days for a reply. A false alarm costs a support agent a minute. So escalation rules usually lean towards catching more, then measure the extra workload. Small details change the balance: matching `urgent` inside `detergent` is a false alarm, while a trigger like `cancel contract` misses `cancel our contract`.

> Say it like this: "For escalation, a miss hurts the customer more than a false alarm hurts the team, so I'd lean towards catching more and measure the cost."

## Explainable decisions

**What it is.** An explainable decision comes with the reason it was made.

**Why it matters.** If the assistant escalates a message and says why ("matched: legal action"), the support agent can trust it, or quickly see it was a quote from a contract. A bare True or False gives nobody anything to check or tune. The same goes for a sorted list of slow tenants: it is easy to read, compare and paste into an incident channel.

> Say it like this: "I return the decision and the reason, so a person can trust it or correct it quickly."

## Rules that customers can change

**What it is.** Configurable rules are passed in as parameters or settings instead of being hard-coded.

**Why it matters.** A bank and a game studio escalate on different words, and some customers need triggers in other languages. Taking the trigger list and the sample size as parameters lets each tenant tune behaviour without a code change.

> Say it like this: "The triggers are a parameter, so each customer can tune them without a code change."

## How the problems use these ideas

- **Problem 14, Parse Logs and Detect Slow Tenants.** Parses messy logs safely, uses an average with a clear caveat about percentiles, guards with a minimum sample size, and returns a sorted list.
- **Problem 16, Customer Escalation Detection.** Balances false alarms and misses with word-boundary matching, returns the trigger as the reason, and takes the trigger list as a parameter.

## Using an AI assistant on these problems

- Tell the AI that bad lines must be skipped, not raised. Otherwise it will often index straight into the dict.
- Mention that `bool` counts as an int in Python. Assistants rarely guard against `True` as a latency unless asked.
- State "strictly greater than" for thresholds. `>` versus `>=` is a classic quiet slip.
- For keyword matching, ask the AI to test its code on `detergent` and `cancellation`. This quickly shows whether it uses plain `in` or word boundaries.
- Ask the AI to list messages its rule would miss. Use one in your "edge cases" answer.

## Words to know

| Term | Plain meaning |
| --- | --- |
| Latency | How long a request takes, usually in milliseconds. |
| p95 / p99 | The time that 95 or 99 percent of requests are faster than. |
| Tail latency | The slowest few requests, which averages hide. |
| Trace | A record of where time was spent across services in one request. |
| SLA | The agreed service level, such as response time, promised to a customer. |
| False positive | A false alarm: flagged, but actually fine. |
| False negative | A miss: a real problem that was not flagged. |
| Word boundary | The edge of a word, so a match does not start in the middle of another word. |
