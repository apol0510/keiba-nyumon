# ニュース自動生成システム - セットアップガイド

keiba-bサイトのニュース記事を自動生成する3つのシステムのセットアップ手順です。

---

## 📋 システム概要

| オプション | 説明 | 記事数/日 | コスト | メリット | デメリット |
|-----------|------|----------|--------|---------|----------|
| **オプション2** | 外部ニュースサイトからスクレイピング | 10-20件 | 無料 | 最新情報、信頼性高 | 著作権リスク、サイト構造変更リスク |
| **オプション3** | Claude APIでAI記事生成 | 3-5件 | 約10円/日 | 完全オリジナル、無限バリエーション | API費用、事実確認必要 |

---

## 🚀 セットアップ手順

### 1. 依存パッケージのインストール

```bash
cd packages/keiba-b
npm install
```

必要なパッケージ:
- `@anthropic-ai/sdk` - Claude API（オプション3用）
- `puppeteer` - ブラウザ自動化（オプション2用）
- `airtable` - データベース

---

### 2. 環境変数の設定

#### ローカル環境（`.env`）

`packages/keiba-b/.env`ファイルを作成:

```bash
# Airtable設定（必須）
AIRTABLE_API_KEY=patXXXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV

# Claude API設定（オプション3用）
ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### GitHub Secrets設定

GitHub Actionsで自動実行するために、以下のSecretsを設定します。

1. GitHubリポジトリにアクセス
2. Settings → Secrets and variables → Actions → New repository secret

**必要なSecrets:**

| Secret名 | 説明 | 取得方法 |
|----------|------|---------|
| `AIRTABLE_API_KEY` | Airtable APIキー | [Airtable](https://airtable.com/account) → Developer Hub → Personal access token |
| `KEIBA_B_AIRTABLE_BASE_ID` | keiba-b用のBase ID | `appiHsDBAFFSmCiBV` |
| `ANTHROPIC_API_KEY` | Claude APIキー | [Anthropic Console](https://console.anthropic.com/) → API Keys |

---

### 3. Airtable Newsテーブルの設定

keiba-b用のAirtableベース（`appiHsDBAFFSmCiBV`）に以下のフィールドを追加:

#### Newsテーブル

| フィールド名 | タイプ | 説明 |
|-------------|--------|------|
| Title | Single line text | 記事タイトル |
| Slug | Single line text | URLスラッグ |
| Category | Single select | カテゴリ（速報/ニュース/ランキング/まとめ/ノウハウ） |
| Excerpt | Long text | 記事の要約（200文字程度） |
| Content | Long text | 記事本文（マークダウン形式） |
| SourceUrl | URL | 元記事URL（オプション2用） |
| SourceName | Single line text | 引用元サイト名（オプション2用） |
| PublishedAt | Date | 公開日時 |
| ViewCount | Number | 閲覧数 |
| Status | Single select | ステータス（published/draft） |
| IsFeatured | Checkbox | 注目記事フラグ |
| Tags | Multiple select | タグ |
| Author | Single line text | 著者名 |

---

## 📝 使い方

### オプション2: スクレイピング実行

```bash
cd packages/keiba-b

# 環境変数を設定して実行
AIRTABLE_API_KEY=xxx AIRTABLE_BASE_ID=xxx npm run scrape:news
```

**実行結果:**
- netkeiba.comから最大10件
- Yahoo!ニュースから最大10件
- 合計最大20件の記事を取得・保存

**GitHub Actions自動実行:**
- 毎日午前5時（JST）に自動実行
- `.github/workflows/keiba-b-scrape-news.yml`

---

### オプション3: AI記事生成

```bash
cd packages/keiba-b

# デフォルト（3記事）
ANTHROPIC_API_KEY=xxx AIRTABLE_API_KEY=xxx AIRTABLE_BASE_ID=xxx npm run generate:ai

# 記事数を指定（例: 5記事）
ARTICLE_COUNT=5 ANTHROPIC_API_KEY=xxx AIRTABLE_API_KEY=xxx AIRTABLE_BASE_ID=xxx npm run generate:ai
```

**実行結果:**
- 指定した数のAI記事を生成
- コスト: 約3.6円/記事（Claude 3.5 Sonnet）

**記事テンプレート:**
1. **ノウハウ系**: 「【初心者向け】競馬予想サイトの選び方ガイド」
2. **ランキング系**: 「【2025年版】南関競馬予想サイトおすすめランキングTOP5」
3. **速報系**: 「【速報】悪質な競馬予想サイトに関する最新情報」
4. **コツ系**: 「【必読】競馬予想サイトで成功するための5つのコツ」
5. **比較系**: 「【徹底比較】無料予想と有料予想：どちらを選ぶべき？」

**GitHub Actions自動実行:**
- 毎日午前6時（JST）に3記事自動生成
- `.github/workflows/keiba-b-generate-ai-news.yml`

---

## 🔧 トラブルシューティング

### スクレイピングエラー

**問題**: netkeiba.comやYahoo!ニュースからデータが取得できない

**原因**:
- サイトの構造が変更された
- ネットワークエラー

**解決策**:
1. `scripts/scrape-keiba-news.cjs`のセレクタを確認
2. 手動でサイトにアクセスし、HTML構造を確認
3. セレクタを修正

---

### AI生成エラー

**問題**: `ANTHROPIC_API_KEY is not set`

**解決策**:
```bash
# APIキーを取得
# https://console.anthropic.com/
export ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**問題**: Rate limit exceeded

**解決策**:
- Claude APIのレート制限は1分あたり50リクエスト
- スクリプトは2秒待機を入れているため、問題ないはず
- 同時に複数のスクリプトを実行しない

---

### Airtable保存エラー

**問題**: `Invalid permissions`

**解決策**:
1. Airtable APIキーの権限を確認
2. Base IDが正しいか確認
3. Newsテーブルが存在するか確認

---

## 💰 コスト試算

### オプション2（スクレイピング）
- **無料**
- サーバーコスト: GitHub Actions無料枠内（月2,000分）

### オプション3（AI生成）

**Claude 3.5 Sonnet料金:**
- 入力: $3 / 1M tokens
- 出力: $15 / 1M tokens

**1記事あたりのコスト:**
- 入力トークン: 約500 tokens → $0.0015
- 出力トークン: 約1500 tokens → $0.0225
- **合計: 約$0.024/記事（約3.6円）**

**月間コスト（毎日3記事）:**
- 3記事/日 × 30日 = 90記事/月
- 90記事 × 3.6円 = **約324円/月**

---

## 📊 推奨運用スケジュール

### 平日
- **5:00 AM** - スクレイピング（最新ニュース）
- **6:00 AM** - AI記事生成（3記事）

### 週末
- **5:00 AM** - スクレイピング（最新ニュース）
- **6:00 AM** - AI記事生成（5記事）← 記事数を増やす

---

## 🎯 次のステップ

1. **記事の質を向上**
   - AIプロンプトを最適化
   - トピックリストを拡充

2. **スクレイピング対象を追加**
   - 他の競馬ニュースサイトを追加
   - RSS フィード対応

3. **自動デプロイ連携**
   - 記事投稿後にNetlifyを自動デプロイ
   - Webhookで連携

4. **記事の分析**
   - 閲覧数の高い記事を分析
   - 人気トピックを特定

---

## 📞 サポート

問題が発生した場合は、以下を確認してください:
1. GitHub Actions のログ
2. ローカルでのテスト実行
3. Airtableのデータ確認

それでも解決しない場合は、issueを作成してください。
