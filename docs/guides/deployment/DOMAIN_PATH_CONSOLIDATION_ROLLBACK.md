# Domain path consolidation rollback

Canonical hosts after cutover:

- `https://evenslouis.ca/n8n/` (from `n8ncloud.tech`)
- `https://evenslouis.ca/lightningflow` (from `lightningflow.online` + subdomains)
- `https://evenslouis.ca/pro` (from `evenslouis.pro`)

## Live topology (path dual-host)

| Path | Upstream | Notes |
|------|----------|-------|
| `/n8n/*` | `127.0.0.1:5678` | `handle_path` strip + `base-path.js` override |
| `/lightningflow*` | `127.0.0.1:3202` | LightningFlow web (`NEXT_PUBLIC_BASE_PATH=/lightningflow`) |
| `/lightningflow/ops*` | `127.0.0.1:3203` | Ops panel |
| `/lightningflow/_landing/*` | `127.0.0.1:3201` | Landing asset prefix |
| `/pro*` | `127.0.0.1:3204` | Isolated Client Engine build (original app stays on `:3200`) |
| `/` (apex) | `127.0.0.1:3200` | Unchanged Client Engine root app |

Compose files:

- `infra/docker/docker-compose.evenslouis-paths.yml` → LightningFlow path services
- `/root/client-engine/docker-compose.yml` service `pro` → `/pro` on `:3204`

## Rollback Caddy only

1. Restore pre-path backup on the VPS:
   - `/root/domain-backups/Caddyfile.pre-paths-*`
2. `caddy validate --config /etc/caddy/Caddyfile && caddy reload --config /etc/caddy/Caddyfile`
3. Confirm apex + n8n still healthy:
   - `curl -fsS https://evenslouis.ca/healthz`
   - `curl -fsS -o /dev/null -w '%{http_code}\n' https://evenslouis.ca/n8n/`

## Rollback `/pro` service only

```bash
cd /root/client-engine
docker compose stop pro
# optional: docker compose rm -f pro
```

Root Client Engine on `:3200` is untouched. Point Caddy `/pro*` back to `:3200` only if you intentionally want the non-prefixed app to answer `/pro` (not recommended).

## Rollback LightningFlow path services

```bash
cd /root/domain-paths/n8n-cursor
docker compose -f infra/docker/docker-compose.evenslouis-paths.yml stop
```

Restore previous `lightningflow.online` Caddy block from `/root/domain-backups/` if browser traffic must return to the old host immediately.

## Safety rules

- Never run `docker compose down -v` for these projects during rollback.
- Never prune named volumes (`n8n_data`, `client-engine_pgdata`, `client-engine_redisdata`).
- Build-cache prune (`docker builder prune`) is safe; volume prune is not.
