#!/usr/bin/env node

const Airtable = require('airtable');

const airtableApiKey = process.env.KEIBA_GUIDE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const baseId = process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID || 'appiHsDBAFFSmCiBV';

if (!airtableApiKey) {
  console.error('❌ AIRTABLE_API_KEY must be set');
  process.exit(1);
}

const base = new Airtable({ apiKey: airtableApiKey }).base(baseId);

async function showArticle() {
  try {
    const records = await base('News').select({
      maxRecords: 1,
      sort: [{ field: 'PublishedAt', direction: 'desc' }]
    }).all();

    if (records.length === 0) {
      console.log('記事が見つかりません');
      return;
    }

    const article = records[0].fields;

    console.log('📰 最新記事の詳細\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`タイトル: ${article.Title}`);
    console.log(`カテゴリ: ${article.Category}`);
    console.log(`著者: ${article.Author || 'なし'}`);
    console.log(`公開日: ${article.PublishedAt}`);
    console.log(`注目記事: ${article.IsFeatured ? 'はい' : 'いいえ'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('【要約】');
    console.log(article.Excerpt);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('【本文】');
    console.log(article.Content);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n文字数: ${article.Content.length}文字`);

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

showArticle();
