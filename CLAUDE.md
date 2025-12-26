# keiba-guide: 競馬予想サイト初心者向けガイド

## 🚨 プロジェクト識別

**このプロジェクト**: keiba-guide (競馬予想サイト初心者向けガイド)
**作業ディレクトリ**: `/Users/apolon/Library/Mobile Documents/com~apple~CloudDocs/WorkSpace/keiba-guide/`
**GitHubリポジトリ**: https://github.com/apol0510/keiba-guide

**プロジェクトタイプ**: 独立プロジェクト（モノレポではない）

## ⚠️ 重要：デプロイに関する注意事項

**絶対に守ること**：
1. **Netlifyサイト未作成**: keiba-guide用の新しいNetlifyサイトをまだ作成していません
2. **デプロイ禁止**: `netlify deploy`コマンドを実行しないでください
3. **keiba-reviewと混同しない**: 同じワークスペースにkeiba-reviewプロジェクトがあります
4. **サイト作成手順**:
   - Netlify Dashboardから手動で新しいサイトを作成
   - サイト名: keiba-guide または類似の名前
   - ドメイン: 後で設定（keiba-guide.jp or keiba-guide.netlify.app）
   - サイトID取得後、`.netlify/state.json`を更新

**過去のインシデント（2025-12-26）**：
- 誤ってkeiba-reviewのサイトにkeiba-guideをデプロイしてしまった
- 両プロジェクトが同じNetlify siteIdを共有していたことが原因
- keiba-reviewは手動でロールバックして復元済み

---

## プロジェクト概要

競馬予想サイトの選び方・使い方・攻略法を解説する初心者向けガイドサイト。AI生成記事による完全自動運営。

### keiba-guide の特徴

- **ガイド記事専門サイト**
- AI生成による高品質なハウツー記事
- SEO最適化によるトラフィック獲得
- 初心者にやさしい解説コンテンツ

---

## 技術スタック

- **フロントエンド**: Astro 5.x + React
- **スタイリング**: Tailwind CSS 4
- **データベース**: Airtable（Newsテーブル）
- **AI記事生成**: Anthropic Claude API
- **画像**: Unsplash（固定プール、10枚/カテゴリ）
- **ホスティング**: Netlify（完全SSG mode）
- **ポート**: 4322（開発サーバー）

---

## 主要コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview

# AI記事自動生成
ANTHROPIC_API_KEY=xxx AIRTABLE_API_KEY=xxx AIRTABLE_BASE_ID=xxx \
ARTICLE_COUNT=3 node scripts/generate-ai-news.cjs
```

---

## 環境変数

```bash
# Airtable（必須）
KEIBA_GUIDE_AIRTABLE_API_KEY=patXXXXXXXXXXXXXXXX
KEIBA_GUIDE_AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV  # keiba-guide専用ベース（News）

# フォールバック（開発環境用）
AIRTABLE_API_KEY=patXXXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV

# Claude API（記事生成 - オプション）
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXX

