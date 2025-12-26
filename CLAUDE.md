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
```

---

## 環境変数

```bash
# Airtable（必須）
KEIBA_GUIDE_AIRTABLE_API_KEY=patXXXXXXXXXXXXXXXX
KEIBA_GUIDE_AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV  # keiba-nyumon専用ベース（News）

# フォールバック（開発環境用）
AIRTABLE_API_KEY=patXXXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV

# Claude API（記事生成 - 必須）
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXX

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
| `KEIBA_GUIDE_AIRTABLE_API_KEY` | Airtable Personal Access Token |
| `KEIBA_GUIDE_AIRTABLE_BASE_ID` | `appiHsDBAFFSmCiBV` |
| `ANTHROPIC_API_KEY` | Claude APIキー（記事生成用） |

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
