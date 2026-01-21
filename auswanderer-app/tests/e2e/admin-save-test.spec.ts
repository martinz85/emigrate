import { test, expect } from '@playwright/test';

test.describe('Admin Section - Save Functionality Test', () => {
  
  test('test if changes are actually saved to database', async ({ page }) => {
    console.log('🚀 Testing if changes are saved to database...\n');
    
    // Step 1: Login
    console.log('📝 Step 1: Login');
    await page.goto('http://localhost:3002/admin-login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'martin@infravivo.se');
    await page.fill('input[type="password"]', 'Emigrate2026!');
    
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.click('button:has-text("Einloggen")')
    ]);
    
    console.log('✅ Login successful');
    
    // Step 2: Go to Header section
    console.log('\n📝 Step 2: Navigate to Header section');
    await page.goto('http://localhost:3002/admin/content/sections/header');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✅ Header section loaded');
    
    // Step 3: Get original value of first field
    console.log('\n📝 Step 3: Read original value');
    const firstInput = page.locator('input, textarea').first();
    const originalValue = await firstInput.inputValue();
    console.log(`   Original value: "${originalValue}"`);
    
    // Step 4: Modify the value
    console.log('\n📝 Step 4: Modify value');
    const testValue = originalValue + ' [TEST_SAVE]';
    await firstInput.fill(testValue);
    console.log(`   Modified value: "${testValue}"`);
    
    await page.screenshot({ 
      path: 'test-results/before-save.png', 
      fullPage: true 
    });
    
    // Step 5: Click Save button
    console.log('\n📝 Step 5: Click Save button');
    const saveButton = page.locator('button:has-text("Speichern")');
    
    // Listen for API call
    let apiCallMade = false;
    let apiResponse: any = null;
    
    page.on('request', (request) => {
      if (request.url().includes('/api/admin/content/sections/header') && request.method() === 'PATCH') {
        apiCallMade = true;
        console.log('   📡 API PATCH request detected');
        console.log('   URL:', request.url());
        console.log('   Method:', request.method());
      }
    });
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/admin/content/sections/header') && response.request().method() === 'PATCH') {
        apiResponse = {
          status: response.status(),
          statusText: response.statusText()
        };
        console.log('   📡 API Response:', apiResponse.status, apiResponse.statusText);
        
        try {
          const body = await response.json();
          console.log('   Response body:', JSON.stringify(body).substring(0, 200));
        } catch (e) {
          console.log('   Response body: (not JSON)');
        }
      }
    });
    
    await saveButton.click();
    await page.waitForTimeout(2000);
    
    if (apiCallMade) {
      console.log('   ✅ API call was made');
      console.log('   Response status:', apiResponse?.status);
    } else {
      console.log('   ❌ NO API call detected!');
    }
    
    // Check if redirected
    const currentUrl = page.url();
    console.log('   Current URL after save:', currentUrl);
    
    if (currentUrl.includes('/admin/content/sections') && !currentUrl.includes('/header')) {
      console.log('   ✅ Redirected to sections overview (save likely successful)');
    } else {
      console.log('   ⚠️ Still on edit page (save might have failed)');
    }
    
    await page.screenshot({ 
      path: 'test-results/after-save.png', 
      fullPage: true 
    });
    
    // Step 6: Go back to Header section and check if value persisted
    console.log('\n📝 Step 6: Reload Header section to verify save');
    await page.goto('http://localhost:3002/admin/content/sections/header');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const firstInputAfterReload = page.locator('input, textarea').first();
    const valueAfterReload = await firstInputAfterReload.inputValue();
    console.log(`   Value after reload: "${valueAfterReload}"`);
    
    if (valueAfterReload === testValue) {
      console.log('   ✅ SUCCESS: Value was saved to database!');
    } else if (valueAfterReload === originalValue) {
      console.log('   ❌ FAILED: Value reverted to original (not saved)');
    } else {
      console.log('   ⚠️ UNEXPECTED: Value is different from both original and test value');
    }
    
    await page.screenshot({ 
      path: 'test-results/after-reload.png', 
      fullPage: true 
    });
    
    // Step 7: Restore original value
    console.log('\n📝 Step 7: Restore original value');
    await firstInputAfterReload.fill(originalValue);
    await page.locator('button:has-text("Speichern")').click();
    await page.waitForTimeout(2000);
    
    console.log('   ✅ Original value restored');
    
    console.log('\n🎯 Test completed!');
  });
});

