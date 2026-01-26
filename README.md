# TechInsight

AI搭載型ナレッジベース「TechInsight」

技術記事のためのセマンティック検索システム。ベクトル埋め込みを使用したCRUD操作と意味的類似度検索を提供します。

## 機能

- **セマンティック検索**: 自然言語クエリで関連記事を検索（ベクトル類似度検索）
- **記事管理**: CRUD操作（作成・読取・更新・削除）
- **カテゴリフィルタ**: AI/ML、Backend、Frontend、DevOpsでフィルタリング
- **キーワード検索**: タイトル・本文の部分一致検索

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| Backend | Python 3.11 / FastAPI / SQLAlchemy 2.0 |
| Database | PostgreSQL 16 + pgvector |
| Frontend | Next.js 14 (App Router) / TypeScript / Tailwind CSS |
| Embedding | sentence-transformers (all-MiniLM-L6-v2, 384次元) |
| Container | Docker Compose |

## クイックスタート

### 前提条件

- Docker Desktop（Docker Compose v2含む）
- Git

### セットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/shunbouchan/tech-insight.git
cd tech-insight
```

2. 環境変数ファイルを作成
```bash
cp .env.example .env
```

3. Docker Composeで起動
```bash
docker compose up --build
```

初回起動時は以下が自動実行されます:
- DBマイグレーション（Alembic）
- 1,000件の初期データ投入 + Embedding生成
- 各サービスの起動

### サービスURL

| サービス | URL |
|----------|-----|
| フロントエンド | http://localhost:3000 |
| バックエンドAPI | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

## 開発

### バックエンド (Python/FastAPI)

```bash
cd backend

# 依存関係インストール
poetry install

# 開発サーバー起動
poetry run uvicorn app.main:app --reload

# リント
poetry run ruff check .

# テスト
poetry run pytest
```

### フロントエンド (Next.js)

```bash
cd frontend

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# リント
npm run lint

# フォーマット
npm run format

# ビルド
npm run build
```

### Docker操作

```bash
# 全サービス起動
docker compose up --build

# バックグラウンド起動
docker compose up -d

# 停止
docker compose down

# ボリューム含めて完全削除（DBデータもリセット）
docker compose down -v
```

## 開発ルール

チーム開発における基本ルールです。詳細は [コントリビューションガイド](docs/CONTRIBUTING.md) を参照してください。

- **ブランチ**: `feature/`, `fix/`, `refactor/`, `docs/`, `chore/` プレフィックスを使用
- **コミット**: [Conventional Commits](https://www.conventionalcommits.org/) に準拠（日本語）
- **PR**: テンプレートに沿って記入、CIパス必須、500行以内を目安に
- **コードスタイル**: バックエンドは Ruff、フロントエンドは ESLint + Prettier
- **テスト**: PRマージ前に既存テストが全て通ることを確認

## API

### エンドポイント一覧

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/v1/health` | ヘルスチェック |
| GET | `/api/v1/articles` | 記事一覧（ページネーション付き） |
| GET | `/api/v1/articles/{id}` | 記事詳細 |
| POST | `/api/v1/articles` | 記事作成 |
| PATCH | `/api/v1/articles/{id}` | 記事更新 |
| DELETE | `/api/v1/articles/{id}` | 記事削除 |
| GET | `/api/v1/search?q=...` | セマンティック検索 |

### 使用例

```bash
# セマンティック検索
curl "http://localhost:8000/api/v1/search?q=machine%20learning%20optimization"

# 記事一覧（カテゴリフィルタ）
curl "http://localhost:8000/api/v1/articles?category=AI/ML&page_size=10"

# 記事作成
curl -X POST "http://localhost:8000/api/v1/articles" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Article",
    "content": "Article content...",
    "author": "Author Name",
    "category": "Backend",
    "published_at": "2025-01-22T00:00:00Z"
  }'
```

詳細は [docs/api.md](docs/api.md) を参照。

## プロジェクト構成

```
tech-insight/
├── backend/                 # FastAPI バックエンド
│   ├── app/
│   │   ├── api/v1/         # APIエンドポイント
│   │   ├── models/         # SQLAlchemyモデル
│   │   ├── schemas/        # Pydanticスキーマ
│   │   ├── services/       # ビジネスロジック
│   │   └── db/             # DB設定
│   ├── migrations/         # Alembicマイグレーション
│   └── scripts/            # シードスクリプト
│
├── frontend/               # Next.js フロントエンド
│   └── src/
│       ├── app/            # App Routerページ
│       ├── components/     # Reactコンポーネント
│       ├── hooks/          # カスタムフック
│       ├── lib/            # ユーティリティ
│       └── types/          # TypeScript型定義
│
├── data/                   # 初期データ
│   └── articles.csv
│
└── docs/                   # ドキュメント
    ├── api.md              # API設計書
    ├── db.md               # DB設計書
    └── implementation-plan.md
```

## ドキュメント

- [API設計書](docs/api.md) - APIエンドポイント詳細
- [DB設計書](docs/db.md) - データベーススキーマ
- [アーキテクチャ設計書](docs/ARCHITECTURE.md) - システム全体像と設計判断の記録
- [コントリビューションガイド](docs/CONTRIBUTING.md) - 開発ルールと手順
- [実装の説明・工夫点](docs/implementation-insights.md) - 設計判断と工夫点の解説

## ライセンス

MIT
