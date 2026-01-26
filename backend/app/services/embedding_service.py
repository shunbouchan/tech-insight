import logging
from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIM = 384


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    """Load and cache the embedding model."""
    logger.info(f"Loading embedding model: {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)
    logger.info("Embedding model loaded successfully")
    return model


class EmbeddingService:
    """Service for generating text embeddings using local sentence-transformers model."""

    def __init__(self):
        self._model: SentenceTransformer | None = None

    @property
    def model(self) -> SentenceTransformer:
        if self._model is None:
            self._model = get_model()
        return self._model

    def encode(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        embedding = self.model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

    def encode_article(self, title: str, content: str) -> list[float]:
        """Generate embedding for an article using title and content."""
        text = f"{title} [SEP] {content}"
        return self.encode(text)

    def encode_batch(self, texts: list[str], batch_size: int = 32) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        embeddings = self.model.encode(
            texts,
            normalize_embeddings=True,
            batch_size=batch_size,
            show_progress_bar=True,
        )
        return embeddings.tolist()

    def encode_articles_batch(
        self, articles: list[tuple[str, str]], batch_size: int = 32
    ) -> list[list[float]]:
        """Generate embeddings for multiple articles (title, content pairs)."""
        texts = [f"{title} [SEP] {content}" for title, content in articles]
        return self.encode_batch(texts, batch_size)


def _create_embedding_service() -> EmbeddingService:
    """Create embedding service based on EMBEDDING_PROVIDER setting."""
    provider = settings.embedding_provider
    if provider == "local":
        logger.info("Using local embedding provider (sentence-transformers)")
        return EmbeddingService()
    else:
        raise ValueError(
            f"Unsupported embedding provider: '{provider}'. "
            f"Currently supported: 'local'"
        )


# Singleton instance
embedding_service = _create_embedding_service()
