import re

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.search import SearchResult
from app.services.article_service import create_excerpt
from app.services.embedding_service import embedding_service

SIMILARITY_THRESHOLD = 0.3
SNIPPET_MAX_LENGTH = 200


def _extract_snippet(content: str, query: str) -> str | None:
    """Extract the most relevant snippet from content based on query terms.

    Splits content into sentences and selects the best-matching ones.
    """
    if not content or not query:
        return None

    # Split into sentences
    sentences = re.split(r'(?<=[.!?。！？])\s*', content)
    sentences = [s.strip() for s in sentences if s.strip()]
    if not sentences:
        return None

    query_terms = [t.lower() for t in query.split() if len(t) >= 2]
    if not query_terms:
        return None

    # Score each sentence by how many query terms it contains
    scored = []
    for i, sentence in enumerate(sentences):
        lower = sentence.lower()
        score = sum(1 for term in query_terms if term in lower)
        if score > 0:
            scored.append((score, i, sentence))

    if not scored:
        return None

    # Sort by score desc, then by position asc (prefer earlier sentences)
    scored.sort(key=lambda x: (-x[0], x[1]))

    # Take the top 1-2 sentences within length limit
    parts: list[str] = []
    total_len = 0
    for _, _, sentence in scored[:2]:
        if total_len + len(sentence) > SNIPPET_MAX_LENGTH:
            break
        parts.append(sentence)
        total_len += len(sentence)

    return " ".join(parts) if parts else None


class SearchService:
    """Service for semantic search operations."""

    async def search(
        self,
        session: AsyncSession,
        query: str,
        *,
        category: str | None = None,
        top_k: int = 20,
    ) -> list[SearchResult]:
        """Perform semantic search using pgvector."""
        # Generate query embedding
        query_embedding = embedding_service.encode(query)
        embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

        # Build SQL query with literal embedding value
        # Note: Using f-string for embedding since pgvector needs literal array syntax
        sql = f"""
            SELECT
                id, title, content, author, category, published_at,
                1 - (embedding <=> '{embedding_str}'::vector) as similarity
            FROM articles
            WHERE embedding IS NOT NULL
              AND 1 - (embedding <=> '{embedding_str}'::vector) > :threshold
        """

        # Add category filter if specified
        if category:
            sql += " AND category = :category"

        sql += f"""
            ORDER BY embedding <=> '{embedding_str}'::vector
            LIMIT :top_k
        """

        # Execute query
        params: dict = {
            "threshold": SIMILARITY_THRESHOLD,
            "top_k": top_k,
        }
        if category:
            params["category"] = category

        result = await session.execute(text(sql), params)
        rows = result.fetchall()

        # Convert to SearchResult objects
        results = [
            SearchResult(
                id=row.id,
                title=row.title,
                excerpt=create_excerpt(row.content),
                author=row.author,
                category=row.category,
                published_at=row.published_at,
                similarity=round(row.similarity, 4),
                highlight=_extract_snippet(row.content, query),
            )
            for row in rows
        ]

        return results


search_service = SearchService()
