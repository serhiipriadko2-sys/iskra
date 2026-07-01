import { test, expect } from '@playwright/test';
import { navigateToView } from './helpers/navigation';

test.describe('Voice Engine - SIBYL Activation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('iskra-onboarding-complete', 'true');
      localStorage.setItem('iskra-tutorial-seen', 'true');
    });
    await page.reload();
    await navigateToView(page, 'CHAT');
  });

  test('activates SIBYL voice when echo metric is high', async ({ page }) => {
    const voiceSelect = page.locator('select');
    if (await voiceSelect.count()) {
      await expect(voiceSelect.first()).toHaveValue('AUTO');
    }

    const input = page.locator('textarea').first();
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('эхо эхо эхо слышу слышу');
    await page.keyboard.press('Enter');

    await expect(page.locator('body')).toContainText(/SIBYL/i);
  });
});
