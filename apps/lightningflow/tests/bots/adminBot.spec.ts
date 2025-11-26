/**
 * Admin Bot Test Suite
 * 
 * Tests admin dashboard functionality, system monitoring, and admin-specific features
 * Runs as sneve1@bot.dev with full admin permissions
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
  // Setup test session for tracking
  sessionId = await setupBotTestSession('admin-bot-tests', 'manual')
})

test.describe('Admin Bot - Dashboard & System Tests', () => {
  
  test('Admin dashboard loads and shows key metrics', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'adminBot')
      await verifyPermissions(page, 'adminBot', ['admin_access', 'full_dashboard'])
      
      // Navigate to admin dashboard
      await page.goto('/admin')
      await waitForPageLoad(page)
      
      // Take screenshot for documentation
      screenshotPath = await captureScreenshot(page, 'admin-dashboard', 'loaded')
      
      // Check for key admin metrics
      await expect(page.locator('[data-testid="revenue-card"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-count-card"]')).toBeVisible()
      await expect(page.locator('[data-testid="conversion-rate-card"]')).toBeVisible()
      
      // Verify MRR is displayed
      const mrrElement = page.locator('[data-testid="current-mrr"]')
      await expect(mrrElement).toBeVisible()
      const mrrText = await mrrElement.textContent()
      expect(mrrText).toMatch(/\$[\d,]+/)
      
      // Check admin navigation is present
      await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible()
      await expect(page.locator('text=Revenue Forecast')).toBeVisible()
      await expect(page.locator('text=Email Campaigns')).toBeVisible()
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'adminBot',
        '/admin',
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
      screenshotPath = await captureScreenshot(page, 'admin-dashboard', 'failed')
      
      await logBotTestResult(
        sessionId,
        'adminBot',
        '/admin',
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

  test('Revenue forecast page loads with projections', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'adminBot')
      
      // Navigate to revenue forecast
      await page.goto('/admin/revenue-forecast')
      await waitForPageLoad(page)
      
      screenshotPath = await captureScreenshot(page, 'revenue-forecast', 'loaded')
      
      // Check forecast components
      await expect(page.locator('[data-testid="current-mrr"]')).toBeVisible()
      await expect(page.locator('[data-testid="projected-mrr"]')).toBeVisible()
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()
      
      // Check tabs are present
      await expect(page.locator('[data-testid="overview-tab"]')).toBeVisible()
      await expect(page.locator('[data-testid="subscription-tiers-tab"]')).toBeVisible()
      await expect(page.locator('[data-testid="usage-trends-tab"]')).toBeVisible()
      
      // Test tab navigation
      await page.click('[data-testid="subscription-tiers-tab"]')
      await expect(page.locator('[data-testid="tier-breakdown"]')).toBeVisible()
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'adminBot',
        '/admin/revenue-forecast',
        'ui',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath]
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'revenue-forecast', 'failed')
      
      await logBotTestResult(
        sessionId,
        'adminBot',
        '/admin/revenue-forecast',
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

  test('Email campaigns analytics accessible', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'adminBot')
      
      // Navigate to email campaigns
      await page.goto('/admin/email-campaigns')
      await waitForPageLoad(page)
      
      screenshotPath = await captureScreenshot(page, 'email-campaigns', 'loaded')
      
      // Check campaign metrics
      await expect(page.locator('[data-testid="email-metrics"]')).toBeVisible()
      await expect(page.locator('[data-testid="conversion-chart"]')).toBeVisible()
      
      // Look for campaign stats
      const openRateElement = page.locator('[data-testid="open-rate"]')
      if (await openRateElement.isVisible()) {
        const openRateText = await openRateElement.textContent()
        expect(openRateText).toMatch(/\d+\.\d+%/)
      }
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'adminBot',
        '/admin/email-campaigns',
        'ui',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath]
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'email-campaigns', 'failed')
      
      await logBotTestResult(
        sessionId,
        'adminBot',
        '/admin/email-campaigns',
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

  test('API endpoints respond correctly', async ({ page }) => {
    const startTime = Date.now()
    
    try {
      await loginAs(page, 'adminBot')
      
      // Test system check endpoint
      const systemResponse = await page.request.get('/api/system-check')
      expect(systemResponse.status()).toBe(200)
      
      const systemData = await systemResponse.json()
      expect(systemData).toHaveProperty('systemStatus')
      
      // Test admin-specific endpoints
      const adminResponse = await page.request.get('/api/admin/campaign-stats')
      // Should either succeed or fail gracefully
      expect([200, 401, 404]).toContain(adminResponse.status())
      
      // Test Lightning node info
      const nodeResponse = await page.request.get('/api/lightning/node-info')
      expect(nodeResponse.status()).toBe(200)
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'adminBot',
        '/api/*',
        'api',
        'pass',
        {
          executionTime,
          performanceMetrics: {
            systemCheckTime: systemResponse.headers()['x-response-time'],
            nodeInfoTime: nodeResponse.headers()['x-response-time']
          }
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'adminBot',
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

  test('Template system accessible and functional', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'adminBot')
      
      // Test templates API
      const templatesResponse = await page.request.get('/api/contracts/templates')
      expect(templatesResponse.status()).toBe(200)
      
      const templatesData = await templatesResponse.json()
      expect(templatesData).toHaveProperty('templates')
      expect(Array.isArray(templatesData.templates)).toBe(true)
      
      // Navigate to any templates UI (if exists)
      await page.goto('/admin')
      await waitForPageLoad(page)
      
      screenshotPath = await captureScreenshot(page, 'templates-test', 'admin-view')
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'adminBot',
        '/api/contracts/templates',
        'integration',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath],
          performanceMetrics: {
            apiResponseTime: templatesResponse.headers()['x-response-time'],
            templatesCount: templatesData.templates?.length || 0
          }
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'templates-test', 'failed')
      
      await logBotTestResult(
        sessionId,
        'adminBot',
        '/api/contracts/templates',
        'integration',
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

  test('Performance benchmarks meet thresholds', async ({ page }) => {
    const startTime = Date.now()
    
    try {
      await loginAs(page, 'adminBot')
      
      // Measure admin dashboard load time
      const navigationStart = Date.now()
      await page.goto('/admin')
      await waitForPageLoad(page)
      const pageLoadTime = Date.now() - navigationStart
      
      // Performance thresholds
      const maxPageLoadTime = 5000 // 5 seconds
      const maxApiResponseTime = 2000 // 2 seconds
      
      expect(pageLoadTime).toBeLessThan(maxPageLoadTime)
      
      // Test API response times
      const apiStart = Date.now()
      const response = await page.request.get('/api/system-check')
      const apiResponseTime = Date.now() - apiStart
      
      expect(response.status()).toBe(200)
      expect(apiResponseTime).toBeLessThan(maxApiResponseTime)
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'adminBot',
        '/admin',
        'performance',
        'pass',
        {
          executionTime,
          performanceMetrics: {
            pageLoadTime,
            apiResponseTime,
            thresholds: {
              maxPageLoadTime,
              maxApiResponseTime
            }
          }
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'adminBot',
        '/admin',
        'performance',
        'fail',
        {
          executionTime,
          errorDetail: { message: error.message, stack: error.stack }
        }
      )
      
      throw error
    }
  })
})

test.afterAll(async () => {
  // Mark session as completed
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