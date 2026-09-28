"""Embedding interfaces and implementations.

The default application path uses deterministic lexical vectors so the lab runs
fully offline. A sentence-transformer provider is available as an optional,
explicit production-style extension.
"""

from backend.rag.embeddings.base import EmbeddingProvider
from backend.rag.embeddings.lexical_vectors import (
    LexicalVectorEmbeddingProvider,
    cosine_similarity,
    embed_text,
    tokenize,
)

__all__ = [
    "EmbeddingProvider",
    "LexicalVectorEmbeddingProvider",
    "cosine_similarity",
    "embed_text",
    "tokenize",
]
