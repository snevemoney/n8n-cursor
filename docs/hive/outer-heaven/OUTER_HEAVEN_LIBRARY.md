# Outer Heaven Living Intelligence Library

**LLM Wiki (agents):** [[OUTER_HEAVEN_LLM_WIKI]] — agent → job → docs/THEMES.

**Primary edit surface:** Obsidian vault `00_Outer_Heaven/` (operator)  
**Agent read surface:** git mirror at `docs/hive/outer-heaven/` in n8n-cursor monorepo  
**Machine SSOT for repo facts:** `packages/shared-config/src/repo-registry.ts`

---

## Philosophy — chaos → capture → patterns → survivability

Software work across Mac, VPS, and many AI agents is inherently chaotic. That is normal.

This library does **not** force premature order. It:

1. **Captures** everything (chronicle append-only)
2. **Catalogs** projects (DNA map)
3. **Promotes patterns** weekly into `PATTERNS/SURVIVORS.md` (human-reviewed)
4. **Survives** what works in personal and business life

Think of it as a living organism: memory grows from every chat and commit; evolution happens when patterns prove themselves in the real world.

---

## Operator surfaces (daily vs fallback)

| Need | Daily (primary) | Fallback (24×7) |
|------|-----------------|-----------------|
| Build / refactor code | **Cursor** on Mac | Forge agent (Grok / OpenClaw) |
| Ops commands, smokes, reports, extreme cases | **Grok Bot** (9 agents) | Telegram Outer Heaven topics |
| Approve money / builds | https://evenslouis.ca/pro | — (Tier 3 operator only) |
| Inspect automations | https://evenslouis.ca/n8n | n8n cron + watchdog |
| Register / golden paths (API) | https://evenslouis.ca/scorpion/api/hive/* | Grok browser + hive-watchdog |
| Scorpion UI | Extreme fallback only | — |
| Public brand | https://evenslouis.ca/ + `/work` | — |

See also: [[../01_Strategic_Intent/Ecosystem Manifest]] · `docs/hive/DAY_IN_THE_LIFE.md`

---

## Systems map

| System | URL / path | Role |
|--------|------------|------|
| Scorpion | https://evenslouis.ca/scorpion/api/hive/* | Backend register / golden paths (Grok reads API; UI = fallback) |
| Client Engine | https://evenslouis.ca/pro | Money desk (Tier 3) |
| n8n | https://evenslouis.ca/n8n | Automation factory (**never n8ncloud.tech**) |
| OpenClaw | https://evenslouis.ca/claw | Telegram gateway (fallback face) |
| Grok Bot | Mac local (~/.grokbot/) | Primary operator console (9 agents) — solo or with Cursor |
| VPS | root@69.62.66.78 | Prod host; repo `/root/domain-paths/n8n-cursor` |

**Zero-loss:** never delete data, volumes, souls/topics, or secrets without explicit operator approval.

---

## Agent roster

### Grok Bot (Mac — daily coordination)

| Agent | Lane |
|-------|------|
| Big Boss | Rollup + delegate |
| Watchdog Ops | Health + smokes (read-only) |
| Life & Business Ops | Approved fix scripts |
| HITL Operator | Tier 3 queue links |
| n8n Automation | evenslouis.ca/n8n catalog |
| CE & Leads | Read-only /pro |
| Telegram Console | Shortcut parity |
| Forge Builder | smoke-ce-builder (stub until /pro) |
| Scout Lead Gen | Read-only research |

### Telegram OpenClaw (VPS — fallback / 24×7)

17 agents across topics. Roster in `HIVE_CONTEXT.md` on Big Boss workspace. Do not renumber Telegram topic IDs.

---

## Project index

Machine registry: `packages/shared-config/src/repo-registry.ts`  
Narrative encyclopedia: `docs/hive/PRODUCT_ENCYCLOPEDIA.md`

### Hive core

- [[PROJECTS/n8n-cursor]]
- [[PROJECTS/client-engine]]
- [[PROJECTS/philanthropic-ai-agent]]
- [[PROJECTS/outer-heaven-backups]]

### Product candidates

- [[PROJECTS/shield-buddies]]
- [[PROJECTS/clipengine]]
- [[PROJECTS/trendspotter-ai]]
- [[PROJECTS/proof-qc-assist]]

### Side WIP / capability / parked

- [[PROJECTS/autoflow-finance]]
- [[PROJECTS/book-reimagined]]
- [[PROJECTS/quick-list-hub-42]]
- [[PROJECTS/clearfield-evidence-flow]]
- [[PROJECTS/insights-lm-private]]
- [[PROJECTS/lightningflow-monorepo]]

