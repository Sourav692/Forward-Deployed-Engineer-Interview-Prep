from backend.embeddings.cache import SQLiteEmbeddingCache


def test_sqlite_cache_round_trip(tmp_path):
    cache = SQLiteEmbeddingCache(tmp_path / "embeddings.sqlite3")
    key = cache.key("model-a", "same text")
    assert cache.get(key) is None
    cache.put(key, "model-a", "same text", [0.6, 0.8])
    assert cache.get(key) == [0.6, 0.8]
    assert key != cache.key("model-b", "same text")
