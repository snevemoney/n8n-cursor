#!/usr/bin/env python3
"""Grant Grok Bot access to hive apps, URLs, Mac repo, and VPS (via Mac SSH).

Updates:
  - ~/.grokbot/settings.json (localToolPermission, egressTunnel, MCP instructions)
  - Remote sand host via gateway setHostSettings + updateAgent on all hive bots
  - Re-dispatches "access granted" continue prompt

Does NOT restart Grok Bot or sign out.

Usage:
  python3 scripts/hive/grokbot-grant-access.py
"""
from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SETTINGS_PATH = Path.home() / ".grokbot/settings.json"
CONN_PATH = Path.home() / ".grokbot/local-exec-daemon-connection.json"
ACCESS_DOC = REPO / "docs/hive/GROKBOT_ACCESS.md"

HIVE_MCP_INSTRUCTIONS = """
Hive operator apps (Evens Louis). You HAVE a computer with a browser — USE IT.

ZERO-LOSS SAFETY (never violate):
- NEVER delete/wipe/truncate files, DB, Docker volumes, or git history.
- NEVER run: rm -rf, docker volume rm/prune, git push --force, git reset --hard, pm2 delete, DROP SQL.
- NEVER edit: .env*, credentials, openclaw.json, OpenClaw workspace/souls/topics, n8n_data volumes.
- NEVER prod deploy, merge main, OAuth/secrets changes, client send, money actions — operator Tier 3 only.
- ONLY run approved scripts: scripts/hive/smoke-*.sh, hive-watchdog.sh, life-business-ops-fix.sh, n8n-activate-all-hive-workflows.sh
- If unsure → STOP and report. Do not "fix" by deleting or resetting anything.

N8N (mandatory): ONLY https://evenslouis.ca/n8n and https://evenslouis.ca/webhook/* — NEVER n8ncloud.tech (deprecated/forbidden).

BROWSER (your Grok Bot computer — navigate directly, read-only unless operator Tier 3):
- https://evenslouis.ca/scorpion/api/hive/golden-paths — golden paths JSON (prefer API over Scorpion UI)
- https://evenslouis.ca/scorpion/api/hive/outer-heaven/dna — HIVEMIND DNA pack (fallback)
- https://evenslouis.ca/pro — Client Engine (Tier 3 for money/send)
- https://evenslouis.ca/n8n — workflows (Tier 3 for OAuth)
- https://evenslouis.ca/builder — builder stub
- https://evenslouis.ca/scorpion/healthz · https://evenslouis.ca/pro/api/health

Use computerUse / browser tools to open and verify these. Do not say you lack web access.

LOCAL MAC (Shell/Read — always allowed, read-only by default):
- Repo: /Users/evenslouis/n8n-cursor · docs/hive/GROKBOT_ACCESS.md
- SSH to VPS: ssh -o BatchMode=yes root@69.62.66.78 '...' (read + approved scripts only)

VPS via Mac SSH (approved scripts only):
- cd /root/domain-paths/n8n-cursor && bash scripts/hive/smoke-life-business-ops.sh
- life-business-ops-fix.sh · hive-watchdog.sh

Tier 3 never auto: money, client send, deploy, secrets/OAuth, delete data.

STRUCTURED TOOLS (use before guessing):
  python3 scripts/hive/grok-hive-tool.py --grok-agent "<Agent Name>" --tool scorpion_health
  python3 scripts/hive/grok-hive-tool.py --grok-agent "<Agent Name>" --list-tools
See docs/hive/GROKBOT_ACCESS.md § Structured tools.
""".strip()

ACCESS_BLURB = """
ACCESS (granted, read-only by default):
- YOUR COMPUTER + BROWSER: navigate evenslouis.ca/scorpion, /pro, /n8n, /builder (see GROKBOT_ACCESS.md)
- Mac repo: /Users/evenslouis/n8n-cursor · SSH VPS: root@69.62.66.78 via Mac shell
- SAFE VPS scripts only: smoke-*.sh, hive-watchdog.sh, life-business-ops-fix.sh
- NEVER delete data, edit secrets, deploy prod, or run rm/docker prune/git force without operator OK
""".strip()

