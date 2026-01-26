# コントリビューションガイド

TechInsightへの貢献ありがとうございます。このドキュメントでは、開発に参加する際のルールと手順を説明します。

---

## 開発環境のセットアップ

### Docker Compose（推奨）

```bash
git clone https://github.com/shunbouchan/tech-insight.git
cd tech-insight
cp .env.example .env
docker compose up --build
```

起動後:
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

### ローカル開発

**バックエンド:**

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload
```

**フロントエンド:**

```bash
cd frontend
npm install
npm run dev
```

---

## ブランチ戦略

`main` ブランチへの直接pushは禁止です。必ずブランチを作成してPRを提出してください。

### ブランチ名の規約

`<プレフィックス>/<説明>` の形式で、ケバブケースを使用します。

| プレフィックス | 用途 | 例 |
|--------------|------|-----|
| `feature/` | 新機能追加 | `feature/search-filter` |
| `fix/` | バグ修正 | `fix/pagination-offset` |
| `refactor/` | リファクタリング | `refactor/service-layer` |
| `docs/` | ドキュメント | `docs/api-examples` |
| `chore/` | 設定・雑務 | `chore/update-dependencies` |
| `test/` | テスト追加・修正 | `test/search-service` |

---

## コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/) に準拠します。メッセージは日本語で記述します。

### フォーマット

```
<タイプ>: <説明>
```

### タイプ一覧

| タイプ | 用途 | 例 |
|-------|------|-----|
| `feat` | 新機能 | `feat: カテゴリ別フィルタ機能を追加` |
| `fix` | バグ修正 | `fix: ページネーションのオフセット計算を修正` |
| `refactor` | リファクタリング | `refactor: サービス層の依存関係を整理` |
| `docs` | ドキュメント | `docs: API設計書を更新` |
| `chore` | 設定・雑務 | `chore: 依存パッケージを更新` |
| `test` | テスト | `test: 検索サービスのユニットテストを追加` |
| `style` | コードスタイル | `style: フォーマットを適用` |
| `perf` | パフォーマンス改善 | `perf: 埋め込み生成のバッチサイズを最適化` |
| `ci` | CI/CD | `ci: GitHub Actionsワークフローを追加` |

---

## プルリクエスト

### 基本ルール

- PRテンプレートに沿って記入する
- CIが全てパスしていること
- 変更は **500行以内** を目安にする（例外: lockファイル、マイグレーション、シードデータ）
- UI変更がある場合はスクリーンショットを添付する
- マージ方式は **Squash and Merge** を推奨

### レビュー依頼前のチェックリスト

- [ ] ローカルで動作確認済み
- [ ] 既存テストがパスする
- [ ] リントエラーがない
- [ ] 不要なデバッグコード（`console.log`, `print`）を削除済み

---

## コードスタイル

### バックエンド（Python）

- **リンター/フォーマッター**: [Ruff](https://docs.astral.sh/ruff/)
- **行の長さ**: 100文字
- **実行**: `poetry run ruff check .`

### フロントエンド（TypeScript）

- **リンター**: ESLint
- **フォーマッター**: Prettier
- **設定**: シングルクォート、セミコロンあり、インデント2スペース、行の長さ100文字
- **実行**: `npm run lint` / `npm run format`

---

## テスト

### バックエンド

```bash
cd backend
poetry run pytest
```

### フロントエンド

```bash
cd frontend
npm run build
```

### PR前の確認チェックリスト

- バックエンド: `poetry run pytest` がパスする
- バックエンド: `poetry run ruff check .` がパスする
- フロントエンド: `npm run build` が成功する
- フロントエンド: `npm run lint` がパスする

---

## ディレクトリ構造のルール

### バックエンド

```
backend/app/
├── api/v1/        # ルーティング層: HTTPリクエスト/レスポンスの処理のみ
├── services/      # ビジネスロジック層: ドメインロジックの実装
├── schemas/       # データ転送オブジェクト: Pydanticによる入出力スキーマ定義
├── models/        # データアクセス層: SQLAlchemyモデル定義
└── db/            # DB設定: セッション管理、接続設定
```

- **api → services → models** の方向でのみ依存する（逆方向の依存禁止）
- ビジネスロジックは必ず `services/` に配置する（`api/` に直接書かない）
- スキーマ（Pydantic）とモデル（SQLAlchemy）は明確に分離する

### フロントエンド

```
frontend/src/
├── app/           # App Routerページ: ルーティングとページコンポーネント
├── components/    # 再利用可能なUIコンポーネント
│   └── ui/        # 汎用UIコンポーネント（Button, Modal, Skeleton等）
├── hooks/         # カスタムフック: データ取得、状態管理ロジック
├── lib/           # ユーティリティ: API クライアント、ヘルパー関数
└── types/         # TypeScript型定義: 共有型、APIレスポンス型
```

- ページコンポーネント（`app/`）は薄く保ち、ロジックは `hooks/` に分離する
- API呼び出しは `lib/` に集約する
- 共通の型定義は `types/` で管理する
