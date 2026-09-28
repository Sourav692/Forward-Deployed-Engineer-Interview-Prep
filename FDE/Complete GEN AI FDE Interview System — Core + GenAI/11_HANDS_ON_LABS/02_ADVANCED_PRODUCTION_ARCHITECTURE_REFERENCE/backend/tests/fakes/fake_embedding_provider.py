from __future__ import annotations

import hashlib
import math
from typing import Sequence


class DeterministicFakeEmbeddingProvider:
    """Stable test double; deterministic but intentionally not semantic."""

    def __init__(self, dimension: int = 8) -> None:
        self._dimension = dimension
        self.document_calls = 0
        self.query_calls = 0

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def model_name(self) -> str:
        return "deterministic-test-double-v1"

    def _embed(self, text: str) -> list[float]:
        if not text.strip():
            raise ValueError("Embedding input must not be empty")
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        values = [float(digest[i]) - 127.5 for i in range(self.dimension)]
        norm = math.sqrt(sum(value * value for value in values))
        return [value / norm for value in values]

    def embed_documents(self, texts: Sequence[str]) -> list[list[float]]:
        self.document_calls += 1
        return [self._embed(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        self.query_calls += 1
        return self._embed(text)
