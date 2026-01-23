from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class CategoryEnum(str, Enum):
    AI_ML = "AI/ML"
    BACKEND = "Backend"
    FRONTEND = "Frontend"
    DEVOPS = "DevOps"


class ArticleBase(BaseModel):
    title: str = Field(..., max_length=500)
    content: str
    author: str = Field(..., max_length=100)
    category: CategoryEnum
    published_at: datetime


class ArticleCreate(ArticleBase):
    """Schema for creating an article."""

    pass


class ArticleUpdate(BaseModel):
    """Schema for updating an article (partial update)."""

    title: str | None = Field(None, max_length=500)
    content: str | None = None
    author: str | None = Field(None, max_length=100)
    category: CategoryEnum | None = None
    published_at: datetime | None = None


class ArticleResponse(ArticleBase):
    """Schema for article detail response (includes full content)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class ArticleSummary(BaseModel):
    """Schema for article list item (excerpt instead of full content)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    excerpt: str
    author: str
    category: CategoryEnum
    published_at: datetime
    created_at: datetime
    updated_at: datetime
