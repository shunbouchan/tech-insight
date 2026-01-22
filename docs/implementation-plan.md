# TechInsight 実装計画書

## 1. プロジェクト概要

**プロジェクト名**: TechInsight - AI搭載型ナレッジベース

**目的**: 技術記事データを基盤としたナレッジマネジメントシステム。CRUD操作とAIによるセマンティック検索を提供。

**対象データ**: 1,000件の技術記事（将来的に10,000件以上を想定）

---

## 2. 技術スタック

| レイヤー | 技術 | 選定理由 |
|----------|------|----------|
| Backend | Python 3.11 / FastAPI | 非同期処理、型安全、自動API文書生成 |
| ORM | SQLAlchemy 2.0 + Alembic | 非同期対応、マイグレーション管理 |
| Frontend | Next.js 14 (App Router) | SSR/SSG対応、TypeScript統合 |
| UI | Tailwind CSS | ユーティリティファースト、カスタマイズ容易 |
| Database | PostgreSQL 16 + pgvector | ベクトル検索対応、信頼性 |
| AI/Embedding | sentence-transformers | ローカル実行、APIキー不要 |
| Container | Docker Compose | 開発環境の一元管理、再現性 |

### Embeddingモデル選定

**採用モデル**: `sentence-transformers/all-MiniLM-L6-v2`

| 項目 | 値 |
|------|-----|
| 次元数 | 384 |
| モデルサイズ | ~80MB |
| 推論速度 | ~14ms/文 (CPU) |
| ライセンス | Apache 2.0 |

**選定理由**:
- APIキー不要でローカル完結
- 軽量で高速（Docker内でも実用的）
- セマンティック類似度タスクで高い精度

---

## 3. ディレクトリ構成

```
tech-insight/
├── docker-compose.yml          # サービスオーケストレーション
├── .env.example                # 環境変数テンプレート
├── .gitignore
├── Makefile                    # 開発コマンド集約
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml          # Poetry依存管理
│   ├── poetry.lock
│   ├── alembic.ini
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPIアプリケーション初期化
│   │   ├── config.py           # 設定管理 (pydantic-settings)
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py         # 依存性注入
│   │   │   ├── router.py       # ルーター統合
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── articles.py # 記事CRUD
│   │   │       ├── search.py   # セマンティック検索
│   │   │       └── health.py   # ヘルスチェック
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── article.py      # SQLAlchemyモデル
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── article.py      # リクエスト/レスポンススキーマ
│   │   │   ├── search.py       # 検索スキーマ
│   │   │   └── pagination.py   # ページネーションスキーマ
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── article_service.py    # 記事ビジネスロジック
│   │   │   ├── search_service.py     # 検索ロジック
│   │   │   └── embedding_service.py  # Embedding生成
│   │   │
│   │   └── db/
│   │       ├── __init__.py
│   │       ├── session.py      # DBセッション管理
│   │       └── base.py         # SQLAlchemy Base
│   │
│   ├── migrations/
│   │   ├── env.py
│   │   └── versions/
│   │       └── 001_initial_schema.py
│   │
│   ├── scripts/
│   │   └── seed_data.py        # CSVインポート + Embedding生成
│   │
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       └── test_articles.py
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      # ルートレイアウト
│   │   │   ├── page.tsx        # ホーム（記事一覧・検索）
│   │   │   ├── loading.tsx     # ローディング状態
│   │   │   ├── error.tsx       # エラーバウンダリ
│   │   │   ├── globals.css
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── page.tsx    # 管理ダッシュボード
│   │   │       └── articles/
│   │   │           ├── page.tsx        # 記事管理一覧
│   │   │           ├── new/page.tsx    # 新規作成
│   │   │           └── [id]/edit/page.tsx  # 編集
│   │   │
│   │   ├── components/
│   │   │   ├── ui/             # 汎用UIコンポーネント
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   └── Pagination.tsx
│   │   │   │
│   │   │   ├── articles/
│   │   │   │   ├── ArticleList.tsx
│   │   │   │   ├── ArticleCard.tsx
│   │   │   │   ├── ArticleModal.tsx
│   │   │   │   └── ArticleForm.tsx
│   │   │   │
│   │   │   ├── search/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── CategoryFilter.tsx
│   │   │   │
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       └── Footer.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useArticles.ts
│   │   │   ├── useSearch.ts
│   │   │   └── useDebounce.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts          # APIクライアント
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   │
│   │   └── types/
│   │       ├── article.ts
│   │       └── api.ts
│   │
│   └── public/
│       └── favicon.ico
│
├── data/
│   └── articles.csv            # 初期データ
│
└── docs/
    ├── implementation-plan.md  # 本ドキュメント
    ├── api.md                  # API設計書
    └── db.md                   # DB設計書
```

