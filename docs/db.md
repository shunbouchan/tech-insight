# TechInsight データベース設計書

## 概要

- **DBMS**: PostgreSQL 16
- **拡張機能**: pgvector（ベクトル検索用）
- **文字エンコーディング**: UTF-8

### pgvector 前提条件

- **Dockerイメージ**: `pgvector/pgvector:pg16`（pgvector同梱済み）
- **拡張機能の有効化**: マイグレーションで `CREATE EXTENSION IF NOT EXISTS vector;` を実行すること
- **フォールバック**:
  - HNSWインデックス作成失敗時: IVFFlatインデックスまたはインデックス無しで代替
  - pgvector未インストール時: `embedding` カラムを使用しない（セマンティック検索無効化）

---

## ER図

```
┌─────────────────────────────────────────────────────────┐
│                       articles                          │
├─────────────────────────────────────────────────────────┤
│ PK  id              SERIAL                              │
│     title           VARCHAR(500)     NOT NULL           │
│     content         TEXT             NOT NULL           │
│     author          VARCHAR(100)     NOT NULL           │
│     category        VARCHAR(50)      NOT NULL           │
│     published_at    TIMESTAMPTZ      NOT NULL           │
│     embedding       vector(384)                         │
│     created_at      TIMESTAMPTZ      DEFAULT NOW()      │
│     updated_at      TIMESTAMPTZ      DEFAULT NOW()      │
└─────────────────────────────────────────────────────────┘
```

---

## テーブル定義

### articles テーブル

技術記事を格納するメインテーブル。

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | SERIAL | NO | 自動採番 | 主キー |
| title | VARCHAR(500) | NO | - | 記事タイトル |
| content | TEXT | NO | - | 記事本文 |
| author | VARCHAR(100) | NO | - | 著者名 |
| category | VARCHAR(50) | NO | - | カテゴリ |
| published_at | TIMESTAMPTZ | NO | - | 公開日時 |
| embedding | vector(384) | YES | - | セマンティック検索用ベクトル |
| created_at | TIMESTAMPTZ | NO | NOW() | レコード作成日時 |
| updated_at | TIMESTAMPTZ | NO | NOW() | レコード更新日時 |

### 制約

| 制約名 | 種類 | 対象 | 内容 |
|--------|------|------|------|
| articles_pkey | PRIMARY KEY | id | 主キー |
| valid_category | CHECK | category | 'AI/ML', 'Backend', 'Frontend', 'DevOps' のいずれか |

---

## インデックス定義

| インデックス名 | 対象カラム | 種類 | 用途 |
|----------------|------------|------|------|
| articles_pkey | id | B-tree (UNIQUE) | 主キー検索 |
| idx_articles_category | category | B-tree | カテゴリフィルタ |
| idx_articles_author | author | B-tree | 著者フィルタ |
| idx_articles_published_at | published_at DESC | B-tree | 日付ソート |
| idx_articles_embedding | embedding | HNSW | ベクトル類似検索 |

### HNSWインデックス詳細

ベクトル検索のための近似最近傍探索インデックス。

