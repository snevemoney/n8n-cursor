# VPS disk plan (Phase 0 / 18)

Observed baseline: ~96% used (~4.1G free). Do not run heavy `Dockerfile.evenslouis` builds until ≥12G free or build remotely and pull.

## Never delete

- Volumes: `n8n_data`, `n8n-cursor_n8n_data`, `evens_n8n-cursor_n8n_data`
- `/root/.openclaw/` workspace markdown
- `client-engine_pgdata` without restore prove

## Safe prune order

1. `docker image prune -f` (dangling)  
2. Rotate `/root/.pm2/logs` (keep last ~50MB/file)  
3. Clear `/tmp/h-*` hygiene clones  
4. Review encrypted OH backups older than retention (≥7 kept)  
5. Prefer CI build + `docker pull` (Phase 18)

## Alerts

- Warn &lt;15% free · Critical &lt;8% free — freeze image builds
