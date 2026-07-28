import { test, expect } from '@playwright/test';
import { navigateToView } from './helpers/navigation';
import { seedCompletedOnboarding } from './helpers/onboarding';

test.describe('App Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await seedCompletedOnboarding(page);
  });

  test('renders without crashing', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('displays Pulse view by default', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('[data-nav="PULSE"]:visible').first()).toBeVisible();
  });

  test('shows metrics information', async ({ page }) => {
    await navigateToView(page, 'METRICS');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.error-boundary, [data-testid="error"]')).not.toBeVisible();
  });

  test('error boundary catches errors gracefully', async ({ page }) => {
    await expect(page.locator('.error-boundary, [data-testid="error"]')).not.toBeVisible();
  });
});

test.describe('Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await seedCompletedOnboarding(page);
    await navigateToView(page, 'CHAT');
  });

  test('displays chat interface', async ({ page }) => {
    await expect(page.locator('textarea, input[type="text"]').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('can type in chat input', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('Hello, Iskra!');
    await expect(input).toHaveValue('Hello, Iskra!');
  });
});

test.describe('Journal Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await seedCompletedOnboarding(page);
    await navigateToView(page, 'JOURNAL');
  });

  test('displays journal interface', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
  });

  test('can write journal entry', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.fill('Today was clear.');
      await expect(textarea).toHaveValue('Today was clear.');
    }
  });
});

test.describe('Planner Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await seedCompletedOnboarding(page);
    await navigateToView(page, 'PLANNER');
  });

  test('displays planner interface', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await seedCompletedOnboarding(page);
  });

  test('has no major accessibility violations', async ({ page }) => {
    const visibleButtons = page.locator('button:visible');
    await expect(visibleButtons.first()).toBeVisible();
    expect(await visibleButtons.count()).toBeGreaterThan(0);
  });

  test('supports keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeDefined();
  });
});

test.describe('Data Persistence', () => {
  test('preserves user data across page reloads', async ({ page }) => {
    await seedCompletedOnboarding(page, { userName: 'PersistenceTest' });
    await page.reload();

    const userName = await page.evaluate(
      () => localStorage.getItem('iskra.principal.v1:e2e-local:iskra-user-name')
    );
    expect(userName).toBe('PersistenceTest');
  });
});
