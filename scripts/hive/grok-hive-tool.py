#!/usr/bin/env python3
"""Mac CLI: invoke Philanthropy hive tools via SSH (tokens stay on VPS).

Usage:
  python3 scripts/hive/grok-hive-tool.py --grok-agent "Watchdog Ops" --tool scorpion_health
  python3 scripts/hive/grok-hive-tool.py --grok-agent "Big Boss" --list-tools
  python3 scripts/hive/grok-hive-tool.py --grok-agent "Watchdog Ops" --tool scorpion_health --dry-run
"""
from __future__ import annotations

import argparse
import base64
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
_roles_spec = importlib.util.spec_from_file_location(
    "grokbot_agent_roles", Path(__file__).resolve().parent / "grokbot-agent-roles.py"
)
_roles_mod = importlib.util.module_from_spec(_roles_spec)
assert _roles_spec.loader is not None
_roles_spec.loader.exec_module(_roles_mod)
allowed_tools = _roles_mod.allowed_tools
philanthropy_agent_id = _roles_mod.philanthropy_agent_id
tool_allowed = _roles_mod.tool_allowed

VPS_HOST = "root@69.62.66.78"
PHIL_ENV = "/opt/philanthropy/.env"
PHIL_AGENT_URL = "http://127.0.0.1:3002/api/agent"
PUBLIC_GOLDEN_PATHS = "https://evenslouis.ca/scorpion/api/hive/golden-paths"


def public_fast_path(tool: str, grok_agent: str) -> dict | None:
    """Optional read-only shortcuts without SSH."""
    if tool != "scorpion_health":
        return None
    if grok_agent not in {
        "Big Boss",
        "Watchdog Ops",
        "Life & Business Ops",
        "Telegram Console",
        "Security Reviewer",
    }:
        return None
    try:
        import urllib.request

        with urllib.request.urlopen(PUBLIC_GOLDEN_PATHS, timeout=30) as resp:
            gp = json.loads(resp.read().decode())
        return {
            "ok": True,
            "source": "public_fast_path",
            "tool": tool,
            "data": {
                "goldenPaths": gp,
                "hint": "Full scorpion_health via Philanthropy requires SSH for bridge env",
            },
        }
    except Exception as exc:
        return None


def ssh_philanthropy_tool(agent_id: str, tool: str, params: dict) -> dict:
    payload = json.dumps({"tool": tool, "params": params, "agentId": agent_id})
    payload_b64 = base64.b64encode(payload.encode()).decode()
    remote_script = f"""set -a
[ -f {PHIL_ENV} ] && . {PHIL_ENV}
set +a
TOKEN="${{HIVE_MACHINE_TOKEN:-}}"
if [ -z "$TOKEN" ]; then
  echo '{{"ok":false,"code":"MISSING_TOKEN","message":"HIVE_MACHINE_TOKEN not set on VPS"}}'
  exit 3
fi
BODY=$(echo '{payload_b64}' | base64 -d)
curl -sS -X POST {PHIL_AGENT_URL} \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d "$BODY"
"""
    proc = subprocess.run(
        ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", VPS_HOST, "bash", "-s"],
        input=remote_script,
        capture_output=True,
        text=True,
        timeout=120,
    )
    if proc.returncode != 0 and not proc.stdout.strip():
        raise RuntimeError(f"SSH failed ({proc.returncode}): {proc.stderr.strip()[:500]}")
    raw = proc.stdout.strip() or proc.stderr.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Invalid JSON from VPS: {raw[:500]}") from exc


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--grok-agent", required=True, help="Grok Bot agent display name")
    ap.add_argument("--tool", help="Hive tool name")
    ap.add_argument("--params", default="{}", help="JSON params for tool")
    ap.add_argument("--list-tools", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-fast-path", action="store_true")
    ap.add_argument("--json", action="store_true", help="Force JSON output")
    args = ap.parse_args()

    agent_id = philanthropy_agent_id(args.grok_agent)
    if not agent_id:
        err = {"ok": False, "code": "UNKNOWN_GROK_AGENT", "message": f"Unknown Grok agent: {args.grok_agent}"}
        print(json.dumps(err, indent=2))
        return 1

    if args.list_tools:
        tools = allowed_tools(args.grok_agent) or []
        print(json.dumps({"grokAgent": args.grok_agent, "philanthropyAgentId": agent_id, "tools": tools}, indent=2))
        return 0

    if not args.tool:
        print("Missing --tool (or use --list-tools)", file=sys.stderr)
        return 1

    ok, msg = tool_allowed(args.grok_agent, args.tool)
    if not ok:
        out = {"ok": False, "code": "ROLE_BLOCKED", "message": msg, "grokAgent": args.grok_agent}
        print(json.dumps(out, indent=2))
        return 2

    try:
        params = json.loads(args.params)
    except json.JSONDecodeError as exc:
        print(json.dumps({"ok": False, "code": "BAD_PARAMS", "message": str(exc)}), indent=2)
        return 1

    if args.dry_run:
        print(
            json.dumps(
                {
                    "ok": True,
                    "dryRun": True,
                    "grokAgent": args.grok_agent,
                    "philanthropyAgentId": agent_id,
                    "tool": args.tool,
                    "params": params,
                },
                indent=2,
            )
        )
        return 0

    if not args.no_fast_path:
        fast = public_fast_path(args.tool, args.grok_agent)
        if fast is not None:
            print(json.dumps(fast, indent=2))
            return 0

    try:
        result = ssh_philanthropy_tool(agent_id, args.tool, params)
    except RuntimeError as exc:
        print(json.dumps({"ok": False, "code": "SSH_ERROR", "message": str(exc)}, indent=2))
        return 3

    print(json.dumps(result, indent=2))
    if isinstance(result, dict):
        if result.get("code") in ("ROLE_BLOCKED", "TIER3_BLOCKED"):
            return 2
        if result.get("ok") is False and result.get("error"):
            return 3
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
