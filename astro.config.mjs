// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// 環境変数の読み込み
// ローカル: .envファイルからdotenvが自動読み込み（package.jsonのスクリプトで設定）
// Netlify: process.envに直接設定される（Netlify環境変数から）
// config.tsとnews.tsで直接process.envにアクセスする

// https://astro.build/config
export default defineConfig({
  site: 'https://keiba-news.jp',
  server: {
    port: 4322, // keiba-nyumonは4322ポートで起動
  },
  integrations: [react()],
  output: 'static', // 完全静的生成（Airtableから事前生成）
  vite: {
    plugins: [tailwindcss()],
    // Astro/Nodeの標準環境変数アクセスを使用（defineは不要）
    build: {
      // チャンクサイズ最適化
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          },
        },
      },
    },
  },
  // 圧縮を有効化
  compressHTML: true,
  // ビルド最適化
  build: {
    inlineStylesheets: 'auto',
    // アセットのインライン化閾値（4KB以下のものはインライン化）
    assetsInlineLimit: 4096,
  },
  // 画像最適化（Netlify Image CDN対応）
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
    domains: ['fonts.googleapis.com', 'fonts.gstatic.com', 'image.thum.io'],
    remotePatterns: [{ protocol: 'https' }],
  },
  // プリフェッチ設定
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
