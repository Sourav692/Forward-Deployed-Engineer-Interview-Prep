"""Deterministic offline lexical-vector scoring.

This implementation intentionally does not claim semantic embedding quality. It
provides a zero-download retrieval baseline and a stable test double for the lab.
"""

import math
import re
from collections import Counter
from collections.abc import Sequence

_TOKEN_RE = re.compile(r"[a-zA-Z0-9_]+")


def tokenize(text: str) -> list[str]:
    if not isinstance(text, str):
        raise TypeError("Text must be a string.")
    return [token.lower() for token in _TOKEN_RE.findall(text)]


def embed_text(text: str) -> dict[str, float]:
    counts = Counter(tokenize(text))
    norm = math.sqrt(sum(value * value for value in counts.values())) or 1.0
    return {token: value / norm for token, value in counts.items()}


def cosine_similarity(left: dict[str, float], right: dict[str, float]) -> float:
    if not left or not right:
        return 0.0
    small, large = (left, right) if len(left) < len(right) else (right, left)
    return float(sum(value * large.get(token, 0.0) for token, value in small.items()))


class LexicalVectorEmbeddingProvider:
    """Fixed-dimension hashed lexical vectors for provider-based components."""

    def __init__(self, dimension: int = 384) -> None:
        if dimension <= 0:
            raise ValueError("dimension must be positive")
        self._dimension = dimension

    @property
    def dimension(self) -> int:
        return self._dimension

    def embed_documents(self, texts: Sequence[str]) -> list[list[float]]:
        return [self._embed(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed(text)

    def _embed(self, text: str) -> list[float]:
        tokens = tokenize(text)
        vector = [0.0] * self._dimension
        for token in tokens:
            # Python's hash is process-randomized, so use a stable byte checksum.
            index = sum((i + 1) * byte for i, byte in enumerate(token.encode("utf-8"))) % self._dimension
            vector[index] += 1.0
        norm = math.sqrt(sum(value * value for value in vector))
        if norm:
            vector = [value / norm for value in vector]
        return vector
