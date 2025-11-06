/**
 * Bot Testing Login Utilities
 * 
 * Handles authentication for automated bot tests
 * Supports multiple user roles and test scenarios
 * Enhanced with autonomous healing capabilities
 */

import { Page, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

interface BotUser {
  email: string
  password: string
  role: 'admin' | 'user' | 'qa' | 'affiliate'
  permissions: string[]
}

// Test user accounts for bot testing
export const BOT_USERS: Record<string, BotUser> = {
  adminBot: {
    email: 'sneve1@bot.dev',
    password: '121618louis',
    role: 'admin',
    permissions: ['admin_access', 'full_dashboard', 'system_settings']
  },
  userBot: {
    email: 'testuser1@bot.dev', 
    password: 'testpassword123',
    role: 'user',
    permissions: ['user_dashboard', 'simulator', 'payments']
  },
  qaBot: {
    email: 'quality@bot.dev',
    password: 'quality123',
    role: 'qa',
    permissions: ['tutorials', 'ai_assistant', 'feedback']
  }
}

/**
 * Enhanced test execution wrapper with autonomous healing support
 */
export async function executeTestWithHealing(
  testName: string,
  testFunction: () => Promise<void>,
  context: {
    page: Page
    botName: string
    testRoute: string
    sessionId?: string
  }
): Promise<void> {
  const startTime = Date.now()
  let screenshotPath: string
  let healingAttempted = false

  try {
    // Execute the test
    await testFunction()

    // Log successful test
    await logBotTestResult(
      context.sessionId || 'default',
      context.botName,
      context.testRoute,
      'ui',
      'pass',
      {
        executionTime: Date.now() - startTime,
        testName
      }
    )

  } catch (error) {
    const executionTime = Date.now() - startTime
    screenshotPath = await captureScreenshot(context.page, testName, 'failed')

    // Check if this is a repeated failure that qualifies for healing
    const shouldAttemptHealing = await checkForHealingOpportunity(
      context.botName,
      context.testRoute,
      error
    )

    if (shouldAttemptHealing && !healingAttempted) {
      console.log(`🔧 Attempting autonomous healing for ${context.botName}:${context.testRoute}`)
      
      healingAttempted = true
      const healingResult = await triggerAutonomousHealing(
        context.botName,
        context.testRoute,
        error
      )

      if (healingResult.success) {
        console.log(`✅ Healing successful, retrying test...`)
        
        // Wait for patch to be applied
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        try {
          // Retry the test after healing
          await testFunction()
          
          // Log healed success
          await logBotTestResult(
            context.sessionId || 'default',
            context.botName,
            context.testRoute,
            'ui',
            'pass',
            {
              executionTime: Date.now() - startTime,
              testName,
              healingApplied: true,
              patchId: healingResult.patchId
            }
          )
          
          return // Test passed after healing
          
        } catch (retryError) {
          console.log(`❌ Test still failing after healing attempt`)
          
          // Log healing failure
          await logBotTestResult(
            context.sessionId || 'default',
            context.botName,
            context.testRoute,
            'ui',
            'fail',
            {
              executionTime: Date.now() - startTime,
              errorDetail: { 
                originalError: error.message,
                retryError: retryError.message,
                healingAttempted: true,
                healingResult
              },
              screenshots: [screenshotPath],
              testName
            }
          )
          
          throw retryError
        }
      }
    }

    // Log original failure
    await logBotTestResult(
      context.sessionId || 'default',
      context.botName,
      context.testRoute,
      'ui',
      'fail',
      {
        executionTime,
        errorDetail: { 
          message: error.message, 
          stack: error.stack,
          healingAttempted
        },
        screenshots: [screenshotPath],
        testName
      }
    )

    throw error
  }
}

/**
 * Check if this failure pattern qualifies for autonomous healing
 */
async function checkForHealingOpportunity(
  botName: string,
  testRoute: string,
  error: any
): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Count recent failures for this bot/route
  const { data: recentFailures, error: queryError } = await supabase
    .from('bot_test_logs')
    .select('id, error_detail')
    .eq('bot_name', botName)
    .eq('test_route', testRoute)
    .eq('test_result', 'fail')
    .gte('run_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
    .order('run_at', { ascending: false })

  if (queryError) {
    console.error('Error checking failure history:', queryError)
    return false
  }

  const failureCount = recentFailures?.length || 0

  // Check if we've already tried healing recently
  const { data: healAttempts } = await supabase
    .from('bot_patch_logs')
    .select('id')
    .contains('test_targets', [testRoute])
    .gte('applied_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

  const healAttemptCount = healAttempts?.length || 0

  // Healing criteria
  const hasEnoughFailures = failureCount >= 3
  const notOverHealed = healAttemptCount < 2
  const isHealableError = isErrorHeatable(error)

  return hasEnoughFailures && notOverHealed && isHealableError
}

/**
 * Determine if an error type is suitable for autonomous healing
 */
function isErrorHeatable(error: any): boolean {
  const errorMessage = error.message?.toLowerCase() || ''
  
  // Selector failures - highly healable
  if (errorMessage.includes('locator') || errorMessage.includes('not found')) {
    return true
  }
  
  // Timeout failures - moderately healable
  if (errorMessage.includes('timeout') || errorMessage.includes('waiting')) {
    return true
  }
  
  // Network/API failures - moderately healable  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return true
  }
  
  // Loading failures - moderately healable
  if (errorMessage.includes('loading') || errorMessage.includes('networkidle')) {
    return true
  }

  return false
}

/**
 * Trigger autonomous healing process
 */
async function triggerAutonomousHealing(
  botName: string,
  testRoute: string,
  error: any
): Promise<{ success: boolean; patchId?: string; details?: any }> {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001'
    
    const response = await fetch(`${baseUrl}/api/ai/self-heal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        botName,
        failurePattern: error.message,
        autoApply: true
      })
    })

    if (!response.ok) {
      throw new Error(`Self-heal API failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    return {
      success: result.patchApplied && result.testPassed,
      patchId: result.patch?.id,
      details: result
    }

  } catch (error) {
    console.error('Autonomous healing failed:', error)
    return { success: false, details: { error: error.message } }
  }
}

/**
 * Login as a specific bot user
 */
export async function loginAs(page: Page, botName: keyof typeof BOT_USERS): Promise<void> {
  const user = BOT_USERS[botName]
  if (!user) {
    throw new Error(`Bot user '${botName}' not found`)
  }

  console.log(`🤖 Logging in as ${botName} (${user.email})`)

  // Navigate to login page
  await page.goto('/login')
  
  // Wait for login form to be visible
  await page.waitForSelector('[data-testid="email-input"]', { timeout: 10000 })
  
  // Fill login form
  await page.fill('[data-testid="email-input"]', user.email)
  await page.fill('[data-testid="password-input"]', user.password)
  
  // Submit login
  await page.click('[data-testid="login-button"]')
  
  // Wait for successful login (redirect to dashboard)
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  
  // Verify user is logged in
  const userMenu = page.locator('[data-testid="user-menu"]')
  await expect(userMenu).toBeVisible({ timeout: 5000 })
  
  console.log(`✅ Successfully logged in as ${botName}`)
}

/**
 * Login using direct Supabase API (faster for API tests)
 */
export async function loginViaAPI(botName: keyof typeof BOT_USERS): Promise<string> {
  const user = BOT_USERS[botName]
  if (!user) {
    throw new Error(`Bot user '${botName}' not found`)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password
  })

  if (error) {
    throw new Error(`API login failed for ${botName}: ${error.message}`)
  }

  return data.session?.access_token || ''
}

