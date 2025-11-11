# DevOps Navigation Flow Monitoring

Comprehensive DevOps approach to navigation flow monitoring with multi-layer health checks, observability, and synthetic monitoring.

## Overview

This document describes the complete navigation flow monitoring infrastructure implemented for Scorpion, including:

1. **Multi-layer health checks** - Service, route, and dependency levels
2. **Monitoring and observability** - Navigation flow monitoring with Prometheus metrics
3. **Distributed tracing** - Request tracking across services
4. **Synthetic monitoring** - Continuous E2E testing
5. **Load balancer configuration** - Caddy health checks and circuit breakers
6. **Logging and correlation** - Structured logs with correlation IDs
7. **Metrics and alerting** - Navigation success rate, latency, and error tracking

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Navigation Flow Monitor                  │
│  (scripts/devops/navigation-flow-monitor.ts)                │
│  - Tests critical routes                                     │
│  - Validates navigation flows                                │
│  - Exports Prometheus metrics                                │
└──────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Prometheus                                │
│  - Scrapes metrics from monitor (port 9091)                  │
│  - Scrapes metrics from Scorpion (port 3003/api/metrics)   │
│  - Evaluates alerting rules                                  │
└──────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Synthetic Monitor                         │
│  (scripts/devops/synthetic-monitoring.ts)                   │
│  - Continuous E2E testing                                    │
│  - Validates navigation paths                                │
│  - Alerts on failures                                        │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Multi-Layer Health Checks

#### Service-Level: `/healthz` Endpoints

Lightweight health check endpoint for Kubernetes/Docker readiness probes:

```bash
curl http://localhost:3003/healthz
```

**Response:**
```json
{
  "ok": true,
  "service": "scorpion",
  "timestamp": "2025-01-27T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "development"
}
```

#### Route-Level: Validate Critical Navigation Paths

All routes are validated through:
- E2E tests (`apps/scorpion/tests/e2e/navigation-flow.spec.ts`)
- Navigation flow monitor (`scripts/devops/navigation-flow-monitor.ts`)
- Synthetic monitoring (`scripts/devops/synthetic-monitoring.ts`)

#### Dependency-Level: Check Downstream Services

Comprehensive health check at `/api/health`:

```bash
curl http://localhost:3003/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T12:00:00.000Z",
  "systems": {
    "rag": { "status": "ok", "details": { "knowledgeItems": 100 } },
    "ontology": { "status": "ok", "details": { "entities": 50 } },
    "orchestrator": { "status": "ok" },
    "n8nClient": { "status": "ok" },
    "ollama": { "status": "warning", "message": "Ollama not running" }
  },
  "summary": {
    "total": 9,
    "healthy": 8,
    "warnings": 1,
    "errors": 0
  }
}
```

### 2. Monitoring and Observability

#### Navigation Flow Monitor

Continuously monitors navigation paths and validates critical user journeys:

```bash
# Start the monitor
ts-node scripts/devops/navigation-flow-monitor.ts
```

**Features:**
- Tests critical routes every 60 seconds (configurable via `CHECK_INTERVAL`)
- Validates navigation flows
- Checks dependencies
- Exports Prometheus metrics on port 9091

**Metrics Exposed:**
- `navigation_requests_total` - Counter of navigation requests
- `navigation_duration_seconds` - Histogram of navigation durations
- `navigation_errors_total` - Counter of navigation errors
- `route_availability` - Gauge of route availability
- `route_load_time_seconds` - Gauge of route load times
- `dependency_health` - Gauge of dependency health status

**Access Metrics:**
```bash
curl http://localhost:9091/metrics
```

#### Prometheus Metrics Exporter

Scorpion exposes Prometheus metrics at `/api/metrics`:

```bash
curl http://localhost:3003/api/metrics
```

**Navigation Metrics:**
- `scorpion_navigation_requests_total{route="/",status="200"}` - Total navigation requests
- `scorpion_navigation_duration_seconds{route="/"}` - Navigation duration histogram
- `scorpion_navigation_errors_total{route="/",error_type="timeout"}` - Navigation errors
- `scorpion_route_availability{route="/"}` - Route availability (1=available, 0=unavailable)
- `scorpion_route_load_time_seconds{route="/"}` - Route load time
- `scorpion_navigation_success_rate{route="/"}` - Navigation success rate

### 3. Distributed Tracing