# サイト情報
SITE_URL=https://keiba-guide.jp
```

**注意**: 環境変数は絶対にドキュメントに平文で記載しないこと。

---

## データベース（Airtable）

### keiba-guide専用ベース

- **Base ID**: `appiHsDBAFFSmCiBV`
- **Base名**: 競馬ガイド記事

### Newsテーブル

| フィールド名 | タイプ | 説明 |
|-------------|--------|------|
| Title | Single line text | 記事タイトル |
| Slug | Single line text | URLスラッグ |
| Content | Long text | 記事本文（Markdown） |
| Excerpt | Long text | 記事要約 |
| Category | Single select | カテゴリ（ガイド/ランキング/ハウツー） |
| Tags | Multiple select | タグ |
| ThumbnailUrl | Single line text | サムネイル画像URL（Unsplash、16:9、1200x675px） |
| Thumbnail | Attachment | サムネイル画像（オプション・廃止予定） |
| Status | Single select | ステータス（published/draft） |
| ViewCount | Number | 閲覧数 |
| IsFeatured | Checkbox | 注目記事フラグ |
| Author | Single line text | 著者名 |
| PublishedAt | Date | 公開日時 |
| CreatedAt | Created time | 作成日時 |

**注意**: サムネイル画像は `ThumbnailUrl` (テキストURL) を使用します。Unsplash固定プールから自動選択されます。

---

## ディレクトリ構造

```
keiba-guide/
├── src/
│   ├── pages/
│   │   ├── index.astro        # トップページ（記事一覧）
│   │   ├── about.astro         # サイト概要
│   │   ├── contact.astro       # お問い合わせ
│   │   ├── privacy.astro       # プライバシーポリシー
│   │   ├── terms.astro         # 利用規約
│   │   ├── news/
│   │   │   └── [slug].astro    # 記事詳細ページ
│   │   └── sitemap.xml.ts      # サイトマップ
│   ├── components/
│   │   ├── NewsCard.astro      # 記事カード
│   │   └── Timeline.astro      # タイムライン
│   ├── layouts/
│   │   └── BaseLayout.astro    # ベースレイアウト
│   ├── lib/
│   │   └── news.ts             # Airtable News取得
│   └── config.ts               # サイト設定
├── scripts/
│   ├── generate-ai-news.cjs    # AI記事自動生成
│   ├── daily-news-generation.cjs  # 日次記事生成
│   └── lib/
│       └── image-generator.cjs # 画像生成ユーティリティ
├── public/
├── CLAUDE.md                   # 本ファイル
├── netlify.toml                # Netlify設定
└── package.json
```

---

## AI記事自動生成

### 実行方法

```bash
# 環境変数を設定して実行
ARTICLE_COUNT=3 \
ANTHROPIC_API_KEY=xxx \
AIRTABLE_API_KEY=xxx \
AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV \
node scripts/generate-ai-news.cjs
```

### 記事テンプレート

1. **初心者向けガイド**（howto）
   - 例: 「【初心者向け】競馬予想サイトの選び方ガイド」
   - 例: 「競馬予想サイトの使い方完全マニュアル」

2. **ランキング記事**（ranking）
   - 例: 「【2025年版】中央競馬予想サイトおすすめランキングTOP5」
   - 例: 「初心者におすすめの競馬予想サイト10選」

3. **攻略法・テクニック記事**（tips）
   - 例: 「競馬予想サイトで勝率を上げる5つのコツ」
   - 例: 「無料予想と有料予想の違いと使い分け」

---

## Netlifyデプロイ手順

### 1. Netlify Dashboard でサイト作成

1. https://app.netlify.com/ にアクセス
2. 「New site from Git」をクリック
3. GitHubリポジトリを選択（または手動デプロイ）
4. 設定:
   - **Base directory**: （空白 - ルートディレクトリ）
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 2. 環境変数設定（Netlify UI）

Netlify Dashboard → Site settings → Environment variables

| Key | Value |
|-----|------|
| `KEIBA_GUIDE_AIRTABLE_API_KEY` | Airtable Personal Access Token |
| `KEIBA_GUIDE_AIRTABLE_BASE_ID` | `appiHsDBAFFSmCiBV` |
| `ANTHROPIC_API_KEY` | Claude APIキー（記事生成用） |

### 3. デプロイ

```bash
# ローカルから手動デプロイ
cd /Users/apolon/Library/Mobile\ Documents/com~apple~CloudDocs/WorkSpace/keiba-guide
netlify deploy --prod
```

または、Git push で自動デプロイ。

---

## 今後の実装予定

### Phase 1: コンテンツ拡充（優先度：高）

- [ ] AI記事自動生成の定期実行（GitHub Actions）
- [x] 記事詳細ページ作成（`/news/[slug]/`）- **2025-12-14完了**
- [x] サムネイル画像実装（Unsplash固定プール）- **2025-12-14完了**
- [ ] カテゴリ別ページ
- [ ] タグ別ページ

### Phase 2: 機能追加（優先度：中）

- [ ] 検索機能
- [x] 関連記事表示 - **2025-12-14完了**
- [ ] OGP画像自動生成
- [ ] パンくずナビゲーション

### Phase 3: 収益化（優先度：低）

- [ ] Google AdSense設置
- [ ] アフィリエイトリンク追加

---

## トラブルシューティング

### ビルドエラー

```bash
# キャッシュクリア
rm -rf .astro dist node_modules
npm install
npm run build
```

### Airtableからデータが取得できない

1. `.env` ファイルを確認
2. Base IDが正しいか確認: `appiHsDBAFFSmCiBV`
3. Airtable APIキーの権限を確認
4. 環境変数名が正しいか確認:
   - `KEIBA_GUIDE_AIRTABLE_API_KEY`
   - `KEIBA_GUIDE_AIRTABLE_BASE_ID`

---

## セキュリティ

### APIキー管理

- **絶対に平文でコミットしない**
- `.env` はgitignore対象
- ドキュメントに記載しない
- Netlify環境変数で管理

### APIキー漏洩時の対処

1. Airtable Personal Access Token を即座に無効化
2. Anthropic APIキーを即座に削除
3. 新しいキーを発行
4. Netlify / GitHub Secretsを更新

---

## 作業履歴

### 2025-12-25

1. ✅ **GitHubリポジトリ名の統一**
   - GitHubリポジトリ名: keiba-review-platform → keiba-guide に変更
   - ローカルのgit remote URLを更新
   - CLAUDE.mdにGitHubリポジトリ情報を追加

2. ✅ **環境変数名の完全統一**
   - 全ファイルで `KEIBA_B_*` → `KEIBA_GUIDE_*` に一括置換
   - 対象ファイル:
     - astro.config.mjs
     - src/lib/airtable.ts
     - src/lib/news.ts
     - src/pages/api/reviews/*.ts
     - scripts/*.cjs
     - .env.example
   - プロジェクト全体で命名規則を統一

### 2025-12-22

1. ✅ **プロジェクト構成の大規模整理**
   - モノレポ（review-platform-monorepo）を廃止
   - keiba-a（重複プロジェクト）を削除
   - keiba-c（移行済みプロジェクト）を削除
   - keiba-b → keiba-guide にリネーム
   - 独立プロジェクトとして `/WorkSpace/keiba-guide/` に移動

2. ✅ **設定ファイルの更新**
   - package.json: name, description更新
   - src/config.ts: サイト名、ドメイン、プロジェクト名を更新
   - 環境変数名: KEIBA_B_* → KEIBA_GUIDE_* に変更（初回）
   - CLAUDE.md: 新しい構成を反映

### 2025-12-14

1. ✅ **サムネイル画像システム完成**
   - Unsplash固定プール（10枚/カテゴリ）を実装
   - 決定的ハッシュ関数によるrecordId→画像マッピング
   - 画像重複問題を完全解決（10記事中10種類の画像）
   - scripts/lib/image-generator.cjs 実装
   - scripts/regenerate-all-unsplash.cjs 実装

2. ✅ **記事詳細ページ完成**
   - `/news/[slug]/` 動的ルーティング実装
   - サムネイル画像表示（16:9、高速表示最適化）
   - 構造化データ（JSON-LD）でSEO対策
   - パンくずリスト、関連記事表示
   - SNSシェアボタン（Twitter、Facebook、LINE）
   - レスポンシブデザイン対応

3. ✅ **SEO対策強化**
   - 各記事が個別ページとしてインデックス可能に
   - リッチスニペット対応（画像、日付、著者）
   - OGP設定（SNSシェア時に画像表示）
   - 内部リンク強化

---

## 参照ドキュメント

- 本番の口コミサイト: `/Users/apolon/.../Keiba review platform/keiba-review-platform/`

---

## 最終プロジェクト構成（2025-12-22時点）

```
/Users/apolon/Library/Mobile Documents/com~apple~CloudDocs/WorkSpace/
├── Keiba review platform/
│   └── keiba-review-platform/    # 本番の口コミサイト（https://keiba-review.jp/）
└── keiba-guide/                   # 初心者向けガイドサイト（独立プロジェクト）
```

**スッキリしました！** モノレポを廃止し、シンプルな構成に整理完了。
