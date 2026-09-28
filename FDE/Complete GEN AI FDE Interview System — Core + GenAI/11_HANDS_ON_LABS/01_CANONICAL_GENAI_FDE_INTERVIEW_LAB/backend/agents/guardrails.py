from backend.app.services.pii_redaction import contains_unredacted_pii
from backend.rag.reranking import RankedChunk

RESTRICTED_TERMS = {
    "admin-only",
    "restricted security escalation",
    "secret escalation channel",
}


def validate_grounding(answer: str, ranked_chunks: list[RankedChunk]) -> list[str]:
    flags: list[str] = []
    if not ranked_chunks and "could not find approved" not in answer.lower():
        flags.append("ungrounded_answer")
    for term in RESTRICTED_TERMS:
        if term in answer.lower():
            flags.append("restricted_term_in_answer")
    if contains_unredacted_pii(answer):
        flags.append("unredacted_pii_in_answer")
    if ranked_chunks and "[source:" not in answer:
        flags.append("missing_citation")
    return sorted(set(flags))


def safe_failure_response(reason: str) -> str:
    responses = {
        "permission_denied": "I cannot provide that information because it is outside your approved access level.",
        "no_context": "I could not find approved internal context to answer that question safely.",
        "llm_timeout": "The answer generator is temporarily unavailable. Please retry later or use the cited source systems directly.",
        "invalid_prompt": "The requested prompt version is not available, so I cannot safely generate an answer.",
        "pii_detected": "The draft answer contained sensitive data and was blocked. Please retry with less sensitive input.",
    }
    return responses.get(reason, "The request could not be completed safely.")
