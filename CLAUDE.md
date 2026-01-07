# keiba-nyumon: 競馬入門ガイド

## 🚨 プロジェクト識別

**このプロジェクト**: keiba-nyumon (競馬入門ガイド)
**作業ディレクトリ**: `/Users/apolon/Library/Mobile Documents/com~apple~CloudDocs/WorkSpace/keiba-nyumon/`
**GitHubリポジトリ**: https://github.com/apol0510/keiba-nyumon（予定）

**プロジェクトタイプ**: 独立プロジェクト（Phase 2でmonorepo化予定）

---

## 📋 プロジェクト戦略概要

### 目的と位置づけ

**最終目標**: `/WorkSpace/nankan-analytics` の売上アップ

**トラフィック導線**:
```
keiba-nyumon (初心者向け基礎知識)
    ↓
keiba-data (AI/データ予想ガイド) ← Phase 2で作成
    ↓
keiba-review (競馬予想サイト口コミ)
    ↓
nankan-analytics (南関東公営競馬AI予想 - 有料サービス)
```

### keiba-nyumon の役割

- **ターゲット**: 競馬完全初心者（「競馬 始め方」「馬券 買い方」で検索する層）
- **コンテンツ**: 基礎知識、用語解説、馬券の買い方などの入門記事
- **収益化**: 直接収益なし（トラフィック獲得とSEO基盤構築が目的）
- **特徴**: AI生成記事による完全自動運営

---

## 🎯 Phase 1-4 ロードマップ

### Phase 1: keiba-nyumon 立ち上げ（2025年12月〜1月）

#### 目標
- 初心者向け競馬入門サイトとして60記事公開
- ドメイン: keiba-nyumon.jp
- SEO基盤構築（基礎知識系キーワードで上位表示）

#### 実装内容
1. ✅ プロジェクト改名（keiba-guide → keiba-nyumon）
2. ✅ カテゴリ再設計:
   - `kiso` (競馬の基礎知識)
   - `baken` (馬券の買い方)
   - `yougo` (競馬用語集)
   - `nankan` (南関競馬入門)
   - `data` (データ予想入門)
3. [ ] AI記事自動生成スクリプト調整
4. [ ] 60記事生成（各カテゴリ12記事）
5. [ ] Netlifyデプロイ（keiba-nyumon.jp）

#### 記事テンプレート例
- 「【完全初心者向け】競馬の始め方ガイド」
- 「馬券の種類と買い方を初心者にわかりやすく解説」
- 「オッズとは？競馬初心者が知っておくべき基礎知識」
- 「南関東競馬とJRAの違いを徹底比較」
- 「データ予想の基本：初心者が押さえるべき3つのポイント」

---

### Phase 2: Monorepo化 & keiba-data 立ち上げ（2026年1月〜2月）

#### 目標
- keiba-nyumon と keiba-data を統合してmonorepo化
- AI/データ予想ガイドサイトとして60記事公開
- ドメイン: keiba-data.jp

#### Monorepo構成
```
keiba-guide-monorepo/
├── packages/
│   ├── keiba-nyumon/      # 初心者向け入門サイト
│   ├── keiba-data/        # AI/データ予想ガイド
│   └── shared/            # 共通コンポーネント・ユーティリティ
├── scripts/
│   └── generate-ai-news.cjs  # 共通AI記事生成スクリプト
└── package.json
```

#### keiba-data のカテゴリ
- `ai-yosou` (AI予想の基礎)
- `data-bunseki` (データ分析手法)
- `tool` (予想ツール紹介)
- `nankan-data` (南関データ予想)
- `advanced` (上級者向けテクニック)

---

### Phase 3: コンテンツ拡充 & SEO最適化（2026年3月〜5月）

#### keiba-nyumon
- [ ] 記事数を100記事に拡大
- [ ] カテゴリ別ページ実装
- [ ] タグ別ページ実装
- [ ] 内部リンク最適化
- [ ] OGP画像自動生成

#### keiba-data
- [ ] 記事数を100記事に拡大
- [ ] keiba-nyumon からの内部リンク強化
- [ ] keiba-review への導線設置
- [ ] Google Analytics導入

---

### Phase 4: 収益化 & 自動化完成（2026年6月〜）

#### 収益化施策
- [ ] Google AdSense設置（両サイト）
- [ ] アフィリエイトリンク追加（競馬関連サービス）
- [ ] nankan-analytics への誘導強化

