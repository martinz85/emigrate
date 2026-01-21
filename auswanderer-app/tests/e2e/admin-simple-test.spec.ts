import { test, expect } from '@playwright/test';

test.describe('Admin Section - Simple Manual Test', () => {
  
  test('login and navigate to sections', async ({ page }) => {
    console.log('🚀 Starting simple admin test...');
    
    // Step 1: Login
    console.log('\n📝 Step 1: Login');
    await page.goto('http://localhost:3001/admin-login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'martin@infravivo.se');
    await page.fill('input[type="password"]', 'Emigrate2026!');
    
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.click('button:has-text("Einloggen")')
    ]);
    
    console.log('✅ Login successful');
    
    // Step 2: Navigate to Content Sections
    console.log('\n📝 Step 2: Navigate to Content Sections');
    await page.goto('http://localhost:3001/admin/content/sections');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/sections-overview.png', 
      fullPage: true 
    });
    
    console.log('✅ Sections page loaded');
    
    // Step 3: List all sections
    console.log('\n📝 Step 3: List all sections');
    const sectionCards = page.locator('[class*="card"], [class*="Card"]').filter({ 
      has: page.locator('button:has-text("Bearbeiten")') 
    });
    const cardCount = await sectionCards.count();
    console.log(`📊 Found ${cardCount} section cards`);
    
    // Get all section titles
    const titles = await page.locator('h2, h3').allTextContents();
    console.log('📋 Section titles:', titles.filter(t => t.trim().length > 0));
    
    // Step 4: Try to navigate to Header section directly
    console.log('\n📝 Step 4: Navigate to Header section directly');
    await page.goto('http://localhost:3001/admin/content/sections/header');
    await page.waitForTimeout(3000); // Wait longer for build
    
    // Check if there's a build error
    const buildError = page.locator('text=Build Error');
    const hasBuildError = await buildError.count() > 0;
    
    if (hasBuildError) {
      console.log('❌ Build Error detected!');
      const errorText = await page.locator('pre, code').first().textContent();
      console.log('Error details:', errorText?.substring(0, 500));
    } else {
      console.log('✅ No build error - page loaded');
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/header-edit-page.png', 
      fullPage: true 
    });
    
    console.log('📍 Current URL:', page.url());
    
    // Step 5: Try other sections
    const sectionsToTest = ['footer', 'hero', 'how_it_works', 'faq'];
    
    for (const sectionId of sectionsToTest) {
      console.log(`\n📝 Testing section: ${sectionId}`);
      await page.goto(`http://localhost:3001/admin/content/sections/${sectionId}`);
      await page.waitForTimeout(2000);
      
      const hasBuildError = await page.locator('text=Build Error').count() > 0;
      
      if (hasBuildError) {
        console.log(`❌ ${sectionId}: Build Error`);
      } else {
        console.log(`✅ ${sectionId}: Loaded successfully`);
        
        // Check for input fields
        const inputs = await page.locator('input, textarea').count();
        console.log(`   📝 Input fields: ${inputs}`);
        
        // Check for save button
        const saveBtn = await page.locator('button:has-text("Speichern")').count();
        console.log(`   💾 Save button: ${saveBtn > 0 ? 'Yes' : 'No'}`);
      }
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/${sectionId}-edit-page.png`, 
        fullPage: true 
      });
    }
    
    console.log('\n✅ Test completed!');
  });
});

