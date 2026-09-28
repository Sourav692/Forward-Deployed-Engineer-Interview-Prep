from backend.auth.roles import Role
from backend.rag.retrieval import LocalRetriever


def test_sales_role_does_not_retrieve_restricted_security_policy():
    result = LocalRetriever().search("restricted security escalation secret escalation channel", Role.SALES_REP)
    assert all(item.chunk.source_id != "doc:security_policy" for item in result.ranked_chunks)
    all_text = " ".join(item.chunk.text.lower() for item in result.ranked_chunks)
    assert "secret escalation channel" not in all_text
