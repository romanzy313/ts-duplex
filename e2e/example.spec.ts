import { test, expect } from '@playwright/test';

test('demo loads library successfully', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/demo/);

  await expect(page.locator("#hello")).toHaveText("hello")
});
