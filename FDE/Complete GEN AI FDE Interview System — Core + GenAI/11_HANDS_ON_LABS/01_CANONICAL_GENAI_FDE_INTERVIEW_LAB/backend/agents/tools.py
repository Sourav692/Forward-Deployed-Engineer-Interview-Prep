from backend.app.services.pii_redaction import redact_pii
from backend.rag.retrieval import LocalRetriever, RetrievalResult
from backend.auth.roles import Role


class AgentTools:
    def __init__(self, retriever: LocalRetriever | None = None):
        self.retriever = retriever or LocalRetriever()

    def retrieve(self, question: str, role: Role | str, top_k: int = 4) -> RetrievalResult:
        return self.retriever.search(question, role, top_k=top_k)

    def redact(self, text: str) -> tuple[str, list[str]]:
        return redact_pii(text)
