from dataclasses import dataclass
from backend.rag.chunking import Chunk


@dataclass(frozen=True)
class RankedChunk:
    chunk: Chunk
    score: float
    reasons: list[str]


def rerank(query: str, ranked_chunks: list[RankedChunk], top_k: int = 4) -> list[RankedChunk]:
    """Small deterministic reranker.

    Production extension: use a cross-encoder reranker or LLM-based relevance
    classifier, but keep a fast deterministic fallback for degraded mode.
    """

    lowered_query = query.lower()
    boosted: list[RankedChunk] = []
    for item in ranked_chunks:
        score = item.score
        reasons = list(item.reasons)
        if "policy" in lowered_query and "policy" in item.chunk.title.lower():
            score += 0.08
            reasons.append("policy-title-boost")
        if "renewal" in lowered_query and "renewal" in item.chunk.text.lower():
            score += 0.08
            reasons.append("renewal-term-boost")
        if "support" in lowered_query and "support" in item.chunk.title.lower():
            score += 0.06
            reasons.append("support-title-boost")
        boosted.append(RankedChunk(item.chunk, round(score, 4), reasons))
    return sorted(boosted, key=lambda item: item.score, reverse=True)[:top_k]
