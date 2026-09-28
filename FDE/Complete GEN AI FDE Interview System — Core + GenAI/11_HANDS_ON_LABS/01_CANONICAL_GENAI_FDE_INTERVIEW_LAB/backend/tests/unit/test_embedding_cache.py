from backend.rag.embeddings.lexical_vectors import LexicalVectorEmbeddingProvider


def test_lexical_provider_is_deterministic_and_normalized():
    provider = LexicalVectorEmbeddingProvider(dimension=32)
    first = provider.embed_query("refund duplicate payment")
    second = provider.embed_query("refund duplicate payment")
    assert first == second
    assert abs(sum(value * value for value in first) - 1.0) < 1e-6
