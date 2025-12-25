/**
 * AI画像生成ライブラリ
 *
 * 記事に最適なサムネイル画像をAI生成
 * - Replicate API (Flux Schnell) を使用
 * - コスト: $0.003/画像
 * - サイズ: 1200x675px (16:9)
 */

const Replicate = require('replicate');
const cloudinary = require('cloudinary').v2;
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Replicateクライアント初期化
let replicate;
if (REPLICATE_API_TOKEN) {
  replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
  });
}

// Cloudinary設定
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

/**
 * カテゴリに応じたUnsplashキーワードを取得
 */
function getUnsplashKeyword(category, title) {
  // カテゴリ別のテクノロジー系キーワード
  const categoryKeywords = {
    'ニュース': 'technology news digital screen',
    'ランキング': 'data analytics dashboard chart',
    'ガイド': 'digital learning technology education',
    'まとめ': 'data visualization statistics',
    '速報': 'breaking news digital alert',
    '炎上': 'warning alert technology',
    'G1レース': 'premium technology gold digital',
  };

  // タイトルから追加キーワードを判定
  if (title.includes('AI')) {
    return 'artificial intelligence technology';
  } else if (title.includes('データ分析')) {
    return 'data analytics technology';
  } else if (title.includes('初心者')) {
    return 'learning technology beginner';
  } else if (title.includes('悪質') || title.includes('詐欺')) {
    return 'security warning technology';
  }

  return categoryKeywords[category] || 'technology digital abstract';
}

/**
 * Unsplashから画像を検索して取得
 * @param {string} keyword - 検索キーワード
 * @param {string} recordId - レコードID（シード値）
 */
