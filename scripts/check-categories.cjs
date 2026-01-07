#!/usr/bin/env node

const Airtable = require('airtable');

// 環境変数から取得（フォールバック付き）
const AIRTABLE_API_KEY = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

console.log('📊 最新10件の記事カテゴリをチェック中...\n');

base('News')
  .select({
    maxRecords: 10,
    sort: [{ field: 'PublishedAt', direction: 'desc' }],
    filterByFormula: '{Status} = "published"',
  })
  .firstPage((err, records) => {
    if (err) {
      console.error('❌ エラー:', err);
      process.exit(1);
    }

    const categoryCount = {};

    records.forEach((record, i) => {
      const category = record.fields.Category;
      const categoryStr = JSON.stringify(category);

      console.log(`${i + 1}. タイトル: ${record.fields.Title.substring(0, 40)}...`);
      console.log(`   Category: ${categoryStr} (型: ${typeof category}, 長さ: ${category?.length || 0})`);

      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    console.log('\n📈 カテゴリ集計:');
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`  - "${cat}": ${count}件`);
    });
  });