/**
 * Logout current user
 */
export async function logout(page: Page): Promise<void> {
  console.log('🚪 Logging out...')
  
  // Click user menu
  await page.click('[data-testid="user-menu"]')
  
  // Click logout button
  await page.click('[data-testid="logout-button"]')
  
  // Wait for redirect to login page
  await page.waitForURL('**/login', { timeout: 10000 })
  
  console.log('✅ Successfully logged out')
}

/**
 * Verify user has required permissions for a test
 */
export async function verifyPermissions(
  page: Page, 
  botName: keyof typeof BOT_USERS, 
  requiredPermissions: string[]
): Promise<void> {
  const user = BOT_USERS[botName]
  const missingPermissions = requiredPermissions.filter(
    perm => !user.permissions.includes(perm)
  )
  
  if (missingPermissions.length > 0) {
    throw new Error(
      `Bot user '${botName}' missing required permissions: ${missingPermissions.join(', ')}`
    )
  }
}

/**
 * Enhanced wait for page load with healing-aware error detection
 */
export async function waitForPageLoad(page: Page, options?: { 
  timeout?: number 
  retryOnFailure?: boolean
}): Promise<void> {
  const timeout = options?.timeout || 10000
  const retryOnFailure = options?.retryOnFailure ?? true

  try {
    // Wait for network to be idle
    await page.waitForLoadState('networkidle', { timeout })
    
    // Wait for any loading spinners to disappear
    await page.waitForSelector('[data-testid="loading-spinner"]', { 
      state: 'hidden', 
      timeout: 5000
    }).catch(() => {
      // Loading spinner might not exist, which is fine
    })
    
    // Ensure no error messages are shown
    const errorMessage = page.locator('[data-testid="error-message"]')
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent()
      throw new Error(`Page load error: ${errorText}`)
    }

  } catch (error) {
    if (retryOnFailure && error.message.includes('timeout')) {
      console.log('⚠️ Page load timeout, retrying with extended timeout...')
      
      // Retry with longer timeout
      await waitForPageLoad(page, { 
        timeout: timeout * 2, 
        retryOnFailure: false 
      })
    } else {
      throw error
    }
  }
}

