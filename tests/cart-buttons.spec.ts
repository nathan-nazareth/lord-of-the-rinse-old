import { test, expect } from '@playwright/test';

test('cart buttons appear after add to cart', async ({ page }) => {
  await page.goto('https://soap-selling.vercel.app');
  await page.waitForLoadState('networkidle');

  // Start Building
  await page.getByRole('button', { name: 'Start Building Soaps' }).click();
  await page.waitForTimeout(300);

  // Select Lavender
  await page.locator('button:has-text("Lavender")').first().click();
  await page.waitForTimeout(200);

  // Select 75g
  await page.getByRole('button', { name: '75' }).click();
  await page.waitForTimeout(200);

  // Continue to Color
  await page.getByRole('button', { name: 'Continue to Color' }).click();
  await page.waitForTimeout(200);

  // Select Purple
  await page.getByRole('button', { name: 'Purple' }).click();
  await page.waitForTimeout(200);

  // Continue to Quantity
  await page.getByRole('button', { name: 'Continue to Quantity' }).click();
  await page.waitForTimeout(500);

  // Fill quantity
  await page.getByRole('textbox').fill('3');
  await page.waitForTimeout(200);

  // Add to cart
  await page.getByRole('button', { name: 'Add to Cart' }).click();

  // Wait for buttons to appear
  await page.waitForTimeout(1500);

  // Check that cart sidebar is NOT open (main fix)
  const cartSidebar = page.locator('text=Your Cart').first();
  await expect(cartSidebar).not.toBeVisible();

  // Check that "Order Another Soap" button is visible
  const orderAnotherBtn = page.getByRole('button', { name: 'Order Another Soap' });
  await expect(orderAnotherBtn).toBeVisible({ timeout: 5000 });

  // Check that "Proceed to Checkout" button is visible
  const checkoutBtn = page.getByRole('button', { name: 'Proceed to Checkout' });
  await expect(checkoutBtn).toBeVisible({ timeout: 5000 });
});
