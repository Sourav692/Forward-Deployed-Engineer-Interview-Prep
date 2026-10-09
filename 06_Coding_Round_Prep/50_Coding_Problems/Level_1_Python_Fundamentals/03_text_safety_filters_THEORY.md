# Text Safety Filters: the ideas behind problems 4, 5 and 9

A GenAI system moves text in three places that matter for safety: text going into the index, text coming back from
retrieval, and text going out to the user. These three problems each put a simple check at one of those points. The
code is short. The real skill is explaining what each check catches, what it misses, and what should sit behind it.

## Defense in depth

Defense in depth means using several independent layers of protection, so one weak layer does not sink you. No single
check is trusted to be perfect.

A regex for PII, a phrase list for prompt injection and a blocklist for secrets will each miss things. Together with
access controls, careful prompt design and limited tool permissions, they make a leak much less likely. Interviewers
want to hear that you know which layer you are building and which ones you are not.

> Say it like this: "This check is one layer. The stronger layer behind it is access control and keeping secrets out of the prompt."

## PII before embeddings

PII (personally identifiable information) is data that points to a real person: an email, a phone number, an ID
number. Embeddings are number vectors that capture a passage's meaning so it can be searched.

Once a document is chunked and embedded, its text is copied into a vector store, caches and often logs. Deleting PII
from all of those later is slow and error-prone. Redacting before chunking and embedding keeps it out of every copy.

> Say it like this: "I redact before chunking and embedding, because removing PII from a vector store afterwards is painful."

## Data, not instructions

Prompt injection is text that tries to give the model orders, such as "ignore previous instructions". It is dangerous
when retrieved documents or user files are mixed into a prompt next to your real instructions.

The main defense is structural: keep retrieved text in a clearly marked data section, never let it change the system
message, and limit what tools the model can call. A phrase detector is a cheap tripwire on top of that, useful for
flagging bad sources, but easy to dodge with a typo or another language.

> Say it like this: "Retrieved text is data, not instructions. The keyword check is a tripwire, not the security boundary."

## Normalize before you match

Normalizing means putting text into a standard form before checking it: lowercase it, collapse extra spaces and line
breaks, sometimes strip accents.

Without this, `IGNORE previous instructions` or a phrase split across two lines walks straight past a simple check.
The same goes for `PASSWORD` versus `password` in an output filter. Normalizing both sides (the text and the patterns)
removes the easiest dodges for almost no cost.

> Say it like this: "I lowercase and collapse whitespace first, so trivial changes in spacing or case cannot slip past."

## False positives and false negatives

A false positive is flagging something harmless. A false negative is missing something harmful. Every filter trades
one for the other.

A loose phone regex redacts dates and order numbers (false positives). A strict one misses odd formats (false
negatives). In regulated work, a missed PII field is usually worse than an over-redacted date, but too many false
alarms make people ignore the filter. Ask which mistake the customer fears more.

> Say it like this: "I would ask which mistake costs more here, a missed secret or a false alarm, and tune for that."

## How the problems use these ideas

- **Problem 4, Sanitize PII from Documents.** Runs before embedding. Emails are replaced first so their digits are not
  read as phone numbers. The phone pattern needs at least nine characters, which keeps short numbers and prices (fewer
  false positives) but still flags some dates.
- **Problem 5, Detect Prompt Injection Patterns.** Treats retrieved text as data. Normalizing case and whitespace stops
  the easiest dodges. It is clearly a tripwire inside a larger defense, not the defense itself.
- **Problem 9, Safe Output Filtering.** The last layer before the user. Case-insensitive matching is normalization.
  Skipping blank terms avoids a false positive on every answer, because an empty string is "found" in any text.

## Using an AI assistant on these problems

- Give the assistant the exact pattern rules (minimum length, order of replacements). Vague prompts produce regexes
  that are either far too loose or far too strict.
- Paste your tricky test strings into the prompt: a short order number, an email with a plus sign, a phrase split by a
  line break.
- Read any regex the assistant writes and say out loud what it matches. If you cannot explain it, do not ship it.
- Watch for comments that oversell the code ("fully removes PII", "prevents injection"). Correct them; interviewers notice.
- Check that the pattern list and the text are normalized the same way.

## Words to know

| Term | Plain meaning |
|------|---------------|
| PII | Personal data that can identify a person, like an email or phone number |
| Redact | Replace sensitive text with a placeholder such as `[EMAIL]` |
| Embedding | A list of numbers that captures a passage's meaning for search |
| RAG | Retrieval-augmented generation: the model answers using fetched passages |
| Prompt injection | Text that tries to override the model's real instructions |
| Normalize | Put text into a standard form (case, spacing) before checking it |
| False positive | A harmless item wrongly flagged |
| False negative | A harmful item wrongly missed |
