import hashlib
import math


class DeterministicFakeEmbeddingProvider:
    def __init__(self, dimension: int = 8) -> None:
        self._dimension = dimension

    @property
    def dimension(self) -> int:
        return self._dimension

    def embed_documents(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        return [self._embed(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed(text)

    def _embed(self, text: str) -> list[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()

        values = [
            float(digest[index]) - 127.5
            for index in range(self._dimension)
        ]

        norm = math.sqrt(sum(value * value for value in values))

        if norm == 0:
            return [0.0] * self._dimension

        return [value / norm for value in values]