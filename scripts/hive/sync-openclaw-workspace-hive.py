#!/usr/bin/env python3
"""Sync Outer Heaven OpenClaw workspaces with hive context (2026-08). Append-only on Big Boss SOUL/TOOLS."""
from __future__ import annotations

import re
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
BUILD_PHILOSOPHY_SRC = Path(__file__).resolve().parent / "templates" / "BUILD_PHILOSOPHY.md"
OPERATIONAL_MANDATE_SRC = Path(__file__).resolve().parent / "templates" / "OPERATIONAL_MANDATE.md"
SOFTWARE_YAML_SRC = REPO_ROOT / "docs" / "hive" / "SOFTWARE_SUCCESS_PHILOSOPHY.yaml"
MANDATE_YAML_SRC = REPO_ROOT / "docs" / "hive" / "OPERATIONAL_MANDATE.yaml"
EMPIRE_SECRETS_SRC = Path(__file__).resolve().parent / "templates" / "EMPIRE_SECRETS.md"
EMPIRE_YAML_SRC = REPO_ROOT / "docs" / "hive" / "EMPIRE_SECRETS.yaml"
AUTONOMOUS_FACTORY_SRC = Path(__file__).resolve().parent / "templates" / "AUTONOMOUS_FACTORY.md"
AUTONOMOUS_FACTORY_DOC = REPO_ROOT / "docs" / "hive" / "AUTONOMOUS_FACTORY.md"
NOVICE_ARCHITECT_SRC = Path(__file__).resolve().parent / "templates" / "NOVICE_ARCHITECT.md"
NOVICE_ARCHITECT_DOC = REPO_ROOT / "docs" / "hive" / "NOVICE_ARCHITECT.md"
SELF_EVOLUTION_SRC = Path(__file__).resolve().parent / "templates" / "SELF_EVOLUTION.md"
SELF_EVOLUTION_DOC = REPO_ROOT / "docs" / "hive" / "SELF_EVOLUTION.md"
SELF_EVOLUTION_PROTOCOL_SRC = Path(__file__).resolve().parent / "templates" / "SELF_EVOLUTION_PROTOCOL.md"
MOGUL_MODE_SRC = Path(__file__).resolve().parent / "templates" / "MOGUL_MODE.md"
MOGUL_MODE_DOC = REPO_ROOT / "docs" / "hive" / "MOGUL_MODE.md"
MOGUL_PROTOCOL_SRC = Path(__file__).resolve().parent / "templates" / "MOGUL_PROTOCOL.md"
MULTI_REPO_GRID_SRC = Path(__file__).resolve().parent / "templates" / "MULTI_REPO_GRID.md"
MULTI_REPO_GRID_DOC = REPO_ROOT / "docs" / "hive" / "MULTI_REPO_GRID.md"
OUTER_HEAVEN_LIBRARY_SRC = REPO_ROOT / "docs" / "hive" / "outer-heaven" / "OUTER_HEAVEN_LIBRARY.md"
OUTER_HEAVEN_GLOSSARY_SRC = REPO_ROOT / "docs" / "hive" / "outer-heaven" / "OUTER_HEAVEN_GLOSSARY.md"
HIVEMIND_DNA_SRC = REPO_ROOT / "docs" / "hive" / "outer-heaven" / "HIVEMIND_DNA.md"
SURVIVAL_CONTRACT_SRC = REPO_ROOT / "docs" / "hive" / "outer-heaven" / "SURVIVAL_CONTRACT.md"
AUTOPILOT_CONTRACT_SRC = REPO_ROOT / "docs" / "hive" / "outer-heaven" / "AUTOPILOT_CONTRACT.md"
NOTIFICATION_MATRIX_SRC = REPO_ROOT / "docs" / "hive" / "outer-heaven" / "NOTIFICATION_MATRIX.md"
GROK_CURSOR_TEAM_SRC = REPO_ROOT / "docs" / "hive" / "outer-heaven" / "GROK_CURSOR_TEAM.md"

BB = Path("/root/.openclaw/workspace-bigboss")
STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%d")

