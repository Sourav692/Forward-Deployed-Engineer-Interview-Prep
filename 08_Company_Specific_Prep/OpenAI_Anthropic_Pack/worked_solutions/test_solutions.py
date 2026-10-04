import threading
import time

import pytest

from solutions import (AllModelsFailed, CircuitBreaker, CircuitOpen, ConflictError, FallbackRouter,
                       IdempotentProcessor, LoopDetector, RateLimiter, repair_json, retrieval_cache_key,
                       retrieve, retry_with_backoff, validate_tool_args)


class Clock:
    def __init__(self):
        self.t = 0.0

    def __call__(self):
        return self.t


# 1 ---------------------------------------------------------------------------
SCHEMA = {"city": {"type": "str", "required": True},
          "days": {"type": "int", "min": 1, "max": 7, "default": 3},
          "unit": {"type": "str", "enum": ["c", "f"]}}


def test_validate_ok_with_default():
    assert validate_tool_args(SCHEMA, {"city": "Pune"}) == ({"city": "Pune", "days": 3}, [])


def test_validate_collects_all_errors():
    clean, errors = validate_tool_args(SCHEMA, {"days": 9, "unit": "k", "extra": 1})
    assert clean == {} and len(errors) == 4
    assert "missing required argument 'city'" in errors


def test_validate_bool_is_not_int():
    assert validate_tool_args(SCHEMA, {"city": "x", "days": True})[1]


def test_validate_non_object():
    assert validate_tool_args(SCHEMA, ["x"])[1]


# 2 ---------------------------------------------------------------------------
def test_backoff_delays_and_cap():
    sleeps, calls = [], []

    def flaky():
        calls.append(1)
        if len(calls) < 4:
            raise TimeoutError
        return "ok"

    assert retry_with_backoff(flaky, retries=3, base=1, cap=3, sleep=sleeps.append, rng=lambda: 1.0) == "ok"
    assert sleeps == [1, 2, 3]  # 4 capped at 3


def test_backoff_gives_up_and_skips_non_retryable():
    with pytest.raises(TimeoutError):
        retry_with_backoff(lambda: (_ for _ in ()).throw(TimeoutError()), retries=2, sleep=lambda s: None,
                           retry_on=(TimeoutError,))
    sleeps = []
    with pytest.raises(ValueError):
        retry_with_backoff(lambda: (_ for _ in ()).throw(ValueError()), retry_on=(TimeoutError,), sleep=sleeps.append)
    assert sleeps == []


# 3 ---------------------------------------------------------------------------
def test_idempotent_same_key_same_result():
    calls = []
    p = IdempotentProcessor(lambda x: calls.append(x) or len(calls))
    assert p.process("k", {"a": 1}) == 1 and p.process("k", {"a": 1}) == 1 and len(calls) == 1


def test_idempotent_conflict_and_failure_not_cached():
    attempts = []

    def handler(x):
        attempts.append(1)
        if len(attempts) == 1:
            raise RuntimeError("boom")
        return "done"

    p = IdempotentProcessor(handler)
    with pytest.raises(RuntimeError):
        p.process("k", {"a": 1})
    assert p.process("k", {"a": 1}) == "done"
    with pytest.raises(ConflictError):
        p.process("k", {"a": 2})


def test_idempotent_ttl_expiry():
    clock, calls = Clock(), []
    p = IdempotentProcessor(lambda x: calls.append(1) or len(calls), ttl=10, clock=clock)
    p.process("k", {})
    clock.t = 11
    assert p.process("k", {}) == 2


def test_idempotent_concurrent_duplicates_run_once():
    calls = []

    def slow(x):
        time.sleep(0.1)
        calls.append(1)
        return "r"

    p, out = IdempotentProcessor(slow), []
    threads = [threading.Thread(target=lambda: out.append(p.process("k", {"a": 1}))) for _ in range(10)]
    [t.start() for t in threads]
    [t.join() for t in threads]
    assert out == ["r"] * 10 and len(calls) == 1


# 4 ---------------------------------------------------------------------------
def boom():
    raise ConnectionError


def test_breaker_lifecycle():
    clock = Clock()
    b = CircuitBreaker(failure_threshold=2, reset_timeout=10, clock=clock)
    for _ in range(2):
        with pytest.raises(ConnectionError):
            b.call(boom)
    assert b.state == "open"
    with pytest.raises(CircuitOpen):
        b.call(lambda: "x")
    clock.t = 10
    with pytest.raises(ConnectionError):  # half-open probe fails -> open again
        b.call(boom)
    assert b.state == "open"
    clock.t = 20
    assert b.call(lambda: "ok") == "ok" and b.state == "closed"


def test_breaker_success_resets_failure_count():
    b = CircuitBreaker(failure_threshold=2)
    with pytest.raises(ConnectionError):
        b.call(boom)
    b.call(lambda: 1)
    with pytest.raises(ConnectionError):
        b.call(boom)
    assert b.state == "closed"


