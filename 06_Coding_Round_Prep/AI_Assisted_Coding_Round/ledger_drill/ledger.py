"""Starter file. Implement CreditLedger gate by gate.

Run one gate at a time:  pytest -k gate1   (then gate2, gate3, gate4)
"""


class CreditLedger:
    def grant(self, customer, amount, ts, expires_at=None):
        raise NotImplementedError

    def balance(self, customer, ts):
        raise NotImplementedError

    def spend(self, customer, amount, ts):
        raise NotImplementedError
