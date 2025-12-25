const Airtable = require('airtable');

const KEIBA_GUIDE_AIRTABLE_API_KEY = process.env.KEIBA_GUIDE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const KEIBA_GUIDE_AIRTABLE_BASE_ID = process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!KEIBA_GUIDE_AIRTABLE_API_KEY || !KEIBA_GUIDE_AIRTABLE_BASE_ID) {
  console.error('❌ API credentials not set');
  process.exit(1);
}

const base = new Airtable({ apiKey: KEIBA_GUIDE_AIRTABLE_API_KEY }).base(KEIBA_GUIDE_AIRTABLE_BASE_ID);

base('News').select({
  filterByFormula: '{Status} = "published"',
  sort: [{ field: 'PublishedAt', direction: 'desc' }],
  maxRecords: 10
}).all().then(records => {
  console.log('=== トップページ10記事の画像URL確認 ===\n');
  const imageUrls = {};

  records.forEach((record, i) => {
    const title = record.fields.Title;
    const thumbnail = record.fields.Thumbnail?.[0]?.url || 'なし';
    const recordId = record.id;

    console.log(`[${i+1}] ${title}`);
    console.log(`    Record ID: ${recordId}`);
    console.log(`    画像URL: ${thumbnail.substring(0, 80)}...`);

    if (imageUrls[thumbnail]) {
      console.log(`    ⚠️  重複！記事[${imageUrls[thumbnail]}]と同じ画像`);
    } else {
      imageUrls[thumbnail] = i+1;
    }
    console.log('');
  });

  const uniqueImages = Object.keys(imageUrls).length;
  console.log(`✅ 画像の種類: ${uniqueImages}枚 / 10記事`);
  if (uniqueImages === 10) {
    console.log('🎉 全て異なる画像です！');
  } else {
    console.log(`⚠️  重複数: ${10 - uniqueImages}件`);
  }
}).catch(err => {
  console.error('❌ エラー:', err.message);
});
