from __future__ import annotations

import math
from pathlib import Path
from typing import Any, Sequence

from backend.embeddings.cache import SQLiteEmbeddingCache


class LocalSentenceTransformerEmbeddingProvider:
    """Real local dense embedding provider backed by Sentence Transformers.

    The third-party dependency is imported lazily so unit tests can use a test
    double without downloading a neural model.
    """

    def __init__(
        self,
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        cache_dir: str | Path = ".cache/models",
        embedding_cache_path: str | Path = ".cache/embeddings/index.sqlite3",
        device: str = "cpu",
        batch_size: int = 32,
        model: Any | None = None,
    ) -> None:
        self._model_name = model_name
        self._batch_size = batch_size
        self._cache = SQLiteEmbeddingCache(embedding_cache_path)
        if model is None:
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError as exc:
                raise RuntimeError(
                    "sentence-transformers is required for semantic embeddings. "
                    "Install the project with `pip install -e '.[semantic]'`."
                ) from exc
            model = SentenceTransformer(
                model_name,
                cache_folder=str(cache_dir),
                device=device,
            )
        self._model = model
        dimension = self._model.get_sentence_embedding_dimension()
        if dimension is None:
            raise RuntimeError(f"Could not determine embedding dimension for {model_name}")
        self._dimension = int(dimension)

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def model_name(self) -> str:
        return self._model_name

    @staticmethod
    def _clean(text: str) -> str:
        if not isinstance(text, str):
            raise TypeError("Embedding input must be a string")
        cleaned = " ".join(text.split())
        if not cleaned:
            raise ValueError("Embedding input must not be empty")
        return cleaned

    @staticmethod
    def _normalize(vector: Sequence[float]) -> list[float]:
        values = [float(v) for v in vector]
        norm = math.sqrt(sum(v * v for v in values))
        if norm == 0.0:
            raise ValueError("Embedding model returned a zero vector")
        return [v / norm for v in values]

    def embed_documents(self, texts: Sequence[str]) -> list[list[float]]:
        cleaned = [self._clean(text) for text in texts]
        if not cleaned:
            return []

        results: list[list[float] | None] = [None] * len(cleaned)
        missing_texts: list[str] = []
        missing_indices: list[int] = []
        missing_keys: list[str] = []

        for index, text in enumerate(cleaned):
            key = self._cache.key(self.model_name, text)
            cached = self._cache.get(key)
            if cached is not None:
                if len(cached) != self.dimension:
                    raise ValueError("Cached embedding dimension does not match provider")
                results[index] = cached
            else:
                missing_texts.append(text)
                missing_indices.append(index)
                missing_keys.append(key)

        if missing_texts:
            encoded = self._model.encode(
                missing_texts,
                batch_size=self._batch_size,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=False,
            )
            for index, key, text, vector in zip(
                missing_indices, missing_keys, missing_texts, encoded, strict=True
            ):
                normalized = self._normalize(vector)
                if len(normalized) != self.dimension:
                    raise ValueError("Embedding dimension mismatch")
                self._cache.put(key, self.model_name, text, normalized)
                results[index] = normalized

        return [value for value in results if value is not None]

    def embed_query(self, text: str) -> list[float]:
        return self.embed_documents([text])[0]
