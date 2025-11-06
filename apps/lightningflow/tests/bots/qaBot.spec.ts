/**
 * QA Bot Test Suite
 * 
 * Tests AI assistant functionality, tutorial system, and quality assurance flows
 * Runs as quality@bot.dev with QA-specific permissions
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
  sessionId = await setupBotTestSession('qa-bot-tests', 'manual')
})

test.describe('QA Bot - AI Assistant & Tutorial Tests', () => {
  
  test('AI assistant responds to Lightning questions', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'qaBot')
      await verifyPermissions(page, 'qaBot', ['ai_assistant'])
      
      // Navigate to AI assistant
      await page.goto('/ai-assistant')
      await waitForPageLoad(page)
      
      screenshotPath = await captureScreenshot(page, 'ai-assistant', 'loaded')
      
      // Check AI assistant interface
      await expect(page.locator('[data-testid="ai-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="send-button"]')).toBeVisible()
      
      // Test Lightning Network question
      const question = "What is a loop out in the Lightning Network?"
      await page.fill('[data-testid="ai-input"]', question)
      await page.click('[data-testid="send-button"]')
      
      // Wait for AI response
      await page.waitForSelector('.assistant-response', { timeout: 15000 })
      await expect(page.locator('.assistant-response')).toBeVisible()
      
      // Verify response contains relevant information
      const responseText = await page.locator('.assistant-response').textContent()
      expect(responseText).toMatch(/(loop out|Lightning Network|channel|liquidity)/i)
      
      screenshotPath = await captureScreenshot(page, 'ai-assistant', 'response-received')
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/ai-assistant',
        'integration',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath],
          performanceMetrics: {
            questionLength: question.length,
            responseLength: responseText?.length || 0
          }
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'ai-assistant', 'failed')
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/ai-assistant',
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

  test('Tutorial system navigation and content', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'qaBot')
      await verifyPermissions(page, 'qaBot', ['tutorials'])
      
      // Navigate to tutorials
      await page.goto('/learn/lightning')
      await waitForPageLoad(page)
      
      screenshotPath = await captureScreenshot(page, 'tutorials', 'loaded')
      
      // Check tutorial content
      await expect(page.locator('[data-testid="tutorial-content"]')).toBeVisible()
      await expect(page.locator('text=How the Lightning Network Works')).toBeVisible()
      
      // Test tutorial navigation
      const nextButton = page.locator('[data-testid="next-tutorial"]')
      if (await nextButton.isVisible()) {
        await nextButton.click()
        await waitForPageLoad(page)
        
        screenshotPath = await captureScreenshot(page, 'tutorials', 'navigated')
      }
      
      // Check for tutorial progress tracking
      const progressIndicator = page.locator('[data-testid="tutorial-progress"]')
      if (await progressIndicator.isVisible()) {
        const progressText = await progressIndicator.textContent()
        expect(progressText).toMatch(/\d+%|\d+\/\d+/)
      }
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/learn/lightning',
        'ui',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath]
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'tutorials', 'failed')
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/learn/lightning',
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

  test('AI assistant handles complex queries', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'qaBot')
      
      await page.goto('/ai-assistant')
      await waitForPageLoad(page)
      
      // Test complex technical question
      const complexQuestion = "How do I optimize channel liquidity for better routing fees while maintaining low capital requirements?"
      
      await page.fill('[data-testid="ai-input"]', complexQuestion)
      await page.click('[data-testid="send-button"]')
      
      await page.waitForSelector('.assistant-response', { timeout: 20000 })
      
      const responseText = await page.locator('.assistant-response').textContent()
      
      // Verify technical response quality
      expect(responseText).toMatch(/(liquidity|routing|fees|channel|rebalancing)/i)
      expect(responseText?.length || 0).toBeGreaterThan(100) // Substantial response
      
      screenshotPath = await captureScreenshot(page, 'ai-assistant', 'complex-query')
      
      // Test follow-up question
      await page.fill('[data-testid="ai-input"]', "Can you explain that in simpler terms?")
      await page.click('[data-testid="send-button"]')
      
      await page.waitForSelector('.assistant-response:last-child', { timeout: 15000 })
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/ai-assistant',
        'integration',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath],
          performanceMetrics: {
            complexQueryLength: complexQuestion.length,
            responseQuality: 'technical'
          }
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'ai-assistant', 'complex-failed')
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/ai-assistant',
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

  test('Tutorial completion and progress tracking', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'qaBot')
      
      // Start with first tutorial
      await page.goto('/learn/lightning/basics')
      await waitForPageLoad(page)
      
      screenshotPath = await captureScreenshot(page, 'tutorial-completion', 'started')
      
      // Look for completion mechanisms
      const completeButton = page.locator('[data-testid="complete-tutorial"]')
      const readMore = page.locator('[data-testid="read-more"]')
      const quiz = page.locator('[data-testid="tutorial-quiz"]')
      
      // Interact with tutorial content
      if (await readMore.isVisible()) {
        await readMore.click()
        await page.waitForTimeout(2000) // Allow content to expand
      }
      
      if (await quiz.isVisible()) {
        // Attempt to complete quiz if present
        const quizAnswers = page.locator('[data-testid="quiz-answer"]')
        const answerCount = await quizAnswers.count()
        
        if (answerCount > 0) {
          await quizAnswers.first().click()
          
          const submitQuiz = page.locator('[data-testid="submit-quiz"]')
          if (await submitQuiz.isVisible()) {
            await submitQuiz.click()
            await page.waitForTimeout(1000)
          }
        }
      }
      
      if (await completeButton.isVisible()) {
        await completeButton.click()
        await page.waitForTimeout(1000)
        
        // Check for completion confirmation
        const completionMessage = page.locator('[data-testid="completion-message"]')
        if (await completionMessage.isVisible()) {
          expect(await completionMessage.textContent()).toMatch(/(completed|finished|done)/i)
        }
      }
      
      screenshotPath = await captureScreenshot(page, 'tutorial-completion', 'completed')
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/learn/lightning/basics',
        'flow',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath]
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'tutorial-completion', 'failed')
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/learn/lightning/basics',
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

  test('AI assistant API integration', async ({ page }) => {
    const startTime = Date.now()
    
    try {
      await loginAs(page, 'qaBot')
      
      // Test AI assistant API endpoints
      const assistantResponse = await page.request.post('/api/ai/assistant', {
        data: {
          message: "What are the benefits of Lightning Network?",
          conversationId: "test-conversation"
        }
      })
      
      expect(assistantResponse.status()).toBe(200)
      
      const responseData = await assistantResponse.json()
      expect(responseData).toHaveProperty('response')
      expect(responseData.response.length).toBeGreaterThan(50)
      
      // Test follow-up API call
      const followUpResponse = await page.request.post('/api/ai/assistant', {
        data: {
          message: "Can you give me an example?",
          conversationId: "test-conversation"
        }
      })
      
      expect(followUpResponse.status()).toBe(200)
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/api/ai/assistant',
        'api',
        'pass',
        {
          executionTime,
          performanceMetrics: {
            firstResponseTime: assistantResponse.headers()['x-response-time'],
            followUpResponseTime: followUpResponse.headers()['x-response-time']
          }
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/api/ai/assistant',
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

  test('Search and knowledge base functionality', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'qaBot')
      
      // Test search functionality
      await page.goto('/learn')
      await waitForPageLoad(page)
      
      screenshotPath = await captureScreenshot(page, 'search', 'loaded')
      
      // Look for search interface
      const searchInput = page.locator('[data-testid="search-input"]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('channel balance')
        await page.keyboard.press('Enter')
        
        await page.waitForTimeout(2000)
        
        // Check search results
        const searchResults = page.locator('[data-testid="search-results"]')
        if (await searchResults.isVisible()) {
          const resultsCount = await page.locator('[data-testid="search-result"]').count()
          expect(resultsCount).toBeGreaterThan(0)
        }
        
        screenshotPath = await captureScreenshot(page, 'search', 'results')
      }
      
      // Test knowledge base browsing
      const knowledgeBase = page.locator('[data-testid="knowledge-base"]')
      if (await knowledgeBase.isVisible()) {
        const categories = page.locator('[data-testid="kb-category"]')
        const categoryCount = await categories.count()
        
        if (categoryCount > 0) {
          await categories.first().click()
          await waitForPageLoad(page)
          
          screenshotPath = await captureScreenshot(page, 'knowledge-base', 'category')
        }
      }
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/learn',
        'ui',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath]
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'search', 'failed')
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/learn',
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

  test('Feedback and quality assurance workflow', async ({ page }) => {
    const startTime = Date.now()
    let screenshotPath: string
    
    try {
      await loginAs(page, 'qaBot')
      await verifyPermissions(page, 'qaBot', ['feedback'])
      
      // Navigate to feedback interface
      await page.goto('/feedback')
      await waitForPageLoad(page)
      
      screenshotPath = await captureScreenshot(page, 'feedback', 'loaded')
      
      // Look for feedback form
      const feedbackForm = page.locator('[data-testid="feedback-form"]')
      if (await feedbackForm.isVisible()) {
        // Fill out feedback form
        const titleInput = page.locator('[data-testid="feedback-title"]')
        const descriptionInput = page.locator('[data-testid="feedback-description"]')
        const categorySelect = page.locator('[data-testid="feedback-category"]')
        
        if (await titleInput.isVisible()) {
          await titleInput.fill('AI Assistant Response Quality')
        }
        
        if (await descriptionInput.isVisible()) {
          await descriptionInput.fill('The AI assistant provided accurate information about Lightning Network channels but could be more detailed in explaining technical concepts.')
        }
        
        if (await categorySelect.isVisible()) {
          await categorySelect.selectOption('ai-assistant')
        }
        
        const submitButton = page.locator('[data-testid="submit-feedback"]')
        if (await submitButton.isVisible()) {
          await submitButton.click()
          await page.waitForTimeout(2000)
          
          // Check for success message
          const successMessage = page.locator('[data-testid="feedback-success"]')
          if (await successMessage.isVisible()) {
            expect(await successMessage.textContent()).toMatch(/(submitted|received|thank you)/i)
          }
        }
        
        screenshotPath = await captureScreenshot(page, 'feedback', 'submitted')
      }
      
      const executionTime = Date.now() - startTime
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/feedback',
        'flow',
        'pass',
        {
          executionTime,
          screenshots: [screenshotPath]
        }
      )
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      screenshotPath = await captureScreenshot(page, 'feedback', 'failed')
      
      await logBotTestResult(
        sessionId,
        'qaBot',
        '/feedback',
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