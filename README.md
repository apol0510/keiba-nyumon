# keiba-guide: 競馬予想サイト初心者向けガイド

競馬予想サイトの選び方・使い方・攻略法を解説する初心者向けガイドサイト。AI生成記事による完全自動運営。

## 🎯 プロジェクト概要

- **タイプ**: ガイド記事専門サイト
- **コンテンツ**: AI生成による高品質なハウツー記事
- **目的**: 初心者にやさしい競馬予想サイトの解説
- **Base ID**: `appiHsDBAFFSmCiBV`（Newsテーブル）

## 🛠 技術スタック

- **フロントエンド**: Astro 5.x + React
- **スタイリング**: Tailwind CSS 4
- **データベース**: Airtable（Newsテーブル）
- **AI記事生成**: Anthropic Claude API
- **画像**: Unsplash（固定プール、10枚/カテゴリ）
- **ホスティング**: Netlify（完全SSG mode）
- **開発ポート**: 4322

## 📁 プロジェクト構造

```
keiba-guide/
├── src/
│   ├── pages/
│   │   ├── index.astro        # トップページ（記事一覧）
│   │   ├── news/
│   │   │   └── [slug].astro   # 記事詳細ページ
│   │   └── sitemap.xml.ts     # サイトマップ
│   ├── components/
│   │   ├── NewsCard.astro     # 記事カード
│   │   └── Timeline.astro     # タイムライン
│   ├── layouts/
│   │   └── BaseLayout.astro   # ベースレイアウト
│   └── lib/
│       └── news.ts            # Airtable News取得
├── scripts/
│   ├── generate-ai-news.cjs           # AI記事生成
│   ├── daily-news-generation.cjs      # 日次記事生成
│   └── lib/
│       └── image-generator.cjs        # 画像生成
└── public/
```

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルを作成：

```env
# Airtable（必須）
KEIBA_GUIDE_AIRTABLE_API_KEY=patXXXXXXXXXXXXXXXX
KEIBA_GUIDE_AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV

# フォールバック（開発環境用）
AIRTABLE_API_KEY=patXXXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV

# Claude API（記事生成 - オプション）
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXX

# サイト情報
SITE_URL=https://keiba-guide.jp
```

### 3. Airtableセットアップ

**Newsテーブル** を作成（`appiHsDBAFFSmCiBV`）:

| フィールド名 | タイプ | 説明 |
|-------------|--------|------|
| Title | Single line text | 記事タイトル |
| Slug | Single line text | URLスラッグ |
| Content | Long text | 記事本文（Markdown） |
| Excerpt | Long text | 記事要約 |
| Category | Single select | カテゴリ（ガイド/ランキング/ハウツー） |
| Tags | Multiple select | タグ |
| Thumbnail | Attachment | サムネイル画像（16:9） |
| Status | Single select | ステータス（published/draft） |
| ViewCount | Number | 閲覧数 |
| IsFeatured | Checkbox | 注目記事フラグ |
| Author | Single line text | 著者名 |
| PublishedAt | Date | 公開日時 |
| CreatedAt | Created time | 作成日時 |

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:4322 でアクセス可能。

## 📝 記事生成

### AI記事自動生成

```bash
# 環境変数を設定して実行
KEIBA_GUIDE_AIRTABLE_API_KEY=xxx \
KEIBA_GUIDE_AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV \
ANTHROPIC_API_KEY=xxx \
ARTICLE_COUNT=3 \
node scripts/generate-ai-news.cjs
```

### 記事テンプレート

1. **初心者向けガイド**（howto）
   - 例: 「【初心者向け】競馬予想サイトの選び方ガイド」

2. **ランキング記事**（ranking）
   - 例: 「【2025年版】中央競馬予想サイトおすすめランキングTOP5」

3. **攻略法・テクニック記事**（tips）
   - 例: 「競馬予想サイトで勝率を上げる5つのコツ」

## 🌐 Netlifyデプロイ

### 1. Netlify Dashboard設定

1. https://app.netlify.com/ にアクセス
2. GitHubリポジトリ連携
3. ビルド設定:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 2. 環境変数設定

Netlify Dashboard → Site settings → Environment variables

| Key | Value |
|-----|------|
| `KEIBA_GUIDE_AIRTABLE_API_KEY` | Airtable Personal Access Token |
| `KEIBA_GUIDE_AIRTABLE_BASE_ID` | `appiHsDBAFFSmCiBV` |
| `ANTHROPIC_API_KEY` | Claude APIキー（記事生成用） |

### 3. デプロイ

```bash
# ローカルから手動デプロイ
netlify deploy --prod
```

または、Git pushで自動デプロイ。

## 📊 コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 (ポート4322) |
| `npm run build` | 本番ビルド |
| `npm run preview` | ビルドプレビュー |
| `npm run generate:ai` | AI記事生成 |
| `npm run news:daily` | 日次記事生成（統合版） |

## 🔐 セキュリティ

- **APIキー管理**: `.env`はgitignore対象
- **環境変数**: Netlify/GitHub Secretsで管理
- **APIキー漏洩時の対処**:
  1. Airtable Personal Access Tokenを即座に無効化
  2. Anthropic APIキーを即座に削除
  3. 新しいキーを発行
  4. Netlify/GitHub Secretsを更新

## 📚 ドキュメント

- **CLAUDE.md**: プロジェクト詳細、設定、作業履歴
- **NEWS_AUTOMATION_GUIDE.md**: ニュース自動生成のセットアップ手順

## 🔗 リンク

- **GitHubリポジトリ**: https://github.com/apol0510/keiba-guide
- **本番サイト**: https://keiba-guide.jp（予定）

## 📄 ライセンス

MIT
