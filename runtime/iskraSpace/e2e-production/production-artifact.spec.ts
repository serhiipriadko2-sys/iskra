import { expect, test } from '@playwright/test';

test('serves the closed-beta boundary from the canonical production artifact', async ({
  page,
  request,
}) => {
  const navigation = await page.goto('/');
  expect(navigation?.status()).toBe(200);
  expect(navigation?.headers()['content-security-policy']).toContain("default-src 'self'");

  await expect(page.locator('#beta-email')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('main')).toHaveCount(1);

  const runtimeConfig = await request.get('/runtime-config.js');
  expect(runtimeConfig.ok()).toBe(true);
  expect(runtimeConfig.headers()['cache-control']).toMatch(/no-(?:cache|store)/i);
  const runtimeConfigBody = await runtimeConfig.text();
  expect(runtimeConfigBody).toContain('https://smoke.supabase.co');
  expect(runtimeConfigBody).not.toContain('service_role');

  const browserConfig = await page.evaluate(() => window.__ISKRA_RUNTIME_CONFIG__);
  expect(browserConfig?.VITE_SUPABASE_URL).toBe('https://smoke.supabase.co');
});