TIER2_TOOLS_MARKER = "## Tier 2 operator console (2026-08-08)"
TIER2_TOOLS_BLOCK = """
## Tier 2 operator console (2026-08-08)

Philanthropy hive tools — use via `POST /api/agent` or natural language in #general.

| Tool | When to use |
|------|-------------|
| `n8n_list_workflows` | List n8n workflows + catalog trigger names (`limit`) |
| `n8n_trigger_catalog_webhook` | Fire a **catalog-only** webhook (`name`, `payload`, `correlationId?`). HITL rows need `operatorConfirm: true` |
| `ce_list_actions` | CE HITL / audit queue (`limit`) |
| `ce_approve_action` | Resolve queue row approve (`actionId`, `note?`) — ledger only; money still needs `/pro` |
| `ce_reject_action` | Resolve queue row reject (`actionId`, `note?`) |
| `scorpion_list_missions` | Recent hive missions (`limit`) |
| `hive_send_report` | Golden paths (`skipAlert: true` in #general) |

**Instant Telegram (no LLM):** `queue` · `workflows` · `missions` · `hive report` · `status` · `help`

Catalog: `/opt/philanthropy/config/n8n-catalog.json`
"""

TIER3_TOOLS_MARKER = "## Tier 3 HITL — never from Telegram (2026-08-08)"
TIER3_TOOLS_BLOCK = """
## Tier 3 HITL — never from Telegram (2026-08-08)

Money / deploy / secrets / client send **never execute** from chat. Use `hitl_propose_action` to queue; complete on `/pro` or SSH. Shortcut: `hitl`. Docs: hub `docs/hive/TIER3_HITL.md`.
"""

ROLE_TOOLS_MARKER = "## Hive tools for your role (2026-08-09)"

ROLE_TOOL_INTRO = """
Always send `agentId` in `POST /api/agent` body. Tier 3 money/deploy/send stays propose-only (`hitl_propose_action`). Catalog: `/opt/philanthropy/config/n8n-catalog.json`. Matrix: hub `docs/hive/AGENT_TOOL_MATRIX.md`.
"""


def _role_block(agent_id: str, role_line: str, tools: list[str]) -> str:
    rows = "\n".join(f"| `{t}` | Your role grant |" for t in tools)
    return f"""
## Hive tools for your role (2026-08-09)

**Role:** {role_line}
**agentId:** `{agent_id}` — required on every hive tool call.

| Tool | Notes |
|------|-------|
{rows}
{ROLE_TOOL_INTRO.strip()}
"""


