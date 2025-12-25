# keiba-b ニュース自動生成システム

## 📖 概要

keiba-bサイト向けのニュース記事を自動生成するシステムです。

### 2つの生成方法

1. **オプション2: 外部スクレイピング**
   - netkeiba.com、Yahoo!ニュースから最新ニュースを取得
   - 著作権に配慮し、要約＋リンク形式で投稿

2. **オプション3: AI記事生成**
   - Claude APIでオリジナル記事を自動生成
   - 初心者向けガイド、ランキング、速報など5種類のテンプレート

3. **統合実行（推奨）**
   - スクレイピング＋AI生成を組み合わせて実行
   - スクレイピングした最新ニュースを参考にAI記事を生成

---

## 🚀 使い方

### 1. 必要な環境変数

```bash
# Anthropic Claude API（AI生成に必須）
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXX

# Airtable（必須）
KEIBA_B_AIRTABLE_API_KEY=patXXXXXXXXXXXXXXXX
KEIBA_B_AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV

# オプション
ARTICLE_COUNT=3  # AI生成する記事数（デフォルト: 3）
MODE=both        # 実行モード（both/scrape/ai、デフォルト: both）
```

### 2. ローカル実行

#### 統合実行（推奨）

```bash
cd packages/keiba-b

# 両方実行（スクレイピング＋AI生成）
ANTHROPIC_API_KEY=xxx \
KEIBA_B_AIRTABLE_API_KEY=xxx \
KEIBA_B_AIRTABLE_BASE_ID=xxx \
ARTICLE_COUNT=3 \
node scripts/daily-news-generation.cjs
```

#### スクレイピングのみ

```bash
MODE=scrape \
KEIBA_B_AIRTABLE_API_KEY=xxx \
KEIBA_B_AIRTABLE_BASE_ID=xxx \
node scripts/daily-news-generation.cjs
```

#### AI生成のみ

```bash
MODE=ai \
ANTHROPIC_API_KEY=xxx \
KEIBA_B_AIRTABLE_API_KEY=xxx \
KEIBA_B_AIRTABLE_BASE_ID=xxx \
ARTICLE_COUNT=5 \
node scripts/daily-news-generation.cjs
```

#### ドライラン（テスト実行）

```bash
# AI記事生成のテスト（Airtableに保存しない）
ANTHROPIC_API_KEY=xxx \
node scripts/test-daily-news-dryrun.cjs
```

### 3. GitHub Actionsで自動実行

#### 自動スケジュール

- **実行時刻**: 毎日 AM 5:00 JST（UTC 20:00）
- **ワークフロー**: `.github/workflows/keiba-b-daily-news.yml`
- **自動実行内容**: スクレイピング＋AI生成（3記事）

#### 手動実行

GitHub Actionsの画面から手動実行可能：

1. リポジトリの「Actions」タブを開く
2. 「keiba-b - Daily News Generation」を選択
3. 「Run workflow」をクリック
4. パラメータを設定:
   - **mode**: `both`（スクレイピング＋AI）/ `scrape`（スクレイピングのみ）/ `ai`（AI生成のみ）
   - **article_count**: 生成する記事数（例: `5`）
5. 「Run workflow」を実行

---

## 📂 スクリプト一覧

| ファイル名 | 説明 |
|-----------|------|
| `daily-news-generation.cjs` | **統合実行スクリプト**（推奨）<br>スクレイピング＋AI生成を組み合わせて実行 |
| `scrape-keiba-news.cjs` | スクレイピング専用スクリプト<br>外部サイトから最新ニュースを取得してAirtableに保存 |
| `generate-ai-news.cjs` | AI生成専用スクリプト<br>Claude APIでオリジナル記事を生成してAirtableに保存 |
| `test-daily-news-dryrun.cjs` | ドライラン（テスト実行）<br>AI記事生成のテスト。Airtableに保存せず内容を確認 |

---

## 🎯 AI記事テンプレート

### 1. 初心者向けガイド（howto）

**タイトル例**: 【初心者向け】競馬予想サイトの選び方ガイド

**構成**:
- 導入（100文字）
- ポイント3選（各200文字）
- 注意点（200文字）
- まとめ（100-200文字）

### 2. ランキング記事（ranking）

**タイトル例**: 【2025年版】中央競馬予想サイトおすすめランキングTOP5

**構成**:
- 導入（100文字）
- 1位〜5位（各150文字）
- まとめ（100-200文字）

### 3. 速報ニュース（news）

**タイトル例**: 【速報】競馬予想サイトの最新トレンドに関する情報

**構成**:
- 概要（100文字）
- 詳細（400-600文字）
- 影響・まとめ（100-200文字）

### 4. ノウハウ記事（tips）

**タイトル例**: 【必読】競馬予想サイトで成功するための5つのコツ

**構成**:
- 導入（100文字）
- コツ5選（各150文字）
- まとめ（100-200文字）

### 5. 比較記事（comparison）

**タイトル例**: 【徹底比較】無料予想 vs 有料予想：どちらを選ぶべき？

**構成**:
- 導入（100文字）
- 比較詳細（600-800文字）
- 判断基準とまとめ（100-300文字）

---

## 🔐 セキュリティ

### APIキー管理

#### ローカル開発

