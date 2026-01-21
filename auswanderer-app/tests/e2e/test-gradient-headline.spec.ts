import { test, expect } from '@playwright/test';

test.describe('Test Gradient Headline', () => {
  
  test('verify gradient text is displayed correctly', async ({ page }) => {
    console.log('🚀 Testing gradient headline display\n');
    
    // Go to homepage
    console.log('📝 Step 1: Navigate to homepage');
    await page.goto('http://localhost:3002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check h1 content
    const h1 = page.locator('h1').first();
    const headlineText = await h1.textContent();
    console.log(`   Headline text: "${headlineText}"`);
    
    // Check if gradient span exists
    const gradientSpan = h1.locator('span.gradient-text');
    const hasGradient = await gradientSpan.count() > 0;
    console.log(`   Has gradient span: ${hasGradient}`);
    
    if (hasGradient) {
      const gradientText = await gradientSpan.textContent();
      console.log(`   Gradient text: "${gradientText}"`);
      console.log('   ✅ SUCCESS: Gradient text is present!');
    } else {
      console.log('   ❌ FAILED: No gradient text found');
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/homepage-with-gradient.png', 
      fullPage: true 
    });
    
    // Verify structure
    expect(hasGradient).toBeTruthy();
    
    console.log('\n🎯 Test completed!');
  });
});