AGENT_TOOL_BLOCKS: dict[str, str] = {
    "solidsnake": _role_block(
        "solidsnake",
        "Council critic — read-only hive visibility",
        [
            "scorpion_health",
            "hitl_gate_status",
            "hitl_propose_action",
            "scorpion_list_missions",
            "scorpion_obsidian_context",
            "n8n_list_workflows",
            "n8n_get_execution",
        ],
    ),
    "venomsnake": _role_block(
        "venomsnake",
        "Council critic — read-only hive visibility",
        [
            "scorpion_health",
            "hitl_gate_status",
            "hitl_propose_action",
            "scorpion_list_missions",
            "scorpion_obsidian_context",
            "n8n_list_workflows",
            "n8n_get_execution",
        ],
    ),
    "liquidsnake": _role_block(
        "liquidsnake",
        "Autoresearch — experiments + register outcomes",
        [
            "scorpion_health",
            "hitl_gate_status",
            "hitl_propose_action",
            "scorpion_list_missions",
            "scorpion_obsidian_context",
            "n8n_list_workflows",
            "n8n_get_execution",
            "scorpion_register_outcome",
        ],
    ),
    "sigint": _role_block(
        "sigint",
        "Research intel — experiments + register outcomes",
        [
            "scorpion_health",
            "hitl_gate_status",
            "hitl_propose_action",
            "scorpion_list_missions",
            "scorpion_obsidian_context",
            "n8n_list_workflows",
            "n8n_get_execution",
            "scorpion_register_outcome",
        ],
    ),
    "radar": _role_block(
        "radar",
        "Trend scout — experiments + register outcomes",
        [
            "scorpion_health",
            "hitl_gate_status",
            "hitl_propose_action",
            "scorpion_list_missions",
            "scorpion_obsidian_context",
            "n8n_list_workflows",
            "n8n_get_execution",
            "scorpion_register_outcome",
        ],
    ),
    "naomi": _role_block(
        "naomi",
        "Infra ops — crons, health smokes, golden paths",
        [
            "scorpion_health",
            "hitl_gate_status",
            "hitl_propose_action",
            "scorpion_list_missions",
            "scorpion_obsidian_context",
            "n8n_list_workflows",
            "n8n_get_execution",
            "scorpion_register_outcome",
            "hive_send_report",
            "n8n_trigger_catalog_webhook",
        ],
    ),
    "herald": _role_block(
        "herald",
        "Comms QA — ecosystem-route comms + health smokes",
        [
            "scorpion_health",
            "hitl_gate_status",
            "hitl_propose_action",
            "scorpion_list_missions",
            "scorpion_obsidian_context",
            "n8n_list_workflows",
            "n8n_get_execution",
            "scorpion_register_outcome",
            "hive_send_report",
            "n8n_trigger_catalog_webhook",
        ],
    ),
    "forge": _role_block(
        "forge",
        "Builder — error-heal owner; catalog webhooks only",
        [
            "scorpion_health",
            "hitl_gate_status",
            "hitl_propose_action",
            "scorpion_list_missions",
            "scorpion_obsidian_context",
            "n8n_list_workflows",
            "n8n_get_execution",
            "scorpion_register_outcome",
            "n8n_trigger_catalog_webhook",
        ],
    ),
    "ledger": _role_block(
        "ledger",
        "Finance audit — CE ledger + read council",
        [
            "scorpion_health",
            "hitl_gate_status",
            "hitl_propose_action",
            "scorpion_list_missions",
            "scorpion_obsidian_context",
            "n8n_list_workflows",
            "n8n_get_execution",
            "ce_list_actions",
            "ce_lookup_lead",
            "ce_resolve_action",
            "ce_approve_action",
            "ce_reject_action",
            "scorpion_register_outcome",
        ],
    ),
    "business": _role_block(
        "business",
        "Business squad — CRM read + register",
        [
            "scorpion_health",
            "hitl_gate_status",
            "hitl_propose_action",
            "scorpion_list_missions",
            "scorpion_obsidian_context",
            "n8n_list_workflows",
            "n8n_get_execution",
            "ce_list_actions",
            "ce_lookup_lead",
            "scorpion_register_outcome",
        ],
    ),
    "ocelot": _role_block(
        "ocelot",
        "CRM — leads + ce-lead route (HITL-flagged webhooks)",
        [
            "scorpion_health",
            "hitl_gate_status",
            "hitl_propose_action",
            "scorpion_list_missions",
            "scorpion_obsidian_context",
            "n8n_list_workflows",
            "n8n_get_execution",
            "ce_list_actions",
            "ce_lookup_lead",
            "scorpion_register_outcome",
            "n8n_trigger_catalog_webhook",
        ],
    ),
    "scout": _role_block(
        "scout",
        "Lead gen — lookup leads + register",
        [
            "scorpion_health",
            "hitl_gate_status",
            "hitl_propose_action",
            "scorpion_list_missions",
            "scorpion_obsidian_context",
            "n8n_list_workflows",
            "n8n_get_execution",
            "ce_lookup_lead",
            "scorpion_register_outcome",
        ],
    ),
    "voice": _role_block(
        "voice",
        "Content — register outcomes only",
        ["scorpion_health", "hitl_gate_status", "hitl_propose_action", "scorpion_register_outcome"],
    ),
    "designer": _role_block(
        "designer",
        "Content — register outcomes only",
        ["scorpion_health", "hitl_gate_status", "hitl_propose_action", "scorpion_register_outcome"],
    ),
    "social": _role_block(
        "social",
        "Content — register outcomes only",
        ["scorpion_health", "hitl_gate_status", "hitl_propose_action", "scorpion_register_outcome"],
    ),
    "creator": _role_block(
        "creator",
        "Content — register outcomes only",
        ["scorpion_health", "hitl_gate_status", "hitl_propose_action", "scorpion_register_outcome"],
    ),
}

