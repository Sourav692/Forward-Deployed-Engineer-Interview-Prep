from dataclasses import dataclass


@dataclass(frozen=True)
class EmbeddedChunk:
    chunk_id: str
    document_id: str
    text: str
    vector: list[float]
    metadata: dict[str, str]
    content_hash: str


@dataclass(frozen=True)
class TextChunk:
    id: str
    text: str


@dataclass(frozen=True)
class VectorRecord:
    id: str
    document_id: str
    text: str
    vector: list[float]
    metadata: dict[str, str]
