# VPS disk plan (Phase 0 / 18)

Observed: ~96% used (~4.1G free on ~96G). Heavy Scorpion image builds are unsafe until headroom improves.

## Never delete

- Docker volumes: `n8n_data`, `n8n-cursor_n8n_data`, `evens_n8n-cursor_n8n_data`
- `/root/.openclaw/` workspace markdown (souls, topics, MEMORY, etc.)
- CE postgres volume `client-engine_pgdata` without backup restore prove

## Safe prune order

1. `docker image prune -f` (dangling only)  
2. Remove unused `<none>` / old portfolio rebuild layers after confirming current tags healthy  
3. Truncate large app logs under `/root/.pm2/logs` (rotate, keep last 50MB/file)  
4. Clear `/tmp/h-*`, failed hygiene clones, apt caches in ephemeral containers  
5. Review `outer-heaven-backups` / encrypted dumps older than retention (keep ≥7)  
6. Prefer **build images off-box / CI** and `docker pull` to VPS (Phase 18 playbook)

## Target before Scorpion `Dockerfile.evenslouis` build

- ≥12G free (or build remotely and pull)  
- Confirm `df -h` after prune before `pnpm`/`docker build`

## Alerts (Phase 18)

- Warn &lt;15% free  
- Critical &lt;8% free — freeze image builds
