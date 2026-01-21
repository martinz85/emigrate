import { test, expect } from '@playwright/test';

test.describe('Hero Section with Goodbye Image', () => {
  
  test('verify hero section displays with image', async ({ page }) => {
    console.log('🚀 Testing Hero Section with Goodbye.jpg image\n');
    
    // Navigate to homepage
    console.log('📝 Step 1: Navigate to homepage');
    await page.goto('http://localhost:3002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if image is loaded
    const heroImage = page.locator('img[alt*="Auswandern"]');
    const imageVisible = await heroImage.isVisible();
    console.log(`   Hero image visible: ${imageVisible}`);
    
    if (imageVisible) {
      const imageSrc = await heroImage.getAttribute('src');
      console.log(`   Image source: ${imageSrc}`);
      console.log('   ✅ SUCCESS: Goodbye.jpg is displayed!');
    } else {
      console.log('   ❌ FAILED: Image not visible');
    }
    
    // Check layout - should be two columns on desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    // Take desktop screenshot
    await page.screenshot({ 
      path: 'test-results/hero-with-image-desktop.png', 
      fullPage: true 
    });
    console.log('   📸 Desktop screenshot saved');
    
    // Check mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'test-results/hero-with-image-mobile.png', 
      fullPage: true 
    });
    console.log('   📸 Mobile screenshot saved');
    
    // Verify image is present
    expect(imageVisible).toBeTruthy();
    
    console.log('\n🎯 Test completed!');
  });
});

