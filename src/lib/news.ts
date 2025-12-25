/**
 * ニュース記事取得ライブラリ
 * Airtableから競馬予想サイトのニュースを取得
 */

import Airtable from 'airtable';
import { config } from '../config';

// Airtableクライアントの初期化
let base: ReturnType<ReturnType<typeof Airtable>['base']> | null = null;

function getBase() {
  if (!base && typeof window === 'undefined') {
    if (!config.airtable.apiKey || !config.airtable.baseId) {
      throw new Error('Airtable credentials not configured. Check KEIBA_GUIDE_AIRTABLE_API_KEY and KEIBA_GUIDE_AIRTABLE_BASE_ID.');
    }
    base = new Airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.baseId);
  }
  return base!;
}

/**
 * ニュース記事の型定義
 */
export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content?: string;
  publishedAt: Date;
  viewCount: number;
  isFeatured: boolean;
  tags: string[];
  author?: string;
  thumbnail?: string; // Thumbnail (Attachment) または ThumbnailUrl (Text)
  thumbnailUrl?: string; // ThumbnailUrl (Text) - Unsplash URL用
}

/**
 * タイムラインアイテムの型定義
 */
export interface TimelineItem {
  time: string;
  category: string;
  title: string;
  slug: string;
}

/**
 * Airtableレコードをニュース記事に変換
 */
function recordToArticle(record: any): NewsArticle {
  const fields = record.fields;

  // サムネイル画像URL取得（ThumbnailUrl優先、なければThumbnail Attachment）
  const thumbnailUrl = fields.ThumbnailUrl || fields.Thumbnail?.[0]?.url || undefined;

  return {
    id: record.id,
    title: fields.Title || '',
    slug: fields.Slug || '',
    category: fields.Category || 'ニュース',
    excerpt: fields.Excerpt || '',
    content: fields.Content || '',
    publishedAt: fields.PublishedAt ? new Date(fields.PublishedAt) : new Date(),
    viewCount: fields.ViewCount || 0,
    isFeatured: fields.IsFeatured || false,
    tags: fields.Tags || [],
    author: fields.Author,
    thumbnail: thumbnailUrl, // thumbnailとthumbnailUrlの両方に設定
    thumbnailUrl: thumbnailUrl,
  };
}

/**
 * 最新のニュース記事を取得
 */
export async function getLatestNews(limit: number = 10): Promise<NewsArticle[]> {
  try {
    // 環境変数が設定されていない場合は空配列を返す（ビルド時）
    if (!config.airtable.apiKey || !config.airtable.baseId) {
      console.warn('⚠️ Airtable credentials not set. Returning empty news array.');
      return [];
    }

    const base = getBase();
    const records = await base('News')
      .select({
        maxRecords: limit,
        sort: [{ field: 'PublishedAt', direction: 'desc' }],
        filterByFormula: '{Status} = "published"',
      })
      .all();

    return records.map(recordToArticle);
  } catch (error) {
    console.error('Failed to fetch news from Airtable:', error);
    return [];
  }
}

/**
 * カテゴリ別のニュース記事を取得
 */
export async function getNewsByCategory(category: string, limit: number = 10): Promise<NewsArticle[]> {
  try {
    // 環境変数が設定されていない場合は空配列を返す（ビルド時）
    if (!config.airtable.apiKey || !config.airtable.baseId) {
      console.warn('⚠️ Airtable credentials not set. Returning empty news array.');
      return [];
    }

    const base = getBase();
    const records = await base('News')
      .select({
        maxRecords: limit,
        sort: [{ field: 'PublishedAt', direction: 'desc' }],
        filterByFormula: `AND({Status} = "published", {Category} = "${category}")`,
      })
      .all();

    return records.map(recordToArticle);
  } catch (error) {
    console.error(`Failed to fetch news for category ${category}:`, error);
    return [];
  }
}

/**
 * 注目記事を取得
 */
