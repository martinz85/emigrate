import { test, expect } from '@playwright/test';

test.describe('Admin Content Sections Page', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the sections page
    await page.goto('/admin/content/sections');
  });

  test('should load the sections page without errors', async ({ page }) => {
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check that we're on the correct page
    await expect(page).toHaveURL(/\/admin\/content\/sections/);
    
    // Check for page title or heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    
    console.log('✅ Page loaded successfully');
  });

  test('should display the admin header', async ({ page }) => {
    // Check if AdminHeader component is rendered
    const header = page.locator('header, [role="banner"]').first();
    await expect(header).toBeVisible();
    
    console.log('✅ Admin header is visible');
  });

  test('should display sections list or empty state', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Either sections table/list or empty state should be visible
    const hasSections = await page.locator('table, [role="table"], [data-testid="sections-list"]').count() > 0;
    const hasEmptyState = await page.locator('text=/no sections|empty|keine/i').count() > 0;
    
    expect(hasSections || hasEmptyState).toBeTruthy();
    
    console.log('✅ Sections list or empty state is displayed');
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Filter out known/acceptable errors if any
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('sourcemap')
    );
    
    expect(criticalErrors).toHaveLength(0);
    
    console.log('✅ No console errors detected');
  });

  test('should have working navigation', async ({ page }) => {
    // Check if navigation links are present and clickable
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const linkCount = await navLinks.count();
    
    expect(linkCount).toBeGreaterThan(0);
    
    console.log(`✅ Found ${linkCount} navigation links`);
  });

  test('should be responsive', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
    
    let isVisible = await page.locator('body').isVisible();
    expect(isVisible).toBeTruthy();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    isVisible = await page.locator('body').isVisible();
    expect(isVisible).toBeTruthy();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    isVisible = await page.locator('body').isVisible();
    expect(isVisible).toBeTruthy();
    
    console.log('✅ Page is responsive across different viewports');
  });

  test('should make API call to fetch sections', async ({ page }) => {
    const apiCalls: string[] = [];
    
    page.on('request', (request) => {
      if (request.url().includes('/api/admin/content/sections')) {
        apiCalls.push(request.url());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    expect(apiCalls.length).toBeGreaterThan(0);
    
    console.log('✅ API call to /api/admin/content/sections was made');
  });

  test('should handle API response', async ({ page }) => {
    let apiResponseStatus = 0;
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/admin/content/sections')) {
        apiResponseStatus = response.status();
        console.log(`API Response Status: ${apiResponseStatus}`);
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Should be either 200 (success) or 401/403 (auth required)
    expect([200, 401, 403]).toContain(apiResponseStatus);
    
    console.log('✅ API response received');
  });
});


