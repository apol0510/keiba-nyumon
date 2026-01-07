/**
 * Service Worker
 *
 * PWA対応：オフラインキャッシュ、バックグラウンド同期
 */

const CACHE_NAME = 'keiba-nyumon-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/og/default.png',
];

// インストール時：静的アセットをキャッシュ
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // 即座にアクティブ化
  self.skipWaiting();
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  // すべてのクライアントを即座に制御
  self.clients.claim();
});

// Fetch時：Network-First戦略（新しいコンテンツ優先）
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 外部リソース（Google Fonts, Unsplash等）はキャッシュしない
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // ネットワークから取得できたらキャッシュに保存
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワークエラー時：キャッシュから取得
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', request.url);
            return cachedResponse;
          }

          // キャッシュにもない場合：オフラインページ
          return new Response('オフラインです。インターネット接続を確認してください。', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain; charset=utf-8',
            }),
          });
        });
      })
  );
});

// バックグラウンド同期（将来的な拡張用）
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-articles') {
    event.waitUntil(
      // 記事データの同期処理
      Promise.resolve()
    );
  }
});

// プッシュ通知（将来的な拡張用）
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || '新しい記事が公開されました',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '競馬入門ガイド', options)
  );
});
