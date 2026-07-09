// GitHub Pages SPA routing handler — decodes redirects produced by 404.html.
// Extracted from inline index.html so the app can run under a strict
// Content-Security-Policy (script-src 'self').
(function (l) {
  if (l.search[1] === '/') {
    var decoded = l.search.slice(1).split('&').map(function (s) {
      return s.replace(/~and~/g, '&');
    }).join('?');
    window.history.replaceState(null, null,
      l.pathname.slice(0, -1) + decoded + l.hash
    );
  }
}(window.location));
