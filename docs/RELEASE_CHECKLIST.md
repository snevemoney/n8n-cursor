# Release Checklist (Blue/Green)

## Pre-Release
- [ ] All tests passing in CI
- [ ] Security scan (Trivy) clean
- [ ] API contracts updated
- [ ] Documentation updated
- [ ] Backup completed

## Build & Deploy
- [ ] Build images (int/staging/main tags)
- [ ] Deploy to GREEN; keep BLUE serving
- [ ] Healthz GREEN: web/api/n8n < 200ms
- [ ] Queue depth stable; error rate < baseline
- [ ] Database migrations applied (if any)

## Traffic Switch
- [ ] Flip Caddy upstream to GREEN
- [ ] Monitor error rates for 5 minutes
- [ ] Check queue processing
- [ ] Verify user authentication
- [ ] Test critical user flows

## Post-Release
- [ ] Monitor 15m; if regressions → flip back to BLUE
- [ ] Tag release + write notes
- [ ] Update monitoring dashboards
- [ ] Notify stakeholders of successful deployment

## Rollback Procedure
- [ ] Flip Caddy back to BLUE
- [ ] Verify traffic routing
- [ ] Check system health
- [ ] Document rollback reason
- [ ] Schedule postmortem if needed

## Emergency Contacts
- **On-call:** [Contact]
- **DevOps:** [Contact]
- **Management:** [Contact]
