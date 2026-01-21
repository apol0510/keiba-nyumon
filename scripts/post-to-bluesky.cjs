/**
 * Bluesky 自動投稿スクリプト - keiba-nyumon
 *
 * 新規作成されたニュース記事をBlueskyに自動投稿します。
 * Blueskyは完全無料で投稿制限なし（X API Free tierの代替）
 *
 * 環境変数:
 * - KEIBA_NYUMON_AIRTABLE_API_KEY または AIRTABLE_API_KEY: AirtableのAPIキー
 * - KEIBA_NYUMON_AIRTABLE_BASE_ID または AIRTABLE_BASE_ID: AirtableのBase ID
 * - BLUESKY_IDENTIFIER: Blueskyハンドル（例: keiba-nyumon.bsky.social）
 * - BLUESKY_PASSWORD: Blueskyパスワード
 * - SITE_URL: サイトURL（デフォルト: https://keiba-nyumon.jp）
 */

const Airtable = require('airtable');
const { BskyAgent, RichText } = require('@atproto/api');

// 環境変数チェック（keiba-nyumon専用環境変数を優先、フォールバック対応）
const AIRTABLE_API_KEY = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

const requiredEnvVars = [
  { name: 'AIRTABLE_API_KEY (KEIBA_NYUMON_AIRTABLE_API_KEY)', value: AIRTABLE_API_KEY },
  { name: 'AIRTABLE_BASE_ID (KEIBA_NYUMON_AIRTABLE_BASE_ID)', value: AIRTABLE_BASE_ID },
  { name: 'BLUESKY_IDENTIFIER', value: process.env.BLUESKY_IDENTIFIER },
  { name: 'BLUESKY_PASSWORD', value: process.env.BLUESKY_PASSWORD }
];

for (const { name, value } of requiredEnvVars) {
  if (!value) {
    console.error(`❌ エラー: 環境変数 ${name} が設定されていません`);
    process.exit(1);
  }
}

// Airtable設定
const base = new Airtable({ apiKey: AIRTABLE_API_KEY })
  .base(AIRTABLE_BASE_ID);

// Bluesky Agent
const agent = new BskyAgent({ service: 'https://bsky.social' });

const SITE_URL = process.env.SITE_URL || 'https://keiba-nyumon.jp';

/**
 * 投稿テキスト生成
 */
function generatePostText(news) {
  const title = news.Title;
  const slug = news.Slug;

  // SlugがURLエンコードされている場合は、そのまま使用
  const encodedSlug = slug.includes('%') ? slug : encodeURIComponent(slug);
  const url = `${SITE_URL}/news/${encodedSlug}/`;

  // カテゴリに応じた絵文字（keiba-nyumon用）
  const categoryEmoji = {
    'kiso': '📚',      // 競馬の基礎知識
    'baken': '🎫',     // 馬券の買い方
    'yougo': '📖',     // 競馬用語集
    'nankan': '🏇',    // 南関競馬入門
    'data': '📊'       // データ予想入門
  };
  const emoji = categoryEmoji[news.Category] || '🐴';

  // ハッシュタグ（初心者向け）
  const hashtags = ['#競馬初心者', '#競馬入門'];
  if (news.Tags && news.Tags.length > 0) {
    const tag = news.Tags[0];
    hashtags.push(`#${tag}`);
  }

  // 投稿本文作成（Blueskyは300文字まで）
  return `${emoji} ${title}\n\n👉 詳細はこちら\n${url}\n\n${hashtags.join(' ')}`;
}

/**
 * Blueskyに投稿
 */
async function postToBluesky(news) {
  try {
    const postText = generatePostText(news);
    console.log(`\n📝 投稿内容:\n${postText}\n`);

    // Blueskyにログイン
    await agent.login({
      identifier: process.env.BLUESKY_IDENTIFIER,
      password: process.env.BLUESKY_PASSWORD,
    });

    // RichTextを使用してリンクを自動検出
    const rt = new RichText({ text: postText });
    await rt.detectFacets(agent);

    // 投稿
    const post = await agent.post({
      text: rt.text,
      facets: rt.facets,
    });

    console.log(`✅ Blueskyに投稿しました: https://bsky.app/profile/${process.env.BLUESKY_IDENTIFIER}/post/${post.uri.split('/').pop()}`);

    return post.uri;
  } catch (error) {
    console.error('❌ Bluesky投稿エラー:', error);
    throw error;
  }
}

/**
 * AirtableのNewsレコードにBlueskyの投稿URIを記録
 */
async function updateNewsWithPostUri(recordId, postUri) {
  try {
    const now = new Date().toISOString();
    await base('News').update(recordId, {
      BlueskyPostUri: postUri,
      BlueskyPostedAt: now
    });
    console.log(`✅ Airtableを更新しました（RecordID: ${recordId}）`);
  } catch (error) {
    console.error('❌ Airtable更新エラー:', error);
    // Airtableの更新に失敗しても投稿は成功しているのでエラーは投げない
  }
}

/**
 * まだBlueskyに投稿していない最新記事を取得
 */
async function getUnpostedNews() {
  // 安全のため1回の実行で最大3件まで投稿
  const MAX_POSTS_PER_RUN = 3;

  try {
    const records = await base('News')
      .select({
        filterByFormula: "AND({Status} = 'published', OR({BlueskyPostUri} = '', {BlueskyPostUri} = BLANK()))",
        sort: [{ field: 'PublishedAt', direction: 'desc' }],
        maxRecords: MAX_POSTS_PER_RUN
      })
      .all();

    return records.map(record => ({
      id: record.id,
      Title: record.get('Title'),
      Slug: record.get('Slug'),
      Category: record.get('Category'),
      Tags: record.get('Tags'),
      PublishedAt: record.get('PublishedAt')
    }));
  } catch (error) {
    console.error('❌ Airtable取得エラー:', error);
    throw error;
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 keiba-nyumon Bluesky自動投稿スクリプト開始...\n');

  // 未投稿の記事を取得
  const unpostedNews = await getUnpostedNews();

  if (unpostedNews.length === 0) {
    console.log('ℹ️ 投稿する記事がありません');
    return;
  }

  console.log(`📋 ${unpostedNews.length}件の未投稿記事が見つかりました\n`);

  // 各記事をBlueskyに投稿
  for (const news of unpostedNews) {
    console.log(`\n📰 記事: ${news.Title}`);

    try {
      // Blueskyに投稿
      const postUri = await postToBluesky(news);

      // Airtableを更新
      await updateNewsWithPostUri(news.id, postUri);

      // レート制限対策（5秒待機）
      if (unpostedNews.indexOf(news) < unpostedNews.length - 1) {
        console.log('⏱️  5秒待機中...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

    } catch (error) {
      console.error(`❌ 投稿失敗: ${news.Title}`);
      console.error(error);
      // エラーが発生しても次の記事の投稿を続行
      continue;
    }
  }

  console.log('\n✅ keiba-nyumon Bluesky自動投稿スクリプト完了');
}

// スクリプト実行
main().catch(error => {
  console.error('❌ スクリプト実行エラー:', error);
  process.exit(1);
});
