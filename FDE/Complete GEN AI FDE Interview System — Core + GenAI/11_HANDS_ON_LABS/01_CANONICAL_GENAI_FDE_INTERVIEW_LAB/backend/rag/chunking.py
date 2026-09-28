from dataclasses import dataclass


@dataclass(frozen=True)
class Chunk:
    chunk_id: str
    source_id: str
    title: str
    text: str
    allowed_roles: list[str]
    metadata: dict[str, str]


def chunk_text(
    *,
    source_id: str,
    title: str,
    text: str,
    allowed_roles: list[str],
    metadata: dict[str, str] | None = None,
    max_words: int = 90,
) -> list[Chunk]:
    """Simple word-window chunking.

    Production extension: replace with semantic chunking, header-aware Markdown
    splitting, HTML/PDF extraction, duplicate detection, and customer-specific
    partitioning.
    """

    metadata = metadata or {}
    words = text.split()
    chunks: list[Chunk] = []
    for index in range(0, len(words), max_words):
        window = words[index : index + max_words]
        chunk_number = len(chunks) + 1
        chunks.append(
            Chunk(
                chunk_id=f"{source_id}::chunk-{chunk_number}",
                source_id=source_id,
                title=title,
                text=" ".join(window),
                allowed_roles=allowed_roles,
                metadata=metadata | {"chunk_number": str(chunk_number)},
            )
        )
    return chunks
