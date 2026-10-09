# Access and context: the ideas behind problems 28, 30

Everything the model reads ends up in its answer. These two problems control what the model is
allowed to read: first, who may see each document, and second, which retrieved chunks actually fit
into the prompt.

## Permission inheritance

In tools like Google Drive and SharePoint, a document usually takes its permissions from the folder
it sits in. If someone sets permissions on the document itself, those replace the folder's.

Why it matters: the RAG index must store the right roles for every document. If it gets inheritance
wrong, an engineer can ask "what is the salary band for level 5?" and get an answer from an HR-only
file. Rules also differ between connectors, so the code must follow the real source system, not a
guess.

> Say it like this: "Inheritance rules are connector-specific, so I confirm how the source system works before I code the rule."

## None is not empty

In Python, `None` means "no value given". An empty set means "a value was given, and it holds
nothing". For permissions, `None` on a document means "inherit from the folder", while an empty set
means "nobody may see this".

Why it matters: the one-character bug `if doc_roles:` treats an empty set the same as `None`, so a
locked document inherits the folder's open roles and leaks. Writing `if doc_roles is not None:` keeps
the two meanings apart.

> Say it like this: "I keep 'not set' and 'set to nobody' as different cases, because mixing them up opens access by accident."

## Fail closed

Fail closed means that when the system is unsure, it denies. Fail open would allow.

Why it matters: unknown folder permissions, a broken sync, or a record with no roles must all lead
to "nobody can see this", never "everyone can". For packing context, a chunk with an unknown token
count is skipped rather than assumed to be small, because it might blow the budget.

> Say it like this: "When access or size is unknown, I fail closed: missing data never grants access or space."

## The context window and its budget

The context window is the most text a model can read in one request, measured in tokens (small
pieces of words). The token budget is the share of that window you give to retrieved chunks.

Why it matters: the window also has to hold the system instructions, the user's question, and room
for the answer. If retrieved chunks fill all of it, the answer gets cut off. A good packer walks the
chunks best first and keeps each one that still fits, skipping a chunk that is too big so a smaller
useful one can still get in.

> Say it like this: "I reserve room for instructions and the answer first, then pack the best chunks into what is left."

## Keep metadata attached

Metadata is the information about a chunk: its source file, page, document ID, and roles. It must
travel with the chunk all the way to the prompt.

Why it matters: citations come from metadata. If the packer returns only the text, the answer cannot
say "from the 2026 handbook, page 4", and the user cannot check it. Returning the original chunk
objects, unchanged, is the simplest way to keep citations working.

> Say it like this: "I pass whole chunk objects through the pipeline so every sentence in the answer can still be traced to its source."

## How the problems use these ideas

- **Problem 28, Inherit Document Permissions:** permission inheritance, the `None` versus empty set
  difference, failing closed on unknown folder roles, and returning a copy so callers cannot edit the
  source permissions.
- **Problem 30, Pack Chunks into the Context Window:** the token budget, skipping chunks of unknown
  size (fail closed), keeping rank order, and returning whole chunk objects so citations survive.

## Using an AI assistant on these problems

- Put the empty set rule in the prompt in plain words: "an empty set means nobody". Then read the
  AI's `if` line first, because that is where this bug hides.
- Ask the AI to "always return a new set". Then test it: change the result and check the input did
  not change.
- For packing, say "skip a chunk that does not fit and keep going". AI code often uses `break`,
  which stops at the first big chunk and wastes the rest of the budget.
- Check that the AI does not re-sort chunks by size to squeeze more in. That throws away the ranking
  that retrieval worked hard to produce.

## Words to know

| Term | Plain meaning |
| --- | --- |
| ACL | Access control list: the list of who may see a document. |
| Inheritance | A document taking its permissions from its folder. |
| Fail closed | Deny when unsure. |
| Context window | The most text a model can read in one request. |
| Token | A small piece of a word; models count text in tokens. |
| Token budget | How many tokens you allow for retrieved chunks. |
| Citation | A pointer from the answer back to the source it came from. |
