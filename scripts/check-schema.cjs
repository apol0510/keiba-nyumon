#!/usr/bin/env node
/**
 * Airtableのフィールドスキーマを確認するスクリプト
 */

const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.KEIBA_GUIDE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Error: AIRTABLE_API_KEY or AIRTABLE_BASE_ID not set');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function checkSchema() {
  try {
    console.log('📋 Newsテーブルのスキーマを確認中...\n');

    // 最初の1件を取得してフィールドを確認
    const records = await base('News')
      .select({
        maxRecords: 1
      })
      .all();

    if (records.length > 0) {
      const record = records[0];
      console.log('Record ID:', record.id);
      console.log('\nフィールド一覧:');
      console.log(JSON.stringify(record.fields, null, 2));
    } else {
      console.log('❌ レコードが見つかりませんでした');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
