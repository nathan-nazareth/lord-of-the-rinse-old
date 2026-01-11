import { test, expect } from '@playwright/test';

test('homepage loads and app is interactive', async ({ page }) => {
  await page.goto('/');
  
  await expect(page).toHaveTitle(/Organic Soap Builder/);
  
  await expect(page.locator('h1:has-text("Handmade Soap Workshop")')).toBeVisible();
  
  await expect(page.locator('text=Handcraft your own organic soaps')).toBeVisible();
  
  const soapForm = page.locator('[class*="parchment-paper"]').first();
  await expect(soapForm).toBeVisible();
  
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
});
