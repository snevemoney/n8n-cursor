# OpenClaw topic → capability map (least privilege)

Maps **existing** Telegram topic IDs (see [OPENCLAW_WORKSPACE_CONTRACT.md](./OPENCLAW_WORKSPACE_CONTRACT.md)) to which systems agents may call. Do **not** renumber topics.

Legend: `R` = read · `W` = write/safe-act · `A` = approval-gated (HITL) · `—` = no access

| Topic | ID | Agent(s) | n8n | Client Engine | Scorpion | Insights (later) |
|-------|-----|----------|-----|---------------|----------|------------------|
| `#general` | 1 | BigBoss | R | R | R/W ops log | R |
| `#research` | 8 | Sigint | R | — | R knowledge | R/W ingest |
| `#autoresearch` | 9 | LiquidSnake | R | — | R | R |
| `#builds` | 10 | Forge | R/W trigger | R notes | R/W | — |
| `#knowledge` | 11 | library | — | — | R/W | R/W |
| `#crons` | 12 | Naomi | R health | — | R health | — |
| `#alerts` | 13 | all (notify) | R | R | W incident | — |
| `#ledger` | 162 | Ledger | R | R/A money | R | — |
| `#council` | 163 | Solid/Venom | R | R | R/W council | R |
| `#communications` | 164 | Herald | R | — | R | — |
| `#business` | 417 | Business | R/W | R/W/A | R | — |
| `#scout` | 418 | Scout | R | W leads | — | — |
| `#trend` | 419 | Radar | R | — | R | R |
| `#writer` | 420 | Voice | R | R notes | — | — |
| `#designer` | 421 | Designer | — | R | — | — |
| `#social` | 422 | Social | R/W | — | — | — |
| `#creator` | 423 | Creator | R/W | — | — | — |
| `#live-activity` | 424 | all (log) | — | — | W breadcrumb | — |
| `#crm` | 1651 | Ocelot | R | R/W/A | — | — |

## Hook contracts

### Machines → OpenClaw

`POST https://evenslouis.ca/claw/hooks*` (no basic_auth)

- Signed shared token (VPS env / OpenClaw hooks config) — same idea as n8n webhook auth
- Used by n8n workflows and CE workers to notify agents / wake topics
- Dual-bind gateway on localhost; Caddy reverse_proxies only

### OpenClaw → n8n

- Prefer n8n webhooks: `https://evenslouis.ca/n8n/webhook/...` or apex `/webhook...`
- Long jobs: fire-and-forget webhook + result callback to `/claw/hooks`

### OpenClaw → Client Engine

- Operator APIs under `/pro` or apex `/api*` (require machine credentials, not browser basic_auth bypass for humans)
- Money/send/deploy actions queue for HITL in CE — agents do not silent-spend

### MCP broker rule

- **One broker** (prefer n8n MCP or Scorpion MCP) holds secrets
- OpenClaw/philanthropic tools call the broker; agents do **not** each store every API key
- See [CREATIVE_ENGINEERING_LOOP.md](./CREATIVE_ENGINEERING_LOOP.md)

## HITL (always)

Spend · client-facing send · production deploy · delete data · rotate secrets · edit `openclaw.json`
