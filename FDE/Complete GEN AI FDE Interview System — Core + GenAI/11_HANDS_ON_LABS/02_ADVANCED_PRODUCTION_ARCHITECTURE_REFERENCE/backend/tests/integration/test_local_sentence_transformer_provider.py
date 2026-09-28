import pytest

pytest.importorskip("sentence_transformers")

from backend.embeddings.local_sentence_transformer import LocalSentenceTransformerEmbeddingProvider
from backend.vector_store.similarity import cosine_similarity


@pytest.mark.integration
def test_semantically_related_text_ranks_higher(tmp_path):
    provider = LocalSentenceTransformerEmbeddingProvider(
        cache_dir=tmp_path / "models",
        embedding_cache_path=tmp_path / "cache.sqlite3",
    )
    documents = [
        "The customer cannot access the billing portal because the OAuth token expired.",
        "The office cafeteria opens at eight in the morning.",
    ]
    vectors = provider.embed_documents(documents)
    query = provider.embed_query("Why is the user unable to log in to the payment page?")
    assert cosine_similarity(query, vectors[0]) > cosine_similarity(query, vectors[1])
