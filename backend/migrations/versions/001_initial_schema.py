"""Initial schema with articles table and pgvector

Revision ID: 001
Revises:
Create Date: 2025-01-22

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Create articles table
    op.create_table(
        "articles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("author", sa.String(100), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("embedding", Vector(384), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.CheckConstraint(
            "category IN ('AI/ML', 'Backend', 'Frontend', 'DevOps')",
            name="valid_category",
        ),
    )

    # Create indexes
    op.create_index("idx_articles_category", "articles", ["category"])
    op.create_index("idx_articles_author", "articles", ["author"])
    op.create_index(
        "idx_articles_published_at", "articles", [sa.text("published_at DESC")]
    )

    # Create HNSW index for vector search
    op.execute("""
        CREATE INDEX idx_articles_embedding ON articles
        USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64)
    """)

    # Create updated_at trigger function
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
    """)

    # Create trigger
    op.execute("""
        CREATE TRIGGER trigger_articles_updated_at
            BEFORE UPDATE ON articles
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at()
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trigger_articles_updated_at ON articles")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at()")
    op.drop_index("idx_articles_embedding", table_name="articles")
    op.drop_index("idx_articles_published_at", table_name="articles")
    op.drop_index("idx_articles_author", table_name="articles")
    op.drop_index("idx_articles_category", table_name="articles")
    op.drop_table("articles")
    op.execute("DROP EXTENSION IF EXISTS vector")
