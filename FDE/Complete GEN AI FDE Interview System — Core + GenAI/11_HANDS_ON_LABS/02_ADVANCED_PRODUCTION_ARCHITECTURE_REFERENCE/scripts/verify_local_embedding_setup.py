from math import sqrt

from backend.app.config import settings
from backend.embeddings.factory import create_embedding_provider
from backend.vector_store.similarity import cosine_similarity


def main() -> None:
    provider = create_embedding_provider(settings)
    documents = provider.embed_documents([
        "The OAuth token expired and billing access failed.",
        "The cafeteria opens at eight in the morning.",
    ])
    query = provider.embed_query("Why can the customer not enter the payment portal?")
    norm = sqrt(sum(value * value for value in query))
    passed = cosine_similarity(query, documents[0]) > cosine_similarity(query, documents[1])
    print(f"Embedding provider: {provider.__class__.__name__}")
    print(f"Model: {provider.model_name}")
    print(f"Dimension: {provider.dimension}")
    print(f"Normalized vectors: {'yes' if abs(norm - 1.0) < 1e-5 else 'no'}")
    print(f"Cache directory: {settings.embedding_model_cache_dir}")
    print(f"Semantic smoke test: {'passed' if passed else 'failed'}")
    if not passed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
