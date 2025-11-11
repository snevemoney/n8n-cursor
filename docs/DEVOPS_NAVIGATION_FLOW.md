# DevOps Guide: Ensuring Navigation Flow Quality

## Overview

This guide outlines the comprehensive DevOps approach to ensuring navigation flow quality across the entire LightningFlow AI platform. Navigation flow encompasses:

- **Route availability** - All routes respond correctly
- **Service connectivity** - Services can communicate
- **User journey integrity** - Critical flows work end-to-end
- **Performance** - Navigation happens within acceptable timeframes
- **Error handling** - Graceful degradation when services fail

## 1. Multi-Layer Health Checks

### Service-Level Health Checks

Every service exposes a `/healthz` endpoint that validates:
- Service is running
- Critical dependencies are available
- Service can handle requests

**Current Implementation:**
- ✅ `lightningflow.online/healthz` - UI health
- ✅ `lightningflow.online/api/healthz` - API health  
- ✅ `n8ncloud.tech/healthz` - n8n health
- ✅ `scorpion:3003/api/health` - Scorpion health

### Route-Level Health Checks

Validate that critical navigation routes exist and respond:

```bash
# Test critical routes
./scripts/devops/navigation-flow-monitor.sh int
```

**Critical Routes to Monitor:**
- `/` → `/dashboard` (home navigation)
- `/dashboard` → `/payments` (payment navigation)
- `/payments` → `/payments/send` (send flow)
- `/payments` → `/payments/receive` (receive flow)
- `/dashboard` → `/earnings` (earnings navigation)
- `/dashboard` → `/settings` (settings navigation)

### Dependency Health Checks

Check downstream services that navigation depends on:

```typescript
// Example: API health check includes dependency status
{
  "ok": true,
  "dependencies": {
    "database": { "status": "healthy", "latency": "5ms" },
    "redis": { "status": "healthy", "latency": "2ms" },
    "n8n": { "status": "healthy", "latency": "10ms" }
  }
}
```

## 2. Distributed Tracing

### Implementation Strategy

Use OpenTelemetry or similar to trace requests across services:

```typescript
// Example: Trace navigation flow
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('navigation-flow');

async function navigateToPayments(userId: string) {
  return tracer.startActiveSpan('navigate.payments', async (span) => {
    span.setAttribute('user.id', userId);
    span.setAttribute('route.from', '/dashboard');
    span.setAttribute('route.to', '/payments');
    
    try {
      // Navigation logic
      const result = await performNavigation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### Key Metrics to Track

- **Navigation latency** - Time from click to page load
- **Route transition success rate** - % of successful navigations
- **Error rate by route** - Which routes fail most often
- **Dependency latency** - Time spent waiting on downstream services

## 3. Synthetic Monitoring

### Continuous E2E Testing

Run Playwright tests continuously to validate navigation flows:

```bash
# Run navigation flow tests
npm run test:e2e:navigation

# Run in CI/CD pipeline
./scripts/devops/ci-navigation-tests.sh
```

### Critical Flows to Test

1. **Authentication Flow**
   - `/` → `/login` → `/dashboard`
   - Session persistence across navigations

2. **Payment Flow**
   - `/dashboard` → `/payments` → `/payments/send`
   - `/payments` → `/payments/receive` → invoice generation
   - `/payments` → `/payments/history` → transaction details

3. **Settings Flow**
   - `/dashboard` → `/settings` → various settings pages
   - Settings persistence

4. **Error Recovery**
   - 404 handling
   - Service unavailable handling
   - Network error recovery

### Monitoring Schedule

- **High-frequency checks** (every 1-5 minutes): Critical paths
- **Medium-frequency checks** (every 15-30 minutes): Secondary paths
- **Low-frequency checks** (hourly): Edge cases and error paths

## 4. Load Balancer Configuration

### Caddy Health Checks

Your Caddy configuration already includes health checks:

```caddyfile
reverse_proxy 127.0.0.1:3000 {
  health_uri /healthz
  health_interval 30s
  health_timeout 5s
}
```

### Best Practices

1. **Health check frequency**: 30s is good for most services
2. **Health check timeout**: 5s prevents slow services from blocking
3. **Failure threshold**: Configure how many failures trigger removal
4. **Recovery threshold**: Configure how many successes trigger re-addition

### Circuit Breaker Pattern

Implement circuit breakers to prevent cascading failures:

```typescript
class NavigationCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > 60000) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= 5) {
      this.state = 'open';
    }
  }
}
```

## 5. Logging and Correlation

### Structured Logging

Use structured logs with correlation IDs:

```typescript
import { logger } from '@/lib/logger';

