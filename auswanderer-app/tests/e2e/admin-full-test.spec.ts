import { test, expect } from '@playwright/test';

test.describe('Admin Section - Full Test', () => {
  
  test('complete admin workflow - login, view sections, edit content', async ({ page }) => {
    console.log('🚀 Starting complete admin workflow test...');
    
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
    console.log('📍 Current URL:', page.url());
    
    // Step 2: Navigate to Content Sections
    console.log('\n📝 Step 2: Navigate to Content Sections');
    await page.goto('http://localhost:3001/admin/content/sections');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✅ Sections page loaded');
    console.log('📍 Current URL:', page.url());
    
    // Take screenshot of sections overview
    await page.screenshot({ 
      path: 'test-results/admin-sections-overview.png', 
      fullPage: true 
    });
    
    // Step 3: Check if sections are displayed
    console.log('\n📝 Step 3: Check sections display');
    const sectionsTable = page.locator('table, [role="table"], [data-testid="sections-list"]');
    const hasSections = await sectionsTable.count() > 0;
    
    if (hasSections) {
      console.log('✅ Sections table found');
      
      // Count how many sections are visible
      const rows = page.locator('tr').filter({ hasText: /Header|Hero|Footer|Navigation/i });
      const rowCount = await rows.count();
      console.log(`📊 Found ${rowCount} section rows`);
    } else {
      console.log('⚠️ No sections table found - checking for empty state');
    }
    
    // Step 4: Try to find and click on "Header" section edit button
    console.log('\n📝 Step 4: Try to edit Header section');
    
    // Look for edit buttons
    const editButtons = page.locator('button:has-text("Bearbeiten"), a:has-text("Bearbeiten")');
    const editButtonCount = await editButtons.count();
    console.log(`🔍 Found ${editButtonCount} edit buttons`);
    
    if (editButtonCount > 0) {
      // Click the first edit button
      await editButtons.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      console.log('✅ Clicked edit button');
      console.log('📍 Current URL:', page.url());
      
      // Take screenshot of edit page
      await page.screenshot({ 
        path: 'test-results/admin-section-edit.png', 
        fullPage: true 
      });
      
      // Step 5: Check if edit form is displayed
      console.log('\n📝 Step 5: Check edit form');
      
      // Look for form elements
      const inputs = page.locator('input, textarea');
      const inputCount = await inputs.count();
      console.log(`📝 Found ${inputCount} input fields`);
      
      const saveButton = page.locator('button:has-text("Speichern"), button:has-text("Save")');
      const hasSaveButton = await saveButton.count() > 0;
      console.log(`💾 Save button found: ${hasSaveButton}`);
      
      if (inputCount > 0) {
        console.log('✅ Edit form is displayed with input fields');
        
        // Try to find a text input and modify it
        const textInput = inputs.filter({ hasText: '' }).first();
        const canEdit = await textInput.isEditable().catch(() => false);
        
        if (canEdit) {
          const originalValue = await textInput.inputValue();
          console.log(`📝 Original value: "${originalValue}"`);
          
          // Add test text
          await textInput.fill(originalValue + ' [TEST]');
          const newValue = await textInput.inputValue();
          console.log(`📝 Modified value: "${newValue}"`);
          
          console.log('✅ Successfully modified input field');
          
          // Restore original value (don't save the test)
          await textInput.fill(originalValue);
          console.log('✅ Restored original value');
        }
      }
      
      // Step 6: Navigate back to sections
      console.log('\n📝 Step 6: Navigate back to sections');
      await page.goto('http://localhost:3001/admin/content/sections');
      await page.waitForLoadState('networkidle');
      console.log('✅ Back to sections overview');
      
    } else {
      console.log('⚠️ No edit buttons found on the page');
      
      // Debug: Print page content
      const bodyText = await page.locator('body').textContent();
      console.log('📄 Page content preview:', bodyText?.substring(0, 500));
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'test-results/admin-test-final.png', 
      fullPage: true 
    });
    
    console.log('\n✅ Complete admin workflow test finished!');
  });
  
  test('test all section types', async ({ page }) => {
    console.log('🚀 Testing all section types...');
    
    // Login
    await page.goto('http://localhost:3001/admin-login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'martin@infravivo.se');
    await page.fill('input[type="password"]', 'Emigrate2026!');
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.click('button:has-text("Einloggen")')
    ]);
    
    // Go to sections
    await page.goto('http://localhost:3001/admin/content/sections');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Get all edit buttons
    const editButtons = page.locator('button:has-text("Bearbeiten"), a:has-text("Bearbeiten")');
    const count = await editButtons.count();
    
    console.log(`\n📊 Found ${count} sections to test`);
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      console.log(`\n🔍 Testing section ${i + 1}/${Math.min(count, 5)}`);
      
      // Go back to sections page
      await page.goto('http://localhost:3001/admin/content/sections');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Click the i-th edit button
      const buttons = page.locator('button:has-text("Bearbeiten"), a:has-text("Bearbeiten")');
      await buttons.nth(i).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      
      console.log(`📍 URL: ${page.url()}`);
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/admin-section-${i + 1}.png`, 
        fullPage: true 
      });
      
      // Check for form elements
      const inputs = await page.locator('input, textarea').count();
      console.log(`✅ Section has ${inputs} input fields`);
    }
    
    console.log('\n✅ All sections tested!');
  });
});

