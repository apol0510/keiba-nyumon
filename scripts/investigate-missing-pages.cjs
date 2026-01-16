/**
 * 「検出 - インデックス未登録」61ページの原因調査スクリプト
 */

const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ エラー: 環境変数が設定されていません');
  console.error('KEIBA_NYUMON_AIRTABLE_API_KEY:', !!AIRTABLE_API_KEY);
  console.error('KEIBA_NYUMON_AIRTABLE_BASE_ID:', !!AIRTABLE_BASE_ID);
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// GSCで「該当なし」と報告されたURL一覧（抜粋）
const missingUrls = [
  'https://keiba-nyumon.jp/news/1766736224697-bwhlv/',
  'https://keiba-nyumon.jp/news/1766736373572-57c6w/',
  'https://keiba-nyumon.jp/news/1766736459419-7ytsdl/',
  'https://keiba-nyumon.jp/news/1766736571631-yma65n/',
  'https://keiba-nyumon.jp/news/1766736632016-4v91p/',
  // ... 残り56件は省略
];

async function investigate() {
  console.log('🔍 調査開始...\n');

  // 1. Airtableの総記事数を取得
  console.log('1️⃣ Airtableの総記事数を確認中...');
  const allRecords = await base('News')
    .select({
      fields: ['Slug', 'Status', 'PublishedAt', 'Title'],
      filterByFormula: "{Status} = 'published'"
    })
    .all();

  console.log(`✅ Airtable: ${allRecords.length}件の記事（Status=published）\n`);

  // 2. Slugの形式を確認
  console.log('2️⃣ Slugの形式を確認中...');
  const slugs = allRecords.map(r => r.fields.Slug);
  const timestampSlugs = slugs.filter(s => /^\d{13}-\w+$/.test(s));
  console.log(`  - タイムスタンプ形式のSlug: ${timestampSlugs.length}件`);
  console.log(`  - その他の形式: ${slugs.length - timestampSlugs.length}件\n`);

  // 3. GSCの「該当なし」URLのSlugを抽出
  console.log('3️⃣ GSCの「該当なし」URLを解析中...');
  const missingDetailedUrls = [
    '1766736224697-bwhlv', '1766736373572-57c6w', '1766736459419-7ytsdl',
    '1766736571631-yma65n', '1766736632016-4v91p', '1766736659358-j8jx6w',
    '1766736775283-9lyueh', '1766736829138-xxfrd', '1766736832017-yyd8kp',
    '1766736838890-fxzmt', '1766736862958-tq91s', '1766736863349-1npbmk',
    '1766736867243-ksxm9k', '1766736895870-rah5r6j', '1766736931819-ogvnf',
    '1766736950659-imugoe', '1766736958158-5vlnjh', '1766736988278-0xm7y',
    '1766737006010-hfkipe', '1766737013278-yq9rfi', '1766737021652-h2qh1l',
    '1766737040719-whsnxa', '1766737068695-p7lrjb', '1766737076098-yl5dny',
    '1766737097983-mt02vm', '1766737117089-c56b0e', '1766737127124-3y1rphu',
    '1766737187966-mvdc58', '1766793153550-ug5chk', '1766870414436-qajn8',
    '1766956830829-cp4rg', '1766956891046-ftsnce', '1767043289138-9xm2i',
    '1767043317179-2i0fum', '1767129691133-36jteh', '1767129718482-g9cres',
    '1767129752842-ueucd', '1767302511683-6pkei7', '1767302542404-w2olrh',
    '1767302569946-oj2fcp', '1767388684348-h9axz4s', '1767561659993-dnf15',
    '1767648195178-ynvez', '1767648236332-3qo54o', '1767648263575-25b0ee',
    '1767734586351-edquml', '1767734618249-brszl', '1767734651475-bhkops',
    '1767768904483-qjwgpg', '1767769373175-fbqvkg', '1767770550887-x8yoqb',
    '1767820951319-u68tf', '1767820984559-449m89', '1767821011543-x3yrt9',
    '1767993839672-m3zj2p', '1768080017027-s1l5a2', '1768080046819-0p3kgp',
    '1768080076285-p1506', '1768166443000-joqid', '1768166477908-w8kxkw',
    '1768166506919-eyzorc'
  ];

  console.log(`  - GSCの「該当なし」URL: ${missingDetailedUrls.length}件\n`);

  // 4. Airtableに存在するか確認
  console.log('4️⃣ Airtableに該当Slugが存在するか確認中...');
  const existsInAirtable = missingDetailedUrls.filter(slug => slugs.includes(slug));
  const notExistsInAirtable = missingDetailedUrls.filter(slug => !slugs.includes(slug));

  console.log(`  ✅ Airtableに存在: ${existsInAirtable.length}件`);
  console.log(`  ❌ Airtableに存在しない: ${notExistsInAirtable.length}件\n`);

  if (existsInAirtable.length > 0) {
    console.log('📝 Airtableに存在するのにGSCで404になっているSlug:');
    existsInAirtable.slice(0, 5).forEach(slug => {
      const record = allRecords.find(r => r.fields.Slug === slug);
      console.log(`  - ${slug}: ${record?.fields.Title || 'タイトル不明'}`);
    });
    if (existsInAirtable.length > 5) {
      console.log(`  ... 他${existsInAirtable.length - 5}件\n`);
    }
  }

  // 5. タイムスタンプの日付範囲を確認
  console.log('\n5️⃣ 「該当なし」URLのタイムスタンプを解析中...');
  const timestamps = missingDetailedUrls.map(slug => {
    const match = slug.match(/^(\d{13})-/);
    return match ? parseInt(match[1]) : null;
  }).filter(t => t !== null);

  const minDate = new Date(Math.min(...timestamps));
  const maxDate = new Date(Math.max(...timestamps));

  console.log(`  - 最古: ${minDate.toISOString()} (${minDate.toLocaleString('ja-JP')})`);
  console.log(`  - 最新: ${maxDate.toISOString()} (${maxDate.toLocaleString('ja-JP')})\n`);

  // 6. サマリー
  console.log('\n📊 サマリー');
  console.log('━'.repeat(60));
  console.log(`Airtable総記事数: ${allRecords.length}件`);
  console.log(`GSC「該当なし」URL: ${missingDetailedUrls.length}件`);
  console.log(`  - Airtableに存在: ${existsInAirtable.length}件 (ビルドエラーの可能性)`);
  console.log(`  - Airtableに存在しない: ${notExistsInAirtable.length}件 (削除済み記事)`);
  console.log('━'.repeat(60));

  console.log('\n🔍 結論:');
  if (notExistsInAirtable.length === missingDetailedUrls.length) {
    console.log('✅ すべての「該当なし」URLはAirtableから削除済みの記事です。');
    console.log('👉 対策: GSCで「修正を検証」をクリックして、Googleに削除を通知してください。');
  } else if (existsInAirtable.length > 0) {
    console.log('⚠️ 一部の記事はAirtableに存在するのに404になっています。');
    console.log('👉 対策: ビルドエラーの可能性があります。再ビルド・再デプロイを試してください。');
  }
}

investigate().catch(err => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
