from __future__ import annotations

from pathlib import Path
from typing import Sequence

import numpy as np
from sentence_transformers import SentenceTransformer


class LocalSentenceTransformerEmbeddingProvider:
    def __init__(
        self,
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        cache_dir: str | Path = ".cache/models",
        device: str = "cpu",
        batch_size: int = 32,
    ) -> None:
        self._model_name = model_name
        self._cache_dir = str(cache_dir)
        self._device = device
        self._batch_size = batch_size

        self._model = SentenceTransformer(
            model_name,
            cache_folder=self._cache_dir,
            device=device,
        )

        dimension = self._model.get_sentence_embedding_dimension()
        if dimension is None:
            raise RuntimeError(
                f"Could not determine embedding dimension for {model_name}"
            )

        self._dimension = dimension

    @property
    def dimension(self) -> int:
        return self._dimension

    def embed_documents(
        self,
        texts: Sequence[str],
    ) -> list[list[float]]:
        cleaned_texts = self._validate_texts(texts)

        embeddings = self._model.encode(
            cleaned_texts,
            batch_size=self._batch_size,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

        return self._to_lists(embeddings)

    def embed_query(self, text: str) -> list[float]:
        cleaned_text = self._validate_text(text)

        embedding = self._model.encode(
            cleaned_text,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )

        return np.asarray(embedding, dtype=np.float32).tolist()

    @staticmethod
    def _validate_text(text: str) -> str:
        if not isinstance(text, str):
            raise TypeError("Embedding input must be a string.")

        cleaned = text.strip()

        if not cleaned:
            raise ValueError("Embedding input must not be empty.")

        return cleaned

    @classmethod
    def _validate_texts(
        cls,
        texts: Sequence[str],
    ) -> list[str]:
        if not texts:
            return []

        return [cls._validate_text(text) for text in texts]

    @staticmethod
    def _to_lists(
        embeddings: np.ndarray,
    ) -> list[list[float]]:
        array = np.asarray(embeddings, dtype=np.float32)

        if array.ndim != 2:
            raise ValueError(
                f"Expected a 2D embedding matrix, got shape {array.shape}"
            )

        return array.tolist()