import os
from dataclasses import dataclass
from backend.auth.roles import Role
from backend.rag.chunking import Chunk
from backend.rag.embeddings import cosine_similarity, embed_text, tokenize
from backend.rag.ingestion import load_corpus
from backend.rag.permission_filtering import filter_chunks_for_role
from backend.rag.reranking import RankedChunk, rerank


class VectorStoreUnavailable(RuntimeError):
    pass


@dataclass
class RetrievalResult:
    ranked_chunks: list[RankedChunk]
    used_fallback: bool
    retrieval_notes: list[str]


class LocalRetriever:
    """Permission-aware local retrieval abstraction.

    The class intentionally mirrors a production retriever boundary. Replace the
    in-memory scoring with a real vector store while preserving the permission
    filter contract and tests.
    """

    def __init__(self, chunks: list[Chunk] | None = None):
        self.chunks = chunks if chunks is not None else load_corpus()
        self.embeddings = {chunk.chunk_id: embed_text(chunk.text) for chunk in self.chunks}

    def search(self, query: str, role: Role | str, top_k: int = 4) -> RetrievalResult:
        notes: list[str] = []
        permitted_chunks = filter_chunks_for_role(self.chunks, role)
        notes.append(f"permission_filter_retained={len(permitted_chunks)}")
        try:
            ranked = self._vector_search(query, permitted_chunks)
            used_fallback = False
            notes.append("retrieval_mode=lexical_vector")
        except VectorStoreUnavailable:
            ranked = self._keyword_search(query, permitted_chunks)
            used_fallback = True
            notes.append("retrieval_mode=keyword_fallback")
        ranked = rerank(query, ranked, top_k=top_k)
        if not ranked:
            notes.append("no_relevant_documents")
        return RetrievalResult(ranked, used_fallback, notes)

    def _vector_search(self, query: str, chunks: list[Chunk]) -> list[RankedChunk]:
        if os.getenv("SIMULATE_VECTOR_FAILURE", "false").lower() == "true":
            raise VectorStoreUnavailable("simulated vector backend outage")
        query_embedding = embed_text(query)
        ranked: list[RankedChunk] = []
        for chunk in chunks:
            score = cosine_similarity(query_embedding, self.embeddings[chunk.chunk_id])
            if score > 0.01:
                ranked.append(RankedChunk(chunk, round(score, 4), ["token-vector-overlap"]))
        return sorted(ranked, key=lambda item: item.score, reverse=True)

    def _keyword_search(self, query: str, chunks: list[Chunk]) -> list[RankedChunk]:
        query_terms = set(tokenize(query))
        ranked: list[RankedChunk] = []
        for chunk in chunks:
            chunk_terms = set(tokenize(chunk.text + " " + chunk.title))
            overlap = query_terms & chunk_terms
            if overlap:
                score = len(overlap) / max(len(query_terms), 1)
                ranked.append(RankedChunk(chunk, round(score, 4), [f"keyword_overlap={','.join(sorted(overlap))}"]))
        return sorted(ranked, key=lambda item: item.score, reverse=True)
