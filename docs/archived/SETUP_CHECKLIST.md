# keiba-b ニュース自動生成 - セットアップチェックリスト

このチェックリストに従って、ニュース自動生成システムを正しくセットアップしてください。

---

## ✅ 1. 依存パッケージのインストール

```bash
cd packages/keiba-b
npm install
```

**確認事項:**
- [ ] `@anthropic-ai/sdk` がインストールされている
- [ ] `puppeteer` がインストールされている
- [ ] `airtable` がインストールされている

---

## ✅ 2. Airtable Newsテーブルの設定

### 2.1 Airtableベースの確認

- [ ] Base ID: `appiHsDBAFFSmCiBV` （競馬ニュース速報ベース）

### 2.2 Newsテーブルのフィールド確認

以下のフィールドが存在することを確認してください：

| フィールド名 | タイプ | 必須 | 説明 |
|-------------|--------|------|------|
| Title | Single line text | ✅ | 記事タイトル |
| Slug | Single line text | ✅ | URLスラッグ |
| Category | Single select | ✅ | カテゴリ（速報/ニュース/ランキング/まとめ/ノウハウ） |
| Excerpt | Long text | ✅ | 記事の要約（200文字程度） |
| Content | Long text | ✅ | 記事本文（マークダウン形式） |
| SourceUrl | URL | ⬜ | 元記事URL（オプション2用） |
| SourceName | Single line text | ⬜ | 引用元サイト名（オプション2用） |
| PublishedAt | Date | ✅ | 公開日時 |
| ViewCount | Number | ⬜ | 閲覧数 |
| Status | Single select | ✅ | ステータス（published/draft） |
| IsFeatured | Checkbox | ⬜ | 注目記事フラグ |
| Tags | Multiple select | ⬜ | タグ |
| Author | Single line text | ⬜ | 著者名 |

**追加が必要なフィールド:**

もし存在しない場合は、Airtableで以下のフィールドを追加してください：

```
SourceUrl (URL)
SourceName (Single line text)
Author (Single line text)
```

---

## ✅ 3. 環境変数の設定

### 3.1 ローカル環境（`.env`）

`packages/keiba-b/.env` ファイルに以下を追加：

```bash
# Airtable設定（既存）
AIRTABLE_API_KEY=patXXXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV

# Claude API設定（新規追加）
ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Anthropic APIキーの取得方法:**
1. https://console.anthropic.com/ にアクセス
2. ログイン
3. 左メニュー → API Keys
4. Create Key

- [ ] `ANTHROPIC_API_KEY` を `.env` に追加済み

### 3.2 GitHub Secrets設定

GitHub Actionsで自動実行するために、以下のSecretsを設定：

1. GitHubリポジトリにアクセス
2. Settings → Secrets and variables → Actions
3. New repository secret

**必要なSecrets:**

- [ ] `AIRTABLE_API_KEY` - Airtable APIキー
- [ ] `KEIBA_B_AIRTABLE_BASE_ID` - `appiHsDBAFFSmCiBV`
- [ ] `ANTHROPIC_API_KEY` - Claude APIキー

---

## ✅ 4. ダミーデータの削除

```bash
cd packages/keiba-b

# 既存のNewsレコードを確認
AIRTABLE_API_KEY=xxx AIRTABLE_BASE_ID=xxx node scripts/check-and-cleanup-news.cjs