```bash
# .envファイル（gitignore対象）
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXX
KEIBA_B_AIRTABLE_API_KEY=patXXXXXXXXXXXXXXXX
KEIBA_B_AIRTABLE_BASE_ID=appiHsDBAFFSmCiBV
```

#### GitHub Actions

GitHubリポジトリの Settings → Secrets and variables → Actions で設定：

- `ANTHROPIC_API_KEY`
- `KEIBA_B_AIRTABLE_API_KEY`
- `KEIBA_B_AIRTABLE_BASE_ID`

### APIキー漏洩時の対処

1. **即座に無効化**
   - Anthropic Console: https://console.anthropic.com/
   - Airtable Account: https://airtable.com/account

2. **新しいキーを発行**

3. **GitHub Secretsを更新**

4. **ローカルの.envファイルを更新**

---

## 💰 コスト試算

### Claude API（Sonnet 4.5）料金

- **入力**: $3 / 1M tokens
- **出力**: $15 / 1M tokens

### 1記事あたりのコスト

- 入力トークン: 約500 tokens（$0.0015）
- 出力トークン: 約1500 tokens（$0.0225）
- **合計**: 約 $0.024（約3.6円）

### 月間コスト試算

| 生成数/日 | 記事数/月 | 月間コスト（USD） | 月間コスト（JPY） |
|----------|----------|-----------------|-----------------|
| 3記事 | 90記事 | $2.16 | 約324円 |
| 5記事 | 150記事 | $3.60 | 約540円 |
| 10記事 | 300記事 | $7.20 | 約1,080円 |

**※ 1ドル=150円で計算**

---

## 🐛 トラブルシューティング

### エラー: `401 authentication_error`

**原因**: Claude API キーが無効

**解決策**:
1. Anthropic Consoleで新しいAPIキーを発行
2. 環境変数またはGitHub Secretsを更新

### エラー: `Airtable API error`

**原因**: Airtable認証情報が無効またはBase IDが間違っている

**解決策**:
1. Airtable Personal Access Tokenを再発行
2. Base IDが `appiHsDBAFFSmCiBV` であることを確認
3. 環境変数を再設定

### スクレイピングが失敗する

**原因**: 外部サイトのHTML構造が変更された

**解決策**:
1. `MODE=ai` でAI生成のみ実行
2. スクレイピングスクリプトのセレクタを修正

### 記事が重複する

**原因**: 重複チェック機能の不具合

**解決策**:
- スクレイピング記事は `SourceUrl` で重複チェック
- AI生成記事は重複する可能性あり（ランダムなので低確率）

---

## 📊 実行ログの確認

### GitHub Actions

1. リポジトリの「Actions」タブ
2. 該当のワークフロー実行を選択
3. 「generate-news」ジョブのログを確認

### ローカル

標準出力に以下の情報が表示されます：

```
🚀 毎日のニュース自動生成を開始します

📊 実行モード: both
🗄️  Airtable Base: appiHsDBAFFSmCiBV

🔍 オプション2: 外部ニュースサイトからスクレイピング

📰 netkeiba.comからニュース取得中...
  ✅ 8件のニュースを取得
📰 Yahoo!ニュース（競馬）から取得中...
  ✅ 10件のニュースを取得

📊 合計 18件のニュースを取得

✅ 記事作成完了: ホーエリート、39年ぶりの牝馬勝利
⏭️  スキップ（重複）: ダブルハートボンド...

✅ スクレイピング完了: 5件保存、13件スキップ

🤖 オプション3: AI記事自動生成

🤖 AI記事生成中: 【初心者向け】競馬予想サイトの選び方ガイド
  ✅ 生成完了（1024文字）
✅ 記事作成完了: 【初心者向け】競馬予想サイトの選び方ガイド

✅ AI記事生成完了: 3件

🎉 すべての処理が完了しました！
📰 スクレイピング: 5件保存
🤖 AI生成: 3件生成
📝 合計: 8件の新規記事
```

---

## 📝 今後の改善案

### Phase 1（完了）
- ✅ スクレイピング機能実装
- ✅ AI記事生成機能実装
- ✅ 統合実行スクリプト作成
- ✅ GitHub Actions自動実行設定

### Phase 2（検討中）
- [ ] スクレイピング対象サイトの追加（競馬ラボなど）
- [ ] 記事の品質評価機能（Claude APIで自己評価）
- [ ] 画像の自動生成（OGP画像など）
- [ ] より多様なテンプレート追加

### Phase 3（将来）
- [ ] 記事のA/Bテスト機能
- [ ] アクセス解析に基づく最適化
- [ ] 他サイト（keiba-c, keiba-d）への横展開

---

## 📚 関連ドキュメント

- モノレポREADME: `/CLAUDE.md`
- keiba-b CLAUDE.md: `/packages/keiba-b/CLAUDE.md`
- Claude API ドキュメント: https://docs.anthropic.com/
- Airtable API ドキュメント: https://airtable.com/developers/web/api/introduction

---

## 🙋 質問・フィードバック

何か問題が発生した場合は、以下を確認してください：

1. 環境変数が正しく設定されているか
2. APIキーが有効か
3. Airtable Base IDが正しいか
4. GitHub Actionsのログを確認

それでも解決しない場合は、GitHubのIssueを作成してください。
