import { test, expect } from '@playwright/test';

test.describe('Admin to Frontend Sync Test', () => {
  
  test('verify changes in admin appear on frontend', async ({ page }) => {
    console.log('🚀 Testing if admin changes appear on frontend...\n');
    
    // Step 1: Login to Admin
    console.log('📝 Step 1: Login to Admin');
    await page.goto('http://localhost:3002/admin-login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'martin@infravivo.se');
    await page.fill('input[type="password"]', 'Emigrate2026!');
    
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.click('button:has-text("Einloggen")')
    ]);
    
    console.log('✅ Login successful');
    
    // Step 2: Go to Hero section (easier to find on frontend)
    console.log('\n📝 Step 2: Navigate to Hero section');
    await page.goto('http://localhost:3002/admin/content/sections/hero');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Step 3: Find the main headline field and read original value
    console.log('\n📝 Step 3: Read original headline value');
    
    // Look for the headline field (usually first or labeled as "Headline" or "Überschrift")
    const inputs = page.locator('input, textarea');
    const inputCount = await inputs.count();
    console.log(`   Found ${inputCount} input fields`);
    
    // Try to find headline field by label
    let headlineInput = null;
    let originalHeadline = '';
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const value = await input.inputValue();
      
      // Look for a field that looks like a headline (longer text)
      if (value.length > 20 && value.length < 200) {
        headlineInput = input;
        originalHeadline = value;
        console.log(`   Found potential headline at index ${i}: "${originalHeadline}"`);
        break;
      }
    }
    
    if (!headlineInput) {
      // Fallback: use first input
      headlineInput = inputs.first();
      originalHeadline = await headlineInput.inputValue();
      console.log(`   Using first input as headline: "${originalHeadline}"`);
    }
    
    // Step 4: Change the headline to something unique
    console.log('\n📝 Step 4: Change headline to unique test value');
    const uniqueTestValue = `UNIQUE_TEST_${Date.now()}`;
    await headlineInput.fill(uniqueTestValue);
    console.log(`   New value: "${uniqueTestValue}"`);
    
    await page.screenshot({ 
      path: 'test-results/admin-before-save-frontend-test.png', 
      fullPage: true 
    });
    
    // Step 5: Save
    console.log('\n📝 Step 5: Save changes');
    await page.locator('button:has-text("Speichern")').click();
    await page.waitForTimeout(2000);
    
    console.log('   ✅ Save clicked, waiting for redirect...');
    
    // Wait for redirect to sections overview
    await page.waitForURL('**/admin/content/sections', { timeout: 5000 }).catch(() => {
      console.log('   ⚠️ No redirect detected');
    });
    
    // Step 6: Go to frontend homepage
    console.log('\n📝 Step 6: Navigate to frontend homepage');
    await page.goto('http://localhost:3002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/frontend-after-admin-change.png', 
      fullPage: true 
    });
    
    // Step 7: Check if the unique test value appears on the page
    console.log('\n📝 Step 7: Check if test value appears on frontend');
    const pageContent = await page.content();
    const bodyText = await page.locator('body').textContent();
    
    if (bodyText?.includes(uniqueTestValue)) {
      console.log('   ✅ SUCCESS: Test value found on frontend!');
      console.log('   The admin changes ARE being reflected on the frontend.');
    } else {
      console.log('   ❌ FAILED: Test value NOT found on frontend!');
      console.log('   The admin changes are NOT being reflected on the frontend.');
      console.log('   This could mean:');
      console.log('   1. Frontend is reading from a different database');
      console.log('   2. Frontend has caching issues');
      console.log('   3. Frontend is not reading from site_content table');
    }
    
    // Step 8: Check what the hero section actually shows
    console.log('\n📝 Step 8: Analyze hero section on frontend');
    const heroSection = page.locator('section, div').filter({ hasText: /auswander|emigrate|umzug/i }).first();
    const heroText = await heroSection.textContent().catch(() => 'Not found');
    console.log(`   Hero section text: "${heroText?.substring(0, 200)}..."`);
    
    // Step 9: Restore original value
    console.log('\n📝 Step 9: Restore original headline value');
    await page.goto('http://localhost:3002/admin/content/sections/hero');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const restoreInput = page.locator('input, textarea').filter({ hasValue: uniqueTestValue }).first();
    await restoreInput.fill(originalHeadline);
    await page.locator('button:has-text("Speichern")').click();
    await page.waitForTimeout(2000);
    
    console.log('   ✅ Original value restored');
    
    console.log('\n🎯 Test completed!');
  });
  
  test('check which database is being used', async ({ page }) => {
    console.log('🔍 Checking database configuration...\n');
    
    // Login
    await page.goto('http://localhost:3002/admin-login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'martin@infravivo.se');
    await page.fill('input[type="password"]', 'Emigrate2026!');
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.click('button:has-text("Einloggen")')
    ]);
    
    // Intercept API calls to see which Supabase project is being used
    let supabaseUrl = '';
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('supabase.co')) {
        supabaseUrl = url;
        console.log('📡 Supabase API call detected:');
        console.log('   URL:', url);
        
        // Extract project ref from URL
        const match = url.match(/https:\/\/([a-z]+)\.supabase\.co/);
        if (match) {
          const projectRef = match[1];
          console.log('   Project Ref:', projectRef);
          
          if (projectRef === 'hkktofxvgrxfkaixcowm') {
            console.log('   ✅ Using DEV database (correct for local development)');
          } else if (projectRef === 'kfcofscgtvootvsnneux') {
            console.log('   ⚠️ Using PROD database (unexpected for local dev)');
          } else {
            console.log('   ⚠️ Unknown project ref');
          }
        }
      }
    });
    
    // Navigate to trigger API calls
    await page.goto('http://localhost:3002/admin/content/sections');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n🎯 Database check completed!');
  });
});

