# Credit ledger with expiry: 4 gates (60 minutes)

Same rules as the agentic mock: AI allowed, narrow prompts, read every diff, narrate aloud, one gate's tests at a time (`pytest -k gate1`). Do not open `solution/` until finished. Assumption: timestamps passed to a customer's calls never go backwards.

Run from this folder with your own `ledger.py` (the starter has stubs). Copy `solution/ledger.py` elsewhere if you want to check the tests themselves.

## Gate 1 (about 15 min): grant, balance, spend
- `grant(customer, amount, ts, expires_at=None)`: add credits. `amount` must be a positive int, `expires_at` (if given) must be after `ts`, else `ValueError`.
- `balance(customer, ts)`: usable credits at time `ts`. Credits are expired when `ts >= expires_at`.
- `spend(customer, amount, ts) -> bool`: succeeds only if enough usable credits exist. Consume the grant that expires earliest first; grants that never expire go last. Customers are isolated.

## Gate 2 (about 15 min): idempotency and statement
- `grant(..., grant_id=None)`: repeating the same `grant_id` must not add credits again.
- `spend(..., spend_id=None)`: repeating the same successful `spend_id` returns `True` without charging again. A failed spend is not remembered, so it can be retried after more credits arrive.
- A failed spend must not partially consume anything (atomic).
- `statement(customer, ts)`: list of usable grants as `{"grant_id", "remaining", "expires_at"}` ordered by expiry (`expires_at` is `None` if it never expires). Expired and fully used grants are not listed.

## Gate 3 (about 15 min): refunds
- `refund(customer, spend_id, ts) -> int`: return the credits of that spend to the original grants and return how many were restored.
- Any portion whose grant has expired at `ts` is forfeited.
- Refunding twice returns `0` and changes nothing. An unknown `spend_id` raises `KeyError`.

## Gate 4 (about 10 min): concurrency and invariants
- Many threads spending at once must never overspend.
- Concurrent retries with the same `spend_id` charge exactly once.
- `balance` must not mutate state (a later query must not destroy credits for an earlier timestamp).
- Conservation: balance equals total granted minus total successfully spent.

## Verbal follow-ups
- Per-customer locking versus one global lock: what changes?
- Balance is O(grants). How would you make it faster at scale (heap by expiry, lazy purge) and what does time travel (non-monotonic timestamps) break?
- How would you persist this, and what must be in one transaction?
