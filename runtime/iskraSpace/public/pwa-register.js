// PWA service-worker registration.
// Extracted from inline index.html so the app can run under a strict
// Content-Security-Policy (script-src 'self'). The base path is derived from
// this script's own URL (it is copied to the deploy base root), which reproduces
// the previous %BASE_URL% behavior across '/' (Vercel/Docker) and '/iskra/' (Pages).
(function () {
  var current = document.currentScript;
  if (!('serviceWorker' in navigator) || !current) return;
  window.addEventListener('load', function () {
    var basePath = new URL('.', current.src).pathname;
    navigator.serviceWorker
      .register(basePath + 'service-worker.js', { scope: basePath })
      .then(function (registration) {
        console.log('[PWA] ServiceWorker registered:', registration.scope);
      })
      .catch(function (error) {
        console.log('[PWA] ServiceWorker registration failed:', error);
      });
  });
})();
