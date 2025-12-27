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
const airtableApiKey = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const baseId = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || 'appiHsDBAFFSmCiBV';

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
 * カテゴリ別記事テンプレート（keiba-nyumon用）
 */
const CATEGORY_TEMPLATES = {
  kiso: [
    {
      title: '【完全初心者向け】競馬の始め方ガイド',
      category: 'kiso',
      tags: ['初心者', '始め方'],
      prompt: `
あなたは競馬入門ガイドのライターです。
「競馬の始め方」について初心者向けの記事を800-1200文字で書いてください。

要件:
- 競馬を全く知らない人にもわかりやすく
- 競馬場への行き方、馬券の買い方など具体的に
- やさしく親しみやすい文体
- 不安を取り除く内容

記事構成:
1. 競馬とは（100文字）
2. 競馬の楽しみ方3つ（400文字）
3. 初心者が知っておくべきこと（300文字）
4. まとめ（100文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
    },
    {
      title: '競馬場の見方・楽しみ方完全ガイド',
      category: 'kiso',
      tags: ['競馬場', '楽しみ方'],
      prompt: `
あなたは競馬入門ガイドのライターです。
「競馬場の見方・楽しみ方」について初心者向けの記事を800-1200文字で書いてください。

要件:
- 競馬場初心者にもわかりやすく
- パドック、返し馬など競馬場の見どころを解説
- 施設やイベントについても触れる
- 楽しい雰囲気が伝わる文体

記事構成:
1. 競馬場の魅力（100文字）
2. 競馬場の見どころ5つ（600文字）
3. 初心者向けのアドバイス（200文字）
4. まとめ（100文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
    },
    {
      title: 'レースの種類と格付け（G1/G2/G3）を初心者向けに解説',
      category: 'kiso',
      tags: ['レース', '格付け'],
      prompt: `
あなたは競馬入門ガイドのライターです。
「レースの種類と格付け」について初心者向けの記事を800-1200文字で書いてください。

要件:
- G1/G2/G3の違いをわかりやすく
- 重賞レース、オープン戦、条件戦など階級を説明
- 有名なG1レースの例を挙げる
- 専門用語には補足説明

記事構成:
1. レースの格付けとは（100文字）
2. G1/G2/G3の違い（400文字）
3. その他のレース種類（300文字）
4. まとめ（100文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
    }
  ],
  baken: [
    {
      title: '馬券の種類を初心者向けに解説（単勝/複勝/馬連/馬単/ワイド/3連複/3連単）',
      category: 'baken',
      tags: ['馬券', '種類'],
      prompt: `
あなたは競馬入門ガイドのライターです。
「馬券の種類」について初心者向けの記事を1000-1500文字で書いてください。

要件:
- 単勝/複勝/馬連/馬単/ワイド/3連複/3連単を順番に説明
- それぞれの当たりやすさと配当の関係
- 初心者におすすめの馬券
- 図解的な説明を文章で表現

記事構成:
1. 馬券とは（100文字）
2. 各馬券の種類と特徴（900文字）
3. 初心者向けのアドバイス（200文字）
4. まとめ（100文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
    },
    {
      title: 'オッズの見方と的中率の関係を初心者向けに解説',
      category: 'baken',
      tags: ['オッズ', '的中率'],
      prompt: `
あなたは競馬入門ガイドのライターです。
「オッズの見方」について初心者向けの記事を800-1200文字で書いてください。

要件:
- オッズとは何かをわかりやすく
- オッズと的中率・配当の関係
- 人気馬と穴馬の考え方
- 初心者がオッズをどう活用すべきか

記事構成:
1. オッズとは（100文字）
2. オッズの見方と計算（400文字）
3. オッズと的中率の関係（300文字）
4. まとめ（100文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
    },
    {
      title: '馬券購入方法を徹底解説（競馬場/WINS/ネット投票）',
      category: 'baken',
      tags: ['馬券購入', '方法'],
      prompt: `
あなたは競馬入門ガイドのライターです。
「馬券購入方法」について初心者向けの記事を800-1200文字で書いてください。

要件:
- 競馬場、WINS、ネット投票の3つの方法を説明
- それぞれのメリット・デメリット
- ネット投票の始め方
- 初心者向けのアドバイス

記事構成:
1. 馬券を買う場所（100文字）
2. 3つの購入方法の特徴（600文字）
3. 初心者におすすめの方法（200文字）
4. まとめ（100文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
    }
  ],
  yougo: [
    {
      title: '競馬用語50選（あ行〜わ行）初心者必見！',
      category: 'yougo',
      tags: ['用語集', '初心者'],
      prompt: `
あなたは競馬入門ガイドのライターです。
「競馬用語集」として初心者が知っておくべき用語を1200-1800文字で紹介してください。

要件:
- 最重要用語を30-50個厳選
- 各用語を簡潔に説明（1用語30-50文字）
- あいうえお順、またはカテゴリ別に整理
- レース、馬、馬券など幅広く

記事構成:
1. 競馬用語を覚えるメリット（100文字）
2. 重要用語30-50個（1000文字）
3. まとめ（100文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
    },
    {
      title: '血統用語を初心者向けに解説（サンデーサイレンス/ノーザンダンサーなど）',
      category: 'yougo',
      tags: ['血統', '用語'],
      prompt: `
あなたは競馬入門ガイドのライターです。
「血統用語」について初心者向けの記事を800-1200文字で書いてください。

要件:
- 血統とは何かをわかりやすく
- 有名種牡馬の名前と特徴
- 父系・母系の考え方
- 初心者が血統をどう活用すべきか

記事構成:
1. 血統とは（100文字）
2. 有名種牡馬10選（600文字）
3. 血統の見方（200文字）
4. まとめ（100文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
    }
  ],
  nankan: [
    {
      title: '南関東競馬とは？JRAとの違いを徹底解説',
      category: 'nankan',
      tags: ['南関東', 'JRA'],
      prompt: `
あなたは競馬入門ガイドのライターです。
「南関東競馬」について初心者向けの記事を800-1200文字で書いてください。

要件:
- 南関東競馬（大井・川崎・船橋・浦和）の説明
- JRAとの違い（開催日、ナイター、賞金など）
- 南関東競馬の魅力
- 初心者が楽しむためのポイント

記事構成:
1. 南関東競馬とは（100文字）
2. JRAとの違い5つ（500文字）
3. 南関東競馬の魅力（300文字）
4. まとめ（100文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
    },
    {
      title: '大井競馬場ガイド（アクセス/施設/イベント）',
      category: 'nankan',
      tags: ['大井競馬場', 'ガイド'],
      prompt: `
あなたは競馬入門ガイドのライターです。
「大井競馬場」について初心者向けの記事を800-1200文字で書いてください。

要件:
- アクセス方法（電車・車）
- 場内施設（スタンド、飲食、イベント）
- TWINKLEナイター競馬の魅力
- 初心者向けの楽しみ方

記事構成:
1. 大井競馬場の特徴（100文字）
2. アクセスと施設（500文字）
3. 楽しみ方とイベント（300文字）
4. まとめ（100文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
    }
  ],
  data: [
    {
      title: 'データ予想とは？初心者が知っておくべき基礎知識',
      category: 'data',
      tags: ['データ予想', '基礎'],
      prompt: `
あなたは競馬入門ガイドのライターです。
「データ予想」について初心者向けの記事を800-1200文字で書いてください。

要件:
- データ予想とは何かをわかりやすく
- 過去データの種類（タイム、血統、騎手など）
- データ予想のメリット・デメリット
- 初心者がデータ予想を始める方法

記事構成:
1. データ予想とは（100文字）
2. データ予想で使うデータ（500文字）
3. データ予想の始め方（300文字）
4. まとめ（100文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
    },
    {
      title: 'オッズ分析の基本：初心者が押さえるべき3つのポイント',
      category: 'data',
      tags: ['オッズ分析', '初心者'],
      prompt: `
あなたは競馬入門ガイドのライターです。
「オッズ分析」について初心者向けの記事を800-1200文字で書いてください。

要件:
- オッズ分析とは何かをわかりやすく
- オッズの動きを見るポイント
- オッズと実力の関係
- 初心者向けのオッズ活用法

記事構成:
1. オッズ分析とは（100文字）
2. 押さえるべき3つのポイント（600文字）
3. 実践的な活用法（200文字）
4. まとめ（100文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`
    }
  ]
};

/**
 * Claude APIで記事を生成
 */
async function generateArticle(template) {
  console.log(`🤖 AI記事生成中: ${template.title}`);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: template.prompt
        }
      ]
    });

    const content = message.content[0].text;

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

    // 初期閲覧数を設定（新規記事なので27-100の範囲）
    const initialViewCount = Math.floor(Math.random() * (100 - 27 + 1)) + 27;

    return {
      Title: template.title,
      Slug: generateSlug(template.title),
      Category: template.category,
      // Tags: template.tags.join(', '), // TODO: Airtableで手動設定
      Excerpt: excerpt,
      Content: content.trim(),
      PublishedAt: publishedAt,
      ViewCount: initialViewCount,
      Status: 'published',
      IsFeatured: Math.random() < 0.3, // 30%の確率で注目記事
      Author: '競馬入門編集部'
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
  console.log('🚀 keiba-nyumon AI記事自動生成を開始します\n');

  // 環境変数チェック
  if (!anthropicApiKey) {
    console.error('❌ ANTHROPIC_API_KEY が設定されていません');
    process.exit(1);
  }

  if (!airtableApiKey) {
    console.error('❌ KEIBA_NYUMON_AIRTABLE_API_KEY または AIRTABLE_API_KEY が設定されていません');
    process.exit(1);
  }

  console.log(`📊 Airtable Base: ${baseId}`);
  console.log(`🤖 AI Model: Claude Sonnet 4.5\n`);

  // 生成するカテゴリ（デフォルト: 全カテゴリ）
  const targetCategory = process.env.CATEGORY || 'all';
  const articleCount = parseInt(process.env.ARTICLE_COUNT || '1', 10);

  const generatedArticles = [];

  // カテゴリ別に記事を生成
  if (targetCategory === 'all') {
    console.log('📝 全カテゴリから記事を生成します\n');
    const categories = Object.keys(CATEGORY_TEMPLATES);

    for (let i = 0; i < articleCount; i++) {
      // ランダムにカテゴリを選択
      const category = categories[Math.floor(Math.random() * categories.length)];
      const templates = CATEGORY_TEMPLATES[category];
      const template = templates[Math.floor(Math.random() * templates.length)];

      const article = await generateArticle(template);

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
  } else {
    // 指定カテゴリのみ生成
    if (!CATEGORY_TEMPLATES[targetCategory]) {
      console.error(`❌ 無効なカテゴリ: ${targetCategory}`);
      console.error(`   有効なカテゴリ: kiso, baken, yougo, nankan, data`);
      process.exit(1);
    }

    console.log(`📝 カテゴリ「${targetCategory}」の記事を${articleCount}件生成します\n`);
    const templates = CATEGORY_TEMPLATES[targetCategory];

    for (let i = 0; i < articleCount; i++) {
      // カテゴリ内からランダムに、または順番に選択
      const template = templates[i % templates.length];

      const article = await generateArticle(template);

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
  }

  console.log(`\n🎉 AI記事生成完了！ (${generatedArticles.length}件)`);
  console.log(`\n📊 生成された記事の内訳:`);
  const categoryCounts = {};
  generatedArticles.forEach(article => {
    categoryCounts[article.Category] = (categoryCounts[article.Category] || 0) + 1;
  });
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}件`);
  });

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

module.exports = { generateArticle, CATEGORY_TEMPLATES };
