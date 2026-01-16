/**
 * CTR改善施策: タイトル・Excerpt一括更新スクリプト
 */

const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ エラー: 環境変数が設定されていません');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// 更新対象記事の定義
const updates = [
  {
    oldTitle: 'オッズの見方と的中率の関係を初心者向けに解説',
    newTitle: '【図解で簡単】オッズの見方を3分で解説｜初心者が知るべき的中率アップのコツ',
    newExcerpt: 'オッズの見方を初心者向けに図解で解説。オッズが低い＝人気馬、オッズが高い＝穴馬の見極め方から、的中率アップのコツまでわかりやすく説明します。競馬場・ネット投票でのオッズの確認方法も紹介。',
  },
  {
    oldTitle: '馬券購入方法を徹底解説（競馬場/WINS/ネット投票）',
    newTitle: '【2026年最新】馬券の買い方完全ガイド｜競馬場・WINS・ネット投票を徹底比較',
    newExcerpt: '2026年最新版！馬券の買い方を競馬場・WINS・ネット投票の3つの方法で徹底比較。初心者におすすめの購入方法から、PAT・SPAT4・楽天競馬などのネット投票サービスの登録方法まで完全ガイド。',
  },
];

async function updateArticles() {
  console.log('🚀 CTR改善施策: 記事タイトル・Excerpt更新開始\n');

  for (const update of updates) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📝 対象記事: "${update.oldTitle}"`);

    // 該当記事を検索
    const records = await base('News')
      .select({
        filterByFormula: `AND({Status} = "published", {Title} = "${update.oldTitle}")`,
      })
      .all();

    if (records.length === 0) {
      console.log('   ❌ 該当記事が見つかりませんでした\n');
      continue;
    }

    console.log(`   ✅ ${records.length}件の記事を発見\n`);

    // すべての該当記事を更新
    let successCount = 0;
    for (const record of records) {
      try {
        await base('News').update(record.id, {
          Title: update.newTitle,
          Excerpt: update.newExcerpt,
        });
        console.log(`   ✓ 更新成功: ${record.id} (Slug: ${record.fields.Slug})`);
        successCount++;
      } catch (error) {
        console.error(`   ✗ 更新失敗: ${record.id}`, error.message);
      }
    }

    console.log(`\n   📊 更新結果: ${successCount}/${records.length}件成功\n`);
    console.log(`   🆕 新タイトル:`);
    console.log(`      ${update.newTitle}\n`);
    console.log(`   📝 新Excerpt:`);
    console.log(`      ${update.newExcerpt}\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ CTR改善施策完了！\n');
  console.log('📌 次のステップ:');
  console.log('1. npm run build でローカルビルド');
  console.log('2. netlify deploy --prod で本番デプロイ');
  console.log('3. 1週間後にGSCでCTRを確認');
}

updateArticles().catch(err => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
