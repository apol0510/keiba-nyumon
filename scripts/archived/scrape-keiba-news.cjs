#!/usr/bin/env node

/**
 * オプション2: 外部ニュースサイトからスクレイピング
 *
 * 対象サイト:
 * - netkeiba.com（競馬ニュース）
 * - Yahoo!ニュース（競馬カテゴリ）
 *
 * 実行方法:
 * AIRTABLE_API_KEY=xxx AIRTABLE_BASE_ID=xxx node scripts/scrape-keiba-news.cjs
 */

const puppeteer = require('puppeteer');
const Airtable = require('airtable');

// Airtable設定（KEIBA_GUIDE_*を優先、フォールバックでAIRTABLE_*）
const apiKey = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const baseId = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || 'appiHsDBAFFSmCiBV';

if (!apiKey) {
  console.error('❌ KEIBA_NYUMON_AIRTABLE_API_KEY or AIRTABLE_API_KEY must be set');
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);

/**
 * スラッグ生成
 */
function generateSlug(title) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  return `${timestamp}-${randomStr}`;
}

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

    // ニュース一覧を取得
    const articles = await page.evaluate(() => {
      const items = [];
      const newsElements = document.querySelectorAll('.newsListBox li');

      newsElements.forEach((element, index) => {
        if (index >= 10) return; // 最大10件

        const linkElement = element.querySelector('a');
        const titleElement = element.querySelector('.title');
        const dateElement = element.querySelector('.date');
        const textElement = element.querySelector('.text');

        if (linkElement && titleElement) {
          const url = linkElement.href;
          const title = titleElement.textContent.trim();
          const publishedAt = dateElement ? dateElement.textContent.trim() : '';
          const excerpt = textElement ? textElement.textContent.trim().substring(0, 200) : '';

          items.push({
            title,
            url,
            publishedAt,
            excerpt,
            source: 'netkeiba.com'
          });
        }
      });

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

    // ニュース一覧を取得
    const articles = await page.evaluate(() => {
      const items = [];
      const newsElements = document.querySelectorAll('.newsFeed_item');

      newsElements.forEach((element, index) => {
        if (index >= 10) return; // 最大10件

        const linkElement = element.querySelector('.newsFeed_item_link');
        const titleElement = element.querySelector('.newsFeed_item_title');
        const dateElement = element.querySelector('.newsFeed_item_date');
        const excerptElement = element.querySelector('.newsFeed_item_summary');

        if (linkElement && titleElement) {
          const url = linkElement.href;
          const title = titleElement.textContent.trim();
          const publishedAt = dateElement ? dateElement.textContent.trim() : '';
          const excerpt = excerptElement ? excerptElement.textContent.trim().substring(0, 200) : '';

          items.push({
            title,
            url,
            publishedAt,
            excerpt,
            source: 'Yahoo!ニュース'
          });
        }
      });

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
 * スクレイピングした記事をAirtable用に変換
 */
function convertToAirtableFormat(article) {
  const content = `
${article.excerpt}

続きは元記事でご覧ください。

[元記事を読む](${article.url})

---

**引用元**: ${article.source}
`;

  return {
    Title: article.title,
    Slug: generateSlug(article.title),
    Category: 'ニュース',
    Excerpt: article.excerpt.substring(0, 200),
    Content: content.trim(),
    SourceUrl: article.url,
    SourceName: article.source,
    PublishedAt: new Date().toISOString().split('T')[0], // YYYY-MM-DD形式
    Status: 'published',
    IsFeatured: false
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
    return null;
  }
}

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
    console.error('重複チェックエラー:', error.message);
    return false;
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 外部ニュースサイトからスクレイピング開始\n');
  console.log(`📊 Airtable Base: ${baseId}\n`);

  let browser;

  try {
    // Puppeteer起動
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const allArticles = [];

    // 1. netkeiba.comから取得
    const netkeibaArticles = await scrapeNetkeibaNews(browser);
    allArticles.push(...netkeibaArticles);

    // 2. Yahoo!ニュースから取得
    const yahooArticles = await scrapeYahooNews(browser);
    allArticles.push(...yahooArticles);

    console.log(`\n📊 合計 ${allArticles.length}件のニュースを取得\n`);

    // 重複チェック & 保存
    console.log('💾 Airtableに保存中...\n');

    let savedCount = 0;
    let duplicateCount = 0;

    for (const article of allArticles) {
      const isDuplicate = await isDuplicateArticle(article.url);

      if (isDuplicate) {
        console.log(`⏭️  スキップ（重複）: ${article.title}`);
        duplicateCount++;
        continue;
      }

      const airtableArticle = convertToAirtableFormat(article);
      const result = await saveNewsArticle(airtableArticle);

      if (result) {
        savedCount++;
      }

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n🎉 スクレイピング完了！`);
    console.log(`  保存: ${savedCount}件`);
    console.log(`  重複スキップ: ${duplicateCount}件`);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 実行
if (require.main === module) {
  main();
}

module.exports = { scrapeNetkeibaNews, scrapeYahooNews };