Request tracking is implemented through:

1. **Correlation IDs** - Added to all requests via middleware (`apps/scorpion/middleware.ts`)
2. **Request IDs** - Generated for each request (`lib/api-error-handler.ts`)
3. **Tracing System** - Simple tracing implementation (`lib/tracing.ts`)

**Correlation IDs:**
- Added to request headers: `x-request-id`, `x-correlation-id`
- Added to response headers: `x-request-id`, `x-correlation-id`
- Used in structured logging

### 4. Synthetic Monitoring

Continuous E2E testing validates navigation paths:

```bash
# Start synthetic monitor
ts-node scripts/devops/synthetic-monitoring.ts
```

**Test Suites:**
1. **Critical Navigation Paths**
   - Home to Dashboard
   - Dashboard to Project
   - Project to Workflows

2. **Health Check Endpoints**
   - `/healthz` endpoint
   - `/api/health` endpoint

3. **Page Load Performance**
   - Home page load time
   - Dashboard page load time

**Results:**
- Saved to `monitoring/synthetic-results/`
- JSON format with test results and screenshots
- Summary statistics available

### 5. Load Balancer Configuration

Caddy health checks are configured in `infra/caddy/Caddyfile.dev`:

```caddy
scorpion.local {
    reverse_proxy localhost:3003 {
        health_uri /healthz
        health_interval 10s
        health_timeout 5s
    }
}
```

**Circuit Breaker Pattern:**
- Implemented in system automation
- Prevents cascading failures
- Graceful degradation when services are down

### 6. Logging and Correlation

#### Structured Logs with Correlation IDs

All requests include correlation IDs via middleware:

```typescript
// Middleware adds correlation IDs
request.headers.set('x-request-id', requestId);
request.headers.set('x-correlation-id', requestId);
```

**Log Format:**
```json
{
  "timestamp": "2025-01-27T12:00:00.000Z",
  "level": "info",
  "message": "Navigation request",
  "correlationId": "req-1234567890-abc123",
  "route": "/dashboard",
  "duration": 150
}
```

**Loki Aggregation:**
- Logs are aggregated via Loki (configured in `monitoring/loki/`)
- Query patterns for navigation analysis available

### 7. Metrics and Alerting

#### Navigation Success Rate

Tracked via Prometheus:
```promql
sum(rate(scorpion_navigation_requests_total{status="200"}[5m])) by (route)
/
sum(rate(scorpion_navigation_requests_total[5m])) by (route)
```

#### Navigation Latency (p50, p95, p99)

Tracked via histogram metrics:
```promql
# p50
histogram_quantile(0.50, rate(scorpion_navigation_duration_seconds_bucket[5m]))

# p95
histogram_quantile(0.95, rate(scorpion_navigation_duration_seconds_bucket[5m]))

# p99
histogram_quantile(0.99, rate(scorpion_navigation_duration_seconds_bucket[5m]))
```

#### Route Availability

Tracked via gauge:
```promql
scorpion_route_availability{route="/dashboard"}
```

#### Error Rates by Route

Tracked via counter:
```promql
rate(scorpion_navigation_errors_total[5m]) by (route, error_type)
```

#### Alerting Rules

Prometheus alerting rules are configured in `monitoring/prometheus/rules/navigation-alerts.yml`:

**Alerts:**
1. **HighNavigationFailureRate** - Navigation error rate > 10% for 5 minutes
2. **RouteUnavailable** - Route unavailable for > 2 minutes
3. **SlowNavigation** - 95th percentile > 5 seconds for 5 minutes
4. **LowNavigationSuccessRate** - Success rate < 95% for 5 minutes
5. **CriticalRouteDown** - Critical routes down for > 1 minute
6. **HighErrorRateByRoute** - Error rate > 5% for 5 minutes
7. **DependencyUnhealthy** - Dependency unhealthy for > 2 minutes
8. **HealthCheckDown** - Health check endpoint down for > 1 minute

## Usage

### Running E2E Tests

```bash
# Run navigation flow tests
cd apps/scorpion
pnpm test:e2e

# Or with Playwright directly
npx playwright test tests/e2e/navigation-flow.spec.ts
```

### Starting Navigation Flow Monitor

```bash
# Start the monitor
ts-node scripts/devops/navigation-flow-monitor.ts

# Or with environment variables
BASE_URL=http://localhost:3003 CHECK_INTERVAL=60000 ts-node scripts/devops/navigation-flow-monitor.ts
```