HIVE_CONTEXT = """# HIVE_CONTEXT.md — Outer Heaven ↔ hive (read-only for all agents)

Last updated: 2026-08-08

## Systems map
| System | URL / port | Job |
|--------|------------|-----|
| OpenClaw gateway | 127.0.0.1:18789 | Telegram face, agent routing |
| Philanthropy tools | 127.0.0.1:3002 `/api/agent` | Tool backend (hands) |
| Scorpion hive API | https://evenslouis.ca/scorpion/api/hive/* | Missions, register, golden paths |
| Client Engine | https://evenslouis.ca/pro | Money desk (HITL) |
| n8n | https://evenslouis.ca/n8n/ | Automation factory |
| Embedder | 127.0.0.1:8000 | Qdrant ingest/search |

## LLM (VPS production)
- **OpenClaw primary:** `openrouter/anthropic/claude-sonnet-4-6`
- **Fallbacks:** `openrouter/openai/gpt-4.1`, `openrouter/openai/gpt-4o`, `openrouter/openai/gpt-4o-mini`
- **Sync keys:** `python3 /root/bin/sync-vps-llm-keys.py`

## Golden paths
`GET https://evenslouis.ca/scorpion/api/hive/golden-paths`

| ID | Job | Pass when |
|----|-----|-----------|
| G1 | Telegram → agent tool reply | `/claw/` up + recent `report.notify` from Telegram |
| G2 | CE leads path | `/pro/api/health` 200 |
| G3 | n8n notify | Recent `notify.smoke` in Scorpion register |

## Hive report (Big Boss)
- Ask in **#general (topic 1)** → reply **in that thread** with score summary.
- Tool: `hive_send_report` via `POST /api/agent` — use `skipAlert: true` for #general (no #alerts spam).
- **#alerts (topic 13):** full scoreboard (deduped 15 min unless `forceAlert: true`).
- Shortcut plugin: "hive report", "golden paths", "weekly scoreboard".

## Register contract
`scorpion_register_outcome` / hive register with `correlationId`. CE = money; Scorpion = ops; `both` when spanning.
Auth: `HIVE_MACHINE_TOKEN` on philanthropy. Never paste token in Telegram.

## Agent roster (17 agents — do not renumber topics)

### 👑 COMMAND (1)
| Agent | Topic ID | Thread |
|-------|----------|--------|
| BigBoss | 1 | #general |

### 🧠 CORE INTELLIGENCE (3)
| Agent | Topic ID | Thread |
|-------|----------|--------|
| SolidSnake | 163 | #council |
| LiquidSnake | 9 | #autoresearch |
| VenomSnake | 163 | #council |

SolidSnake + VenomSnake **share** topic 163 (#council).

### ⚙️ OPS (5)
| Agent | Topic ID | Thread |
|-------|----------|--------|
| Sigint | 8 | #research |
| Naomi | 12 | #crons |
| Herald | 164 | #communications |
| Forge | 10 | #builds |
| Ledger | 162 | #ledger |

### 💼 BUSINESS SQUAD (8)
| Agent | Topic ID | Thread |
|-------|----------|--------|
| Business | 417 | #business |
| Scout | 418 | #scout |
| Radar | 419 | #trend |
| Voice | 420 | #writer |
| Designer | 421 | #designer |
| Social | 422 | #social |
| Creator | 423 | #creator |
| Ocelot | 1651 | #crm |

### SPECIAL THREADS (not separate agents)
| Thread | Topic ID | Purpose |
|--------|----------|---------|
| #live-activity | 424 | Mission log |
| #knowledge | 11 | KB ingest / search |
| #alerts | 13 | Critical alerts → BigBoss |

Full per-agent tools and roles: Big Boss `AGENTS.md` only.

## Hermes-like UX (2026-08-08)
- **Instant commands:** `help`, `status`, `hive report`, `agents` (LLM-free plugin)
- **Telegram:** progress streaming + tool status lines; voice notes transcribed inbound
- **Memory search:** enabled (OpenRouter embeddings)
- **Voice canon:** `HERMES_VOICE.md` — warm, direct, result-first

## Operator
Evens Louis — Twotone — @Twotone_pluto — Montreal ET — github.com/snevemoney
"""