def test_breaker_half_open_allows_one_probe():
    clock = Clock()
    b = CircuitBreaker(failure_threshold=1, reset_timeout=5, clock=clock)
    with pytest.raises(ConnectionError):
        b.call(boom)
    clock.t = 5
    results = []

    def probe():
        with pytest.raises(CircuitOpen):  # a second caller during the probe is rejected
            b.call(lambda: "second")
        results.append("probed")
        return "ok"

    assert b.call(probe) == "ok" and results == ["probed"]


# 5 ---------------------------------------------------------------------------
def test_rate_limiter_burst_refill_and_isolation():
    clock = Clock()
    rl = RateLimiter(rate=1, capacity=3, clock=clock)
    assert [rl.allow("a") for _ in range(4)] == [True, True, True, False]
    assert rl.allow("b") is True  # separate tenant
    assert rl.retry_after("a") == pytest.approx(1.0)
    clock.t = 2
    assert rl.allow("a", cost=2) is True and rl.allow("a") is False
    assert rl.allow("a", cost=10) is False and rl.retry_after("a", cost=10) == float("inf")


# 6 ---------------------------------------------------------------------------
CHUNKS = [
    {"id": "pub", "tenant": "t1", "allowed_groups": {"all"}, "score": 1},
    {"id": "hr", "tenant": "t1", "allowed_groups": {"hr"}, "score": 9},
    {"id": "other", "tenant": "t2", "allowed_groups": {"all"}, "score": 8},
    {"id": "noacl", "tenant": "t1", "score": 7},
]


def test_retrieval_filters_before_topk():
    user = {"tenant": "t1", "groups": ["all"]}
    out = retrieve(CHUNKS, user, lambda c: c["score"], k=3)
    assert [c["id"] for c in out] == ["pub"]  # hr, other tenant, and no-ACL chunks never appear


def test_retrieval_allows_matching_group_and_cache_key_differs():
    hr = {"tenant": "t1", "groups": ["all", "hr"]}
    assert [c["id"] for c in retrieve(CHUNKS, hr, lambda c: c["score"], k=1)] == ["hr"]
    assert retrieval_cache_key("q", hr) != retrieval_cache_key("q", {"tenant": "t1", "groups": ["all"]})


# 7 ---------------------------------------------------------------------------
def test_loop_detector_repeat_and_cycle():
    d = LoopDetector(repeat_limit=3)
    assert [d.observe("search", {"q": "a"}) for _ in range(3)] == [False, False, True]
    d2 = LoopDetector(repeat_limit=3)
    flags = [d2.observe(t, {}) for t in ["a", "b", "a", "b", "a", "b"]]
    assert flags[-1] is True and not any(flags[:-1])


def test_loop_detector_ignores_progress_and_arg_order():
    d = LoopDetector(repeat_limit=3)
    assert not any(d.observe("search", {"q": i}) for i in range(6))
    d3 = LoopDetector(repeat_limit=2)
    d3.observe("t", {"a": 1, "b": 2})
    assert d3.observe("t", {"b": 2, "a": 1}) is True


# 8 ---------------------------------------------------------------------------
def test_fallback_order_and_trace():
    def primary(p):
        raise TimeoutError

    router = FallbackRouter([("big", primary), ("small", lambda p: p.upper())])
    assert router.call("hi") == ("HI", "small", [("big", "TimeoutError")])


def test_fallback_skips_open_breaker_and_all_fail():
    clock = Clock()
    router = FallbackRouter([("a", lambda p: (_ for _ in ()).throw(TimeoutError()))], failure_threshold=1,
                            clock=clock)
    with pytest.raises(AllModelsFailed):
        router.call("x")
    with pytest.raises(AllModelsFailed) as e:
        router.call("x")
    assert e.value.attempts == [("a", "circuit_open")]


def test_fallback_non_retryable_surfaces():
    router = FallbackRouter([("a", lambda p: (_ for _ in ()).throw(ValueError("bad request"))), ("b", lambda p: "x")])
    with pytest.raises(ValueError):
        router.call("x")


# 9 ---------------------------------------------------------------------------
def test_repair_json_variants():
    assert repair_json('Sure! Here you go:\n```json\n{"a": 1, "b": [1, 2,],}\n```\nHope it helps') == {"a": 1, "b": [1, 2]}
    assert repair_json('result: {"text": "use } carefully", "n": 2} trailing') == {"text": "use } carefully", "n": 2}
    assert repair_json('{"outer": {"inner": 1}}') == {"outer": {"inner": 1}}


def test_repair_json_failures():
    with pytest.raises(ValueError):
        repair_json("no json here")
    with pytest.raises(ValueError):
        repair_json('{"a": 1')
