# Evens Louis product map

Canonical host: `https://evenslouis.ca`

## Access model

| Role | Access |
|------|--------|
| **Visitor** | `/` portfolio only (work, contact) |
| **Client** | Not a tool role — contact / deliverables offline. No console login |
| **Operator** | Only Evens — all tools behind Caddy basic_auth (+ app login) |

Code registry: `packages/shared-config/src/product-registry.ts`

## URL map

| Path | Upstream | Audience | Notes |
|------|----------|----------|-------|
| `/` | `127.0.0.1:4010` portfolio | public | Brand front door |
| `/portfolio-healthz` | portfolio `/healthz` | public | Apex health without colliding n8n `/healthz` |
| `/pro*` | `127.0.0.1:3204` Client Engine | operator | Entire tree gated |
| `/n8n/*` UI | `127.0.0.1:5678` (strip prefix) | operator | basic_auth + n8n login |
| `/n8n/webhook*`, `/n8n/webhook-test*` | n8n | machines | **No** basic_auth |
| `/n8n/healthz` | n8n | public monitor | No basic_auth |
| `/scorpion*` | `127.0.0.1:3003` | operator | `NEXT_PUBLIC_BASE_PATH=/scorpion` |
| `/lightningflow*` | `:3202` / ops `:3203` | parked + operator gate | Keep alive; not featured |
| `/builder*` | `:3001` | operator | May 502 until image exists |
| `/api*` | Client Engine `:3200` | operator | Gated; CE path APIs also under `/pro` |
| Apex `/webhook*` | n8n | machines | No basic_auth |

Legacy: `n8ncloud.tech` webhooks/api/rest/healthz dual-host; UI redirects to `/n8n`.

## Operator password (Caddy basic_auth)

Secrets live **only on the VPS**, never in git.

1. Generate a long random password; store it in your password manager.
2. On the VPS:

```bash
caddy hash-password --plaintext 'YOUR_PASSWORD'
# → $2a$14$....
```

3. Write `/etc/caddy/ops.env` (mode `600`):

```bash
OPS_USER=evens
OPS_PASS_HASH='$2a$14$....'
```

4. Point Caddy’s systemd unit at that file (`EnvironmentFile=/etc/caddy/ops.env`), then:

```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```

5. Browser flow: Operator basic_auth prompt → then n8n or Client Engine login.

**Reset if locked out:** SSH/Hostinger console → edit `/etc/caddy/ops.env` with a new hash → `systemctl reload caddy`.

## Hard rules

- Never `docker compose down -v` / volume prune on `n8n-cursor_n8n_data`
- Do not put basic_auth on n8n webhooks
- Do not feature LightningFlow or tool URLs on the public portfolio hero
- Future repos default to **operator** paths until deliberately made public
