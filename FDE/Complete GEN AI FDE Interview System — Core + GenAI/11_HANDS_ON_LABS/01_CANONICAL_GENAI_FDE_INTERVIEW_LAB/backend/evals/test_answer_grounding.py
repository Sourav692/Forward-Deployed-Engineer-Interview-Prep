from backend.agents.guardrails import validate_grounding
from backend.rag.retrieval import LocalRetriever
from backend.auth.roles import Role


def test_grounded_answer_requires_citation_marker():
    result = LocalRetriever().search("renewal risk Acme Bank", Role.MANAGER)
    flags = validate_grounding("This is an answer without citation markers.", result.ranked_chunks)
    assert "missing_citation" in flags


def test_grounded_answer_passes_with_citation_marker():
    result = LocalRetriever().search("renewal risk Acme Bank", Role.MANAGER)
    source = result.ranked_chunks[0].chunk.source_id
    flags = validate_grounding(f"Answer grounded in context. [source: {source}]", result.ranked_chunks)
    assert "missing_citation" not in flags
