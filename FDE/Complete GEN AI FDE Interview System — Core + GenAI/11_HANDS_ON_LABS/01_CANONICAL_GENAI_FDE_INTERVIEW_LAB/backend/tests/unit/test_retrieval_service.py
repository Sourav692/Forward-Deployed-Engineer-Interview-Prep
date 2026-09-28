from backend.auth.roles import Role
from backend.rag.retrieval import LocalRetriever


def test_retrieval_reports_offline_lexical_mode():
    result = LocalRetriever().search("refund duplicate payment", Role.SUPPORT_AGENT)
    assert "retrieval_mode=lexical_vector" in result.retrieval_notes
