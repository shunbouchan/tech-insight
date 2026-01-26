from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.article import (
    ArticleCreate,
    ArticleResponse,
    ArticleSummary,
    ArticleUpdate,
    CategoryEnum,
)
from app.schemas.pagination import PaginatedResponse
from app.services.article_service import article_service

router = APIRouter()


@router.get("", response_model=PaginatedResponse[ArticleSummary])
async def get_articles(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    category: CategoryEnum | None = Query(None, description="Filter by category"),
    author: str | None = Query(None, description="Filter by author"),
    keyword: str | None = Query(None, description="Search keyword (ILIKE)"),
    sort_order: Literal["asc", "desc"] = Query("desc", description="Sort order for published_at"),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[ArticleSummary]:
    """Get paginated list of articles."""
    items, total = await article_service.get_list(
        db,
        page=page,
        page_size=page_size,
        category=category.value if category else None,
        author=author,
        keyword=keyword,
        sort_order=sort_order,
    )

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=article_service.calculate_total_pages(total, page_size),
    )


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: int,
    db: AsyncSession = Depends(get_db),
) -> ArticleResponse:
    """Get article by ID."""
    article = await article_service.get_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleResponse.model_validate(article)


@router.post("", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    data: ArticleCreate,
    db: AsyncSession = Depends(get_db),
) -> ArticleResponse:
    """Create a new article."""
    article = await article_service.create(db, data)
    return ArticleResponse.model_validate(article)


@router.patch("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: int,
    data: ArticleUpdate,
    db: AsyncSession = Depends(get_db),
) -> ArticleResponse:
    """Update an existing article (partial update)."""
    article = await article_service.get_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    updated_article = await article_service.update(db, article, data)
    return ArticleResponse.model_validate(updated_article)


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: int,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete an article."""
    article = await article_service.get_by_id(db, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    await article_service.delete(db, article)
