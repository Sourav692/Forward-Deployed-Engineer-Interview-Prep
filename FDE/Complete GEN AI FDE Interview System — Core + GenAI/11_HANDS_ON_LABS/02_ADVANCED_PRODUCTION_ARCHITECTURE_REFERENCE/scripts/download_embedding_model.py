from backend.app.config import settings


def main() -> None:
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError as exc:
        raise SystemExit("Install semantic dependencies: pip install -e '.[semantic]'") from exc
    SentenceTransformer(
        settings.embedding_model_name,
        cache_folder=settings.embedding_model_cache_dir,
        device=settings.embedding_device,
    )
    print(f"Cached {settings.embedding_model_name} in {settings.embedding_model_cache_dir}")


if __name__ == "__main__":
    main()
