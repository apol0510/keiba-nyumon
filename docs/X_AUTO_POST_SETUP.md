# X（旧Twitter）自動投稿セットアップガイド

## 📋 概要

keiba-nyumon の新規記事を毎日自動的にX（旧Twitter）に投稿するシステムです。

- **投稿頻度**: 毎日午前9時（JST）
- **投稿件数**: 1回あたり最大3記事（未投稿記事のみ）
- **画像対応**: サムネイル画像を自動添付
- **実装**: GitHub Actions + Node.js + twitter-api-v2

---

## 🛠️ セットアップ手順

### 1. Airtable フィールド追加

Newsテーブルに以下の2フィールドを追加してください：

| フィールド名 | タイプ | 説明 |
|-------------|--------|------|
| `TweetID` | Single line text | 投稿されたツイートのID |
| `TweetedAt` | Date | ツイート日時（ISO 8601形式） |

**追加方法**:
1. Airtable で keiba-nyumon ベース（`appiHsDBAFFSmCiBV`）を開く
2. Newsテーブルを選択
3. 右側の「+」ボタンから「Single line text」フィールドを追加
4. フィールド名を `TweetID` に変更
5. 同様に Date フィールド `TweetedAt` を追加

---

### 2. X API 認証情報の取得

X Developer Portal で API キーを取得してください：

1. https://developer.twitter.com/en/portal/dashboard にアクセス
2. プロジェクトを作成（または既存プロジェクトを選択）
3. "Keys and tokens" から以下を取得:
   - API Key（`X_API_KEY`）
   - API Secret Key（`X_API_SECRET`）
   - Access Token（`X_ACCESS_TOKEN`）
   - Access Token Secret（`X_ACCESS_SECRET`）

**必要な権限**: Read and Write（画像アップロード対応）

---

### 3. GitHub Secrets 設定

GitHubリポジトリに以下のSecretを追加してください：

1. GitHubリポジトリページを開く
2. **Settings** → **Secrets and variables** → **Actions** を選択
3. **New repository secret** をクリック
4. 以下の4つのSecretを追加:

| Secret名 | 値 |
|---------|-----|
| `X_API_KEY` | X API Key |
| `X_API_SECRET` | X API Secret Key |
| `X_ACCESS_TOKEN` | X Access Token |
| `X_ACCESS_SECRET` | X Access Token Secret |

**既存のSecretも確認**:
- `KEIBA_NYUMON_AIRTABLE_API_KEY`
- `KEIBA_NYUMON_AIRTABLE_BASE_ID`

---

### 4. コードをコミット＆プッシュ

```bash
cd /Users/apolon/Library/Mobile\ Documents/com~apple~CloudDocs/WorkSpace/keiba-nyumon

# 変更をコミット
git add .github/workflows/post-to-x.yml package.json package-lock.json docs/
git commit -m "feat: X自動投稿機能を実装（GitHub Actions + twitter-api-v2）

- 毎日午前9時（JST）に未投稿記事を自動ツイート
- 画像付き投稿対応（サムネイル自動添付）
- Airtableに投稿履歴を記録（TweetID/TweetedAt）
- レート制限対応（15秒間隔、最大3件/回）"

# GitHubにプッシュ
git push origin main
```

---

## 🧪 テスト方法

### ローカルテスト（手動実行）

```bash
# 環境変数を設定
export KEIBA_NYUMON_AIRTABLE_API_KEY="patXXXXXXXXXXXXXXXX"
export KEIBA_NYUMON_AIRTABLE_BASE_ID="appiHsDBAFFSmCiBV"
export X_API_KEY="xxxxxxxxxxxxxxxxxxxxx"
export X_API_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export X_ACCESS_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export X_ACCESS_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export SITE_URL="https://keiba-nyumon.jp"

# スクリプト実行
npm run post:x
```

**期待される出力**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐦 X自動投稿スクリプト開始
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 未投稿記事を検索中...
✅ 未投稿記事を3件発見

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 記事 1/3: "【図解で簡単】オッズの見方を3分で解説"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📥 画像をダウンロード中...
✅ 画像ダウンロード完了: 147.5 KB

📤 画像をアップロード中...
✅ 画像アップロード完了 (media_id: 1234567890123456789)

🐦 ツイートを投稿中...
✅ 投稿成功！

   ツイートID: 1234567890123456789
   URL: https://twitter.com/user/status/1234567890123456789

💾 Airtableを更新中...
✅ Airtable更新完了

⏳ 15秒待機中...
...
```

### GitHub Actions テスト（手動トリガー）

1. GitHubリポジトリページを開く
2. **Actions** タブを選択
3. 左側から「Post to X (Twitter)」ワークフローを選択
4. **Run workflow** → **Run workflow** をクリック

**ログ確認方法**:
- 実行中のワークフローをクリック
- "Post to X" ジョブを展開
- 各ステップのログを確認

---

## 📊 動作仕様

### 投稿内容フォーマット

```
[カテゴリ絵文字] [タイトル]

[要約（最大100文字）]

[記事URL]

