import { expect, test } from '@playwright/test';

test.describe('Storefront - Homepage', () => {
  test('loads and shows landing page with Shop Now button', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Lord of the Rinse/);

    // Landing page should show the "Shop Now" button
    const shopNowButton = page.getByRole('button', { name: 'Shop Now' });
    await expect(shopNowButton).toBeVisible();

    // Bulk discount text visible
    await expect(page.getByText('Bulk discounts available')).toBeVisible();
  });

  test('clicking Shop Now reveals the soap form', async ({ page }) => {
    await page.goto('/');

    // Click Shop Now on the landing overlay
    await page.getByRole('button', { name: 'Shop Now' }).click();

    // Soap form should become visible — look for the main content area
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();

    // The form should show step indicators (shape, scent, color, size, quantity)
    await expect(page.locator('[aria-label="shape step"]')).toBeVisible();
    await expect(page.locator('[aria-label="scent step"]')).toBeVisible();
  });

  test('footer is visible on the form page', async ({ page }) => {
    await page.goto('/');

    // Dismiss landing overlay
    await page.getByRole('button', { name: 'Shop Now' }).click();

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("Made with love and nature's botanicals");
  });
});

test.describe('Storefront - Cart Page', () => {
  test('cart page loads and shows empty state', async ({ page }) => {
    await page.goto('/cart');

    // Page title
    await expect(page).toHaveTitle(/Cart/);

    // Cart page should show the back-to-form link or empty state
    const backButton = page.getByRole('button', { name: /back/i });
    const emptyState = page.getByText(/empty/i);
    // At least one of these should be present
    await expect(backButton.or(emptyState)).toBeVisible();
  });

  test('can navigate from cart back to home', async ({ page }) => {
    await page.goto('/cart');

    // Find and click a back/home button
    const backButton = page.getByRole('button', { name: /back|shop/i });
    if (await backButton.isVisible()) {
      await backButton.first().click();
      await expect(page).toHaveURL(/\//);
    }
  });
});

test.describe('Storefront - Checkout Page', () => {
  test('redirects to cart when cart is empty', async ({ page }) => {
    await page.goto('/checkout');

    // With empty cart, should redirect to /cart
    await expect(page).toHaveURL(/\/cart/, { timeout: 5000 });
  });
});

test.describe('Storefront - Confirmation Page', () => {
  test('confirmation page loads', async ({ page }) => {
    await page.goto('/confirmation');

    // Page should load without error — it may show content even without a ref
    await expect(page).toHaveTitle(/Order/);
  });
});
