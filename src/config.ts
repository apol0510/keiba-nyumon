/**
 * 競馬入門ガイド - サイト設定
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
  name: '競馬入門ガイド',
  domain: 'keiba-nyumon.jp',
  projectName: 'keiba-nyumon',

  // カテゴリ設定
  categories: ['kiso', 'baken', 'yougo', 'nankan', 'data'] as const,
  categoryLabels: {
    kiso: '競馬の基礎知識',
    baken: '馬券の買い方',
    yougo: '競馬用語集',
    nankan: '南関競馬入門',
    data: 'データ予想入門',
  },

  // テーマカラー
  theme: {
    primaryColor: '#ffffff',  // ホワイト - クリーン
    secondaryColor: '#f3f4f6', // ライトグレー - シンプル
  },

  // Airtable設定（モノレポ対応：プロジェクト固有の環境変数名を優先）
  // Astroの標準: import.meta.envを使用（ビルド時に環境変数が展開される）
  airtable: {
    baseId: import.meta.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || import.meta.env.AIRTABLE_BASE_ID || 'appiHsDBAFFSmCiBV',
    apiKey: import.meta.env.KEIBA_NYUMON_AIRTABLE_API_KEY || import.meta.env.AIRTABLE_API_KEY || '',
  },
};

// 環境変数チェック
if (!config.airtable.apiKey || !config.airtable.baseId) {
  console.warn('⚠️ KEIBA_NYUMON_AIRTABLE_API_KEY or KEIBA_NYUMON_AIRTABLE_BASE_ID (or fallback AIRTABLE_*) is not set. Please check your .env file.');
}
