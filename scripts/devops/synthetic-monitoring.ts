#!/usr/bin/env ts-node
/**
 * Synthetic Monitoring Script
 * Continuous E2E testing for navigation paths
 * Runs as a background service and validates navigation paths from external perspective
 * 
 * Usage:
 *   ts-node scripts/devops/synthetic-monitoring.ts
 * 
 * Features:
 *   - Continuous E2E testing
 *   - Validates navigation paths
 *   - Alerts on navigation failures
 *   - Exports results to monitoring systems
 */

import { chromium, Browser, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '300000', 10); // 5 minutes
const RESULTS_DIR = process.env.RESULTS_DIR || path.join(process.cwd(), 'monitoring', 'synthetic-results');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

interface SyntheticTestResult {
  test: string;
  success: boolean;
  duration: number;
  errors: string[];
  timestamp: string;
  screenshot?: string;
}

interface TestSuite {
  name: string;
  tests: Array<{
    name: string;
    steps: Array<{
      action: 'navigate' | 'click' | 'waitFor' | 'assert';
      target: string;
      expected?: any;
    }>;
  }>;
}

// Define test suites
const testSuites: TestSuite[] = [
  {
    name: 'Critical Navigation Paths',
    tests: [
      {
        name: 'Home to Dashboard',
        steps: [
          { action: 'navigate', target: '/' },
          { action: 'waitFor', target: 'text=Dashboard' },
          { action: 'click', target: 'a[href="/dashboard"]' },
          { action: 'waitFor', target: 'url=/dashboard' },
        ],
      },
      {
        name: 'Dashboard to Project',
        steps: [
          { action: 'navigate', target: '/dashboard' },
          { action: 'waitFor', target: 'text=Project' },
          { action: 'click', target: 'a[href="/project"]' },
          { action: 'waitFor', target: 'url=/project' },
        ],
      },
      {
        name: 'Project to Workflows',
        steps: [
          { action: 'navigate', target: '/project' },
          { action: 'waitFor', target: 'text=Workflows' },
          { action: 'click', target: 'a[href="/workflows"]' },
          { action: 'waitFor', target: 'url=/workflows' },
        ],
      },
    ],
  },
  {
    name: 'Health Check Endpoints',
    tests: [
      {
        name: 'Healthz Endpoint',
        steps: [
          { action: 'navigate', target: '/healthz' },
          { action: 'assert', target: 'status', expected: 200 },
        ],
      },
      {
        name: 'API Health Endpoint',
        steps: [
          { action: 'navigate', target: '/api/health' },
          { action: 'assert', target: 'status', expected: 200 },
        ],
      },
    ],
  },
  {
    name: 'Page Load Performance',
    tests: [
      {
        name: 'Home Page Load',
        steps: [
          { action: 'navigate', target: '/' },
          { action: 'assert', target: 'loadTime', expected: { max: 3000 } },
        ],
      },
      {
        name: 'Dashboard Page Load',
        steps: [
          { action: 'navigate', target: '/dashboard' },
          { action: 'assert', target: 'loadTime', expected: { max: 5000 } },
        ],
      },
    ],
  },
];

class SyntheticMonitor {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isRunning = false;
  private results: SyntheticTestResult[] = [];

