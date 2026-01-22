# TechInsight API設計書

## 概要

- **ベースURL**: `http://localhost:8000/api/v1`
- **データ形式**: JSON
- **認証**: なし（ローカル開発用）

---

## エンドポイント一覧

> パスはベースURL（`/api/v1`）からの相対パス

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/health` | ヘルスチェック |
| GET | `/articles` | 記事一覧取得（キーワード検索対応） |
| GET | `/articles/{id}` | 記事詳細取得 |
| POST | `/articles` | 記事作成 |
| PATCH | `/articles/{id}` | 記事更新（部分更新） |
| DELETE | `/articles/{id}` | 記事削除 |
| GET | `/search` | セマンティック検索 |

---

## 共通仕様

### エラーレスポンス

**一般的なエラー**:
```json
{
  "detail": "エラーメッセージ"
}
```

**バリデーションエラー**（FastAPI標準形式）:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

> 上記のバリデーションエラー（422）はFastAPI標準形式

| ステータスコード | 説明 |
|------------------|------|
| 400 | クエリパラメータ不正 / ビジネスルール違反 |
| 404 | リソースが見つからない |
| 422 | リクエストボディのスキーマ検証エラー（FastAPI標準） |
| 500 | サーバーエラー |

> 400はアプリ固有のルール違反（例: 公開日時が未来、検索結果の閾値が不正など）に使用し、入力スキーマの検証は422（FastAPI標準）とする

---

## 1. ヘルスチェック

### GET /health

サーバーの稼働状態を確認。

**レスポンス** (200 OK):
```json
{
  "status": "ok"
}
```

---

## 2. 記事一覧取得

### GET /articles

ページネーション付きで記事一覧を取得。キーワード検索にも対応。

> **注**: 一覧APIでは `excerpt`（先頭200文字）のみ返却。全文は詳細API（`GET /articles/{id}`）で取得。

**クエリパラメータ**:

| パラメータ | 型 | 必須 | デフォルト | 範囲 | 説明 |
|------------|-----|------|------------|------|------|
| page | integer | No | 1 | >= 1 | ページ番号 |
| page_size | integer | No | 20 | 1-100 | 1ページあたりの件数 |
| category | string | No | - | AI/ML, Backend, Frontend, DevOps | カテゴリでフィルタ |
| author | string | No | - | - | 著者でフィルタ |
| keyword | string | No | - | - | キーワード検索（title/contentをILIKE検索） |

> **キーワード検索 vs セマンティック検索**:
> - `keyword`: 文字列の部分一致（ILIKE検索、大文字小文字を無視）。特定ワードの検索に適する
> - `/search`: 意味的類似度による検索。自然言語クエリに適する

**リクエスト例**:
```
GET /articles?page=1&page_size=10&category=AI/ML
GET /articles?keyword=OpenAI&page_size=20
```

**レスポンス** (200 OK):
```json
{
  "items": [
    {
      "id": 1,
      "title": "Fine-tuning OpenAI API: Automated prompt engineering techniques",
      "excerpt": "In this article, we will focus on fine-tuning OpenAI API...",
      "author": "Ito",
      "category": "AI/ML",
      "published_at": "2024-01-22T05:00:00Z",
      "created_at": "2025-01-22T00:00:00Z",
      "updated_at": "2025-01-22T00:00:00Z"
    }
  ],
  "total": 255,
  "page": 1,
  "page_size": 10,
  "total_pages": 26
}
```

---

## 3. 記事詳細取得

### GET /articles/{id}

指定したIDの記事を取得（`content`全文を含む）。

**パスパラメータ**:

| パラメータ | 型 | 説明 |
|------------|-----|------|
| id | integer | 記事ID |

**レスポンス** (200 OK):
```json
{
  "id": 1,
  "title": "Fine-tuning OpenAI API: Automated prompt engineering techniques",
  "content": "In this article, we will focus on fine-tuning OpenAI API...",
  "author": "Ito",
  "category": "AI/ML",
  "published_at": "2024-01-22T05:00:00Z",
  "created_at": "2025-01-22T00:00:00Z",
  "updated_at": "2025-01-22T00:00:00Z"
}
```

**エラーレスポンス** (404 Not Found):
```json
{
  "detail": "Article not found"
}
```

---

## 4. 記事作成

### POST /articles

新しい記事を作成。Embeddingは自動生成される（同期処理）。

> **将来拡張**: 現状は同期生成（簡潔性優先）。大量投稿時のレスポンス改善のため、将来的にキュー（Celery等）での非同期Embedding生成を検討。

**リクエストボディ**:
```json
{
  "title": "New Article Title",
  "content": "Article content goes here...",
  "author": "Author Name",
  "category": "Backend",
  "published_at": "2025-01-22T00:00:00Z"
}
```

| フィールド | 型 | 必須 | 制約 |
|------------|-----|------|------|
| title | string | Yes | 最大500文字 |
| content | string | Yes | - |
| author | string | Yes | 最大100文字 |
| category | string | Yes | AI/ML, Backend, Frontend, DevOps のいずれか |
| published_at | datetime | Yes | ISO 8601形式 |

**レスポンス** (201 Created):
```json
{
  "id": 1001,
  "title": "New Article Title",
  "content": "Article content goes here...",
  "author": "Author Name",
  "category": "Backend",
  "published_at": "2025-01-22T00:00:00Z",
  "created_at": "2025-01-22T12:00:00Z",
  "updated_at": "2025-01-22T12:00:00Z"
}
```

---

## 5. 記事更新

### PATCH /articles/{id}

既存の記事を部分更新。送信したフィールドのみ更新される。title/contentが変更された場合、Embeddingは自動再生成される。

**パスパラメータ**:

| パラメータ | 型 | 説明 |
|------------|-----|------|
| id | integer | 記事ID |

**リクエストボディ**（送信したフィールドのみ更新）:
```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

