from backend.rag.retriever import retrieve
from backend.llm.fallback_router import FallbackRouter
from backend.llm.local_mock_provider import LocalMockProvider


def answer_question(question: str, ctx) -> dict:
    chunks = retrieve(question, ctx)
    context = "\n".join(c["chunk_text"] for c in chunks)
    response = FallbackRouter([LocalMockProvider()]).complete([
        {"role": "system", "content": "Answer only from retrieved context."},
        {"role": "user", "content": f"Context:\n{context}\nQuestion: {question}"},
    ])
    return {
        "text": response.text,
        "citations": [{"chunk_id": c["id"], "document_id": c["document_id"]} for c in chunks],
        "confidence": 0.82 if chunks else 0.35,
        "provider": response.provider,
    }
