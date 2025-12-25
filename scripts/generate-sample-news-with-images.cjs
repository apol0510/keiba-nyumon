#!/usr/bin/env node

/**
 * サンプルニュース記事（画像付き）を生成
 *
 * 環境変数が設定されていない場合は、Unsplashのプレースホルダー画像を使用
 */

require('dotenv').config();
const Airtable = require('airtable');

// 環境変数
const AIRTABLE_API_KEY = process.env.KEIBA_GUIDE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.KEIBA_GUIDE_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Airtable認証情報が設定されていません');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

/**
 * スラッグ生成
 */
function generateSlug(title) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
}

/**
 * カテゴリに応じたUnsplash画像URLを生成
 *
 * Unsplash Source API（無料・登録不要）を使用
 * https://source.unsplash.com/
 */
function getPlaceholderImageUrl(category) {
  const keywords = {
    'ニュース': 'newspaper,news',
    'ランキング': 'podium,trophy,winner',
    'ガイド': 'education,guide,learning',
    'まとめ': 'collection,summary',
    '速報': 'breaking,urgent,alert',
    '炎上': 'fire,controversy',
    'G1レース': 'horse,racing,competition',
  };

  const keyword = keywords[category] || 'horse,racing';

  // 1200x675 (16:9) のランダム画像
  return `https://source.unsplash.com/1200x675/?${keyword}`;
}

/**
 * サンプル記事データ
 */
const SAMPLE_ARTICLES = [
  {
    Title: '【2025年版】競馬予想サイトおすすめランキングTOP5',
    Category: 'ランキング',
    Tags: ['ランキング', '初心者向け'],
    Excerpt: '2025年最新の競馬予想サイトランキングを発表！的中率、回収率、サポート体制など、多角的な視点から厳選した5サイトをご紹介します。',
    Content: `## はじめに

競馬予想サイトは数多く存在しますが、本当に信頼できるサイトはどれでしょうか？本記事では、2025年最新のデータをもとに、おすすめの競馬予想サイトTOP5をランキング形式でご紹介します。

## ランキング基準

- 的中率（過去6ヶ月のデータ）
- 回収率（投資効率）
- サポート体制（問い合わせ対応）
- ユーザー評価（口コミスコア）

## TOP5発表

詳細は本文をご確認ください。初心者の方も安心して利用できるサイトを厳選しました。`,
    IsFeatured: true,
    Author: '編集部',
  },
  {
    Title: '【初心者向け】競馬予想サイトの選び方ガイド',
    Category: 'ガイド',
    Tags: ['初心者向け', '選び方', 'ガイド'],
    Excerpt: '競馬予想サイト選びで失敗しないための完全ガイド。悪質サイトの見分け方から、自分に合ったサイトの選び方まで徹底解説します。',
    Content: `## 競馬予想サイトとは？

競馬予想サイトは、プロの予想家が競馬レースの買い目を提供するサービスです。初心者でも的中しやすい予想を受け取れるのが魅力です。

## 選び方のポイント

### 1. 実績の確認
過去の的中率・回収率を公開しているサイトを選びましょう。

### 2. 料金体系の透明性
明確な料金プランがあるか確認しましょう。

### 3. サポート体制
問い合わせ対応がしっかりしているか重要です。

詳細は本文でご確認ください。`,
    IsFeatured: false,
    Author: '編集部',
  },
  {
    Title: '【速報】2025年有馬記念の注目予想サイト情報',
    Category: '速報',
    Tags: ['最新情報', 'ランキング'],
    Excerpt: '2025年有馬記念に向けて、各競馬予想サイトが続々と予想を公開中！注目の買い目情報をいち早くお届けします。',
    Content: `## 有馬記念2025 速報

グランプリレース・有馬記念の予想が続々と公開されています。各サイトの注目馬、買い目情報をまとめました。

## 注目予想サイト

主要な競馬予想サイトの予想が出揃いつつあります。人気馬から穴馬まで、幅広い予想が展開されています。

## 買い目情報

詳細な買い目情報は各サイトでご確認ください。`,
    IsFeatured: true,
    Author: '速報班',
  },
];

/**
 * 記事を保存（画像は後で追加）
 */
async function saveArticle(article) {
  try {
    const record = await base('News').create({
      Title: article.Title,
      Slug: generateSlug(article.Title),
      Category: article.Category,
      Tags: article.Tags,
      Excerpt: article.Excerpt,
      Content: article.Content,
      Status: 'published',
      IsFeatured: article.IsFeatured,
      Author: article.Author,
    });

    console.log(`✅ 記事作成完了: ${article.Title} (ID: ${record.id})`);

    // 画像を追加（別のステップ）
    const thumbnailUrl = getPlaceholderImageUrl(article.Category);

    try {
      await base('News').update(record.id, {
        Thumbnail: [{
          url: thumbnailUrl,
          filename: `${article.Category}.jpg`
        }]
      });
      console.log(`   ✅ 画像追加完了: ${thumbnailUrl}`);
    } catch (imgError) {
      console.warn(`   ⚠️  画像追加失敗: ${imgError.message}`);
    }

    return record;

  } catch (error) {
    console.error(`❌ 記事作成エラー: ${article.Title}`, error.message);
    return null;
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 サンプル記事（画像付き）を生成します\n');
  console.log(`📊 Airtable Base: ${AIRTABLE_BASE_ID}\n`);

  let successCount = 0;

  for (const article of SAMPLE_ARTICLES) {
    const result = await saveArticle(article);
    if (result) {
      successCount++;
    }
    // レート制限対策
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n🎉 完了: ${successCount}/${SAMPLE_ARTICLES.length}件の記事を作成しました\n`);
  console.log('📱 http://localhost:4322/ でサムネイル画像を確認してください！');
}

// 実行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  });
}
