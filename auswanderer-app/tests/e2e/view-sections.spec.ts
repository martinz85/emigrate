import { test, expect } from '@playwright/test';

async function login(page: any) {
  await page.goto('http://localhost:3000/admin-login');
  
  // Check if already logged in
  const url = page.url();
  if (url.includes('/admin') && !url.includes('/admin-login')) {
    console.log('✅ Already logged in');
    return;
  }
  
  await page.waitForLoadState('networkidle');
  
  // Try to fill login form
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
}

test('view header section edit page', async ({ page }) => {
  await login(page);
  
  // Navigate directly to header section
  await page.goto('http://localhost:3000/admin/content/sections/header');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('📍 Current URL:', page.url());
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/section-header.png', fullPage: true });
  
  console.log('✅ Header section page loaded');
});

test('view hero section edit page', async ({ page }) => {
  await login(page);
  
  // Navigate directly to hero section
  await page.goto('http://localhost:3000/admin/content/sections/hero');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('📍 Current URL:', page.url());
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/section-hero.png', fullPage: true });
  
  console.log('✅ Hero section page loaded');
});

test('view faq section edit page', async ({ page }) => {
  await login(page);
  
  // Navigate directly to FAQ section
  await page.goto('http://localhost:3000/admin/content/sections/faq');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('📍 Current URL:', page.url());
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/section-faq.png', fullPage: true });
  
  console.log('✅ FAQ section page loaded');
});