#### 自動化
- [ ] GitHub Actions で日次記事生成
- [ ] 自動デプロイパイプライン
- [ ] パフォーマンス監視（Lighthouse CI）

---

## 技術スタック

- **フロントエンド**: Astro 5.x + React
- **スタイリング**: Tailwind CSS 4
- **データベース**: Airtable（Newsテーブル）
- **AI記事生成**: Anthropic Claude API
- **画像**: Unsplash（固定プール、10枚/カテゴリ）
- **ホスティング**: Netlify（完全SSG mode）
- **ポート**: 4322（開発サーバー）
- **分析**: Google Analytics 4（GA4）
- **検索**: Google Search Console（GSC）

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
ARTICLE_COUNT=12 node scripts/generate-ai-news.cjs

# X (Twitter) 自動投稿
npm run post:x
```

---

## 環境変数

```bash
# Airtable（必須）
KEIBA_NYUMON_AIRTABLE_API_KEY=patXXXXXXXXXXXXXXXX
KEIBA_NYUMON_AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV  # keiba-nyumon専用ベース（News）

# フォールバック（開発環境用）
AIRTABLE_API_KEY=patXXXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV

# Claude API（記事生成 - 必須）
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXX

# Google Analytics 4（オプション）
PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX  # GA4測定ID（G-から始まる）

# X (Twitter) 自動投稿（オプション）
X_API_KEY=XXXXXXXXXXXXXXXXXXXXXXX        # X API Consumer Key
X_API_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  # X API Consumer Secret
X_ACCESS_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  # X Access Token
X_ACCESS_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  # X Access Token Secret

# サイト情報
SITE_URL=https://keiba-nyumon.jp
```

**注意**: 環境変数は絶対にドキュメントに平文で記載しないこと。

---

## データベース（Airtable）

### keiba-nyumon専用ベース

- **Base ID**: `appiHsDBAFFSmCiBV`
- **Base名**: 競馬ガイド記事

### Newsテーブル

| フィールド名 | タイプ | 説明 |
|-------------|--------|------|
| Title | Single line text | 記事タイトル |
| Slug | Single line text | URLスラッグ |
| Content | Long text | 記事本文（Markdown） |
| Excerpt | Long text | 記事要約 |
| Category | Single select | カテゴリ（kiso/baken/yougo/nankan/data） |
| Tags | Multiple select | タグ |
| ThumbnailUrl | Single line text | サムネイル画像URL（Unsplash、16:9、1200x675px） |
| Thumbnail | Attachment | サムネイル画像（オプション・廃止予定） |
| Status | Single select | ステータス（published/draft） |
| ViewCount | Number | 閲覧数 |
| IsFeatured | Checkbox | 注目記事フラグ |
| Author | Single line text | 著者名 |
| PublishedAt | Date | 公開日時（ISO 8601形式） |
| TweetID | Single line text | X（Twitter）投稿ID（X自動投稿で使用） |
| TweetedAt | Date | X投稿日時（ISO 8601形式） |
| CreatedAt | Created time | 作成日時 |

**注意**: サムネイル画像は `ThumbnailUrl` (テキストURL) を使用します。Unsplash固定プールから自動選択されます。

---

## ディレクトリ構造

```
keiba-nyumon/
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
│   ├── post-to-x.cjs           # X (Twitter) 自動投稿
│   ├── fix-published-dates.cjs # 既存記事の日付修正
│   └── lib/
│       └── image-generator.cjs # 画像生成ユーティリティ
├── public/
├── CLAUDE.md                   # 本ファイル
├── README.md
├── netlify.toml                # Netlify設定
└── package.json
```

---

## AI記事自動生成

### 実行方法

```bash
# 環境変数を設定して実行（カテゴリ別に12記事ずつ生成）
ARTICLE_COUNT=12 \
ANTHROPIC_API_KEY=xxx \
AIRTABLE_API_KEY=xxx \
AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV \
CATEGORY=kiso \
node scripts/generate-ai-news.cjs
```

### カテゴリ別記事テンプレート

#### 1. 競馬の基礎知識 (kiso)
- 「競馬の始め方完全ガイド」
- 「競馬場の見方・楽しみ方」
- 「レースの種類と格付け（G1/G2/G3）」
- 「騎手と調教師の役割」

#### 2. 馬券の買い方 (baken)
- 「馬券の種類を初心者向けに解説（単勝/複勝/馬連/馬単/ワイド/3連複/3連単）」
- 「オッズの見方と的中率の関係」
- 「馬券購入方法（競馬場/WINS/ネット投票）」
- 「初心者におすすめの馬券戦略」

#### 3. 競馬用語集 (yougo)
- 「競馬用語50選（あ行〜わ行）」
- 「血統用語を初心者向けに解説」
- 「馬場状態の用語（良/稍重/重/不良）」
- 「レース実況でよく聞く用語集」

#### 4. 南関競馬入門 (nankan)
- 「南関東競馬とは？JRAとの違いを解説」
- 「大井競馬場ガイド（アクセス/施設/イベント）」
- 「川崎競馬場ガイド」
- 「船橋競馬場ガイド」
- 「浦和競馬場ガイド」
- 「南関競馬の楽しみ方」

#### 5. データ予想入門 (data)
- 「データ予想とは？初心者が知っておくべき基礎知識」
- 「オッズ分析の基本」
- 「血統データの読み方」
- 「過去データの活用方法」
- 「AI予想サービスの選び方」→ keiba-data への導線

---

## X (Twitter) 自動投稿

### 概要

新規公開されたニュース記事を自動的にX（Twitter）に投稿するスクリプトです。

### 機能

- **自動投稿**: `Status='published'` かつ `TweetID` が空の記事を自動検出
- **画像付き投稿**: サムネイル画像（ThumbnailUrl）を自動ダウンロードして投稿
- **カテゴリ別絵文字**: カテゴリに応じた絵文字を自動選択
  - `kiso` (競馬の基礎知識): 📚
  - `baken` (馬券の買い方): 🎫
  - `yougo` (競馬用語集): 📖
  - `nankan` (南関競馬入門): 🏇
  - `data` (データ予想入門): 📊
- **初心者向けハッシュタグ**: `#競馬初心者 #競馬入門` を自動付与
- **レート制限対応**: 1回の実行で最大3件まで投稿、15秒間隔で投稿
- **Airtable自動更新**: 投稿後、TweetIDとTweetedAtを自動記録

