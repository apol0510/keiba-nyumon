/**
 * カテゴリ別OGP画像生成スクリプト
 *
 * 各カテゴリ用のOGP画像（1200x630px）を生成します。
 */

const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

// カテゴリ定義
const categories = [
  { id: 'kiso', name: '競馬の基礎知識', color: '#0ea5e9', icon: '📚' },
  { id: 'baken', name: '馬券の買い方', color: '#10b981', icon: '🎫' },
  { id: 'yougo', name: '競馬用語集', color: '#f59e0b', icon: '📖' },
  { id: 'nankan', name: '南関競馬入門', color: '#8b5cf6', icon: '🏇' },
  { id: 'data', name: 'データ予想入門', color: '#ef4444', icon: '📊' },
];

async function generateCategoryOGImage(category) {
  const width = 1200;
  const height = 630;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景グラデーション（カテゴリカラー）
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, category.color);
  gradient.addColorStop(1, adjustBrightness(category.color, -20));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 白い半透明オーバーレイ
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(0, 0, width, height);

  // アイコン（大きく）
  ctx.font = '120px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(category.icon, width / 2, height / 2 - 120);

  // カテゴリ名（大きく）
  ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(category.name, width / 2, height / 2 + 20);

  // サイト名
  ctx.font = '40px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('競馬入門ガイド', width / 2, height / 2 + 100);

  // URL
  ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText('keiba-nyumon.jp', width / 2, height - 60);

  // PNGとして保存
  const outputPath = path.join(__dirname, '..', 'public', 'og', `${category.id}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`✅ ${category.name}のOGP画像を生成: ${outputPath}`);
  console.log(`   サイズ: ${width}x${height}px, ${(buffer.length / 1024).toFixed(2)} KB`);
}

// 色の明るさ調整
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent));
  const b = Math.max(0, Math.min(255, (num & 0xff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// 全カテゴリの画像を生成
async function generateAllCategoryOGImages() {
  console.log(`🎨 カテゴリ別OGP画像を生成中...`);
  console.log();

  for (const category of categories) {
    await generateCategoryOGImage(category);
  }

  console.log();
  console.log(`✨ 完了！${categories.length}個のカテゴリOGP画像を生成しました`);
}

// 実行
generateAllCategoryOGImages().catch(console.error);
