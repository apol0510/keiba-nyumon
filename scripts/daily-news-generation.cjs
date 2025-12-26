#!/usr/bin/env node

/**
 * 毎日のニュース自動生成（統合版）
 *
 * オプション2（スクレイピング）+ オプション3（AI生成）を組み合わせて実行
 *
 * 処理フロー:
 * 1. 外部サイトからニュースをスクレイピング（netkeiba, Yahoo!）
 * 2. スクレイピングした内容を元にClaude APIでオリジナル記事を生成
 * 3. Airtableに投稿
 *
 * 環境変数:
 * - ANTHROPIC_API_KEY: Claude API キー（必須）
 * - AIRTABLE_API_KEY: Airtable Personal Access Token（必須）
 * - AIRTABLE_BASE_ID: Airtable Base ID（必須）
 * - REPLICATE_API_TOKEN: Replicate API トークン（オプション、AI画像生成用）
 * - CLOUDINARY_*: Cloudinary設定（オプション、画像ホスティング用）
 * - ARTICLE_COUNT: 生成する記事数（デフォルト: 3）
 * - MODE: 実行モード（scrape/ai/both、デフォルト: both）
 *
 * 実行例:
 * # 両方実行（デフォルト）
 * ANTHROPIC_API_KEY=xxx AIRTABLE_API_KEY=xxx AIRTABLE_BASE_ID=xxx \
 * ARTICLE_COUNT=3 node scripts/daily-news-generation.cjs
 *
 * # スクレイピングのみ
 * MODE=scrape AIRTABLE_API_KEY=xxx AIRTABLE_BASE_ID=xxx \
 * node scripts/daily-news-generation.cjs
 *
 * # AI生成のみ
 * MODE=ai ANTHROPIC_API_KEY=xxx AIRTABLE_API_KEY=xxx AIRTABLE_BASE_ID=xxx \
 * ARTICLE_COUNT=3 node scripts/daily-news-generation.cjs
 */

require('dotenv').config();

const puppeteer = require('puppeteer');
const Anthropic = require('@anthropic-ai/sdk');
const Airtable = require('airtable');
const { generateAndUploadThumbnail } = require('./lib/image-generator.cjs');

// 環境変数
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AIRTABLE_API_KEY = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;
const ARTICLE_COUNT = parseInt(process.env.ARTICLE_COUNT || '3', 10);
const MODE = process.env.MODE || 'both'; // scrape / ai / both

// Airtable接続
if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Airtable認証情報が設定されていません');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Claude API クライアント
let anthropic;
if (ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });
}

/**
 * スラッグ生成
 */
function generateSlug(title) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
}

// ==========================================
// オプション2: 外部スクレイピング
// ==========================================

/**
 * netkeiba.comからニュースを取得
 */
async function scrapeNetkeibaNews(browser) {
  console.log('📰 netkeiba.comからニュース取得中...');

  const page = await browser.newPage();

  try {
    await page.goto('https://news.netkeiba.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 動的コンテンツの読み込みを待機
    await new Promise(resolve => setTimeout(resolve, 3000));

    const articles = await page.evaluate(() => {
      const items = [];

      // より汎用的なセレクタを試す（複数のパターンに対応）
      const selectors = [
        'ul li a',  // 一般的なリスト項目
        'article a', // 記事タグ
        '.news-item a', // ニュース項目
        'div[class*="news"] a' // newsを含むクラス
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);

        if (elements.length > 0) {
          elements.forEach((link, index) => {
            if (index >= 10) return;

            // リンクのテキストまたは親要素からタイトルを取得
            const title = link.textContent.trim() ||
                         link.getAttribute('title') ||
                         link.querySelector('h2, h3, .title, [class*="title"]')?.textContent.trim();

            const url = link.href;

            // 有効なニュース記事のURLか確認
            if (title && url && url.includes('news.netkeiba.com') && title.length > 5) {
              items.push({
                title: title.substring(0, 100),
                url: url,
                publishedAt: new Date().toISOString().split('T')[0],
                excerpt: title.substring(0, 200),
                source: 'netkeiba.com'
              });
            }
          });

          if (items.length > 0) break; // 記事が見つかったらループを抜ける
        }
      }

      return items;
    });

    console.log(`  ✅ ${articles.length}件のニュースを取得`);
    return articles;

  } catch (error) {
    console.error('  ❌ netkeiba.comのスクレイピングエラー:', error.message);
    return [];
  } finally {
    await page.close();
  }
}

/**
 * Yahoo!ニュース（競馬）から取得
 */
