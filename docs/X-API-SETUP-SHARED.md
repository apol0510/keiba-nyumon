# keiba-nyumon用 X API設定手順（既存Freeプランアカウント共有）

## 前提条件

- keiba-review-monorepoで使用している既存のX Developerアカウントがある
- そのアカウントはFreeプラン（月500投稿無料）が適用されている

## 手順

### 1. X Developer Portalにログイン

https://developer.x.com/en/portal/dashboard

**重要：** keiba-review-monorepoで使用しているX/Twitterアカウントでログイン

### 2. 新しいAppを作成

1. ダッシュボードで「+ Add App」または「Create App」をクリック
2. App名を入力（例：`keiba-nyumon-app`）
3. Environment: `Production` を選択
4. 「Create」をクリック

### 3. API KeysとTokensを取得

#### 3-1. API Key & Secret（Consumer Keys）

1. App詳細ページで「Keys and tokens」タブを開く
2. 「API Key and Secret」セクションで「Regenerate」をクリック
3. **API Key**と**API Secret**をコピー（一度しか表示されない）

#### 3-2. Access Token & Secret

1. 同じページの「Authentication Tokens」セクション
2. 「Generate」をクリック
3. **Access Token**と**Access Token Secret**をコピー

#### 3-3. App Permissions確認

1. 「Settings」タブを開く
2. 「App permissions」で **Read and Write** が選択されているか確認
3. もし違う場合は変更して「Save」

### 4. GitHub Secretsを設定

#### 4-1. 既存Secretsを削除（クレジット枯渇したアカウント）

```bash
cd /Users/apolon/Library/Mobile\ Documents/com~apple~CloudDocs/WorkSpace/keiba-nyumon

gh secret delete X_API_KEY
gh secret delete X_API_SECRET
gh secret delete X_ACCESS_TOKEN
gh secret delete X_ACCESS_SECRET
```

#### 4-2. 新しいSecretsを設定

```bash
# API Key（手順3-1でコピーしたもの）
gh secret set X_API_KEY
# → プロンプトが表示されたら、API Keyを貼り付けてEnter

# API Secret
gh secret set X_API_SECRET
# → API Secretを貼り付けてEnter

# Access Token（手順3-2でコピーしたもの）
gh secret set X_ACCESS_TOKEN
# → Access Tokenを貼り付けてEnter

# Access Token Secret
gh secret set X_ACCESS_SECRET
# → Access Token Secretを貼り付けてEnter
```

#### 4-3. 設定確認

```bash
gh secret list | grep "^X_"
```

以下のように表示されればOK：
```
X_ACCESS_SECRET	2026-01-17T...
X_ACCESS_TOKEN	2026-01-17T...
X_API_KEY	2026-01-17T...
X_API_SECRET	2026-01-17T...
```

### 5. テスト実行

```bash
# 手動ワークフロー実行
gh workflow run "Post to X (Twitter)"

# 実行状況確認
gh run watch
```

成功すれば、以下のようなログが表示されます：
```
✅ Xに投稿しました: https://twitter.com/user/status/...
✅ Airtableを更新しました
✅ keiba-nyumon X自動投稿スクリプト完了
```

## 投稿制限管理

### 月間投稿数の計算

**Freeプラン制限：月500投稿**

- keiba-review-all: 1日2回 × 2件 = 4ツイート/日
- nankan-review: 1日2回 × 2件 = 4ツイート/日
- **keiba-nyumon: 1日1回 × 3件 = 3ツイート/日（予定）**

**合計：** 11ツイート/日 × 30日 = **330ツイート/月** ✅ 制限内

### 投稿頻度の調整

もし500ツイートを超えそうな場合、以下のいずれかを調整：

1. **keiba-nyumonの投稿頻度を下げる**
   - `.github/workflows/post-to-x.yml`のcronを変更
   - 例：毎日 → 2日に1回

2. **MAX_POSTS_PER_RUNを減らす**
   - `scripts/post-to-x.cjs`の`MAX_POSTS_PER_RUN`を3 → 2に変更

3. **スケジュール実行を週1回に変更**
   - cronを`0 0 * * 1`（毎週月曜）に変更

## トラブルシューティング

### エラー: 402 CreditsDepleted

- **原因：** 古いアカウント（クレジット枯渇）のSecretsが残っている
- **解決：** 手順4を再確認、Secretsが正しく更新されているか確認

### エラー: 401 Unauthorized

- **原因：** API KeyまたはTokenが間違っている
- **解決：** 手順3でコピーしたキーを再確認、手順4を再実行

### エラー: 403 Forbidden

- **原因：** App Permissionsが「Read only」になっている
- **解決：** 手順3-3で「Read and Write」に変更

## 注意事項

- ✅ 既存のkeiba-review-monorepoのX投稿には**影響なし**（別Appだから）
- ✅ 同じアカウント内で複数のAppを作成可能
- ⚠️ 月500投稿の制限は**アカウント全体**で共有
- ⚠️ API Keyは一度しか表示されないため、必ずコピーして保管