See `PROJECTS/_discovered.md` for PC/VPS orphans pending promotion.

---

## Hivemind DNA (personality everywhere)

| Doc | Purpose |
|-----|---------|
| `HIVEMIND_DNA.md` | Paste into ChatGPT, Claude, any AI — unified behavior |
| `HIVEMIND_DNA_PASTE.txt` | Compact version for tight character limits |
| `SURVIVAL_CONTRACT.md` | ≥20 hrs/week business, agent lab, quiet money path |
| `NORTH_STAR.md` | Long-term one-person + agents thesis |
| `AGENTS_LAB.md` | Build / improve / retire / research agents |
| `WEEKLY_SCOREBOARD.md` | Business-hours rollup (auto from extract-patterns) |
| `AUTOPILOT_CONTRACT.md` | 9–5 silent rules; Grok notify-only |
| `NOTIFICATION_MATRIX.md` | Event → Grok first → fallback channels |
| `GROK_CURSOR_TEAM.md` | Solo Grok / solo Cursor / team handoff |
| `WEB_LEARNING_LOOP.md` | Bounded read-only research → METHODS drafts |

---

## Cross-app capture (ChatGPT, Claude, any app)

| Layer | How |
|-------|-----|
| INBOX | Paste to `INBOX/*.md` → `ingest-inbox.py` |
| Mac Shortcut | See `docs/hive/runbooks/outer-heaven-mac-shortcut.md` |
| Auto miner | `mine-transcripts.py` (Cursor, Grok, ChatGPT/Claude exports) |
| Cycle | `run-capture-cycle.sh` every 15 min (launchd optional) |

Config paths: `scripts/hive/outer-heaven/capture-sources.yaml`

---

## Methods library

How Evens does X — promoted workflows in `METHODS/`. See `METHODS/README.md`.

---

## Chronicle protocol (living save file)

**Location:** `CHRONICLE/YYYY-MM.md` (current month shard)

- Append-only — auto-miner and agents never delete entries
- Sources: Cursor, Grok, Scorpion, **ChatGPT/Claude exports**, INBOX paste, manual append, n8n `hive-chronicle-ingest`
- Secrets stripped before append
- Index: `TRANSCRIPT_INDEX.md` (idempotency by transcript hash)

**Read latest:** open current month file in `CHRONICLE/`.

**Manual append:**

```bash
bash scripts/hive/outer-heaven/append-chronicle.sh \
  --source manual --project n8n-cursor --tags "hive,library" \
  "Your one-line summary here"
```

---

## Patterns protocol

**Location:** `PATTERNS/SURVIVORS.md`

- Weekly job: `python3 scripts/hive/outer-heaven/extract-patterns.py`
- New sections marked `DRAFT_PENDING_REVIEW` until operator approves
- Approved patterns become agent canon; rejected patterns stay in chronicle only

---

## Load tiers for agents

1. **This file** — always load first
2. **`HIVEMIND_DNA.md`** — personality pack
3. Latest `CHRONICLE/YYYY-MM.md` tail — recent context
4. `SURVIVAL_CONTRACT.md` + `NORTH_STAR.md`
5. `PATTERNS/SURVIVORS.md` — approved survivability rules
6. Deep canon: `docs/program-design/AGENT_LOAD_INDEX.md` (task-specific)

Grok: also read `docs/hive/GROKBOT_ACCESS.md` for URLs and VPS paths.

---

## Related docs

| Doc | Purpose |
|-----|---------|
| `HIVEMIND_DNA.md` | Personality for every AI app |
| `SURVIVAL_CONTRACT.md` | 20hr/week + agent lab rules |
| `AGENTS_LAB.md` | Build/improve/retire/research agents |
| `METHODS/` | Reusable workflows |
| `OUTER_HEAVEN_GLOSSARY.md` | Naming: Outer Heaven vs Philanthropy vs Grok |
| `OUTER_HEAVEN_LIBRARY_SPEC.md` | Maintainer spec (sync, capture, rotation) |
| `docs/hive/GROKBOT_ACCESS.md` | Operational access map |
| `docs/hive/META_COGNITIVE_MANDATE.md` | Pattern promotion + founder signals |

### CE → Grok (read-only study)
- [[CONTENT/ai-partner-scoring-prototype-ladder/CE-FEATURE-TO-AGENTS]]
- [[METHODS/business-ce-without-ce-money-path]]
- [[METHODS/business-ce-flywheel-to-agents]]
