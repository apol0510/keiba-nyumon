#!/usr/bin/env node
/**
 * サムネイル未設定の記事を確認するスクリプト
 */

const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Error: AIRTABLE_API_KEY or AIRTABLE_BASE_ID not set');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function checkThumbnails() {
  try {
    console.log('🖼️  サムネイル未設定の記事を確認中...\n');

    const records = await base('News')
      .select({
        filterByFormula: 'AND({Status} = "published", {ThumbnailUrl} = "")'
      })
      .all();

    console.log(`合計: ${records.length}件\n`);

    records.forEach((record, index) => {
      console.log(`${index + 1}. ${record.fields.Title}`);
      console.log(`   Category: ${record.fields.Category || 'uncategorized'}`);
      console.log(`   RecordID: ${record.id}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkThumbnails();