| フィールド | 型 | 必須 | 説明 |
|------------|-----|------|------|
| title | string | No | 記事タイトル（最大500文字） |
| content | string | No | 記事本文 |
| author | string | No | 著者名（最大100文字） |
| category | string | No | カテゴリ |
| published_at | datetime | No | 公開日時（ISO 8601形式） |

**レスポンス** (200 OK):
```json
{
  "id": 1,
  "title": "Updated Title",
  "content": "Updated content...",
  "author": "Ito",
  "category": "AI/ML",
  "published_at": "2024-01-22T05:00:00Z",
  "created_at": "2025-01-22T00:00:00Z",
  "updated_at": "2025-01-22T12:30:00Z"
}
```

---

## 6. 記事削除

### DELETE /articles/{id}

指定したIDの記事を削除。

**パスパラメータ**:

| パラメータ | 型 | 説明 |
|------------|-----|------|
| id | integer | 記事ID |

**レスポンス** (204 No Content):
レスポンスボディなし

---

## 7. セマンティック検索

### GET /search

自然言語クエリに基づいてセマンティック検索を実行。

> **将来拡張**: 現状はGETで提供。検索条件の拡張・ログ保存・長文クエリ対応のため、将来的に `POST /search` も検討。

**クエリパラメータ**:

| パラメータ | 型 | 必須 | デフォルト | 範囲 | 説明 |
|------------|-----|------|------------|------|------|
| q | string | Yes | - | 1文字以上 | 検索クエリ（自然言語） |
| category | string | No | - | AI/ML, Backend, Frontend, DevOps | カテゴリでフィルタ |
| top_k | integer | No | 20 | 1-100 | 返却する最大件数 |

**リクエスト例**:
```
GET /search?q=machine%20learning%20optimization&category=AI/ML&top_k=10
```

**レスポンス** (200 OK):
```json
{
  "query": "machine learning optimization",
  "results": [
    {
      "id": 42,
      "title": "Fine-tuning OpenAI API: Automated prompt engineering techniques",
      "excerpt": "In this article, we will focus on fine-tuning OpenAI API...",
      "author": "Tanaka",
      "category": "AI/ML",
      "published_at": "2024-01-22T05:00:00Z",
      "similarity": 0.8542
    },
    {
      "id": 87,
      "title": "Optimizing LLM: Neural network architectures for specific domains",
      "excerpt": "In this article, we will focus on optimizing LLM...",
      "author": "Sato",
      "category": "AI/ML",
      "published_at": "2024-03-15T10:00:00Z",
      "similarity": 0.7891
    }
  ],
  "total": 2
}
```

**similarity スコア**:
- 範囲: 0.0 〜 1.0
- コサイン類似度（`1 - cosine_distance`）を使用
- 高いほど検索クエリとの意味的類似度が高い
- 閾値 0.3 未満の結果は除外される

---

## データ型定義

### Article（詳細取得用）

```typescript
interface Article {
  id: number;
  title: string;
  content: string;       // 全文
  author: string;
  category: 'AI/ML' | 'Backend' | 'Frontend' | 'DevOps';
  published_at: string;  // ISO 8601
  created_at: string;    // ISO 8601
  updated_at: string;    // ISO 8601
}
```

### ArticleSummary（一覧取得用）

```typescript
interface ArticleSummary {
  id: number;
  title: string;
  excerpt: string;       // 200文字を超える場合のみ先頭200文字 + "..."
  author: string;
  category: 'AI/ML' | 'Backend' | 'Frontend' | 'DevOps';
  published_at: string;  // ISO 8601
  created_at: string;    // ISO 8601
  updated_at: string;    // ISO 8601
}
```

### ArticleListResponse

```typescript
interface ArticleListResponse {
  items: ArticleSummary[];  // excerpt のみ（パフォーマンス考慮）
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
```

### SearchResult

```typescript
interface SearchResult {
  id: number;
  title: string;
  excerpt: string;       // 200文字を超える場合のみ先頭200文字 + "..."
  author: string;
  category: 'AI/ML' | 'Backend' | 'Frontend' | 'DevOps';
  published_at: string;
  similarity: number;    // 0.0 - 1.0 (cosine similarity)
}
```

### SearchResponse

```typescript
interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}
```

---

## 使用例

### cURLでの記事検索

```bash
# セマンティック検索
curl "http://localhost:8000/api/v1/search?q=kubernetes%20deployment"

# 記事一覧（カテゴリフィルタ付き）
curl "http://localhost:8000/api/v1/articles?category=DevOps&page_size=5"

# 記事作成
curl -X POST "http://localhost:8000/api/v1/articles" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New DevOps Article",
    "content": "Content about DevOps...",
    "author": "Yamamoto",
    "category": "DevOps",
    "published_at": "2025-01-22T00:00:00Z"
  }'

# 記事更新（部分更新）
curl -X PATCH "http://localhost:8000/api/v1/articles/1001" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'

# 記事削除
curl -X DELETE "http://localhost:8000/api/v1/articles/1001"
```
