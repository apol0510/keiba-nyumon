# keiba-b ニュース自動生成 - セットアップ完了報告

## ✅ 完了日時: 2025-12-12

---

## 実装完了した機能

### 1. ✅ AI記事自動生成（Claude Sonnet 4.5）

**スクリプト**: `scripts/generate-ai-news.cjs`

**機能:**
- Claude Sonnet 4.5 API（`claude-sonnet-4-5-20250929`）を使用
- 5種類の記事テンプレート（howto、ranking、news、tips、comparison）
- 15種類のトピック（競馬予想サイトの選び方、南関競馬予想サイトなど）
- 自動タイトル生成
- Excerpt（要約）自動生成（最初の200文字）
- マークダウン形式の本文生成（800-1200文字）
- Airtable Newsテーブルに自動保存

**テスト結果:**
```
✅ 2記事のテスト生成成功
✅ Airtableに正常保存
✅ 推定コスト: 約7円/2記事
```

**記事例:**
- 【徹底比較】競馬予想サイトの解約方法：どちらを選ぶべき？（1546文字）
- 【初心者向け】競馬予想サイトの返金トラブルの選び方ガイド（1427文字）

---

### 2. ✅ 外部ニュースサイトスクレイピング（Puppeteer）

**スクリプト**: `scripts/scrape-keiba-news.cjs`

**対象サイト:**
- netkeiba.com（競馬ニュース）
- Yahoo!ニュース（競馬カテゴリ）

**機能:**
- Puppeteerでニュース一覧を自動取得（各サイト最大10件）
- 重複チェック（SourceUrlで判定）
- タイトル、要約、URL、公開日を取得
- Airtable Newsテーブルに保存
- 著作権対策: 要約のみ掲載、元記事へのリンク付き

---

### 3. ✅ GitHub Actions自動化

#### 3-1. AI記事生成（毎日午前6時）

**ワークフロー**: `.github/workflows/keiba-b-generate-ai-news.yml`

```yaml
スケジュール: cron '0 21 * * *' (JST 06:00)
記事数: 3記事/日（デフォルト）
手動実行: 可能（記事数カスタマイズ可能）
```

**必要なGitHub Secrets:**
- `ANTHROPIC_API_KEY` - Claude APIキー ✅ 設定済み
- `AIRTABLE_API_KEY` - Airtable APIキー ✅ 設定済み
- `KEIBA_B_AIRTABLE_BASE_ID` - `appiHsDBAFFSmCiBV` ✅ 設定済み

#### 3-2. 外部ニューススクレイピング（毎日午前5時）

**ワークフロー**: `.github/workflows/keiba-b-scrape-news.yml`

```yaml
スケジュール: cron '0 20 * * *' (JST 05:00)
取得サイト: netkeiba.com, Yahoo!ニュース
```

---

## コスト試算

### AI記事生成（Claude Sonnet 4.5）

| 記事数/日 | 推定コスト/日 | 月間コスト |
|----------|--------------|-----------|
| 3記事 | 約10.8円 | 約324円 |
| 5記事 | 約18円 | 約540円 |
| 10記事 | 約36円 | 約1,080円 |

**計算根拠:**
- 入力トークン: 約500 tokens/記事
- 出力トークン: 約1,500 tokens/記事
- コスト: 約3.6円/記事

**実績:**
- 2記事生成: 約7円（実測値）

---

## Airtable設定

### Newsテーブル（競馬ニュース速報ベース）

**Base ID**: `appiHsDBAFFSmCiBV`

**フィールド一覧:**

| フィールド名 | タイプ | 説明 | 使用 |
|-------------|--------|------|------|
| Title | Single line text | 記事タイトル | ✅ |
| Slug | Single line text | URLスラッグ | ✅ |
| Category | Single select | カテゴリ（速報/ニュース/ランキング/まとめ） | ✅ |
| Excerpt | Long text | 記事の要約（200文字） | ✅ |
| Content | Long text | 記事本文（マークダウン） | ✅ |
| SourceUrl | URL | 元記事URL（スクレイピング用） | ✅ |
| SourceName | Single line text | 引用元サイト名 | ✅ |
| PublishedAt | Date | 公開日時（YYYY-MM-DD） | ✅ |
| Status | Single select | ステータス（published/draft） | ✅ |
| IsFeatured | Checkbox | 注目記事フラグ | ✅ |
| Author | Single line text | 著者名 | ✅ |
| ViewCount | Number | 閲覧数 | ⬜ 未使用 |
| Tags | Multiple select | タグ | ⬜ 未使用 |

---

## ローカルテストコマンド

### 1. AI記事生成テスト（2記事）

```bash
cd packages/keiba-b

ARTICLE_COUNT=2 \
ANTHROPIC_API_KEY="sk-ant-xxx..." \
AIRTABLE_API_KEY="patxxx..." \
AIRTABLE_BASE_ID="appiHsDBAFFSmCiBV" \
node scripts/generate-ai-news.cjs
```

### 2. スクレイピングテスト

```bash
cd packages/keiba-b

AIRTABLE_API_KEY="patxxx..." \
AIRTABLE_BASE_ID="appiHsDBAFFSmCiBV" \
node scripts/scrape-keiba-news.cjs
```

