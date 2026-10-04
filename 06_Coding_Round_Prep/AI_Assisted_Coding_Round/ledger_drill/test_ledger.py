import threading

import pytest

from ledger import CreditLedger


@pytest.fixture
def L():
    return CreditLedger()


# ---------------- Gate 1: grant, balance, spend ----------------
def test_gate1_basic_balance(L):
    L.grant("a", 100, ts=0)
    assert L.balance("a", ts=1) == 100
    assert L.balance("nobody", ts=1) == 0


def test_gate1_spend_success_and_insufficient(L):
    L.grant("a", 100, ts=0)
    assert L.spend("a", 30, ts=1) is True
    assert L.balance("a", ts=1) == 70
    assert L.spend("a", 71, ts=2) is False
    assert L.balance("a", ts=2) == 70


def test_gate1_expiry_boundary(L):
    L.grant("a", 50, ts=0, expires_at=10)
    assert L.balance("a", ts=9) == 50
    assert L.balance("a", ts=10) == 0  # expires AT expires_at
    assert L.spend("a", 1, ts=10) is False


def test_gate1_earliest_expiry_first(L):
    L.grant("a", 10, ts=0, expires_at=100)
    L.grant("a", 10, ts=0, expires_at=5)
    L.grant("a", 10, ts=0)  # never expires: consumed last
    assert L.spend("a", 10, ts=1) is True
    # the expires_at=5 grant was used, so at ts=6 only 20 remain
    assert L.balance("a", ts=6) == 20
    assert L.spend("a", 15, ts=6) is True
    # expires_at=100 grant consumed before the never-expiring one
    assert L.balance("a", ts=101) == 5


def test_gate1_spend_spans_grants(L):
    L.grant("a", 10, ts=0, expires_at=5)
    L.grant("a", 10, ts=0)
    assert L.spend("a", 15, ts=1) is True
    assert L.balance("a", ts=1) == 5


def test_gate1_customers_isolated(L):
    L.grant("a", 10, ts=0)
    L.grant("b", 20, ts=0)
    assert L.spend("a", 15, ts=1) is False
    assert L.balance("b", ts=1) == 20


def test_gate1_validation(L):
    for bad in (0, -5):
        with pytest.raises(ValueError):
            L.grant("a", bad, ts=0)
        with pytest.raises(ValueError):
            L.spend("a", bad, ts=0)
    with pytest.raises(ValueError):
        L.grant("a", 5, ts=10, expires_at=10)


# ---------------- Gate 2: idempotency + statement ----------------
def test_gate2_grant_idempotent(L):
    L.grant("a", 100, ts=0, grant_id="G1")
    L.grant("a", 100, ts=0, grant_id="G1")
    assert L.balance("a", ts=1) == 100


def test_gate2_spend_idempotent(L):
    L.grant("a", 100, ts=0)
    assert L.spend("a", 40, ts=1, spend_id="S1") is True
    assert L.spend("a", 40, ts=1, spend_id="S1") is True  # retry: no double charge
    assert L.balance("a", ts=1) == 60


def test_gate2_failed_spend_can_be_retried(L):
    assert L.spend("a", 10, ts=0, spend_id="S1") is False
    L.grant("a", 10, ts=1)
    assert L.spend("a", 10, ts=2, spend_id="S1") is True


def test_gate2_spend_is_atomic(L):
    L.grant("a", 10, ts=0)
    assert L.spend("a", 11, ts=1) is False
    assert L.balance("a", ts=1) == 10  # nothing partially consumed


def test_gate2_statement_order_and_contents(L):
    L.grant("a", 10, ts=0, expires_at=50, grant_id="late")
    L.grant("a", 10, ts=0, expires_at=20, grant_id="soon")
    L.grant("a", 10, ts=0, grant_id="forever")
    L.spend("a", 4, ts=1)
    st = L.statement("a", ts=2)
    assert [s["grant_id"] for s in st] == ["soon", "late", "forever"]
    assert st[0]["remaining"] == 6 and st[-1]["expires_at"] is None
    # expired and fully used grants are not listed
    L.spend("a", 6, ts=3)
    assert [s["grant_id"] for s in L.statement("a", ts=60)] == ["forever"]


# ---------------- Gate 3: refunds ----------------
def test_gate3_refund_restores_to_original_grants(L):
    L.grant("a", 10, ts=0, expires_at=100, grant_id="g1")
    L.grant("a", 10, ts=0, grant_id="g2")
    L.spend("a", 15, ts=1, spend_id="S1")
    assert L.refund("a", "S1", ts=2) == 15
    st = {s["grant_id"]: s["remaining"] for s in L.statement("a", ts=2)}
    assert st == {"g1": 10, "g2": 10}


def test_gate3_expired_portion_is_forfeited(L):
    L.grant("a", 10, ts=0, expires_at=5, grant_id="g1")
    L.grant("a", 10, ts=0, grant_id="g2")
    L.spend("a", 15, ts=1, spend_id="S1")  # 10 from g1, 5 from g2
    assert L.refund("a", "S1", ts=6) == 5  # g1 expired at 5
    assert L.balance("a", ts=6) == 10  # g2: 5 left + 5 restored; g1 expired


def test_gate3_refund_twice_is_noop(L):
    L.grant("a", 10, ts=0)
    L.spend("a", 10, ts=1, spend_id="S1")
    assert L.refund("a", "S1", ts=2) == 10
    assert L.refund("a", "S1", ts=3) == 0
    assert L.balance("a", ts=3) == 10


def test_gate3_unknown_spend_raises(L):
    with pytest.raises(KeyError):
        L.refund("a", "nope", ts=1)


def test_gate3_refunded_spend_id_not_reusable_as_new_charge(L):
    L.grant("a", 10, ts=0)
    L.spend("a", 10, ts=1, spend_id="S1")
    L.refund("a", "S1", ts=2)
    assert L.balance("a", ts=2) == 10


# ---------------- Gate 4: concurrency + invariants ----------------
def test_gate4_no_overspend_under_threads(L):
    L.grant("a", 1000, ts=0)
    results, lock = [], threading.Lock()

    def worker():
        for _ in range(50):
            ok = L.spend("a", 5, ts=1)
            with lock:
                results.append(ok)

    threads = [threading.Thread(target=worker) for _ in range(16)]  # 800 attempts x 5 = 4000
    [t.start() for t in threads]
    [t.join() for t in threads]
    assert sum(results) == 200  # exactly 1000 / 5 succeed
    assert L.balance("a", ts=1) == 0


def test_gate4_concurrent_idempotent_spend(L):
    L.grant("a", 100, ts=0)
    out = []

    def worker():
        out.append(L.spend("a", 60, ts=1, spend_id="SAME"))

    threads = [threading.Thread(target=worker) for _ in range(20)]
    [t.start() for t in threads]
    [t.join() for t in threads]
    assert all(out)
    assert L.balance("a", ts=1) == 40  # charged exactly once


def test_gate4_balance_does_not_mutate_state(L):
    L.grant("a", 10, ts=0, expires_at=5)
    assert L.balance("a", ts=6) == 0
    # querying a later time must not destroy credits for earlier queries
    assert L.balance("a", ts=1) == 10


def test_gate4_conservation_property(L):
    import random

    rng = random.Random(7)
    granted = 0
    for i in range(200):
        amt = rng.randint(1, 20)
        L.grant("a", amt, ts=0, grant_id=f"g{i}")
        granted += amt
    spent = 0
    for i in range(300):
        amt = rng.randint(1, 15)
        if L.spend("a", amt, ts=1, spend_id=f"s{i}"):
            spent += amt
    assert L.balance("a", ts=1) == granted - spent
