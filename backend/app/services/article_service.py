import math

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article import Article
from app.schemas.article import ArticleCreate, ArticleSummary, ArticleUpdate
from app.services.embedding_service import embedding_service
from app.services.text_utils import create_excerpt, extract_snippet


class ArticleService:
    """Service for article CRUD operations."""

    async def get_list(
        self,
        session: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 20,
        category: str | None = None,
        author: str | None = None,
        keyword: str | None = None,
        sort_order: str = "desc",
    ) -> tuple[list[ArticleSummary], int]:
        """Get paginated list of articles."""
        # Build query
        query = select(Article)

        # Apply filters
        if category:
            query = query.where(Article.category == category)
        if author:
            query = query.where(Article.author == author)
        if keyword:
            pattern = f"%{keyword}%"
            query = query.where(
                or_(Article.title.ilike(pattern), Article.content.ilike(pattern))
            )

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await session.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination and ordering
        order = Article.published_at.desc() if sort_order == "desc" else Article.published_at.asc()
        query = query.order_by(order)
        query = query.offset((page - 1) * page_size).limit(page_size)

        # Execute query
        result = await session.execute(query)
        articles = result.scalars().all()

        # Convert to summaries
        summaries = [
            ArticleSummary(
                id=article.id,
                title=article.title,
                excerpt=create_excerpt(article.content),
                author=article.author,
                category=article.category,
                published_at=article.published_at,
                created_at=article.created_at,
                updated_at=article.updated_at,
                highlight=extract_snippet(article.content, keyword) if keyword else None,
            )
            for article in articles
        ]

        return summaries, total

    async def get_by_id(self, session: AsyncSession, article_id: int) -> Article | None:
        """Get article by ID."""
        result = await session.execute(select(Article).where(Article.id == article_id))
        return result.scalar_one_or_none()

    async def create(self, session: AsyncSession, data: ArticleCreate) -> Article:
        """Create a new article with auto-generated embedding."""
        # Generate embedding
        embedding = embedding_service.encode_article(data.title, data.content)

        # Create article
        article = Article(
            title=data.title,
            content=data.content,
            author=data.author,
            category=data.category,
            published_at=data.published_at,
            embedding=embedding,
        )

        session.add(article)
        await session.commit()
        await session.refresh(article)

        return article

    async def update(
        self, session: AsyncSession, article: Article, data: ArticleUpdate
    ) -> Article:
        """Update an existing article."""
        update_data = data.model_dump(exclude_unset=True)

        # Check if title or content changed (need to regenerate embedding)
        need_embedding_update = "title" in update_data or "content" in update_data

        # Apply updates
        for field, value in update_data.items():
            setattr(article, field, value)

        # Regenerate embedding if needed
        if need_embedding_update:
            article.embedding = embedding_service.encode_article(
                article.title, article.content
            )

        await session.commit()
        await session.refresh(article)

        return article

    async def delete(self, session: AsyncSession, article: Article) -> None:
        """Delete an article."""
        await session.delete(article)
        await session.commit()

    def calculate_total_pages(self, total: int, page_size: int) -> int:
        """Calculate total number of pages."""
        return math.ceil(total / page_size) if total > 0 else 0


article_service = ArticleService()
