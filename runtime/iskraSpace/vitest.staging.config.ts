import { defineConfig } from 'vitest/config';

/** Dedicated config: an explicit run fails at preflight instead of skipping live acceptance. */
export default defineConfig({
  test: {
    include: [
      '__tests__/e2e/stagingPreflight.acceptance.ts',
      '__tests__/e2e/graphIsolation.staging.e2e.test.ts',
      '__tests__/e2e/rlsIsolation.staging.e2e.test.ts',
      '__tests__/e2e/edgeBoundary.staging.e2e.test.ts',
      '__tests__/e2e/stagingSourceContract.test.ts',
      'services/__tests__/stagingAcceptanceConfig.test.ts',
      'services/__tests__/stagingAcceptanceReceipt.test.ts',
    ],
    environment: 'node',
    pool: 'threads',
    maxWorkers: 2,
  },
});
