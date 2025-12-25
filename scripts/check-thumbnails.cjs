#!/usr/bin/env node
/**
 * Airtable記事のサムネイル確認スクリプト
 */

const Airtable = require('airtable');

// 環境変数から取得
const AIRTABLE_API_KEY = process.env.KEIBA_GUIDE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Error: AIRTABLE_API_KEY or AIRTABLE_BASE_ID not set');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function checkThumbnails() {
  try {
    console.log('📰 最新記事のサムネイル確認中...\n');

    const records = await base('News')
      .select({
        maxRecords: 5,
        sort: [{ field: 'PublishedAt', direction: 'desc' }],
        filterByFormula: '{Status} = "published"',
      })
      .all();

    records.forEach((record, index) => {
      const fields = record.fields;
      const thumbnail = fields.Thumbnail;
      const thumbnailUrl = fields.ThumbnailUrl;

      console.log(`${index + 1}. ${fields.Title}`);
      console.log(`   RecordID: ${record.id}`);
      console.log(`   PublishedAt: ${fields.PublishedAt}`);
      console.log(`   Category: ${fields.Category}`);
      console.log(`   Thumbnail (Attachment): ${thumbnail ? thumbnail[0]?.url : 'なし'}`);
      console.log(`   ThumbnailUrl (Text): ${thumbnailUrl || 'なし'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkThumbnails();
