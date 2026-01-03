import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'iskraSpace/**/*.test.ts'],
    exclude: [
      'node_modules',
      'dist',
      'iskraSpace/e2e/**',
      '**/*.spec.ts',
    ],
    globals: true,
  },
});
