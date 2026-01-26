# TechInsight 検索機能ブラッシュアップ計画

## 概要

検索UXを「キーワード検索」「セマンティック検索」の2レーンに分離し、評価者が迷わないUIを構築。加えて、APIキー不要のローカル埋め込みを明確化する。

---

## Phase 1: 検索UXの2レーン化

### 1.1 SearchModeToggle コンポーネント新規作成

**ファイル**: `frontend/src/components/search/SearchModeToggle.tsx`

```tsx
type SearchMode = 'keyword' | 'semantic';
```

- タブ形式で「キーワード検索」「セマンティック検索」を切替
- 各モードの説明をツールチップで表示
  - キーワード: 「タイトル・本文の単語で検索」
  - セマンティック: 「意味的に関連する記事をAIで検索」

### 1.2 SearchBar 拡張

**ファイル**: `frontend/src/components/search/SearchBar.tsx`

- `searchMode` prop を追加
- placeholder をモード別に変更
  - キーワード: `"キーワードで検索..."`
  - セマンティック: `"自然言語で検索（例: 機械学習の最適化手法）"`

### 1.3 useKeywordSearch フック新規作成

**ファイル**: `frontend/src/hooks/useKeywordSearch.ts`

- `api.articles.list({ keyword, category })` を呼び出し
- useSearch と同様のデバウンス処理
- キーワードマッチ位置情報を保持

### 1.4 page.tsx 統合

**ファイル**: `frontend/src/app/page.tsx`

- `searchMode` state 追加（デフォルト: `'semantic'`）
- SearchModeToggle を SearchBar 上部に配置
- モードに応じて `useSearch` / `useKeywordSearch` を切替

### 1.5 型定義拡張

**ファイル**: `frontend/src/types/article.ts`

- SearchResult に `highlight?: string` フィールド追加（セマンティック用スニペット）

---

## Phase 2: 検索結果の可視性向上

### 2.1 バックエンド: スニペット抽出機能

**ファイル**: `backend/app/services/search_service.py`

- クエリと最も関連性の高い1-2文を抽出
- SearchResult に `highlight` として返却

**ファイル**: `backend/app/schemas/search.py`

- `highlight: str | None = None` フィールド追加

### 2.2 HighlightedText コンポーネント

**ファイル**: `frontend/src/components/search/HighlightedText.tsx`

- キーワードモード: クエリ文字列をハイライト表示
- セマンティックモード: バックエンドの highlight を表示

### 2.3 ArticleCard 拡張

**ファイル**: `frontend/src/components/articles/ArticleCard.tsx`

- HighlightedText を使用してマッチ箇所を表示
- 類似度スコアをプログレスバーで視覚化

---

## Phase 3: 空状態・エラーUX改善

### 3.1 SearchEmptyState コンポーネント

**ファイル**: `frontend/src/components/search/SearchEmptyState.tsx`

- 0件時のメッセージ（「〇〇で検索しましたが…」）
- 検索のコツ（モード別）
- 「別のモードで試す」ボタン

### 3.2 SearchHelpPanel コンポーネント

**ファイル**: `frontend/src/components/search/SearchHelpPanel.tsx`

- 検索機能の使い分け説明パネル（折りたたみ式）
- キーワード vs セマンティックの違いを解説

---

## Phase 4: EMBEDDING_PROVIDER 環境変数対応

### 4.1 embedding_service.py リファクタリング

**ファイル**: `backend/app/services/embedding_service.py`

- `EMBEDDING_PROVIDER` 環境変数を参照（デフォルト: `local`）
- 将来的な OpenAI 対応のためのプロバイダ抽象化

```python
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "local")
```

### 4.2 環境変数ファイル更新

**ファイル**: `.env.example`

```bash
# Embedding Configuration
EMBEDDING_PROVIDER=local  # local (default) | openai
# OPENAI_API_KEY=sk-...   # Only if EMBEDDING_PROVIDER=openai
```

### 4.3 README 更新

**ファイル**: `README.md`

追加内容:
- 「**APIキーは不要**」を明記
- `EMBEDDING_PROVIDER=local` がデフォルト
- ローカルモデル（all-MiniLM-L6-v2）で完結

---

## Phase 5: ハイブリッド検索（オプション）

### 5.1 ハイブリッド検索エンドポイント

**ファイル**: `backend/app/api/v1/search.py`

- `GET /search/hybrid` エンドポイント追加
- キーワードで候補絞込 → ベクトルで再ランキング

---

## ファイル変更一覧

### 新規作成
| ファイル | 説明 |
|----------|------|
| `frontend/src/components/search/SearchModeToggle.tsx` | 検索モード切替UI |
| `frontend/src/components/search/HighlightedText.tsx` | ハイライト表示 |
| `frontend/src/components/search/SearchEmptyState.tsx` | 0件時UI |
| `frontend/src/components/search/SearchHelpPanel.tsx` | 検索ヘルプ |
| `frontend/src/hooks/useKeywordSearch.ts` | キーワード検索フック |

### 変更
| ファイル | 変更内容 |
|----------|----------|
| `frontend/src/app/page.tsx` | 検索モード統合 |
| `frontend/src/components/search/SearchBar.tsx` | searchMode prop対応 |
| `frontend/src/components/articles/ArticleCard.tsx` | ハイライト表示対応 |
| `frontend/src/types/article.ts` | highlight フィールド追加 |
| `backend/app/services/search_service.py` | highlight抽出追加 |
| `backend/app/schemas/search.py` | highlight フィールド追加 |
| `backend/app/services/embedding_service.py` | EMBEDDING_PROVIDER対応 |
| `.env.example` | EMBEDDING_PROVIDER追加 |
| `README.md` | 埋め込みプロバイダ説明追加 |

---

## 実装順序

1. **Phase 1** - 検索UXの2レーン化（UIの基盤）
2. **Phase 4** - EMBEDDING_PROVIDER環境変数（Phase 1と並行可）
3. **Phase 2** - 検索結果の可視性向上
4. **Phase 3** - 空状態・エラーUX改善
5. **Phase 5** - ハイブリッド検索（時間があれば）

---

## 検証方法

1. `docker compose up --build` で起動
2. http://localhost:3000 にアクセス
3. 検索モード切替が機能することを確認
4. キーワード検索: 「Python」→ タイトル/本文にPythonを含む記事がハイライト表示
5. セマンティック検索: 「バックエンドの設計パターン」→ 関連記事が類似度スコア付きで表示
6. 0件時のガイドメッセージが表示されることを確認
7. README の埋め込みプロバイダ説明を確認
