#!/usr/bin/env node

/**
 * AI記事生成のモックテスト（API不要）
 * 実際のAPI呼び出しなしで記事生成をシミュレート
 */

const Airtable = require('airtable');

const airtableApiKey = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const baseId = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || 'appiHsDBAFFSmCiBV';

if (!airtableApiKey) {
  console.error('❌ AIRTABLE_API_KEY must be set');
  process.exit(1);
}

const base = new Airtable({ apiKey: airtableApiKey }).base(baseId);

function generateSlug(title) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  return `${timestamp}-${randomStr}`;
}

const ARTICLE_TEMPLATES = [
  {
    type: 'howto',
    titleTemplate: '【初心者向け】{topic}の選び方ガイド',
    category: 'ニュース',
    tags: ['初心者向け', 'ガイド']
  },
  {
    type: 'ranking',
    titleTemplate: '【2025年版】{topic}おすすめランキングTOP5',
    category: 'ランキング',
    tags: ['ランキング', 'おすすめ']
  }
];

const TOPICS = [
  '競馬予想サイトの選び方',
  '南関競馬予想サイト',
  '地方競馬予想サイト'
];

// モック記事コンテンツ
function generateMockContent(title) {
  return `
## はじめに

${title}について詳しく解説します。競馬予想サイトを選ぶ際には、いくつかの重要なポイントがあります。

## ポイント1: 的中率の確認

まず最初に確認すべきは、サイトの的中率です。過去の実績をしっかりと確認しましょう。

- 無料予想の的中実績
- 有料予想の的中実績
- レース別の的中率

## ポイント2: 口コミの信頼性

次に重要なのは、実際の利用者の口コミです。以下の点をチェックしましょう。

- 口コミの数
- 評価の分布
- 具体的な体験談

## ポイント3: 料金体系の透明性

料金体系が明確かどうかも重要なポイントです。

- 無料プランの有無
- 有料プランの価格
- 返金ポリシー

## ポイント4: サポート体制

困った時のサポート体制も確認しましょう。

- 問い合わせ方法
- 対応時間
- 返信速度

## ポイント5: 情報の質

提供される情報の質も重要です。

- データの新鮮さ
- 分析の深さ
- 予想の根拠

## まとめ

競馬予想サイト選びは慎重に行いましょう。上記の5つのポイントを押さえることで、自分に合ったサイトを見つけることができます。

まずは無料予想から試してみて、実際の使い心地を確認することをおすすめします。
`;
}

async function saveNewsArticle(article) {
  try {
    const record = await base('News').create(article);
    console.log(`✅ 記事作成完了: ${article.Title}`);
    return record;
  } catch (error) {
    console.error(`❌ 記事作成エラー:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🧪 AI記事生成のモックテスト開始\n');
  console.log(`📊 Airtable Base: ${baseId}\n`);

  const articleCount = parseInt(process.env.ARTICLE_COUNT || '3', 10);

  console.log(`📝 ${articleCount}件の記事を生成します\n`);

  const generatedArticles = [];

  for (let i = 0; i < articleCount; i++) {
    // ランダムにテンプレートとトピックを選択
    const template = ARTICLE_TEMPLATES[Math.floor(Math.random() * ARTICLE_TEMPLATES.length)];
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const title = template.titleTemplate.replace('{topic}', topic);

    console.log(`🤖 モック記事生成中 (${i + 1}/${articleCount}): ${title}`);

    const content = generateMockContent(title);
    const excerpt = content
      .replace(/^#.*\n/gm, '')
      .replace(/\n/g, ' ')
      .substring(0, 200)
      .trim();

    const article = {
      Title: title,
      Slug: generateSlug(title),
      Category: template.category,
      Excerpt: excerpt,
      Content: content.trim(),
      PublishedAt: new Date().toISOString().split('T')[0], // YYYY-MM-DD形式
      Status: 'published',
      IsFeatured: Math.random() < 0.3,
      Author: 'テスト編集部'
    };

    generatedArticles.push(article);

    // Airtableに保存
    await saveNewsArticle(article);

    // レート制限対策
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`  ✅ 生成完了（${content.length}文字）\n`);
  }

  console.log(`🎉 モックテスト完了！ (${generatedArticles.length}件)`);
  console.log(`\n💡 実際のAI生成を試すには:`);
  console.log(`   ANTHROPIC_API_KEY=xxx npm run generate:ai`);
  console.log(`\n⚠️  テスト記事は後で削除してください:`);
  console.log(`   AIRTABLE_API_KEY=xxx node scripts/delete-all-news.cjs`);
}

main().catch(error => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
