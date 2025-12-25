#!/usr/bin/env node

/**
 * AI記事生成のドライラン（APIを呼ばずに動作確認）
 */

const { ARTICLE_TEMPLATES, TOPICS } = require('./generate-ai-news.cjs');

console.log('🧪 AI記事生成のドライラン開始\n');

console.log('📋 記事テンプレート一覧:\n');
ARTICLE_TEMPLATES.forEach((template, index) => {
  console.log(`${index + 1}. ${template.type}`);
  console.log(`   タイトル: ${template.titleTemplate}`);
  console.log(`   カテゴリ: ${template.category}`);
  console.log(`   タグ: ${template.tags.join(', ')}`);
  console.log('');
});

console.log('📋 トピック一覧:\n');
TOPICS.forEach((topic, index) => {
  console.log(`${index + 1}. ${topic}`);
});

console.log('\n🎲 ランダム選択のシミュレーション:\n');

for (let i = 0; i < 5; i++) {
  const template = ARTICLE_TEMPLATES[Math.floor(Math.random() * ARTICLE_TEMPLATES.length)];
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const title = template.titleTemplate.replace('{topic}', topic);

  console.log(`${i + 1}. ${title}`);
  console.log(`   タイプ: ${template.type} | カテゴリ: ${template.category}`);
  console.log('');
}

console.log('✅ ドライラン完了\n');
console.log('次のステップ:');
console.log('1. ANTHROPIC_API_KEYを.envに追加');
console.log('2. npm run generate:ai で実際に記事を生成');
