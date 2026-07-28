import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@iskra/runtime': path.resolve(__dirname, './src/index.ts'),
      '@iskra/math': path.resolve(__dirname, '../packages/math/src/index.ts'),
      '@iskra/core': path.resolve(__dirname, '../packages/core/src/index.ts'),
      '@google/genai': path.resolve(
        __dirname,
        './iskraSpace/testSupport/googleGenAIMock.ts'
      ),
    },
  },
  test: {
    pool: 'threads',
    maxWorkers: 1,
    include: ['guard-regression/guardRemediationBaseline.test.ts'],
    globals: true,
  },
});
