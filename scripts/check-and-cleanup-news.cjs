#!/usr/bin/env node

/**
 * Newsテーブルの確認とクリーンアップ
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
  console.log('🔍 Newsテーブルの内容を確認中...\n');

  try {
    const records = await base('News').select().all();

    console.log(`📊 現在のレコード数: ${records.length}件\n`);

    if (records.length === 0) {
      console.log('✅ Newsテーブルは空です（問題なし）');
      return;
    }

    console.log('📋 既存のレコード一覧:\n');
    records.forEach((record, index) => {
      const fields = record.fields;
      console.log(`${index + 1}. ${fields.Title || '（タイトルなし）'}`);
      console.log(`   ID: ${record.id}`);
      console.log(`   カテゴリ: ${fields.Category || '-'}`);
      console.log(`   公開日: ${fields.PublishedAt || '-'}`);
      console.log(`   ステータス: ${fields.Status || '-'}`);
      console.log('');
    });

    console.log('\n🗑️  全てのダミーデータを削除しますか？');
    console.log('削除する場合は、以下のコマンドを実行してください:');
    console.log(`\nAIRTABLE_API_KEY=${apiKey.substring(0, 10)}... AIRTABLE_BASE_ID=${baseId} node scripts/delete-all-news.cjs\n`);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

main();
