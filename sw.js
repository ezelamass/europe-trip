/* Service Worker de EuroTrip 90 — offline + ediciones visibles.
 * Estrategia:
 *  - App shell (index.html / navegacion): NETWORK-FIRST  -> online siempre trae lo ultimo
 *    (tus ediciones al HTML se ven enseguida); offline cae al cache.
 *  - Assets de CDN/fuentes/tiles: CACHE-FIRST -> rapido y disponible offline.
 * Subí CACHE_VERSION cuando cambien assets/CDNs para invalidar el cache viejo. */
const CACHE_VERSION = 'eurotrip-cache-v3';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './world-map-data.js',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap'
];

// Cachea una URL tolerando cross-origin sin CORS (respuesta opaca).
async function cachePut(cache, url) {
  try {
    let res = await fetch(url, { mode: 'cors' }).catch(() => null);
    if (!res || (!res.ok && res.type !== 'opaque')) {
      res = await fetch(url, { mode: 'no-cors' }).catch(() => null);
    }
    if (res && (res.ok || res.type === 'opaque')) {
      await cache.put(url, res);
    }
  } catch (e) { /* best-effort */ }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.all(PRECACHE_URLS.map(url => cachePut(cache, url)));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// NETWORK-FIRST: para el shell. Trae de red, actualiza cache, y si no hay red usa cache.
async function networkFirst(req) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
    return res;
  } catch (e) {
    const cached = await cache.match(req) || await cache.match('./index.html') || await cache.match('./');
    if (cached) return cached;
    throw e;
  }
}

// CACHE-FIRST: para assets. Usa cache, si no hay va a red y cachea.
async function cacheFirst(req) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()).catch(() => {});
  return res;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isShell = req.mode === 'navigate' ||
                  (url.origin === self.location.origin &&
                   (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === ''));

  event.respondWith(isShell ? networkFirst(req) : cacheFirst(req));
});
