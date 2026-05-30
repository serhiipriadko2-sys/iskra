/**
 * ISKRA Service Worker
 *
 * Privacy-safe PWA shell:
 * - caches only static same-origin assets
 * - never caches Supabase, Edge Functions, Gemini/API, auth, chat, or user data
 * - uses a network-first strategy for navigations with an offline fallback
 */

const CACHE_NAME = 'iskra-pwa-v2';
const APP_SHELL_ASSETS = [
  '',
  'index.html',
  'offline.html',
  'manifest.json',
];
const STATIC_ASSET_PATTERN = /\.(?:css|js|mjs|html|svg|png|jpg|jpeg|webp|ico|woff2?)$/i;
const PRIVATE_PATH_PATTERNS = [
  /\/auth\//i,
  /\/rest\/v1\//i,
  /\/functions\/v1\//i,
  /\/storage\/v1\//i,
  /\/api\//i,
  /\/gemini/i,
  /\/chat/i,
  /\/supabase/i,
];

function toScopedUrl(path) {
  return new URL(path, self.registration.scope).toString();
}

function isPrivateRequest(request) {
  const url = new URL(request.url);

  if (url.origin !== location.origin) {
    return true;
  }

  return PRIVATE_PATH_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');
}

function isCacheableStaticRequest(request) {
  const url = new URL(request.url);

  if (isPrivateRequest(request)) {
    return false;
  }

  return STATIC_ASSET_PATTERN.test(url.pathname) || url.pathname.endsWith('/manifest.json');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_ASSETS.map(toScopedUrl)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || isPrivateRequest(request)) {
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request).catch(() => caches.match(toScopedUrl('offline.html')))
    );
    return;
  }

  if (!isCacheableStaticRequest(request)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