### セットアップ

#### 1. X Developer Portal でアプリ作成

1. https://developer.twitter.com/en/portal/dashboard にアクセス
2. 「Create Project」→「Create App」
3. App権限設定: **Read and Write** （投稿には書き込み権限が必要）
4. 以下の認証情報を取得:
   - API Key (Consumer Key)
   - API Key Secret (Consumer Secret)
   - Access Token
   - Access Token Secret

#### 2. Airtable Newsテーブルにフィールド追加

以下の2つのフィールドを手動で追加してください:

| フィールド名 | タイプ | 説明 |
|-------------|--------|------|
| TweetID | Single line text | X投稿ID（自動投稿スクリプトが記録） |
| TweetedAt | Date | X投稿日時（ISO 8601形式、自動記録） |

#### 3. 環境変数設定

`.env` ファイルに以下を追加:

```bash
# X (Twitter) API認証情報
X_API_KEY=XXXXXXXXXXXXXXXXXXXXXXX
X_API_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
X_ACCESS_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
X_ACCESS_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 実行方法

```bash
# 環境変数を読み込んで実行
npm run post:x

# または直接実行
node scripts/post-to-x.cjs
```

### 動作フロー

1. Airtableから未投稿記事を取得（`Status='published'` かつ `TweetID` が空）
2. 最新3件まで取得（FREE API制限対応）
3. 各記事について:
   - ツイート本文生成（280文字制限、カテゴリ絵文字、ハッシュタグ付き）
   - サムネイル画像をダウンロード
   - 画像をXにアップロード
   - ツイート投稿（画像付き）
   - AirtableにTweetIDとTweetedAtを記録
   - 15秒待機（レート制限対策）

### 注意事項

- **X API制限**: Free版は1日50ツイート、月1500ツイートまで
- **投稿数制限**: 1回の実行で最大3件まで投稿（安全のため）
- **画像形式**: JPG/PNG（Unsplashから取得）
- **文字数制限**: タイトルが長い場合は自動短縮（280文字以内）
- **エラー処理**: 1件失敗しても次の記事の投稿を続行

### GitHub Actions 自動化（推奨）

毎日定期的にX投稿を実行する場合は、GitHub Actionsを設定してください:

``yaml
name: X Auto Post
on:
  schedule:
    - cron: '0 9 * * *'  # 毎日9:00 UTC（日本時間18:00）
  workflow_dispatch:  # 手動実行も可能

jobs:
  post-to-x:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run post:x
        env:
          KEIBA_NYUMON_AIRTABLE_API_KEY: ${{ secrets.KEIBA_NYUMON_AIRTABLE_API_KEY }}
          KEIBA_NYUMON_AIRTABLE_BASE_ID: ${{ secrets.KEIBA_NYUMON_AIRTABLE_BASE_ID }}
          X_API_KEY: ${{ secrets.X_API_KEY }}
          X_API_SECRET: ${{ secrets.X_API_SECRET }}
          X_ACCESS_TOKEN: ${{ secrets.X_ACCESS_TOKEN }}
          X_ACCESS_SECRET: ${{ secrets.X_ACCESS_SECRET }}
          SITE_URL: https://keiba-nyumon.jp
``

**GitHub Secrets設定**:
1. GitHubリポジトリ → Settings → Secrets and variables → Actions
2. 「New repository secret」で以下を追加:
   - `KEIBA_NYUMON_AIRTABLE_API_KEY`
   - `KEIBA_NYUMON_AIRTABLE_BASE_ID`
   - `X_API_KEY`
   - `X_API_SECRET`
   - `X_ACCESS_TOKEN`
   - `X_ACCESS_SECRET`

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
   - **Site name**: keiba-nyumon

### 2. 環境変数設定（Netlify UI）

Netlify Dashboard → Site settings → Environment variables

| Key | Value |
|-----|------|
| `KEIBA_NYUMON_AIRTABLE_API_KEY` | Airtable Personal Access Token |
| `KEIBA_NYUMON_AIRTABLE_BASE_ID` | `appiHsDBAFFSmCiBV` |
| `ANTHROPIC_API_KEY` | Claude APIキー（記事生成用） |
| `PUBLIC_GA4_MEASUREMENT_ID` | GA4測定ID（G-から始まる、オプション） |

### 3. ドメイン設定

1. Netlify Dashboard → Domain settings
2. Custom domains → Add custom domain
3. `keiba-nyumon.jp` を追加
4. DNS設定（お名前.comなど）:
   - Aレコード: `@` → Netlify IPアドレス
   - CNAMEレコード: `www` → `[site-name].netlify.app`

### 4. デプロイ

```bash
# ローカルから手動デプロイ
cd /Users/apolon/Library/Mobile\ Documents/com~apple~CloudDocs/WorkSpace/keiba-nyumon
netlify deploy --prod
```

または、Git push で自動デプロイ。

---

## Google Analytics 4（GA4）とGoogle Search Console（GSC）の設定

### Google Analytics 4（GA4）

#### 1. GA4プロパティの作成

1. https://analytics.google.com/ にアクセス
2. 「管理」→「プロパティを作成」
3. プロパティ名: `keiba-nyumon`
4. タイムゾーン: `日本`
5. 通貨: `日本円（JPY）`
6. データストリーム作成:
   - プラットフォーム: `ウェブ`
   - URL: `https://keiba-nyumon.jp`
   - ストリーム名: `keiba-nyumon Web`
