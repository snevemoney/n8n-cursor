# 🦂 Scorpion SLO/SLA Tracking

## Service Level Objectives (SLOs)

### Availability SLO
- **Target:** 99.9% uptime
- **Measurement:** Successful API requests / Total API requests
- **Window:** Rolling 30-day window
- **Alert Threshold:** < 99.5% for 5 minutes

**Query:**
```promql
(
  sum(rate(scorpion_api_requests_total{status=~"2.."}[30d]))
  /
  sum(rate(scorpion_api_requests_total[30d]))
) >= 0.999
```

### Latency SLO
- **Target:** 95th percentile < 500ms
- **Measurement:** P95 response time
- **Window:** Rolling 5-minute window
- **Alert Threshold:** > 1s for 5 minutes

**Query:**
```promql
histogram_quantile(0.95, rate(scorpion_api_request_duration_seconds_bucket[5m])) < 0.5
```

### Error Rate SLO
- **Target:** < 0.1% errors
- **Measurement:** 5xx errors / Total requests
- **Window:** Rolling 5-minute window
- **Alert Threshold:** > 1% for 5 minutes

**Query:**
```promql
(
  sum(rate(scorpion_api_requests_total{status=~"5.."}[5m]))
  /
  sum(rate(scorpion_api_requests_total[5m]))
) < 0.001
```

### Health Check SLO
- **Target:** > 99.5% successful health checks
- **Measurement:** Successful /healthz calls / Total calls
- **Window:** Rolling 5-minute window
- **Alert Threshold:** < 95% for 2 minutes

**Query:**
```promql
(
  sum(rate(scorpion_navigation_requests_total{route="/healthz",status="200"}[5m]))
  /
  sum(rate(scorpion_navigation_requests_total{route="/healthz"}[5m]))
) >= 0.995
```

## Service Level Agreements (SLAs)

### Production SLA
- **Availability:** 99.9% uptime
- **Response Time:** P95 < 500ms
- **Error Rate:** < 0.1%
- **Support Response:** < 1 hour for critical issues

### Staging SLA
- **Availability:** 99% uptime
- **Response Time:** P95 < 1s
- **Error Rate:** < 1%
- **Support Response:** < 4 hours

## SLO Tracking Dashboard

### Grafana Queries

**Availability Over Time:**
```promql
sum(rate(scorpion_api_requests_total{status=~"2.."}[5m])) 
/ 
sum(rate(scorpion_api_requests_total[5m]))
```

**P95 Latency:**
```promql
histogram_quantile(0.95, rate(scorpion_api_request_duration_seconds_bucket[5m]))
```

**Error Rate:**
```promql
sum(rate(scorpion_api_requests_total{status=~"5.."}[5m])) 
/ 
sum(rate(scorpion_api_requests_total[5m]))
```

**SLO Compliance:**
```promql
scorpion:availability_slo
scorpion:latency_slo_p95
scorpion:error_rate_slo
scorpion:health_check_slo
```

## SLO Violation Response

### When SLO is Violated

1. **Immediate Actions:**
   - Check AlertManager for active alerts
   - Review recent deployments/changes
   - Check system resources (CPU, memory, disk)
   - Review error logs in Loki

2. **Investigation:**
   - Identify root cause
   - Check dependent services (Redis, n8n)
   - Review metrics trends
   - Check for recent code changes

3. **Remediation:**
   - Apply fixes based on root cause
   - Scale resources if needed
   - Restart service if necessary
   - Document incident

4. **Post-Incident:**
   - Calculate SLO impact
   - Update SLO targets if needed
   - Document lessons learned
   - Update runbooks

## Monthly SLO Review

### Review Process
1. Calculate actual SLO performance for the month
2. Compare against targets
3. Identify trends and patterns
4. Adjust targets if needed
5. Document findings

### Review Metrics
- Availability percentage
- Average P95 latency
- Error rate percentage
- Number of SLO violations
- Mean time to recovery (MTTR)

## Related Documentation
- [Incident Response Runbook](./scorpion-incident-response.md)
- [Monitoring Setup](../../monitoring/README.md)
- [Prometheus Configuration](../../monitoring/prometheus/prometheus.yml)

