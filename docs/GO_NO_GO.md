# Production Launch Checklist (Go/No-Go)

## Overview

This checklist must be completed before launching n8n-cursor to production. Each item is marked as **Go** ✅ or **No-Go** ❌.

## Pre-Launch Requirements

### 1. Code Quality & CI/CD

- [ ] ✅ **Go**: All CI checks passing on `main` branch
- [ ] ✅ **Go**: All CI checks passing on `04-staging` branch  
- [ ] ✅ **Go**: Structure Guard passing (`make guard`)
- [ ] ✅ **Go**: Workflow validation passing (`make wf-validate`)
- [ ] ✅ **Go**: Linting passing (`make lint`)
- [ ] ✅ **Go**: No critical security vulnerabilities in dependencies
- [ ] ✅ **Go**: All TODO items in `reports/TODO_GAPS.md` resolved

**Commands to verify**:
```bash
make guard && make lint && make wf-validate
```

### 2. Security & Access Control

- [ ] ✅ **Go**: SSH hardened (root login disabled, key-only auth)
- [ ] ✅ **Go**: Firewall configured (UFW with ports 22, 80, 443 only)
- [ ] ✅ **Go**: fail2ban installed and configured
- [ ] ✅ **Go**: TLS certificate valid and auto-renewing
- [ ] ✅ **Go**: Default passwords changed (n8n, PostgreSQL)
- [ ] ✅ **Go**: Environment variables secured (no hardcoded secrets)
- [ ] ✅ **Go**: Supabase RLS policies enabled and tested

**Commands to verify**:
```bash
make secure-ssh
make tls-check
sudo ufw status
sudo fail2ban-client status
```

### 3. Infrastructure & Services

- [ ] ✅ **Go**: All Docker services running and healthy
- [ ] ✅ **Go**: PostgreSQL accessible and responding
- [ ] ✅ **Go**: n8n web interface accessible via HTTPS
- [ ] ✅ **Go**: Health endpoint responding (`/healthz`)
- [ ] ✅ **Go**: Nginx proxy working correctly
- [ ] ✅ **Go**: DNS pointing to correct server IP

**Commands to verify**:
```bash
make health
make status
make doctor
curl -f https://your-domain.com/healthz
```

### 4. Data & Backups

- [ ] ✅ **Go**: Database backup successful in last 24 hours
- [ ] ✅ **Go**: n8n workflows backup successful in last 24 hours
- [ ] ✅ **Go**: Repository backup successful in last 24 hours
- [ ] ✅ **Go**: Backup restoration tested and verified
- [ ] ✅ **Go**: Backup retention policies configured
- [ ] ✅ **Go**: Off-site backup location configured (if required)

**Commands to verify**:
```bash
DRY_RUN=0 make db-backup
DRY_RUN=0 make n8n-backup
ls -la backups/
```

### 5. Monitoring & Alerting

- [ ] ✅ **Go**: Health endpoint monitoring configured (UptimeRobot/Pingdom)
- [ ] ✅ **Go**: Alert notifications working (email/Slack)
- [ ] ✅ **Go**: System resource monitoring in place
- [ ] ✅ **Go**: Error tracking configured (Sentry/similar)
- [ ] ✅ **Go**: Log aggregation working
- [ ] ✅ **Go**: Backup success/failure alerts configured

**Commands to verify**:
```bash
# Test health endpoint
curl -f https://your-domain.com/healthz

# Test alert mechanism
/usr/local/bin/test-alerts.sh
```

### 6. Application-Specific

- [ ] ✅ **Go**: All 61 workflows validated and error-free
- [ ] ✅ **Go**: Stripe webhook signature verification working
- [ ] ✅ **Go**: Supabase connection tested
- [ ] ✅ **Go**: MCP tools integration verified
- [ ] ✅ **Go**: Rate limiting configured on critical endpoints
- [ ] ✅ **Go**: CORS policies configured correctly

**Commands to verify**:
```bash
make wf-validate
make wf-dedupe
# Test Stripe webhook
stripe listen --forward-to localhost:5678/stripe/webhook
```

