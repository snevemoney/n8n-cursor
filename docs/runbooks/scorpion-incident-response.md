# 🦂 Scorpion Incident Response Runbook

## Overview
This runbook provides step-by-step procedures for responding to incidents affecting the Scorpion service.

## Severity Levels

### Critical (P0)
- Service completely down
- Data loss or corruption
- Security breach
- **Response Time:** Immediate (< 5 minutes)

### High (P1)
- Service degraded (>50% errors)
- Critical feature unavailable
- Performance degradation (>5s response time)
- **Response Time:** < 15 minutes

### Medium (P2)
- Partial service degradation
- Non-critical feature unavailable
- **Response Time:** < 1 hour

### Low (P3)
- Minor issues
- Cosmetic problems
- **Response Time:** < 4 hours

## Incident Response Process

### 1. Detection & Triage

#### Check Service Status
```bash
# Health check
curl http://localhost:3003/healthz
curl http://localhost:3003/api/health

# Check metrics
curl http://localhost:3003/api/metrics | grep scorpion_system_health

# Check logs (if Loki available)
# Query: {service="scorpion"} |= "error"
```

#### Check Docker Container
```bash
docker ps | grep scorpion
docker logs scorpion --tail 100
docker stats scorpion
```

#### Check Prometheus Alerts
- Access: http://localhost:9090/alerts
- Look for: `ScorpionDown`, `ScorpionHealthCheckFailing`, `ScorpionHighErrorRate`

### 2. Initial Response

#### Service Down
1. **Check container status**
   ```bash
   docker ps -a | grep scorpion
   docker inspect scorpion
   ```

2. **Check resource limits**
   ```bash
   docker stats scorpion --no-stream
   ```

3. **Restart service**
   ```bash
   docker compose -f infra/docker/docker-compose.prod.yml restart scorpion
   ```

4. **Verify recovery**
   ```bash
   sleep 10
   curl http://localhost:3003/healthz
   ```

#### High Error Rate
1. **Check error logs**
   ```bash
   docker logs scorpion --tail 200 | grep -i error
   ```

2. **Check metrics**
   ```bash
   curl http://localhost:3003/api/metrics | grep scorpion_errors_total
   ```

3. **Check dependencies**
   ```bash
   # Redis
   docker exec redis redis-cli ping
   
   # n8n
   curl http://localhost:5678/healthz
   ```

4. **Restart if needed**
   ```bash
   docker compose -f infra/docker/docker-compose.prod.yml restart scorpion
   ```

#### Performance Issues
1. **Check response times**
   ```bash
   curl -w "@-" -o /dev/null -s http://localhost:3003/api/health <<'EOF'
   time_namelookup:  %{time_namelookup}\n
   time_connect:  %{time_connect}\n
   time_starttransfer:  %{time_starttransfer}\n
   time_total:  %{time_total}\n
   EOF
   ```

2. **Check resource usage**
   ```bash
   docker stats scorpion --no-stream
   ```

3. **Scale up if needed** (update docker-compose.yml)
   ```yaml
   cpus: "4"  # Increase from 2
   mem_limit: "4g"  # Increase from 2g
   ```

### 3. Escalation

#### When to Escalate
- Issue persists after initial response (>15 min)
- Data loss detected
- Security breach suspected
- Multiple services affected

#### Escalation Contacts
- **Primary:** [Your contact]
- **Secondary:** [Backup contact]
- **On-Call:** Check PagerDuty/Slack

### 4. Post-Incident

#### Immediate Actions
1. Document incident timeline
2. Verify service stability (monitor for 1 hour)
3. Notify stakeholders if needed

#### Within 24 Hours
1. **Postmortem**
   - Root cause analysis
   - Impact assessment
   - Timeline reconstruction
   - Action items

2. **Update Runbook**
   - Add new procedures if needed
   - Update based on lessons learned

## Common Issues & Solutions

### Issue: Container Won't Start
**Symptoms:** `docker ps` shows container as "Exited"

**Solution:**
```bash
# Check logs
docker logs scorpion

# Check resource limits
docker inspect scorpion | grep -A 10 Resources

# Try manual start
docker start scorpion

# If still failing, check data directory permissions
ls -la data/scorpion
chmod -R 755 data/scorpion
```

### Issue: High Memory Usage
**Symptoms:** Container OOM kills, slow responses

**Solution:**
1. Check memory limits in docker-compose.yml
2. Increase if needed: `mem_limit: "4g"`
3. Restart: `docker compose restart scorpion`
4. Monitor: `docker stats scorpion`

### Issue: Database/Storage Issues
**Symptoms:** Errors about data directory, missing files

**Solution:**
```bash
# Check data directory
ls -la data/scorpion

# Check disk space
df -h data/scorpion

# Restore from backup if needed
cd apps/scorpion
pnpm restore
```

### Issue: Circuit Breaker Open
**Symptoms:** External API calls failing, circuit breaker metrics show "open"

**Solution:**
1. Check external service status (n8n, Ollama)
2. Wait for circuit breaker to reset (usually 60s)
3. If persistent, check network connectivity
4. Restart service if needed

## Monitoring & Alerts

### Key Metrics to Watch
- `scorpion_system_health` - Should be 1
- `scorpion_api_requests_total` - Monitor error rates
- `scorpion_errors_total` - Should be low
- `scorpion_circuit_breaker_state` - Should be 0 (closed)

### Alert Channels
- **Critical:** Slack #scorpion-critical
- **Warning:** Slack #scorpion-alerts
- **Info:** Slack #scorpion-ops

## Recovery Procedures

### Full Service Restore
```bash
# Stop service
docker compose -f infra/docker/docker-compose.prod.yml stop scorpion

# Restore from backup
cd apps/scorpion
pnpm restore

# Start service
docker compose -f infra/docker/docker-compose.prod.yml start scorpion

# Verify
curl http://localhost:3003/healthz
```

### Data Recovery
```bash
# List available backups
ls -lt apps/scorpion/backups/scorpion/

# Restore specific backup
cd apps/scorpion
cp -r backups/scorpion/scorpion-backup-YYYY-MM-DDTHH-MM-SS/* data/scorpion/

# Restart service
docker compose restart scorpion
```

## Prevention

### Regular Checks
- Daily: Review error logs
- Weekly: Review metrics trends
- Monthly: Test backup/restore procedures

### Maintenance Windows
- Schedule: Weekly, Sunday 2-4 AM UTC
- Duration: 2 hours
- Notify: 24 hours in advance

## Contacts

- **On-Call Engineer:** [Contact]
- **DevOps Lead:** [Contact]
- **Manager:** [Contact]

## Related Documentation
- [Deployment Guide](../apps/scorpion/DEPLOYMENT.md)
- [Monitoring Setup](../../monitoring/README.md)
- [Backup Procedures](../../docs/BACKUP_RESTORE_PROCEDURES.md)

