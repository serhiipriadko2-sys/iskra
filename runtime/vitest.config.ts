import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@iskra/runtime': path.resolve(__dirname, './src/index.ts'),
      '@google/genai': path.resolve(
        __dirname,
        './iskraSpace/testSupport/googleGenAIMock.ts'
      ),
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'iskraSpace/**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'iskraSpace/e2e/**', // Playwright e2e tests (run separately via npm run test:e2e)
      '**/*.spec.ts',
    ],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/__tests__/**',
        '**/testSupport/**',
        'iskraSpace/e2e/**', // Playwright e2e tests
      ],
    },
  },
});
