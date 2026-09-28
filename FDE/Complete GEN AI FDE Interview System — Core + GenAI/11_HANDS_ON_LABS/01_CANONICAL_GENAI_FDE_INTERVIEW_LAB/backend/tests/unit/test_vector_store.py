from backend.rag.models import VectorRecord
from backend.rag.vector_stores.vectors import InMemoryVectorStore


def test_vector_store_upserts_and_returns_most_similar_record():
    store = InMemoryVectorStore(dimension=2)
    store.upsert(
        [
            VectorRecord("a", "doc-a", "alpha", [1.0, 0.0], {}),
            VectorRecord("b", "doc-b", "beta", [0.0, 1.0], {}),
        ]
    )
    results = store.search([1.0, 0.0], top_k=1)
    assert results[0][0].id == "a"
    assert results[0][1] == 1.0
