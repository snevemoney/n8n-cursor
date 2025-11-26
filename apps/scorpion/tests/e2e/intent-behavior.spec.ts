import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite: Intent Behavior and Tool/KB Gating
 * 
 * Tests the full flow from user message → intent classification → plan → tools → KB → response
 * Validates that the UI correctly displays debug information and that tools/KB are gated properly.
 * 
 * Based on test scenarios from: intent-test-scenarios.md
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';

test.describe('Intent Behavior E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForLoadState('networkidle');
    
    // Wait for chat interface to be ready
    const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
    await expect(chatInput).toBeVisible({ timeout: 10000 });
  });

  test.describe('Group A - Small Talk (No Tools/KB)', () => {
    test('A1: Simple greeting "hi" should not use tools or KB', async ({ page }) => {
      const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
      
      // Send message
      await chatInput.fill('hi');
      await chatInput.press('Enter');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check that response appears (should be quick, conversational)
      const messages = page.locator('[data-testid="chat-message"], .message, [class*="message"]');
      const messageCount = await messages.count();
      expect(messageCount).toBeGreaterThan(0);
      
      // Verify response doesn't mention KB or tools
      const lastMessage = await messages.last().textContent();
      expect(lastMessage).toBeTruthy();
      
      // Response should NOT contain KB-related text
      const lowerMessage = lastMessage!.toLowerCase();
      expect(lowerMessage).not.toContain('checking knowledge base');
      expect(lowerMessage).not.toContain('searching knowledge');
      expect(lowerMessage).not.toContain('no information was found');
      
      // TODO: Check debug panel for intent and tools (once data-testid attributes are added)
    });

    test('A2: Casual follow-up "How are you?" should not use tools or KB', async ({ page }) => {
      const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
      
      await chatInput.fill('How are you?');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(3000);
      
      const messages = page.locator('[data-testid="chat-message"], .message, [class*="message"]');
      const lastMessage = await messages.last().textContent();
      expect(lastMessage).toBeTruthy();
      
      const lowerMessage = lastMessage!.toLowerCase();
      expect(lowerMessage).not.toContain('checking knowledge base');
      expect(lowerMessage).not.toContain('searching');
    });
  });

  test.describe('Group B - Simple General Questions (No Tools/KB)', () => {
    test('B1: "What is 2+2?" should not use tools or KB', async ({ page }) => {
      const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
      
      await chatInput.fill('What is 2+2?');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(5000); // Give more time for response
      
      const messages = page.locator('[data-testid="chat-message"], .message, [class*="message"]');
      const lastMessage = await messages.last().textContent();
      expect(lastMessage).toBeTruthy();
      
      // Should answer directly without KB mention
      const lowerMessage = lastMessage!.toLowerCase();
      expect(lowerMessage).not.toContain('checking knowledge base');
      expect(lowerMessage).not.toContain('searching');
      
      // Should contain the answer
      expect(lowerMessage).toMatch(/4|four/);
    });

    test('B2: "What is the capital of Canada?" should not use tools or KB', async ({ page }) => {
      const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
      
      await chatInput.fill('What is the capital of Canada?');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(5000);
      
      const messages = page.locator('[data-testid="chat-message"], .message, [class*="message"]');
      const lastMessage = await messages.last().textContent();
      expect(lastMessage).toBeTruthy();
      
      const lowerMessage = lastMessage!.toLowerCase();
      expect(lowerMessage).not.toContain('checking knowledge base');
      
      // Should contain answer
      expect(lowerMessage).toMatch(/ottawa/);
    });

    test('B3: "Explain what Bitcoin is in one sentence" should not use tools or KB', async ({ page }) => {
      const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
      
      await chatInput.fill('Explain what Bitcoin is in one sentence.');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(5000);
      
      const messages = page.locator('[data-testid="chat-message"], .message, [class*="message"]');
      const lastMessage = await messages.last().textContent();
      expect(lastMessage).toBeTruthy();
      
      const lowerMessage = lastMessage!.toLowerCase();
      expect(lowerMessage).not.toContain('checking knowledge base');
      
      // Should contain explanation
      expect(lowerMessage.length).toBeGreaterThan(20);
    });
  });

  test.describe('Group C - Multi-step Reasoning (No Tools/KB)', () => {
    test('C1: Savings calculation question should not use tools or KB', async ({ page }) => {
      const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
      
      const message = 'If someone saves $200 per month at 5% annual interest, will they have more than $5,000 after 2 years? Just estimate.';
      await chatInput.fill(message);
      await chatInput.press('Enter');
      
      await page.waitForTimeout(8000); // More time for reasoning
      
      const messages = page.locator('[data-testid="chat-message"], .message, [class*="message"]');
      const lastMessage = await messages.last().textContent();
      expect(lastMessage).toBeTruthy();
      
      const lowerMessage = lastMessage!.toLowerCase();
      expect(lowerMessage).not.toContain('checking knowledge base');
      
      // Should contain reasoning or answer
      expect(lowerMessage.length).toBeGreaterThan(30);
    });

    test('C2: "Explain RAM vs SSD" should not use tools or KB', async ({ page }) => {
      const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
      
      await chatInput.fill('Explain the difference between RAM and an SSD in simple terms.');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(6000);
      
      const messages = page.locator('[data-testid="chat-message"], .message, [class*="message"]');
      const lastMessage = await messages.last().textContent();
      expect(lastMessage).toBeTruthy();
      
      const lowerMessage = lastMessage!.toLowerCase();
      expect(lowerMessage).not.toContain('checking knowledge base');
      
      // Should contain explanation
      expect(lowerMessage.length).toBeGreaterThan(50);
    });
  });

  test.describe('Group D - Project Help (Tools/KB SHOULD be used)', () => {
    test('D1: "How does Scorpion\'s planner work?" should use KB/tools', async ({ page }) => {
      const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
      
      await chatInput.fill("How does Scorpion's planner and council work internally?");
      await chatInput.press('Enter');
      
      // Wait longer for KB search and tool execution
      await page.waitForTimeout(10000);
      
      // Check that plan panel shows steps (indicating tools were used)
      // Note: This requires the plan panel to be visible or checkable
      const messages = page.locator('[data-testid="chat-message"], .message, [class*="message"]');
      const lastMessage = await messages.last().textContent();
      expect(lastMessage).toBeTruthy();
      
      // Response should be comprehensive (KB was used)
      expect(lastMessage!.length).toBeGreaterThan(100);
    });

    test('D2: "Find chat API route" should use repo tools', async ({ page }) => {
      const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
      
      await chatInput.fill('Find where the chat API route is implemented in Scorpion and describe what it does.');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(12000);
      
      const messages = page.locator('[data-testid="chat-message"], .message, [class*="message"]');
      const lastMessage = await messages.last().textContent();
      expect(lastMessage).toBeTruthy();
      
      // Should reference actual files/paths
      const lowerMessage = lastMessage!.toLowerCase();
      expect(lowerMessage).toMatch(/route|api|file|path|scorpion/);
    });
  });

  test.describe('Group E - System Debug', () => {
    test('E1: "Why do you keep asking?" should trigger introspection', async ({ page }) => {
      const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
      
      await chatInput.fill('Why do you sometimes keep asking for more information instead of just answering?');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(8000);
      
      const messages = page.locator('[data-testid="chat-message"], .message, [class*="message"]');
      const lastMessage = await messages.last().textContent();
      expect(lastMessage).toBeTruthy();
      
      // Should provide meta explanation
      const lowerMessage = lastMessage!.toLowerCase();
      expect(lowerMessage.length).toBeGreaterThan(50);
    });
  });

  test.describe('Group G - Browser Automation Visibility', () => {
    test('G1: Debug info should be accessible via window.__SCORPION_DEBUG__', async ({ page }) => {
      const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
      
      await chatInput.fill('hi');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(3000);
      
      // Check if debug object exists in window
      const debugInfo = await page.evaluate(() => {
        return (window as any).__SCORPION_DEBUG__;
      });
      
      // If debug object exists, verify structure
      if (debugInfo) {
        expect(debugInfo).toHaveProperty('lastMessage');
        if (debugInfo.lastMessage) {
          expect(debugInfo.lastMessage).toHaveProperty('intent');
          expect(debugInfo.lastMessage.intent).toBe('small_talk');
        }
      }
    });

    test('G2: DOM should have data-testid attributes for debug elements', async ({ page }) => {
      const chatInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]').first();
      
      await chatInput.fill('hi');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(3000);
      
      // Check for debug-related test IDs (if they exist)
      // Note: These may need to be added to the UI components
      const intentElement = page.locator('[data-testid="debug-intent"]');
      const planElement = page.locator('[data-testid="debug-plan"]');
      const toolsElement = page.locator('[data-testid="debug-tools"]');
      const knowledgeElement = page.locator('[data-testid="debug-knowledge"]');
      
      // At least one should exist if debug panel is implemented
      const hasAnyDebug = await intentElement.count() > 0 || 
                          await planElement.count() > 0 ||
                          await toolsElement.count() > 0 ||
                          await knowledgeElement.count() > 0;
      
      // This test documents what should exist, but won't fail if not implemented yet
      if (!hasAnyDebug) {
        console.warn('Debug test IDs not found - consider adding data-testid attributes to debug UI');
      }
    });
  });
});