/**
 * Take screenshot for test documentation
 */
export async function captureScreenshot(
  page: Page, 
  testName: string, 
  step: string
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${testName}-${step}-${timestamp}.png`
  const screenshotPath = `test-results/screenshots/${filename}`
  
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: true 
  })
  
  return screenshotPath
}

/**
 * Check for JavaScript console errors
 */
export async function checkConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = []
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  page.on('pageerror', error => {
    errors.push(`Page error: ${error.message}`)
  })
  
  return errors
}

/**
 * Setup bot test session
 */
export async function setupBotTestSession(
  sessionName: string,
  triggerType: 'manual' | 'cron' | 'ci'
): Promise<string> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('bot_test_sessions')
    .insert({
      session_name: sessionName,
      trigger_type: triggerType,
      git_commit_hash: process.env.GITHUB_SHA || 'local',
      git_branch: process.env.GITHUB_REF_NAME || 'main',
      triggered_by: process.env.GITHUB_ACTOR || 'manual',
      overall_status: 'running'
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create test session: ${error.message}`)
  }

  return data.id
}

/**
 * Log bot test result to Supabase
 */
export async function logBotTestResult(
  sessionId: string,
  botName: string,
  testRoute: string,
  testType: 'ui' | 'api' | 'flow' | 'integration' | 'performance',
  result: 'pass' | 'fail' | 'warning' | 'skip',
  details: {
    executionTime?: number
    errorDetail?: any
    screenshots?: string[]
    performanceMetrics?: any
    testName?: string
    healingApplied?: boolean
    patchId?: string
  }
): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('bot_test_logs')
    .insert({
      test_session_id: sessionId,
      bot_name: botName,
      user_role: BOT_USERS[botName as keyof typeof BOT_USERS]?.role,
      test_route: testRoute,
      test_type: testType,
      test_result: result,
      execution_time_ms: details.executionTime || 0,
      error_detail: details.errorDetail || {},
      screenshots: details.screenshots || [],
      performance_metrics: details.performanceMetrics || {},
      test_details: {
        test_name: details.testName,
        healing_applied: details.healingApplied,
        patch_id: details.patchId,
        timestamp: new Date().toISOString()
      },
      test_environment: process.env.NODE_ENV || 'development',
      browser_info: {
        name: 'chromium',
        version: 'latest'
      },
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    })

  if (error) {
    console.error('Failed to log bot test result:', error)
  }
} 