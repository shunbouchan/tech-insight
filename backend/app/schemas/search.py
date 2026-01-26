from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.article import CategoryEnum


class SearchResult(BaseModel):
    """Schema for a single search result."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    excerpt: str
    author: str
    category: CategoryEnum
    published_at: datetime
    similarity: float
    highlight: str | None = None


class SearchResponse(BaseModel):
    """Schema for search response."""

    query: str
    results: list[SearchResult]
    total: int
