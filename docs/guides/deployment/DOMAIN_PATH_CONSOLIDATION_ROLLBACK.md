# Domain path consolidation rollback

Canonical hosts after cutover:

- `https://evenslouis.ca/` — public portfolio (visitors)
- `https://evenslouis.ca/n8n/` (from `n8ncloud.tech`) — operator + webhooks
- `https://evenslouis.ca/pro` (from `evenslouis.pro`) — Client Engine, operator only
- `https://evenslouis.ca/scorpion` — Scorpion ops, operator only
- `https://evenslouis.ca/lightningflow` — parked, operator gated

See also: [EVENSLOUIS_PRODUCT_MAP.md](./EVENSLOUIS_PRODUCT_MAP.md), [OPERATOR_PASSWORD.md](./OPERATOR_PASSWORD.md)

## Live topology (path dual-host)

| Path | Upstream | Notes |
|------|----------|-------|
| `/` | `127.0.0.1:4010` | Public portfolio |
| `/n8n/*` UI | `127.0.0.1:5678` | Strip prefix + `base-path.js`; **basic_auth** |
| `/n8n/webhook*` | `127.0.0.1:5678` | **No** basic_auth |
| `/lightningflow*` | `127.0.0.1:3202` | Parked; **basic_auth** |
| `/lightningflow/ops*` | `127.0.0.1:3203` | Ops; **basic_auth** |
| `/pro*` | `127.0.0.1:3204` | Client Engine; **basic_auth** |
| `/scorpion*` | `127.0.0.1:3003` | Scorpion `basePath=/scorpion`; **basic_auth** |
| `/api*` | `127.0.0.1:3200` | CE APIs; **basic_auth** |

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
