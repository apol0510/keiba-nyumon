# AI画像生成ライブラリ

## 概要

記事生成時に、カテゴリに応じた高品質なサムネイル画像を自動生成します。

### 使用技術

- **Replicate API**: Flux Schnell（高速・低コスト AI画像生成）
- **Cloudinary**: 画像ホスティング（無料枠: 25GB/月）

### コスト

- **画像生成**: $0.003/画像（Replicate）
- **ホスティング**: 無料（月25GB転送量内）
- **合計**: 1記事あたり約 **$0.003**（0.5円以下）

---

## セットアップ

### 1. Replicate登録

```bash
# 1. https://replicate.com にアクセス
# 2. GitHubアカウントでサインアップ
# 3. Account > API tokens からトークン発行
# 4. .envに追加:
REPLICATE_API_TOKEN=r8_XXXXXXXXXXXX
```

### 2. Cloudinary登録

```bash
# 1. https://cloudinary.com にアクセス
# 2. 無料アカウント作成
# 3. Dashboardから認証情報をコピー
# 4. .envに追加:
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=XXXXXXXXXXXX
```

---

## 使い方

### 基本的な使い方

```javascript
const { generateAndUploadThumbnail } = require('./lib/image-generator.cjs');

// 画像生成 & Cloudinaryアップロード
const imageUrl = await generateAndUploadThumbnail(
  'ニュース',  // カテゴリ
  '【速報】競馬予想サイトの最新情報'  // 記事タイトル
);

// Airtable Attachmentとして保存
const article = {
  Title: '記事タイトル',
  // ...他のフィールド
  Thumbnail: [{ url: imageUrl }]  // ← ここに画像URLを設定
};
```

### カテゴリ別の画像スタイル

| カテゴリ | 画像スタイル |
|---------|-----------|
| ニュース | Breaking news banner, 新聞スタイル |
| ランキング | 表彰台、数字、競争的な雰囲気 |
| ガイド | インフォグラフィック、初心者向け |
| まとめ | コラージュスタイル、複数要素 |
| 速報 | 緊急ニュース、赤×白 |
| 炎上 | 警告色、議論テーマ |
| G1レース | プレミアム、ゴールドアクセント |

---

## 処理フロー

```
1. カテゴリ + タイトル → AI画像生成プロンプト作成
   ↓
2. Replicate API (Flux Schnell) で画像生成
   ↓
3. 一時ファイル（temp/）に保存
   ↓
4. Cloudinaryにアップロード（1200x675px WebP形式）
   ↓
5. URLを返す & 一時ファイル削除
   ↓
6. Airtable Attachmentに保存
```

---

## トラブルシューティング

### 画像が生成されない

**原因**: Replicate APIトークンが設定されていない

```bash
# .envに追加
REPLICATE_API_TOKEN=r8_XXXXXXXXXXXX
```

### Cloudinaryアップロードエラー

**原因**: 認証情報が間違っている

```bash
# Cloudinary Dashboardで確認
CLOUDINARY_CLOUD_NAME=your-cloud-name  # ← Cloud nameを確認
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=XXXXXXXXXXXX
```

### 画像生成が遅い

- Flux Schnellは約3-5秒で生成完了
- ネットワーク速度に依存する可能性あり
- 複数記事生成時は順次処理（並列化は今後検討）

---

## パフォーマンス最適化

### 現在の実装

- 画像形式: WebP（高圧縮・高画質）
- サイズ: 1200x675px（16:9）
- 品質: auto:good（Cloudinary自動最適化）
- 読み込み: lazy loading + async decoding

### さらなる改善案

1. **並列生成**: 複数記事を並行処理（Promise.all）
2. **キャッシュ**: 同じカテゴリ画像を再利用
3. **CDN**: Cloudinary CDN自動適用済み

---

## ライセンス

- Replicate Flux Schnell: Apache 2.0
- Cloudinary: 無料枠内で商用利用可
