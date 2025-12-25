/**
 * サムネイルがCloudinary URLでない記事のみ画像を再生成
 * レート制限対策: 1分間に6件まで
 */

require('dotenv').config();
const Airtable = require('airtable');
const { generateAndUploadThumbnail } = require('./lib/image-generator.cjs');

const KEIBA_GUIDE_AIRTABLE_API_KEY = process.env.KEIBA_GUIDE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const KEIBA_GUIDE_AIRTABLE_BASE_ID = process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!KEIBA_GUIDE_AIRTABLE_API_KEY || !KEIBA_GUIDE_AIRTABLE_BASE_ID) {
  console.error('❌ KEIBA_GUIDE_AIRTABLE_API_KEY と KEIBA_GUIDE_AIRTABLE_BASE_ID を設定してください');
  process.exit(1);
}

const base = new Airtable({ apiKey: KEIBA_GUIDE_AIRTABLE_API_KEY }).base(KEIBA_GUIDE_AIRTABLE_BASE_ID);

// カテゴリを判定（タイトルから推測）
function detectCategory(title) {
  if (title.includes('速報') || title.includes('最新情報')) return '速報';
  if (title.includes('ランキング') || title.includes('TOP')) return 'ランキング';
  if (title.includes('初心者') || title.includes('ガイド') || title.includes('選び方')) return 'ガイド';
  if (title.includes('徹底比較') || title.includes('比較')) return 'まとめ';
  if (title.includes('必読') || title.includes('コツ') || title.includes('見分け方')) return 'ガイド';
  return 'ニュース';
}

// Cloudinary URLかどうかを判定
function hasCloudinaryThumbnail(record) {
  const thumbnail = record.fields.Thumbnail;
  if (!thumbnail || !thumbnail[0] || !thumbnail[0].url) {
    return false;
  }
  return thumbnail[0].url.includes('cloudinary.com');
}

async function regenerateRemainingThumbnails() {
  try {
    console.log('🔄 Cloudinary画像がない記事のサムネイルを再生成します...\n');

    // published記事を全て取得
    const records = await base('News').select({
      filterByFormula: '{Status} = "published"',
      sort: [{ field: 'PublishedAt', direction: 'desc' }]
    }).all();

    // Cloudinary画像がない記事のみフィルタリング
    const targetRecords = records.filter(r => !hasCloudinaryThumbnail(r));

    console.log(`📋 対象記事: ${targetRecords.length}件\n`);

    if (targetRecords.length === 0) {
      console.log('✅ 全ての記事にCloudinary画像が設定されています！');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < targetRecords.length; i++) {
      const record = targetRecords[i];
      const title = record.fields.Title;
      const recordId = record.id;

      console.log(`\n[${i + 1}/${targetRecords.length}] ${title}`);
      console.log(`   Record ID: ${recordId}`);

      // カテゴリを判定
      const category = record.fields.Category || detectCategory(title);
      console.log(`   カテゴリ: ${category}`);

      try {
        // AI画像生成 & Cloudinaryアップロード
        const thumbnailUrl = await generateAndUploadThumbnail(category, title);

        if (!thumbnailUrl) {
          console.log(`   ⚠️  画像生成失敗、スキップします`);
          failCount++;

          // 失敗時も待機（レート制限回避）
          if ((i + 1) % 6 === 0 && i < targetRecords.length - 1) {
            console.log('   ⏸️  レート制限回避のため60秒待機...');
            await new Promise(resolve => setTimeout(resolve, 60000));
          } else {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          continue;
        }

        // Airtableを更新
        await base('News').update(recordId, {
          Thumbnail: [{ url: thumbnailUrl }]
        });

        console.log(`   ✅ サムネイル更新完了`);
        successCount++;

        // レート制限対策: 6件ごとに1分待機
        if ((i + 1) % 6 === 0 && i < targetRecords.length - 1) {
          console.log('   ⏸️  レート制限回避のため60秒待機...');
          await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
          // 通常は2秒待機
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`   ❌ エラー: ${error.message}`);
        failCount++;

        // エラー時も待機
        if ((i + 1) % 6 === 0 && i < targetRecords.length - 1) {
          console.log('   ⏸️  レート制限回避のため60秒待機...');
          await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    console.log('\n\n===========================================');
    console.log('🎉 サムネイル画像の入れ替えが完了しました！');
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ 失敗: ${failCount}件`);
    console.log('===========================================\n');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

regenerateRemainingThumbnails();
