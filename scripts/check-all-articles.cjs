#!/usr/bin/env node
/**
 * 全記事の状況を確認するスクリプト
 */

const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.KEIBA_GUIDE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Error: AIRTABLE_API_KEY or AIRTABLE_BASE_ID not set');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function checkAllArticles() {
  try {
    console.log('📊 記事の状況を確認中...\n');

    const records = await base('News')
      .select({
        filterByFormula: '{Status} = "published"'
      })
      .all();

    console.log(`✅ 公開済み記事: ${records.length}件\n`);

    const categoryCount = {};
    records.forEach(record => {
      const category = record.fields.Category || 'uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    console.log('📁 カテゴリ別記事数:');
    console.log('─'.repeat(40));
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
      const label = {
        'kiso': '競馬の基礎知識',
        'baken': '馬券の買い方',
        'yougo': '競馬用語集',
        'nankan': '南関競馬入門',
        'data': 'データ予想入門'
      }[category] || category;
      console.log(`  ${category.padEnd(15)} (${label}): ${count}件`);
    });

    console.log('\n📈 Phase 1 目標: 各カテゴリ12記事（合計60記事）');
    console.log('─'.repeat(40));
    const targetCategories = ['kiso', 'baken', 'yougo', 'nankan', 'data'];
    targetCategories.forEach(cat => {
      const count = categoryCount[cat] || 0;
      const status = count >= 12 ? '✅' : '⚠️';
      const label = {
        'kiso': '競馬の基礎知識',
        'baken': '馬券の買い方',
        'yougo': '競馬用語集',
        'nankan': '南関競馬入門',
        'data': 'データ予想入門'
      }[cat];
      console.log(`  ${status} ${cat.padEnd(10)} (${label}): ${count}/12件`);
    });

    console.log('\n🔍 データ品質チェック:');
    console.log('─'.repeat(40));

    let noThumbnail = 0;
    let noPublishedAt = 0;
    let noViewCount = 0;

    records.forEach(record => {
      if (!record.fields.ThumbnailUrl) noThumbnail++;
      if (!record.fields.PublishedAt) noPublishedAt++;
      if (record.fields.ViewCount === undefined || record.fields.ViewCount === null) noViewCount++;
    });

    console.log(`  サムネイル未設定: ${noThumbnail}件 ${noThumbnail === 0 ? '✅' : '⚠️'}`);
    console.log(`  公開日時未設定: ${noPublishedAt}件 ${noPublishedAt === 0 ? '✅' : '⚠️'}`);
    console.log(`  閲覧数未設定: ${noViewCount}件 ${noViewCount === 0 ? '✅' : '⚠️'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAllArticles();
