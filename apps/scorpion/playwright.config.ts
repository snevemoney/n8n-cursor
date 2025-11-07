import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Scorpion UI audits
 */
export default defineConfig({
  testDir: './audit',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'audit/out/playwright-report' }]
  ],
  
  use: {
    baseURL: process.env.AUDIT_BASE_URL || 'http://localhost:3003',
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Don't start the dev server (assume it's already running)
  // webServer: {
  //   command: 'pnpm dev',
  //   url: 'http://localhost:3003',
  //   reuseExistingServer: true,
  // },
});

