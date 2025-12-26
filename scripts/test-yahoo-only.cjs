#!/usr/bin/env node
const puppeteer = require('puppeteer');
const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.KEIBA_NYUMON_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_NYUMON_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

console.log('環境変数:');
console.log('  API Key:', AIRTABLE_API_KEY ? AIRTABLE_API_KEY.substring(0, 20) + '...' : 'なし');
console.log('  Base ID:', AIRTABLE_BASE_ID);

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function main() {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('https://news.yahoo.co.jp/search?p=競馬&ei=utf-8', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const articles = await page.evaluate(() => {
      const items = [];
      const links = document.querySelectorAll('li a[href*="/articles/"]');
      
      links.forEach((link, i) => {
        if (i >= 3) return;
        const title = link.textContent.trim();
        if (title && title.length > 5) {
          items.push({
            title: title.substring(0, 100),
            url: link.href,
          });
        }
      });
      return items;
    });
    
    console.log('\n取得記事:', articles.length, '件\n');
    
    if (articles.length > 0) {
      const testArticle = articles[0];
      console.log('保存テスト:', testArticle.title);
      
      const record = await base('News').create({
        Title: `[テスト] ${testArticle.title}`,
        Slug: `test-${Date.now()}`,
        Category: 'ニュース',
        Excerpt: testArticle.title,
        Content: `テスト記事\n\n[元記事](${testArticle.url})`,
        PublishedAt: new Date().toISOString().split('T')[0],
        Status: 'published',
        Author: '編集部'
      });
      
      console.log('✅ 保存成功:', record.id);
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  } finally {
    if (browser) await browser.close();
  }
}

main();