ROSTER_HEADER = """# AGENTS.md — 17-Agent Outer Heaven Roster

All agents run on OpenClaw. Each has a SOUL.md in `~/.openclaw/workspace-{agent}/`.
Philanthropy is the tool backend — it does NOT run agent logic.
Hive canon: `HIVE_CONTEXT.md` in this workspace.

---

## 👑 COMMAND (1)

| Agent | Topic ID | Thread |
|-------|----------|--------|
| BigBoss | 1 | #general |

---

## 🧠 CORE INTELLIGENCE (3)

| Agent | Topic ID | Thread |
|-------|----------|--------|
| SolidSnake | 163 | #council |
| LiquidSnake | 9 | #autoresearch |
| VenomSnake | 163 | #council |

SolidSnake + VenomSnake share topic 163 (#council).

---

## ⚙️ OPS (5)

| Agent | Topic ID | Thread |
|-------|----------|--------|
| Sigint | 8 | #research |
| Naomi | 12 | #crons |
| Herald | 164 | #communications |
| Forge | 10 | #builds |
| Ledger | 162 | #ledger |

---

## 💼 BUSINESS SQUAD (8)

| Agent | Topic ID | Thread |
|-------|----------|--------|
| Business | 417 | #business |
| Scout | 418 | #scout |
| Radar | 419 | #trend |
| Voice | 420 | #writer |
| Designer | 421 | #designer |
| Social | 422 | #social |
| Creator | 423 | #creator |
| Ocelot | 1651 | #crm |

---

## SPECIAL THREADS

| Thread | Topic ID | Purpose |
|--------|----------|---------|
| #live-activity | 424 | Mission log — all agents broadcast here |
| #knowledge | 11 | Paste text → BigBoss ingests to Qdrant. Prefix `search:` to query. |
| #alerts | 13 | Critical alerts → BigBoss |

---

## MODEL ASSIGNMENTS (2026-08)

**Production path:** OpenRouter → `claude-sonnet-4-6` primary; GPT-4.1 / GPT-4o fallbacks.
**Sonnet-tier agents:** BigBoss, SolidSnake, LiquidSnake, VenomSnake, Sigint, Forge, Ledger, Business, Radar, Voice, Ocelot
**Haiku-tier agents:** Naomi, Herald, Scout, Designer, Social, Creator

---

## Agent details

## Build philosophy (all agents)
Read `OPERATIONAL_MANDATE.md` then `BUILD_PHILOSOPHY.md` then `EMPIRE_SECRETS.md` for deploy-scale rules.
Hub YAML: `workspace-bigboss/OPERATIONAL_MANDATE.yaml` + `SOFTWARE_SUCCESS_PHILOSOPHY.yaml` + `EMPIRE_SECRETS.yaml`

"""

AGENT_WORKSPACES = [
    "bigboss",
    "solidsnake",
    "liquidsnake",
    "venomsnake",
    "sigint",
    "naomi",
    "herald",
    "forge",
    "ledger",
    "business",
    "scout",
    "radar",
    "voice",
    "designer",
    "social",
    "creator",
    "ocelot",
]

MEMORY_POINTER = """
## Hive canon
Read `~/.openclaw/workspace-bigboss/HIVE_CONTEXT.md` for Scorpion/CE/n8n/Telegram contracts and the topic roster.
Read `~/.openclaw/workspace-bigboss/OUTER_HEAVEN_LIBRARY.md` and `HIVEMIND_DNA.md` for living catalog + personality.
Read `SURVIVAL_CONTRACT.md` for 20hr/week and agent lab rules.
Do not duplicate the roster in this file.
"""


def append_if_missing(path: Path, marker: str, block: str) -> bool:
    if not path.is_file():
        return False
    text = path.read_text(encoding="utf-8")
    if marker in text:
        return False
    path.write_text(text.rstrip() + "\n\n" + block.strip() + "\n", encoding="utf-8")
    return True


