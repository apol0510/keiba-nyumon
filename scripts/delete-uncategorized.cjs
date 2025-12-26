#!/usr/bin/env node
/**
 * uncategorizedカテゴリの記事を削除
 */

const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.KEIBA_GUIDE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Error: AIRTABLE_API_KEY or AIRTABLE_BASE_ID not set');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function deleteUncategorized() {
  try {
    console.log('🗑️  uncategorized記事を削除中...\n');

    // まず全記事を取得してフィルタリング
    const allRecords = await base('News')
      .select({
        filterByFormula: '{Status} = "published"'
      })
      .all();

    // uncategorizedまたはカテゴリ未設定の記事を抽出
    const uncategorizedRecords = allRecords.filter(record => {
      const category = record.fields.Category;
      return !category || category === 'uncategorized' || 
             !['kiso', 'baken', 'yougo', 'nankan', 'data'].includes(category);
    });

    console.log(`合計: ${uncategorizedRecords.length}件\n`);

    if (uncategorizedRecords.length === 0) {
      console.log('✅ uncategorizedの記事はありません');
      return;
    }

    // 最初の10件を表示
    console.log('削除対象の記事（最初の10件）:');
    uncategorizedRecords.slice(0, 10).forEach((record, i) => {
      console.log(`  ${i + 1}. ${record.fields.Title} (Category: ${record.fields.Category || '未設定'})`);
    });
    console.log('');

    // 削除（10件ずつ）
    console.log('📝 削除中...\n');

    for (let i = 0; i < uncategorizedRecords.length; i += 10) {
      const batch = uncategorizedRecords.slice(i, i + 10);
      const recordIds = batch.map(r => r.id);
      
      await base('News').destroy(recordIds);
      
      console.log(`  ✅ ${i + 1}〜${Math.min(i + 10, uncategorizedRecords.length)}件 削除完了`);

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n✅ ${uncategorizedRecords.length}件のuncategorized記事を削除しました！`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteUncategorized();
