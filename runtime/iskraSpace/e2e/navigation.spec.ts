import { test, expect, type Page } from '@playwright/test';
import { navigateToView } from './helpers/navigation';

async function completeOnboarding(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('iskra-onboarding-complete', 'true');
    localStorage.setItem('iskra-tutorial-seen', 'true');
    localStorage.setItem('iskra-user-name', 'TestUser');
  });
  await page.reload();
}

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('displays main app after onboarding', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
  });

  test('does not expose the unavailable Live conversation route in closed beta', async ({ page }) => {
    await expect(page.locator('[data-nav="LIVE"]')).toHaveCount(0);
  });

  for (const view of ['PLANNER', 'JOURNAL', 'CHAT', 'SETTINGS', 'METRICS'] as const) {
    test(`can navigate to ${view} view`, async ({ page }) => {
      await navigateToView(page, view);
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('.error-boundary, [data-testid="error"]')).not.toBeVisible();
    });
  }
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('shows mobile menu on small screens', async ({ page }) => {
    await expect(page.locator('[data-nav="MENU"]:visible')).toBeVisible();
  });

  test('can open mobile menu', async ({ page }) => {
    await page.locator('[data-nav="MENU"]:visible').first().click();
    await expect(page.locator('[data-nav="METRICS"]:visible')).toBeVisible();
  });
});
