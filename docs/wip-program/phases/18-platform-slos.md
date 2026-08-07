# Phase 18 — Platform SLOs

**Macro:** Disk/backup/cert/image discipline so launches do not brick the VPS.

**Refs:** `docs/wip-program/DISK_PLAN.md`, `docs/SLO.md`, `outer-heaven-backups`, n8n volumes, CE postgres, Caddy TLS on `evenslouis.ca`

**Exit:** Alerts configured; one weekly prove completed and logged.

## Micro-tasks

- [ ] Disk free-space alert threshold (warn &lt;15%; critical &lt;8% per `DISK_PLAN.md`)
- [ ] Log rotation policy (pm2 / app logs; never delete souls/`n8n_data`)
- [ ] Docker image prune policy with safe list (dangling only by default)
- [ ] CE DB backup SLO + weekly prove
- [ ] n8n logical export SLO + weekly prove
- [ ] OpenClaw workspace backup SLO + weekly prove (`/root/.openclaw/`)
- [ ] Product DB backup SLO (SENTINEL / ProofCheck / Insights as applicable)
- [ ] TLS / Caddy reload drill
- [ ] Image build-elsewhere / pull-to-VPS playbook (low-disk builds)
- [ ] Alert if `n8n_data` volume missing/unhealthy
- [ ] Alert if OpenClaw bind regresses to LAN (`0.0.0.0:18789`)
- [ ] Monthly SLO review checklist (owner: solo operator; log in CE or Scorpion register)
