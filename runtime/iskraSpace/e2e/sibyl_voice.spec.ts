import { test, expect } from '@playwright/test';
import { navigateToView } from './helpers/navigation';
import { seedCompletedOnboarding } from './helpers/onboarding';

test.describe('Voice Engine - SIBYL Activation', () => {
  test.beforeEach(async ({ page }) => {
    await seedCompletedOnboarding(page, {
      extraStorage: {
        'iskra-voice-preferences': JSON.stringify({ SIBYL: 1.2 }),
      },
    });
    await navigateToView(page, 'CHAT');
  });

  test('activates SIBYL voice when echo metric is high', async ({ page }) => {
    const voiceSelect = page.locator('select');
    if (await voiceSelect.count()) {
      await expect(voiceSelect.first()).toHaveValue('AUTO');
    }

    const input = page.locator('textarea').first();
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('echo echo echo echo echo echo echo echo echo echo listen listen listen listen listen listen listen listen listen listen');
    await page.keyboard.press('Enter');

    await expect(page.locator('header')).toContainText(/SIBYL/i);
  });
});
