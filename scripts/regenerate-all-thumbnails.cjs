/**
 * 全記事のサムネイル画像をAI生成画像に入れ替え
 */

require('dotenv').config();
const Airtable = require('airtable');
const { generateAndUploadThumbnail } = require('./lib/image-generator.cjs');

const KEIBA_NYUMON_AIRTABLE_API_KEY = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const KEIBA_NYUMON_AIRTABLE_BASE_ID = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!KEIBA_NYUMON_AIRTABLE_API_KEY || !KEIBA_NYUMON_AIRTABLE_BASE_ID) {
  console.error('❌ KEIBA_NYUMON_AIRTABLE_API_KEY と KEIBA_NYUMON_AIRTABLE_BASE_ID を設定してください');
  process.exit(1);
}

const base = new Airtable({ apiKey: KEIBA_NYUMON_AIRTABLE_API_KEY }).base(KEIBA_NYUMON_AIRTABLE_BASE_ID);

// カテゴリを判定（タイトルから推測）
function detectCategory(title) {
  if (title.includes('速報') || title.includes('最新情報')) return '速報';
  if (title.includes('ランキング') || title.includes('TOP')) return 'ランキング';
  if (title.includes('初心者') || title.includes('ガイド') || title.includes('選び方')) return 'ガイド';
  if (title.includes('徹底比較') || title.includes('比較')) return 'まとめ';
  if (title.includes('必読') || title.includes('コツ') || title.includes('見分け方')) return 'ガイド';
  return 'ニュース';
}

async function regenerateAllThumbnails() {
  try {
    console.log('🔄 全記事のサムネイル画像をAI生成画像に入れ替えます...\n');

    // published記事を全て取得
    const records = await base('News').select({
      filterByFormula: '{Status} = "published"',
      sort: [{ field: 'PublishedAt', direction: 'desc' }]
    }).all();

    console.log(`📋 対象記事: ${records.length}件\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const title = record.fields.Title;
      const recordId = record.id;

      console.log(`\n[${i + 1}/${records.length}] ${title}`);
      console.log(`   Record ID: ${recordId}`);

      // カテゴリを判定
      const category = record.fields.Category || detectCategory(title);
      console.log(`   カテゴリ: ${category}`);

      try {
        // AI画像生成 & Cloudinaryアップロード
        const thumbnailUrl = await generateAndUploadThumbnail(category, title);

        if (!thumbnailUrl) {
          console.log(`   ⚠️  画像生成失敗、スキップします`);
          failCount++;
          continue;
        }

        // Airtableを更新
        await base('News').update(recordId, {
          Thumbnail: [{ url: thumbnailUrl }]
        });

        console.log(`   ✅ サムネイル更新完了`);
        successCount++;

        // API rate limit対策: 少し待つ
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`   ❌ エラー: ${error.message}`);
        failCount++;
      }
    }

    console.log('\n\n===========================================');
    console.log('🎉 サムネイル画像の入れ替えが完了しました！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${failCount}件`);
    console.log('===========================================\n');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

regenerateAllThumbnails();
