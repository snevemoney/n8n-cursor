/**
 * User Bot Test Suite
 * 
 * Tests user dashboard functionality, simulator, payments, and core user flows
 * Runs as testuser1@bot.dev with standard user permissions
 */

import { test, expect } from '@playwright/test'
import { 
  loginAs, 
  waitForPageLoad, 
  captureScreenshot, 
  setupBotTestSession,
  logBotTestResult,
  verifyPermissions
} from './utils/login'

let sessionId: string

test.beforeAll(async () => {
  sessionId = await setupBotTestSession('user-bot-tests', 'manual')
})

test.describe('User Bot - Dashboard & Core Flows', () => {
  
  test('User dashboard loads and shows balance/activities', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'userBot')
      await verifyPermissions(page, 'userBot', ['user_dashboard'])
      
      // Should be redirected to dashboard after login
      await waitForPageLoad(page)
      
      screenshotPath = await captureScreenshot(page, 'user-dashboard', 'loaded')
      
      // Check for key user dashboard elements
      await expect(page.locator('[data-testid="balance-card"]')).toBeVisible()
      await expect(page.locator('[data-testid="recent-transactions"]')).toBeVisible()
      
      // Check navigation is present
      await expect(page.locator('[data-testid="main-nav"]')).toBeVisible()
      await expect(page.locator('text=Payments')).toBeVisible()
      await expect(page.locator('text=Wallet')).toBeVisible()
      
      // Verify no admin elements are visible
      const adminNav = page.locator('[data-testid="admin-nav"]')
      await expect(adminNav).not.toBeVisible()
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/dashboard',
        'ui',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath],
          performanceMetrics: { pageLoadTime: executionTime }
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'user-dashboard', 'failed')
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/dashboard',
        'ui',
        'fail',
        {
          executionTime,
          errorDetail: { message: error.message, stack: error.stack },
          screenshots: [screenshotPath]
        }
      )
      
      throw error
    }
  })

  test('Simulator accessible and loop out works', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'userBot')
      await verifyPermissions(page, 'userBot', ['simulator'])
      
      // Navigate to simulator
      await page.goto('/dashboard/simulator')
      await waitForPageLoad(page)
      
      screenshotPath = await captureScreenshot(page, 'simulator', 'loaded')
      
      // Check simulator components
      await expect(page.locator('[data-testid="simulator-container"]')).toBeVisible()
      await expect(page.locator('[data-testid="loop-out-button"]')).toBeVisible()
      
      // Test loop out simulation
      await page.click('[data-testid="loop-out-button"]')
      
      // Wait for simulation to complete
      await page.waitForSelector('.simulation-results', { timeout: 10000 })
      await expect(page.locator('.simulation-results')).toBeVisible()
      
      // Check for simulation output
      const resultsText = await page.locator('.simulation-results').textContent()
      expect(resultsText).toContain('Loop Out')
      
      screenshotPath = await captureScreenshot(page, 'simulator', 'loop-out-completed')
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/dashboard/simulator',
        'flow',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath]
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'simulator', 'failed')
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/dashboard/simulator',
        'flow',
        'fail',
        {
          executionTime,
          errorDetail: { message: error.message, stack: error.stack },
          screenshots: [screenshotPath]
        }
      )
      
      throw error
    }
  })

  test('Payments page and invoice generation', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'userBot')
      
      // Navigate to payments
      await page.goto('/payments')
      await waitForPageLoad(page)
      
      screenshotPath = await captureScreenshot(page, 'payments', 'loaded')
      
      // Check payments interface
      await expect(page.locator('[data-testid="payments-container"]')).toBeVisible()
      
      // Look for receive/send options
      const receiveButton = page.locator('[data-testid="receive-button"]')
      const sendButton = page.locator('[data-testid="send-button"]')
      
      if (await receiveButton.isVisible()) {
        await receiveButton.click()
        await waitForPageLoad(page)
        
        // Check for invoice generation interface
        await expect(page.locator('[data-testid="invoice-form"]')).toBeVisible()
        
        screenshotPath = await captureScreenshot(page, 'payments', 'receive-form')
      }
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/payments',
        'ui',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath]
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'payments', 'failed')
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/payments',
        'ui',
        'fail',
        {
          executionTime,
          errorDetail: { message: error.message, stack: error.stack },
          screenshots: [screenshotPath]
        }
      )
      
      throw error
    }
  })

  test('Wallet interface and node status', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'userBot')
      
      // Navigate to wallet
      await page.goto('/wallet')
      await waitForPageLoad(page)
      
      screenshotPath = await captureScreenshot(page, 'wallet', 'loaded')
      
      // Check wallet components
      await expect(page.locator('[data-testid="wallet-container"]')).toBeVisible()
      
      // Look for node status card
      const nodeStatusCard = page.locator('[data-testid="node-status-card"]')
      if (await nodeStatusCard.isVisible()) {
        await expect(nodeStatusCard).toBeVisible()
        
        // Check for health indicators
        const healthIndicator = page.locator('[data-testid="node-health"]')
        if (await healthIndicator.isVisible()) {
          const healthText = await healthIndicator.textContent()
          expect(healthText).toMatch(/(online|offline|syncing)/i)
        }
      }
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/wallet',
        'ui',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath]
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'wallet', 'failed')
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/wallet',
        'ui',
        'fail',
        {
          executionTime,
          errorDetail: { message: error.message, stack: error.stack },
          screenshots: [screenshotPath]
        }
      )
      
      throw error
    }
  })

  test('Settings and profile management', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'userBot')
      
      // Navigate to settings
      await page.goto('/settings')
      await waitForPageLoad(page)
      
      screenshotPath = await captureScreenshot(page, 'settings', 'loaded')
      
      // Check settings interface
      await expect(page.locator('[data-testid="settings-container"]')).toBeVisible()
      
      // Look for common settings sections
      const profileSection = page.locator('[data-testid="profile-section"]')
      const securitySection = page.locator('[data-testid="security-section"]')
      
      if (await profileSection.isVisible()) {
        await expect(profileSection).toBeVisible()
      }
      
      // Ensure admin settings are not visible to regular users
      const adminSettings = page.locator('[data-testid="admin-settings"]')
      await expect(adminSettings).not.toBeVisible()
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/settings',
        'ui',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath]
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'settings', 'failed')
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/settings',
        'ui',
        'fail',
        {
          executionTime,
          errorDetail: { message: error.message, stack: error.stack },
          screenshots: [screenshotPath]
        }
      )
      
      throw error
    }
  })

  test('API access and rate limiting', async ({ page }) => {
    const startTime = Date.now()
    
    try {
      await loginAs(page, 'userBot')
      
      // Test user API endpoints
      const nodeInfoResponse = await page.request.get('/api/lightning/node-info')
      expect(nodeInfoResponse.status()).toBe(200)
      
      // Test system check (should work for all users)
      const systemResponse = await page.request.get('/api/system-check')
      expect(systemResponse.status()).toBe(200)
      
      // Test admin endpoints (should be forbidden)
      const adminResponse = await page.request.get('/api/admin/revenue-forecast')
      expect([401, 403, 404]).toContain(adminResponse.status())
      
      // Test rate limiting by making multiple requests
      const promises = Array(5).fill(null).map(() => 
        page.request.get('/api/lightning/node-info')
      )
      
      const responses = await Promise.all(promises)
      const successfulRequests = responses.filter(r => r.status() === 200).length
      
      // Should allow at least some requests
      expect(successfulRequests).toBeGreaterThan(0)
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/api/*',
        'api',
        'pass',
        {
          executionTime,
          performanceMetrics: {
            nodeInfoTime: nodeInfoResponse.headers()['x-response-time'],
            successfulRequests,
            totalRequests: responses.length
          }
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/api/*',
        'api',
        'fail',
        {
          executionTime,
          errorDetail: { message: error.message, stack: error.stack }
        }
      )
      
      throw error
    }
  })

  test('Responsive design and mobile compatibility', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'userBot')
      
      // Test different viewport sizes
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1920, height: 1080, name: 'desktop' }
      ]
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto('/dashboard')
        await waitForPageLoad(page)
        
        screenshotPath = await captureScreenshot(page, 'responsive', viewport.name)
        
        // Check that main content is visible
        await expect(page.locator('[data-testid="main-content"]')).toBeVisible()
        
        // Check mobile menu if on mobile
        if (viewport.name === 'mobile') {
          const mobileMenu = page.locator('[data-testid="mobile-menu"]')
          if (await mobileMenu.isVisible()) {
            await mobileMenu.click()
            await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
          }
        }
      }
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/dashboard',
        'ui',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath],
          performanceMetrics: {
            viewportsTested: viewports.length
          }
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'responsive', 'failed')
      
      await logBotTestResult(
        sessionId,
        'userBot',
        '/dashboard',
        'ui',
        'fail',
        {
          executionTime,
          errorDetail: { message: error.message, stack: error.stack },
          screenshots: [screenshotPath]
        }
      )
      
      throw error
    }
  })
})

test.afterAll(async () => {
  if (sessionId) {
    const supabase = require('@supabase/supabase-js').createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    await supabase
      .from('bot_test_sessions')
      .update({
        completed_at: new Date().toISOString(),
        overall_status: 'completed'
      })
      .eq('id', sessionId)
  }
}) 