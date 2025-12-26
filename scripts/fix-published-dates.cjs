#!/usr/bin/env node
/**
 * Airtable記事のPublishedAtを修正するスクリプト
 * 古い日付形式（YYYY-MM-DD）を新しい形式（ISO 8601 + JST）に更新
 */

const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Error: AIRTABLE_API_KEY or AIRTABLE_BASE_ID not set');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function fixPublishedDates() {
  try {
    console.log('📅 PublishedAt修正開始...\n');

    // 全記事を取得（公開済みのみ）
    const records = await base('News')
      .select({
        filterByFormula: '{Status} = "published"',
        sort: [{ field: 'PublishedAt', direction: 'asc' }] // 公開日時の古い順
      })
      .all();

    console.log(`合計: ${records.length}件\n`);

    // 各記事にユニークな日時を割り当て
    // 最新記事が今日の日付になるように、基準日を調整
    const now = new Date();
    const latestDate = new Date(now.getTime() - (60 * 60 * 1000)); // 1時間前
    const baseDate = new Date(latestDate.getTime() - ((records.length - 1) * 60 * 60 * 1000)); // 古い記事用の開始日時
    const updates = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const fields = record.fields;

      // 記事ごとに1時間ずつ進める（新しい記事ほど新しい日時）
      const newPublishedAt = new Date(baseDate.getTime() + (i * 60 * 60 * 1000));
      const publishedAtISO = newPublishedAt.toISOString();

      updates.push({
        id: record.id,
        fields: {
          PublishedAt: publishedAtISO
        }
      });

      console.log(`${i + 1}. ${fields.Title}`);
      console.log(`   旧: ${fields.PublishedAt}`);
      console.log(`   新: ${publishedAtISO}`);
      console.log('');
    }

    // バッチ更新（10件ずつ）
    console.log('\n📝 更新中...\n');

    for (let i = 0; i < updates.length; i += 10) {
      const batch = updates.slice(i, i + 10);
      await base('News').update(batch);
      console.log(`  ✅ ${i + 1}〜${Math.min(i + 10, updates.length)}件 更新完了`);

      // レート制限対策（少し待つ）
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n✅ すべての記事のPublishedAtを更新しました！');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPublishedDates();
