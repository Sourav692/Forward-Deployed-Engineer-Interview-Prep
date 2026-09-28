"""SQLAlchemy model sketch for production database migrations.

In the local in-memory demo, backend/db/repositories.py is used so tests run without a database.
"""
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, String, Text, JSON, Float, DateTime
from sqlalchemy.sql import func

class Base(DeclarativeBase):
    pass

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True)
    tenant_id = Column(String, index=True, nullable=False)
    source_system = Column(String, nullable=False)
    source_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    permission_scopes = Column(JSON, nullable=False)
    content_hash = Column(String, nullable=False)
    deleted_at = Column(DateTime)

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    id = Column(String, primary_key=True)
    document_id = Column(String, nullable=False)
    tenant_id = Column(String, index=True, nullable=False)
    chunk_text = Column(Text, nullable=False)
    permission_scopes = Column(JSON, nullable=False)
    embedding_json = Column(JSON, nullable=False)

class ReviewRequest(Base):
    __tablename__ = "review_requests"
    id = Column(String, primary_key=True)
    tenant_id = Column(String, index=True, nullable=False)
    action_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    ai_recommendation = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
