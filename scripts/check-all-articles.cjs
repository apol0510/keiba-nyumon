#!/usr/bin/env node
/**
 * Airtable全記事確認スクリプト
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

async function checkAllArticles() {
  try {
    console.log('📰 全記事を確認中...\n');

    const records = await base('News')
      .select({
        sort: [{ field: 'PublishedAt', direction: 'desc' }],
        filterByFormula: '{Status} = "published"',
      })
      .all();

    console.log(`合計: ${records.length}件\n`);

    // Title61, 62, 63を探す
    const targetTitles = records.filter(r =>
      r.fields.Title && (
        r.fields.Title.includes('61') ||
        r.fields.Title.includes('62') ||
        r.fields.Title.includes('63') ||
        r.fields.Title.match(/Title\s*6[123]/)
      )
    );

    if (targetTitles.length > 0) {
      console.log('🎯 Title61/62/63を含む記事:\n');
      targetTitles.forEach((record) => {
        const fields = record.fields;
        console.log(`タイトル: ${fields.Title}`);
        console.log(`RecordID: ${record.id}`);
        console.log(`PublishedAt: ${fields.PublishedAt}`);
        console.log(`Status: ${fields.Status}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Title61/62/63を含む記事は見つかりませんでした\n');
    }

    // 最新10件を表示
    console.log('📋 最新10件:\n');
    records.slice(0, 10).forEach((record, index) => {
      const fields = record.fields;
      console.log(`${index + 1}. ${fields.Title}`);
      console.log(`   PublishedAt: ${fields.PublishedAt}`);
      console.log(`   Status: ${fields.Status}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAllArticles();
