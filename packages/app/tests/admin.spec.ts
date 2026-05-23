import { expect, test } from '@playwright/test';

test.describe('Admin - Login Page', () => {
  test('login page loads with form elements', async ({ page }) => {
    await page.goto('/admin/login');

    // Page title
    await expect(page).toHaveTitle(/Lord of the Rinse/);

    // Signup form heading
    await expect(page.getByRole('heading', { name: 'Admin Signup' })).toBeVisible();

    // Form fields
    await expect(page.locator('#signup-name')).toBeVisible();
    await expect(page.locator('#signup-email')).toBeVisible();
    await expect(page.locator('#signup-password')).toBeVisible();

    // Submit button
    await expect(page.getByRole('button', { name: 'Create admin account' })).toBeVisible();

    // Back to shop link
    await expect(page.getByRole('button', { name: 'Back to shop' })).toBeVisible();
  });

  test('can navigate from login back to home', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByRole('button', { name: 'Back to shop' }).click();
    await expect(page).toHaveURL(/\//);
  });
});

test.describe('Admin - Protected Routes', () => {
  test('admin dashboard redirects to login without session', async ({ page }) => {
    await page.goto('/admin');

    // Without a valid session, should redirect to login
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 5000 });
  });

  test('admin attributes redirects to login without session', async ({ page }) => {
    await page.goto('/admin/attributes');

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 5000 });
  });

  test('admin settings redirects to login without session', async ({ page }) => {
    await page.goto('/admin/settings');

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 5000 });
  });

  test('admin variants redirects to login without session', async ({ page }) => {
    await page.goto('/admin/variants');

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 5000 });
  });

  test('admin stock redirects to login without session', async ({ page }) => {
    await page.goto('/admin/stock');

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 5000 });
  });

  test('admin orders redirects to login without session', async ({ page }) => {
    await page.goto('/admin/orders');

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 5000 });
  });

  test('admin production redirects to login without session', async ({ page }) => {
    await page.goto('/admin/production');

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 5000 });
  });
});
