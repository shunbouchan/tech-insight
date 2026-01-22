from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # データベース接続情報を個別に定義（環境変数で上書き可能）
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_host: str = "db"
    postgres_port: int = 5432
    postgres_db: str = "techinsight"

    # CORS設定
    cors_origins: str = "http://localhost:3001"

    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
