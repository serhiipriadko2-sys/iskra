import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Single source of truth for the Content-Security-Policy.
// KEEP IN SYNC with vercel.json and nginx.conf (HTTP-header copies).
// Notes:
// - script-src 'self': all inline scripts were externalized (spa-redirect.js,
//   pwa-register.js) and the Vite modulepreload polyfill is disabled below.
// - style-src 'unsafe-inline': required for React inline style props, the inline
//   <style> block, and Google Fonts injected styles (style injection is low XSS risk).
// - connect-src permits Supabase REST/Realtime/Edge and the opt-in telemetry
//   providers. Browser-to-model-provider traffic is intentionally forbidden.
// - frame-ancestors is ignored inside a <meta> CSP (GitHub Pages); it is enforced
//   via HTTP headers on Vercel/nginx. X-Frame-Options provides the meta-side fallback.
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.posthog.com https://*.sentry.io",
  "worker-src 'self'",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

// Inject the CSP as a <meta> tag in production builds only. In dev, Vite/react-refresh
// rely on inline scripts + eval for HMR, which a strict CSP would break.
function cspMetaPlugin(isProd: boolean): Plugin {
  return {
    name: 'iskra-csp-meta',
    transformIndexHtml(html) {
      if (!isProd) return html;
      const meta = `<meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`;
      return html.replace('</title>', `</title>\n    ${meta}`);
    },
  };
}

export default defineConfig(({ command }) => {
  const root = __dirname;
  const isProd = command === 'build';
  return {
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [react(), cspMetaPlugin(isProd)],
    build: {
      // Disable the inline modulepreload polyfill so no inline <script> is emitted
      // (keeps script-src 'self' strict). Modern browsers support modulepreload natively.
      modulePreload: { polyfill: false },
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalized = id.replace(/\\/g, '/');
            if (normalized.includes('/node_modules/react') || normalized.includes('/node_modules/react-dom')) {
              return 'vendor-react';
            }
            if (normalized.includes('/node_modules/@supabase/')) {
              return 'vendor-supabase';
            }
            if (
              normalized.includes('/runtime/src/')
              || normalized.includes('/packages/core/src/')
              || normalized.includes('/packages/math/src/')
            ) {
              return 'iskra-runtime';
            }
          },
        },
      },
    },
    // Configure server to allow serving files from the monorepo root directory. This is
    // required when resolving the local @iskra/runtime and @iskra/math packages.
    server: {
      port: 3000,
      host: '0.0.0.0',
      fs: {
        allow: [path.resolve(root, '../..')],
      },
    },
    resolve: {
      alias: [
        // Use a regex alias for "@/" so that scoped packages like "@iskra/runtime"
        // are not intercepted by this alias. Without the slash this would catch
        // "@iskra/runtime" and break module resolution.
        { find: /^@\//, replacement: `${path.resolve(root, '.')}/` },
        // Explicit alias for the local runtime package. Point to the TypeScript
        // source files so Vite/TS can resolve modules without requiring a build.
        { find: /^@iskra\/runtime$/, replacement: path.resolve(root, '../src/index.ts') },
        { find: /^@iskra\/runtime\/(.*)$/, replacement: path.resolve(root, `../src/$1`) },
        // Explicit alias for the local math package. Point to the TypeScript source files.
        { find: /^@iskra\/math$/, replacement: path.resolve(root, '../../packages/math/src/index.ts') },
        { find: /^@iskra\/math\/(.*)$/, replacement: path.resolve(root, `../../packages/math/src/$1`) },
        // Math source imports core types directly when compiled through iskraSpace.
        { find: /^@iskra\/core$/, replacement: path.resolve(root, '../../packages/core/src/index.ts') },
        { find: /^@iskra\/core\/(.*)$/, replacement: path.resolve(root, `../../packages/core/src/$1`) },
      ],
    },
    test: {
      exclude: ['node_modules', 'e2e', 'playwright-report', 'test-results'],
      environment: 'jsdom',
      pool: 'threads',
      maxWorkers: 2,
    },
  };
});
