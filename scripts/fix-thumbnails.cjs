#!/usr/bin/env node
/**
 * サムネイル未設定の記事にUnsplash画像を一括設定
 */

const Airtable = require('airtable');
const { generateAndUploadThumbnail } = require('./lib/image-generator.cjs');

const AIRTABLE_API_KEY = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Error: AIRTABLE_API_KEY or AIRTABLE_BASE_ID not set');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function fixThumbnails() {
  try {
    console.log('🖼️  サムネイル未設定の記事を修正中...\n');

    const records = await base('News')
      .select({
        filterByFormula: 'AND({Status} = "published", {ThumbnailUrl} = "")'
      })
      .all();

    console.log(`合計: ${records.length}件\n`);

    const updates = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const fields = record.fields;
      const category = fields.Category || 'uncategorized';
      const title = fields.Title;

      console.log(`${i + 1}/${records.length}. ${title.substring(0, 50)}...`);
      console.log(`   Category: ${category}`);

      // Unsplash画像URLを取得（recordIdをシードとして渡す）
      const thumbnailUrl = await generateAndUploadThumbnail(category, title, record.id);

      if (thumbnailUrl) {
        updates.push({
          id: record.id,
          fields: {
            ThumbnailUrl: thumbnailUrl
          }
        });
        console.log(`   ✅ サムネイル設定: ${thumbnailUrl.substring(0, 60)}...\n`);
      } else {
        console.log(`   ⚠️  サムネイル取得失敗\n`);
      }
    }

    // バッチ更新（10件ずつ）
    console.log('\n📝 Airtableに更新中...\n');

    for (let i = 0; i < updates.length; i += 10) {
      const batch = updates.slice(i, i + 10);
      await base('News').update(batch);
      console.log(`  ✅ ${i + 1}〜${Math.min(i + 10, updates.length)}件 更新完了`);

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n✅ ${updates.length}件のサムネイルを設定しました！`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixThumbnails();
