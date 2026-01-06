import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3003');
  await page.waitForLoadState('networkidle');
  
  console.log('1. Page loaded');
  
  // Add item to cart
  await page.click('text=Start Building Soaps');
  await page.waitForTimeout(300);
  
  await page.click('button:has-text("Lavender"):not(:has-text("Add Lavender Pieces"))');
  await page.waitForTimeout(200);
  
  await page.click('text=Continue to Color');
  await page.waitForTimeout(200);
  
  await page.locator('button:has-text("White")').click();
  await page.waitForTimeout(200);
  
  await page.fill('input[placeholder="0"]', '5');
  await page.click('button:has-text("Add to Cart")');
  await page.waitForTimeout(1000);
  
  console.log('2. Item added');
  
  // Check cart badge
  const badge = await page.locator('button[aria-label="Open cart"]').isVisible();
  console.log('3. Cart badge visible (desktop):', badge);
  
  // Resize to mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);
  
  console.log('4. Resized to mobile');
  
  // Check badge on mobile
  const badgeMobile = await page.locator('button[aria-label="Open cart"]').isVisible();
  console.log('5. Cart badge visible (mobile):', badgeMobile);
  
  // Get page content
  const bodyText = await page.locator('body').textContent();
  console.log('6. Contains "cart":', bodyText.toLowerCase().includes('cart'));
  
  // Check buttons
  const buttons = await page.locator('button').all();
  console.log('7. Total buttons:', buttons.length);
  
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent().catch(() => '');
    const ariaLabel = await buttons[i].getAttribute('aria-label').catch(() => '');
    if (ariaLabel || text.toLowerCase().includes('cart')) {
      console.log(`    Button ${i}: "${text.substring(0, 40)}" aria-label="${ariaLabel}"`);
    }
  }
  
  await browser.close();
}

test();
