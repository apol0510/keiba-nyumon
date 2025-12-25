#!/usr/bin/env node

/**
 * ニュース生成のドライラン（テスト実行）
 *
 * Airtableに保存せず、生成された記事の内容を確認できます。
 *
 * 実行方法:
 * ANTHROPIC_API_KEY=xxx node scripts/test-daily-news-dryrun.cjs
 */

const Anthropic = require('@anthropic-ai/sdk');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY が設定されていません');
  process.exit(1);
}

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

const SAMPLE_TEMPLATE = {
  type: 'howto',
  titleTemplate: '【初心者向け】競馬予想サイトの選び方ガイド',
  category: 'ガイド',
};

const SAMPLE_SCRAPED_NEWS = [
  'ホーエリート、39年ぶりの牝馬勝利を達成',
  'ダブルハートボンド、10年ぶりの牝馬チャンピオン',
  '和田竜二騎手、調教師試験に合格'
];

async function testAIGeneration() {
  console.log('🧪 AI記事生成のドライランテスト\n');
  console.log('📋 テンプレート:', SAMPLE_TEMPLATE.titleTemplate);
  console.log('📰 参考ニュース:', SAMPLE_SCRAPED_NEWS.join(', '));
  console.log('');

  const newsContext = `\n\n参考情報（本日の競馬ニュース）:\n${SAMPLE_SCRAPED_NEWS.map(n => `- ${n}`).join('\n')}\n`;

  const prompt = `
あなたは競馬予想サイトのニュースライターです。
以下のトピックで記事を800-1200文字で書いてください。

トピック: 競馬予想サイトの選び方
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
    console.log('🤖 Claude APIで記事を生成中...\n');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = message.content[0].text;

    console.log('✅ 記事生成完了！\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`タイトル: ${SAMPLE_TEMPLATE.titleTemplate}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(content);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`📊 生成された記事の統計:`);
    console.log(`  文字数: ${content.length}文字`);
    console.log(`  行数: ${content.split('\n').length}行`);

    const excerpt = content
      .replace(/^#.*\n/gm, '')
      .replace(/\n/g, ' ')
      .substring(0, 200)
      .trim();

    console.log(`  要約: ${excerpt}...\n`);

    console.log('💡 このまま本番実行すると、上記の記事がAirtableに保存されます。');

  } catch (error) {
    console.error('❌ エラー:', error.message);
    process.exit(1);
  }
}

testAIGeneration();
