# Model Call Plumbing: the ideas behind problems 7, 8 and 10

Every model call has the same three parts around it: what you send in, what comes back, and what it costs. These
three problems each handle one part. None of them involves the model's intelligence. They are the plain code that
decides whether a GenAI product feels reliable and whether the bill makes sense.

## Tokens and the context window

Models read and write text in tokens, which are small word pieces. A rough guide for English is about four characters
per token, but only the model's tokenizer gives the true count. The context window is the most tokens a model will
accept in one request.

A long support chat can grow past that limit. More tokens also mean more cost and slower answers. So the history sent
on each turn has to be trimmed, and the trimming rules decide what the model "remembers".

> Say it like this: "The context window is a hard budget, so every turn I decide which history earns a place in it."

## Keep the rules, keep the recent turns

When trimming chat history, two things matter most. The system message holds the rules and persona, so it always
stays. The most recent turns hold the question being asked, so they come next.

Trimming should also keep the history continuous. If you skip one big message and keep older small ones, the model
sees a conversation with a hole in it and may answer as if something was never said. Stopping at the first message
that does not fit avoids that.

> Say it like this: "System message first, then the newest turns, and I stop at the first one that does not fit so there are no gaps."

## Streaming responses

Streaming means the model sends its answer in many small chunks as it writes, instead of one block at the end. Users
see text sooner, which makes the product feel faster.

Not every chunk carries text. Some carry usage counts, keep-alive pings or a finish reason. The merge code must read
fields safely, keep only real text, and never trim it, because a chunk that is just a space is part of the answer.
Collecting parts in a list and joining once is the clean, standard pattern.

> Say it like this: "I collect only the text deltas, ignore metadata chunks, and join once at the end."

## Usage-based billing

Model providers charge per token, usually with separate prices for input and output tokens, and different prices per
model. A platform that serves many customers has to add this up per customer to bill them or enforce budgets.

The key rule is that billing never guesses. An unknown model or a negative count should stop the run loudly. Billing
an unknown model at zero hides a bug and loses money; billing it at a made-up price breaks customer trust.

> Say it like this: "If a model has no price, I raise an error. Billing should never quietly guess."

## Money and floating point

Python floats store numbers in binary, so some decimals cannot be stored exactly. `0.1 + 0.2` gives
`0.30000000000000004`. For one calculation that is harmless; summed over millions of usage records it can drift.

For an interview, floats with rounding at the end are fine if you say so. For real billing, use `Decimal`, which
stores decimal numbers exactly, and round only the final amounts.

> Say it like this: "I use float for the interview version, but real billing uses Decimal and rounds only the final total."

## How the problems use these ideas

- **Problem 7, Conversation Memory Trimming.** Works inside the token budget. Keeps system messages first, then the
  newest turns, and stops at the first misfit so the history stays continuous.
- **Problem 8, Merge Streaming Partial Responses.** Handles a streamed answer. Reads `delta` safely, skips metadata
  chunks, keeps spaces, and joins once.
- **Problem 10, Calculate Token Cost per Customer.** Usage-based billing with separate input and output prices per
  model. Fails loudly on unknown models and negative counts, and rounds only the final totals.

## Using an AI assistant on these problems

- State the direction and order rules plainly ("oldest first in the list, walk from newest, return in original order").
  Assistants often get one of these backwards.
- Say "stop at the first message that does not fit". Without it, most assistants skip and keep going.
- For streaming, say "do not strip" and "ignore non-string deltas". Generated code often strips or calls `str(None)`.
- For billing, say "raise ValueError for an unknown model". The default habit is `prices.get(model, 0)`, which hides bugs.
- Check the units: per 1,000 or per 1,000,000 tokens is the most common silent mistake.

## Words to know

| Term | Plain meaning |
|------|---------------|
| Token | A small piece of text (part of a word) that models count |
| Tokenizer | The model's own tool for splitting text into tokens |
| Context window | The most tokens a model accepts in one request |
| System message | The instruction message that sets the model's rules |
| Streaming | Sending the answer in small chunks as it is written |
| Delta | The new piece of text in one streamed chunk |
| Decimal | Python's exact decimal number type, used for money |
