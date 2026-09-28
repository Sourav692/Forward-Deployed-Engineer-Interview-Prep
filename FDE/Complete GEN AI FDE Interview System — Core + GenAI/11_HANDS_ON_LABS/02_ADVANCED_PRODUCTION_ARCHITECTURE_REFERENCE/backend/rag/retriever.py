from __future__ import annotations

from backend.app.config import settings
from backend.db.repositories import repo
from backend.embeddings.factory import create_embedding_provider
from backend.embeddings.provider import EmbeddingProvider
from backend.vector_store.in_memory_store import InMemoryVectorStore


def retrieve(
    question: str,
    ctx,
    embedding_provider: EmbeddingProvider | None = None,
    limit: int = 5,
):
    if not question or not question.strip():
        raise ValueError("Question must not be empty")
    embedder = embedding_provider or create_embedding_provider(settings)
    query_embedding = embedder.embed_query(question)
    return InMemoryVectorStore(repo.chunks).search(
        query_embedding,
        ctx.tenant_id,
        ctx.permission_scopes,
        limit=limit,
    )