```sql
CREATE INDEX idx_articles_embedding ON articles
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

| パラメータ | 値 | 説明 |
|------------|-----|------|
| m | 16 | グラフの各ノードが持つ最大エッジ数 |
| ef_construction | 64 | インデックス構築時の探索リストサイズ |
| vector_cosine_ops | - | コサイン類似度を使用 |

**性能特性**:
- 検索時間: O(log N) - 線形探索より高速
- メモリ使用量: O(N × m) - データ量に比例
- 10,000件規模を想定し、HNSWインデックスで線形探索より高速化を狙う
- DBクエリ（ベクトル検索部分）で10ms未満を目標（Embedding生成は別途 ~14ms/文）
- 実測結果はREADMEに記載予定

**将来の改善案**: `embedding IS NOT NULL` の部分インデックス化
```sql
-- 既存インデックスを削除してから作成
DROP INDEX IF EXISTS idx_articles_embedding;
CREATE INDEX idx_articles_embedding ON articles
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64)
WHERE embedding IS NOT NULL;
```
> 未生成レコードが混在する運用時、インデックスサイズ削減と検索効率向上に有効
>
> ※pgvectorのバージョンによってはHNSWで部分インデックスが作成できない場合がある。その場合はIVFFlatへ切り替えるか、`WHERE embedding IS NOT NULL` を検索クエリ側で保証する

---

## トリガー

### updated_at自動更新トリガー

レコード更新時に`updated_at`カラムを自動更新。

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

---

## データ仕様

### カテゴリ一覧

| 値 | 説明 |
|-----|------|
| AI/ML | 人工知能・機械学習関連 |
| Backend | バックエンド開発関連 |
| Frontend | フロントエンド開発関連 |
| DevOps | DevOps・インフラ関連 |

### embedding カラム仕様

- **次元数**: 384
- **モデル**: sentence-transformers/all-MiniLM-L6-v2
- **正規化**: L2正規化済み（コサイン類似度用）
- **生成タイミング**:
  - 記事作成時に自動生成
  - 記事更新時（title/content変更時）に再生成

**Embeddingの計算式**:
```
text = "{title} [SEP] {content}"
embedding = model.encode(text, normalize_embeddings=True)
```

---

## 初期データ

### データソース

- ファイル: `data/articles.csv`
- 件数: 1,000件
- フォーマット: CSV (UTF-8)

### CSVカラムマッピング

| CSVカラム | DBカラム |
|-----------|----------|
| id | id |
| title | title |
| content | content |
| author | author |
| category | category |
| published_at | published_at |

### データ分布

**カテゴリ別**:
| カテゴリ | 件数 |
|----------|------|
| AI/ML | 255 |
| Backend | 252 |
| Frontend | 247 |
| DevOps | 246 |

**著者別**:
| 著者 | 件数 |
|------|------|
| Tanaka | 140 |
| Yamamoto | 128 |
| Ito | 127 |
| Nakamura | 127 |
| Sato | 120 |
| Takahashi | 120 |
| Suzuki | 120 |
| Watanabe | 118 |

---

## DDL（テーブル作成SQL）

```sql
-- pgvector拡張を有効化
CREATE EXTENSION IF NOT EXISTS vector;

-- articlesテーブル作成
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT valid_category CHECK (
        category IN ('AI/ML', 'Backend', 'Frontend', 'DevOps')
    )
);

-- インデックス作成
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_author ON articles(author);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);

-- HNSWインデックス作成（ベクトル検索用）
CREATE INDEX idx_articles_embedding ON articles
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

---

## クエリ例

### 記事一覧取得（ページネーション）

```sql
SELECT id, title, content, author, category, published_at, created_at, updated_at
FROM articles
WHERE category = 'AI/ML'  -- オプション
ORDER BY published_at DESC
LIMIT 20 OFFSET 0;
```

### 記事件数取得

```sql
SELECT COUNT(*) FROM articles WHERE category = 'AI/ML';
```

### セマンティック検索

```sql
SELECT
    id, title, content, author, category, published_at,
    1 - (embedding <=> '[0.1, 0.2, ..., 0.384]'::vector) as similarity
FROM articles
WHERE embedding IS NOT NULL
  AND 1 - (embedding <=> '[0.1, 0.2, ..., 0.384]'::vector) > 0.3
ORDER BY embedding <=> '[0.1, 0.2, ..., 0.384]'::vector
LIMIT 20;
```

---

## スケーラビリティ考慮

### 現在の設計（〜10,000件）

- 単一テーブル構成
- HNSWインデックスで高速検索
- 目標: DBクエリ10ms未満（実測後READMEに記載）

### 将来の拡張案（10,000件以上）

1. **パーティショニング**: カテゴリまたは日付でテーブル分割
2. **リードレプリカ**: 検索クエリの負荷分散
3. **インデックスチューニング**:
   - `ef_search` パラメータ調整
   - IVFFlatへの切り替え検討（メモリ節約）

---

## バックアップ・リストア

### バックアップ

```bash
docker compose exec db pg_dump -U postgres techinsight > backup.sql
```

### リストア

```bash
cat backup.sql | docker compose exec -T db psql -U postgres techinsight
```
