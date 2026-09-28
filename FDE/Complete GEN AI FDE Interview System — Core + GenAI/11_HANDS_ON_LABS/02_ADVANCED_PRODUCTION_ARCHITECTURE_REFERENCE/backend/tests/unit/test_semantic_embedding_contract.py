from math import sqrt
from types import SimpleNamespace

import pytest

from backend.db.repositories import repo
from backend.rag.retriever import retrieve
from backend.tests.fakes.fake_embedding_provider import DeterministicFakeEmbeddingProvider
from backend.vector_store.similarity import cosine_similarity


def test_fake_vectors_are_normalized_and_deterministic():
    provider = DeterministicFakeEmbeddingProvider()
    first = provider.embed_query("billing access")
    second = provider.embed_query("billing access")
    assert first == second
    assert sqrt(sum(value * value for value in first)) == pytest.approx(1.0)


def test_cosine_rejects_dimension_mismatch():
    with pytest.raises(ValueError, match="dimension mismatch"):
        cosine_similarity([1.0, 0.0], [1.0])


def test_retriever_embeds_query_once_and_preserves_permissions():
    repo.chunks.clear()
    provider = DeterministicFakeEmbeddingProvider()
    allowed_vector = provider.embed_query("billing portal token expired")
    blocked_vector = provider.embed_query("secret payroll")
    provider.query_calls = 0
    repo.chunks.update({
        "allowed": {
            "id": "allowed", "document_id": "d1", "tenant_id": "t1",
            "chunk_text": "billing portal token expired", "permission_scopes": ["support"],
            "embedding": allowed_vector,
        },
        "blocked": {
            "id": "blocked", "document_id": "d2", "tenant_id": "t1",
            "chunk_text": "secret payroll", "permission_scopes": ["finance"],
            "embedding": blocked_vector,
        },
    })
    ctx = SimpleNamespace(tenant_id="t1", permission_scopes=["support"])
    results = retrieve("billing portal token expired", ctx, provider)
    assert provider.query_calls == 1
    assert [item["id"] for item in results] == ["allowed"]
    assert "similarity_score" in results[0]
