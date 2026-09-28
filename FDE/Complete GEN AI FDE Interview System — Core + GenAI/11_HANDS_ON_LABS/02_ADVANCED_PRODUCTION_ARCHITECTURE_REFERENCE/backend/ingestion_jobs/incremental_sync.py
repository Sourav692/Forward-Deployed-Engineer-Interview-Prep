from __future__ import annotations

import hashlib

from backend.db.repositories import repo
from backend.embeddings.factory import create_embedding_provider
from backend.embeddings.provider import EmbeddingProvider
from backend.ingestion_jobs.chunking import chunk_text
from backend.app.config import settings


def run_incremental_sync(
    connector,
    since_cursor: str | None = None,
    embedding_provider: EmbeddingProvider | None = None,
) -> dict:
    connector.authenticate()
    raw_items, next_cursor = connector.fetch_changed_items(since_cursor)
    embedder = embedding_provider or create_embedding_provider(settings)
    embedded_chunks = 0

    for raw in raw_items:
        doc = connector.normalize(raw)
        scopes = connector.fetch_permissions(doc["source_id"])
        doc_id = f'{doc["tenant_id"]}:{doc["source_system"]}:{doc["source_id"]}'
        content_hash = hashlib.sha256(doc["content"].encode("utf-8")).hexdigest()
        repo.documents[doc_id] = {
            **doc,
            "id": doc_id,
            "permission_scopes": scopes,
            "content_hash": content_hash,
        }

        chunks = chunk_text(doc["content"])
        vectors = embedder.embed_documents(chunks)
        if len(chunks) != len(vectors):
            raise RuntimeError("Embedding provider returned a different number of vectors than chunks")

        # Idempotently replace this document's chunks to prevent stale tail chunks.
        stale_ids = [key for key, value in repo.chunks.items() if value["document_id"] == doc_id]
        for key in stale_ids:
            del repo.chunks[key]

        for index, (chunk, vector) in enumerate(zip(chunks, vectors, strict=True)):
            chunk_id = f"{doc_id}:chunk:{index}"
            repo.chunks[chunk_id] = {
                "id": chunk_id,
                "document_id": doc_id,
                "tenant_id": doc["tenant_id"],
                "chunk_text": chunk,
                "permission_scopes": scopes,
                "embedding": vector,
                "embedding_model": embedder.model_name,
                "embedding_dimension": embedder.dimension,
                "normalized": True,
                "content_hash": hashlib.sha256(chunk.encode("utf-8")).hexdigest(),
            }
            embedded_chunks += 1

    return {
        "synced": len(raw_items),
        "embedded_chunks": embedded_chunks,
        "embedding_model": embedder.model_name,
        "embedding_dimension": embedder.dimension,
        "next_cursor": next_cursor,
    }
