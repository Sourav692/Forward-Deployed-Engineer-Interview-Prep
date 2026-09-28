import os
from backend.rag.reranking import RankedChunk


class LLMTimeout(RuntimeError):
    pass


class GroundedAnswerGenerator:
    """Deterministic local answer generator.

    Production extension: call an LLM provider here. Keep the same interface so
    policy checks, citation checks, audit logs, and evaluation tests continue to
    work regardless of model vendor.
    """

    def generate(self, question: str, ranked_chunks: list[RankedChunk], prompt: dict) -> str:
        if os.getenv("SIMULATE_LLM_TIMEOUT", "false").lower() == "true":
            raise LLMTimeout("simulated LLM provider timeout")
        if not ranked_chunks:
            return "I could not find approved internal context to answer that question."

        bullets = []
        for item in ranked_chunks[:3]:
            source = item.chunk
            snippet = source.text[:280].strip()
            bullets.append(f"- {snippet} [source: {source.source_id}]")

        guidance = prompt.get("system", "Answer using only approved context.")
        return (
            f"Using approved context only, here is the answer.\n\n"
            f"Guidance: {guidance}\n\n"
            f"Evidence:\n" + "\n".join(bullets)
        )