# ダミーデータを削除
AIRTABLE_API_KEY=xxx AIRTABLE_BASE_ID=xxx node scripts/delete-all-news.cjs
```

- [ ] Newsテーブルのダミーデータを削除済み

---

## ✅ 5. 動作テスト

### 5.1 AI記事生成のドライラン

```bash
cd packages/keiba-b
node scripts/test-ai-news-dryrun.cjs
```

**期待される出力:**
- 5種類の記事テンプレート表示
- 15種類のトピック表示
- ランダム選択シミュレーション

- [ ] ドライランが成功

### 5.2 AI記事生成（1記事テスト）

```bash
cd packages/keiba-b
ARTICLE_COUNT=1 \
ANTHROPIC_API_KEY=sk-ant-xxx \
AIRTABLE_API_KEY=patxxx \
AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV \
npm run generate:ai
```

**期待される結果:**
- ✅ AI記事生成成功
- ✅ Airtableに1件保存
- ✅ コスト試算表示（約3.6円）

- [ ] AI記事生成が成功
- [ ] Airtableに記事が保存されている

### 5.3 スクレイピング（オプション）

⚠️ **注意**: スクレイピングは著作権の問題があるため、本番実行前に利用規約を確認してください。

```bash
cd packages/keiba-b
AIRTABLE_API_KEY=patxxx \
AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV \
npm run scrape:news
```

- [ ] スクレイピングスクリプトの実行確認（任意）

---

## ✅ 6. GitHub Actionsの設定確認

### 6.1 ワークフローファイルの確認

- [ ] `.github/workflows/keiba-b-scrape-news.yml` が存在
- [ ] `.github/workflows/keiba-b-generate-ai-news.yml` が存在

### 6.2 実行スケジュール

| ワークフロー | 実行時間（JST） | 頻度 |
|-------------|----------------|------|
| scrape-news | 毎日 05:00 | 毎日 |
| generate-ai-news | 毎日 06:00 | 毎日 |

- [ ] GitHub Actionsタブでワークフローが表示されている

### 6.3 手動実行テスト

1. GitHub Actionsタブを開く
2. `keiba-b - Generate AI News` を選択
3. Run workflow → Run workflow（article_count: 1）

- [ ] 手動実行が成功
- [ ] Airtableに記事が保存されている

---

## ✅ 7. 本番運用の準備

### 7.1 記事の確認

生成された記事をAirtableで確認：

- [ ] タイトルが適切
- [ ] カテゴリが正しい
- [ ] 本文の文章が自然
- [ ] SEOキーワードが含まれている

### 7.2 記事数の調整

毎日の記事数を調整する場合は、GitHub Actionsの環境変数を変更：

`.github/workflows/keiba-b-generate-ai-news.yml`

```yaml
env:
  ARTICLE_COUNT: '3'  # ← この数字を変更
```

- [ ] 記事数を調整済み（デフォルト: 3記事/日）

### 7.3 コスト試算

**AI生成（Claude 3.5 Sonnet）:**
- 1記事: 約3.6円
- 毎日3記事: 約10.8円/日
- 月間コスト: 約324円/月

- [ ] コストを確認済み

---

## ✅ 8. 最終チェック

全ての項目をチェックしたら、本番運用を開始できます。

### 最終確認事項

- [ ] 依存パッケージがインストールされている
- [ ] Airtable Newsテーブルのフィールドが揃っている
- [ ] 環境変数が正しく設定されている
- [ ] GitHub Secretsが設定されている
- [ ] ダミーデータが削除されている
- [ ] AI記事生成のテストが成功している
- [ ] GitHub Actionsが正常に動作している
- [ ] 生成された記事の品質を確認している

---

## 🚨 トラブルシューティング

### AI生成エラー: `ANTHROPIC_API_KEY must be set`

```bash
# .envファイルを確認
cat packages/keiba-b/.env | grep ANTHROPIC

# 環境変数を設定
export ANTHROPIC_API_KEY=sk-ant-xxx
```

### Airtable保存エラー: `Invalid permissions`

```bash
# APIキーの権限を確認
# Airtable → Account → Developer Hub → Personal access token
# Scopeに「data.records:write」が含まれているか確認
```

### GitHub Actions失敗: `secrets not found`

```bash
# GitHub Secretsを確認
# Settings → Secrets and variables → Actions
# AIRTABLE_API_KEY, KEIBA_B_AIRTABLE_BASE_ID, ANTHROPIC_API_KEY
```

---

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. `NEWS_AUTOMATION_GUIDE.md` の詳細ガイド
2. GitHub Actionsのログ
3. Airtableのデータ確認

それでも解決しない場合は、issueを作成してください。
