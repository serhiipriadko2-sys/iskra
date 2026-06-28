import { test, expect } from '@playwright/test';

const HOME = '/?reduced-motion=1';

test.describe('iskra-site smoke', () => {
  test('loads the home page in reduced-motion fallback', async ({ page }) => {
    await page.goto(HOME);
    await expect(page).toHaveTitle(/Искра/);
    await expect(page.getByRole('heading', { name: 'Древо Искры', level: 1 })).toBeVisible();
    await expect(page.getByText('Активирован упрощённый режим')).toBeVisible();
  });

  test('clicking a node opens the detail panel in fallback', async ({ page }) => {
    await page.goto(HOME);
    const nodeButton = page.getByRole('button', { name: 'Архитектура', exact: true });
    await expect(nodeButton).toBeVisible();
    await nodeButton.click();

    const panel = page.getByRole('region', { name: 'Описание узла' });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('heading', { level: 3 })).toContainText('Архитектура');
  });

  test('opens RepoAtlas and filters the index', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    const atlasButton = page.getByRole('button', { name: 'Атлас', exact: true });
    await expect(atlasButton).toBeVisible();
    await atlasButton.click();

    await expect(page.getByRole('heading', { name: 'Атлас репозитория' })).toBeVisible();
    await expect(page.getByRole('tree', { name: 'Репозиторий' })).toBeVisible();

    const searchInput = page.getByLabel('Поиск по индексу');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('AGENTS.md');

    const match = page.getByRole('treeitem').filter({ hasText: /AGENTS\.md/ }).first();
    await expect(match).toBeVisible();
  });
});
