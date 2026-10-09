# Validate Before You Run It: the ideas behind problems 3 and 6

Agents and prompt templates both turn text into action. A model writes JSON that calls a tool. A customer writes a
template that decides what data goes into a prompt. In both cases the text is a proposal, and your code decides
whether it is allowed to run. These two problems train that gatekeeping habit.

## Model output is untrusted

A language model predicts likely text. It does not guarantee that its JSON matches your tool's rules. It can invent a
field, use a string where you expected a number, or leave out a required value.

If an agent's `create_refund` call slips through with `"amount": "all"` or an invented `"admin": true`, the damage is
real and hard to undo. So tool arguments are checked like any outside input, every time, before execution.

> Say it like this: "I treat the model's tool call as a request, not a command, and I validate it before anything runs."

## Allow lists over block lists

An allow list names what is permitted and rejects everything else. A block list names what is forbidden and allows
everything else.

For tool arguments and template variables, an allow list is far safer. You cannot predict every bad field name a model
might invent, but you know exactly which fields `send_email` accepts and which variables your prompt builder fills.
`{password}` fails not because it is on a bad list, but because it is not on the good one.

> Say it like this: "I use an allow list, so anything I did not plan for is rejected by default."

## Fail closed

Failing closed means that when a check is unsure or something is missing, the system refuses rather than proceeds. Its
opposite, failing open, lets the action through when in doubt.

A tool call with a missing customer id should not run "with a default". A template with an unknown placeholder should
not deploy "and hope it gets filled". For anything that writes to a customer system, refusing is the cheap mistake and
proceeding is the expensive one.

> Say it like this: "If validation fails, the tool does not run. I fail closed on anything that changes customer data."

## Validate early

The earlier you catch a bad input, the cheaper it is. A template checked when it is saved costs the customer one error
message. The same template checked only at request time costs a failed live conversation.

This is why prompt templates are validated at save time and again at deploy time, and why tool arguments are checked
before the call, not by waiting to see whether the downstream API complains.

> Say it like this: "I validate at save time, so a typo shows up in the editor, not in a customer's chat."

## Return all errors, not just the first

A validator that stops at the first problem forces a slow fix-run-fix loop. Returning a list of every problem lets a
human fix them in one pass, or lets the agent send the whole list back to the model so it can correct itself in one
retry.

A list is also easy to log and easy to test: an empty list means valid, and anything else explains exactly why not.

> Say it like this: "I return every error as a list, so the model or the user can fix everything in one go."

## How the problems use these ideas

- **Problem 3, Validate JSON Tool-Call Arguments.** Model output is untrusted, so arguments are checked before the tool
  runs. Allowed fields form an allow list. Missing fields and wrong types make the call fail closed. All errors come
  back as a list. The bool check matters because Python counts `True` as an int, so a lazy type check would let it pass.
- **Problem 6, Prompt Template Variable Validation.** The allowed variables are an allow list, which is how `{password}`
  gets caught. Checking at save time is validating early. Empty placeholders are reported because they would break
  rendering later. Names are trimmed and lowercased first so harmless spacing does not cause false errors.

## Using an AI assistant on these problems

- Give the exact error message format in the prompt. Tests compare strings, and assistants invent their own wording.
- Say "never raise, return a list". Assistants often raise on the first problem instead.
- For problem 3, check how the type test handles `True`. `isinstance(True, int)` is `True`, and most generated code
  misses this.
- For problem 6, ask for a regex scan, not `.format()`. Rendering a template to test it stops at the first missing key.
- Check that the output order is fixed (required fields in order, unexpected names sorted), or the tests will flake.

## Words to know

| Term | Plain meaning |
|------|---------------|
| Tool call | The model asking your code to run a function, with JSON arguments |
| Schema | The rules for what fields an input must have and what types they are |
| Allow list | A list of what is permitted; everything else is rejected |
| Block list | A list of what is forbidden; everything else is allowed |
| Fail closed | Refuse when in doubt |
| Placeholder | A `{name}` slot in a template that gets filled with real data |
| Regex | A pattern for finding text, from Python's `re` module |
