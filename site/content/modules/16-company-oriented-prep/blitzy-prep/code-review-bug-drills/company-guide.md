# Code Review Bug Drills (Round 1)

Covers: *"Read a short function, identify the bug, walk through how you'd fix and test it."*
The fixes for every drill except #6, which needs a real database, are verified by running `python3 Blitzy_Prep/drills_verify.py`.

## The 4-step answer script (say this out loud)

| Step              | What you say                                                                                                   | Time  |
| ----------------- | -------------------------------------------------------------------------------------------------------------- | ----- |
| 1. Read & restate | "This function takes X and is meant to return Y. Called from where? How hot is the path?"                      | 30s   |
| 2. Find the bug   | Name the**input that breaks it** — never just "this looks wrong"                                        | 1–2m |
| 3. Fix            | Smallest correct change first, then mention a structural improvement                                           | 1–2m |
| 4. Test           | Regression test for the exact failing input, plus edge cases (empty, one item, boundary, concurrency, failure) | 1m    |
| Bonus             | "How did this ship? Which test or review gate would have caught it?" ← FDE / Blitzy signal                    | 30s   |

## Scan checklist (in order)

| Look for      | Classic bug                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
| Boundaries    | Off-by-one, empty input, last batch dropped                                       |
| State         | Mutable defaults, shared globals, mutating a collection while iterating over it   |
| Concurrency   | Check-then-act, non-atomic`+=`, no lock                                         |
| Failure paths | Swallowed exceptions, retrying non-retryable errors, no backoff, leaked resources |
| Data          | Float money, naive datetimes, missing`None` checks                              |
| Security      | SQL built with f-strings, cache key missing tenant/user                           |
| Distributed   | Non-idempotent handler, N+1 queries, unbounded retries                            |

---

## Drill 1 — Mutable default argument

```python
def add_tag(tag, tags=[]):
    tags.append(tag)
    return tags
```

| Bug                                                      | Breaking input                                                        | Fix                                                            | Tests                                                                                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| The default list is created once and shared across calls | `add_tag("a")` → `["a"]`, then `add_tag("b")` → `["a","b"]` | `tags=None` → `tags = [] if tags is None else list(tags)` | Two calls without an argument give independent results; passing a list does not mutate the caller's copy |

## Drill 2 — Off-by-one in batching

```python
def batches(items, size):
    return [items[i:i + size] for i in range(0, len(items) - 1, size)]
```

| Bug                                                                    | Breaking input                                     | Fix                                                    | Tests                                                                                          |
| ---------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `len(items) - 1` drops the last batch when it holds a single element | `batches([1,2,3], 2)` → `[[1,2]]` (3 is lost) | `range(0, len(items), size)`; raise if `size <= 0` | Empty list,`len == size`, `len == size + 1`, `size = 0` raises; flatten(result) == items |

## Drill 3 — Retry loop (three bugs)

```python
def call_with_retry(fn, retries=3):
    for i in range(retries):
        try:
            return fn()
        except Exception:
            pass
```

| Bug                                                                      | Breaking input                | Fix                                                        | Tests                                      |
| ------------------------------------------------------------------------ | ----------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| (a) Returns`None` after the last failure, so the caller fails far away | `fn` always raises          | Re-raise on the last attempt                               | Always-fail → raises the original error   |
| (b) Retries non-retryable errors (400, auth)                             | `ValueError` is retried 3× | Retry only on`retry_on=(TimeoutError, ConnectionError)`  | `ValueError` → called once              |
| (c) No backoff → retry storm on a struggling dependency                 | 1000 clients retry instantly  | Exponential backoff with jitter:`base * 2**i + random()` | Inject`sleep` and assert the delays grow |

## Drill 4 — Race condition (check-then-act)

```python
class RateLimiter:
    def __init__(self, limit):
        self.limit, self.counts = limit, {}
    def allow(self, user):
        n = self.counts.get(user, 0)
        if n >= self.limit:
            return False
        self.counts[user] = n + 1
        return True
```

| Bug                                                                                  | Breaking input                               | Fix                                                                                                              | Tests                                                                                         |
| ------------------------------------------------------------------------------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Read and write are not atomic; under threads two requests both read`n = limit - 1` | 50 threads, limit 10 → more than 10 allowed | `threading.Lock` around the read-modify-write; in a distributed setup use Redis `INCR` + `EXPIRE` (atomic) | Many threads, assert exactly`limit` are allowed; there is also no window reset (mention it) |

## Drill 5 — Resource leak

```python
def read_config(path):
    f = open(path)
    data = json.load(f)
    f.close()
    return data
```

