// Service Worker para PWA da Omnitrade Brasil - OTB v3
const CACHE_NAME = 'omnitrade-orcamentos-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/otb_engine.js',
  '/otb_ui.js',
  '/manifest.json',
  '/assets/omnitrade.ico',
  '/assets/omnitrade_logo_192.png',
  '/assets/omnitrade_logo_256.png',
  '/assets/omnitrade_logo_512.png',
  '/assets/omnitrade_header.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch((err) => {
      console.warn('Falha no cache inicial:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const reqUrl = new URL(event.request.url);
  if (reqUrl.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200 && reqUrl.origin === self.location.origin) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return networkRes;
      })
      .catch(() => caches.match(event.request))
  );
});
