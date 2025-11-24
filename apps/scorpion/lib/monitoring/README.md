# Monitoring & Observability

Prometheus-compatible metrics, Four Golden Signals tracking, and SLI/SLO definitions.

## Features

- ✅ Prometheus metrics exporter (`/api/metrics`)
- ✅ Four Golden Signals tracking (Latency, Traffic, Errors, Saturation)
- ✅ SLI/SLO definitions and evaluation
- ✅ Automatic request tracking
- ✅ System saturation monitoring (CPU, memory, connections)

---

## Quick Start

### 1. Metrics Endpoint

Prometheus can scrape metrics from:

```
GET /api/metrics
```

Returns metrics in Prometheus text format.

### 2. Golden Signals

Get current Four Golden Signals:

```bash
curl http://localhost:3003/api/metrics/golden-signals
```

Response:
```json
{
  "latency": {
    "p50": 45.2,
    "p95": 120.5,
    "p99": 250.8,
    "mean": 52.3
  },
  "traffic": {
    "requestsPerSecond": 12.5,
    "requestsTotal": 750
  },
  "errors": {
    "errorRate": 0.5,
    "errorCount": 4,
    "totalRequests": 750
  },
  "saturation": {
    "cpuUsage": 25.3,
    "memoryUsage": 45.2,
    "activeConnections": 8
  }
}
```

### 3. SLOs

Get Service Level Objectives:

```bash
curl http://localhost:3003/api/metrics/slos
```

---

## Usage

### Track Custom Metrics

```typescript
import { getMetricsCollector } from '@/lib/monitoring/metrics';

const metrics = getMetricsCollector();

// Increment counter
metrics.increment('custom_events_total', { type: 'user_action' });

// Set gauge
metrics.set('active_users', 42);

// Observe histogram
metrics.observe('processing_duration_seconds', 1.5, { service: 'api' });
```

### Track Request Manually

```typescript
import { getGoldenSignalsTracker } from '@/lib/monitoring/golden-signals';

const tracker = getGoldenSignalsTracker();
const requestId = 'req-123';

tracker.startRequest(requestId, '/api/endpoint', 'GET');
// ... handle request ...
tracker.recordRequest(requestId, '/api/endpoint', 'GET', 200, 150);
```

### Use Middleware

```typescript
import { monitoringMiddleware } from '@/lib/monitoring/middleware';

export async function GET(request: NextRequest) {
  return monitoringMiddleware(request, async (req) => {
    // Your handler
    return NextResponse.json({ data: '...' });
  });
}
```

---

## Default SLIs

1. **HTTP Availability** - Percentage of successful HTTP requests
2. **HTTP Latency P95** - 95th percentile request latency
3. **Error Rate** - Percentage of requests that result in errors

---

## Default SLOs

1. **Scorpion API Availability** - 99.9% of requests should succeed
2. **Scorpion API Latency** - 95% of requests should complete in under 2 seconds
3. **Scorpion Error Rate** - Error rate should be below 1%

---

## Prometheus Integration

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'scorpion'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3003']
    metrics_path: '/api/metrics'
```

---

## Metrics Collected

### HTTP Metrics
- `http_requests_total` - Total HTTP requests (counter)
- `http_request_duration_seconds` - Request duration (histogram)
- `http_errors_total` - Total HTTP errors (counter)

### System Metrics
- `system_cpu_usage_percent` - CPU usage percentage (gauge)
- `system_memory_usage_percent` - Memory usage percentage (gauge)
- `system_memory_total_bytes` - Total memory (gauge)
- `system_memory_free_bytes` - Free memory (gauge)
- `system_memory_used_bytes` - Used memory (gauge)
- `system_active_connections` - Active connections (gauge)

---

**Status**: Foundation Complete ✅  
**Ready for**: Prometheus scraping and Grafana dashboards

