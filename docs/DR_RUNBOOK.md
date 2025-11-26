# Disaster Recovery Runbook

**RTO:** 1 hour | **RPO:** 15 minutes

## Data Sources
- Postgres/Supabase exports (daily)
- Redis snapshots (periodic)
- n8n workflows (Git + /srv/workflows)
- Application configurations (/root/infra)

## Restore Steps (Non-Prod Drill)
1. Provision fresh VM (same OS, Docker, Caddy).
2. Install restic; configure env (RESTIC_REPOSITORY, RESTIC_PASSWORD, B2_…).
3. Run `scripts/restore-test.sh` to pull latest snapshot.
4. Restore DB backups into a throwaway Postgres.
5. Spin up stack with Integration compose; point API to restored DB.
6. Run smoke: `/healthz`, run workflow(0), poll `/status/:id`.
7. Record time; open incident doc with findings.

## Prod Restore (When Needed)
- Announce maintenance window.
- Restore latest snapshot; update DNS if new host.
- Run smoke tests; remove maintenance.
- Postmortem within 24h.

## Backup Schedule
- **Daily:** Full system backup at 02:00 UTC
- **Weekly:** Retention policy cleanup
- **Monthly:** Restore drill on test environment

## Recovery Contacts
- **Primary:** [Your contact]
- **Secondary:** [Backup contact]
- **Escalation:** [Management contact]

## Recovery Checklist
- [ ] Verify backup integrity
- [ ] Provision recovery environment
- [ ] Restore data from latest backup
- [ ] Update DNS/load balancer configuration
- [ ] Run health checks
- [ ] Notify stakeholders
- [ ] Monitor for 24 hours
- [ ] Document lessons learned
