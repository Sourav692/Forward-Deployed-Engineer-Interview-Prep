from backend.rag.embeddings.lexical_vectors import LexicalVectorEmbeddingProvider
from backend.rag.ingestion_service import IngestionService
from backend.rag.models import TextChunk
from backend.rag.vector_stores.vectors import InMemoryVectorStore


class FixedChunker:
    def split(self, text: str) -> list[TextChunk]:
        return [TextChunk("doc::1", text)] if text.strip() else []


def test_ingestion_embeds_and_stores_chunks():
    store = InMemoryVectorStore(dimension=16)
    service = IngestionService(FixedChunker(), LexicalVectorEmbeddingProvider(16), store)
    assert service.ingest_document("doc", "refund policy", {"tenant": "demo"}) == 1
    assert len(store) == 1
    assert store.get("doc::1").metadata == {"tenant": "demo", "chunk_index": "0"}
