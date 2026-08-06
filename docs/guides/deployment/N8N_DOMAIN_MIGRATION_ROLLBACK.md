# n8n domain migration — rollback

## What changed (prod VPS)

- Public editor/API: `https://evenslouis.ca/n8n/`
- Image pin: `n8nio/n8n:2.34.1`
- Data volume (unchanged): `n8n-cursor_n8n_data` → `/home/node/.n8n`
- Live project path: `/home/evens/n8n-cursor/docker-compose.yml`
- Caddy strategy (hybrid):
  - `handle_path /n8n*` → `127.0.0.1:5678` (strip prefix)
  - also proxy absolute `/assets*`, `/static*`, `/rest*`, `/webhook*`, `/icon*`, `/favicon.ico`
  - no `N8N_PATH` (path-prefix mode was brittle on 2.x)
- Legacy `n8ncloud.tech`: webhooks/api/rest/healthz proxied; UI redirects to `/n8n`
- Env URLs: `N8N_EDITOR_BASE_URL` / `N8N_PUBLIC_URL` / `WEBHOOK_URL` = `https://evenslouis.ca/n8n(/)`

## Hostinger snapshot

Snapshot created before cutover (expires ~24h). Restore via Hostinger API/panel if needed:

```bash
# list
curl -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
  https://developers.hostinger.com/api/vps/v1/virtual-machines/765579/snapshots
# restore (destructive — use only if required)
curl -X POST -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
  https://developers.hostinger.com/api/vps/v1/virtual-machines/765579/snapshot/restore
```

## Volume backup on VPS

Backups written under `/home/evens/n8n-cursor/backups/pre-migration-*` and `finalize-*` during cutover.
Local API export: `backups/n8n-pre-migration-*/workflows.json` (162 workflows).

Restore volume (container only — never `compose down -v`):

```bash
cd /home/evens/n8n-cursor
docker compose stop n8n
docker run --rm -v n8n-cursor_n8n_data:/data -v "$PWD/backups/<ts>":/backup alpine \
  sh -c 'rm -rf /data/* /data/.[!.]*; tar xzf /backup/n8n-cursor_n8n_data.tar.gz -C /data'
# restore previous compose + Caddyfile from backup, then:
docker compose up -d n8n
# reload Caddy (host):
caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy
```

## Hard rules

1. Never rotate `N8N_ENCRYPTION_KEY`
2. Never rename/recreate `n8n-cursor_n8n_data` empty
3. Never `docker volume prune` / `compose down -v` during rollback
4. Prefer `developers.hostinger.com` API base (api.hostinger.com may 530)

## Smoke after rollback

```bash
curl -fsS https://evenslouis.ca/n8n/healthz
curl -fsS -o /dev/null -w '%{http_code}\n' https://evenslouis.ca/
curl -fsS https://lightningflow.online/ >/dev/null
```
