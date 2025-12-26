#!/usr/bin/env node
/**
 * Airtable記事のPublishedAtとViewCountを修正するスクリプト
 * - PublishedAt: 過去2-3ヶ月に自然に分散
 * - ViewCount: リアルな閲覧数（10-500の範囲）
 */

const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Error: AIRTABLE_API_KEY or AIRTABLE_BASE_ID not set');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

/**
 * 決定的な疑似ランダム関数（recordIdベース）
 * 同じrecordIdからは常に同じ値が生成される
 */
function seededRandom(seed, min, max) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  const random = Math.abs(Math.sin(hash)) * 10000;
  return Math.floor((random % (max - min + 1)) + min);
}

async function fixDatesAndViews() {
  try {
    console.log('📅 PublishedAtとViewCountを修正中...\n');

    // 全記事を取得（公開済みのみ）
    const records = await base('News')
      .select({
        filterByFormula: '{Status} = "published"'
      })
      .all();

    console.log(`合計: ${records.length}件\n`);

    const updates = [];
    const now = new Date();

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const fields = record.fields;
      const recordId = record.id;

      // 過去60-90日の範囲でランダムに分散（recordIdベース）
      const daysAgo = seededRandom(recordId + 'days', 1, 90);
      const hoursAgo = seededRandom(recordId + 'hours', 0, 23);
      const minutesAgo = seededRandom(recordId + 'minutes', 0, 59);

      const publishedAt = new Date(now);
      publishedAt.setDate(publishedAt.getDate() - daysAgo);
      publishedAt.setHours(publishedAt.getHours() - hoursAgo);
      publishedAt.setMinutes(publishedAt.getMinutes() - minutesAgo);
      publishedAt.setSeconds(0);
      publishedAt.setMilliseconds(0);

      const publishedAtISO = publishedAt.toISOString();

      // ViewCount: 古い記事ほど多くの閲覧数（10-200の範囲）
      // 過去の記事 = より多い閲覧数
      const baseViewCount = seededRandom(recordId + 'views', 10, 100);
      const ageBonus = Math.floor(daysAgo * 1); // 古いほど閲覧数が増える
      const viewCount = Math.min(baseViewCount + ageBonus, 200);

      updates.push({
        id: record.id,
        fields: {
          PublishedAt: publishedAtISO,
          ViewCount: viewCount
        }
      });

      console.log(`${i + 1}. ${fields.Title}`);
      console.log(`   日付: ${publishedAtISO} (${daysAgo}日前)`);
      console.log(`   閲覧数: ${fields.ViewCount || 0} → ${viewCount}`);
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

    console.log('\n✅ すべての記事のPublishedAtとViewCountを更新しました！');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixDatesAndViews();
