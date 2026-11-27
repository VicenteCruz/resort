const CACHE_NAME = 'yucatan-companion-pt-v55';
const NETWORK_TIMEOUT_MS = 3500;

const LOCAL_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './supabase-config.js',
  './data.js',
  './app.js',
  './manifest.webmanifest',
  './assets/logo-circle.png',
  './assets/icon-192.png',
  './assets/apple-touch-icon.png',
  './assets/icon-maskable-512.png'
];

const CDN_ASSETS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

const CACHEABLE_CDN_HOSTS = new Set([
  'unpkg.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(LOCAL_ASSETS);
      await Promise.allSettled(
        CDN_ASSETS.map(async (url) => {
          const res = await fetch(url, { mode: 'cors' });
          if (res && res.ok) await cache.put(url, res);
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function fetchWithTimeout(request, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const reqUrl = new URL(event.request.url);

  // 1. Static CDN dependencies (Leaflet, Supabase SDK, Google Fonts): Cache-first with background refresh
  if (CACHEABLE_CDN_HOSTS.has(reqUrl.hostname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        const networkPromise = fetch(event.request)
          .then((res) => {
            if (res && (res.status === 200 || res.type === 'opaque')) {
              cache.put(event.request, res.clone());
            }
            return res;
          })
          .catch(() => null);
        return cached || (await networkPromise) || Response.error();
      })
    );
    return;
  }

  if (reqUrl.origin !== self.location.origin) return;

  // 2. App shell & local assets: Network-first with fast 3.5s captive-portal timeout, falling back to cache offline
  event.respondWith(
    fetchWithTimeout(event.request, NETWORK_TIMEOUT_MS)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return (await caches.match('./index.html')) || (await caches.match('./'));
        }
        return Response.error();
      })
  );
});