#競馬 #競馬初心者 [#カテゴリタグ]
```

**カテゴリ別絵文字**:
- 📚 競馬の基礎知識（kiso）
- 🎫 馬券の買い方（baken）
- 📖 競馬用語集（yougo）
- 🏇 南関競馬入門（nankan）
- 📊 データ予想入門（data）

**例**:
```
📚 【完全初心者向け】競馬の始め方ガイド

競馬場の行き方から馬券の買い方まで、初心者が知っておくべき基礎知識を徹底解説！

https://keiba-nyumon.jp/news/hajimekata-guide/

#競馬 #競馬初心者 #競馬の基礎知識
```

### レート制限

- **投稿間隔**: 15秒
- **1回あたりの最大投稿数**: 3記事
- **日次投稿上限**: 3記事/日（午前9時の1回のみ実行）

### エラーハンドリング

- **画像ダウンロード失敗**: テキストのみで投稿
- **ツイート失敗**: 次の記事にスキップ（Airtable更新なし）
- **API制限**: 15秒待機後にリトライ

---

## 🔍 トラブルシューティング

### 問題1: ワークフローが実行されない

**確認事項**:
1. `.github/workflows/post-to-x.yml` がmainブランチにプッシュされているか
2. GitHub Actionsが有効になっているか（Settings → Actions）
3. cron設定が正しいか（`'0 0 * * *'` = 毎日UTC 0:00 = JST 9:00）

**解決策**:
```bash
# GitHub Actionsのステータス確認
gh workflow list
gh run list --workflow=post-to-x.yml
```

---

### 問題2: 「認証エラー」が発生

**エラーメッセージ**:
```
❌ X API認証に失敗しました
Error: Invalid or expired token
```

**確認事項**:
1. GitHub Secretsが正しく設定されているか
2. X API Keyの有効期限が切れていないか
3. Access Tokenの権限が "Read and Write" になっているか

**解決策**:
1. X Developer Portalで新しいトークンを再発行
2. GitHub Secretsを更新
3. ワークフローを手動実行してテスト

---

### 問題3: 「未投稿記事が見つかりません」

**エラーメッセージ**:
```
⚠️ 未投稿記事が見つかりませんでした
```

**原因**:
- すべての記事がすでに投稿済み（`TweetID` フィールドが空でない）
- Airtableに `Status = "published"` の記事が存在しない

**確認方法**:
```bash
# Airtableの記事数を確認
KEIBA_NYUMON_AIRTABLE_API_KEY="xxx" \
KEIBA_NYUMON_AIRTABLE_BASE_ID="appiHsDBAFFSmCiBV" \
node scripts/check-all-articles.cjs
```

**解決策**:
- 新しい記事を生成する
- または、テスト用に既存記事の `TweetID` フィールドを空にする

---

### 問題4: 画像が投稿されない

**エラーメッセージ**:
```
⚠️ 画像なしで投稿します
```

**原因**:
- `ThumbnailUrl` が空または無効
- 画像URLが404エラー
- 画像サイズが5MB超過

**解決策**:
1. Airtableの `ThumbnailUrl` フィールドを確認
2. URLをブラウザで開いて画像が表示されるか確認
3. 必要に応じて画像を差し替え

---

## 📈 運用モニタリング

### GitHub Actions 実行履歴の確認

```bash
# 最新10件の実行履歴を表示
gh run list --workflow=post-to-x.yml --limit 10

# 特定の実行のログを表示
gh run view <run_id> --log
```

### 投稿済み記事の確認

Airtableで以下のフィルタを作成:
```
{TweetID} != ""
```

ソート:
```
TweetedAt (descending)
```

### X投稿の効果測定

- X Analytics: インプレッション、エンゲージメント率
- GA4: `utm_source=twitter` のトラフィック
- Airtable: 投稿後の `ViewCount` 増加

---

## 🔄 今後の拡張案

### Phase 2: 投稿時間の最適化

- 複数回投稿（朝9時、昼12時、夜21時）
- 曜日別の最適時間設定

### Phase 3: エンゲージメント向上

- 人気記事の再投稿（週次/月次）
- アンケート機能の活用
- リプライ自動返信（FAQ）

### Phase 4: マルチアカウント対応

- keiba-nyumon専用アカウント
- nankan-analytics連携投稿

---

## 📚 参考資料

- **Twitter API v2 ドキュメント**: https://developer.twitter.com/en/docs/twitter-api
- **twitter-api-v2 (npm)**: https://www.npmjs.com/package/twitter-api-v2
- **GitHub Actions ドキュメント**: https://docs.github.com/en/actions
- **Airtable API**: https://airtable.com/developers/web/api/introduction

---

## ✅ セットアップ完了チェックリスト

- [ ] Airtableに `TweetID` と `TweetedAt` フィールドを追加
- [ ] X Developer Portal で API キーを取得
- [ ] GitHub Secrets に4つの認証情報を設定
- [ ] コードをコミット＆プッシュ
- [ ] ローカルで手動テスト実行
- [ ] GitHub Actions で手動トリガーテスト
- [ ] 翌日午前9時に自動実行を確認
- [ ] X投稿とAirtable更新を確認

**すべて完了したら運用開始です！** 🎉
