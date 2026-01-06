import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3003');
  await page.waitForLoadState('networkidle');
  
  // Check desktop landing
  const landingDesktop = await page.locator('text=Start Building Soaps').isVisible();
  console.log('1. Start Building Soaps on desktop:', landingDesktop);
  
  // Get all text on page
  const bodyText = await page.locator('body').textContent();
  console.log('2. Landing page text sample:', bodyText.substring(0, 200));
  
  // Resize to mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);
  
  console.log('3. Resized to mobile');
  
  // Reload on mobile
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  // Check mobile landing
  const landingMobile = await page.locator('text=Start Building Soaps').isVisible();
  console.log('4. Start Building Soaps on mobile:', landingMobile);
  
  // Get page source
  const bodyMobile = await page.locator('body').textContent();
  console.log('5. Mobile page text sample:', bodyMobile.substring(0, 200));
  
  // Try different selectors
  const allButtons = await page.locator('button').all();
  console.log('6. Total buttons on mobile:', allButtons.length);
  
  for (let i = 0; i < allButtons.length; i++) {
    const text = await allButtons[i].textContent().catch(() => '');
    if (text.length > 0) {
      console.log(`   Button ${i}: "${text.substring(0, 50)}"`);
    }
  }
  
  // Check for button with "Start" or "Building"
  const startBtn = await page.locator('button:has-text("Start")').count();
  const buildBtn = await page.locator('button:has-text("Building")').count();
  console.log('7. Buttons with "Start":', startBtn);
  console.log('8. Buttons with "Building":', buildBtn);
  
  await browser.close();
}

test();
