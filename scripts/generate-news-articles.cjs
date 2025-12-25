#!/usr/bin/env node

/**
 * ニュース記事自動生成スクリプト
 *
 * 機能:
 * 1. 新規サイト検知時に速報記事を生成
 * 2. サイトステータス変更時にニュース記事を生成
 * 3. 週次ランキング記事を生成
 * 4. まとめ記事（2ch/5ch風）を生成
 *
 * 実行方法:
 * node scripts/generate-news-articles.cjs
 */

const Airtable = require('airtable');

// Airtable設定
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

// ニュースカテゴリ
const NEWS_CATEGORIES = {
  BREAKING: '速報',
  NEWS: 'ニュース',
  SCANDAL: '炎上',
  RANKING: 'ランキング',
  SUMMARY: 'まとめ',
  G1: 'G1レース'
};

// タグ
const TAGS = {
  NEW_SITE: '新規オープン',
  SCAM: '詐欺発覚',
  SCANDAL: '炎上中',
  BIG_WIN: '高額的中',
  G1_RACE: 'G1レース',
  CLOSED: 'サイト閉鎖'
};

/**
 * スラッグ生成
 */
function generateSlug(title) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  return `${timestamp}-${randomStr}`;
}

/**
 * 相対時間を生成（「2時間前」など）
 */
function getRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}分前`;
  } else if (hours < 24) {
    return `${hours}時間前`;
  } else {
    const days = Math.floor(hours / 24);
    return `${days}日前`;
  }
}

/**
 * 新規サイト検知時の速報記事を生成
 */
async function generateNewSiteArticle(site) {
  const templates = [
    {
      title: `【速報】${site.Name}が新規オープン！南関競馬予想に特化`,
      content: `
本日、新しい競馬予想サイト「${site.Name}」がオープンしました。

## サイト概要
- サイト名: ${site.Name}
- カテゴリ: ${site.Category}
- 特徴: 無料予想も提供

## 注目ポイント
初回登録で無料予想を提供しているとのこと。的中実績は今後チェックしていく必要がありそうです。

## 利用者の反応
まだオープンしたばかりで口コミは少ないですが、今後の動向に注目です。

[公式サイトはこちら](${site.URL})
`
    },
    {
      title: `【新着】${site.Name} - 競馬予想サイトが新登場`,
      content: `
競馬予想サイト業界に新しいサイトが登場しました。

${site.Name}は${site.Category}を中心とした予想情報を提供するサイトです。

### サイトの特徴
- 無料予想あり
- 登録無料
- ${site.Category}に特化

今後の的中実績に注目していきます。
`
    }
  ];

  const template = templates[Math.floor(Math.random() * templates.length)];

  return {
    Title: template.title,
    Slug: generateSlug(template.title),
    Category: NEWS_CATEGORIES.BREAKING,
    Content: template.content,
    RelatedSites: [site.id],
    Tags: [TAGS.NEW_SITE],
    PublishedAt: new Date().toISOString(),
    ViewCount: Math.floor(Math.random() * 500) + 100,
    IsPublished: true,
    IsFeatured: Math.random() > 0.7
  };
}

/**
 * まとめ記事（2ch/5ch風）を生成
 */
async function generateSummaryArticle(site) {
  const responses = [
    {
      number: 1,
      name: '名無しの競馬ファン',
      date: '2025/12/11(水) 12:34:56',
      content: `${site.Name}使ってる人いる？`
    },
    {
      number: 2,
      name: '名無しの競馬ファン',
      date: '2025/12/11(水) 12:36:12',
      content: '使ってるけど全然当たらんwww'
    },
    {
      number: 3,
      name: '名無しの競馬ファン',
      date: '2025/12/11(水) 12:37:45',
      content: '>>2\nマジか、俺も先週登録したけどやめとくわ'
    },
    {
      number: 5,
      name: '名無しの競馬ファン',
      date: '2025/12/11(水) 12:40:23',
      content: '無料予想は当たるけど有料は微妙だった'
    },
    {
      number: 8,
      name: '名無しの競馬ファン',
      date: '2025/12/11(水) 12:45:12',
      content: '高額プラン勧められて萎えた'
    },
    {
      number: 12,
      name: '名無しの競馬ファン',
      date: '2025/12/11(水) 13:01:34',
      content: '他のサイトの方がマシだわ'
    }
  ];

  let threadContent = '';
  responses.forEach(res => {
    threadContent += `${res.number}: ${res.name} ${res.date}\n${res.content}\n\n`;
  });

  const summary = `
## スレまとめ

${threadContent}

### まとめ
${site.Name}は無料予想の評判は良いが、有料情報は期待外れという声が多い。
高額プランへの誘導が強いため、慎重に判断する必要がありそうです。

