/**
 * PWAアイコン生成スクリプト
 *
 * 各サイズのPWAアイコン（72x72 〜 512x512）を生成します。
 */

const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 背景グラデーション（スカイブルー）
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#38bdf8');
  gradient.addColorStop(1, '#0ea5e9');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // 白い半透明オーバーレイ
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, 0, size, size);

  // 中央にテキスト「競馬」
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.35}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('競馬', size / 2, size / 2);

  // 角を丸くする（maskable対応）
  const radius = size * 0.05;
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // PNGとして保存
  const outputPath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`✅ ${size}x${size} アイコン生成: ${(buffer.length / 1024).toFixed(2)} KB`);
}

async function generateAllIcons() {
  // iconsディレクトリ作成
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('🎨 PWAアイコンを生成中...');
  console.log();

  for (const size of iconSizes) {
    await generateIcon(size);
  }

  console.log();
  console.log(`✨ 完了！${iconSizes.length}個のPWAアイコンを生成しました`);
}

// 実行
generateAllIcons().catch(console.error);
