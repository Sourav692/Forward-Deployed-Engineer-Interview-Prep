"""Fixed versions of the drills in 01_Code_Review_Bug_Drills.md, with tests.

Run: python3 08_Company_Specific_Prep/Blitzy/drills_verify.py
"""
import json
import random
import sqlite3
import tempfile
import threading
from datetime import datetime, timedelta, timezone
from decimal import ROUND_HALF_UP, Decimal


# Drill 1
def add_tag(tag, tags=None):
    tags = [] if tags is None else list(tags)
    tags.append(tag)
    return tags


# Drill 2
def batches(items, size):
    if size <= 0:
        raise ValueError("size must be positive")
    return [items[i:i + size] for i in range(0, len(items), size)]


# Drill 3
def call_with_retry(fn, retries=3, retry_on=(TimeoutError, ConnectionError),
                    base=0.1, sleep=lambda s: None):
    for attempt in range(retries):
        try:
            return fn()
        except retry_on:
            if attempt == retries - 1:
                raise
            sleep(base * 2 ** attempt + random.uniform(0, base))


# Drill 4
class RateLimiter:
    def __init__(self, limit):
        self.limit, self.counts, self._lock = limit, {}, threading.Lock()

    def allow(self, user):
        with self._lock:
            n = self.counts.get(user, 0)
            if n >= self.limit:
                return False
            self.counts[user] = n + 1
            return True


# Drill 5
def read_config(path):
    with open(path) as f:
        return json.load(f)


# Drill 7
def total(prices, tax_rate):
    subtotal = sum((Decimal(p) for p in prices), Decimal("0"))
    return (subtotal * (1 + Decimal(tax_rate))).quantize(Decimal("0.01"), ROUND_HALF_UP)


# Drill 8
def remove_inactive(users):
    return [u for u in users if u["active"]]


# Drill 9
def is_expired(expires_at, now=None):
    if expires_at.tzinfo is None:
        raise ValueError("expires_at must be timezone-aware")
    now = now or datetime.now(timezone.utc)
    return now >= expires_at


# Drill 10
_report_cache = {}


def get_report(tenant_id, report_id, fetch):
    key = (tenant_id, report_id)
    if key not in _report_cache:
        _report_cache[key] = fetch(tenant_id, report_id)
    return _report_cache[key]


# Drill 11
def find_user(conn, email):
    return conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchall()


# Drill 12
def handle_payment_webhook(conn, event, charges):
    try:
        with conn:  # one transaction: dedupe record + side effect
            conn.execute("INSERT INTO processed(event_id) VALUES (?)", (event["id"],))
            charges.append((event["customer_id"], event["amount"]))
    except sqlite3.IntegrityError:
        pass  # duplicate delivery: already processed
    return 200


def test_all():
    assert add_tag("a") == ["a"] and add_tag("b") == ["b"]
    caller = ["x"]
    add_tag("y", caller)
    assert caller == ["x"]

    assert batches([], 2) == []
    assert batches([1, 2, 3], 2) == [[1, 2], [3]]
    assert batches([1, 2], 2) == [[1, 2]]
    try:
        batches([1], 0)
        assert False
    except ValueError:
        pass

    calls = []

    def always_timeout():
        calls.append(1)
        raise TimeoutError("boom")
    try:
        call_with_retry(always_timeout)
        assert False
    except TimeoutError:
        assert len(calls) == 3
    calls.clear()

    def bad_input():
        calls.append(1)
        raise ValueError("400")
    try:
        call_with_retry(bad_input)
    except ValueError:
        assert len(calls) == 1
    delays = []
    try:
        call_with_retry(always_timeout, retries=4, base=1, sleep=delays.append)
    except TimeoutError:
        assert delays == sorted(delays) and len(delays) == 3

    limiter, allowed = RateLimiter(10), []
    threads = [threading.Thread(target=lambda: allowed.append(limiter.allow("u")))
               for _ in range(50)]
    [t.start() for t in threads]
    [t.join() for t in threads]
    assert sum(allowed) == 10

    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        f.write("{bad json")
    try:
        read_config(f.name)
        assert False
    except json.JSONDecodeError:
        pass

    assert total(["0.1", "0.2"], "0") == Decimal("0.30")
    assert total(["0.125"], "0") == Decimal("0.13")
    assert total([], "0.1") == Decimal("0.00")

    users = [{"id": 1, "active": False}, {"id": 2, "active": False}, {"id": 3, "active": True}]
    assert [u["id"] for u in remove_inactive(users)] == [3]

    t0 = datetime(2026, 1, 1, tzinfo=timezone.utc)
    assert is_expired(t0, now=t0) is True
    assert is_expired(t0, now=t0 - timedelta(seconds=1)) is False
    try:
        is_expired(datetime(2026, 1, 1))
        assert False
    except ValueError:
        pass

    fetch = lambda tenant, rid: f"{tenant}:{rid}"
    assert get_report("A", 1, fetch) == "A:1"
    assert get_report("B", 1, fetch) == "B:1"

    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE users(email TEXT)")
    conn.execute("INSERT INTO users VALUES ('a@x.com'), ('b@x.com')")
    assert find_user(conn, "x' OR '1'='1") == []
    assert find_user(conn, "a@x.com") == [("a@x.com",)]

    conn.execute("CREATE TABLE processed(event_id TEXT PRIMARY KEY)")
    charges = []
    event = {"id": "evt_1", "customer_id": "c1", "amount": 100}
    handle_payment_webhook(conn, event, charges)
    handle_payment_webhook(conn, event, charges)
    handle_payment_webhook(conn, {**event, "id": "evt_2"}, charges)
    assert len(charges) == 2

    print("All drill fixes verified.")


if __name__ == "__main__":
    test_all()