async function handleNavigation(req: Request) {
  const correlationId = req.headers.get('x-correlation-id') || generateId();
  
  logger.info('Navigation started', {
    correlationId,
    route: req.url,
    userAgent: req.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });
  
  try {
    const result = await performNavigation();
    logger.info('Navigation completed', {
      correlationId,
      route: req.url,
      duration: result.duration,
      status: 'success'
    });
    return result;
  } catch (error) {
    logger.error('Navigation failed', {
      correlationId,
      route: req.url,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

### Log Aggregation

Use Loki (already configured) to aggregate logs:

```yaml
# monitoring/loki/loki-config.yml
scrape_configs:
  - job_name: navigation-logs
    static_configs:
      - targets: ['localhost:3100']
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: pod
```

### Query Patterns

```logql
# Find navigation errors
{app="lightningflow"} |= "Navigation failed"

# Find slow navigations (>1s)
{app="lightningflow"} |= "Navigation completed" | json | duration > 1000

# Find navigation patterns by route
{app="lightningflow"} |= "Navigation" | json | route="/payments/*"
```

## 6. Metrics and Alerting

### Key Metrics

Track these metrics in Prometheus:

1. **Navigation Success Rate**
   ```promql
   sum(rate(navigation_requests_total{status="success"}[5m])) 
   / 
   sum(rate(navigation_requests_total[5m]))
   ```

2. **Navigation Latency (p95)**
   ```promql
   histogram_quantile(0.95, 
     rate(navigation_duration_seconds_bucket[5m])
   )
   ```

3. **Route Error Rate**
   ```promql
   sum(rate(navigation_requests_total{status="error"}[5m])) 
   by (route)
   ```

4. **Service Dependency Health**
   ```promql
   up{job="lightningflow-api"} 
   and 
   up{job="n8n"}
   ```

### Alerting Rules

```yaml
# monitoring/prometheus/rules/navigation-alerts.yml
groups:
  - name: navigation_alerts
    interval: 30s
    rules:
      - alert: NavigationSuccessRateLow
        expr: |
          sum(rate(navigation_requests_total{status="success"}[5m])) 
          / 
          sum(rate(navigation_requests_total[5m])) < 0.95
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Navigation success rate below 95%"
          
      - alert: NavigationLatencyHigh
        expr: |
          histogram_quantile(0.95, 
            rate(navigation_duration_seconds_bucket[5m])
          ) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Navigation latency p95 above 2s"
          
      - alert: CriticalRouteDown
        expr: |
          up{route=~"/dashboard|/payments|/settings"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Critical route {{ $labels.route }} is down"
```

## 7. Testing Strategy

### Unit Tests

Test navigation logic in isolation:

```typescript
describe('Navigation', () => {
  it('should navigate to payments from dashboard', async () => {
    const result = await navigate('dashboard', 'payments');
    expect(result.success).toBe(true);
    expect(result.route).toBe('/payments');
  });
});
```

### Integration Tests

Test navigation with real services:

```typescript
describe('Navigation Integration', () => {
  it('should complete payment flow', async () => {
    await page.goto('/dashboard');
    await page.click('[data-testid="nav-payments"]');
    await expect(page).toHaveURL('/payments');
    // ... continue flow
  });
});
```

### E2E Tests

Test complete user journeys:

```typescript
test('Complete payment send flow', async ({ page }) => {
  await page.goto('/');
  await login(page);
  await navigateToPayments(page);
  await sendPayment(page, { amount: 1000, recipient: 'test@example.com' });
  await expect(page).toHaveURL('/payments/history');
});
```

## 8. Runbooks

### Navigation Flow Failure

**Symptoms:**
- Users cannot navigate between pages
- Routes return 404 or 500 errors
- Navigation takes >5 seconds

**Investigation Steps:**

1. Check service health:
   ```bash
   curl https://lightningflow.online/healthz
   curl https://lightningflow.online/api/healthz
   curl https://n8ncloud.tech/healthz
   ```

2. Check logs:
   ```bash
   # Loki query
   {app="lightningflow"} |= "Navigation failed" | json
   ```

3. Check metrics:
   ```bash
   # Prometheus query
   navigation_requests_total{status="error"}
   ```

4. Check route registry:
   ```bash
   ./scripts/devops/navigation-flow-monitor.sh int
   ```

**Resolution Steps:**

1. **If service is down**: Restart service
2. **If route missing**: Check route registry, add missing route
3. **If dependency down**: Check dependency health, restart if needed
4. **If high latency**: Check resource usage, scale if needed

### Route Not Found (404)

**Symptoms:**
- Users see 404 page
- Navigation fails with "Route not found"

**Investigation:**

1. Check route registry:
   ```bash
   grep -r "route-name" apps/lightningflow/web/src/lib/navigation/
   ```

2. Check route configuration:
   ```bash
   cat apps/lightningflow/web/src/lib/navigation/routes.ts
   ```

3. Check redirect map:
   ```bash
   cat apps/lightningflow/web/src/lib/redirect-map.ts
   ```

**Resolution:**

1. Add missing route to registry
2. Update redirect map if needed
3. Deploy changes
4. Verify route works

## 9. Continuous Improvement

### Weekly Reviews

- Review navigation metrics
- Identify slow routes
- Identify error patterns
- Plan improvements

### Monthly Audits

- Audit all routes for consistency
- Review navigation flow tests
- Update runbooks based on incidents
- Optimize slow routes

### Quarterly Assessments

- Review navigation architecture
- Assess new technologies
- Plan major improvements
- Update monitoring strategy

## 10. Tools and Scripts

### Available Scripts

- `./scripts/devops/navigation-flow-monitor.sh` - Monitor navigation flows
- `./scripts/health-monitor.sh` - Monitor service health
- `npm run test:e2e:navigation` - Run navigation E2E tests

### Custom Tools

Create custom tools for your specific needs:

```bash
# Example: Route validator
./scripts/devops/validate-routes.sh

# Example: Navigation performance profiler
./scripts/devops/profile-navigation.sh
```

## Conclusion

Ensuring navigation flow quality requires:

1. ✅ **Multi-layer health checks** - Service, route, and dependency levels
2. ✅ **Distributed tracing** - Track requests across services
3. ✅ **Synthetic monitoring** - Continuous E2E testing
4. ✅ **Load balancer health checks** - Already configured in Caddy
5. ✅ **Circuit breakers** - Prevent cascading failures
6. ✅ **Structured logging** - Correlate navigation events
7. ✅ **Metrics and alerting** - Track and alert on issues
8. ✅ **Comprehensive testing** - Unit, integration, and E2E
9. ✅ **Runbooks** - Documented incident response
10. ✅ **Continuous improvement** - Regular reviews and audits

By following this guide, you ensure that navigation flow remains reliable, performant, and user-friendly across your entire platform.