export async function getFeaturedNews(limit: number = 3): Promise<NewsArticle[]> {
  try {
    // 環境変数が設定されていない場合は空配列を返す（ビルド時）
    if (!config.airtable.apiKey || !config.airtable.baseId) {
      console.warn('⚠️ Airtable credentials not set. Returning empty news array.');
      return [];
    }

    const base = getBase();
    const records = await base('News')
      .select({
        maxRecords: limit,
        sort: [{ field: 'PublishedAt', direction: 'desc' }],
        filterByFormula: 'AND({Status} = "published", {IsFeatured} = 1)',
      })
      .all();

    return records.map(recordToArticle);
  } catch (error) {
    console.error('Failed to fetch featured news:', error);
    return [];
  }
}

/**
 * すべてのニュース記事を取得（静的ページ生成用）
 */
export async function getAllNews(): Promise<NewsArticle[]> {
  try {
    // 環境変数が設定されていない場合は空配列を返す（ビルド時）
    if (!config.airtable.apiKey || !config.airtable.baseId) {
      console.warn('⚠️ Airtable credentials not set. Returning empty news array.');
      return [];
    }

    const base = getBase();
    const records = await base('News')
      .select({
        filterByFormula: '{Status} = "published"',
        sort: [{ field: 'PublishedAt', direction: 'desc' }],
      })
      .all();

    return records.map(recordToArticle);
  } catch (error) {
    console.error('Failed to fetch all news from Airtable:', error);
    return [];
  }
}

/**
 * スラッグから記事を取得
 */
export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    // 環境変数が設定されていない場合はnullを返す（ビルド時）
    if (!config.airtable.apiKey || !config.airtable.baseId) {
      console.warn('⚠️ Airtable credentials not set. Returning null.');
      return null;
    }

    const base = getBase();
    const records = await base('News')
      .select({
        maxRecords: 1,
        filterByFormula: `AND({Status} = "published", {Slug} = "${slug}")`,
      })
      .all();

    if (records.length === 0) {
      return null;
    }

    return recordToArticle(records[0]);
  } catch (error) {
    console.error(`Failed to fetch article with slug ${slug}:`, error);
    return null;
  }
}

/**
 * 旧関数名との互換性のため残しておく
 */
export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  return getNewsBySlug(slug);
}

/**
 * タイムライン用の最新記事を取得
 */
export async function getTimelineItems(limit: number = 6): Promise<TimelineItem[]> {
  try {
    // 環境変数が設定されていない場合は空配列を返す（ビルド時）
    if (!config.airtable.apiKey || !config.airtable.baseId) {
      console.warn('⚠️ Airtable credentials not set. Returning empty timeline array.');
      return [];
    }

    const base = getBase();
    const records = await base('News')
      .select({
        maxRecords: limit,
        sort: [{ field: 'PublishedAt', direction: 'desc' }],
        filterByFormula: '{Status} = "published"',
      })
      .all();

    return records.map(record => {
      const fields = record.fields;
      const publishedAt = fields.PublishedAt ? new Date(fields.PublishedAt) : new Date();

      // 相対時間を計算
      const now = new Date();
      const diff = now.getTime() - publishedAt.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));

      let timeStr = '';
      if (hours < 1) {
        timeStr = `${minutes}分前`;
      } else if (hours < 24) {
        timeStr = `${hours}時間前`;
      } else {
        timeStr = publishedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      }

      return {
        time: timeStr,
        category: fields.Category || 'ニュース',
        title: fields.Title || '',
        slug: fields.Slug || '',
      };
    });
  } catch (error) {
    console.error('Failed to fetch timeline items:', error);
    return [];
  }
}

/**
 * 閲覧数をインクリメント
 */
export async function incrementViewCount(articleId: string): Promise<void> {
  try {
    // 環境変数が設定されていない場合は何もしない
    if (!config.airtable.apiKey || !config.airtable.baseId) {
      console.warn('⚠️ Airtable credentials not set. Skipping view count increment.');
      return;
    }

    const base = getBase();
    const record = await base('News').find(articleId);
    const currentViews = record.fields.ViewCount || 0;

    await base('News').update(articleId, {
      ViewCount: currentViews + 1,
    });
  } catch (error) {
    console.error(`Failed to increment view count for article ${articleId}:`, error);
  }
}
