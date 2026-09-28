"""Index rebuild entry point.

Wire this command to the production connector registry before deployment. The
local lab uses run_incremental_sync(connector, embedding_provider=...) directly.
A full rebuild is required whenever the embedding model or dimension changes.
"""

from backend.app.config import settings


if __name__ == "__main__":
    print(
        "Rebuild required for model "
        f"{settings.embedding_model_name}. Invoke run_incremental_sync for each configured connector."
    )
