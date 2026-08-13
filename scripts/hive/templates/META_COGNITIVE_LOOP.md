# Meta-cognitive feedback loop

**Digital shadow, not autopilot.** The hive continuously senses founder intent and criticizes its own stack — then **proposes** infrastructure on **staging** for operator activation.

Tier 3 unchanged: prod deploy, money, client send, secrets, `main` merge — [HARD_RULES.md](../wip-program/HARD_RULES.md).

## Architecture

```
[ Founder signals: Telegram, notes, calendar, docs ]
              │
              ▼ (n8n hive-founder-signal)
       [ AI BRAIN — Scorpion register + missions ]
              │
    ┌─────────┴─────────┐
    ▼                   ▼
 Internal loop      External loop
 (Sunday critique)   (pattern → predictive construct)
    │                   │
    ▼                   ▼
 Forge PR staging    n8n DRAFT (inactive) + manifest stub
    │                   │
    └─────────┬─────────┘
              ▼
    Telegram #alerts — operator approves
```

## Two data streams

| Stream | Source | Webhook / cron | Register jobType |
|--------|--------|----------------|------------------|
| **Performance / criticism** | Telemetry, missions, manifest audit | `hive-meta-critique` + Sunday cron | `ops.meta_critique.proposed` |
| **Founder behavior** | Notes, calendar, chat brain-dump | `hive-founder-signal` | `founder.signal.ingested` |
| **Predictive output** | Pattern detector (in ingest workflow) | `hive-predictive-construct` | `product.predictive_infrastructure.proposed` |

## Internal criticism (Code Quality Review Board)

**Schedule:** Sunday ~11 PM Eastern — workflow `Hive Sunday Meta Critique` (cron Mon 03:00 UTC).

**Does NOT** auto-refactor prod. It:

1. Registers a critique mission with repo list from toolbox registry
2. Sends Telegram with the [critique directive](./META_COGNITIVE_MANDATE.md#critique-directive-for-forge)
3. Forge/OpenClaw opens `agent/meta-critique/<date>` → writes `CRITIQUE.md` on branch → PR **staging only**

## External adaptation (Sensory network)

POST founder signals to ecosystem route or direct webhook:

```bash
curl -X POST "https://evenslouis.ca/webhook/hive-ecosystem-route" \
  -H "Content-Type: application/json" \
  -H "X-Hive-Secret: $HIVE_WEBHOOK_SECRET" \
  -d '{
    "route": "founder-signal",
    "correlationId": "signal-note-001",
    "sourceRepo": "n8n-cursor",
    "payload": {
      "signalType": "note",
      "source": "obsidian",
      "text": "Launching marketing campaign next Monday — need lead scoring",
      "tags": ["launch", "marketing"]
    }
  }'
```

**Planned connectors (vertical slices):**

| Sensor | Integration | Status |
|--------|-------------|--------|
| Command console | Telegram `#general` / OpenClaw | Active — use tools + register |
| Notebook | Obsidian/Notion webhook → n8n | Stub — POST `founder-signal` |
| Calendar | Google Calendar n8n node | Stub — POST `founder-signal` |

## Predictive construction

When ingest detects strategic intent (keywords + confidence), it forwards to `predictive-construct`:

- Formulates infrastructure thesis
- Injects **inactive** n8n workflow (`DRAFT_PENDING_REVIEW: …`) via API
- Registers `need_hitl`
- Telegram: approve in n8n UI + merge staging PR for manifest/repo scaffold

**Never** auto-activates workflows on prod n8n. **Never** auto-deploys repos.

Protocol: [PREDICTIVE_CONSTRUCTION_PROTOCOL.yaml](./PREDICTIVE_CONSTRUCTION_PROTOCOL.yaml)

## System mandate

Load for all brain agents: [META_COGNITIVE_MANDATE.md](./META_COGNITIVE_MANDATE.md)

Sync to OpenClaw: `scripts/hive/templates/META_COGNITIVE_MANDATE.md`

## Import

```bash
bash scripts/hive/n8n-import-meta-cognitive.sh   # needs N8N_API_KEY
```

## Related

[DUAL_LOOP_ENGINE.md](./DUAL_LOOP_ENGINE.md) · [TELEMETRY_OVERWATCH.md](./TELEMETRY_OVERWATCH.md) · [SELF_EVOLUTION.md](./SELF_EVOLUTION.md) · [MOGUL_MODE.md](./MOGUL_MODE.md)
