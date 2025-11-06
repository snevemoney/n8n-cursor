import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.spec\.ts/,
      testIgnore: /tests\/bots\/.*\.spec\.ts/
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /.*\.spec\.ts/,
      testIgnore: /tests\/bots\/.*\.spec\.ts/
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /.*\.spec\.ts/,
      testIgnore: /tests\/bots\/.*\.spec\.ts/
    },

    /* Bot testing projects */
    {
      name: 'bots',
      testMatch: /tests\/bots\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Slower timeout for bot tests (API calls, AI responses)
        actionTimeout: 30000,
        navigationTimeout: 60000,
        // Enable video recording for bot tests
        video: 'on',
        // Capture screenshots on every step for documentation
        screenshot: 'on',
        // Enable tracing for debugging
        trace: 'on'
      },
      timeout: 120000, // 2 minutes per test
      retries: 1, // Retry failed bot tests once
    },

    {
      name: 'admin-bot',
      testMatch: /tests\/bots\/adminBot\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        actionTimeout: 30000,
        navigationTimeout: 60000,
        video: 'on',
        screenshot: 'on',
        trace: 'on'
      },
      timeout: 120000,
      retries: 1,
    },

    {
      name: 'user-bot',
      testMatch: /tests\/bots\/userBot\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        actionTimeout: 30000,
        navigationTimeout: 60000,
        video: 'on',
        screenshot: 'on',
        trace: 'on'
      },
      timeout: 120000,
      retries: 1,
    },

    {
      name: 'qa-bot',
      testMatch: /tests\/bots\/qaBot\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        actionTimeout: 45000, // Longer for AI responses
        navigationTimeout: 60000,
        video: 'on',
        screenshot: 'on',
        trace: 'on'
      },
      timeout: 180000, // 3 minutes for AI tests
      retries: 1,
    },

    /* Mobile testing for responsive bot tests */
    {
      name: 'mobile-bots',
      testMatch: /tests\/bots\/.*\.spec\.ts/,
      use: {
        ...devices['iPhone 13'],
        actionTimeout: 30000,
        navigationTimeout: 60000,
        video: 'on',
        screenshot: 'on'
      },
      timeout: 120000,
      retries: 1,
    },

    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /.*\.spec\.ts/,
      testIgnore: /tests\/bots\/.*\.spec\.ts/
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testMatch: /.*\.spec\.ts/,
      testIgnore: /tests\/bots\/.*\.spec\.ts/
    },

    /* Test against branded browsers */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
      testMatch: /.*\.spec\.ts/,
      testIgnore: /tests\/bots\/.*\.spec\.ts/
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      testMatch: /.*\.spec\.ts/,
      testIgnore: /tests\/bots\/.*\.spec\.ts/
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
}); 