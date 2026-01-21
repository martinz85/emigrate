import { test, expect } from '@playwright/test';

test('debug content sections page', async ({ page }) => {
  // Login first
  await page.goto('http://localhost:3000/admin-login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'martin@infravivo.se');
  await page.fill('input[type="password"]', 'Emigrate2026!');
  
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }),
    page.click('button:has-text("Einloggen")')
  ]);
  
  console.log('✅ Logged in');
  
  // Intercept API calls
  const apiResponses: any[] = [];
  page.on('response', async (response) => {
    if (response.url().includes('/api/admin/content/sections')) {
      const data = await response.json().catch(() => null);
      console.log('📡 API Response:', response.url(), response.status(), data);
      apiResponses.push({ url: response.url(), status: response.status(), data });
    }
  });
  
  // Navigate to content sections
  await page.goto('http://localhost:3000/admin/content/sections');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Check console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-sections.png', fullPage: true });
  
  // Check what's rendered
  const cards = await page.locator('.grid > *').count();
  console.log(`📊 Found ${cards} cards on page`);
  
  // Check if loading state
  const loadingElements = await page.locator('.animate-pulse').count();
  console.log(`⏳ Loading elements: ${loadingElements}`);
  
  // Get page HTML for debugging
  const html = await page.content();
  console.log('📄 Page contains "Bearbeiten" button:', html.includes('Bearbeiten'));
  console.log('📄 Page contains "Header":', html.includes('Header'));
  
  console.log('✅ Debug complete');
});

