/**
 * Simplified Bot Testing Login Utilities for Web Tests
 * 
 * Basic login functionality for testing self-healing in the web project
 */

import { Page, expect } from '@playwright/test'

interface BotUser {
  email: string
  password: string
  role: 'admin' | 'user' | 'qa'
}

// Test user accounts for bot testing
export const BOT_USERS: Record<string, BotUser> = {
  adminBot: {
    email: 'sneve1@bot.dev',
    password: '121618louis',
    role: 'admin'
  },
  userBot: {
    email: 'testuser1@bot.dev', 
    password: 'testpassword123',
    role: 'user'
  },
  qaBot: {
    email: 'quality@bot.dev',
    password: 'quality123',
    role: 'qa'
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

  try {
    // Execute the test
    await testFunction()
    console.log(`✅ Test passed: ${testName}`)

  } catch (error) {
    const executionTime = Date.now() - startTime
    
    console.log(`❌ Test failed: ${testName}`)
    console.log(`🔍 Error: ${error.message}`)
    console.log(`⏱️ Execution time: ${executionTime}ms`)
    
    // In a full implementation, this would:
    // 1. Log to Supabase
    // 2. Check for healing opportunities  
    // 3. Trigger autonomous healing
    // 4. Retry the test
    
    // For now, just rethrow to see the failure
    throw error
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
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  
  // Fill login form (using generic selectors since we don't have data-testid)
  await page.fill('input[type="email"]', user.email)
  await page.fill('input[type="password"]', user.password)
  
  // Submit login (look for login button)
  await page.click('button[type="submit"], button:has-text("Sign"), button:has-text("Login")')
  
  // Wait for successful login (redirect to dashboard)
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  
  console.log(`✅ Successfully logged in as ${botName}`)
}

/**
 * Setup bot test session (simplified version)
 */
export async function setupBotTestSession(
  sessionName: string,
  triggerType: 'manual' | 'cron' | 'ci'
): Promise<string> {
  const sessionId = `${sessionName}-${Date.now()}`
  console.log(`📝 Created test session: ${sessionId}`)
  return sessionId
} 