7. 測定ID（G-XXXXXXXXX）をコピー

#### 2. 環境変数の設定

**.envファイル**（ローカル開発）:
```bash
PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXX  # あなたのGA4測定ID
```

**Netlify環境変数**:
1. Netlify Dashboard → Site settings → Environment variables
2. 「Add variable」をクリック
3. Key: `PUBLIC_GA4_MEASUREMENT_ID`
4. Value: `G-XXXXXXXXX`（あなたのGA4測定ID）
5. 「Create variable」

#### 3. デプロイ

環境変数を設定後、再デプロイすると自動的にGA4トラッキングが有効になります。

```bash
netlify deploy --prod
```

または、Git push で自動デプロイ。

#### 4. 動作確認

1. https://keiba-nyumon.jp にアクセス
2. ブラウザの開発者ツール（F12）→ Networkタブ
3. `gtag/js` のリクエストが送信されていることを確認
4. GA4管理画面 → リアルタイムレポート → アクティブユーザー数が1以上

---

### Google Search Console（GSC）

#### 1. プロパティの追加

1. https://search.google.com/search-console にアクセス
2. 「プロパティを追加」をクリック
3. URLプレフィックス: `https://keiba-nyumon.jp`
4. 「続行」

#### 2. サイト所有権の確認

**HTMLタグ方式**（既に設定済み）:

BaseLayout.astro に以下のメタタグが既に追加されています:
```html
<meta name="google-site-verification" content="LJ1qNn3SZFuo5zHjLtI58OZSKKXXeVugmiXG2SPGMe8" />
```

