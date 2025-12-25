#!/usr/bin/env node

/**
 * スクレイピングデバッグ用スクリプト
 * HTML構造を確認してセレクタを修正
 */

const puppeteer = require('puppeteer');

async function debugNetkeiba() {
  console.log('🔍 netkeiba.comのHTML構造を調査中...\n');

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

    // HTML構造を調査
    const structure = await page.evaluate(() => {
      const result = {
        totalElements: 0,
        selectors: []
      };

      // 試すセレクタのリスト
      const selectorsToTry = [
        '.newsListBox li',
        '.news-list li',
        'article',
        '.article',
        '.news-item',
        '[class*="news"]',
        '[class*="list"] li',
        'li a'
      ];

      selectorsToTry.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          result.selectors.push({
            selector,
            count: elements.length,
            firstElementHTML: elements[0].outerHTML.substring(0, 500)
          });
        }
      });

      result.totalElements = document.querySelectorAll('*').length;

      return result;
    });

    console.log('📊 調査結果:');
    console.log(`  総要素数: ${structure.totalElements}`);
    console.log(`\n✅ 見つかったセレクタ:\n`);

    structure.selectors.forEach((item, index) => {
      console.log(`${index + 1}. ${item.selector}`);
      console.log(`   件数: ${item.count}件`);
      console.log(`   サンプルHTML: ${item.firstElementHTML.substring(0, 200)}...\n`);
    });

  } catch (error) {
    console.error('❌ エラー:', error.message);
  } finally {
    await browser.close();
  }
}

debugNetkeiba().catch(console.error);
