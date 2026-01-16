/**
 * CTR改善対象記事を検索
 * GSCで表示されているのにクリックゼロの記事を特定
 */

const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ エラー: 環境変数が設定されていません');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// GSCで特定されたクリックゼロのクエリ
const targetKeywords = [
  { query: 'オッズが上がるとは', impressions: 11, clicks: 0 },
  { query: '競馬 馬券 購入', impressions: 11, clicks: 0 },
  { query: 'オッズ 見方', impressions: 9, clicks: 0 }
];

async function findArticles() {
  console.log('🔍 CTR改善対象記事を検索中...\n');

  // 全記事を取得
  const records = await base('News')
    .select({
      filterByFormula: '{Status} = "published"',
      sort: [{ field: 'PublishedAt', direction: 'desc' }],
    })
    .all();

  console.log(`✅ 総記事数: ${records.length}件\n`);

  // 各キーワードに該当する記事を検索
  for (const keyword of targetKeywords) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔎 キーワード: "${keyword.query}"`);
    console.log(`   GSC: 表示${keyword.impressions}回、クリック${keyword.clicks}回\n`);

    const matchingArticles = records.filter(record => {
      const title = record.fields.Title || '';
      const content = record.fields.Content || '';
      const excerpt = record.fields.Excerpt || '';

      // タイトル・本文・要約にキーワードが含まれるか
      const searchText = `${title} ${content} ${excerpt}`.toLowerCase();
      const keywords = keyword.query.split(' ');

      return keywords.some(kw => searchText.includes(kw));
    });

    if (matchingArticles.length === 0) {
      console.log('   ❌ 該当記事なし\n');
      continue;
    }

    console.log(`   ✅ 該当記事: ${matchingArticles.length}件\n`);

    // 上位3件を表示
    matchingArticles.slice(0, 3).forEach((record, idx) => {
      const fields = record.fields;
      console.log(`   ${idx + 1}. 【${fields.Category}】${fields.Title}`);
      console.log(`      Slug: ${fields.Slug}`);
      console.log(`      RecordID: ${record.id}`);
      console.log(`      Excerpt: ${fields.Excerpt?.substring(0, 100)}...`);
      console.log();
    });
  }

  console.log('\n📊 推奨改善案');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. "オッズが上がるとは" → 【初心者必見】オッズが上がるとは？3分でわかる競馬の基礎知識');
  console.log('2. "競馬 馬券 購入" → 【2026年最新】競馬の馬券購入方法を完全ガイド｜ネット・競馬場・WINS');
  console.log('3. "オッズ 見方" → 【図解】オッズの見方を初心者向けに解説｜的中率アップのコツ');
  console.log();
  console.log('💡 改善ポイント:');
  console.log('- 【】でキャッチーに');
  console.log('- 数字を使う（3分、2026年など）');
  console.log('- ベネフィットを明示（初心者向け、的中率アップなど）');
  console.log('- 記号を使う（｜で区切る）');
}

findArticles().catch(err => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
