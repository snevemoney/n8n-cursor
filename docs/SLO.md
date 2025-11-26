# Service Level Objectives (SLOs) - LightningFlow AI Platform

## Availability Targets

### Primary Domains
- **lightningflow.online** (SaaS UI/API): ≥ 99.9% monthly availability
- **n8ncloud.tech** (n8n + integration tooling): ≥ 99.9% monthly availability

### Error Budget
- **Monthly downtime allowance**: ≤ 43m44s per domain
- **Quarterly error budget**: ≤ 2h11m per domain
- **Annual error budget**: ≤ 8h45m per domain

## Health Endpoints (SLO Monitoring)

### LightningFlow Domain
- `GET https://lightningflow.online/healthz` (UI health)
- `GET https://lightningflow.online/api/healthz` (API health)

### n8nCloud Domain  
- `GET https://n8ncloud.tech/healthz` (n8n health)

## Response Time Targets

### UI Endpoints
- **Page load time**: ≤ 2s (95th percentile)
- **API response time**: ≤ 500ms (95th percentile)
- **Health check response**: ≤ 100ms (99th percentile)

### n8n Endpoints
- **Workflow execution**: ≤ 30s (95th percentile)
- **API response time**: ≤ 1s (95th percentile)
- **Health check response**: ≤ 100ms (99th percentile)

## Detection & Recovery Targets

### Time to Detect (TTD)
- **Target**: < 60 seconds
- **Method**: Synthetic monitoring every 30s
- **Alerting**: Slack/Discord + Email within 2 minutes

### Time to Restore (TTR)
- **Target**: < 15 minutes
- **Method**: Blue-green deployment or symlink flip
- **Rollback**: Previous Docker image or Caddy upstream switch

## Incident Severity Levels

### P1 (Critical) - Error Budget Impact
- **LightningFlow UI down**: Immediate revenue impact
- **LightningFlow API down**: Core functionality unavailable
- **n8n down**: Automation workflows stopped
- **Response**: Immediate escalation, 24/7 on-call

### P2 (High) - Performance Degradation
- **Response times > 2x normal**: User experience impacted
- **Partial functionality**: Some features unavailable
- **Response**: Business hours escalation, fix within 4 hours

### P3 (Medium) - Non-Critical Issues
- **Minor UI glitches**: Cosmetic issues
- **Non-essential features**: Nice-to-have functionality
- **Response**: Next business day, fix within 24 hours

## Monitoring & Alerting

### Synthetic Checks
- **Frequency**: Every 30 seconds
- **Locations**: Multiple geographic regions
- **Checks**: HTTP status, response time, content validation

### Real User Monitoring
- **Error tracking**: Sentry for frontend errors
- **Performance**: Core Web Vitals monitoring
- **User flows**: Critical path monitoring

### Infrastructure Monitoring
- **Container health**: Docker healthchecks
- **Resource usage**: CPU, memory, disk, network
- **Log analysis**: Error rate, response time trends

## Reliability Measures

### Prevention
- **Blue-green deployments**: Zero-downtime releases
- **Feature flags**: Kill switches for problematic features
- **Circuit breakers**: Prevent cascade failures
- **Resource limits**: Prevent resource exhaustion

### Detection
- **Health checks**: Container and application level
- **Synthetic monitoring**: External uptime checks
- **Error tracking**: Real-time error monitoring
- **Performance monitoring**: Response time tracking

### Recovery
- **Automated rollback**: Previous version deployment
- **Manual rollback**: Symlink flip or Caddy upstream switch
- **Incident response**: Runbook execution
- **Post-mortem**: Root cause analysis and prevention

## Compliance & Reporting

### Monthly Reports
- **Availability percentage**: Per domain
- **Error budget consumption**: Remaining budget
- **Incident summary**: P1/P2 incidents and resolution
- **Performance trends**: Response time improvements

### Quarterly Reviews
- **SLO adjustments**: Based on business needs
- **Error budget analysis**: Historical consumption
- **Reliability improvements**: Infrastructure enhancements
- **Process improvements**: Incident response optimization

---

**Last Updated**: $(date)
**Next Review**: $(date -d "+3 months")
**Owner**: LightningFlow AI Platform Team
