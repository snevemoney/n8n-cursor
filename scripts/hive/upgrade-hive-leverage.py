#!/usr/bin/env python3
"""Deploy hive leverage layer: CE resolve, Philanthropy tools, Telegram shortcuts."""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

HUB = Path(__file__).resolve().parent
PHILANTHROPY_HIVE = Path("/opt/philanthropy/app/api/agent/tools/hive.ts")
SHORTCUTS_DST = Path("/root/.openclaw/plugins/hive-report-shortcut")
CE_BRIDGE_CONTAINER = "evenslouis_paths-ce-hive-bridge-1"
CE_BRIDGE_MOUNT = Path("/opt/ce-hive-bridge")
BB_TOOLS = Path("/root/.openclaw/workspace-bigboss/TOOLS.md")
PHILANTHROPY_CATALOG = Path("/opt/philanthropy/config/n8n-catalog.json")

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

Catalog source: `scripts/hive/n8n-catalog.json` on hub; VPS copy at `/opt/philanthropy/config/n8n-catalog.json`.
"""

TIER3_TOOLS_MARKER = "## Tier 3 HITL — never from Telegram (2026-08-08)"
TIER3_TOOLS_BLOCK = """
## Tier 3 HITL — never from Telegram (2026-08-08)

**Hard rule:** money mutations, prod deploy, secrets, client send **never execute** via chat tools.

| Category | Operator completes on |
|----------|------------------------|
| Money (deal approve, send, invoice) | https://evenslouis.ca/pro |
| Deploy | GitHub PR + operator — **not** `deploy_trigger` |
| Secrets / OAuth | SSH — never via agent |

**When blocked:** tool returns `TIER3_HITL_BLOCKED` (403).

**Propose only:** `hitl_propose_action` with `category`, `type`, `reason` — queues CE row + Scorpion register; you finish on `/pro` or SSH.

**Policy dump:** `hitl_gate_status`

Tier 2 `ce_approve_action` = audit **ledger** only — not `/pro` deal approve.

