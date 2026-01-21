import { test, expect } from '@playwright/test';

test('view header section with full wait', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/admin-login');
  await page.waitForLoadState('networkidle');
  
  const emailField = await page.locator('input[type="email"]').count();
  if (emailField > 0) {
    await page.fill('input[type="email"]', 'martin@infravivo.se');
    await page.fill('input[type="password"]', 'Emigrate2026!');
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
      page.click('button:has-text("Einloggen")')
    ]);
  }
  
  console.log('✅ Logged in');
  
  // Navigate to header section
  await page.goto('http://localhost:3000/admin/content/sections/header');
  
  // Wait for the page to load completely
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000); // Wait 5 seconds for full render
  
  // Wait for specific content to appear
  await page.waitForSelector('text=Header bearbeiten', { timeout: 10000 }).catch(() => {});
  
  console.log('📍 Current URL:', page.url());
  
  // Check page content
  const content = await page.content();
  console.log('📄 Page has AdminHeader:', content.includes('AdminHeader') || content.includes('Header bearbeiten'));
  console.log('📄 Page has input fields:', content.includes('input') || content.includes('textarea'));
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/final-header.png', fullPage: true });
  
  console.log('✅ Screenshot taken');
});