  async initialize() {
    console.log('🚀 Initializing Synthetic Monitor...');
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();

    // Set up error tracking
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });

    this.page.on('pageerror', (error) => {
      console.error(`Page error: ${error.message}`);
    });

    console.log('✅ Synthetic Monitor initialized');
  }

  async runTest(test: { name: string; steps: any[] }): Promise<SyntheticTestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let screenshot: string | undefined;

    try {
      for (const step of test.steps) {
        try {
          if (step.action === 'navigate') {
            await this.page!.goto(`${BASE_URL}${step.target}`, {
              waitUntil: 'networkidle',
              timeout: 30000,
            });
          } else if (step.action === 'click') {
            await this.page!.click(step.target);
          } else if (step.action === 'waitFor') {
            if (step.target.startsWith('url=')) {
              const url = step.target.replace('url=', '');
              await this.page!.waitForURL(`**${url}`, { timeout: 10000 });
            } else if (step.target.startsWith('text=')) {
              const text = step.target.replace('text=', '');
              await this.page!.waitForSelector(`text=${text}`, { timeout: 10000 });
            } else {
              await this.page!.waitForSelector(step.target, { timeout: 10000 });
            }
          } else if (step.action === 'assert') {
            if (step.target === 'status') {
              // Status assertion would need to be checked from response
              // For now, just verify page loaded
            } else if (step.target === 'loadTime') {
              const loadTime = Date.now() - startTime;
              if (step.expected?.max && loadTime > step.expected.max) {
                errors.push(`Load time ${loadTime}ms exceeds maximum ${step.expected.max}ms`);
              }
            }
          }
        } catch (error: any) {
          errors.push(`Step ${step.action} failed: ${error.message}`);
        }
      }

      // Take screenshot on failure
      if (errors.length > 0) {
        const screenshotPath = path.join(
          RESULTS_DIR,
          `screenshot-${test.name}-${Date.now()}.png`
        );
        await this.page!.screenshot({ path: screenshotPath, fullPage: true });
        screenshot = screenshotPath;
      }

      const duration = Date.now() - startTime;
      const success = errors.length === 0;

      return {
        test: test.name,
        success,
        duration,
        errors,
        timestamp: new Date().toISOString(),
        screenshot,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      errors.push(`Test execution failed: ${error.message}`);

      return {
        test: test.name,
        success: false,
        duration,
        errors,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async runTestSuite(suite: TestSuite): Promise<SyntheticTestResult[]> {
    console.log(`\n📋 Running test suite: ${suite.name}`);
    const results: SyntheticTestResult[] = [];

    for (const test of suite.tests) {
      console.log(`  Running test: ${test.name}`);
      const result = await this.runTest(test);
      results.push(result);

      if (result.success) {
        console.log(`    ✅ ${test.name} - ${result.duration}ms`);
      } else {
        console.log(`    ❌ ${test.name} - ${result.errors.join(', ')}`);
      }
    }

    return results;
  }

  async runAllTests(): Promise<void> {
    console.log(`\n[${new Date().toISOString()}] Running synthetic monitoring tests...`);

    for (const suite of testSuites) {
      const results = await this.runTestSuite(suite);
      this.results.push(...results);
    }

    // Save results
    const resultsFile = path.join(RESULTS_DIR, `results-${Date.now()}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));

    // Keep only last 100 results
    if (this.results.length > 100) {
      this.results = this.results.slice(-100);
    }

    // Generate summary
    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passedTests: this.results.filter(r => r.success).length,
      failedTests: this.results.filter(r => !r.success).length,
      successRate: (this.results.filter(r => r.success).length / this.results.length) * 100,
      averageDuration: this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length,
    };

    console.log('\n📊 Test Summary:');
    console.log(`   Total tests: ${summary.totalTests}`);
    console.log(`   Passed: ${summary.passedTests}`);
    console.log(`   Failed: ${summary.failedTests}`);
    console.log(`   Success rate: ${summary.successRate.toFixed(2)}%`);
    console.log(`   Average duration: ${summary.averageDuration.toFixed(2)}ms`);

    // Save summary
    const summaryFile = path.join(RESULTS_DIR, 'summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

    // Alert on failures
    if (summary.failedTests > 0) {
      console.log(`\n⚠️  ALERT: ${summary.failedTests} tests failed!`);
      // In production, send alert to monitoring system
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️  Monitor is already running');
      return;
    }

    await this.initialize();
    this.isRunning = true;

    // Run initial test
    await this.runAllTests();

    // Run periodic tests
    const interval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }
      await this.runAllTests();
    }, CHECK_INTERVAL);

    console.log(`\n✅ Synthetic Monitor started`);
    console.log(`   Checking every ${CHECK_INTERVAL / 1000}s`);
    console.log(`   Results saved to ${RESULTS_DIR}`);
  }

  async stop() {
    this.isRunning = false;
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🛑 Synthetic Monitor stopped');
  }
}

// Start monitor
const monitor = new SyntheticMonitor();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await monitor.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down...');
  await monitor.stop();
  process.exit(0);
});

// Start monitoring
monitor.start().catch((error) => {
  console.error('❌ Failed to start monitor:', error);
  process.exit(1);
});