GSC管理画面で「確認」ボタンをクリックすれば完了です。

#### 3. サイトマップの送信

1. GSC → サイトマップ
2. 新しいサイトマップの追加: `https://keiba-nyumon.jp/sitemap.xml`
3. 「送信」

**サイトマップの内容**:
- 静的ページ（トップ、About、規約、プライバシー、お問い合わせ）
- ニュース記事（最大100件、自動生成）

#### 4. 動作確認

1. GSC → カバレッジ
2. 数日後、インデックス登録されたページが表示される
3. サイトマップのステータスが「成功」になることを確認

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
   - `KEIBA_NYUMON_AIRTABLE_API_KEY`
   - `KEIBA_NYUMON_AIRTABLE_BASE_ID`

### 記事の日付が正しく表示されない

1. Airtableの `PublishedAt` フィールドがISO 8601形式（例: `2025-12-26T10:30:00.000Z`）か確認
2. `scripts/fix-published-dates.cjs` を実行して既存記事を修正

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

### 2026-01-07

1. ✅ **トップページ記事表示問題の完全解決（GitHub Actionsループ現象）**
   - **問題**: 記事自動実行後にトップページの記事が0件になる無限ループ現象が数日間続いていた
   - **根本原因の第1段階**: GitHub ActionsのNetlifyデプロイステップで環境変数が設定されていなかった
   - **根本原因の第2段階**: Netlifyの環境変数が「dev context」のみで、production環境に設定されていなかった
   - **修正内容**:
     1. `.github/workflows/daily-ai-article-generation.yml` のデプロイステップに環境変数を追加
     2. netlify-cliによる直接デプロイ → Netlify Build Hook方式に変更（より安全で確実）
     3. **Netlify環境変数をproduction contextに設定**（これが決定的な解決策）
        - `netlify env:set KEIBA_NYUMON_AIRTABLE_API_KEY --context production`
        - `netlify env:set KEIBA_NYUMON_AIRTABLE_BASE_ID --context production`
        - `netlify env:set AIRTABLE_API_KEY --context production`（フォールバック）
        - `netlify env:set AIRTABLE_BASE_ID --context production`（フォールバック）
     4. ローカルでビルド → 98件取得成功
     5. Netlifyに本番デプロイ → 107ページ生成成功
   - **結果**: 本番サイト（https://keiba-nyumon.jp）で記事が正常に表示、ループ現象が完全に解消
   - **commit**: 5eb5545, 5a7370e

2. ✅ **プロジェクト全体の健全性チェックと最適化**
   - **実施内容**:
     - GitHub Actions: すべて成功（問題なし）
     - Airtable: 98件の記事が正常に存在（問題なし）
     - ワークフローの重複を発見: 3つのワークフローが同じ時刻（毎日6:00 JST）に実行
       - `auto-deploy.yml` → archived（重複削除）
       - `trigger-netlify-build.yml` → archived（重複削除）
       - `daily-ai-article-generation.yml` のみで完全自動化を実現
     - セキュリティ脆弱性: `npm audit fix`で0件に修正
   - **commit**: 79f4fc1

### 2026-01-05

1. ✅ **トップページの記事表示問題を根本解決**
   - **問題**: src/config.ts で `import.meta.env` を使って環境変数にアクセスしていたが、Astroでは `PUBLIC_` プレフィックスなしの環境変数は `import.meta.env` でアクセスできない
   - **解決**: `import.meta.env` から `process.env` に変更（src/config.ts:46-51）
   - **結果**: 89件の記事を正しく取得できるようになった
   - **確認**: ビルド成功、HTMLに278個の記事リンク生成

2. ✅ **環境変数読み込みの堅牢化**
   - `dotenv` パッケージをインストール（devDependencies）
   - Astroの自動環境変数読み込みに依存
   - フォールバック機能: `KEIBA_NYUMON_*` → `AIRTABLE_*`

3. ✅ **恒久的な解決確認**
   - ローカル開発: Astroが `.env` から読み込み → `process.env` に設定
   - Netlifyデプロイ: Netlify環境変数 → `process.env` に設定
   - クライアントサイド: `typeof process !== 'undefined'` チェックで安全

