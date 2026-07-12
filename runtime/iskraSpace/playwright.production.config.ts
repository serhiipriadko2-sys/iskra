import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-production',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: process.env.ISKRA_PRODUCTION_BASE_URL ?? 'http://127.0.0.1:18080',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-production',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
