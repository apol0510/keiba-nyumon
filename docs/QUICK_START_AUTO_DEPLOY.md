# 自動デプロイ - 5分クイックセットアップ

## 最も簡単な方法（推奨）

Netlify Build Hookを使用すれば、**たった2ステップ**で自動デプロイが設定できます。

### ステップ1: Netlify Build Hookを作成

1. **Netlifyにアクセス**
   - https://app.netlify.com/projects/keiba-nyumon/settings/deploys にアクセス

2. **Build hooksセクションまでスクロール**
   - 「Add build hook」をクリック

3. **Build hookを作成**
   - **Build hook name**: `GitHub Actions Auto Deploy`
   - **Branch to build**: `main`
   - 「Save」をクリック

4. **URLをコピー**
   - 生成されたURLをコピー
   - 例: `https://api.netlify.com/build_hooks/6xxxxxxxxxxxxxxxxx`

### ステップ2: GitHub Secretに設定

ターミナルで以下を実行（URLを置き換えて実行）：

```bash
cd "/Users/apolon/Library/Mobile Documents/com~apple~CloudDocs/WorkSpace/keiba-nyumon"

# NETLIFY_BUILD_HOOK_URLを設定（YOUR_URLを実際のURLに置き換え）
gh secret set NETLIFY_BUILD_HOOK_URL --body "YOUR_URL_HERE"

# 確認
gh secret list | grep NETLIFY
```

### 完了！

これで自動デプロイが設定されました。

## 動作確認

### 手動でテスト実行

```bash
# ワークフローを手動実行
gh workflow run trigger-netlify-build.yml

# 実行状況を確認
gh run list --workflow=trigger-netlify-build.yml

# 詳細ログを確認
gh run view --log
```

または、GitHub UIから：
1. https://github.com/apol0510/keiba-nyumon/actions/workflows/trigger-netlify-build.yml
2. 「Run workflow」をクリック
3. 「Run workflow」をクリック

### デプロイ状況を確認

1. **GitHub Actions**
   - https://github.com/apol0510/keiba-nyumon/actions

2. **Netlify Deploys**
   - https://app.netlify.com/projects/keiba-nyumon/deploys

3. **本番サイト**
   - https://keiba-nyumon.netlify.app/

## 自動実行スケジュール

設定完了後、以下のスケジュールで自動実行されます：

- 📅 **毎日AM6時（JST）**: Netlifyビルドを自動トリガー
- 🔄 **手動トリガー**: いつでもGitHub Actionsから実行可能

## トラブルシューティング

### ビルドが実行されない

1. GitHub Secretsを確認：
   ```bash
   gh secret list | grep NETLIFY
   ```

2. NETLIFY_BUILD_HOOK_URLが設定されているか確認

3. ワークフローのログを確認：
   ```bash
   gh run list
   gh run view [RUN_ID] --log
   ```

### Build Hookが見つからない

- Netlifyダッシュボードで再確認：
  https://app.netlify.com/projects/keiba-nyumon/settings/deploys#build-hooks

### URLが間違っている

- URLは`https://api.netlify.com/build_hooks/`で始まる必要があります
- 正しいURLをコピーして再設定：
  ```bash
  gh secret set NETLIFY_BUILD_HOOK_URL --body "正しいURL"
  ```

## 次のステップ（オプション）

### AI記事の自動生成も有効化

既存の`daily-ai-article-generation.yml`ワークフローを使えば、AI記事の生成 + 自動デプロイも可能です。

詳しくは `SETUP_AUTO_DEPLOY.md` を参照してください。

---

## まとめ

✅ **設定完了後の動作**:

1. 毎日AM6時に自動ビルド＆デプロイ
2. Airtableに記事を追加
3. 数分待つだけで本番サイトに反映

🎉 **これで完了です！**

**次回からは、Airtableに記事を追加するだけで、自動的にサイトに反映されます。**
