"""
STATUS: OPTIONAL EXTENSION POINT

This module is part of the Advanced Production Architecture Reference.
It is not used by the canonical interview lab and is not presented as a
complete pgvector production implementation.

Candidate exercise:
Implement tenant-aware vector insertion and similarity search, then add
integration tests covering tenant isolation and retrieval quality.
"""
class PgVectorStore:
    """Production target for PostgreSQL + pgvector.

    In production, retrieval SQL must filter by tenant_id and permission scopes before returning chunks to the LLM.
    """
    def search(self, query_embedding, tenant_id: str, permission_scopes: list[str], limit: int = 5):
        raise NotImplementedError("Implement with SQLAlchemy + pgvector extension")
