#!/usr/bin/env node

/**
 * Airtableから記事を取得して画像URLをデバッグ
 */

require('dotenv').config();
const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.KEIBA_GUIDE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Airtable認証情報が設定されていません');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function debugImages() {
  console.log('🔍 Airtableから記事を取得中...\n');

  try {
    const records = await base('News')
      .select({
        maxRecords: 5,
      })
      .all();

    console.log(`📊 取得件数: ${records.length}件\n`);

    records.forEach((record, index) => {
      const fields = record.fields;
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`記事 ${index + 1}: ${fields.Title}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`ID: ${record.id}`);
      console.log(`Slug: ${fields.Slug}`);
      console.log(`Category: ${fields.Category}`);
      console.log(`Status: ${fields.Status}`);
      console.log(`\n📸 Thumbnail情報:`);

      if (fields.Thumbnail) {
        console.log(`  タイプ: ${typeof fields.Thumbnail}`);
        console.log(`  配列?: ${Array.isArray(fields.Thumbnail)}`);

        if (Array.isArray(fields.Thumbnail)) {
          console.log(`  要素数: ${fields.Thumbnail.length}`);
          fields.Thumbnail.forEach((img, i) => {
            console.log(`\n  画像 ${i + 1}:`);
            console.log(`    URL: ${img.url || 'なし'}`);
            console.log(`    filename: ${img.filename || 'なし'}`);
            console.log(`    type: ${img.type || 'なし'}`);
            console.log(`    size: ${img.size || 'なし'} bytes`);
          });
        } else {
          console.log(`  生データ:`, JSON.stringify(fields.Thumbnail, null, 2));
        }
      } else {
        console.log(`  ❌ Thumbnailフィールドが存在しません`);
      }
    });

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

debugImages();
