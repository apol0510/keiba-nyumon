// @ts-check
import { loadEnv } from 'vite';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// .envファイルを明示的に読み込み
const env = loadEnv('', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  site: 'https://keiba-news.jp',
  server: {
    port: 4322, // keiba-guideは4322ポートで起動
  },
  integrations: [react()],
  output: 'static', // 完全静的生成（Airtableから事前生成）
  vite: {
    plugins: [tailwindcss()],
    // 環境変数をViteに明示的に渡す（.envファイルから読み込んだ値を使用）
    define: {
      'process.env.KEIBA_GUIDE_AIRTABLE_API_KEY': JSON.stringify(env.KEIBA_GUIDE_AIRTABLE_API_KEY || env.AIRTABLE_API_KEY || ''),
      'process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID': JSON.stringify(env.KEIBA_GUIDE_AIRTABLE_BASE_ID || env.AIRTABLE_BASE_ID || ''),
      'process.env.AIRTABLE_API_KEY': JSON.stringify(env.AIRTABLE_API_KEY || ''),
      'process.env.AIRTABLE_BASE_ID': JSON.stringify(env.AIRTABLE_BASE_ID || ''),
    },
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
