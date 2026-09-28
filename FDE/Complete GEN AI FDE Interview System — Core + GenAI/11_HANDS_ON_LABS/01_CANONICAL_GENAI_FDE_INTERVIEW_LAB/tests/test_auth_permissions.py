from backend.auth.roles import Role
from backend.rag.retrieval import LocalRetriever


def test_sales_rep_cannot_retrieve_security_policy():
    retriever = LocalRetriever()
    result = retriever.search("admin-only security escalation secret escalation channel", Role.SALES_REP)
    assert all("security_policy" not in item.chunk.source_id for item in result.ranked_chunks)
    joined_text = " ".join(item.chunk.text.lower() for item in result.ranked_chunks)
    assert "secret escalation channel" not in joined_text


def test_manager_can_retrieve_security_policy():
    retriever = LocalRetriever()
    result = retriever.search("security escalation prompt injection customer data leakage", Role.MANAGER)
    assert any("security_policy" in item.chunk.source_id for item in result.ranked_chunks)
