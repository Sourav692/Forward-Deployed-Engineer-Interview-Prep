from __future__ import annotations

from collections.abc import Iterable
from typing import Protocol

from backend.rag.models import VectorRecord
from backend.rag.similarity import cosine_similarity


class VectorStore(Protocol):
    def upsert(self, records: Iterable[VectorRecord]) -> None: ...

    def search(self, query_vector: list[float], top_k: int = 4) -> list[tuple[VectorRecord, float]]: ...


class InMemoryVectorStore:
    """Small deterministic vector store used for tests and local demonstrations."""

    def __init__(self, dimension: int | None = None) -> None:
        self._dimension = dimension
        self._records: dict[str, VectorRecord] = {}

    def upsert(self, records: Iterable[VectorRecord]) -> None:
        for record in records:
            self._validate_vector(record.vector)
            self._records[record.id] = record

    def search(self, query_vector: list[float], top_k: int = 4) -> list[tuple[VectorRecord, float]]:
        if top_k <= 0:
            return []
        self._validate_vector(query_vector)
        ranked = [
            (record, cosine_similarity(query_vector, record.vector))
            for record in self._records.values()
        ]
        ranked.sort(key=lambda item: (-item[1], item[0].id))
        return ranked[:top_k]

    def get(self, record_id: str) -> VectorRecord | None:
        return self._records.get(record_id)

    def __len__(self) -> int:
        return len(self._records)

    def _validate_vector(self, vector: list[float]) -> None:
        if not vector:
            raise ValueError("Vector must not be empty.")
        if self._dimension is None:
            self._dimension = len(vector)
        elif len(vector) != self._dimension:
            raise ValueError(f"Vector dimension mismatch: expected {self._dimension}, got {len(vector)}")
