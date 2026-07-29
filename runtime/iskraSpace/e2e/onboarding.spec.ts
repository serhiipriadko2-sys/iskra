import { expect, test, type Page } from '@playwright/test';

async function completeStatelessOnboarding(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Войти в ритм/i }).click();
  await page.getByPlaceholder(/имя/i).fill('TestUser');
  await page.getByRole('button', { name: /Продолжить/i }).click();

  await expect(page.getByRole('heading', { name: 'Выбери режим памяти' })).toBeVisible();
  await page.getByRole('button', { name: /Stateless preview/i }).click();

  await expect(page.getByRole('heading', { name: 'Проверка границы' })).toBeVisible();
  const start = page.getByRole('button', { name: /^Начать$/i });
  await expect(start).toBeEnabled();
  await start.click();
}

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('displays onboarding for new users', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Существовать — значит сохранять различие');
    await expect(page.getByRole('button', { name: /Войти в ритм/i })).toBeVisible();
  });

  test('progresses to the name and explicit memory-mode steps', async ({ page }) => {
    await page.getByRole('button', { name: /Войти в ритм/i }).click();

    await expect(page.getByRole('heading', { name: 'Как мне называть тебя?' })).toBeVisible();
    await page.getByPlaceholder(/имя/i).fill('TestUser');
    await page.getByRole('button', { name: /Продолжить/i }).click();

    await expect(page.getByRole('heading', { name: 'Выбери режим памяти' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Stateless preview/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Память с согласием/i })).toBeVisible();
  });

  test('requires name before proceeding', async ({ page }) => {
    await page.getByRole('button', { name: /Войти в ритм/i }).click();

    const continueButton = page.getByRole('button', { name: /Продолжить/i });
    await expect(continueButton).toBeDisabled();

    await page.getByPlaceholder(/имя/i).fill('TestUser');
    await expect(continueButton).toBeEnabled();
  });

  test('completes the stateless onboarding flow', async ({ page }) => {
    await completeStatelessOnboarding(page);
    await expect(page.locator('main')).toBeVisible({ timeout: 5_000 });
  });

  test('persists completion and the selected memory mode locally', async ({ page }) => {
    await completeStatelessOnboarding(page);

    await expect
      .poll(async () => page.evaluate(
        () => localStorage.getItem('iskra.principal.v1:e2e-local:iskra-onboarding-complete')
      ))
      .toBe('true');
    expect(await page.evaluate(() => localStorage.getItem('iskra-onboarding-complete'))).toBeNull();

    const storedState = await page.evaluate(
      () =>
        localStorage.getItem('iskra.principal.v1:e2e-local:iskra-symbiosis-profile-v1')
    );
    expect(storedState).toContain('STATELESS');
  });
});
