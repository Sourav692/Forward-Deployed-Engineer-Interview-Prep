from backend.auth.roles import Role
from backend.rag.retrieval import LocalRetriever


def test_retrieval_returns_citations_for_permitted_role():
    retriever = LocalRetriever()
    result = retriever.search("refund policy duplicate payment", Role.SUPPORT_AGENT)
    assert result.ranked_chunks
    assert any("refund" in item.chunk.title.lower() for item in result.ranked_chunks)


def test_keyword_fallback_when_vector_store_unavailable(monkeypatch):
    monkeypatch.setenv("SIMULATE_VECTOR_FAILURE", "true")
    retriever = LocalRetriever()
    result = retriever.search("refund policy duplicate payment", Role.SUPPORT_AGENT)
    assert result.used_fallback is True
    assert result.ranked_chunks
