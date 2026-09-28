from __future__ import annotations

import math
from typing import Sequence


def cosine_similarity(left: Sequence[float], right: Sequence[float]) -> float:
    if len(left) != len(right):
        raise ValueError(f"Vector dimension mismatch: {len(left)} != {len(right)}")
    if not left:
        raise ValueError("Cosine similarity requires non-empty vectors")
    dot = sum(float(a) * float(b) for a, b in zip(left, right, strict=True))
    left_norm = math.sqrt(sum(float(v) ** 2 for v in left))
    right_norm = math.sqrt(sum(float(v) ** 2 for v in right))
    if left_norm == 0.0 or right_norm == 0.0:
        raise ValueError("Cosine similarity is undefined for zero vectors")
    return dot / (left_norm * right_norm)