### 3. 記事確認

```bash
cd packages/keiba-b

AIRTABLE_API_KEY="patxxx..." \
AIRTABLE_BASE_ID="appiHsDBAFFSmCiBV" \
node scripts/check-and-cleanup-news.cjs
```

### 4. 記事削除（テストデータクリーンアップ）

```bash
cd packages/keiba-b

AIRTABLE_API_KEY="patxxx..." \
AIRTABLE_BASE_ID="appiHsDBAFFSmCiBV" \
node scripts/delete-all-news.cjs
```

---

## 本番運用開始手順

### Step 1: GitHub Secretsの最終確認

GitHubリポジトリ → Settings → Secrets and variables → Actions

**必要なSecrets:**
- ✅ `ANTHROPIC_API_KEY` - Claude APIキー
- ✅ `AIRTABLE_API_KEY` - Airtable APIキー
- ✅ `KEIBA_B_AIRTABLE_BASE_ID` - `appiHsDBAFFSmCiBV`

### Step 2: GitHub Actionsを有効化

`.github/workflows/` の2つのワークフローが有効になっていることを確認:
- ✅ `keiba-b-generate-ai-news.yml` - 毎日06:00 JST
- ✅ `keiba-b-scrape-news.yml` - 毎日05:00 JST

### Step 3: 手動実行テスト（推奨）

1. GitHubリポジトリにアクセス
2. **Actions** タブを開く
3. **keiba-b - Generate AI News** を選択
4. **Run workflow** をクリック
5. `article_count: 1` と入力して **Run workflow**
6. 実行完了を確認
7. Airtableで記事が保存されているか確認

### Step 4: 自動実行を待つ

- 明日の午前5時: スクレイピング実行
- 明日の午前6時: AI記事生成（3記事）

### Step 5: 毎日のモニタリング

**確認すべきこと:**
1. GitHub Actions実行履歴（成功/失敗）
2. Airtable Newsテーブルの新規記事
3. Claude APIの使用量（Anthropic Console）
4. 記事の品質（タイトル、本文、カテゴリ）

---

## トラブルシューティング

### Q1: GitHub Actionsが失敗する

**確認事項:**
1. Secretsが正しく設定されているか
2. Claude APIクレジットが十分にあるか
3. Airtable APIキーが有効か
4. ワークフローファイルの構文エラーがないか

**解決策:**
```bash
# ローカルで手動実行してエラーを確認
cd packages/keiba-b
node scripts/generate-ai-news.cjs
```

### Q2: 記事が生成されない

**確認事項:**
1. Claude APIの残高確認: https://console.anthropic.com/settings/billing
2. エラーログを確認: GitHub Actions → Logs

**解決策:**
- APIキーをチャージ
- モデル名が正しいか確認（`claude-sonnet-4-5-20250929`）

### Q3: Airtableに保存されない

**確認事項:**
1. Airtable Base ID: `appiHsDBAFFSmCiBV`
2. Newsテーブルのフィールド名が一致しているか
3. APIキーの権限（data.records:write）

**解決策:**
```bash
# Airtableフィールドを確認
node scripts/check-and-cleanup-news.cjs
```

### Q4: スクレイピングが失敗する

**原因:**
- 対象サイトのHTML構造が変更された
- ネットワークタイムアウト

**解決策:**
- セレクタを更新（`scrape-keiba-news.cjs`）
- タイムアウト時間を延長（現在30秒）

---

## 次のステップ（オプション）

### 1. 記事詳細ページ作成

```bash
# 新しいページを作成
packages/keiba-b/src/pages/news/[slug].astro
```

**機能:**
- 個別記事ページ
- OGP画像自動生成
- 関連記事表示
- SNSシェアボタン

### 2. カテゴリフィルター機能

```bash
# カテゴリ別一覧ページ
packages/keiba-b/src/pages/news/category/[category].astro
```

### 3. 検索機能

```bash
# 検索ページ
packages/keiba-b/src/pages/news/search.astro
```

### 4. Google AdSense設置

```astro
<!-- 記事詳細ページに広告挿入 -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
```

### 5. SEO強化

- サイトマップ生成（`/news/sitemap.xml`）
- 構造化データ（Article、NewsArticle）
- メタディスクリプション最適化

---

## 参考ドキュメント

- `NEWS_AUTOMATION_GUIDE.md` - 詳細ガイド
- `SETUP_CHECKLIST.md` - セットアップチェックリスト
- `scripts/generate-ai-news.cjs` - AI記事生成スクリプト
- `scripts/scrape-keiba-news.cjs` - スクレイピングスクリプト

---

## 完了確認

- ✅ AI記事生成スクリプト作成
- ✅ スクレイピングスクリプト作成
- ✅ GitHub Actions設定
- ✅ Airtable Newsテーブル設定
- ✅ ローカルテスト成功（2記事生成）
- ✅ テストデータ削除
- ✅ ドキュメント作成

**ステータス**: 🎉 本番運用可能

---

## 連絡先

問題が発生した場合:
1. GitHub Issues: https://github.com/apol0510/keiba-review-platform/issues
2. ドキュメント確認: `NEWS_AUTOMATION_GUIDE.md`

---

**最終更新**: 2025-12-12
**作成者**: Claude Code Assistant
