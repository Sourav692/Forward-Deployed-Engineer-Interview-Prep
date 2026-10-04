"""Reference solution. Do not open until you have finished the mock."""
import bisect
import itertools
import threading
from dataclasses import dataclass

INF = float("inf")


@dataclass
class _Grant:
    id: str
    customer: str
    expires_at: float
    remaining: int
    seq: int


@dataclass
class _Spend:
    parts: list  # [(grant, amount_taken)]
    refunded: bool = False


class CreditLedger:
    def __init__(self):
        self._grants = {}  # customer -> list[_Grant] sorted by (expires_at, seq)
        self._by_id = {}
        self._spends = {}  # (customer, spend_id) -> _Spend
        self._seq = itertools.count()
        self._lock = threading.Lock()

    @staticmethod
    def _check_amount(amount):
        if not isinstance(amount, int) or isinstance(amount, bool) or amount <= 0:
            raise ValueError("amount must be a positive int")

    def grant(self, customer, amount, ts, expires_at=None, grant_id=None):
        self._check_amount(amount)
        if expires_at is not None and expires_at <= ts:
            raise ValueError("expires_at must be after ts")
        with self._lock:
            if grant_id is not None and grant_id in self._by_id:
                return grant_id
            seq = next(self._seq)
            gid = grant_id or f"g{seq}"
            g = _Grant(gid, customer, INF if expires_at is None else expires_at, amount, seq)
            self._by_id[gid] = g
            bisect.insort(self._grants.setdefault(customer, []), g, key=lambda x: (x.expires_at, x.seq))
            return gid

    def _usable(self, customer, ts):
        return [g for g in self._grants.get(customer, []) if g.expires_at > ts and g.remaining > 0]

    def balance(self, customer, ts):
        with self._lock:
            return sum(g.remaining for g in self._usable(customer, ts))

    def spend(self, customer, amount, ts, spend_id=None):
        self._check_amount(amount)
        with self._lock:
            key = (customer, spend_id)
            if spend_id is not None and key in self._spends:
                return True
            usable = self._usable(customer, ts)
            if sum(g.remaining for g in usable) < amount:
                return False
            need, parts = amount, []
            for g in usable:
                take = min(g.remaining, need)
                g.remaining -= take
                parts.append((g, take))
                need -= take
                if need == 0:
                    break
            if spend_id is not None:
                self._spends[key] = _Spend(parts)
            return True

    def statement(self, customer, ts):
        with self._lock:
            return [
                {"grant_id": g.id, "remaining": g.remaining,
                 "expires_at": None if g.expires_at == INF else g.expires_at}
                for g in self._usable(customer, ts)
            ]

    def refund(self, customer, spend_id, ts):
        with self._lock:
            rec = self._spends.get((customer, spend_id))
            if rec is None:
                raise KeyError(spend_id)
            if rec.refunded:
                return 0
            restored = 0
            for g, taken in rec.parts:
                if g.expires_at > ts:
                    g.remaining += taken
                    restored += taken
            rec.refunded = True
            return restored
