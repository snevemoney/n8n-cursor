# n8n-cursor Production Ops

> All commands are **DRY-RUN** by default. To actually apply changes: prefix with `DRY_RUN=0`.

## Quick Start
```bash
make status      # see containers
DRY_RUN=0 make up
DRY_RUN=0 make down
```

## Branches (How we work)

| Branch          | Purpose                                   |
|-----------------|-------------------------------------------|
| 00-sandbox      | Experiments/spikes                        |
| 01-env-setup    | DevOps & environment bootstrap/CI         |
| 02-repo-guardian| Repo structure/guards/scripts             |
| 03-agent-dev    | Agent features (tools, memory, parsing)   |
| 04-bug-fixes    | Fixes & polish                            |
| 04-staging      | Integration testing before prod           |
| main            | Production (protected)                    |

**Protocol:** Work on a branch → PR to `04-staging` → when green → PR to `main`.
Every PR must pass: `make guard && make fmt && make lint && make wf-validate && make doctor`.

## Deploy to Staging
```bash
# Create PR to 04-staging branch
# GitHub Actions will auto-deploy when merged
```

## Promote to Production
```bash
# Create PR from 04-staging → main
# GitHub Actions will auto-deploy with backups
```

## Health Check & Rollback
```bash
make health                    # comprehensive health check
make status                    # service status
make doctor                    # system diagnostics

# Rollback (if needed)
export MASTER_UNLOCK="your_key"
DRY_RUN=0 make db-restore FILE="backup.sql.gz"
```

## Security & Backups
```bash
make secure-ssh               # SSH hardening guide
make tls-check               # TLS setup guide
DRY_RUN=0 make db-backup     # database backup
DRY_RUN=0 make n8n-backup    # workflows backup
```

## Workflows
```bash
make wf-validate
make wf-dedupe
```

## Monitoring
```bash
make health                  # full health check
make ports                   # port usage check
curl https://your-domain.com/healthz  # health endpoint
```

## Create Things
```bash
make new-script NAME="rotate-logs" DESC="Rotate & compress"
make new-workflow NAME="Customer Sync"
```

## Master unlock (emergency)
```bash
export MASTER_UNLOCK=<your value>   # stored only in .env, never committed
```

## Documentation
- **Setup**: `docs/READ_ME_FIRST.md` - Start here
- **Security**: `docs/SECURITY_CHECKLIST.md` 
- **Backups**: `docs/BACKUPS.md`
- **Monitoring**: `docs/MONITORING.md`
- **Launch**: `docs/GO_NO_GO.md` - Production checklist
- **Protocol**: `docs/PROTOCOL_README.md` - Operations guide
