import { test, expect } from '@playwright/test';

test.describe('Admin Section - Complete Workflow Test', () => {
  
  test('complete admin test - login, view sections, edit content', async ({ page }) => {
    console.log('🚀 Starting complete admin workflow test on port 3002...\n');
    
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
    console.log('📍 URL:', page.url());
    
    // Step 2: Navigate to Content Sections
    console.log('\n📝 Step 2: Navigate to Content Sections');
    await page.goto('http://localhost:3002/admin/content/sections');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✅ Sections page loaded');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/admin-sections-final.png', 
      fullPage: true 
    });
    
    // Step 3: Count sections
    console.log('\n📝 Step 3: Count available sections');
    const editButtons = page.locator('button:has-text("Bearbeiten")');
    const buttonCount = await editButtons.count();
    console.log(`📊 Found ${buttonCount} sections with edit buttons`);
    
    // Step 4: Test Header section
    console.log('\n📝 Step 4: Test Header section');
    await page.goto('http://localhost:3002/admin/content/sections/header');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check for build error
    const hasBuildError = await page.locator('text=Build Error').count() > 0;
    
    if (hasBuildError) {
      console.log('❌ Build Error detected!');
      await page.screenshot({ path: 'test-results/header-build-error.png', fullPage: true });
      throw new Error('Build error on header section page');
    }
    
    console.log('✅ Header section page loaded without errors');
    
    // Check for form elements
    const inputs = await page.locator('input, textarea').count();
    const saveButton = await page.locator('button:has-text("Speichern")').count();
    const backButton = await page.locator('button:has-text("Zurück")').count();
    
    console.log(`   📝 Input fields: ${inputs}`);
    console.log(`   💾 Save button: ${saveButton > 0 ? 'Yes' : 'No'}`);
    console.log(`   ⬅️  Back button: ${backButton > 0 ? 'Yes' : 'No'}`);
    
    expect(inputs).toBeGreaterThan(0);
    expect(saveButton).toBeGreaterThan(0);
    expect(backButton).toBeGreaterThan(0);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/header-edit-final.png', 
      fullPage: true 
    });
    
    // Step 5: Try to edit a field
    console.log('\n📝 Step 5: Test editing a field');
    const firstInput = page.locator('input, textarea').first();
    const isEditable = await firstInput.isEditable();
    
    if (isEditable) {
      const originalValue = await firstInput.inputValue();
      console.log(`   Original value: "${originalValue.substring(0, 50)}..."`);
      
      // Type test text
      await firstInput.fill(originalValue + ' [TEST]');
      const modifiedValue = await firstInput.inputValue();
      console.log(`   Modified value: "${modifiedValue.substring(0, 50)}..."`);
      
      expect(modifiedValue).toContain('[TEST]');
      console.log('✅ Field can be edited successfully');
      
      // Restore original
      await firstInput.fill(originalValue);
      console.log('✅ Original value restored');
    } else {
      console.log('⚠️ First input is not editable');
    }
    
    // Step 6: Test other sections
    console.log('\n📝 Step 6: Test other sections');
    const sectionsToTest = [
      { id: 'footer', name: 'Footer' },
      { id: 'hero', name: 'Hero Section' },
      { id: 'how_it_works', name: 'So funktioniert\'s' },
      { id: 'faq', name: 'FAQ' }
    ];
    
    for (const section of sectionsToTest) {
      console.log(`\n   Testing: ${section.name}`);
      await page.goto(`http://localhost:3002/admin/content/sections/${section.id}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const hasBuildError = await page.locator('text=Build Error').count() > 0;
      
      if (hasBuildError) {
        console.log(`   ❌ ${section.name}: Build Error`);
        await page.screenshot({ 
          path: `test-results/${section.id}-error.png`, 
          fullPage: true 
        });
      } else {
        const inputs = await page.locator('input, textarea').count();
        const saveBtn = await page.locator('button:has-text("Speichern")').count();
        console.log(`   ✅ ${section.name}: ${inputs} fields, Save button: ${saveBtn > 0 ? 'Yes' : 'No'}`);
        
        await page.screenshot({ 
          path: `test-results/${section.id}-edit.png`, 
          fullPage: true 
        });
      }
    }
    
    // Step 7: Navigate back to sections overview
    console.log('\n📝 Step 7: Navigate back to sections overview');
    await page.goto('http://localhost:3002/admin/content/sections');
    await page.waitForLoadState('networkidle');
    console.log('✅ Back to sections overview');
    
    console.log('\n🎉 Complete admin workflow test finished successfully!');
  });
});

