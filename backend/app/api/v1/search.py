from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.article import CategoryEnum
from app.schemas.search import SearchResponse
from app.services.search_service import search_service

router = APIRouter()


@router.get("/hybrid", response_model=SearchResponse)
async def hybrid_search(
    q: str = Query(..., min_length=1, description="Search query"),
    category: CategoryEnum | None = Query(None, description="Filter by category"),
    top_k: int = Query(20, ge=1, le=100, description="Max results to return"),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    """Perform hybrid search: keyword filtering + vector re-ranking."""
    results = await search_service.hybrid_search(
        db,
        q,
        category=category.value if category else None,
        top_k=top_k,
    )

    return SearchResponse(
        query=q,
        results=results,
        total=len(results),
    )


@router.get("", response_model=SearchResponse)
async def semantic_search(
    q: str = Query(..., min_length=1, description="Search query"),
    category: CategoryEnum | None = Query(None, description="Filter by category"),
    top_k: int = Query(20, ge=1, le=100, description="Max results to return"),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    """Perform semantic search using vector similarity."""
    results = await search_service.search(
        db,
        q,
        category=category.value if category else None,
        top_k=top_k,
    )

    return SearchResponse(
        query=q,
        results=results,
        total=len(results),
    )
