import type { Page } from '@playwright/test';

export async function navigateToView(page: Page, view: string): Promise<void> {
  const visibleNav = page.locator(`[data-nav="${view}"]:visible`).first();
  if (await visibleNav.count()) {
    await visibleNav.click();
    await page.waitForTimeout(300);
    return;
  }

  const visibleMenu = page.locator('[data-nav="MENU"]:visible, #nav-item-MENU:visible').first();
  if (await visibleMenu.count()) {
    await visibleMenu.click();
    await page.waitForTimeout(500);
  }

  await page.locator(`[data-nav="${view}"]:visible`).first().click();
  await page.waitForTimeout(300);
}