Docs: hub `docs/hive/TIER3_HITL.md`
"""

PHILANTHROPY_ROUTE = Path("/opt/philanthropy/app/api/agent/route.ts")
PHILANTHROPY_HITL_GATE = Path("/opt/philanthropy/app/api/agent/tools/hitl-gate.ts")
PHILANTHROPY_AGENT_ROLES = Path("/opt/philanthropy/app/api/agent/tools/agent-roles.ts")


def deploy_n8n_catalog() -> None:
    src = HUB / "n8n-catalog.json"
    if not src.is_file():
        raise SystemExit(f"missing {src}")
    PHILANTHROPY_CATALOG.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, PHILANTHROPY_CATALOG)
    print(f"deployed catalog → {PHILANTHROPY_CATALOG}")


def patch_bigboss_tools() -> None:
    if not BB_TOOLS.is_file():
        print(f"skip Big Boss TOOLS — missing {BB_TOOLS}")
        return
    text = BB_TOOLS.read_text(encoding="utf-8")
    changed = False
    if TIER2_TOOLS_MARKER not in text:
        text = text.rstrip() + "\n" + TIER2_TOOLS_BLOCK + "\n"
        changed = True
        print("appended Tier 2 tools to TOOLS.md")
    if TIER3_TOOLS_MARKER not in text:
        text = text.rstrip() + "\n" + TIER3_TOOLS_BLOCK + "\n"
        changed = True
        print("appended Tier 3 HITL to TOOLS.md")
    if changed:
        BB_TOOLS.write_text(text, encoding="utf-8")
    else:
        print("Big Boss TOOLS.md already has Tier 2+3 blocks")


def deploy_hitl_gate() -> None:
    src_gate = HUB / "philanthropy-hive-tools" / "hitl-gate.ts"
    src_roles = HUB / "philanthropy-hive-tools" / "agent-roles.ts"
    src_route = HUB / "philanthropy-hive-tools" / "route.ts"
    if not src_gate.is_file() or not src_route.is_file() or not src_roles.is_file():
        raise SystemExit("missing hitl-gate.ts, agent-roles.ts, or route.ts")
    shutil.copy2(src_gate, PHILANTHROPY_HITL_GATE)
    shutil.copy2(src_roles, PHILANTHROPY_AGENT_ROLES)
    shutil.copy2(src_route, PHILANTHROPY_ROUTE)
    print(f"deployed Tier 3 gate → {PHILANTHROPY_HITL_GATE}")
    print(f"deployed role gate → {PHILANTHROPY_AGENT_ROLES}")
    print(f"deployed gated route → {PHILANTHROPY_ROUTE}")


def deploy_philanthropy_tools() -> None:
    src = HUB / "philanthropy-hive-tools" / "hive.ts"
    if not src.is_file():
        raise SystemExit(f"missing {src}")
    if not PHILANTHROPY_HIVE.parent.is_dir():
        raise SystemExit(f"philanthropy not found at {PHILANTHROPY_HIVE}")
    shutil.copy2(src, PHILANTHROPY_HIVE)
    print(f"deployed {PHILANTHROPY_HIVE}")


def deploy_shortcuts() -> None:
    src = HUB / "outer-heaven-shortcuts" / "index.js"
    SHORTCUTS_DST.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, SHORTCUTS_DST / "index.js")
    print(f"deployed shortcuts → {SHORTCUTS_DST}")


def deploy_ce_bridge() -> None:
    src = HUB / "ce-hive-bridge" / "server.js"
    pkg = HUB / "ce-hive-bridge" / "package.json"
    CE_BRIDGE_MOUNT.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, CE_BRIDGE_MOUNT / "server.js")
    shutil.copy2(pkg, CE_BRIDGE_MOUNT / "package.json")
    print(f"deployed ce-hive-bridge → {CE_BRIDGE_MOUNT}")

    # Restart container if present
    check = subprocess.run(
        ["docker", "inspect", CE_BRIDGE_CONTAINER],
        capture_output=True,
        check=False,
    )
    if check.returncode == 0:
        subprocess.run(
            ["docker", "cp", str(CE_BRIDGE_MOUNT / "server.js"), f"{CE_BRIDGE_CONTAINER}:/app/server.js"],
            check=True,
        )
        subprocess.run(["docker", "restart", CE_BRIDGE_CONTAINER], check=True)
        print(f"patched + restarted {CE_BRIDGE_CONTAINER}")
    else:
        print(f"skip restart — container {CE_BRIDGE_CONTAINER} not found")


def restart_philanthropy() -> None:
    subprocess.run(["pm2", "restart", "philanthropy"], check=True)
    print("restarted philanthropy (pm2)")


def sync_philanthropy_env() -> None:
    """Ensure CE + n8n keys on Philanthropy for direct leverage tools."""
    env_path = Path("/opt/philanthropy/.env")
    hive_env = Path("/home/evens/n8n-cursor/.env.hive")
    alt_hive = Path("/root/domain-paths/n8n-cursor/.env.hive")
    if not env_path.is_file():
        print("skip env sync — no /opt/philanthropy/.env")
        return

    lines = env_path.read_text(encoding="utf-8").splitlines()
    existing = {ln.split("=", 1)[0]: ln for ln in lines if "=" in ln and not ln.strip().startswith("#")}

    def ingest(path: Path) -> dict[str, str]:
        out: dict[str, str] = {}
        if not path.is_file():
            return out
        for ln in path.read_text(encoding="utf-8").splitlines():
            if not ln or ln.strip().startswith("#") or "=" not in ln:
                continue
            k, v = ln.split("=", 1)
            out[k.strip()] = v.strip().strip('"').strip("'")
        return out

    src = ingest(hive_env)
    if alt_hive.is_file():
        src = {**ingest(alt_hive), **src}
    token = subprocess.run(
        ["docker", "exec", "evenslouis_paths-scorpion-1", "printenv", "CE_HIVE_TOKEN"],
        capture_output=True,
        text=True,
        check=False,
    ).stdout.strip()

    updates = {
        "CE_HIVE_BASE_URL": "http://127.0.0.1:3205",
        "CE_HIVE_TOKEN": token or src.get("CE_HIVE_TOKEN", ""),
        "N8N_BASE_URL": src.get("N8N_BASE_URL") or src.get("N8N_API_URL") or "http://127.0.0.1:5678",
        "N8N_API_KEY": src.get("N8N_API_KEY", ""),
        "HIVE_WEBHOOK_SECRET": src.get("HIVE_WEBHOOK_SECRET", ""),
        "N8N_WEBHOOK_BASE": src.get("N8N_WEBHOOK_BASE", "https://evenslouis.ca/webhook"),
        "N8N_CATALOG_PATH": "/opt/philanthropy/config/n8n-catalog.json",
    }

    changed = False
    for key, val in updates.items():
        if not val or existing.get(key):
            continue
        lines.append(f"{key}={val}")
        changed = True
        print(f"added {key} to philanthropy .env")

    if changed:
        env_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    # Mirror keys to .env.local for tools that read it first
    local_path = Path("/opt/philanthropy/.env.local")
    mirror_keys = [
        "N8N_API_KEY",
        "N8N_BASE_URL",
        "N8N_WEBHOOK_BASE",
        "HIVE_WEBHOOK_SECRET",
        "CE_HIVE_TOKEN",
        "CE_HIVE_BASE_URL",
        "N8N_CATALOG_PATH",
    ]
    final_env = env_path.read_text(encoding="utf-8") if env_path.is_file() else ""
    local_lines: list[str] = []
    if local_path.is_file():
        local_lines = local_path.read_text(encoding="utf-8").splitlines()
    local_map = {ln.split("=", 1)[0]: ln for ln in local_lines if "=" in ln and not ln.strip().startswith("#")}
    local_changed = False
    for key in mirror_keys:
        match = [ln for ln in final_env.splitlines() if ln.startswith(f"{key}=")]
        if not match:
            continue
        if local_map.get(key) != match[0]:
            local_map[key] = match[0]
            local_changed = True
    if local_changed:
        local_path.write_text("\n".join(local_map.values()) + "\n", encoding="utf-8")
        print("mirrored env keys → /opt/philanthropy/.env.local")


def deploy_build_philosophy() -> None:
    tpl = HUB / "templates" / "BUILD_PHILOSOPHY.md"
    mandate = HUB / "templates" / "OPERATIONAL_MANDATE.md"
    empire = HUB / "templates" / "EMPIRE_SECRETS.md"
    factory = HUB / "templates" / "AUTONOMOUS_FACTORY.md"
    novice = HUB / "templates" / "NOVICE_ARCHITECT.md"
    evolution = HUB / "templates" / "SELF_EVOLUTION.md"
    evolution_protocol = HUB / "templates" / "SELF_EVOLUTION_PROTOCOL.md"
    mogul = HUB / "templates" / "MOGUL_MODE.md"
    mogul_protocol = HUB / "templates" / "MOGUL_PROTOCOL.md"
    multi_repo = HUB / "templates" / "MULTI_REPO_GRID.md"
    hive_mind = HUB / "templates" / "HIVE_MIND_PROTOCOL.md"
    dual_loop = HUB / "templates" / "DUAL_LOOP_PROTOCOL.md"
    if not tpl.is_file():
        alt = Path("/root/domain-paths/n8n-cursor/scripts/hive/templates/BUILD_PHILOSOPHY.md")
        tpl = alt if alt.is_file() else tpl
    if not mandate.is_file():
        alt_m = Path("/root/domain-paths/n8n-cursor/scripts/hive/templates/OPERATIONAL_MANDATE.md")
        mandate = alt_m if alt_m.is_file() else mandate
    if not empire.is_file():
        alt_e = Path("/root/domain-paths/n8n-cursor/scripts/hive/templates/EMPIRE_SECRETS.md")
        empire = alt_e if alt_e.is_file() else empire
    if not factory.is_file():
        alt_f = Path("/root/domain-paths/n8n-cursor/scripts/hive/templates/AUTONOMOUS_FACTORY.md")
        factory = alt_f if alt_f.is_file() else factory
    if not novice.is_file():
        alt_n = Path("/root/domain-paths/n8n-cursor/scripts/hive/templates/NOVICE_ARCHITECT.md")
        novice = alt_n if alt_n.is_file() else novice
    if not evolution.is_file():
        alt_evo = Path("/root/domain-paths/n8n-cursor/scripts/hive/templates/SELF_EVOLUTION.md")
        evolution = alt_evo if alt_evo.is_file() else evolution
    if not evolution_protocol.is_file():
        alt_ep = Path("/root/domain-paths/n8n-cursor/scripts/hive/templates/SELF_EVOLUTION_PROTOCOL.md")
        evolution_protocol = alt_ep if alt_ep.is_file() else evolution_protocol
    if not mogul.is_file():
        alt_m = Path("/root/domain-paths/n8n-cursor/scripts/hive/templates/MOGUL_MODE.md")
        mogul = alt_m if alt_m.is_file() else mogul
    if not mogul_protocol.is_file():
        alt_mp = Path("/root/domain-paths/n8n-cursor/scripts/hive/templates/MOGUL_PROTOCOL.md")
        mogul_protocol = alt_mp if alt_mp.is_file() else mogul_protocol
    if not multi_repo.is_file():
        alt_mr = Path("/root/domain-paths/n8n-cursor/scripts/hive/templates/MULTI_REPO_GRID.md")
        multi_repo = alt_mr if alt_mr.is_file() else multi_repo
    if not hive_mind.is_file():
        alt_hm = Path("/root/domain-paths/n8n-cursor/scripts/hive/templates/HIVE_MIND_PROTOCOL.md")
        hive_mind = alt_hm if alt_hm.is_file() else hive_mind
    if not dual_loop.is_file():
        alt_dl = Path("/root/domain-paths/n8n-cursor/scripts/hive/templates/DUAL_LOOP_PROTOCOL.md")
        dual_loop = alt_dl if alt_dl.is_file() else dual_loop
    agents = [
        "bigboss", "solidsnake", "liquidsnake", "venomsnake", "sigint", "naomi", "herald",
        "forge", "ledger", "business", "scout", "radar", "voice", "designer", "social",
        "creator", "ocelot",
    ]
    for a in agents:
        ws = Path(f"/root/.openclaw/workspace-{a}")
        if not ws.is_dir():
            continue
        if tpl.is_file():
            shutil.copy2(tpl, ws / "BUILD_PHILOSOPHY.md")
        if mandate.is_file():
            shutil.copy2(mandate, ws / "OPERATIONAL_MANDATE.md")
        if empire.is_file():
            shutil.copy2(empire, ws / "EMPIRE_SECRETS.md")
        if factory.is_file():
            shutil.copy2(factory, ws / "AUTONOMOUS_FACTORY.md")
        if novice.is_file():
            shutil.copy2(novice, ws / "NOVICE_ARCHITECT.md")
        if evolution.is_file():
            shutil.copy2(evolution, ws / "SELF_EVOLUTION.md")
        if evolution_protocol.is_file():
            shutil.copy2(evolution_protocol, ws / "SELF_EVOLUTION_PROTOCOL.md")
        if mogul.is_file():
            shutil.copy2(mogul, ws / "MOGUL_MODE.md")
        if mogul_protocol.is_file():
            shutil.copy2(mogul_protocol, ws / "MOGUL_PROTOCOL.md")
        if multi_repo.is_file():
            shutil.copy2(multi_repo, ws / "MULTI_REPO_GRID.md")
        if hive_mind.is_file():
            shutil.copy2(hive_mind, ws / "HIVE_MIND_PROTOCOL.md")
        if dual_loop.is_file():
            shutil.copy2(dual_loop, ws / "DUAL_LOOP_PROTOCOL.md")
    print(f"synced hive canon (+ DUAL_LOOP) → {len(agents)} workspaces")
    bb = Path("/root/.openclaw/workspace-bigboss")
    if bb.is_dir():
        for name in (
            "SOFTWARE_SUCCESS_PHILOSOPHY.yaml",
            "OPERATIONAL_MANDATE.yaml",
            "EMPIRE_SECRETS.yaml",
            "AUTONOMOUS_FACTORY.md",
            "NOVICE_ARCHITECT.md",
            "SELF_EVOLUTION.md",
            "MOGUL_MODE.md",
            "MULTI_REPO_GRID.md",
            "HIVE_TOOLBOX.md",
            "DUAL_LOOP_ENGINE.md",
            "CREATIVE_PIVOT.yaml",
        ):
            hub_yaml = HUB.parent.parent / "docs" / "hive" / name
            if not hub_yaml.is_file():
                hub_yaml = Path(f"/root/domain-paths/n8n-cursor/docs/hive/{name}")
            if hub_yaml.is_file():
                shutil.copy2(hub_yaml, bb / name)
        print("synced YAML + AUTONOMOUS_FACTORY canon → bigboss")


def main() -> None:
    deploy_ce_bridge()
    deploy_n8n_catalog()
    sync_philanthropy_env()
    deploy_philanthropy_tools()
    deploy_hitl_gate()
    deploy_shortcuts()
    deploy_build_philosophy()
    patch_bigboss_tools()
    restart_philanthropy()
    print("")
    print("Done. Scorpion hive routes (n8n/workflows, ce/resolve) need image rebuild from hub.")
    print("  cd apps/scorpion && pnpm build  → redeploy evenslouis_paths-scorpion-1")


if __name__ == "__main__":
    main()
