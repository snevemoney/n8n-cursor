# DevOps Navigation Flow - Quick Reference

## Daily Operations

### Check Navigation Health
```bash
# Run navigation flow monitor
./scripts/devops/navigation-flow-monitor.sh int

# Check specific service health
curl https://lightningflow.online/healthz
curl https://lightningflow.online/api/healthz
curl https://n8ncloud.tech/healthz
```

### View Navigation Metrics
```bash
# Prometheus queries
# Navigation success rate
sum(rate(navigation_requests_total{status="success"}[5m])) / sum(rate(navigation_requests_total[5m]))

# Navigation latency p95
histogram_quantile(0.95, rate(navigation_duration_seconds_bucket[5m]))

# Route availability
route_availability

# Navigation errors by route
sum(rate(navigation_errors_total[5m])) by (route)
```

### Check Logs
```bash
# Loki queries
# Navigation errors
{app="lightningflow"} |= "Navigation failed"

# Slow navigations (>1s)
{app="lightningflow"} |= "Navigation completed" | json | duration > 1000

# Navigation by route
{app="lightningflow"} |= "Navigation" | json | route="/payments/*"
```

## Common Issues & Solutions

### Issue: Route Returns 404

**Check:**
1. Route exists in registry: `grep -r "route-name" apps/lightningflow/web/src/lib/navigation/`
2. Route configured correctly: `cat apps/lightningflow/web/src/lib/navigation/routes.ts`
3. Service is running: `curl https://lightningflow.online/healthz`

**Fix:**
1. Add missing route to registry
2. Update redirect map if needed
3. Restart service if route exists but not accessible

### Issue: Navigation is Slow (>2s)

**Check:**
1. Service health: `curl https://lightningflow.online/api/healthz`
2. Dependency health: Check database, Redis, n8n
3. Resource usage: CPU, memory, network

**Fix:**
1. Scale service if resource constrained
2. Optimize slow routes
3. Check for network issues
4. Review dependency latency

### Issue: Navigation Fails Completely

**Check:**
1. All services healthy: `./scripts/devops/navigation-flow-monitor.sh int`
2. Load balancer health: Check Caddy logs
3. Service logs: Check for errors

**Fix:**
1. Restart unhealthy services
2. Check Caddy configuration
3. Verify route registry integrity
4. Check for dependency failures

## Monitoring Dashboards

### Grafana Dashboards

1. **Navigation Overview**
   - Success rate
   - Error rate
   - Latency (p50, p95, p99)
   - Requests per second

2. **Route Health**
   - Availability by route
   - Error rate by route
   - Latency by route

3. **Service Dependencies**
   - Health of all services
   - Dependency latency
   - Circuit breaker status

## Alerting

### Critical Alerts (Immediate Action)
- Critical route down (>1 minute)
- Navigation completely failing
- Service dependencies down

### Warning Alerts (Investigate)
- Navigation success rate <95%
- Navigation latency p95 >2s
- Route error rate >5%
- Route availability <90%

## Testing

### Run Navigation Tests
```bash
# E2E navigation tests
npm run test:e2e:navigation

# All navigation flow tests
./scripts/devops/navigation-flow-monitor.sh int --alert
```

### Test Specific Route
```bash
# Test route availability
curl -I https://lightningflow.online/payments

# Test route with authentication
curl -H "Authorization: Bearer $TOKEN" https://lightningflow.online/api/payments
```

## Tools

### Available Scripts
- `./scripts/devops/navigation-flow-monitor.sh` - Monitor navigation flows
- `./scripts/health-monitor.sh` - Monitor service health
- `npm run test:e2e:navigation` - Run navigation E2E tests

### Metrics Exporter
```bash
# Start metrics exporter
ts-node scripts/devops/navigation-metrics-exporter.ts

# View metrics
curl http://localhost:9091/metrics

# Check route availability
curl http://localhost:9091/routes/availability
```

## Key Files

### Configuration
- `apps/lightningflow/web/src/lib/navigation/routes.ts` - Route registry
- `apps/lightningflow/web/src/lib/redirect-map.ts` - Redirect map
- `infra/caddy/Caddyfile` - Load balancer config
- `monitoring/prometheus/prometheus.yml` - Metrics config
- `monitoring/prometheus/rules/navigation-alerts.yml` - Alert rules

### Documentation
- `docs/DEVOPS_NAVIGATION_FLOW.md` - Full DevOps guide
- `docs/DEVOPS_NAVIGATION_QUICK_REFERENCE.md` - This file

## Best Practices

1. **Always check health first** - Use `/healthz` endpoints
2. **Monitor continuously** - Use synthetic monitoring
3. **Test before deploy** - Run E2E tests in CI/CD
4. **Log everything** - Use structured logging with correlation IDs
5. **Alert on failures** - Configure alerts for critical issues
6. **Document incidents** - Update runbooks after incidents
7. **Review regularly** - Weekly reviews, monthly audits

## Emergency Contacts

- **On-Call Engineer**: Check PagerDuty/Slack
- **Incident Response**: Follow runbook in `docs/DEVOPS_NAVIGATION_FLOW.md`
- **Escalation**: Contact DevOps lead if issue persists >15 minutes

