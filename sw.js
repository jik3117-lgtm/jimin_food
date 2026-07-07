const CACHE_NAME = 'jimin-food-v1';
const CACHE_URLS = [
  '/jimin_food/',
  '/jimin_food/index.html',
  '/jimin_food/icon-192.png',
  '/jimin_food/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS.map(url => new Request(url, {cache: 'reload'})));
    }).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // 구글 시트 API 요청은 항상 네트워크 사용
  if (e.request.url.includes('script.google.com')) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
      // 캐시 있으면 캐시 먼저, 없으면 네트워크
      return cached || fetchPromise;
    })
  );
});
