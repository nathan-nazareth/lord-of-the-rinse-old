import { chromium } from 'playwright';

async function runComprehensiveTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const results = [];
  const issues = [];
  const consoleErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    console.log('='.repeat(70));
    console.log('CYCLE 1: COMPREHENSIVE TESTING');
    console.log('='.repeat(70) + '\n');

    console.log('--- LANDING PAGE TESTS ---\n');
    
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
    
    const title = await page.locator('h1').first().textContent();
    results.push({ name: 'Landing page title', passed: title?.includes('Organic') || title?.includes('Soap'), details: title });

    const howItWorks = await page.locator('text=How It Works').isVisible();
    results.push({ name: 'How It Works section', passed: howItWorks });

    const step1 = await page.locator('text=Choose Scent & Size').isVisible();
    const step2 = await page.locator('text=Pick a Color').isVisible();
    const step3 = await page.locator('text=Set Quantity').isVisible();
    results.push({ name: 'How It Works steps', passed: step1 && step2 && step3 });

    const naturalBase = await page.locator('text=100% natural coconut soap base').isVisible();
    results.push({ name: 'Trust badge: natural base', passed: naturalBase });

    const startBtn = await page.locator('text=Start Building Soaps').isVisible();
    results.push({ name: 'Start Building button', passed: startBtn });

    console.log('--- FORM FLOW TESTS ---\n');
    
    await page.click('text=Start Building Soaps');
    await page.waitForTimeout(400);

    const stepIndicator = await page.locator('text=/Step \\d of \\d/').isVisible();
    results.push({ name: 'Step indicator visible', passed: stepIndicator });

    const backBtn = await page.locator('text=Back').isVisible();
    results.push({ name: 'Back button visible', passed: backBtn });

    await page.click('button:has-text("Lavender"):not(:has-text("Add Lavender Pieces"))');
    await page.waitForTimeout(200);

    const sizeInput = await page.locator('input[type="number"]').isVisible();
    results.push({ name: 'Size input appears', passed: sizeInput });

    const lavenderToggle = await page.locator('text=Add Lavender Pieces').isVisible();
    results.push({ name: 'Lavender Pieces toggle visible', passed: lavenderToggle });

    await page.click('button:has-text("Add Lavender Pieces")');
    await page.waitForTimeout(100);

    const priceDisplay = await page.locator('text=/Rs\\./').first().isVisible();
    results.push({ name: 'Price display visible', passed: priceDisplay });

    await page.click('text=Continue to Color');
    await page.waitForTimeout(300);

    const colorHeader = await page.locator('text=Choose Color').isVisible();
    results.push({ name: 'Color step header', passed: colorHeader });

    const colorSwatches = await page.locator('[class*="rounded-full"]').count();
    results.push({ name: 'Color swatches count', passed: colorSwatches >= 7, details: `${colorSwatches} found` });

    await page.locator('button:has-text("White")').click();
    await page.waitForTimeout(200);

    const qtyHeader = await page.locator('text=How Many').isVisible();
    results.push({ name: 'Quantity step header', passed: qtyHeader });

    await page.fill('input[placeholder="0"]', '5');
    results.push({ name: 'Quantity input works', passed: true });

    const totalDisplay = await page.locator('text=/Total for 5/').isVisible();
    results.push({ name: 'Total price display', passed: totalDisplay });

    const addToCartBtn = await page.locator('button:has-text("Add to Cart")').isVisible();
    results.push({ name: 'Add to Cart button visible', passed: addToCartBtn });

    const rateLimit = await page.locator('text=/\\d+\\/\\d+ submissions/').isVisible();
    results.push({ name: 'Rate limit display', passed: rateLimit });

    console.log('--- CART TESTS ---\n');
    
    await page.click('button:has-text("Add to Cart")');
    await page.waitForTimeout(1000);

    const toast = await page.locator('text=Added to cart').isVisible();
    results.push({ name: 'Success toast appears', passed: toast });

    const badge = await page.locator('button[aria-label="Open cart"]').isVisible();
    results.push({ name: 'Cart badge visible', passed: badge });

    await page.locator('button[aria-label="Open cart"]').evaluate(el => el.click());
    await page.waitForTimeout(400);

    const cartOpen = await page.locator('text=Your Cart').isVisible();
    results.push({ name: 'Cart opens', passed: cartOpen });

    const cartLavender = await page.locator('text=+ Lavender Pieces').isVisible();
    results.push({ name: 'Lavender Pieces in cart', passed: cartLavender });

    const submitBtn = await page.locator('text=Submit Order').first().isVisible();
    results.push({ name: 'Submit Order button', passed: submitBtn });

    const clearBtn = await page.locator('text=Clear Cart').isVisible();
    results.push({ name: 'Clear Cart button', passed: clearBtn });

    const closeBtn = await page.locator('button:has-text("Close")').isVisible();
    results.push({ name: 'Close button', passed: closeBtn });

    await page.click('button:has-text("Close")');
    await page.waitForTimeout(300);
    const cartClosed = !(await page.locator('text=Your Cart').isVisible().catch(() => false));
    results.push({ name: 'Close cart works', passed: cartClosed });

    await page.locator('button[aria-label="Open cart"]').evaluate(el => el.click());
    await page.waitForTimeout(300);
    const cartReopens = await page.locator('text=Your Cart').isVisible();
    results.push({ name: 'Cart reopens', passed: cartReopens });

    await page.click('text=Clear Cart');
    await page.waitForTimeout(300);
    const cartEmpty = await page.locator('text=Your cart is empty').isVisible();
    results.push({ name: 'Clear Cart empties cart', passed: cartEmpty });

    console.log('--- MOBILE TESTS ---\n');
    
    // Go back to landing page first
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
    
    // Then resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    results.push({ name: 'Mobile viewport set', passed: true });

    // Navigate to form on mobile
    await page.click('text=Start Building Soaps');
    await page.waitForTimeout(400);

    const mobileAdd = await page.locator('button:has-text("Add to Cart")').isVisible();
    results.push({ name: 'Add to Cart on mobile', passed: mobileAdd });

    const mobileBadge = await page.locator('button[aria-label="Open cart"]').isVisible();
    results.push({ name: 'Cart badge on mobile', passed: mobileBadge });

    await page.locator('button[aria-label="Open cart"]').evaluate(el => el.click());
    await page.waitForTimeout(300);
    const mobileClose = await page.locator('button:has-text("Close")').isVisible();
    results.push({ name: 'Close button on mobile', passed: mobileClose });

    console.log('--- CONSOLE ERRORS ---\n');
    
    results.push({ name: 'No console errors', passed: consoleErrors.length === 0, details: consoleErrors.length > 0 ? consoleErrors.join('; ') : undefined });

  } catch (error) {
    results.push({ name: 'Test execution', passed: false, details: error.message });
  }

  await browser.close();

  results.filter(r => !r.passed).forEach(r => {
    issues.push({
      severity: 'medium',
      description: r.details ? `${r.name}: ${r.details}` : r.name
    });
  });

  if (consoleErrors.length > 0) {
    consoleErrors.forEach(err => {
      issues.push({ severity: 'critical', description: `Console error: ${err}` });
    });
  }

  return { results, issues };
}

async function main() {
  const { results, issues } = await runComprehensiveTest();

  console.log('\n' + '='.repeat(70));
  console.log('TEST RESULTS');
  console.log('='.repeat(70));

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);

  console.log(`\nPASSED: ${passed.length}/${results.length}`);
  failed.forEach(r => {
    console.log(`  - ${r.name}${r.details ? ` (${r.details})` : ''}`);
  });

  if (issues.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('ISSUES FOUND');
    console.log('='.repeat(70));
    
    issues.forEach(i => {
      console.log(`  - [${i.severity.toUpperCase()}] ${i.description}`);
    });
  } else {
    console.log('\n' + '='.repeat(70));
    console.log('NO ISSUES FOUND!');
    console.log('='.repeat(70));
  }

  return { results, issues };
}

main().catch(console.error);
