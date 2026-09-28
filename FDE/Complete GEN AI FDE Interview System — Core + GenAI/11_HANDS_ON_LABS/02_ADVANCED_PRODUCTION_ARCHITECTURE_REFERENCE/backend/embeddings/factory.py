from __future__ import annotations

from backend.app.config import Settings
from backend.embeddings.local_sentence_transformer import LocalSentenceTransformerEmbeddingProvider
from backend.embeddings.provider import EmbeddingProvider


def create_embedding_provider(settings: Settings) -> EmbeddingProvider:
    if settings.embedding_provider == "local":
        return LocalSentenceTransformerEmbeddingProvider(
            model_name=settings.embedding_model_name,
            cache_dir=settings.embedding_model_cache_dir,
            embedding_cache_path=settings.embedding_result_cache_path,
            device=settings.embedding_device,
            batch_size=settings.embedding_batch_size,
        )
    if settings.embedding_provider == "vertex_ai":
        from backend.embeddings.vertex_ai import VertexAIEmbeddingProvider

        return VertexAIEmbeddingProvider(
            project_id=settings.vertex_ai_project_id,
            location=settings.vertex_ai_location,
            model_name=settings.vertex_ai_embedding_model,
        )
    raise ValueError(f"Unsupported embedding provider: {settings.embedding_provider}")
