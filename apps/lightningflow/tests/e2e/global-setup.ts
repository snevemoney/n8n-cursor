import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for Lightning AI Platform E2E tests
 * Prepares the test environment and ensures services are ready
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up Lightning AI Platform test environment...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the development server to be ready
    console.log('⏳ Waiting for development server...');
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:3000');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check if the app is in mock mode (expected for tests)
    const mockBanner = page.locator('text=Mock Mode');
    if (await mockBanner.isVisible()) {
      console.log('✅ Mock mode detected - perfect for testing');
    }
    
    // Verify critical pages are accessible
    const criticalPages = ['/dashboard', '/receive', '/send'];
    for (const pagePath of criticalPages) {
      await page.goto(`${config.projects[0].use.baseURL}${pagePath}`);
      await page.waitForLoadState('networkidle');
      console.log(`✅ ${pagePath} is accessible`);
    }
    
    console.log('🎉 Test environment setup complete!');
    
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup; 