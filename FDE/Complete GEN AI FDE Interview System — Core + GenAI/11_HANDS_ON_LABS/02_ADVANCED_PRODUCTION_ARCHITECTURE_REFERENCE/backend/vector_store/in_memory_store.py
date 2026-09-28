from __future__ import annotations

from backend.vector_store.similarity import cosine_similarity


class InMemoryVectorStore:
    """Permission-aware educational vector store for local demonstrations."""

    def __init__(self, chunks: dict):
        self.chunks = chunks

    def search(
        self,
        query_embedding: list[float],
        tenant_id: str,
        permission_scopes: list[str],
        limit: int = 5,
    ) -> list[dict]:
        if not query_embedding:
            raise ValueError("Query embedding must not be empty")
        results: list[tuple[float, dict]] = []
        for chunk in self.chunks.values():
            if chunk["tenant_id"] != tenant_id:
                continue
            if not set(chunk["permission_scopes"]).intersection(permission_scopes):
                continue
            score = cosine_similarity(query_embedding, chunk["embedding"])
            results.append((score, {**chunk, "similarity_score": score}))
        return [row[1] for row in sorted(results, key=lambda item: item[0], reverse=True)[:limit]]