| Bug                                                                                       | Breaking input                                    | Fix                       | Tests                                                                             |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------- |
| If`json.load` raises, the file handle is never closed, leaking FDs and pool connections | Malformed JSON in a loop → "too many open files" | `with open(path) as f:` | Malformed file raises`JSONDecodeError` and the handle is closed (mock `open`) |

## Drill 6 — N+1 queries

```python
def order_summaries(db, order_ids):
    return [db.query("SELECT * FROM orders WHERE id = ?", oid) for oid in order_ids]
```

| Bug                                                         | Breaking input           | Fix                                                              | Tests                                                                    |
| ----------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| One round trip per id; latency grows linearly with the list | 5,000 ids × 2 ms = 10 s | A single`WHERE id IN (...)` query in chunks of ~500, or a join | Assert the query count is ≤ ceil(n/500); result order matches the input |

## Drill 7 — Float money

```python
def total(prices, tax_rate):
    return round(sum(prices) * (1 + tax_rate), 2)
```

| Bug                                                                  | Breaking input                                         | Fix                                                                                      | Tests                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Binary floats can't represent cents;`round` uses banker's rounding | `0.1 + 0.2` → `0.30000000000000004`; totals drift | `Decimal` from strings, `quantize(Decimal("0.01"), ROUND_HALF_UP)`, or integer cents | Known tricky values (`0.1, 0.2`), half-cent rounding, empty list = 0 |

## Drill 8 — Mutating a list while iterating

```python
def remove_inactive(users):
    for u in users:
        if not u["active"]:
            users.remove(u)
    return users
```

| Bug                                                                  | Breaking input                                  | Fix                                          | Tests                                             |
| -------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------- | ------------------------------------------------- |
| Removing an element shifts the index, so the next element is skipped | Two inactive users side by side → one survives | `return [u for u in users if u["active"]]` | Adjacent inactive users, all inactive, empty list |

## Drill 9 — Naive datetime / token expiry

```python
def is_expired(expires_at_utc):          # stored as naive UTC
    return datetime.now() > expires_at_utc
```

| Bug                                                                                                            | Breaking input                      | Fix                                                                              | Tests                                                                           |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `datetime.now()` is local time while the stored value is UTC; outside UTC, tokens expire hours early or late | Server running in IST → 5.5 h skew | Timezone-aware everywhere:`datetime.now(timezone.utc)`; store aware timestamps | Inject a clock; check the boundary at exactly`expires_at`; reject naive input |

## Drill 10 — Cross-tenant cache leak ⭐ (strong FDE signal)

```python
@functools.lru_cache(maxsize=1024)
def get_report(report_id):
    tenant = current_request().tenant_id
    return db.fetch_report(tenant, report_id)
```

| Bug                                                                                | Breaking input                      | Fix                                                                                                                        | Tests                                                                                |
| ---------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| The cache key is only`report_id`; tenant A's cached result is served to tenant B | A and B both request`report_id=1` | Put the tenant in the key:`get_report(tenant_id, report_id)`; never read hidden request context inside a cached function | Two tenants with the same id get different results; a security regression test in CI |

## Drill 11 — SQL injection

```python
def find_user(conn, email):
    return conn.execute(f"SELECT * FROM users WHERE email = '{email}'").fetchall()
```

| Bug                                 | Breaking input                        | Fix                                                              | Tests                                                |
| ----------------------------------- | ------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| User input is concatenated into SQL | `"x' OR '1'='1"` returns every user | Parameterized query:`execute("... WHERE email = ?", (email,))` | Injection string returns`[]`; a normal email works |

## Drill 12 — Non-idempotent webhook ⭐

```python
def handle_payment_webhook(event):
    charge_customer(event["customer_id"], event["amount"])
    return 200
```

| Bug                                                            | Breaking input                       | Fix                                                                                                                                                                                 | Tests                                                                              |
| -------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Webhooks are delivered at least once, so a retry charges twice | The provider retries after a timeout | Idempotency key: insert`event["id"]` into a processed table with a unique constraint **in the same transaction** as the side effect; on duplicate return 200 without acting | Deliver the same event twice → charged once; two different events → both charged |

---

## How Blitzy could frame these

| If they ask…                                              | Answer                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "How would you catch these in AI-generated code at scale?" | Static analysis (Semgrep/CodeQL for SQLi and secrets), required tests that execute real code paths, a concurrency/property-test harness, and platform**Rules** (Blitzy has rules such as *require-test-coverage* and *catalog-security-vulnerabilities*) |
| "Would a human reviewer catch#10?"                         | Often not. It reads correctly. That's why tenant-isolation tests belong in CI and aren't left to review                                                                                                                                                            |
| "Fix or rewrite?"                                          | Fix minimally, add a regression test, and file the structural improvement separately so the review diff stays small                                                                                                                                                |
