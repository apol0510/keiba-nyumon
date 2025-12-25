#!/usr/bin/env node

/**
 * オプション3: AI記事自動生成
 *
 * Claude APIを使ってオリジナルのニュース記事を自動生成
 *
 * 実行方法:
 * ANTHROPIC_API_KEY=xxx AIRTABLE_API_KEY=xxx AIRTABLE_BASE_ID=xxx \
 * node scripts/generate-ai-news.cjs
 */

const Anthropic = require('@anthropic-ai/sdk');
const Airtable = require('airtable');
const { generateAndUploadThumbnail } = require('./lib/image-generator.cjs');

// Anthropic設定
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

let anthropic;
if (anthropicApiKey) {
  anthropic = new Anthropic({
    apiKey: anthropicApiKey,
  });
}

// Airtable設定
const airtableApiKey = process.env.KEIBA_GUIDE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const baseId = process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || 'appiHsDBAFFSmCiBV';

let base;
if (airtableApiKey) {
  base = new Airtable({ apiKey: airtableApiKey }).base(baseId);
}

/**
 * スラッグ生成
 */
function generateSlug(title) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  return `${timestamp}-${randomStr}`;
}

/**
 * 記事テンプレート
 */
const ARTICLE_TEMPLATES = [
  {
    type: 'howto',
    titleTemplate: '【初心者向け】{topic}の選び方ガイド',
    category: 'ニュース',
    tags: ['初心者向け', 'ガイド'],
    structure: ['導入', 'ポイント3選', '注意点', 'まとめ'],
    prompt: `
あなたは競馬予想サイトのニュースライターです。
以下のトピックで初心者向けの記事を800-1200文字で書いてください。

トピック: {topic}

要件:
- 競馬初心者にもわかりやすく
- SEOを意識したキーワード配置（競馬予想、買い目、的中率など）
- 客観的で中立的な視点
- 具体例を3つ以上含める

記事構成:
1. 導入（100文字）
2. ポイント3選（各200文字、合計600文字）
3. 注意点（200文字）
4. まとめ（100-200文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
  },
  {
    type: 'ranking',
    titleTemplate: '【2025年版】{topic}おすすめランキングTOP5',
    category: 'ランキング',
    tags: ['ランキング', 'おすすめ'],
    structure: ['導入', '1位〜5位', '比較表', 'まとめ'],
    prompt: `
あなたは競馬予想サイトのニュースライターです。
以下のトピックでランキング記事を800-1200文字で書いてください。

トピック: {topic}

要件:
- 客観的な基準でランキングを作成
- 各サイトの特徴を明確に記述
- SEOを意識したキーワード配置
- 読者が選びやすいように比較

記事構成:
1. 導入（100文字）
2. 1位〜5位（各150文字、合計750文字）
3. まとめ（100-200文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
  },
  {
    type: 'news',
    titleTemplate: '【速報】{topic}に関する最新情報',
    category: '速報',
    tags: ['速報', '最新情報'],
    structure: ['概要', '詳細', '影響', 'まとめ'],
    prompt: `
あなたは競馬予想サイトのニュースライターです。
以下のトピックで速報記事を600-1000文字で書いてください。

トピック: {topic}

要件:
- 速報性を意識した文体
- 事実ベースで客観的に記述
- SEOを意識したキーワード配置
- 読者の関心を引く内容

記事構成:
1. 概要（100文字）
2. 詳細（400-600文字）
3. 影響・まとめ（100-200文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
  },
  {
    type: 'tips',
    titleTemplate: '【必読】{topic}で成功するための5つのコツ',
    category: 'ニュース',
    tags: ['ノウハウ', 'コツ'],
    structure: ['導入', 'コツ5選', 'まとめ'],
    prompt: `
あなたは競馬予想サイトのニュースライターです。
以下のトピックで実践的なコツを紹介する記事を800-1200文字で書いてください。

トピック: {topic}

要件:
- 実践的で具体的なコツを提示
- 初心者でも実行できる内容
- SEOを意識したキーワード配置
- 説得力のある説明

記事構成:
1. 導入（100文字）
2. コツ5選（各150文字、合計750文字）
3. まとめ（100-200文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
  },
  {
    type: 'comparison',
    titleTemplate: '【徹底比較】{topic}：どちらを選ぶべき？',
    category: 'まとめ',
    tags: ['比較', '選び方'],
    structure: ['導入', 'A vs B', '判断基準', 'まとめ'],
    prompt: `
あなたは競馬予想サイトのニュースライターです。
以下のトピックで比較記事を800-1200文字で書いてください。

トピック: {topic}

要件:
- 公平な視点で比較
- メリット・デメリットを明確に
- SEOを意識したキーワード配置
- 読者が判断しやすい構成

記事構成:
1. 導入（100文字）
2. 比較詳細（600-800文字）
3. 判断基準とまとめ（100-300文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
  }
];

/**
 * トピック一覧
 */
const TOPICS = [
  '競馬予想サイトの選び方',
  '無料予想と有料予想の違い',
  '南関競馬予想サイト',
  '地方競馬予想サイト',
  'JRA（中央競馬）予想サイト',
  '競馬予想サイトの的中率',
  '悪質な競馬予想サイトの見分け方',
  '競馬予想サイトの返金トラブル',
  '競馬予想AIと人間予想家',
  '競馬データ分析サイト',
  '競馬初心者向け予想サイト',
  '高額配当を狙える予想サイト',
  '競馬予想サイトの口コミの信頼性',
  '競馬予想サイトの登録方法',
  '競馬予想サイトの解約方法'
];

/**
 * Claude APIで記事を生成
 */
async function generateArticle(template, topic) {
  console.log(`🤖 AI記事生成中: ${template.titleTemplate.replace('{topic}', topic)}`);

  const prompt = template.prompt.replace(/{topic}/g, topic);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = message.content[0].text;
    const title = template.titleTemplate.replace('{topic}', topic);

    // Excerptを生成（最初の200文字）
    const excerpt = content
      .replace(/^#.*\n/gm, '') // 見出しを削除
      .replace(/\n/g, ' ')      // 改行を削除
      .substring(0, 200)
      .trim();

    console.log(`  ✅ 生成完了（${content.length}文字）`);

    // 日本時間で公開日時を設定（YYYY-MM-DDTHH:mm:ss.000Z形式）
    const now = new Date();
    const publishedAt = new Date(now.getTime() + (9 * 60 * 60 * 1000)).toISOString(); // JST = UTC+9

    return {
      Title: title,
      Slug: generateSlug(title),
      Category: template.category,
      Excerpt: excerpt,
      Content: content.trim(),
      PublishedAt: publishedAt,
      Status: 'published',
      IsFeatured: Math.random() < 0.3, // 30%の確率で注目記事
      Author: 'AI編集部'
    };

  } catch (error) {
    console.error('  ❌ AI生成エラー:', error.message);
    return null;
  }
}

/**
 * ニュース記事をAirtableに保存
 */
async function saveNewsArticle(article, thumbnailUrl = null) {
  try {
    // サムネイルURLを追加
    const articleData = { ...article };
    if (thumbnailUrl) {
      articleData.ThumbnailUrl = thumbnailUrl;
    }

    const record = await base('News').create(articleData);
    console.log(`✅ 記事作成完了: ${article.Title}`);
    return record;
  } catch (error) {
    console.error(`❌ 記事作成エラー:`, error.message);
    return null;
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 AI記事自動生成を開始します\n');

  // 環境変数チェック
  if (!anthropicApiKey) {
    console.error('❌ ANTHROPIC_API_KEY が設定されていません');
    process.exit(1);
  }

  if (!airtableApiKey) {
    console.error('❌ KEIBA_GUIDE_AIRTABLE_API_KEY または AIRTABLE_API_KEY が設定されていません');
    process.exit(1);
  }

  console.log(`📊 Airtable Base: ${baseId}`);
  console.log(`🤖 AI Model: Claude Sonnet 4.5\n`);

  // 生成する記事数（デフォルト: 3記事）
  const articleCount = parseInt(process.env.ARTICLE_COUNT || '3', 10);

  const generatedArticles = [];

  for (let i = 0; i < articleCount; i++) {
    // ランダムにテンプレートとトピックを選択
    const template = ARTICLE_TEMPLATES[Math.floor(Math.random() * ARTICLE_TEMPLATES.length)];
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

    const article = await generateArticle(template, topic);

    if (article) {
      generatedArticles.push(article);

      // サムネイル画像を生成（Unsplash固定プールから選択）
      const thumbnailUrl = await generateAndUploadThumbnail(
        template.category,
        article.Title,
        null // recordIdは後で取得するため、ここではnull
      );

      // Airtableに保存
      const record = await saveNewsArticle(article, thumbnailUrl);

      // レート制限対策（Claude APIは1分あたり50リクエスト）
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒待機
    }
  }

  console.log(`\n🎉 AI記事生成完了！ (${generatedArticles.length}件)`);
  console.log(`\n💰 コスト試算:`);
  console.log(`  入力トークン: 約500 tokens × ${generatedArticles.length}記事 = 約${500 * generatedArticles.length} tokens`);
  console.log(`  出力トークン: 約1500 tokens × ${generatedArticles.length}記事 = 約${1500 * generatedArticles.length} tokens`);
  console.log(`  推定コスト: 約${(generatedArticles.length * 0.024).toFixed(2)}ドル（約${(generatedArticles.length * 3.6).toFixed(0)}円）`);
}

// 実行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  });
}

module.exports = { generateArticle, ARTICLE_TEMPLATES, TOPICS };
