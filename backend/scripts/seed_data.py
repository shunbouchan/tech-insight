#!/usr/bin/env python
"""Seed database with articles from CSV file."""
import asyncio
import csv
import logging
import sys
from datetime import datetime
from pathlib import Path

from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings  # noqa: E402
from app.models.article import Article  # noqa: E402
from app.services.embedding_service import embedding_service  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

CSV_PATH = Path("/app/data/articles.csv")
BATCH_SIZE = 100


async def get_existing_ids(session: AsyncSession) -> set[int]:
    """Get set of existing article IDs."""
    result = await session.execute(select(Article.id))
    return {row[0] for row in result.fetchall()}


async def seed_articles(session: AsyncSession) -> int:
    """Import articles from CSV and generate embeddings."""
    if not CSV_PATH.exists():
        logger.error(f"CSV file not found: {CSV_PATH}")
        return 0

    # Get existing IDs to avoid duplicates
    existing_ids = await get_existing_ids(session)
    logger.info(f"Found {len(existing_ids)} existing articles in database")

    # Read CSV
    articles_to_insert = []
    with open(CSV_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            article_id = int(row["id"])
            if article_id in existing_ids:
                continue
            articles_to_insert.append(row)

    if not articles_to_insert:
        logger.info("No new articles to insert")
        return 0

    logger.info(f"Found {len(articles_to_insert)} new articles to insert")

    # Generate embeddings in batches
    logger.info("Generating embeddings...")
    article_texts = [(row["title"], row["content"]) for row in articles_to_insert]
    embeddings = embedding_service.encode_articles_batch(article_texts, batch_size=BATCH_SIZE)

    # Insert articles with embeddings
    inserted_count = 0
    for i in range(0, len(articles_to_insert), BATCH_SIZE):
        batch = articles_to_insert[i : i + BATCH_SIZE]
        batch_embeddings = embeddings[i : i + BATCH_SIZE]

        values = []
        for row, embedding in zip(batch, batch_embeddings):
            values.append(
                {
                    "id": int(row["id"]),
                    "title": row["title"],
                    "content": row["content"],
                    "author": row["author"],
                    "category": row["category"],
                    "published_at": datetime.fromisoformat(row["published_at"]),
                    "embedding": embedding,
                }
            )

        # Use INSERT ... ON CONFLICT DO NOTHING for idempotency
        stmt = insert(Article).values(values).on_conflict_do_nothing(index_elements=["id"])
        await session.execute(stmt)
        await session.commit()
        inserted_count += len(batch)
        logger.info(f"Inserted {inserted_count}/{len(articles_to_insert)} articles")

    return len(articles_to_insert)


async def main():
    """Main entry point."""
    logger.info("Starting seed script...")
    logger.info(f"Database URL: {settings.database_url.replace(settings.postgres_password, '***')}")

    engine = create_async_engine(settings.database_url, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Verify database connection
        await session.execute(text("SELECT 1"))
        logger.info("Database connection successful")

        # Seed articles
        count = await seed_articles(session)
        logger.info(f"Seeding complete. Inserted {count} articles.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
