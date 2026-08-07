# Evens Louis product map

Canonical host: `https://evenslouis.ca`

Code registries:

- Surfaces: `packages/shared-config/src/product-registry.ts`
- All 15 GitHub repos / lanes: `packages/shared-config/src/repo-registry.ts`
- OpenClaw workspace contract: [OPENCLAW_WORKSPACE_CONTRACT.md](./OPENCLAW_WORKSPACE_CONTRACT.md)
- Topic → capability map: [OPENCLAW_TOPIC_CAPABILITY_MAP.md](./OPENCLAW_TOPIC_CAPABILITY_MAP.md)
- Creative loop: [CREATIVE_ENGINEERING_LOOP.md](./CREATIVE_ENGINEERING_LOOP.md)
- WIP program (20 phases): [../../wip-program/README.md](../../wip-program/README.md)
- Hard rules: [../../wip-program/HARD_RULES.md](../../wip-program/HARD_RULES.md)

## Access model

| Role | Access |
|------|--------|
| **Visitor** | `/` portfolio + `/work` catalog (GitHub links / status only) |
| **Client** | Not a tool role — contact / deliverables offline. No console login |
| **Operator** | Only Evens — tools behind Caddy basic_auth (+ app login) |
| **Machines** | n8n webhooks + OpenClaw `/claw/hooks*` (no basic_auth) |

## URL map

| Path | Upstream | Audience | Notes |
|------|----------|----------|-------|
| `/` | `127.0.0.1:3200` Client Engine | public | CE marketing (restored; portfolio parked `:4010`) |
| `/work` | CE `:3200` | public | CE work/case studies |
| `/dashboard`, `/login`, `/ce` | CE `:3200` | operator | App login / product UI |
| `/pro*` | `127.0.0.1:3204` Client Engine | operator | `basePath=/pro` twin |
| `/api/hive*` | `127.0.0.1:3205` ce-hive-bridge | machines | Bearer `CE_HIVE_TOKEN` |
| `/api*` (other) | CE `:3200` | operator/app | Auth.js session APIs |
| `/n8n/*` UI | `127.0.0.1:5678` (strip prefix) | operator | n8n login |
| `/n8n/webhook*`, `/n8n/webhook-test*` | n8n | machines | **No** basic_auth |
| `/healthz` | n8n | public monitor | |
| `/scorpion*` | `127.0.0.1:3003` | operator | Full Next image |
| `/claw/hooks*` | OpenClaw `:18789` | machines | **No** basic_auth |
| `/claw` / `/claw/*` (non-hooks) | OpenClaw `:18789` | operator | Control UI |
| `/insights*` | reserved 503 | — | Stage after Phase 8 (Ph15) |
| `/lightningflow*` | `:3202` / ops `:3203` | parked | Health only; not featured |
| `/builder*` | stub `:3001` | operator | Real builder tree missing |
| Apex `/webhook*` | n8n | machines | No basic_auth |

Legacy: `n8ncloud.tech` webhooks/api/rest/healthz dual-host; UI redirects to `/n8n`.

## Repo lanes (anti-confusion)

| Lane | Repos |
|------|--------|
| **Hive / money core** | `n8n-cursor`, `client-engine`, `philanthropic-ai-agent`, `outer-heaven-backups` |
| **Product candidates** | SENTINEL (`shield-buddies`), ClipEngine, Trendspotter, ProofCheck QC |
| **Side WIP** | AutoFlow Finance, Bookflix, QuickMarket |
| **Hive capability** | Clearfield (feeds SENTINEL), InsightsLM (→ `/insights` later) |
| **Parked** | Monorepo LightningFlow `/lightningflow` |
| **Legacy** | GH `lightning-ui`, GH `lightningflow` stub |

Hard anti-overlap: one money OS (CE), one agent face (OpenClaw/Telegram), one Lightning story (monorepo), one emergency brand (SENTINEL), one stream clipper (ClipEngine).

## Operator password (Caddy basic_auth)

Secrets live **only on the VPS**, never in git. See [OPERATOR_PASSWORD.md](./OPERATOR_PASSWORD.md).

## Hard rules

- Never `docker compose down -v` / volume prune on `n8n-cursor_n8n_data`
- Do not put basic_auth on n8n webhooks or `/claw/hooks*`
- Do not feature LightningFlow or tool URLs on the public portfolio hero
- Do not wipe OpenClaw `SOUL.md` / topic IDs / `openclaw.json` without backup + operator OK
- Future repos default to **side_wip** + **NO_PATH** until promoted in `repo-registry.ts`
- Product candidates stay off apex until their own domain launch
