require('dotenv').config();
const Airtable = require('airtable');

const base = new Airtable({
  apiKey: process.env.KEIBA_GUIDE_AIRTABLE_API_KEY
}).base(process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID);

base('News').select({
  maxRecords: 10,
  sort: [{field: 'PublishedAt', direction: 'desc'}],
  filterByFormula: '{Status} = "published"'
}).firstPage((err, records) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(`Total published records: ${records.length}\n`);

  // Cloudinary画像を使っている記事を探す
  const aiGeneratedArticles = records.filter(r =>
    r.fields.Thumbnail && r.fields.Thumbnail[0]?.url?.includes('cloudinary')
  );

  console.log(`AI生成画像付き記事: ${aiGeneratedArticles.length}件\n`);

  records.forEach((r, i) => {
    const isAI = r.fields.Thumbnail?.[0]?.url?.includes('cloudinary');
    console.log(`${i + 1}. ${r.fields.Title?.substring(0, 60)} ${isAI ? '🎨 AI' : ''}`);
    console.log(`   Status: ${r.fields.Status}`);
    console.log(`   PublishedAt: ${r.fields.PublishedAt}`);
    console.log(`   Has Thumbnail: ${r.fields.Thumbnail ? 'YES' : 'NO'}`);
    if (r.fields.Thumbnail) {
      const url = r.fields.Thumbnail[0]?.url;
      console.log(`   Thumbnail: ${url?.substring(0, 70)}...`);
    }
    console.log('');
  });
});
