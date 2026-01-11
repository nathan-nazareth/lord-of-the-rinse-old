import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Organic Soap Builder/);
  await expect(page.locator('h1:has-text("Handmade Soap Workshop")')).toBeVisible();
  await expect(page.locator('text=Handcraft your own organic soaps')).toBeVisible();
  await expect(page.locator('button:has-text("Start Building Soaps")')).toBeVisible();
});

test('quantity validation prevents zero quantity submission', async ({ page }) => {
  await page.goto('/');
  
  // Go through the form flow
  await page.getByRole('button', { name: 'Start Building Soaps' }).click();
  
  // Select a scent
  await page.getByRole('button', { name: 'Lavender - Calming & relaxing' }).click();
  
  // Select a size
  await page.getByRole('button', { name: 'M size (75 grams)' }).click();
  
  // Continue to color
  await page.getByRole('button', { name: 'Continue to Color' }).click();
  
  // Select a color
  await page.getByRole('button', { name: 'Select Blue color' }).click();
  
  // Continue to quantity
  await page.getByRole('button', { name: 'Continue to Quantity' }).click();
  
  // Test that Add to Cart is disabled when quantity is 0
  await page.getByRole('textbox', { name: '0' }).fill('0');
  
  // Should see validation error message
  await expect(page.locator('text=Please enter a quantity greater than 0')).toBeVisible();
  
  // Add to Cart button should be disabled
  const addButton = page.getByRole('button', { name: 'Add to Cart' });
  await expect(addButton).toBeDisabled();
  
  // Enter valid quantity
  await page.getByRole('textbox', { name: '0' }).fill('1');
  
  // Validation error should disappear
  await expect(page.locator('text=Please enter a quantity greater than 0')).not.toBeVisible();
  
  // Button should be enabled
  await expect(addButton).toBeEnabled();
});

test('accessibility improvements work correctly', async ({ page }) => {
  await page.goto('/');
  
  // Test scent buttons have proper ARIA labels
  await page.getByRole('button', { name: 'Start Building Soaps' }).click();
  
  const lavenderButton = page.getByRole('button', { name: 'Lavender - Calming & relaxing' });
  await expect(lavenderButton).toBeVisible();
  
  const aloeVeraButton = page.getByRole('button', { name: 'Aloe Vera - Soothing & gentle' });
  await expect(aloeVeraButton).toBeVisible();
  
  const coconutButton = page.getByRole('button', { name: 'Coconut - Tropical & hydrating' });
  await expect(coconutButton).toBeVisible();
  
  // Click a scent to see size buttons
  await lavenderButton.click();
  
  // Test size buttons have proper ARIA labels
  const smallButton = page.getByRole('button', { name: 'S size (50 grams)' });
  const mediumButton = page.getByRole('button', { name: 'M size (75 grams)' });
  const largeButton = page.getByRole('button', { name: 'L size (100 grams)' });
  
  await expect(smallButton).toBeVisible();
  await expect(mediumButton).toBeVisible();
  await expect(largeButton).toBeVisible();
  
  // Select a size
  await mediumButton.click();
  
  // Test lavender pieces toggle has ARIA label
  const lavenderToggle = page.getByRole('button', { name: /lavender pieces for an additional Rs. 5/i });
  await expect(lavenderToggle).toBeVisible();
  
  // Continue to color
  await page.getByRole('button', { name: 'Continue to Color' }).click();
  
  // Test color buttons have proper ARIA labels
  const blueButton = page.getByRole('button', { name: 'Select Blue color' });
  const greenButton = page.getByRole('button', { name: 'Select Green color' });
  
  await expect(blueButton).toBeVisible();
  await expect(greenButton).toBeVisible();
  
  await blueButton.click();
});

test('full form flow with valid data works', async ({ page }) => {
  await page.goto('/');
  
  // Start building soaps
  await page.getByRole('button', { name: 'Start Building Soaps' }).click();
  
  // Select scent, size, and lavender pieces
  await page.getByRole('button', { name: 'Honey - Sweet & nourishing' }).click();
  await page.getByRole('button', { name: 'L size (100 grams)' }).click();
  await page.getByRole('button', { name: /lavender pieces for an additional Rs. 5/i }).click();
  
  // Continue to color
  await page.getByRole('button', { name: 'Continue to Color' }).click();
  
  // Select color
  await page.getByRole('button', { name: 'Select Yellow color' }).click();
  
  // Continue to quantity
  await page.getByRole('button', { name: 'Continue to Quantity' }).click();
  
  // Enter quantity
  await page.getByRole('textbox', { name: '0' }).fill('3');
  
  // Verify price calculation shows
  await expect(page.locator('text=Subtotal for 3 soaps:')).toBeVisible();
  
  // Add to cart
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  
  // Should show success toast
  await expect(page.locator('text=Added to cart!')).toBeVisible();
});

test('cart accessibility and functionality', async ({ page }) => {
  await page.goto('/');
  
  // Add an item to cart first
  await page.getByRole('button', { name: 'Start Building Soaps' }).click();
  await page.getByRole('button', { name: 'Coffee - Energizing & exfoliating' }).click();
  await page.getByRole('button', { name: 'M size (75 grams)' }).click();
  await page.getByRole('button', { name: 'Continue to Color' }).click();
  await page.getByRole('button', { name: 'Select White color, recommended for this scent' }).click();
  await page.getByRole('button', { name: 'Continue to Quantity' }).click();
  await page.getByRole('textbox', { name: '0' }).fill('2');
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  
  // Open cart
  await page.getByRole('button', { name: 'Open cart' }).click();
  
  // Verify cart content
  await expect(page.locator('text=Your Cart')).toBeVisible();
  await expect(page.locator('text=Multiple items:')).toBeVisible();
  
  // Test remove item button accessibility
  const removeButton = page.getByRole('button', { name: 'Remove item' });
  await expect(removeButton).toBeVisible();
  
  // Test close button accessibility
  const closeButton = page.getByRole('button', { name: 'Close cart' });
  await expect(closeButton).toBeVisible();
  
  // Close cart
  await closeButton.click();
});