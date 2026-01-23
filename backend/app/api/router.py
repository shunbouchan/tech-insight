from fastapi import APIRouter

from app.api.v1 import articles, health, search

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(articles.router, prefix="/articles", tags=["articles"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
