def chunk_text(text: str, max_chars: int = 500) -> list[str]:
    words, chunks, current = text.split(), [], []
    for word in words:
        if sum(len(w) + 1 for w in current) + len(word) > max_chars and current:
            chunks.append(" ".join(current)); current = []
        current.append(word)
    if current:
        chunks.append(" ".join(current))
    return chunks
