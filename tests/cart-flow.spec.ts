import { test, expect } from '@playwright/test';

test('step by step debug', async ({ page }) => {
  await page.goto('https://soap-selling.vercel.app');
  await page.waitForLoadState('networkidle');
  
  console.log('Step 0: Initial load');
  
  // Step 1: Click Start Building Soaps
  await page.getByRole('button', { name: 'Start Building Soaps' }).click();
  await page.waitForTimeout(300);
  console.log('Step 1: After Start Building, current step indicators:',
    await page.locator('text=/Scent|Color|Quantity/').allTextContents());
  
  // Step 2: Click Lavender
  await page.locator('button:has-text("Lavender")').first().click();
  await page.waitForTimeout(300);
  console.log('Step 2: After Lavender, visible text:', 
    (await page.locator('text=/Lavender|Continue/').first().isVisible()) ? 'Lavender/Continue visible' : 'NOT visible');
  
  // Step 3: Click 75g
  await page.getByRole('button', { name: '75' }).click();
  await page.waitForTimeout(300);
  
  // Step 4: Continue to Color
  await page.getByRole('button', { name: 'Continue to Color' }).click();
  await page.waitForTimeout(300);
  console.log('Step 4: After Continue to Color');
  
  // Step 5: Click Purple
  await page.getByRole('button', { name: 'Purple' }).click();
  await page.waitForTimeout(300);
  console.log('Step 5: After Purple, color selected:', await page.locator('text=/Purple.*Selected/').isVisible());
  
  // Step 6: Continue to Quantity
  const continueQtyBtn = page.getByRole('button', { name: 'Continue to Quantity' });
  const isContinueQtyVisible = await continueQtyBtn.isVisible();
  const isContinueQtyEnabled = await continueQtyBtn.isEnabled();
  console.log('Step 6: Continue to Quantity visible:', isContinueQtyVisible, 'enabled:', isContinueQtyEnabled);
  
  await page.getByRole('button', { name: 'Continue to Quantity' }).click();
  await page.waitForTimeout(500);
  
  // Step 7: Check quantity section
  const howManyVisible = await page.locator('text=How Many?').isVisible();
  console.log('Step 7: How Many? visible:', howManyVisible);
  
  // Step 8: Fill quantity
  await page.getByRole('textbox').fill('3');
  await page.waitForTimeout(300);
  
  // Step 9: Add to cart
  console.log('Step 9: Before Add to Cart');
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await page.waitForTimeout(1000);
  
  // Step 10: Check results
  const toastVisible = await page.locator('text=Added to cart!').isVisible();
  const cartVisible = await page.locator('text=Your Cart').first().isVisible();
  const checkoutVisible = await page.getByRole('button', { name: 'Proceed to Checkout' }).isVisible();
  const orderAnotherVisible = await page.getByRole('button', { name: 'Order Another' }).isVisible();
  
  console.log('Step 10 Results:');
  console.log('  Toast visible:', toastVisible);
  console.log('  Cart sidebar visible:', cartVisible);
  console.log('  Proceed to Checkout visible:', checkoutVisible);
  console.log('  Order Another visible:', orderAnotherVisible);
});
