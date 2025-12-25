#!/usr/bin/env node

const Airtable = require('airtable');

const airtableApiKey = process.env.KEIBA_GUIDE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const baseId = process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || 'appiHsDBAFFSmCiBV';

if (!airtableApiKey) {
  console.error('❌ AIRTABLE_API_KEY must be set');
  process.exit(1);
}

const base = new Airtable({ apiKey: airtableApiKey }).base(baseId);

async function showAllArticles() {
  try {
    const records = await base('News').select({
      sort: [{ field: 'PublishedAt', direction: 'desc' }]
    }).all();

    if (records.length === 0) {
      console.log('記事が見つかりません');
      return;
    }

    console.log(`\n📰 生成された記事一覧（${records.length}件）\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    records.forEach((record, index) => {
      const article = record.fields;

      console.log(`【記事 ${index + 1}】`);
      console.log(`タイトル: ${article.Title}`);
      console.log(`カテゴリ: ${article.Category}`);
      console.log(`著者: ${article.Author || 'なし'}`);
      console.log(`公開日: ${article.PublishedAt}`);
      console.log(`文字数: ${article.Content.length}文字`);
      console.log(`注目記事: ${article.IsFeatured ? '⭐ はい' : 'いいえ'}`);
      console.log(`\n【要約】`);
      console.log(article.Excerpt);
      console.log(`\n【本文（冒頭400文字）】`);
      console.log(article.Content.substring(0, 400) + '...');
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });

    // 統計情報
    const totalChars = records.reduce((sum, r) => sum + r.fields.Content.length, 0);
    const avgChars = Math.round(totalChars / records.length);
    const featuredCount = records.filter(r => r.fields.IsFeatured).length;

    console.log('📊 統計情報');
    console.log(`総記事数: ${records.length}件`);
    console.log(`総文字数: ${totalChars.toLocaleString()}文字`);
    console.log(`平均文字数: ${avgChars.toLocaleString()}文字`);
    console.log(`注目記事: ${featuredCount}件`);
    console.log(`カテゴリ内訳:`);

    const categories = {};
    records.forEach(r => {
      const cat = r.fields.Category;
      categories[cat] = (categories[cat] || 0) + 1;
    });

    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count}件`);
    });

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

showAllArticles();
