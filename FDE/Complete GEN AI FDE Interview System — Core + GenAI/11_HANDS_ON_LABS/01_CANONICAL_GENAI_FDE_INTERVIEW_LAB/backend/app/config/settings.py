from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings.

    In production, replace .env usage with a managed secret store such as Google
    Secret Manager, AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault.
    """

    app_env: str = Field(default="local", alias="APP_ENV")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    simulate_vector_failure: bool = Field(default=False, alias="SIMULATE_VECTOR_FAILURE")
    simulate_llm_timeout: bool = Field(default=False, alias="SIMULATE_LLM_TIMEOUT")
    default_prompt_version: str = Field(default="v1", alias="DEFAULT_PROMPT_VERSION")
    audit_log_path: str = Field(default="./audit.log", alias="AUDIT_LOG_PATH")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
