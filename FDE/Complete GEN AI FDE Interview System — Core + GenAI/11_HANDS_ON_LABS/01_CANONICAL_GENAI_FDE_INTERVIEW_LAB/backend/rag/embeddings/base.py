from typing import Protocol, Sequence


class EmbeddingProvider(Protocol):
    @property
    def dimension(self) -> int:
        """Return the vector dimension produced by this provider."""
        ...

    def embed_documents(
        self,
        texts: Sequence[str],
    ) -> list[list[float]]:
        """Embed multiple document chunks."""
        ...

    def embed_query(
        self,
        text: str,
    ) -> list[float]:
        """Embed one retrieval query."""
        ...