4. ✅ **Google Analytics 4（GA4）とGoogle Search Console（GSC）の設定**
   - **GSC**: 既に設定済み（BaseLayout.astroに検証タグあり）
   - **GA4**: トラッキングコードを実装
     - src/config.ts: analytics設定を追加（ga4MeasurementId）
     - src/layouts/BaseLayout.astro: Google タグ（gtag.js）を追加
     - 環境変数: `PUBLIC_GA4_MEASUREMENT_ID`
   - **サイトマップ**: 既に実装済み（src/pages/sitemap.xml.ts）
   - **ドキュメント**: CLAUDE.mdにGA4/GSCの設定手順を詳細に追加

5. ✅ **X (Twitter) 自動投稿機能の実装**
   - **スクリプト作成**: scripts/post-to-x.cjs を実装
     - keiba-matome-monorepoの実装を参考に、keiba-nyumon向けにカスタマイズ
     - カテゴリ別絵文字（📚/🎫/📖/🏇/📊）
     - 初心者向けハッシュタグ（#競馬初心者 #競馬入門）
     - 画像付き投稿（ThumbnailUrlから自動取得）
     - レート制限対応（最大3件/回、15秒間隔）
   - **依存関係**: `twitter-api-v2` をインストール（v1.28.0）
   - **package.json**: `post:x` スクリプトコマンドを追加
   - **Airtableスキーマ**: TweetID（Single line text）、TweetedAt（Date）フィールドを追加
   - **環境変数**: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
   - **ドキュメント**: CLAUDE.mdにX自動投稿の詳細なセットアップ手順、GitHub Actions設定例を追加

### 2025-12-26

1. ✅ **プロジェクト戦略の完全見直し**
   - nankan-analytics の売上アップを最終目標に設定
   - keiba-guide → keiba-nyumon にリネーム（初心者向け入門サイト）
   - Phase 2でmonorepo化 + keiba-data 立ち上げを決定
   - ドメイン取得: keiba-nyumon.jp / keiba-data.jp

2. ✅ **プロジェクト改名実施**
   - フォルダ名: keiba-guide → keiba-nyumon
   - package.json: name, description更新
   - src/config.ts: サイト名、ドメイン、カテゴリ完全刷新
   - CLAUDE.md: 完全書き直し（本ファイル）

3. ✅ **カテゴリ再設計**
   - 旧: nankan/chuo/chihou（予想サイトカテゴリ）
   - 新: kiso/baken/yougo/nankan/data（初心者向け基礎知識）

### 2025-12-25

1. ✅ **記事の日付問題を完全解決**
   - scripts/fix-published-dates.cjs 作成
   - 全63記事にユニークなタイムスタンプを付与
   - クライアントサイドで相対時間表示（「〜時間前」「〜日前」）

2. ✅ **バグ修正**
   - NewsCard.astro: SSG対応のクライアントサイド時間計算
   - BaseLayout.astro: メニューリンク修正（/#news → /）
   - index.astro: 記事表示数を100に拡大

### 2025-12-14

1. ✅ **サムネイル画像システム完成**
   - Unsplash固定プール（10枚/カテゴリ）を実装
   - 決定的ハッシュ関数によるrecordId→画像マッピング
   - 画像重複問題を完全解決（10記事中10種類の画像）

2. ✅ **記事詳細ページ完成**
   - `/news/[slug]/` 動的ルーティング実装
   - サムネイル画像表示（16:9、高速表示最適化）
   - 構造化データ（JSON-LD）でSEO対策
   - パンくずリスト、関連記事表示
   - SNSシェアボタン（Twitter、Facebook、LINE）

---

## 参照ドキュメント

- 本番の口コミサイト: `/Users/apolon/.../Keiba review platform/keiba-review-platform/`
- nankan-analytics: `/Users/apolon/.../WorkSpace/nankan-analytics/`

---

## 現在のプロジェクト構成（2025-12-26時点）

```
/Users/apolon/Library/Mobile Documents/com~apple~CloudDocs/WorkSpace/
├── Keiba review platform/
│   └── keiba-review-platform/    # 本番の口コミサイト（https://keiba-review.jp/）
├── keiba-nyumon/                  # 初心者向け入門サイト（Phase 1）
└── nankan-analytics/              # 南関東公営競馬AI予想（有料サービス）

# Phase 2 以降
keiba-guide-monorepo/             # 予定: keiba-nyumon + keiba-data を統合
├── packages/
│   ├── keiba-nyumon/
│   ├── keiba-data/
│   └── shared/
└── scripts/
```

**スッキリしました！** 戦略が明確になり、実装ロードマップも完成しました。
