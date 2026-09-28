from __future__ import annotations

import math
from typing import Sequence


class VertexAIEmbeddingProvider:
    """Optional managed embedding adapter. Requires the `vertex` extra."""

    def __init__(self, project_id: str, location: str, model_name: str) -> None:
        if not project_id or not location or not model_name:
            raise ValueError("Vertex AI project, location and model name are required")
        try:
            import vertexai
            from vertexai.language_models import TextEmbeddingModel
        except ImportError as exc:
            raise RuntimeError("Install the project with `pip install -e '.[vertex]'`") from exc
        vertexai.init(project=project_id, location=location)
        self._model = TextEmbeddingModel.from_pretrained(model_name)
        self._model_name = model_name
        self._dimension: int | None = None

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def dimension(self) -> int:
        if self._dimension is None:
            self._dimension = len(self.embed_query("dimension probe"))
        return self._dimension

    @staticmethod
    def _normalize(values: Sequence[float]) -> list[float]:
        vector = [float(v) for v in values]
        norm = math.sqrt(sum(v * v for v in vector))
        if norm == 0.0:
            raise ValueError("Embedding model returned a zero vector")
        return [v / norm for v in vector]

    def embed_documents(self, texts: Sequence[str]) -> list[list[float]]:
        cleaned = [" ".join(text.split()) for text in texts]
        if any(not text for text in cleaned):
            raise ValueError("Embedding input must not be empty")
        embeddings = self._model.get_embeddings(cleaned)
        vectors = [self._normalize(item.values) for item in embeddings]
        if vectors and self._dimension is None:
            self._dimension = len(vectors[0])
        return vectors

    def embed_query(self, text: str) -> list[float]:
        return self.embed_documents([text])[0]
