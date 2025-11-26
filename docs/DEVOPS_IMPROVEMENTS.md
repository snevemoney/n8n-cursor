# DevOps Improvements for Scorpion

This document summarizes the DevOps improvements implemented for Scorpion.

## ✅ Implemented Improvements

### 1. Health Check Endpoints

#### `/healthz` - Lightweight Readiness Probe
- **Location**: `apps/scorpion/app/healthz/route.ts`
- **Purpose**: Kubernetes/Docker readiness probe
- **Response Time**: <100ms (no external dependencies)
- **Status Codes**: 
  - `200 OK`: Service is ready
  - `503 Service Unavailable`: Service is not ready

**Usage:**
```bash
curl http://localhost:3003/healthz
```

#### `/api/health` - Comprehensive Health Check
- **Location**: `apps/scorpion/app/api/health/route.ts`
- **Purpose**: Full system health check with dependency verification
- **Enhanced with**: Dependency checks for Supabase, Redis, and Ollama
- **Response Time**: ~500ms-2s (includes dependency checks)
- **Caching**: 15 seconds

**New Dependency Checks:**
- ✅ Supabase connectivity (3s timeout)
- ✅ Redis configuration check
- ✅ Ollama connectivity (2s timeout)

**Usage:**
```bash
curl http://localhost:3003/api/health
```

### 2. Graceful Shutdown Handler

#### Implementation
- **Location**: `apps/scorpion/lib/shutdown-handler.ts`
- **Initialization**: `apps/scorpion/instrumentation.ts`

**Features:**
- Handles `SIGTERM` (Docker/Kubernetes graceful shutdown)
- Handles `SIGINT` (Ctrl+C)
- Handles uncaught exceptions
- 30-second shutdown timeout
- Parallel cleanup of all systems

**Cleanup Order:**
1. Auto-sync (stops intervals and watchers)
2. Agent operations (stops scheduler, waits for active operations)
3. Browser pool (closes all browser sessions)
4. System automation (cleanup if available)
5. Telemetry (shutdown if available)

**Shutdown Process:**
```
SIGTERM/SIGINT received
  ↓
Stop accepting new requests
  ↓
Wait for active operations (max 10s)
  ↓
Stop background jobs
  ↓
Close connections
  ↓
Exit cleanly
```

**Testing:**
```bash
# Test graceful shutdown
docker stop scorpion
# Or
kill -TERM <pid>
```

### 3. Enhanced Health Checks

#### Dependency Health Checks Added

**Supabase Check:**
- Verifies connectivity with 3s timeout
- Checks API key configuration
- Returns `warning` if not configured or unreachable

**Redis Check:**
- Verifies configuration
- Returns `warning` if not configured (optional service)

**Ollama Check:**
- Verifies connectivity with 2s timeout
- Returns `warning` if unreachable (service may be offline)
- Includes version information when available

### 4. Resource Monitoring Alerts

#### Prometheus Alert Rules
- **Location**: `monitoring/prometheus/scorpion-alerts.yml`

**Alert Categories:**

1. **Resource Exhaustion**
   - High memory usage (>1GB for 5m) → Warning
   - Critical memory usage (>2GB for 2m) → Critical
   - High CPU usage (>80% for 5m) → Warning

2. **Health Check Failures**
   - Health check failed (1m) → Critical
   - Health degraded (5m) → Warning

3. **API Error Rates**
   - High error rate (>0.1/s for 5m) → Warning
   - Critical error rate (>1.0/s for 2m) → Critical

4. **Dependency Health**
   - Supabase unreachable (2m) → Critical
   - n8n unreachable (5m) → Warning
   - Ollama unreachable (10m) → Warning

5. **Performance**
   - Slow API responses (p95 > 2s for 5m) → Warning
   - Very slow API responses (p95 > 5s for 2m) → Critical

6. **Circuit Breaker**
   - Circuit breaker open (1m) → Warning

7. **Background Jobs**
   - Background job failures (>0.1/s for 5m) → Warning

8. **Disk Space**
   - Low disk space (<10% for 5m) → Warning

### 5. Performance Monitoring

#### Performance Baselines
- **Location**: `apps/scorpion/lib/performance-monitor.ts`

**Defined Baselines:**
- `/api/health`: p95 < 200ms, p99 < 500ms
- `/api/healthz`: p95 < 50ms, p99 < 100ms
- `/api/chat/stream`: p95 < 2s, p99 < 5s
- `/api/agents`: p95 < 500ms, p99 < 1s
- `/api/logs`: p95 < 800ms, p99 < 1.5s
- Default: p95 < 1s, p99 < 2s

**Tracking:**
- API request duration (histogram)
- Database query duration (histogram)
- External API call duration (histogram)
- Slow request detection (alerts on p95/p99 violations)

## 📋 Quick Reference

### Health Check Commands

```bash
# Lightweight readiness probe
curl -f http://localhost:3003/healthz

# Comprehensive health check
curl -f http://localhost:3003/api/health | jq

# Check specific dependencies
curl http://localhost:3003/api/health | jq '.systems.supabase'
curl http://localhost:3003/api/health | jq '.systems.ollama'
```

### Shutdown Testing

```bash
# Test graceful shutdown (Docker)
docker stop scorpion

# Test graceful shutdown (Process)
kill -TERM $(pgrep -f "next-server")

# Force shutdown (if graceful fails)
kill -9 $(pgrep -f "next-server")
```

### Performance Monitoring

```bash
# Check performance metrics (if Prometheus configured)
curl http://localhost:9090/api/v1/query?query=scorpion_api_request_duration_seconds

# Check slow requests
curl http://localhost:9090/api/v1/query?query=scorpion_api_slow_requests_total
```

## 🔧 Configuration

### Environment Variables

No new environment variables required. Existing variables are used:
- `SUPABASE_URL` - For Supabase health check
- `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_KEY` - For Supabase health check
- `REDIS_URL` - For Redis configuration check
- `OLLAMA_URL` - For Ollama health check

### Prometheus Configuration

To enable alerts, add to `prometheus.yml`:

```yaml
rule_files:
  - "scorpion-alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

## 📊 Monitoring Dashboard

Recommended Grafana panels:

1. **Health Status**
   - Overall health (healthy/degraded/unhealthy)
   - System-by-system status
   - Dependency health

2. **Performance**
   - API response times (p50, p95, p99)
   - Slow request rate
   - Database query times

3. **Resources**
   - Memory usage
   - CPU usage
   - Active connections

4. **Errors**
   - Error rate by endpoint
   - Circuit breaker status
   - Background job failures

## 🚀 Next Steps

### Recommended Additions

1. **Log Aggregation**
   - Set up Loki for centralized logging
   - Configure log retention policies

2. **APM/Tracing**
   - Add OpenTelemetry for distributed tracing
   - Track request flows across services

3. **Disaster Recovery Drills**
   - Schedule quarterly DR drills
   - Document recovery procedures

4. **Performance Baselines**
   - Establish SLAs for each endpoint
   - Set up automated performance regression tests

5. **Secrets Rotation**
   - Document rotation schedule
   - Automate secret rotation where possible

## 📝 Notes

- All health checks are non-blocking (timeouts prevent hanging)
- Dependency failures are reported as warnings, not errors (services may be optional)
- Shutdown handler has a 30-second timeout to prevent hanging
- Performance baselines can be adjusted based on actual usage patterns

