from collections import Counter
from time import perf_counter
from typing import Callable, TypeVar

T = TypeVar("T")

_COUNTERS: Counter[str] = Counter()
_LATENCIES_MS: list[float] = []


def increment(name: str) -> None:
    _COUNTERS[name] += 1


def record_latency_ms(value: float) -> None:
    _LATENCIES_MS.append(round(value, 2))


def snapshot() -> dict:
    avg_latency = sum(_LATENCIES_MS) / len(_LATENCIES_MS) if _LATENCIES_MS else 0.0
    return {
        "counters": dict(_COUNTERS),
        "request_count": len(_LATENCIES_MS),
        "avg_latency_ms": round(avg_latency, 2),
        "max_latency_ms": max(_LATENCIES_MS) if _LATENCIES_MS else 0.0,
    }


def timed(fn: Callable[..., T]) -> Callable[..., T]:
    def wrapper(*args, **kwargs):
        start = perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            record_latency_ms((perf_counter() - start) * 1000)

    return wrapper