def sync_build_philosophy() -> None:
    for agent in AGENT_WORKSPACES:
        ws = Path(f"/root/.openclaw/workspace-{agent}")
        if not ws.is_dir():
            continue
        if BUILD_PHILOSOPHY_SRC.is_file():
            shutil.copy2(BUILD_PHILOSOPHY_SRC, ws / "BUILD_PHILOSOPHY.md")
        if OPERATIONAL_MANDATE_SRC.is_file():
            shutil.copy2(OPERATIONAL_MANDATE_SRC, ws / "OPERATIONAL_MANDATE.md")
        if EMPIRE_SECRETS_SRC.is_file():
            shutil.copy2(EMPIRE_SECRETS_SRC, ws / "EMPIRE_SECRETS.md")
        factory_src = AUTONOMOUS_FACTORY_SRC if AUTONOMOUS_FACTORY_SRC.is_file() else AUTONOMOUS_FACTORY_DOC
        if factory_src.is_file():
            shutil.copy2(factory_src, ws / "AUTONOMOUS_FACTORY.md")
        novice_src = NOVICE_ARCHITECT_SRC if NOVICE_ARCHITECT_SRC.is_file() else NOVICE_ARCHITECT_DOC
        if novice_src.is_file():
            shutil.copy2(novice_src, ws / "NOVICE_ARCHITECT.md")
        evo_src = SELF_EVOLUTION_SRC if SELF_EVOLUTION_SRC.is_file() else SELF_EVOLUTION_DOC
        if evo_src.is_file():
            shutil.copy2(evo_src, ws / "SELF_EVOLUTION.md")
        if SELF_EVOLUTION_PROTOCOL_SRC.is_file():
            shutil.copy2(SELF_EVOLUTION_PROTOCOL_SRC, ws / "SELF_EVOLUTION_PROTOCOL.md")
        mogul_src = MOGUL_MODE_SRC if MOGUL_MODE_SRC.is_file() else MOGUL_MODE_DOC
        if mogul_src.is_file():
            shutil.copy2(mogul_src, ws / "MOGUL_MODE.md")
        if MOGUL_PROTOCOL_SRC.is_file():
            shutil.copy2(MOGUL_PROTOCOL_SRC, ws / "MOGUL_PROTOCOL.md")
        mr_src = MULTI_REPO_GRID_SRC if MULTI_REPO_GRID_SRC.is_file() else MULTI_REPO_GRID_DOC
        if mr_src.is_file():
            shutil.copy2(mr_src, ws / "MULTI_REPO_GRID.md")
    print(f"synced BUILD_PHILOSOPHY + OPERATIONAL_MANDATE + EMPIRE_SECRETS + AUTONOMOUS_FACTORY + NOVICE_ARCHITECT → {len(AGENT_WORKSPACES)} workspaces")
    if SOFTWARE_YAML_SRC.is_file():
        shutil.copy2(SOFTWARE_YAML_SRC, BB / "SOFTWARE_SUCCESS_PHILOSOPHY.yaml")
    if MANDATE_YAML_SRC.is_file():
        shutil.copy2(MANDATE_YAML_SRC, BB / "OPERATIONAL_MANDATE.yaml")
    if EMPIRE_YAML_SRC.is_file():
        shutil.copy2(EMPIRE_YAML_SRC, BB / "EMPIRE_SECRETS.yaml")
    if AUTONOMOUS_FACTORY_DOC.is_file():
        shutil.copy2(AUTONOMOUS_FACTORY_DOC, BB / "AUTONOMOUS_FACTORY.md")
    if NOVICE_ARCHITECT_DOC.is_file():
        shutil.copy2(NOVICE_ARCHITECT_DOC, BB / "NOVICE_ARCHITECT.md")
    if SELF_EVOLUTION_DOC.is_file():
        shutil.copy2(SELF_EVOLUTION_DOC, BB / "SELF_EVOLUTION.md")
    if SELF_EVOLUTION_PROTOCOL_SRC.is_file():
        shutil.copy2(SELF_EVOLUTION_PROTOCOL_SRC, BB / "SELF_EVOLUTION_PROTOCOL.md")
    if MOGUL_MODE_DOC.is_file():
        shutil.copy2(MOGUL_MODE_DOC, BB / "MOGUL_MODE.md")
    if MOGUL_PROTOCOL_SRC.is_file():
        shutil.copy2(MOGUL_PROTOCOL_SRC, BB / "MOGUL_PROTOCOL.md")
    if MULTI_REPO_GRID_DOC.is_file():
        shutil.copy2(MULTI_REPO_GRID_DOC, BB / "MULTI_REPO_GRID.md")
    if SOFTWARE_YAML_SRC.is_file() or MANDATE_YAML_SRC.is_file():
        print("synced YAML + AUTONOMOUS_FACTORY + NOVICE_ARCHITECT canon → workspace-bigboss")


