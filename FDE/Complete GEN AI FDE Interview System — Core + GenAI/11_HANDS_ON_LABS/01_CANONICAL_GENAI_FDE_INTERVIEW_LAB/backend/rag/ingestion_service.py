from __future__ import annotations

from typing import Protocol

from backend.rag.embeddings.base import EmbeddingProvider
from backend.rag.models import TextChunk, VectorRecord
from backend.rag.vector_stores.vectors import VectorStore


class TextChunker(Protocol):
    def split(self, text: str) -> list[TextChunk]: ...


class IngestionService:
    def __init__(self, chunker: TextChunker, embedding_provider: EmbeddingProvider, vector_store: VectorStore) -> None:
        self._chunker = chunker
        self._embedding_provider = embedding_provider
        self._vector_store = vector_store

    def ingest_document(self, document_id: str, text: str, metadata: dict[str, str] | None = None) -> int:
        if not document_id.strip():
            raise ValueError("document_id must not be empty")
        chunks = self._chunker.split(text)
        if not chunks:
            return 0
        vectors = self._embedding_provider.embed_documents([chunk.text for chunk in chunks])
        if len(chunks) != len(vectors):
            raise RuntimeError("The embedding provider returned a different number of vectors than input chunks.")
        records = [
            VectorRecord(
                id=chunk.id,
                document_id=document_id,
                text=chunk.text,
                vector=vector,
                metadata={**(metadata or {}), "chunk_index": str(index)},
            )
            for index, (chunk, vector) in enumerate(zip(chunks, vectors, strict=True))
        ]
        self._vector_store.upsert(records)
        return len(records)
