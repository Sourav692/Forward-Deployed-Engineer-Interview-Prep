# Fast and safe caching: the ideas behind problems 33, 37

Caching is the easiest way to make a GenAI app faster and cheaper: if you have already rendered this prompt or answered
this question, reuse the result. In a multi-tenant system it is also one of the easiest ways to leak one customer's data
to another. These two problems cover both halves: how a cache decides what to keep, and how the key decides who can see
an entry.

## What a cache is for

A cache stores results you have already computed so the next identical request skips the slow or costly step. In a GenAI
app that step might be a model call, a retrieval query, or rendering a long prompt template.

Why it matters: model calls cost money per token and can take seconds. A support bot that gets the same ten questions all
day can answer most of them from cache. The trade-off is memory and freshness: cached answers take space and can go
stale.

> Say it like this: "A cache trades memory and freshness for speed and cost, so I need a size limit and a plan for when
> entries go stale."

## LRU eviction

Eviction is removing an entry to make room. LRU (least recently used) removes the entry nobody has read or written for
the longest time. Python's `OrderedDict` makes this easy: move a key to the end when it is used, and remove from the
front when the cache is full.

Why it matters: memory is limited, so the cache has to drop something. Recent use is a good guess at future use: the
question asked a minute ago is more likely to come up again than one asked last week. Reading must count as use, or
the cache becomes "first in, first out" and throws away its most popular entries.

> Say it like this: "When the cache is full I drop the entry that has gone unused the longest, and both reads and writes
> count as use."

## The key decides who can see an entry

A cache key is the label used to store and look up an entry. Whatever is not in the key is treated as "does not matter".

Why it matters: if the key is only the question text, then "What is our refund policy?" from Company A returns the
answer built from Company A's documents to Company B. That is a data leak. The key must include everything that changes
the answer: tenant, often the user, and their permission level.

> Say it like this: "A cache hit is only safe if the answer was made for the same tenant, user, and permissions, so all
> three go into the key."

## Permission versions and invalidation

Invalidation means making cached entries stop being used. A permission version is a number or tag that changes whenever
a user's access rights change.

Why it matters: if a user loses access to a confidential folder, cached answers built from that folder must stop being
served. Deleting every affected entry is hard. Putting the permission version in the key is easy: bump the version and
all old entries become unreachable, then expire on their own.

> Say it like this: "I put a permission version in the key, so when access changes I bump it and the old answers simply
> stop matching."

## Normalisation

Normalising means turning equivalent inputs into one standard form, for example lowercasing and squashing extra spaces.

Why it matters: users type " Refund  policy" and "refund policy". Without normalising, those miss each other's cache
entries and you pay for the same answer twice. Normalisation must never remove anything that changes the meaning or the
access context.

> Say it like this: "I normalise case and whitespace so trivial differences still hit the cache, but I never normalise
> away the tenant or permissions."

## When not to cache

Some data should not be cached at all: answers containing personal or regulated data, or results for a request where you
cannot build a safe key (for example the tenant id is missing).

Why it matters: a cache is a copy of data, and copies need the same protection as the original. Returning `None` for the
key, which means "skip the cache", is the fail-closed choice. A slower answer is far better than the wrong customer's
answer.

> Say it like this: "If I cannot build a safe key I skip the cache; a cache miss costs money, a leak costs the customer."

## How the problems use these ideas

- **Problem 33 (LRU cache):** LRU eviction with `OrderedDict`, a size limit, and treating a zero capacity as a config
  error. The production follow-up is moving to a shared cache with a time-to-live.
- **Problem 37 (tenant-aware key):** the key carries tenant, user, and permission version; the query is normalised; and
  the function returns `None` (skip the cache) when it cannot build a safe key, including when an id contains the `:`
  separator.

## Using an AI assistant on these problems

- Ask for `OrderedDict` and name the two moves (`move_to_end` on use, `popitem(last=False)` on overflow). Then check both
  are there.
- Check that `get` refreshes the key, and that updating an existing key also moves it to the end.
- For the cache key, list every part that must appear in it. Assistants often build the key from the query alone.
- Test normalisation with tabs and newlines, not only double spaces.
- Ask "how could two different inputs produce the same key?" to surface the separator collision.

## Words to know

| Term | Plain meaning |
| --- | --- |
| Cache | A store of results you already computed, kept for reuse. |
| Cache hit / miss | Found in the cache / not found, so you compute it. |
| Eviction | Removing an entry to make room. |
| LRU | Least recently used: drop the entry untouched for the longest. |
| Cache key | The label used to store and find an entry. |
| Invalidation | Making cached entries stop being used. |
| TTL | Time to live: how long an entry stays before it expires. |
| Normalise | Turn equivalent inputs into one standard form. |
