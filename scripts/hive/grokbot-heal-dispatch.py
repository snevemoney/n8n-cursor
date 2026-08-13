#!/usr/bin/env python3
"""Dispatch post-heal status to Grok Bot agents — read-only verify, no destructive fixes.

Usage:
  python3 scripts/hive/grokbot-heal-dispatch.py
"""
from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

CONN_PATH = Path.home() / ".grokbot/local-exec-daemon-connection.json"

HEAL_STATUS = """
POST-HEAL STATUS (Cursor verified — do NOT run destructive fixes):

FIXED:
- OpenClaw gateway restored (health 200, /claw public 200)
- smoke-life-business-ops.sh: 8/8 PASS
- smoke-ce-builder.sh: 6/6 PASS
- n8n: evenslouis.ca only (no n8ncloud in catalog)
- Philanthropy restarted and healthy

STILL MONITOR:
- OpenClaw PM2 restart counter high — report only, do NOT pm2 delete/restart without operator
- G1 golden path may show 2/3 until Scorpion cache refreshes — verify via golden-paths JSON
- Disk ~90% — report only, no prune

YOUR JOB (read-only):
1. Browser: https://evenslouis.ca/scorpion/api/hive/golden-paths
2. Mac SSH: ssh root@69.62.66.78 'cd /root/domain-paths/n8n-cursor && bash scripts/hive/smoke-life-business-ops.sh'
3. Report PASS/FAIL — NEVER delete, rm, docker prune, git force, edit secrets, or restart services

Tier 3 → operator on /pro or https://evenslouis.ca/n8n only.
"""

AGENTS = [
    "Big Boss",
    "Watchdog Ops",
    "Life & Business Ops",
    "HITL Operator",
    "n8n Automation",
    "CE & Leads",
    "Telegram Console",
    "Forge Builder",
    "Scout Lead Gen",
]


def main() -> int:
    conn = json.loads(CONN_PATH.read_text())
    base = conn["baseUrl"].rstrip("/")
    headers = {
        "Authorization": f"Bearer {conn['token']}",
        "Content-Type": "application/json",
        **conn.get("headers", {}),
    }

    def call(path: str, body: dict) -> dict:
        req = urllib.request.Request(
            base + path, json.dumps(body).encode(), headers=headers, method="POST"
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode())

    agents = call("/api/listAgents", {})
    by_name = {a["name"]: a["id"] for a in agents}

    for name in AGENTS:
        aid = by_name.get(name)
        if not aid:
            print(f"skip {name} — not found")
            continue
        call("/api/sendPrompt", {"agentId": aid, "prompt": f"MISSION — Post-heal verify (read-only)\n\n{HEAL_STATUS}"})
        print(f"  ✓ {name}")

    print("\nHeal status dispatched to all agents.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