### Starting Synthetic Monitor

```bash
# Start synthetic monitoring
ts-node scripts/devops/synthetic-monitoring.ts

# Or with environment variables
BASE_URL=http://localhost:3003 CHECK_INTERVAL=300000 ts-node scripts/devops/synthetic-monitoring.ts
```

### Viewing Metrics

```bash
# View Prometheus metrics from Scorpion
curl http://localhost:3003/api/metrics

# View metrics from navigation flow monitor
curl http://localhost:9091/metrics

# View Prometheus UI (if running)
open http://localhost:9090
```

### Querying Metrics

**Navigation Success Rate:**
```promql
sum(rate(scorpion_navigation_requests_total{status="200"}[5m])) by (route)
/
sum(rate(scorpion_navigation_requests_total[5m])) by (route)
```

**Navigation Latency (p95):**
```promql
histogram_quantile(0.95, rate(scorpion_navigation_duration_seconds_bucket[5m])) by (route)
```

**Route Availability:**
```promql
scorpion_route_availability
```

**Error Rate by Route:**
```promql
rate(scorpion_navigation_errors_total[5m]) by (route, error_type)
```

## Configuration

### Environment Variables

**Navigation Flow Monitor:**
- `BASE_URL` - Base URL for the application (default: `http://localhost:3003`)
- `METRICS_PORT` - Port for metrics server (default: `9091`)
- `CHECK_INTERVAL` - Check interval in milliseconds (default: `60000`)

**Synthetic Monitor:**
- `BASE_URL` - Base URL for the application (default: `http://localhost:3003`)
- `CHECK_INTERVAL` - Check interval in milliseconds (default: `300000`)
- `RESULTS_DIR` - Directory for test results (default: `monitoring/synthetic-results`)

### Prometheus Configuration

Prometheus is configured in `monitoring/prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'scorpion'
    static_configs:
      - targets: ['localhost:3003']
    metrics_path: '/api/metrics'
    scrape_interval: 15s

  - job_name: 'navigation-flow-monitor'
    static_configs:
      - targets: ['localhost:9091']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

## Monitoring Dashboard

### Grafana Dashboards

Create Grafana dashboards using the following metrics:

1. **Navigation Success Rate** - Line graph showing success rate over time
2. **Navigation Latency** - Histogram showing p50, p95, p99 latencies
3. **Route Availability** - Gauge showing availability per route
4. **Error Rate** - Line graph showing error rate over time
5. **Navigation Flow** - Flow diagram showing navigation paths

### Key Metrics to Monitor

1. **Navigation Success Rate** - Should be > 95%
2. **Navigation Latency (p95)** - Should be < 2 seconds
3. **Route Availability** - Should be 100% for critical routes
4. **Error Rate** - Should be < 1%

## Troubleshooting

### Navigation Flow Monitor Not Starting

1. Check if port 9091 is available
2. Verify Playwright is installed: `npx playwright install chromium`
3. Check application is running: `curl http://localhost:3003/healthz`

### Metrics Not Appearing in Prometheus

1. Verify Prometheus is scraping the endpoints
2. Check Prometheus targets: `http://localhost:9090/targets`
3. Verify metrics are being exported: `curl http://localhost:3003/api/metrics`

### Alerts Not Firing

1. Check alerting rules are loaded: `http://localhost:9090/rules`
2. Verify metrics are being collected
3. Check alert thresholds are appropriate

## Best Practices

1. **Monitor Critical Routes First** - Focus on `/`, `/dashboard`, `/healthz`
2. **Set Appropriate Thresholds** - Adjust alert thresholds based on actual performance
3. **Regular Testing** - Run E2E tests in CI/CD pipeline
4. **Correlation IDs** - Always include correlation IDs in logs
5. **Structured Logging** - Use structured logs for better analysis
6. **Circuit Breakers** - Implement circuit breakers for external dependencies
7. **Graceful Degradation** - Handle failures gracefully

## Future Enhancements

1. **OpenTelemetry Integration** - Full distributed tracing
2. **Jaeger/Zipkin** - Advanced tracing visualization
3. **Grafana Dashboards** - Pre-built dashboards for navigation metrics
4. **Alert Manager** - Integration with Alertmanager for alert routing
5. **SLA Monitoring** - Track SLA compliance for navigation flows

