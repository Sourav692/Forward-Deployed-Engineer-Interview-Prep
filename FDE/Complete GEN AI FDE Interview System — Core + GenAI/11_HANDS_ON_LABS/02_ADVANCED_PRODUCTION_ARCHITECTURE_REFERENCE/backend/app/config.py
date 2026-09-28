from pydantic import ConfigDict
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_env: str = "local"
    database_url: str = "sqlite:///./local.db"
    default_llm_provider: str = "mock"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    eval_min_rag_score: float = 0.85
    eval_max_permission_leaks: int = 0
    embedding_provider: str = "local"
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_model_cache_dir: str = ".cache/models"
    embedding_result_cache_path: str = ".cache/embeddings/index.sqlite3"
    embedding_device: str = "cpu"
    embedding_batch_size: int = 32
    vertex_ai_project_id: str = ""
    vertex_ai_location: str = "us-central1"
    vertex_ai_embedding_model: str = "text-embedding-005"

    model_config = ConfigDict(env_file=".env")

settings = Settings()