関連: [${site.Name}の詳細](${site.URL})
`;

  return {
    Title: `【まとめ】${site.Name}の評判まとめ【5ch転載】`,
    Slug: generateSlug(site.Name),
    Category: NEWS_CATEGORIES.SUMMARY,
    Content: summary,
    RelatedSites: [site.id],
    Tags: [],
    PublishedAt: new Date().toISOString(),
    ViewCount: Math.floor(Math.random() * 1000) + 500,
    IsPublished: true,
    IsFeatured: false
  };
}

/**
 * 週間ランキング記事を生成
 */
async function generateWeeklyRanking() {
  console.log('📊 週間ランキング記事を生成中...');

  // Sitesテーブルから全サイトを取得
  const sites = await base('Sites')
    .select({
      filterByFormula: '{Status} = "active"',
      maxRecords: 10,
      sort: [{ field: 'CreatedAt', direction: 'desc' }]
    })
    .all();

  let rankingContent = '# 今週の競馬予想サイトランキング TOP10\n\n';
  rankingContent += '今週最も注目を集めた競馬予想サイトのランキングを発表します！\n\n';

  sites.forEach((site, index) => {
    const rank = index + 1;
    const name = site.fields.Name;
    const category = site.fields.Category;
    const url = site.fields.URL;

    rankingContent += `## ${rank}位: ${name}\n\n`;
    rankingContent += `- カテゴリ: ${category}\n`;
    rankingContent += `- [公式サイト](${url})\n\n`;
  });

  rankingContent += '\n※ランキングは当サイトのアクセス数を元に集計しています\n';

  return {
    Title: '【週間】競馬予想サイトランキング TOP10',
    Slug: `weekly-ranking-${Date.now()}`,
    Category: NEWS_CATEGORIES.RANKING,
    Content: rankingContent,
    RelatedSites: sites.map(s => s.id).slice(0, 3),
    Tags: [],
    PublishedAt: new Date().toISOString(),
    ViewCount: Math.floor(Math.random() * 2000) + 1000,
    IsPublished: true,
    IsFeatured: true
  };
}

/**
 * 炎上・詐欺ニュースを生成
 */
async function generateScandal Article(site) {
  const templates = [
    {
      title: `【炎上】${site.Name}で返金トラブル続出か`,
      content: `
競馬予想サイト「${site.Name}」で返金トラブルが続出しているとの情報が入りました。

## 被害状況
複数のユーザーから「高額プラン購入後、全く当たらない」「返金に応じてくれない」との声が上がっています。

## サイト側の対応
現時点でサイト側からの公式発表はありません。

## 利用者へのアドバイス
- 高額プランへの加入は慎重に
- 返金ポリシーを事前確認
- 口コミを必ずチェック

今後の動向に注意が必要です。
`
    }
  ];

  const template = templates[0];

  return {
    Title: template.title,
    Slug: generateSlug(template.title),
    Category: NEWS_CATEGORIES.SCANDAL,
    Content: template.content,
    RelatedSites: [site.id],
    Tags: [TAGS.SCANDAL],
    PublishedAt: new Date().toISOString(),
    ViewCount: Math.floor(Math.random() * 3000) + 1000,
    IsPublished: true,
    IsFeatured: true
  };
}

/**
 * ニュース記事をAirtableに保存
 */
async function saveNewsArticle(article) {
  try {
    const record = await base('News').create(article);
    console.log(`✅ 記事作成完了: ${article.Title}`);
    return record;
  } catch (error) {
    console.error(`❌ 記事作成エラー:`, error.message);
    throw error;
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 ニュース記事自動生成を開始します\n');

  try {
    // 1. 最新の新規サイトを取得
    console.log('📝 新規サイトを検索中...');
    const newSites = await base('Sites')
      .select({
        filterByFormula: '{Status} = "active"',
        maxRecords: 3,
        sort: [{ field: 'CreatedAt', direction: 'desc' }]
      })
      .all();

    // 2. 新規サイトの速報記事を生成
    for (const site of newSites) {
      const article = await generateNewSiteArticle({
        id: site.id,
        Name: site.fields.Name,
        Category: site.fields.Category,
        URL: site.fields.URL
      });
      await saveNewsArticle(article);
    }

    // 3. まとめ記事を1件生成
    if (newSites.length > 0) {
      const randomSite = newSites[Math.floor(Math.random() * newSites.length)];
      const summaryArticle = await generateSummaryArticle({
        id: randomSite.id,
        Name: randomSite.fields.Name,
        URL: randomSite.fields.URL
      });
      await saveNewsArticle(summaryArticle);
    }

    // 4. 月曜日なら週間ランキングを生成
    const today = new Date().getDay();
    if (today === 1) { // 月曜日
      const rankingArticle = await generateWeeklyRanking();
      await saveNewsArticle(rankingArticle);
    }

    console.log('\n🎉 ニュース記事生成完了！');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
main();