### 7. Performance & Capacity

- [ ] ✅ **Go**: Load testing completed (if applicable)
- [ ] ✅ **Go**: Database performance acceptable
- [ ] ✅ **Go**: Server resources adequate (CPU < 70%, Memory < 80%, Disk < 70%)
- [ ] ✅ **Go**: Response times within acceptable limits
- [ ] ✅ **Go**: Concurrent user capacity verified

**Commands to verify**:
```bash
make health  # Checks resource usage
# Review system metrics
htop
df -h
```

### 8. Documentation & Support

- [ ] ✅ **Go**: README.md updated with current deployment info
- [ ] ✅ **Go**: Runbook complete and tested
- [ ] ✅ **Go**: Recovery procedures documented and tested
- [ ] ✅ **Go**: Contact information updated
- [ ] ✅ **Go**: Change log maintained
- [ ] ✅ **Go**: User documentation complete (if applicable)

## Launch Day Procedures

### Pre-Launch (T-4 hours)

1. **Final Verification**:
   ```bash
   # Comprehensive health check
   make guard && make doctor && make wf-validate && make health
   ```

2. **Create Launch Backup**:
   ```bash
   # Create comprehensive pre-launch backup
   DRY_RUN=0 make db-backup
   DRY_RUN=0 make n8n-backup
   DRY_RUN=0 make backup
   ```

3. **Alert Team**:
   - Notify operations team
   - Ensure support coverage
   - Prepare rollback plan

### Launch (T-0)

1. **Final Deployment**:
   ```bash
   # Ensure on main branch
   git checkout main
   git pull origin main
   
   # Deploy to production
   DRY_RUN=0 make up
   ```

2. **Post-Launch Verification**:
   ```bash
   # Wait for services to stabilize
   sleep 30
   
   # Verify all systems
   make health
   make status
   ```

3. **Monitor**:
   - Watch monitoring dashboards
   - Check error rates
   - Verify user access

### Post-Launch (T+1 hour)

1. **Stability Check**:
   ```bash
   # Comprehensive health check
   make health
   ```

2. **Performance Verification**:
   - Check response times
   - Monitor resource usage
   - Verify workflow executions

3. **User Verification**:
   - Test key user workflows
   - Verify authentication
   - Check data integrity

## Rollback Procedures

### When to Rollback

**Immediate rollback if**:
- Health checks failing
- Critical errors in logs
- Data corruption detected
- Security breach suspected
- User-reported data loss

### Rollback Steps

1. **Emergency Stop**:
   ```bash
   DRY_RUN=0 make down
   ```

2. **Restore from Backup**:
   ```bash
   export MASTER_UNLOCK="your_encryption_key"
   DRY_RUN=0 make db-restore FILE="backups/db/pre_launch_backup.sql.gz"
   ```

3. **Revert Code**:
   ```bash
   git checkout previous-stable-tag
   DRY_RUN=0 make up
   ```

4. **Verify Rollback**:
   ```bash
   make health
   ```

5. **Communicate**:
   - Notify stakeholders
   - Update status page
   - Plan recovery strategy

## Sign-off

### Technical Sign-off

- [ ] **DevOps Lead**: All infrastructure checks passed
- [ ] **Security Lead**: Security requirements met  
- [ ] **QA Lead**: Testing completed successfully
- [ ] **Product Lead**: Features ready for production

### Final Go/No-Go Decision

**Overall Status**: 
- [ ] ✅ **GO**: All critical requirements met, ready for production
- [ ] ❌ **NO-GO**: Critical issues remain, launch postponed

**Launch Date**: _______________  
**Launch Time**: _______________  
**Approved By**: _______________  
**Date**: _______________

## Emergency Contacts

- **Primary On-Call**: Your Name (+1-xxx-xxx-xxxx)
- **Secondary**: Backup Name (+1-xxx-xxx-xxxx)
- **Escalation**: Manager Name (+1-xxx-xxx-xxxx)

---

**Document Version**: 1.0  
**Last Updated**: $(date)  
**Next Review**: $(date -d "+3 months")
