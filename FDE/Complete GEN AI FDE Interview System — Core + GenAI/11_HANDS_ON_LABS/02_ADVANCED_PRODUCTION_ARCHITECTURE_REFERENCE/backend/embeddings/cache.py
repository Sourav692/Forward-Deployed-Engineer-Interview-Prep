from __future__ import annotations

import hashlib
import json
import sqlite3
from pathlib import Path
from typing import Sequence


class SQLiteEmbeddingCache:
    """Persistent cache keyed by model, preprocessing version and text content."""

    def __init__(self, path: str | Path = ".cache/embeddings/index.sqlite3") -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS embedding_cache (
                    cache_key TEXT PRIMARY KEY,
                    model_name TEXT NOT NULL,
                    text_hash TEXT NOT NULL,
                    dimension INTEGER NOT NULL,
                    vector_json TEXT NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.path)

    @staticmethod
    def key(model_name: str, text: str, preprocessing_version: str = "v1") -> str:
        normalized = " ".join(text.split())
        payload = f"{model_name}\0{preprocessing_version}\0{normalized}".encode("utf-8")
        return hashlib.sha256(payload).hexdigest()

    def get(self, key: str) -> list[float] | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT vector_json FROM embedding_cache WHERE cache_key = ?", (key,)
            ).fetchone()
        return None if row is None else [float(v) for v in json.loads(row[0])]

    def put(self, key: str, model_name: str, text: str, vector: Sequence[float]) -> None:
        values = [float(v) for v in vector]
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO embedding_cache
                (cache_key, model_name, text_hash, dimension, vector_json)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    key,
                    model_name,
                    hashlib.sha256(text.encode("utf-8")).hexdigest(),
                    len(values),
                    json.dumps(values, separators=(",", ":")),
                ),
            )
