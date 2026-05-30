import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  const root = __dirname;
  return {
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [react()],
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
      ],
    },
    test: {
      exclude: ['node_modules', 'e2e', 'playwright-report', 'test-results'],
      environment: 'jsdom',
    },
  };
});