async function fetchUnsplashImage(keyword, recordId = null) {
  const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // 後で設定

  // アクセスキーがない場合は固定URLを返す
  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
    console.warn('  ⚠️  UNSPLASH_ACCESS_KEYが設定されていません。固定画像プールから選択します。');

    // カテゴリ別の複数画像プール（10枚以上で重複を避ける）
    const fallbackImagePools = {
      'technology news digital screen': [
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=1200&h=675&fit=crop',
      ],
      'data analytics dashboard chart': [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=675&fit=crop',
      ],
      'digital learning technology education': [
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=675&fit=crop',
      ],
      'data visualization statistics': [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=675&fit=crop',
      ],
      'breaking news digital alert': [
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=1200&h=675&fit=crop',
      ],
      'warning alert technology': [
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1589149098258-3e9102cd63d3?w=1200&h=675&fit=crop',
      ],
      'artificial intelligence technology': [
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1675557009875-4637c5f02669?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1686191128892-34817c0b13ae?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1676299081847-824916de030a?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1655635643486-a17bc48771ff?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1676277791608-ac65a7a85a36?w=1200&h=675&fit=crop',
      ],
      'security warning technology': [
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1589149098258-3e9102cd63d3?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=675&fit=crop',
      ],
      'learning technology beginner': [
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=675&fit=crop',
      ],
      'data analytics technology': [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=675&fit=crop',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=675&fit=crop',
      ],
    };

    const pool = fallbackImagePools[keyword] || fallbackImagePools['technology news digital screen'];

    // recordIdをシード値として使用（なければランダム）
    if (recordId) {
      // 簡易ハッシュ関数でより良い分散を実現
      let hash = 0;
      for (let i = 0; i < recordId.length; i++) {
        const char = recordId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      // 負の数を正に変換
      hash = Math.abs(hash);
      const index = hash % pool.length;
      console.log(`  🎲 recordId: ${recordId} → hash: ${hash} → index: ${index}/${pool.length}`);
      return pool[index];
    } else {
      // シードがない場合はランダム
      const randomIndex = Math.floor(Math.random() * pool.length);
      return pool[randomIndex];
    }
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&orientation=landscape&per_page=10`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // ランダムに1枚選択（毎回違う画像）
      const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 5));
      const photo = data.results[randomIndex];

      // 16:9の1200x675サイズでクロップ
      return `${photo.urls.raw}&w=1200&h=675&fit=crop`;
    }

    // 検索結果がない場合はフォールバック
    return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=675&fit=crop';

  } catch (error) {
    console.error('  ❌ Unsplash API エラー:', error.message);
    return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=675&fit=crop';
  }
}

/**
 * カテゴリとタイトルに応じたプロンプト生成（AI生成用・非推奨）
 */
function generateImagePrompt(category, title) {
  // この関数は使用しない（Unsplashに移行）
  return '';
}

/**
 * 画像URLをダウンロードしてローカルに保存
 */
async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    // URLの型チェック
    if (typeof url !== 'string') {
      reject(new Error(`Invalid URL type: ${typeof url}, value: ${JSON.stringify(url)}`));
      return;
    }

    const protocol = url.startsWith('https') ? https : http;

    const file = fs.createWriteStream(outputPath);

    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

/**
 * AI画像を生成
 *
 * @param {string} category - 記事カテゴリ
 * @param {string} title - 記事タイトル
 * @returns {Promise<string|null>} - 生成された画像のローカルパス、またはnull
 */
async function generateThumbnailImage(category, title) {
  if (!replicate) {
    console.warn('⚠️  REPLICATE_API_TOKEN が設定されていません。画像生成をスキップします。');
    return null;
  }

  try {
    console.log(`🎨 画像生成中: ${category} - ${title.substring(0, 30)}...`);

    const prompt = generateImagePrompt(category, title);

    // Flux Schnell (高速・低コスト)を使用
    // Replicate.run()を使用して結果を待つ
    console.log(`  ⏳ Replicate APIリクエスト中...`);

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          aspect_ratio: "16:9",
          output_format: "webp",
          output_quality: 80,
        }
      }
    );

    console.log(`  📋 Output type: ${typeof output}`);
    console.log(`  📋 Output is array: ${Array.isArray(output)}`);

    // 出力からURLを取得
    let imageUrl = null;

    if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
      console.log(`  📋 URL from array[0]: ${imageUrl}`);
      console.log(`  📋 URL type: ${typeof imageUrl}`);

      // URLがオブジェクトの場合は文字列に変換を試みる
      if (typeof imageUrl === 'object' && imageUrl !== null) {
        if (imageUrl.toString && typeof imageUrl.toString === 'function') {
          imageUrl = imageUrl.toString();
          console.log(`  📋 Converted to string: ${imageUrl}`);
        } else if (imageUrl.url) {
          imageUrl = imageUrl.url;
          console.log(`  📋 Used imageUrl.url: ${imageUrl}`);
        }
      }
    } else if (typeof output === 'string') {
      imageUrl = output;
      console.log(`  📋 URL from string: ${imageUrl}`);
    } else if (output && output.url) {
      imageUrl = output.url;
      console.log(`  📋 URL from output.url: ${imageUrl}`);
    }

    console.log(`  📋 Final imageUrl type: ${typeof imageUrl}`);
    console.log(`  📋 Final imageUrl value: ${imageUrl}`);

    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      console.error('  ❌ 画像URLが取得できませんでした');
      console.error('  📋 imageUrl:', imageUrl);
      console.error('  📋 Full output:', JSON.stringify(output));
      return null;
    }

    console.log(`  ✅ 画像URL取得: ${imageUrl.substring(0, 60)}...`);

    // 一時ディレクトリに保存
    const tempDir = path.join(__dirname, '..', '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const filename = `thumbnail-${timestamp}.webp`;
    const outputPath = path.join(tempDir, filename);

    await downloadImage(imageUrl, outputPath);

    console.log(`  ✅ 画像生成完了: ${filename}`);

    return outputPath;

  } catch (error) {
    console.error('  ❌ 画像生成エラー:', error.message);
    if (error.response) {
      console.error('  📋 Response status:', error.response.status);
      console.error('  📋 Response data:', JSON.stringify(error.response.data).substring(0, 300));
    }
    return null;
  }
}

/**
 * CloudinaryにアップロードしてURLを取得
 *
 * @param {string} imagePath - ローカル画像パス
 * @returns {Promise<string|null>} - Cloudinary URL、またはnull
 */
async function uploadToCloudinary(imagePath) {
  if (!CLOUDINARY_CLOUD_NAME) {
    console.warn('⚠️  Cloudinary認証情報が設定されていません。画像をスキップします。');
    return null;
  }

  try {
    console.log('☁️  Cloudinaryにアップロード中...');

    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'keiba-b-news',
      resource_type: 'image',
      format: 'webp',
      transformation: [
        { width: 1200, height: 675, crop: 'fill' },
        { quality: 'auto:good' },
      ],
    });

    console.log(`  ✅ アップロード完了: ${result.secure_url}`);

    // アップロード後、ローカルファイルを削除
    fs.unlinkSync(imagePath);

    return result.secure_url;

  } catch (error) {
    console.error('  ❌ Cloudinaryアップロードエラー:', error.message);
    return null;
  }
}

/**
 * 一時ファイルをクリーンアップ
 */
function cleanupTempFiles() {
  const tempDir = path.join(__dirname, '..', '..', 'temp');

  if (!fs.existsSync(tempDir)) {
    return;
  }

  const files = fs.readdirSync(tempDir);
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  files.forEach(file => {
    const filePath = path.join(tempDir, file);
    const stats = fs.statSync(filePath);

    // 1時間以上古いファイルを削除
    if (now - stats.mtimeMs > ONE_HOUR) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  古い画像を削除: ${file}`);
    }
  });
}

/**
 * 記事用の画像を取得（Unsplash）
 *
 * @param {string} category - 記事カテゴリ
 * @param {string} title - 記事タイトル
 * @param {string} recordId - AirtableレコードID（シード値として使用）
 * @returns {Promise<string|null>} - 画像URL、またはnull
 */
async function generateAndUploadThumbnail(category, title, recordId = null) {
  try {
    console.log(`🖼️  画像取得中: ${category} - ${title.substring(0, 30)}...`);

    // Unsplashキーワード取得
    const keyword = getUnsplashKeyword(category, title);
    console.log(`  🔍 検索キーワード: ${keyword}`);

    // Unsplashから画像URL取得（recordIdをシードとして渡す）
    const unsplashUrl = await fetchUnsplashImage(keyword, recordId);
    console.log(`  ✅ Unsplash画像取得: ${unsplashUrl.substring(0, 60)}...`);

    // Unsplash URLをそのまま返す（Cloudinaryアップロード不要）
    return unsplashUrl;

  } catch (error) {
    console.error('❌ 画像取得エラー:', error.message);
    return null;
  }
}

module.exports = {
  generateThumbnailImage,
  uploadToCloudinary,
  generateAndUploadThumbnail,
  cleanupTempFiles,
};
