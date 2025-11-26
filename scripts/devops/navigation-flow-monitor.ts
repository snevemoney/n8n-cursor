#!/usr/bin/env ts-node
/**
 * Navigation Flow Monitor
 * Continuously monitors navigation paths and validates critical user journeys
 * 
 * Usage:
 *   ts-node scripts/devops/navigation-flow-monitor.ts
 * 
 * Features:
 *   - Tests critical navigation paths
 *   - Validates route availability
 *   - Checks downstream dependencies
 *   - Exports metrics to Prometheus
 *   - Sends alerts on failures
 */

import { chromium, Browser, Page } from 'playwright';
import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import express from 'express';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';
const METRICS_PORT = parseInt(process.env.METRICS_PORT || '9091', 10);
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '60000', 10); // 1 minute

// Prometheus metrics registry
const registry = new Registry();

// Navigation metrics
const navigationRequestsTotal = new Counter({
  name: 'navigation_requests_total',
  help: 'Total number of navigation requests',
  labelNames: ['route', 'status'],
  registers: [registry],
});

const navigationDurationSeconds = new Histogram({
  name: 'navigation_duration_seconds',
  help: 'Duration of navigation requests in seconds',
  labelNames: ['route'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [registry],
});

const navigationErrorsTotal = new Counter({
  name: 'navigation_errors_total',
  help: 'Total number of navigation errors',
  labelNames: ['route', 'error_type'],
  registers: [registry],
});

const routeAvailability = new Gauge({
  name: 'route_availability',
  help: 'Route availability (1 = available, 0 = unavailable)',
  labelNames: ['route'],
  registers: [registry],
});

const routeLoadTime = new Gauge({
  name: 'route_load_time_seconds',
  help: 'Route load time in seconds',
  labelNames: ['route'],
  registers: [registry],
});

const dependencyHealth = new Gauge({
  name: 'dependency_health',
  help: 'Dependency health status (1 = healthy, 0 = unhealthy)',
  labelNames: ['dependency'],
  registers: [registry],
});

// Critical routes to monitor
const criticalRoutes = [
  '/',
  '/dashboard',
  '/project',
  '/ops',
  '/workflows',
  '/knowledge',
  '/council',
  '/agents',
  '/healthz',
  '/api/health',
];

// Critical navigation flows
const criticalFlows = [
  {
    name: 'home_to_dashboard',
    steps: ['/', '/dashboard'],
  },
  {
    name: 'dashboard_to_project',
    steps: ['/dashboard', '/project'],
  },
  {
    name: 'project_to_workflows',
    steps: ['project', '/workflows'],
  },
  {
    name: 'workflows_to_ops',
    steps: ['/workflows', '/ops'],
  },
];

interface NavigationResult {
  route: string;
  success: boolean;
  status: number;
  loadTime: number;
  errors: string[];
  timestamp: string;
}

interface FlowResult {
  flow: string;
  success: boolean;
  duration: number;
  errors: string[];
  timestamp: string;
}

class NavigationFlowMonitor {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isRunning = false;
  private results: NavigationResult[] = [];
  private flowResults: FlowResult[] = [];

  async initialize() {
    console.log('🚀 Initializing Navigation Flow Monitor...');
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();

    // Set up console error tracking
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });

    // Set up response tracking
    this.page.on('response', (response) => {
      if (response.status() >= 400) {
        console.warn(`Network failure: ${response.status()} ${response.url()}`);
      }
    });

    console.log('✅ Monitor initialized');
  }

  async checkRoute(route: string): Promise<NavigationResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      const response = await this.page!.goto(`${BASE_URL}${route}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      const loadTime = (Date.now() - startTime) / 1000;
      const status = response?.status() || 0;
      const success = status >= 200 && status < 400;

      // Update metrics
      navigationRequestsTotal.inc({ route, status: status.toString() });
      navigationDurationSeconds.observe({ route }, loadTime);
      routeAvailability.set({ route }, success ? 1 : 0);
      routeLoadTime.set({ route }, loadTime);

      if (!success) {
        errors.push(`HTTP ${status}`);
        navigationErrorsTotal.inc({ route, error_type: 'http_error' });
      }

      // Check for console errors
      const consoleErrors = await this.page!.evaluate(() => {
        return (window as any).__consoleErrors || [];
      });

      if (consoleErrors.length > 0) {
        errors.push(...consoleErrors);
        navigationErrorsTotal.inc({ route, error_type: 'console_error' });
      }

      return {
        route,
        success,
        status,
        loadTime,
        errors,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      const loadTime = (Date.now() - startTime) / 1000;
      errors.push(error.message);
      navigationErrorsTotal.inc({ route, error_type: 'timeout' });
      routeAvailability.set({ route }, 0);

      return {
        route,
        success: false,
        status: 0,
        loadTime,
        errors,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async checkFlow(flow: { name: string; steps: string[] }): Promise<FlowResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      for (const step of flow.steps) {
        const response = await this.page!.goto(`${BASE_URL}${step}`, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });

        if (!response || response.status() >= 400) {
          errors.push(`Failed at step ${step}: ${response?.status() || 'no response'}`);
        }
      }

      const duration = (Date.now() - startTime) / 1000;
      const success = errors.length === 0;

      return {
        flow: flow.name,
        success,
        duration,
        errors,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      const duration = (Date.now() - startTime) / 1000;
      errors.push(error.message);

      return {
        flow: flow.name,
        success: false,
        duration,
        errors,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async checkDependencies(): Promise<void> {
    // Check healthz endpoint
    try {
      const response = await fetch(`${BASE_URL}/healthz`);
      dependencyHealth.set({ dependency: 'healthz' }, response.ok ? 1 : 0);
    } catch (error) {
      dependencyHealth.set({ dependency: 'healthz' }, 0);
    }

    // Check comprehensive health endpoint
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      const data = await response.json();
      const isHealthy = data.status === 'healthy' || data.status === 'degraded';
      dependencyHealth.set({ dependency: 'api_health' }, isHealthy ? 1 : 0);
    } catch (error) {
      dependencyHealth.set({ dependency: 'api_health' }, 0);
    }
  }

  async runCheck(): Promise<void> {
    console.log(`\n[${new Date().toISOString()}] Running navigation flow check...`);

    // Check all critical routes
    for (const route of criticalRoutes) {
      const result = await this.checkRoute(route);
      this.results.push(result);

      if (result.success) {
        console.log(`  ✅ ${route} - ${result.loadTime.toFixed(2)}s`);
      } else {
        console.log(`  ❌ ${route} - ${result.errors.join(', ')}`);
      }
    }

    // Check critical flows
    for (const flow of criticalFlows) {
      const result = await this.checkFlow(flow);
      this.flowResults.push(result);

      if (result.success) {
        console.log(`  ✅ Flow ${flow.name} - ${result.duration.toFixed(2)}s`);
      } else {
        console.log(`  ❌ Flow ${flow.name} - ${result.errors.join(', ')}`);
      }
    }

    // Check dependencies
    await this.checkDependencies();

    // Keep only last 100 results
    if (this.results.length > 100) {
      this.results = this.results.slice(-100);
    }
    if (this.flowResults.length > 100) {
      this.flowResults = this.flowResults.slice(-100);
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️  Monitor is already running');
      return;
    }

    await this.initialize();
    this.isRunning = true;

    // Run initial check
    await this.runCheck();

    // Run periodic checks
    const interval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }
      await this.runCheck();
    }, CHECK_INTERVAL);

    console.log(`\n✅ Navigation Flow Monitor started`);
    console.log(`   Checking every ${CHECK_INTERVAL / 1000}s`);
    console.log(`   Metrics available at http://localhost:${METRICS_PORT}/metrics`);
  }

  async stop() {
    this.isRunning = false;
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🛑 Navigation Flow Monitor stopped');
  }

  getResults(): { routes: NavigationResult[]; flows: FlowResult[] } {
    return {
      routes: this.results,
      flows: this.flowResults,
    };
  }
}

// Start metrics server
const app = express();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/results', (req, res) => {
  res.json(monitor.getResults());
});

const server = app.listen(METRICS_PORT, () => {
  console.log(`📊 Metrics server listening on port ${METRICS_PORT}`);
});

// Start monitor
const monitor = new NavigationFlowMonitor();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await monitor.stop();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down...');
  await monitor.stop();
  server.close();
  process.exit(0);
});

// Start monitoring
monitor.start().catch((error) => {
  console.error('❌ Failed to start monitor:', error);
  process.exit(1);
});

