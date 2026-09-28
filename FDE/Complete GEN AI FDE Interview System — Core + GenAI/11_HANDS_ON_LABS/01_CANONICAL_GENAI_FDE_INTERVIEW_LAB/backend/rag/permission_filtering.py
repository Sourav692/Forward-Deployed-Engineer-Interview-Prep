from backend.auth.permissions import can_access
from backend.auth.roles import Role
from backend.rag.chunking import Chunk


def filter_chunks_for_role(chunks: list[Chunk], role: Role | str) -> list[Chunk]:
    return [chunk for chunk in chunks if can_access(role, chunk.allowed_roles)]
