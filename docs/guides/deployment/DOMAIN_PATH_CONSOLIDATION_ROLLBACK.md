# Domain path consolidation rollback

**RESTORE (2026-08-07):** Operator `basic_auth` gates and portfolio-on-apex were rolled back.
Live routing matches the pre-gate cutover (Client Engine on apex). Do not re-gate without owner approval.

Canonical hosts (restored):

- `https://evenslouis.ca/` — Client Engine (`:3200`)
- `https://evenslouis.ca/pro` — Client Engine pro (`:3204`)
- `https://evenslouis.ca/scorpion` — Scorpion (`:3003`)
- `https://evenslouis.ca/n8n/` — n8n UI + webhooks
- `https://evenslouis.ca/lightningflow` — LightningFlow web

See also: [EVENSLOUIS_PRODUCT_MAP.md](./EVENSLOUIS_PRODUCT_MAP.md)

## Live topology (restored ungated)

| Path | Upstream | Notes |
|------|----------|-------|
| `/` | `127.0.0.1:3200` | Client Engine (apex) |
| `/n8n/*` UI | `127.0.0.1:5678` | Strip prefix + `base-path.js` |
| `/n8n/webhook*` | `127.0.0.1:5678` | Machine path |
| `/lightningflow*` | `127.0.0.1:3202` | Web app |
| `/lightningflow/ops*` | `127.0.0.1:3203` | Ops |
| `/pro*` | `127.0.0.1:3204` | Client Engine pro |
| `/scorpion*` | `127.0.0.1:3003` | Scorpion `basePath=/scorpion` |
| `/api*` | `127.0.0.1:3200` | CE APIs |

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

## Known restore fixes (keep these)

1. **Apex `/api*` must proxy to Client Engine `:3200`**, not n8n `:5678`.
   - n8n APIs stay under `/n8n/*` (`handle_path`) and on `n8ncloud.tech` dual-host routes.
   - If apex login/dashboard auth returns n8n HTML or Auth.js fails, check this first.
2. **`/pro` `DATABASE_URL` must use the Docker DNS name `postgres`**, never a hardcoded bridge IP.
   - Hardcoded IPs break after container recreate (Auth.js `Configuration` / Prisma unreachable).
3. **`/builder` source (`./builder`) is not in the client-engine git repo** (excluded by design).
   - Restoring `:3001` requires the out-of-repo builder tree or an existing image; do not treat path cutover as the cause if builder was never on disk.
