/**
 * デフォルトOGP画像生成スクリプト
 *
 * サイトのデフォルトOGP画像（1200x630px）を生成します。
 */

const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

async function generateDefaultOGImage() {
  const width = 1200;
  const height = 630;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景グラデーション（スカイブルー）
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#38bdf8');
  gradient.addColorStop(1, '#0ea5e9');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 白い半透明オーバーレイ
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, 0, width, height);

  // メインタイトル（大きく）
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 96px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('競馬入門ガイド', width / 2, height / 2 - 60);

  // サブタイトル
  ctx.font = '48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('初心者のための基礎知識', width / 2, height / 2 + 40);

  // URL
  ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('keiba-nyumon.jp', width / 2, height - 80);

  // 装飾: 馬アイコン風の簡易図形
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(150, 150, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width - 150, 150, 60, 0, Math.PI * 2);
  ctx.fill();

  // PNGとして保存
  const outputPath = path.join(__dirname, '..', 'public', 'og', 'default.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`✅ デフォルトOGP画像を生成しました: ${outputPath}`);
  console.log(`   サイズ: ${width}x${height}px`);
  console.log(`   ファイルサイズ: ${(buffer.length / 1024).toFixed(2)} KB`);
}

// 実行
generateDefaultOGImage().catch(console.error);
