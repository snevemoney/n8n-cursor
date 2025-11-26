import { test as base } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { setupMockLightningNode } from '../mocks/lightning';
import { Database } from '../types/database.types';

// Extended test with Lightning platform context
export const test = base.extend({
  // Set up authenticated context
  authenticatedPage: async ({ page }, use) => {
    // Login before tests
    await page.goto('/login');
    await page.fill('[name=email]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('[name=password]', process.env.TEST_USER_PASSWORD || 'testpassword');
    await page.click('button[type=submit]');
    await page.waitForURL('/dashboard');
    
    // Use the authenticated page
    await use(page);
    
    // Clean up - clear cookies and localStorage after test
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  },
  
  // Provide access to Supabase client
  supabase: async ({}, use) => {
    // Create Supabase client with test credentials
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
      process.env.SUPABASE_SERVICE_KEY || 'test-service-key',
      {
        auth: {
          persistSession: false,
        }
      }
    );
    
    // Use the client in tests
    await use(supabase);
    
    // Clean up test data after tests
    try {
      // Clean up test data using a stored procedure
      await supabase.rpc('clean_test_data');
    } catch (error) {
      console.warn('Failed to clean test data:', error);
    }
  },
  
  // Mock Lightning node
  lightningNode: async ({}, use) => {
    // Set up mock Lightning node
    const mockNode = setupMockLightningNode();
    
    // Use the mock node in tests
    await use(mockNode);
    
    // Clean up resources
    await mockNode.cleanup();
  },
  
  // Mock BullMQ for job testing
  bullMQ: async ({}, use) => {
    // Set up mock BullMQ
    const mockQueue = {
      getJobs: async () => [],
      add: async (name: string, data: any) => ({ id: 'mock-job-id', name, data }),
      getJob: async (id: string) => ({ id, progress: 100, returnvalue: {} }),
      clean: async () => {}
    };
    
    // Use the mock queue in tests
    await use(mockQueue);
  }
});

export { expect } from '@playwright/test'; 