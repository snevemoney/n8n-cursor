#!/usr/bin/env ts-node
/**
 * Navigation Flow Metrics Exporter
 * Exposes Prometheus metrics for navigation flow monitoring
 * 
 * Usage:
 *   ts-node scripts/devops/navigation-metrics-exporter.ts
 * 
 * Metrics exposed:
 *   - navigation_requests_total: Counter of navigation requests
 *   - navigation_duration_seconds: Histogram of navigation durations
 *   - navigation_errors_total: Counter of navigation errors
 *   - route_availability: Gauge of route availability (1 = available, 0 = unavailable)
 */

import express from 'express';
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

const app = express();
const port = process.env.METRICS_PORT || 9091;
const registry = new Registry();

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register: registry });

// Navigation metrics
const navigationRequestsTotal = new Counter({
  name: 'navigation_requests_total',
  help: 'Total number of navigation requests',
  labelNames: ['route', 'status', 'method'],
  registers: [registry]
});

const navigationDurationSeconds = new Histogram({
  name: 'navigation_duration_seconds',
  help: 'Duration of navigation requests in seconds',
  labelNames: ['route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [registry]
});

const navigationErrorsTotal = new Counter({
  name: 'navigation_errors_total',
  help: 'Total number of navigation errors',
  labelNames: ['route', 'error_type'],
  registers: [registry]
});

const routeAvailability = new Gauge({
  name: 'route_availability',
  help: 'Route availability (1 = available, 0 = unavailable)',
  labelNames: ['route'],
  registers: [registry]
});

// Track route health
const routes = [
  '/',
  '/dashboard',
  '/payments',
  '/payments/send',
  '/payments/receive',
  '/payments/history',
  '/earnings',
  '/settings',
  '/login',
  '/signup'
];

/**
 * Check route availability
 */
async function checkRouteAvailability(route: string): Promise<boolean> {
  const baseUrl = process.env.BASE_URL || 'https://evenslouis.ca/lightningflow';
  const url = `${baseUrl}${route}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'NavigationMetricsExporter/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    return response.ok || response.status === 200 || response.status === 301 || response.status === 302;
  } catch (error) {
    return false;
  }
}

/**
 * Update route availability metrics
 */
async function updateRouteAvailability() {
  for (const route of routes) {
    const available = await checkRouteAvailability(route);
    routeAvailability.set({ route }, available ? 1 : 0);
  }
}

/**
 * Middleware to track navigation requests
 */
function navigationMetricsMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const startTime = Date.now();
  const route = req.path || req.url;
  
  // Track request
  navigationRequestsTotal.inc({
    route,
    method: req.method,
    status: 'pending'
  });
  
  // Track response
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const status = res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'error';
    
    navigationDurationSeconds.observe({ route, status }, duration);
    navigationRequestsTotal.inc({
      route,
      method: req.method,
      status: status
    });
    
    if (status === 'error') {
      navigationErrorsTotal.inc({
        route,
        error_type: `http_${res.statusCode}`
      });
    }
  });
  
  next();
}

// Apply middleware
app.use(navigationMetricsMiddleware);

/**
 * Metrics endpoint (Prometheus format)
 */
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', registry.contentType);
    const metrics = await registry.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end(error);
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'navigation-metrics-exporter' });
});

/**
 * Route availability endpoint
 */
app.get('/routes/availability', async (req, res) => {
  const availability: Record<string, boolean> = {};
  
  for (const route of routes) {
    availability[route] = await checkRouteAvailability(route);
  }
  
  res.json({
    timestamp: new Date().toISOString(),
    routes: availability,
    summary: {
      total: routes.length,
      available: Object.values(availability).filter(Boolean).length,
      unavailable: Object.values(availability).filter(v => !v).length
    }
  });
});

/**
 * Start server
 */
async function start() {
  // Update route availability every 30 seconds
  setInterval(updateRouteAvailability, 30000);
  
  // Initial update
  await updateRouteAvailability();
  
  app.listen(port, () => {
    console.log(`🚀 Navigation Metrics Exporter running on port ${port}`);
    console.log(`📊 Metrics available at http://localhost:${port}/metrics`);
    console.log(`🏥 Health check at http://localhost:${port}/health`);
    console.log(`🔍 Route availability at http://localhost:${port}/routes/availability`);
  });
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Start the server
start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

