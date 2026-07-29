import { expect, type Page } from '@playwright/test';
import { createStatelessSymbiosisProfile } from '../../../src/types/symbiosis';

interface CompletedOnboardingOptions {
  userName?: string;
  extraStorage?: Record<string, string>;
}

export async function seedCompletedOnboarding(
  page: Page,
  options: CompletedOnboardingOptions = {}
): Promise<void> {
  const profile = createStatelessSymbiosisProfile({
    iskraName: 'Искра',
    reviewAt: '2099-01-01T00:00:00.000Z',
  });

  await page.addInitScript(
    ({ extraStorage, profile, userName }) => {
      const scoped = (key: string) => `iskra.principal.v1:e2e-local:${key}`;
      localStorage.setItem(scoped('iskra-onboarding-complete'), 'true');
      localStorage.setItem(scoped('iskra-tutorial-seen'), 'true');
      localStorage.setItem(scoped('iskra-user-name'), userName);
      localStorage.setItem(scoped('iskra-symbiosis-profile-v1'), JSON.stringify(profile));
      localStorage.setItem(scoped('iskra-symbiosis-consent-receipts-v1'), '[]');
      for (const [key, value] of Object.entries(extraStorage)) {
        localStorage.setItem(scoped(key), value);
      }
    },
    {
      profile,
      userName: options.userName ?? 'TestUser',
      extraStorage: options.extraStorage ?? {},
    }
  );

  await page.goto('/');
  await expect(page.locator('main')).toBeVisible({ timeout: 15_000 });
}
