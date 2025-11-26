# Test info

- Name: Self-Healing Demo Test >> Timeout failure simulation
- Location: /Users/evenslouis/dev/lightning-platform/web/tests/bots/broken-button.spec.ts:57:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at /Users/evenslouis/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test'
   2 | // Use local utilities in web/tests/bots/utils
   3 | import { loginAs, executeTestWithHealing, setupBotTestSession } from './utils/login'
   4 |
   5 | test.describe('Self-Healing Demo Test', () => {
   6 |   let sessionId: string
   7 |
   8 |   test.beforeAll(async () => {
   9 |     sessionId = await setupBotTestSession('broken-button-demo', 'manual')
  10 |   })
  11 |
  12 |   test('Broken button should trigger self-heal', async ({ page }) => {
  13 |     await executeTestWithHealing(
  14 |       'broken-button-test',
  15 |       async () => {
  16 |         // First login successfully
  17 |         await loginAs(page, 'userBot')
  18 |         
  19 |         // Navigate to a page
  20 |         await page.goto('http://localhost:3001/dashboard')
  21 |         
  22 |         // Simulate failure: Try clicking a non-existent button
  23 |         const brokenSelector = 'button#login-now-fake-selector'
  24 |         
  25 |         // This will intentionally fail and trigger our self-healing system
  26 |         await expect(page.locator(brokenSelector)).toBeVisible({ timeout: 5000 })
  27 |       },
  28 |       {
  29 |         page,
  30 |         botName: 'userBot',
  31 |         testRoute: '/dashboard',
  32 |         sessionId
  33 |       }
  34 |     )
  35 |   })
  36 |
  37 |   test('Another broken selector to test pattern detection', async ({ page }) => {
  38 |     await executeTestWithHealing(
  39 |       'another-broken-selector',
  40 |       async () => {
  41 |         await loginAs(page, 'userBot')
  42 |         await page.goto('http://localhost:3001/dashboard')
  43 |         
  44 |         // Another intentionally broken selector
  45 |         const anotherBrokenSelector = '[data-testid="non-existent-element"]'
  46 |         await expect(page.locator(anotherBrokenSelector)).toBeVisible({ timeout: 5000 })
  47 |       },
  48 |       {
  49 |         page,
  50 |         botName: 'userBot', 
  51 |         testRoute: '/dashboard',
  52 |         sessionId
  53 |       }
  54 |     )
  55 |   })
  56 |
> 57 |   test('Timeout failure simulation', async ({ page }) => {
     |       ^ Error: browserType.launch: Executable doesn't exist at /Users/evenslouis/Library/Caches/ms-playwright/chromium_headless_shell-1169/chrome-mac/headless_shell
  58 |     await executeTestWithHealing(
  59 |       'timeout-failure-test',
  60 |       async () => {
  61 |         await loginAs(page, 'userBot')
  62 |         
  63 |         // Navigate and wait for something that will timeout
  64 |         await page.goto('http://localhost:3001/dashboard')
  65 |         
  66 |         // Set very short timeout to trigger timeout failure
  67 |         await page.waitForSelector('[data-testid="will-never-appear"]', { timeout: 1000 })
  68 |       },
  69 |       {
  70 |         page,
  71 |         botName: 'userBot',
  72 |         testRoute: '/dashboard',
  73 |         sessionId
  74 |       }
  75 |     )
  76 |   })
  77 | }) 
```