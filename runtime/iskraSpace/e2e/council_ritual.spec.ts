import { test, expect } from '@playwright/test';
import { navigateToView } from './helpers/navigation';
import { seedCompletedOnboarding } from './helpers/onboarding';

test.describe('Council Ritual View', () => {
  test.beforeEach(async ({ page }) => {
    await seedCompletedOnboarding(page);
  });

  test('displays all 9 voices in Council view', async ({ page }) => {
    await navigateToView(page, 'COUNCIL');

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
    await expect(
      page.locator('button:visible', { hasText: /Совет|Council|Созвать/ }).first()
    ).toBeVisible();
    await expect(page.locator('body')).toContainText(/9|ISKRA|KAIN|SAM/i);
  });
});
