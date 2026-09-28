from backend.auth.roles import Role
from backend.rag.retrieval import LocalRetriever


def test_retrieval_quality_for_refund_policy():
    result = LocalRetriever().search("duplicate payment refund verification", Role.SUPPORT_AGENT)
    source_ids = [item.chunk.source_id for item in result.ranked_chunks]
    assert "doc:refund_policy" in source_ids
