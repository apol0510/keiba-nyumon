/**
 * 競馬予想サイト初心者ガイド - サイト設定
 */

export interface SiteConfig {
  name: string;
  domain: string;
  projectName: string;
  categories: readonly string[];
  categoryLabels: Record<string, string>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  airtable: {
    baseId: string;
    apiKey: string;
  };
}

export const config: SiteConfig = {
  // サイト基本情報
  name: '競馬予想サイト初心者ガイド',
  domain: 'keiba-guide.jp',
  projectName: 'keiba-guide',

  // カテゴリ設定
  categories: ['nankan', 'chuo', 'chihou'] as const,
  categoryLabels: {
    nankan: '南関競馬',
    chuo: '中央競馬',
    chihou: '地方競馬',
  },

  // テーマカラー
  theme: {
    primaryColor: '#ffffff',  // ホワイト - クリーン
    secondaryColor: '#f3f4f6', // ライトグレー - シンプル
  },

  // Airtable設定（モノレポ対応：プロジェクト固有の環境変数名を優先）
  // Netlifyではprocess.envのみ使用（import.meta.envはAstro設定が必要）
  airtable: {
    baseId: process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || 'appiHsDBAFFSmCiBV',
    apiKey: process.env.KEIBA_GUIDE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY || '',
  },
};

// 環境変数チェック
if (!config.airtable.apiKey || !config.airtable.baseId) {
  console.warn('⚠️ KEIBA_GUIDE_AIRTABLE_API_KEY or KEIBA_GUIDE_AIRTABLE_BASE_ID (or fallback AIRTABLE_*) is not set. Please check your .env file.');
}
