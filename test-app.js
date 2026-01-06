import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  console.log('1. Page loaded');
  
  // Complete full flow and add item
  await page.click('text=Start Building Soaps');
  await page.waitForTimeout(300);
  
  await page.click('button:has-text("Lavender")');
  await page.waitForTimeout(200);
  
  await page.click('text=Continue to Color');
  await page.waitForTimeout(300);
  
  await page.locator('button:has-text("White")').click();
  await page.waitForTimeout(200);
  
  await page.fill('input[placeholder="0"]', '5');
  
  // Check Add to Cart before viewport resize
  const addToCartBefore = await page.locator('button:has-text("Add to Cart")').isVisible();
  console.log('2. Add to Cart visible (desktop):', addToCartBefore);
  
  // Resize to mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);
  
  // Check Add to Cart after resize
  const addToCartAfter = await page.locator('button:has-text("Add to Cart")').isVisible();
  console.log('3. Add to Cart visible (mobile):', addToCartAfter);
  
  // Get page content to debug
  const bodyText = await page.locator('body').textContent();
  console.log('4. Page contains "Add to Cart":', bodyText.includes('Add to Cart'));
  console.log('5. Page contains "Start Building":', bodyText.includes('Start Building'));
  console.log('6. Page contains "Choose Scent":', bodyText.includes('Choose Scent'));
  
  // Check what step we're on
  const currentStep = await page.locator('text=/Step \\d of \\d/').isVisible();
  console.log('7. Step indicator visible:', currentStep);
  
  // Try clicking Start Building if we're on landing
  if (!currentStep) {
    const onLanding = await page.locator('text=Start Building Soaps').isVisible();
    if (onLanding) {
      console.log('8. On landing page, clicking Start Building...');
      await page.click('text=Start Building Soaps');
      await page.waitForTimeout(300);
      
      const addToCartAgain = await page.locator('button:has-text("Add to Cart")').isVisible();
      console.log('9. Add to Cart visible after navigating to form:', addToCartAgain);
    }
  }
  
  await browser.close();
}

test();