CONTINUE_PROMPT = """Access granted — you have a computer with a browser.

SAFETY FIRST: Never delete, wipe, or compromise anything. Read-only checks + approved scripts only.
See ZERO-LOSS rules in your profile and docs/hive/GROKBOT_ACCESS.md.

1. Read docs/hive/outer-heaven/OUTER_HEAVEN_LIBRARY.md then docs/hive/GROKBOT_ACCESS.md
2. Use your BROWSER to open https://evenslouis.ca/scorpion/api/hive/golden-paths and https://evenslouis.ca/pro/api/health
3. For VPS checks use Mac shell: ssh -o BatchMode=yes root@69.62.66.78 'cd /root/domain-paths/n8n-cursor && bash scripts/hive/smoke-life-business-ops.sh'

Continue your mission to DONE_WHEN. Tier 3 (money/OAuth/send/delete/deploy) → tell operator; do NOT execute."""


def load_gateway() -> tuple[str, dict[str, str]]:
    if not CONN_PATH.exists():
        raise SystemExit(f"Missing {CONN_PATH} — open Grok Bot signed in.")
    conn = json.loads(CONN_PATH.read_text())
    return conn["baseUrl"].rstrip("/"), {
        "Authorization": f"Bearer {conn['token']}",
        "Content-Type": "application/json",
        **conn.get("headers", {}),
    }


def call(base: str, headers: dict, path: str, body: dict | None = None, retries: int = 6):
    last: Exception | None = None
    for i in range(retries):
        try:
            data = None if body is None else json.dumps(body).encode()
            req = urllib.request.Request(
                base + path, data=data, headers=headers, method="POST" if body else "GET"
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read().decode()
                return json.loads(raw) if raw else {}
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as e:
            last = e
            time.sleep(2 * (i + 1))
    raise SystemExit(f"Gateway failed {path}: {last}")


def patch_local_settings() -> None:
    SETTINGS_PATH.parent.mkdir(parents=True, exist_ok=True)
    settings = json.loads(SETTINGS_PATH.read_text()) if SETTINGS_PATH.exists() else {"version": 1}
    settings["localToolPermission"] = "always"
    settings["egressTunnelEnabled"] = True
    settings["mcpCustomInstructions"] = settings.get("mcpCustomInstructions") or {}
    settings["mcpCustomInstructions"]["hive-access"] = HIVE_MCP_INSTRUCTIONS[:8000]
    if "hasSeenOnboarding" not in settings:
        settings["hasSeenOnboarding"] = True
    SETTINGS_PATH.write_text(json.dumps(settings, indent=2) + "\n")
    print(f"  local settings → {SETTINGS_PATH}")


def main() -> int:
    print("Granting Grok Bot hive access…")
    patch_local_settings()

    base, headers = load_gateway()
    health = call(base, headers, "/health")
    if not health.get("ok"):
        raise SystemExit("Grok Bot gateway not healthy — keep app open.")

    agents = call(base, headers, "/api/listAgents", {})
    updated = 0
    for agent in agents:
        desc = (agent.get("description") or "").strip()
        if "ZERO-LOSS" not in desc or "YOUR COMPUTER + BROWSER" not in desc:
            parts = [desc] if desc else []
            if "ZERO-LOSS" not in desc:
                parts.insert(0, "ZERO-LOSS: Never delete/wipe/truncate, edit secrets, deploy prod, or run rm/docker prune/git force.")
            if "YOUR COMPUTER + BROWSER" not in desc:
                parts.append(ACCESS_BLURB)
            desc = "\n\n".join(p for p in parts if p).strip()
            call(
                base,
                headers,
                "/api/updateAgent",
                {
                    "id": agent["id"],
                    "profile": {
                        "name": agent["name"],
                        "description": desc,
                        "title": agent.get("title") or "",
                    },
                },
            )
            updated += 1

    print(f"  updated {updated} agent profiles with browser + ACCESS blurb")

    call(
        base,
        headers,
        "/api/setHostSettings",
        {
            "localToolPermission": "always",
            "egressTunnelEnabled": True,
            "mcpCustomInstructions": {"hive-access": HIVE_MCP_INSTRUCTIONS[:8000]},
        },
    )
    print("  remote host settings → always-allow local tools + egress tunnel")

    for agent in agents:
        try:
            call(
                base,
                headers,
                "/api/sendPrompt",
                {"agentId": agent["id"], "prompt": CONTINUE_PROMPT},
            )
            print(f"  continue → {agent['name']}")
        except SystemExit:
            print(f"  skip continue → {agent['name']} (gateway blip)")
        time.sleep(0.5)

    print("\nDone. Grok Bot agents can:")
    print("  • Browse evenslouis.ca apps on their computer (browser)")
    print("  • Read/run on your Mac repo (local tools: always)")
    print("  • SSH to VPS via Mac shell")
    print(f"\nReference: {ACCESS_DOC}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
