import { test, expect } from '@playwright/test'
// Use local utilities in web/tests/bots/utils
import { loginAs, executeTestWithHealing, setupBotTestSession } from './utils/login'

test.describe('Self-Healing Demo Test', () => {
  let sessionId: string

  test.beforeAll(async () => {
    sessionId = await setupBotTestSession('broken-button-demo', 'manual')
  })

  test('Broken button should trigger self-heal', async ({ page }) => {
    await executeTestWithHealing(
      'broken-button-test',
      async () => {
        // First login successfully
        await loginAs(page, 'userBot')
        
        // Navigate to a page
        await page.goto('http://localhost:3001/dashboard')
        
        // Simulate failure: Try clicking a non-existent button
        const brokenSelector = 'button#login-now-fake-selector'
        
        // This will intentionally fail and trigger our self-healing system
        await expect(page.locator(brokenSelector)).toBeVisible({ timeout: 5000 })
      },
      {
        page,
        botName: 'userBot',
        testRoute: '/dashboard',
        sessionId
      }
    )
  })

  test('Another broken selector to test pattern detection', async ({ page }) => {
    await executeTestWithHealing(
      'another-broken-selector',
      async () => {
        await loginAs(page, 'userBot')
        await page.goto('http://localhost:3001/dashboard')
        
        // Another intentionally broken selector
        const anotherBrokenSelector = '[data-testid="non-existent-element"]'
        await expect(page.locator(anotherBrokenSelector)).toBeVisible({ timeout: 5000 })
      },
      {
        page,
        botName: 'userBot', 
        testRoute: '/dashboard',
        sessionId
      }
    )
  })

  test('Timeout failure simulation', async ({ page }) => {
    await executeTestWithHealing(
      'timeout-failure-test',
      async () => {
        await loginAs(page, 'userBot')
        
        // Navigate and wait for something that will timeout
        await page.goto('http://localhost:3001/dashboard')
        
        // Set very short timeout to trigger timeout failure
        await page.waitForSelector('[data-testid="will-never-appear"]', { timeout: 1000 })
      },
      {
        page,
        botName: 'userBot',
        testRoute: '/dashboard',
        sessionId
      }
    )
  })
}) 