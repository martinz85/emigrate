import { test, expect } from '@playwright/test';

test.describe('Admin Login and Navigation', () => {
  test('should login and show admin dashboard', async ({ page }) => {
    // Go to login page
    await page.goto('http://localhost:3000/admin-login');
    await page.waitForLoadState('networkidle');
    
    console.log('📍 On login page');
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'martin@infravivo.se');
    await page.fill('input[type="password"]', 'Emigrate2026!');
    
    console.log('✍️ Filled in credentials');
    
    // Click login button and wait for navigation
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.click('button:has-text("Einloggen")')
    ]);
    
    console.log('🔄 Navigation completed');
    console.log('📍 Current URL:', page.url());
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of admin dashboard
    await page.screenshot({ path: 'test-results/admin-dashboard.png', fullPage: true });
    
    console.log('✅ Successfully logged in to admin area');
  });

  test('should navigate to content sections', async ({ page }) => {
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
    
    // Navigate to content sections
    await page.goto('http://localhost:3000/admin/content/sections');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('📍 Current URL:', page.url());
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/admin-sections.png', fullPage: true });
    
    console.log('✅ Content sections page loaded');
  });
});

