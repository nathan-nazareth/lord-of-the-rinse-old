import { chromium } from 'playwright';

async function quickTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const issues = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      issues.push(`Console error: ${msg.text()}`);
    }
  });
  
  try {
    // Landing page
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
    
    if (!(await page.locator('text=Start Building Soaps').isVisible())) {
      issues.push('Landing page not loading');
    }
    
    // Form flow
    await page.click('text=Start Building Soaps');
    await page.waitForTimeout(300);
    
    if (!(await page.locator('text=Step 1 of 3').isVisible())) {
      issues.push('Step indicator not showing');
    }
    
    await page.click('button:has-text("Lavender"):not(:has-text("Add Lavender Pieces"))');
    await page.waitForTimeout(200);
    
    await page.click('text=Continue to Color');
    await page.waitForTimeout(200);
    
    await page.locator('button:has-text("White")').click();
    await page.waitForTimeout(200);
    
    await page.fill('input[placeholder="0"]', '5');
    await page.click('button:has-text("Add to Cart")');
    await page.waitForTimeout(1000);
    
    if (!(await page.locator('text=Added to cart').isVisible())) {
      issues.push('Toast not appearing');
    }
    
    // Cart
    await page.locator('button[aria-label="Open cart"]').evaluate(el => el.click());
    await page.waitForTimeout(300);
    
    if (!(await page.locator('text=Your Cart').isVisible())) {
      issues.push('Cart not opening');
    }
    
    if (!(await page.locator('text=+ Lavender Pieces').isVisible())) {
      issues.push('Lavender Pieces not in cart');
    }
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(400);
    
    if (!(await page.locator('button:has-text("Add to Cart")').isVisible())) {
      issues.push('Add to Cart not visible on mobile');
    }
    
  } catch (error) {
    issues.push(`Test error: ${error.message}`);
  }
  
  await browser.close();
  
  console.log('='.repeat(50));
  if (issues.length === 0) {
    console.log('QUICK TEST: ALL CHECKS PASSED');
  } else {
    console.log('QUICK TEST ISSUES:');
    issues.forEach(i => console.log(`  - ${i}`));
  }
  console.log('='.repeat(50));
}

quickTest();
