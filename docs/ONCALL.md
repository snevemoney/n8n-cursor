# On-Call Runbook

## First 5 Minutes
1. **Check system health:**
   ```bash
   curl -I https://lightningflow.online/healthz
   curl -I https://app.lightningflow.online/healthz
   curl -I https://ops.lightningflow.online/healthz
   curl -I https://n8ncloud.tech/healthz
   ```

2. **Check container status:**
   ```bash
   docker ps
   docker compose -f infra/docker/docker-compose.int.yml ps
   ```

3. **Check queue status:**
   ```bash
   docker exec -it <worker-container> node scripts/queue_stats.ts
   ```

4. **Check Redis:**
   ```bash
   redis-cli INFO
   ```

## Common Issues & Fixes

### High Queue Depth
- **Symptom:** Queue has many waiting jobs
- **Fix:** Scale worker replicas or increase concurrency
- **Command:** `docker compose -f infra/docker/docker-compose.int.yml up -d --scale worker=3`

### API Errors
- **Symptom:** 5xx errors in logs
- **Fix:** Check API container health, restart if needed
- **Command:** `docker compose -f infra/docker/docker-compose.int.yml restart api`

### Database Issues
- **Symptom:** Connection timeouts
- **Fix:** Check Supabase status, verify connection strings
- **Command:** Check Supabase dashboard for incidents

### n8n Workflow Failures
- **Symptom:** Workflows not executing
- **Fix:** Check n8n container, verify webhook endpoints
- **Command:** `docker compose -f infra/docker/docker-compose.int.yml logs n8n`

## Rollback Procedure
1. **Flip traffic back to BLUE:**
   ```bash
   # Update Caddy configuration to point to BLUE
   sudo systemctl reload caddy
   ```

2. **Verify rollback:**
   ```bash
   curl -I https://lightningflow.online/healthz
   ```

3. **Monitor for 15 minutes**

## Escalation
- **Level 1:** [Your contact] - Initial response
- **Level 2:** [Senior dev] - Complex technical issues
- **Level 3:** [Management] - Business impact

## Emergency Contacts
- **Slack:** #incidents
- **Phone:** [Emergency number]
- **Email:** [Incident email]

## Post-Incident
1. Create incident document from template
2. Schedule postmortem within 24 hours
3. Update runbooks based on learnings
4. Implement prevention measures
