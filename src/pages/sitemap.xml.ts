import type { APIRoute } from 'astro';
import { getLatestNews } from '../lib/news';

// サイトURL
const SITE_URL = 'https://keiba-guide.jp';

export const GET: APIRoute = async () => {
  // ニュース記事を取得（最大100件）
  const articles = await getLatestNews(100);

  // 静的ページ
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about/', priority: '0.5', changefreq: 'monthly' },
    { url: '/terms/', priority: '0.3', changefreq: 'yearly' },
    { url: '/privacy/', priority: '0.3', changefreq: 'yearly' },
    { url: '/contact/', priority: '0.5', changefreq: 'monthly' },
  ];

  // XMLを生成
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
${articles
  .map(
    (article) => {
      const lastmod = article.publishedAt || new Date().toISOString().split('T')[0];

      return `  <url>
    <loc>${SITE_URL}/news/${article.slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
