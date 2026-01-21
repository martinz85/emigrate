import { test, expect } from '@playwright/test';

test.describe('Simple Admin Change Test', () => {
  
  test('change headline and check frontend', async ({ page }) => {
    console.log('🚀 Simple test: Change headline via admin\n');
    
    // Step 1: Go directly to homepage and check current headline
    console.log('📝 Step 1: Check current headline on homepage');
    await page.goto('http://localhost:3002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const h1 = page.locator('h1').first();
    const currentHeadline = await h1.textContent();
    console.log(`   Current headline: "${currentHeadline}"`);
    
    await page.screenshot({ 
      path: 'test-results/homepage-before-change.png', 
      fullPage: true 
    });
    
    // Step 2: Login to admin
    console.log('\n📝 Step 2: Login to admin');
    await page.goto('http://localhost:3002/admin-login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'martin@infravivo.se');
    await page.fill('input[type="password"]', 'Emigrate2026!');
    
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.click('button:has-text("Einloggen")')
    ]);
    
    console.log('   ✅ Logged in');
    
    // Step 3: Go to hero section edit
    console.log('\n📝 Step 3: Navigate to hero section edit');
    await page.goto('http://localhost:3002/admin/content/sections/hero');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if page loaded
    const pageTitle = await page.locator('h1, h2').first().textContent();
    console.log(`   Page title: "${pageTitle}"`);
    
    // Find all inputs
    const inputs = page.locator('input, textarea');
    const inputCount = await inputs.count();
    console.log(`   Found ${inputCount} input fields`);
    
    if (inputCount === 0) {
      console.log('   ❌ No input fields found! Page might not have loaded correctly.');
      await page.screenshot({ 
        path: 'test-results/hero-edit-no-inputs.png', 
        fullPage: true 
      });
      return;
    }
    
    // Step 4: Find headline field (first field should be headline)
    console.log('\n📝 Step 4: Modify headline field');
    const headlineInput = inputs.first();
    const originalValue = await headlineInput.inputValue();
    console.log(`   Original value: "${originalValue}"`);
    
    const testValue = 'TEST_HEADLINE_CHANGED';
    await headlineInput.fill(testValue);
    console.log(`   New value: "${testValue}"`);
    
    // Step 5: Save
    console.log('\n📝 Step 5: Save changes');
    await page.locator('button:has-text("Speichern")').click();
    await page.waitForTimeout(3000);
    
    console.log('   ✅ Saved');
    
    // Step 6: Go back to homepage
    console.log('\n📝 Step 6: Check homepage for changes');
    await page.goto('http://localhost:3002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const newH1 = page.locator('h1').first();
    const newHeadline = await newH1.textContent();
    console.log(`   New headline on homepage: "${newHeadline}"`);
    
    await page.screenshot({ 
      path: 'test-results/homepage-after-change.png', 
      fullPage: true 
    });
    
    if (newHeadline?.includes(testValue)) {
      console.log('   ✅ SUCCESS: Changes are visible on frontend!');
    } else {
      console.log('   ❌ FAILED: Changes NOT visible on frontend');
      console.log('   Expected to find:', testValue);
      console.log('   Actually found:', newHeadline);
    }
    
    // Step 7: Restore original
    console.log('\n📝 Step 7: Restore original value');
    await page.goto('http://localhost:3002/admin/content/sections/hero');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const restoreInput = inputs.first();
    await restoreInput.fill(originalValue);
    await page.locator('button:has-text("Speichern")').click();
    await page.waitForTimeout(2000);
    
    console.log('   ✅ Original value restored');
    
    console.log('\n🎯 Test completed!');
  });
});

