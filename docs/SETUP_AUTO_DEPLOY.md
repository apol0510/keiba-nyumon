# 自動デプロイ設定ガイド

## 概要

このガイドでは、Airtableに記事が追加されたときに自動的にNetlifyへデプロイする設定方法を説明します。

## 前提条件

- ✅ GitHubリポジトリ: https://github.com/apol0510/keiba-nyumon
- ✅ Netlifyサイト: https://keiba-nyumon.netlify.app
- ✅ Netlify Site ID: `30e1afb9-f0ff-447d-9e93-c955904f6a7d`

## 設定手順

### 1. Netlify Personal Access Tokenを生成

1. **Netlifyにログイン**
   - https://app.netlify.com/ にアクセス

2. **User Settings → Applications → Personal Access Tokens**
   - または直接: https://app.netlify.com/user/applications#personal-access-tokens

3. **"New access token"をクリック**
   - Description: `GitHub Actions - keiba-nyumon`
   - Expiration: `No expiration`（または任意の期間）

4. **トークンをコピー**
   - 生成されたトークンをコピー（後で使用するため保存）
   - 例: `nfp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### 2. GitHub Secretsに設定

ターミナルで以下のコマンドを実行：

```bash
cd "/Users/apolon/Library/Mobile Documents/com~apple~CloudDocs/WorkSpace/keiba-nyumon"

# NETLIFY_AUTH_TOKENを設定（YOUR_TOKEN_HEREを実際のトークンに置き換え）
gh secret set NETLIFY_AUTH_TOKEN --body "YOUR_TOKEN_HERE"

# 設定を確認
gh secret list
```

または、GitHubのUIで設定：

1. https://github.com/apol0510/keiba-nyumon/settings/secrets/actions にアクセス
2. **"New repository secret"**をクリック
3. Name: `NETLIFY_AUTH_TOKEN`
4. Secret: コピーしたNetlifyトークンを貼り付け
5. **"Add secret"**をクリック

### 3. GitHub Secretsの最終確認

以下のシークレットがすべて設定されているか確認：

- ✅ `KEIBA_NYUMON_AIRTABLE_API_KEY`
- ✅ `KEIBA_NYUMON_AIRTABLE_BASE_ID`
- ✅ `AIRTABLE_API_KEY` (フォールバック用)
- ✅ `AIRTABLE_BASE_ID` (フォールバック用)
- ✅ `ANTHROPIC_API_KEY`
- ✅ `NETLIFY_SITE_ID` (既に設定済み)
- ⚠️  `NETLIFY_AUTH_TOKEN` (手動設定が必要)

確認コマンド：

```bash
gh secret list
```

## 自動デプロイの仕組み

### ワークフロー1: 日次AI記事生成 + デプロイ

**ファイル**: `.github/workflows/daily-ai-article-generation.yml`

**トリガー**:
- 毎日AM6時（JST）に自動実行
- 手動トリガーも可能

**処理内容**:
1. AI記事を3件生成（Anthropic Claude API使用）
2. Airtableに記事を保存
3. Netlifyに自動デプロイ

### ワークフロー2: 自動デプロイ

**ファイル**: `.github/workflows/auto-deploy.yml`

**トリガー**:
- 毎日AM6時（JST）に自動実行
- 手動トリガーも可能

**処理内容**:
1. Airtableから最新記事を取得
2. サイトをビルド（Astro SSG）
3. Netlifyにデプロイ

## 手動トリガー方法

### GitHub UIから

1. https://github.com/apol0510/keiba-nyumon/actions にアクセス
2. 左側から実行したいワークフローを選択
   - `Daily AI Article Generation` - AI記事生成 + デプロイ
   - `Auto Deploy to Netlify` - デプロイのみ
3. **"Run workflow"**をクリック
4. ブランチを選択（通常は`main`）
5. **"Run workflow"**をクリック

### コマンドラインから

```bash
# 自動デプロイのみ実行
gh workflow run auto-deploy.yml

# AI記事生成 + デプロイを実行
gh workflow run daily-ai-article-generation.yml

# 実行状況を確認
gh run list
```

## トラブルシューティング

### デプロイが失敗する場合

1. **GitHub Actionsログを確認**
   ```bash
   gh run list
   gh run view [RUN_ID] --log
   ```

2. **環境変数を確認**
   ```bash
   gh secret list
   ```

3. **Netlifyの状態を確認**
   ```bash
   netlify status
   ```

### よくあるエラー

#### `NETLIFY_AUTH_TOKEN is not set`

→ GitHub Secretsに`NETLIFY_AUTH_TOKEN`を設定してください（上記手順を参照）

#### `Failed to fetch from Airtable`

→ Airtableの環境変数を確認してください：
- `KEIBA_NYUMON_AIRTABLE_API_KEY`
- `KEIBA_NYUMON_AIRTABLE_BASE_ID`

#### `Build failed`

→ ローカルでビルドをテスト：
```bash
npx -y dotenv-cli npm run build
```

## 次のステップ

1. **NETLIFY_AUTH_TOKENを設定**（上記手順を参照）
2. **手動トリガーでテスト実行**
   ```bash
   gh workflow run auto-deploy.yml
   ```
3. **実行結果を確認**
   ```bash
   gh run list
   gh run view [RUN_ID] --log
   ```
4. **本番サイトを確認**
   - https://keiba-nyumon.netlify.app/

## 完了！

設定が完了すると、以下のように自動化されます：

- 📅 **毎日AM6時（JST）**: AI記事が自動生成 → Airtableに保存 → Netlifyに自動デプロイ
- 🚀 **手動トリガー**: いつでもGitHub Actionsから手動デプロイ可能
- ✅ **記事追加時**: Airtableに記事を追加 → ワークフローを手動実行 → 自動デプロイ

---

**サポート**

問題が発生した場合は、GitHub Issuesまたはログを確認してください：
- GitHub Actions: https://github.com/apol0510/keiba-nyumon/actions
- Netlify Deploy Logs: https://app.netlify.com/projects/keiba-nyumon/deploys
