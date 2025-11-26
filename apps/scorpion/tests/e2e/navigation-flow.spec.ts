import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive E2E Navigation Flow Tests
 * Tests all pages and critical user journeys with DevOps monitoring
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';

// All routes from navigation menu
const routes = [
  { path: '/', name: 'Home' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/project', name: 'Project' },
  { path: '/ops', name: 'Operations' },
  { path: '/workflows', name: 'Workflows' },
  { path: '/build', name: 'Build' },
  { path: '/knowledge', name: 'Knowledge' },
  { path: '/knowledge/recommendations', name: 'Recommendations' },
  { path: '/ontology', name: 'Ontology' },
  { path: '/research', name: 'Research' },
  { path: '/research/screenshots', name: 'Screenshots' },
  { path: '/council', name: 'Council' },
  { path: '/agents', name: 'Agents' },
  { path: '/agents/specialized', name: 'Specialized Agents' },
  { path: '/chat', name: 'Chat' },
  { path: '/llm/experiments', name: 'LLM Experiments' },
  { path: '/llm/models', name: 'LLM Models' },
  { path: '/llm/prompts', name: 'LLM Prompts' },
  { path: '/llm/compare', name: 'Model Compare' },
  { path: '/observability', name: 'Observability' },
  { path: '/selling', name: 'Selling' },
  { path: '/notifications', name: 'Notifications' },
  { path: '/logs', name: 'System Logs' },
  { path: '/settings', name: 'Settings' },
];

// Critical navigation flows (user journeys)
const criticalFlows = [
  {
    name: 'Home to Dashboard',
    steps: [
      { action: 'navigate', path: '/' },
      { action: 'click', selector: 'a[href="/dashboard"]' },
      { action: 'waitForURL', path: '/dashboard' },
    ],
  },
  {
    name: 'Dashboard to Project',
    steps: [
      { action: 'navigate', path: '/dashboard' },
      { action: 'click', selector: 'a[href="/project"]' },
      { action: 'waitForURL', path: '/project' },
    ],
  },
  {
    name: 'Project to Workflows',
    steps: [
      { action: 'navigate', path: '/project' },
      { action: 'click', selector: 'a[href="/workflows"]' },
      { action: 'waitForURL', path: '/workflows' },
    ],
  },
  {
    name: 'Workflows to Operations',
    steps: [
      { action: 'navigate', path: '/workflows' },
      { action: 'click', selector: 'a[href="/ops"]' },
      { action: 'waitForURL', path: '/ops' },
    ],
  },
  {
    name: 'Knowledge to Ontology',
    steps: [
      { action: 'navigate', path: '/knowledge' },
      { action: 'click', selector: 'a[href="/ontology"]' },
      { action: 'waitForURL', path: '/ontology' },
    ],
  },
  {
    name: 'Agents to Council',
    steps: [
      { action: 'navigate', path: '/agents' },
      { action: 'click', selector: 'a[href="/council"]' },
      { action: 'waitForURL', path: '/council' },
    ],
  },
];

interface NavigationMetrics {
  route: string;
  loadTime: number;
  status: number;
  errors: number;
  warnings: number;
  timestamp: string;
}

test.describe('Navigation Flow E2E Tests', () => {
  let metrics: NavigationMetrics[] = [];

  test.beforeEach(async ({ page }) => {
    // Set up console error tracking
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });

    // Track network failures
    page.on('response', (response) => {
      if (response.status() >= 400) {
        console.warn(`Network failure: ${response.status()} ${response.url()}`);
      }
    });
  });

  test('Health check endpoints', async ({ page }) => {
    // Test lightweight health check
    const healthzResponse = await page.goto(`${BASE_URL}/healthz`);
    expect(healthzResponse?.status()).toBe(200);
    const healthzData = await healthzResponse?.json();
    expect(healthzData.ok).toBe(true);
    expect(healthzData.service).toBe('scorpion');

    // Test comprehensive health check
    const healthResponse = await page.goto(`${BASE_URL}/api/health`);
    expect(healthResponse?.status()).toBe(200);
    const healthData = await healthResponse?.json();
    expect(healthData).toHaveProperty('status');
    expect(healthData).toHaveProperty('systems');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(healthData.status);
  });

  test('All routes are accessible', async ({ page }) => {
    for (const route of routes) {
      const startTime = Date.now();
      const response = await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      const loadTime = Date.now() - startTime;

      expect(response?.status()).toBe(200);
      expect(await page.title()).toContain('Scorpion');

      // Track metrics
      const consoleErrors = await page.evaluate(() => {
        return (window as any).__consoleErrors || 0;
      });

      metrics.push({
        route: route.path,
        loadTime,
        status: response?.status() || 0,
        errors: consoleErrors,
        warnings: 0,
        timestamp: new Date().toISOString(),
      });

      // Verify page loaded without critical errors
      const pageErrors = await page.evaluate(() => {
        return (window as any).__pageErrors || [];
      });
      expect(pageErrors.length).toBe(0);
    }
  });

  test('Critical navigation flows', async ({ page }) => {
    for (const flow of criticalFlows) {
      console.log(`Testing flow: ${flow.name}`);
      
      for (const step of flow.steps) {
        if (step.action === 'navigate') {
          await page.goto(`${BASE_URL}${step.path}`, {
            waitUntil: 'networkidle',
          });
        } else if (step.action === 'click') {
          await page.click(step.selector);
        } else if (step.action === 'waitForURL') {
          await page.waitForURL(`**${step.path}`, { timeout: 10000 });
        }
      }

      // Verify final page loaded
      expect(await page.title()).toContain('Scorpion');
    }
  });

  test('Sidebar navigation works', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Test sidebar toggle
    const sidebarToggle = page.locator('button[aria-label*="sidebar"], button:has-text("Toggle sidebar")').first();
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click();
      await page.waitForTimeout(500);
    }

    // Test navigation via sidebar links
    for (const route of routes.slice(0, 5)) { // Test first 5 routes
      const link = page.locator(`a[href="${route.path}"]`).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForURL(`**${route.path}`, { timeout: 10000 });
        expect(await page.title()).toContain('Scorpion');
      }
    }
  });

  test('Page load performance', async ({ page }) => {
    const performanceThresholds = {
      fast: 2000, // 2 seconds
      acceptable: 5000, // 5 seconds
    };

    for (const route of routes.slice(0, 10)) { // Test first 10 routes
      const startTime = Date.now();
      await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: 'networkidle',
      });
      const loadTime = Date.now() - startTime;

      // Log slow pages
      if (loadTime > performanceThresholds.acceptable) {
        console.warn(`Slow page: ${route.path} took ${loadTime}ms`);
      }

      // Critical pages should load fast
      if (['/', '/dashboard', '/healthz'].includes(route.path)) {
        expect(loadTime).toBeLessThan(performanceThresholds.fast);
      }
    }
  });

  test('Error handling', async ({ page }) => {
    // Test 404 page
    const response = await page.goto(`${BASE_URL}/nonexistent-page`);
    // Should either return 404 or redirect to home
    expect([200, 404]).toContain(response?.status() || 0);

    // Test API error handling
    const apiResponse = await page.goto(`${BASE_URL}/api/nonexistent`);
    expect([404, 500]).toContain(apiResponse?.status() || 0);
  });

  test.afterAll(async () => {
    // Export metrics for monitoring
    console.log('Navigation Metrics:', JSON.stringify(metrics, null, 2));
  });
});