---

## 4. データベース設計

> **詳細は [docs/db.md](./db.md) を参照**

### 4.1 設計方針

- **単一テーブル構成**: `articles` テーブルのみ（シンプルさ優先）
- **ベクトル検索**: pgvector + HNSWインデックス（384次元、コサイン類似度）
- **カテゴリ制約**: `AI/ML`, `Backend`, `Frontend`, `DevOps` のいずれか

### 4.2 性能目標

- DBクエリ（ベクトル検索部分）: 10ms未満を目標
- Embedding生成: ~14ms/文（同期処理）
- 実測結果はREADMEに記載予定

---

## 5. API設計

> **詳細は [docs/api.md](./api.md) を参照**

### 5.1 エンドポイント一覧

> ベースURL: `/api/v1`

| メソッド | エンドポイント | 説明 |
|----------|----------------|------|
| GET | `/health` | ヘルスチェック |
| GET | `/articles` | 記事一覧取得（キーワード検索対応） |
| GET | `/articles/{id}` | 記事詳細取得 |
| POST | `/articles` | 記事作成 |
| PATCH | `/articles/{id}` | 記事更新（部分更新） |
| DELETE | `/articles/{id}` | 記事削除 |
| GET | `/search` | セマンティック検索 |

### 5.2 設計方針

- **一覧**: `excerpt`（先頭200文字）のみ返却（パフォーマンス考慮）
- **詳細**: `content` 全文を返却
- **更新**: PATCH（部分更新）を採用。送信したフィールドのみ更新
- **検索**: キーワード検索（ILIKE、大文字小文字無視）とセマンティック検索（ベクトル）を分離
- **将来拡張**: 長文クエリ対応のため `POST /search` も検討

---

## 6. セマンティック検索実装

### 6.1 処理フロー

```
[ユーザー入力] "machine learning optimization techniques"
        ↓
[Embedding Service] sentence-transformersでベクトル化 (384次元)
        ↓
[pgvector] コサイン類似度検索 (HNSWインデックス使用)
        ↓
[結果] 類似度スコア付きで上位K件を返却
```

### 6.2 Embedding生成

**文書登録時**:
```python
text = f"{title} [SEP] {content}"
embedding = model.encode(text, normalize_embeddings=True)
```

**検索時**:
```python
query_embedding = model.encode(query, normalize_embeddings=True)
```

### 6.3 類似度検索SQL

```sql
SELECT
    id, title, content, author, category, published_at,
    1 - (embedding <=> :query_embedding::vector) as similarity
FROM articles
WHERE embedding IS NOT NULL
  AND 1 - (embedding <=> :query_embedding::vector) > 0.3
ORDER BY embedding <=> :query_embedding::vector
LIMIT :top_k
```

---

## 7. Docker Compose構成

### 7.1 サービス定義

```yaml
services:
  db:
    image: pgvector/pgvector:pg16
    # PostgreSQL + pgvector拡張
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
      interval: 10s
      timeout: 5s
      retries: 3
    command: |
      sh -c "
        alembic upgrade head &&
        python scripts/seed_data.py &&
        uvicorn app.main:app --host 0.0.0.0 --port 8000
      "

  frontend:
    build: ./frontend
    depends_on:
      backend:
        condition: service_healthy
```

> **注**: `condition: service_healthy` を使用するため、各サービスに `healthcheck` を定義する必要がある

### 7.2 起動シーケンス

1. **db**: PostgreSQL起動、ヘルスチェック通過まで待機
2. **backend**:
   - Alembicでマイグレーション実行
   - seed_data.pyでCSVインポート + Embedding生成
   - FastAPIサーバー起動
3. **frontend**: Next.js開発サーバー起動

### 7.3 ボリューム

| ボリューム | 用途 |
|------------|------|
| postgres_data | DBデータ永続化 |
| model_cache | Embeddingモデルキャッシュ（再ダウンロード防止） |

---

## 8. フロントエンド設計

### 8.1 ページ構成

| パス | 説明 |
|------|------|
| `/` | 記事一覧・検索ページ |
| `/admin` | 管理ダッシュボード |
| `/admin/articles` | 記事管理一覧 |
| `/admin/articles/new` | 記事新規作成 |
| `/admin/articles/[id]/edit` | 記事編集 |

### 8.2 主要コンポーネント

**SearchBar**: debounce付き検索入力
- 入力後300msでAPIコール
- ローディング状態表示

**ArticleCard**: 記事カード
- タイトル、著者、カテゴリ、公開日
- 検索結果時は類似度スコア表示

**ArticleModal**: 記事詳細モーダル
- 全文表示
- 閉じるボタン、オーバーレイクリックで閉じる