async function scrapeYahooNews(browser) {
  console.log('📰 Yahoo!ニュース（競馬）から取得中...');

  const page = await browser.newPage();

  try {
    await page.goto('https://news.yahoo.co.jp/search?p=競馬&ei=utf-8', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // コンテンツ読み込み待機
    await new Promise(resolve => setTimeout(resolve, 2000));

    const articles = await page.evaluate(() => {
      const items = [];

      // 2025年版のYahoo!ニュース構造に対応
      const selectors = [
        'li.kKmBYF a.bppoEc',  // 最新のYahoo構造
        'li[class*="sc-1u4589e"] a', // 動的クラス名対応
        'li a[href*="/articles/"]', // 記事URLパターン
        '.sc-1u4589e-0 a' // バックアップセレクタ
      ];

      for (const selector of selectors) {
        const links = document.querySelectorAll(selector);

        if (links.length > 0) {
          links.forEach((link, index) => {
            if (index >= 10) return;

            // タイトルを取得（複数パターン対応）
            const titleElement = link.querySelector('.casbUp, [class*="sc-1t7ra5j"]');
            const title = titleElement?.textContent.trim() || link.textContent.trim();

            // 日付を取得
            const dateElement = link.querySelector('.bVxZvL, [class*="date"]');
            const publishedAt = dateElement?.textContent.trim() || '';

            const url = link.href;

            // 有効な記事か確認
            if (title && url && url.includes('/articles/') && title.length > 5) {
              items.push({
                title: title.substring(0, 100),
                url: url,
                publishedAt: publishedAt || new Date().toISOString().split('T')[0],
                excerpt: title.substring(0, 200),
                source: 'Yahoo!ニュース'
              });
            }
          });

          if (items.length > 0) break;
        }
      }

      return items;
    });

    console.log(`  ✅ ${articles.length}件のニュースを取得`);
    return articles;

  } catch (error) {
    console.error('  ❌ Yahoo!ニュースのスクレイピングエラー:', error.message);
    return [];
  } finally {
    await page.close();
  }
}

/**
 * スクレイピング実行
 */
async function runScraping() {
  console.log('\n🔍 オプション2: 外部ニュースサイトからスクレイピング\n');

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const allArticles = [];

    const netkeibaArticles = await scrapeNetkeibaNews(browser);
    allArticles.push(...netkeibaArticles);

    const yahooArticles = await scrapeYahooNews(browser);
    allArticles.push(...yahooArticles);

    console.log(`\n📊 合計 ${allArticles.length}件のニュースを取得\n`);

    // 重複チェック & 保存
    let savedCount = 0;
    let duplicateCount = 0;

    for (const article of allArticles) {
      const isDuplicate = await isDuplicateArticle(article.url);

      if (isDuplicate) {
        console.log(`⏭️  スキップ（重複）: ${article.title}`);
        duplicateCount++;
        continue;
      }

      const airtableArticle = {
        Title: article.title,
        Slug: generateSlug(article.title),
        Category: 'ニュース',
        Excerpt: article.excerpt.substring(0, 200),
        Content: `${article.excerpt}\n\n続きは元記事でご覧ください。\n\n[元記事を読む](${article.url})\n\n---\n\n**引用元**: ${article.source}`,
        SourceUrl: article.url,
        SourceName: article.source,
        PublishedAt: new Date().toISOString().split('T')[0],
        Status: 'published',
        IsFeatured: false,
        Author: '編集部'
      };

      const result = await saveNewsArticle(airtableArticle);

      if (result) {
        savedCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n✅ スクレイピング完了: ${savedCount}件保存、${duplicateCount}件スキップ\n`);

    return { savedCount, duplicateCount, allArticles };

  } catch (error) {
    console.error('❌ スクレイピングエラー:', error);
    return { savedCount: 0, duplicateCount: 0, allArticles: [] };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ==========================================
// オプション3: AI記事生成
// ==========================================

/**
 * 記事テンプレート
 */
const ARTICLE_TEMPLATES = [
  {
    type: 'howto',
    titleTemplate: '【初心者向け】{topic}の選び方ガイド',
    category: 'ガイド',
    tags: ['初心者向け', '選び方'],
  },
  {
    type: 'ranking',
    titleTemplate: '【2025年版】{topic}おすすめランキングTOP5',
    category: 'ランキング',
    tags: ['おすすめ', 'ランキング'],
  },
  {
    type: 'news',
    titleTemplate: '【速報】{topic}に関する最新情報',
    category: 'ニュース',
    tags: ['最新情報'],
  },
  {
    type: 'tips',
    titleTemplate: '【必読】{topic}で成功するための5つのコツ',
    category: 'ガイド',
    tags: ['ノウハウ', '初心者向け'],
  },
  {
    type: 'comparison',
    titleTemplate: '【徹底比較】{topic}：どちらを選ぶべき？',
    category: 'まとめ',
    tags: ['比較', '選び方'],
  }
];

const TOPICS = [
  '競馬予想サイトの選び方',
  '無料予想と有料予想の違い',
  '南関競馬予想サイト',
  '地方競馬予想サイト',
  'JRA（中央競馬）予想サイト',
  '競馬予想サイトの的中率',
  '悪質な競馬予想サイトの見分け方',
  '競馬予想AIと人間予想家',
  '競馬初心者向け予想サイト',
  '高額配当を狙える予想サイト'
];

/**
 * カテゴリに応じたUnsplash画像URLを生成（フォールバック用）
 */
function getFallbackThumbnailUrl(category) {
  const categoryImages = {
    'ニュース': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=675&fit=crop',
    'ランキング': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=675&fit=crop',
    'ガイド': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=675&fit=crop',
    'まとめ': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=675&fit=crop',
    '速報': 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&h=675&fit=crop',
    '炎上': 'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=1200&h=675&fit=crop',
    'G1レース': 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1200&h=675&fit=crop',
  };

  return categoryImages[category] || categoryImages['ニュース'];
}

/**
 * Claude APIで記事を生成
 */
async function generateArticleWithAI(template, topic, scrapedNews = []) {
  console.log(`🤖 AI記事生成中: ${template.titleTemplate.replace('{topic}', topic)}`);

  const newsContext = scrapedNews.length > 0
    ? `\n\n参考情報（本日の競馬ニュース）:\n${scrapedNews.slice(0, 5).map(n => `- ${n.title}`).join('\n')}\n`
    : '';

  const prompt = `
あなたは競馬予想サイトのニュースライターです。
以下のトピックで記事を800-1200文字で書いてください。

トピック: ${topic}
${newsContext}

要件:
- 競馬初心者にもわかりやすく
- SEOを意識したキーワード配置（競馬予想、買い目、的中率など）
- 客観的で中立的な視点
- 具体例を含める

記事構成:
1. 導入（100文字）
2. メイン内容（600-800文字）
3. まとめ（100-200文字）

タイトルは含めず、本文のみを返してください。
マークダウン形式（見出しは##、###を使用）で記述してください。
`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = message.content[0].text;
    const title = template.titleTemplate.replace('{topic}', topic);

    const excerpt = content
      .replace(/^#.*\n/gm, '')
      .replace(/\n/g, ' ')
      .substring(0, 200)
      .trim();

    console.log(`  ✅ 生成完了（${content.length}文字）`);

    // サムネイル画像を生成（AI生成 または フォールバック）
    let thumbnailUrl = await generateAndUploadThumbnail(template.category, title);

    // AI生成に失敗した場合はUnsplashフォールバック
    if (!thumbnailUrl) {
      thumbnailUrl = getFallbackThumbnailUrl(template.category);
      console.log(`  ℹ️  フォールバック画像を使用: ${template.category}`);
    }

    const article = {
      Title: title,
      Slug: generateSlug(title),
      Category: template.category,
      Excerpt: excerpt,
      Content: content.trim(),
      Tags: template.tags,
      PublishedAt: new Date().toISOString().split('T')[0],
      Status: 'published',
      IsFeatured: Math.random() < 0.3,
      Author: 'AI編集部'
    };

    // サムネイルURLがあればAttachmentとして追加
    if (thumbnailUrl) {
      article.Thumbnail = [{ url: thumbnailUrl }];
    }

    return article;

  } catch (error) {
    console.error('  ❌ AI生成エラー:', error.message);
    return null;
  }
}

/**
 * AI記事生成実行
 */
async function runAIGeneration(scrapedNews = []) {
  console.log('\n🤖 オプション3: AI記事自動生成\n');

  if (!anthropic) {
    console.error('❌ ANTHROPIC_API_KEY が設定されていません');
    return { generatedCount: 0 };
  }

  let generatedCount = 0;

  for (let i = 0; i < ARTICLE_COUNT; i++) {
    const template = ARTICLE_TEMPLATES[Math.floor(Math.random() * ARTICLE_TEMPLATES.length)];
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

    const article = await generateArticleWithAI(template, topic, scrapedNews);

    if (article) {
      await saveNewsArticle(article);
      generatedCount++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n✅ AI記事生成完了: ${generatedCount}件\n`);

  return { generatedCount };
}

// ==========================================
// 共通機能
// ==========================================

/**
 * 重複チェック（URL）
 */
async function isDuplicateArticle(url) {
  try {
    const records = await base('News')
      .select({
        maxRecords: 1,
        filterByFormula: `{SourceUrl} = "${url}"`
      })
      .all();

    return records.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Airtableに保存
 */
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

// ==========================================
// メイン処理
// ==========================================

async function main() {
  console.log('🚀 毎日のニュース自動生成を開始します\n');
  console.log(`📊 実行モード: ${MODE}`);
  console.log(`🗄️  Airtable Base: ${AIRTABLE_BASE_ID}\n`);

  let scrapingResult = { savedCount: 0, allArticles: [] };
  let aiResult = { generatedCount: 0 };

  try {
    // モードに応じて実行
    if (MODE === 'scrape' || MODE === 'both') {
      scrapingResult = await runScraping();
    }

    if (MODE === 'ai' || MODE === 'both') {
      aiResult = await runAIGeneration(scrapingResult.allArticles);
    }

    console.log('\n🎉 すべての処理が完了しました！');
    console.log(`📰 スクレイピング: ${scrapingResult.savedCount}件保存`);
    console.log(`🤖 AI生成: ${aiResult.generatedCount}件生成`);
    console.log(`📝 合計: ${scrapingResult.savedCount + aiResult.generatedCount}件の新規記事\n`);

  } catch (error) {
    console.error('\n❌ 致命的エラー:', error);
    process.exit(1);
  }
}

// 実行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  });
}

module.exports = { runScraping, runAIGeneration };
