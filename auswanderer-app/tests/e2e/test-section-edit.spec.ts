import { test, expect } from '@playwright/test';

test('open and view header section edit page', async ({ page }) => {
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
  await page.waitForTimeout(1000);
  
  console.log('📍 On sections page');
  
  // Click on "Header" section "Bearbeiten" button
  await page.click('text=Header >> .. >> text=Bearbeiten');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('📍 Current URL:', page.url());
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/section-edit-header.png', fullPage: true });
  
  console.log('✅ Header section edit page loaded');
});

test('open and view hero section edit page', async ({ page }) => {
  // Login first
  await page.goto('http://localhost:3000/admin-login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'martin@infravivo.se');
  await page.fill('input[type="password"]', 'Emigrate2026!');
  
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }),
    page.click('button:has-text("Einloggen")')
  ]);
  
  // Navigate to content sections
  await page.goto('http://localhost:3000/admin/content/sections');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Click on "Hero Section" "Bearbeiten" button
  await page.click('text=Hero Section >> .. >> text=Bearbeiten');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('📍 Current URL:', page.url());
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/section-edit-hero.png', fullPage: true });
  
  console.log('✅ Hero section edit page loaded');
});