def main() -> None:
    subprocess.run(["/root/bin/backup-openclaw-workspaces.sh"], check=False)

    (BB / "HIVE_CONTEXT.md").write_text(HIVE_CONTEXT.strip() + "\n", encoding="utf-8")
    print("wrote HIVE_CONTEXT.md")

    if OUTER_HEAVEN_LIBRARY_SRC.is_file():
        shutil.copy2(OUTER_HEAVEN_LIBRARY_SRC, BB / "OUTER_HEAVEN_LIBRARY.md")
        print("copied OUTER_HEAVEN_LIBRARY.md → workspace-bigboss")
    if OUTER_HEAVEN_GLOSSARY_SRC.is_file():
        shutil.copy2(OUTER_HEAVEN_GLOSSARY_SRC, BB / "OUTER_HEAVEN_GLOSSARY.md")
        print("copied OUTER_HEAVEN_GLOSSARY.md → workspace-bigboss")
    if HIVEMIND_DNA_SRC.is_file():
        shutil.copy2(HIVEMIND_DNA_SRC, BB / "HIVEMIND_DNA.md")
        print("copied HIVEMIND_DNA.md → workspace-bigboss")
    if SURVIVAL_CONTRACT_SRC.is_file():
        shutil.copy2(SURVIVAL_CONTRACT_SRC, BB / "SURVIVAL_CONTRACT.md")
        print("copied SURVIVAL_CONTRACT.md → workspace-bigboss")
    for src, name in (
        (AUTOPILOT_CONTRACT_SRC, "AUTOPILOT_CONTRACT.md"),
        (NOTIFICATION_MATRIX_SRC, "NOTIFICATION_MATRIX.md"),
        (GROK_CURSOR_TEAM_SRC, "GROK_CURSOR_TEAM.md"),
    ):
        if src.is_file():
            shutil.copy2(src, BB / name)
            print(f"copied {name} → workspace-bigboss")

    sync_build_philosophy()

    agents_path = BB / "AGENTS.md"
    if agents_path.is_file():
        old = agents_path.read_text(encoding="utf-8")
        match = re.search(r"\n## Agent details\n|\n### BigBoss\n", old)
        if match:
            details = old[match.start() :].lstrip()
            if details.startswith("## Agent details"):
                details = details[len("## Agent details") :].lstrip()
            agents_path.write_text(ROSTER_HEADER + details, encoding="utf-8")
            print("updated AGENTS.md roster header")
        else:
            print("AGENTS.md: could not find agent details section — skipped header replace")

    append_if_missing(
        BB / "SOUL.md",
        "## CRITICAL OPERATIONAL MANDATE",
        """
## CRITICAL OPERATIONAL MANDATE (2026-08-08)
Human-count-one enterprise · OpenClaw/Telegram control plane · absolute leverage.
1. **No custom code** if API/n8n/hive hook exists — read OPERATIONAL_MANDATE.md
2. **Headless-first** — every module callable via /api/agent or hive API
3. **Telemetry every deploy** — golden paths, register, n8n_get_execution; self-heal = propose not auto-deploy
4. **Programmatic distribution** — funnel + SEO loops; Tier 3 for client send
Reject non-compliant build requests. Execute and verify.
""",
    )

    append_if_missing(
        BB / "SOUL.md",
        "## Model Resilience (updated 2026-08-08)",
        """
## Model Resilience (updated 2026-08-08)
**VPS primary:** OpenRouter → `openrouter/anthropic/claude-sonnet-4-6`.
**Fallbacks:** `openrouter/openai/gpt-4.1`, `openrouter/openai/gpt-4o`, `openrouter/openai/gpt-4o-mini`.
Sync: `python3 /root/bin/sync-vps-llm-keys.py`. If all providers fail: hive-report shortcut or #alerts (topic 13); no blind retries.

## Hive report (operator, 2026-08-08)
When Twotone asks for hive / golden paths / scoreboard in **#general (topic 1)**: use `hive_send_report` or the shortcut plugin.
Reply **in #general** with pass count. Full formatted report → **#alerts (topic 13)** only (not every chat turn). Use `skipAlert: true` for in-thread replies.
""",
    )

    identity = BB / "IDENTITY.md"
    if identity.is_file():
        text = identity.read_text(encoding="utf-8")
        text = re.sub(
            r"\*\*Model:\*\* Sonnet",
            "**Model:** Claude Sonnet 4.6 via OpenRouter (`openrouter/anthropic/claude-sonnet-4-6`)",
            text,
        )
        identity.write_text(text, encoding="utf-8")
        print("updated IDENTITY.md model line")

    append_if_missing(
        BB / "USER.md",
        "## Learned 2026-08",
        """
## Learned 2026-08
- Hates duplicate #alerts spam and scoreboards that always show G1 ❌ when fixed
- Wants honest status: tool works vs Telegram UX broken
- Hive report: reply in #general; #alerts is monitoring only
""",
    )

    append_if_missing(
        BB / "TOOLS.md",
        TIER2_TOOLS_MARKER,
        TIER2_TOOLS_BLOCK,
    )

    append_if_missing(
        BB / "TOOLS.md",
        TIER3_TOOLS_MARKER,
        TIER3_TOOLS_BLOCK,
    )

    forge_tools = Path("/root/.openclaw/workspace-forge/TOOLS.md")
    append_if_missing(
        forge_tools,
        "## BUILD_PHILOSOPHY",
        """
## BUILD_PHILOSOPHY
Before every build/refactor: read `BUILD_PHILOSOPHY.md`. Evaluate against SOFTWARE_SUCCESS_PHILOSOPHY.yaml (Big Boss workspace). Register outcome + run smoke.
""",
    )

    append_if_missing(
        BB / "TOOLS.md",
        "`hive_send_report`",
        """
| `hive_send_report` | Golden path scoreboard (`skipAlert`, `forceAlert`, `topicId`, `voice`) |

## Hive report UX (2026-08-08)
- **#general (topic 1):** reply in thread; prefer `skipAlert: true`
- **#alerts (topic 13):** deduped full post (15 min); cron/n8n may post here
- Scoreboard: `GET https://evenslouis.ca/scorpion/api/hive/golden-paths`
- Roster + topics: `HIVE_CONTEXT.md` (do not renumber topic IDs)
""",
    )

    append_if_missing(
        BB / "MEMORY.md",
        "## 2026-08-08 Hive / LLM",
        """
## 2026-08-08 Hive / LLM
- 17 agents; roster tables in `HIVE_CONTEXT.md` + `AGENTS.md`
- G1 auto-check via Scorpion (`report.notify` + `/claw/` health)
- OpenRouter = production LLM; sync: `/root/bin/sync-vps-llm-keys.py`
- Expert audit: hub `scripts/hive/expert-audit.sh`
""",
    )

    append_if_missing(
        BB / "HEARTBEAT.md",
        "## 2026-08-08",
        """
## 2026-08-08
- All 17 agents need OpenRouter in `auth-profiles.json` (sync script)
- Weekly hive report: n8n Mon 14:00 UTC + on-demand via Big Boss in #general
""",
    )

    mem_dir = BB / "memory"
    mem_dir.mkdir(exist_ok=True)
    mem_file = mem_dir / f"{STAMP}-hive-workspace-sync.md"
    if not mem_file.exists():
        mem_file.write_text(
            f"""# {STAMP} — Hive workspace sync

- Added HIVE_CONTEXT.md with canonical 17-agent roster + special threads (424, 11, 13)
- G1 was hardcoded fail in Scorpion; alerts spam from API tests — fixed separately
- Rule: #general = reply; #alerts = monitoring feed
""",
            encoding="utf-8",
        )

    bb_tools = BB / "TOOLS.md"
    if bb_tools.is_file() and "### BigBoss" in bb_tools.read_text():
        pass
    bb_agents = BB / "AGENTS.md"
    if bb_agents.is_file():
        text = bb_agents.read_text(encoding="utf-8")
        if "hive_send_report" not in text.split("### BigBoss")[1].split("###")[0]:
            text = text.replace(
                "- **Tools:** search_knowledge_base, queue_forge_task, log_mission",
                "- **Tools:** search_knowledge_base, queue_forge_task, log_mission, hive_send_report",
                1,
            )
            bb_agents.write_text(text, encoding="utf-8")
            print("added hive_send_report to BigBoss tools in AGENTS.md")

    for agent in AGENT_WORKSPACES:
        if agent == "bigboss":
            continue
        mem = Path(f"/root/.openclaw/workspace-{agent}/MEMORY.md")
        if append_if_missing(mem, "HIVE_CONTEXT.md", MEMORY_POINTER):
            print(f"MEMORY pointer: {agent}")

    for agent, block in AGENT_TOOL_BLOCKS.items():
        tools_path = Path(f"/root/.openclaw/workspace-{agent}/TOOLS.md")
        if append_if_missing(tools_path, ROLE_TOOLS_MARKER, block):
            print(f"role tools block: {agent}")

    print("sync complete")


if __name__ == "__main__":
    main()
