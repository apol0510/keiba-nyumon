#!/usr/bin/env node

/**
 * Newsテーブルの全データ削除
 */

const Airtable = require('airtable');

const apiKey = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const baseId = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || 'appiHsDBAFFSmCiBV';

if (!apiKey) {
  console.error('❌ AIRTABLE_API_KEY must be set');
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);

async function main() {
  console.log('🗑️  Newsテーブルの全データを削除中...\n');

  try {
    const records = await base('News').select().all();

    if (records.length === 0) {
      console.log('✅ Newsテーブルは既に空です');
      return;
    }

    console.log(`📊 削除対象: ${records.length}件\n`);

    // 10件ずつ削除（Airtable APIの制限対策）
    for (let i = 0; i < records.length; i += 10) {
      const batch = records.slice(i, i + 10);
      const ids = batch.map(r => r.id);

      await base('News').destroy(ids);
      console.log(`✅ ${Math.min(i + 10, records.length)}/${records.length}件削除完了`);

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n🎉 全${records.length}件のダミーデータを削除しました`);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

main();
