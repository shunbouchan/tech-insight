# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

TechInsightは、技術記事のためのAI搭載ナレッジベースです。ベクトル埋め込みを使用したCRUD操作とセマンティック検索を提供します。バックエンドにFastAPI（Python）、フロントエンドにNext.js 14、ベクトル類似検索にPostgreSQL + pgvectorを使用しています。

**現在のステータス**: ドキュメント・設計完了済み。実装は`docs/`の仕様書に従って進めます。

## 開発コマンド

### Docker（主要な開発環境）
```bash
docker compose up --build    # 全サービス起動
docker compose down -v       # ボリューム含めて完全停止
```

### バックエンド (Python/FastAPI)
```bash
poetry install                              # 依存関係インストール
poetry run pytest                           # テスト実行
poetry run ruff check                       # リント
poetry run uvicorn app.main:app --reload    # 開発サーバー起動
alembic upgrade head                        # マイグレーション実行
python scripts/seed_data.py                 # 1,000件の初期データ投入
```

### フロントエンド (Next.js)
```bash
npm install       # 依存関係インストール
npm run dev       # 開発サーバー (localhost:3000)
npm run build     # 本番ビルド
npm run lint      # ESLint
npm run format    # Prettier
```

### サービスURL（起動時）
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000
- APIドキュメント (Swagger): http://localhost:8000/docs
- データベース: localhost:5432

## アーキテクチャ

### 技術スタック
| レイヤー | 技術 |
|---------|------|
| バックエンド | Python 3.11 / FastAPI / SQLAlchemy 2.0 |
| データベース | PostgreSQL 16 + pgvector |
| フロントエンド | Next.js 14 (App Router) / Tailwind CSS |
| 埋め込み | sentence-transformers (all-MiniLM-L6-v2, 384次元) |

### データフロー
```
ユーザークエリ → Next.js フロントエンド
    ↓
FastAPI バックエンド → 埋め込みサービス (テキスト → 384次元ベクトル)
    ↓
pgvector HNSWインデックス → コサイン類似度検索
    ↓
類似度スコア付きJSONレスポンス
```

### 主要ディレクトリ（計画構造）
- `backend/app/api/v1/` - APIエンドポイント（articles, search, health）
- `backend/app/services/` - ビジネスロジック（embedding_service.pyが重要）
- `backend/app/models/` - SQLAlchemyモデル
- `frontend/src/app/` - Next.jsページ（App Router）
- `frontend/src/components/` - Reactコンポーネント
- `data/articles.csv` - 1,000件の初期記事データ

## セマンティック検索の実装

コア機能はpgvectorによる類似検索を使用:
- 埋め込みモデル: `all-MiniLM-L6-v2`（384次元、推論約14ms）
- インデックス: HNSW（m=16, ef_construction=64）
- 類似度閾値: 最低0.3
- 埋め込みはコサイン類似度のためL2正規化

記事の作成・更新時、タイトルまたは本文が変更された場合は埋め込みを再生成する必要があります。

## データベーススキーマ

`articles`テーブル1つ:
- 標準フィールド: id, title, content, author, category, published_at
- ベクトルフィールド: `embedding vector(384)`（HNSWインデックス付き）
- カテゴリ: AI/ML, Backend, Frontend, DevOps

詳細なDDLとインデックス設計は`docs/db.md`を参照。

## API設計

`/api/v1`でのRESTful API:
- `GET /articles` - 一覧取得（excerpt返却、keyword/category/authorでフィルタ可能）
- `GET /articles/{id}` - 詳細取得（content全文）
- `POST /articles` - 作成（埋め込み自動生成）
- `PATCH /articles/{id}` - 部分更新（必要に応じて埋め込み再生成）
- `DELETE /articles/{id}` - 削除
- `GET /search?q=...` - セマンティック検索

詳細な仕様とサンプルは`docs/api.md`を参照。

## 開発ルール

- Issue・PRは `.github/` 配下のテンプレートに沿って作成すること
  - Issue作成時: `.github/ISSUE_TEMPLATE/` のテンプレート形式に従う
  - PR作成時: `.github/pull_request_template.md` の形式に従う
- ブランチ名・コミットメッセージの規約は `docs/CONTRIBUTING.md` を参照
- アーキテクチャ・設計判断は `docs/ARCHITECTURE.md` を参照

## 実装リファレンス

5フェーズの詳細な実装計画は`docs/implementation-plan.md`を参照。計画されたディレクトリ構造に正確に従ってください。