**CategoryFilter**: カテゴリフィルタ
- 全て / AI/ML / Backend / Frontend / DevOps

### 8.3 状態管理

- **サーバー状態**: React hooks + fetch (または SWR/TanStack Query)
- **UI状態**: useState (モーダル開閉、検索クエリ等)
- **URL状態**: Next.js App Router searchParams

---

## 9. 実装フェーズ

### Phase 1: 基盤構築 (環境構築)

1. プロジェクト初期化
   - docker-compose.yml作成
   - .env.example作成
   - Makefile作成

2. Backend骨格
   - Dockerfile作成
   - pyproject.toml (依存関係定義)
   - FastAPI基本構成
   - ヘルスチェックエンドポイント

3. Frontend骨格
   - Next.js初期化 (App Router, TypeScript)
   - Tailwind CSS設定
   - Dockerfile作成

**検証**: `docker compose up` で3サービス起動確認

### Phase 2: データ層

4. DBマイグレーション
   - Alembic初期化
   - articlesテーブル作成
   - pgvector拡張有効化
   - インデックス作成

5. Embeddingサービス
   - sentence-transformersラッパー実装
   - モデルロード（起動時）
   - encode関数実装
   - **将来拡張**: 現状は同期生成（簡潔性優先）。大量投稿時はキュー（Celery等）での非同期生成を検討

6. シードスクリプト
   - CSV読み込み
   - バッチEmbedding生成
   - DB一括挿入（`INSERT ... ON CONFLICT (id) DO NOTHING` で冪等性確保）
   - 再実行しても重複データが発生しない設計
   - **前提**: CSVにidカラムが存在すること（無い場合は `title + published_at` などで一意制約を検討）

**検証**: 起動後、articlesテーブルに1000件 + embeddingカラム確認

### Phase 3: Backend API

7. CRUD API
   - 記事一覧（ページネーション付き）
   - 記事詳細
   - 記事作成（Embedding自動生成）
   - 記事更新（Embedding再生成）
   - 記事削除

8. 検索API
   - クエリEmbedding生成
   - pgvectorで類似度検索
   - 結果返却（類似度スコア付き）

**検証**: curl/Postmanで全エンドポイント動作確認

### Phase 4: Frontend

9. 記事一覧
   - APIクライアント実装
   - ArticleList / ArticleCard
   - ページネーション

10. 検索機能
    - SearchBar (debounce付き)
    - CategoryFilter
    - 検索結果表示（類似度スコア）

11. 記事詳細
    - ArticleModal実装
    - クリックで開閉

12. 管理画面
    - ArticleForm（作成/編集共通）
    - 削除確認モーダル
    - 管理一覧ページ

**検証**: ブラウザで全機能操作確認

### Phase 5: 仕上げ

13. ドキュメント
    - README.md（セットアップ手順、機能説明）
    - API設計書（docs/api.md）
    - DB設計書（docs/db.md）

14. コード品質
    - Ruff（Python linter）設定
    - ESLint/Prettier設定
    - 型チェック確認

15. 最終動作確認
    - `docker compose down -v && docker compose up --build`
    - 全機能テスト

---

## 10. 考慮事項

### 10.1 スケーラビリティ

| 項目 | 対策 |
|------|------|
| 記事数増加 | HNSWインデックスで10,000件以上も高速検索 |
| 同時アクセス | FastAPI非同期処理、コネクションプール |
| Embedding生成 | バッチ処理、モデルキャッシュ |

### 10.2 チーム開発

| 項目 | 対策 |
|------|------|
| コード規約 | Ruff, ESLint/Prettier |
| 型安全 | Pydantic, TypeScript strict mode |
| 環境統一 | Docker Compose, .env.example |
| ドキュメント | API自動生成 (OpenAPI), 設計書 |

### 10.3 保守運用

| 項目 | 対策 |
|------|------|
| DBマイグレーション | Alembic バージョン管理 |
| ログ | Python logging, 構造化ログ |
| ヘルスチェック | /health エンドポイント |
| 設定管理 | 環境変数 + pydantic-settings |

### 10.4 UX

| 項目 | 対策 |
|------|------|
| 検索体験 | debounce、ローディング表示 |
| フィードバック | 類似度スコア表示 |
| レスポンシブ | Tailwind CSS |
| ローディング | Skeleton UI |

---

## 11. 将来の拡張案（オプション）

以下は時間があれば検討:

1. **ハイブリッド検索**: ベクトル検索 + 全文検索の組み合わせ
2. **記事のタグ機能**: 複数タグ付け
3. **お気に入り機能**: ユーザーごとのブックマーク
4. **関連記事表示**: 閲覧中の記事に類似した記事を表示
5. **テスト自動化**: pytest, Jest, E2Eテスト
