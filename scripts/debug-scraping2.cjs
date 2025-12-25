#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function debugNetkeiba() {
  console.log('🔍 netkeiba.comのニュース要素を詳細調査中...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://news.netkeiba.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // ニュース記事っぽい要素を探す
    const articles = await page.evaluate(() => {
      const results = [];

      // 全てのaタグを調査
      const links = Array.from(document.querySelectorAll('a'));

      links.forEach((link, index) => {
        const href = link.href;
        const text = link.textContent.trim();

        // ニュース記事URLっぽいものを抽出
        if (href.includes('news.netkeiba.com') && text.length > 10 && index < 20) {
          const parent = link.parentElement;
          results.push({
            index,
            text: text.substring(0, 100),
            href,
            parentClass: parent.className,
            parentTag: parent.tagName
          });
        }
      });

      return results;
    });

    console.log(`✅ ニュース記事候補: ${articles.length}件\n`);

    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.text}`);
      console.log(`   URL: ${article.href}`);
      console.log(`   親要素: <${article.parentTag} class="${article.parentClass}">\n`);
    });

  } catch (error) {
    console.error('❌ エラー:', error.message);
  } finally {
    await browser.close();
  }
}

debugNetkeiba().catch(console.error);
