#!/usr/bin/env python3
"""Dispatch missions to Outer Heaven Grok Bot agents (with hive tool commands)."""
from __future__ import annotations

import argparse
import importlib.util
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

_conn_dir = Path(__file__).resolve().parent
_cookbook_spec = importlib.util.spec_from_file_location(
    "grokbot_tool_cookbook", _conn_dir / "grokbot-tool-cookbook.py"
)
_cookbook_mod = importlib.util.module_from_spec(_cookbook_spec)
assert _cookbook_spec.loader is not None
_cookbook_spec.loader.exec_module(_cookbook_mod)
TOOL_USAGE_RULES = _cookbook_mod.TOOL_USAGE_RULES

CONN_PATH = Path.home() / ".grokbot/local-exec-daemon-connection.json"
REPO = Path(__file__).resolve().parents[2]

SAFETY_PREAMBLE = """SAFETY (mandatory): Read-only + approved scripts only. NEVER delete/wipe/truncate, edit secrets/.env/openclaw.json, docker volume rm, git force, prod deploy, or pm2 delete. If repair needs destructive action → STOP and tell operator.

N8N (mandatory): ONLY https://evenslouis.ca/n8n + https://evenslouis.ca/webhook/* — NEVER n8ncloud.tech.

TOOLS: Use python3 scripts/hive/grok-hive-tool.py --grok-agent "<Your Name>" --tool <tool> before guessing state.

SCORPION: backend register API only — prefer grok-hive-tool.py over raw curl when possible."""


def fetch_status_snapshot() -> str:
    lines = ["Ground truth (live fetch):"]
    try:
        import urllib.request

        with urllib.request.urlopen(
            "https://evenslouis.ca/scorpion/api/hive/golden-paths", timeout=20
        ) as resp:
            gp = json.loads(resp.read().decode())
        pass_count = gp.get("passCount", "?")
        total = gp.get("total", "?")
        lines.append(f"- Golden paths: {pass_count}/{total} PASS (evenslouis.ca API)")
    except Exception as exc:
        lines.append(f"- Golden paths: fetch failed ({exc})")

    tool = REPO / "scripts/hive/grok-hive-tool.py"
    if tool.is_file():
        try:
            proc = subprocess.run(
                [
                    sys.executable,
                    str(tool),
                    "--grok-agent",
                    "Watchdog Ops",
                    "--tool",
                    "scorpion_health",
                    "--no-fast-path",
                ],
                capture_output=True,
                text=True,
                timeout=90,
            )
            if proc.stdout.strip():
                data = json.loads(proc.stdout)
                if data.get("ok"):
                    lines.append("- scorpion_health (Philanthropy SSH): OK")
                else:
                    lines.append(f"- scorpion_health: {data.get('message') or data.get('code')}")
        except Exception as exc:
            lines.append(f"- scorpion_health SSH: skipped ({exc})")

    lines.append("- Tier 3 operator-only: Gmail OAuth in n8n UI, real builder on /pro, money/client send")
    lines.append("- Disk >85% on VPS → report only; do NOT prune/delete without operator OK")
    return "\n".join(lines)


def mission_block(agent: str, body: str) -> str:
    return f"""MISSION — {body}

{SAFETY_PREAMBLE}

{TOOL_USAGE_RULES}

DONE_WHEN: See mission steps above."""


REGISTRY_PATH = REPO / "scripts/hive/agent-roster-registry.json"

_roster_spec = importlib.util.spec_from_file_location(
    "agent_roster_registry", REPO / "scripts/hive/agent-roster-registry.py"
)
_roster_mod = importlib.util.module_from_spec(_roster_spec)
assert _roster_spec.loader is not None
_roster_spec.loader.exec_module(_roster_mod)
resolve_roster_name = _roster_mod.resolve_roster_name


def load_roster() -> list[dict]:
    if not REGISTRY_PATH.is_file():
        return []
    data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    return data.get("agents", [])


def roster_mission(row: dict, snap: str) -> str:
    name = row["displayName"]
    tools = row.get("workflow") or []
    tool_lines = "\n".join(
        f'{i + 1}. python3 scripts/hive/grok-hive-tool.py --grok-agent "{name}" --tool {t}'
        for i, t in enumerate(tools[:4])
    )
    web = ""
    if row.get("webAccess") == "required":
        urls = ", ".join(row.get("webSurfaces") or ["https://evenslouis.ca/"])
        web = f"\nUse browser (read-only) on: {urls}"
    return f"""{mission_block(name, row.get("focus", name))}

{row.get("mission", "")}

Execute:
{tool_lines}
{web}

{snap}

DONE_WHEN: {row.get("doneWhen", "Outcome registered")}
"""


def missions_for_squad(squad: str) -> dict[str, str]:
    snap = fetch_status_snapshot()
    out: dict[str, str] = {}
    for row in load_roster():
        if row["squad"] == squad:
            out[row["displayName"]] = roster_mission(row, snap)
    return out


def mission_for_roster_agent(name: str) -> str | None:
    snap = fetch_status_snapshot()
    resolved = resolve_roster_name(name)
    for row in load_roster():
        if row["displayName"] == resolved or row["id"] == resolved or row["displayName"] == name or row["id"] == name:
            return roster_mission(row, snap)
        for old in row.get("fusedFrom") or []:
            if old == name:
                return roster_mission(row, snap)
    return None


def squad_lead_for_lane(lane: str) -> str | None:
    lane_map = {
        "gtm": "ProofCheck GTM Lead",
        "revenue": "Revenue Intel",
        "finance": "Scoreboard Keeper",
        "web": "Portfolio Webmaster",
        "video": "Video Editor",
        "gaming": "Godot Engineer",
        "animation": "2D Animator",
        "marketing": "SEO Architect",
        "sales": "Lead Qualifier",
        "delivery": "Onboarding Orchestrator",
    }
    return lane_map.get(lane)


def build_missions() -> dict[str, str]:
    snap = fetch_status_snapshot()
    return {
        "Big Boss": f"""{mission_block("Big Boss", "Hive status rollup (execute now)")}

1. python3 scripts/hive/grok-hive-tool.py --grok-agent "Big Boss" --tool scorpion_health
2. python3 scripts/hive/grok-hive-tool.py --grok-agent "Big Boss" --tool scorpion_list_missions --params '{{"limit":20}}'
3. Summarize PASS vs FAIL vs operator-only (Tier 3). One best next action if Tier 3.

{snap}

Links only if Tier 3: https://evenslouis.ca/pro · https://evenslouis.ca/n8n""",
        "Watchdog Ops": f"""{mission_block("Watchdog Ops", "Verify hive health")}

1. python3 scripts/hive/grok-hive-tool.py --grok-agent "Watchdog Ops" --tool scorpion_health
2. python3 scripts/hive/grok-hive-tool.py --grok-agent "Watchdog Ops" --tool n8n_list_workflows
3. ssh -o BatchMode=yes root@69.62.66.78 'cd /root/domain-paths/n8n-cursor && bash scripts/hive/hive-watchdog.sh'
4. ssh -o BatchMode=yes root@69.62.66.78 'cd /root/domain-paths/n8n-cursor && bash scripts/hive/smoke-life-business-ops.sh'

Report PASS/FAIL table. No destructive heal without operator approval.""",
        "Life & Business Ops": f"""{mission_block("Life & Business Ops", "Verify lanes 1–4")}

{snap}

1. ssh ... smoke-life-business-ops.sh (8/8)
2. ssh ... smoke-ce-builder.sh (6/6)
3. If FAIL → life-business-ops-fix.sh then re-smoke (never delete volumes)
Gmail OAuth → operator at https://evenslouis.ca/n8n""",
        "HITL Operator": f"""{mission_block("HITL Operator", "Tier 3 digest")}

1. python3 scripts/hive/grok-hive-tool.py --grok-agent "HITL Operator" --tool ce_list_actions
2. python3 scripts/hive/grok-hive-tool.py --grok-agent "HITL Operator" --tool scorpion_list_missions --params '{{"limit":50}}'
Numbered list with /pro (money) or /n8n (OAuth) links. Never approve money/send.""",
        "n8n Automation": f"""{mission_block("n8n Automation", "n8n hive workflows evenslouis ONLY")}

1. python3 scripts/hive/grok-hive-tool.py --grok-agent "n8n Automation" --tool n8n_list_workflows
2. Verify scripts/hive/n8n-catalog.json — zero n8ncloud.tech
3. ssh ... n8n-activate-all-hive-workflows.sh
FAIL if any n8ncloud.tech reference.""",
        "CE & Leads": f"""{mission_block("CE & Leads", "CE bridge sanity")}

1. curl -sS https://evenslouis.ca/pro/api/health
2. python3 scripts/hive/grok-hive-tool.py --grok-agent "CE & Leads" --tool ce_list_actions
3. python3 scripts/hive/grok-hive-tool.py --grok-agent "CE & Leads" --tool ce_lookup_lead --params '{{"query":"recent"}}'
Never mutate leads or deals.""",
        "Telegram Console": f"""{mission_block("Telegram Console", "Shortcut parity")}

1. python3 scripts/hive/grok-hive-tool.py --grok-agent "Telegram Console" --tool scorpion_health
2. diff scripts/hive/outer-heaven-shortcuts/index.js vs VPS plugin (read-only)
No scp/pm2 without operator OK.""",
        "Forge Builder": f"""{mission_block("Forge Builder", "Builder lane smoke")}

1. ssh ... smoke-ce-builder.sh (6/6 expected stub)
2. python3 scripts/hive/grok-hive-tool.py --grok-agent "Forge Builder" --tool scorpion_register_outcome --params '{{"correlationId":"build-check","jobType":"build.smoke","status":"done","summary":"smoke run"}}'
No prod builds — /pro Tier 3.""",
        "Scout Lead Gen": f"""{mission_block("Scout Lead Gen", "Lead surface read-only")}

1. python3 scripts/hive/grok-hive-tool.py --grok-agent "Scout Lead Gen" --tool ce_lookup_lead --params '{{"query":"recent"}}'
2. curl -sS https://evenslouis.ca/pro/api/health
/pro link if operator action needed.""",
        "Vault Librarian": f"""{mission_block("Vault Librarian", "Capture + Obsidian verify")}

1. python3 scripts/hive/os/outer-heaven-brief.py --agent Librarian
2. bash scripts/hive/outer-heaven/run-capture-cycle.sh
3. python3 scripts/hive/outer-heaven/link-cursor-chats.py
Report capture freshness — never delete chronicle.""",
        "Engineering Lead": f"""{mission_block("Engineering Lead", "Engineering smokes")}

1. python3 scripts/hive/grok-hive-tool.py --grok-agent "Engineering Lead" --tool scorpion_health
2. ssh ... smoke-life-business-ops.sh
3. cd /Users/evenslouis/n8n-cursor && pnpm typecheck (if code work in scope)
Register outcome when DONE_WHEN met; hand big refactors to Cursor.""",
        "Creative Studio": f"""{mission_block("Creative Studio", "Creative lane check")}

1. python3 scripts/hive/os/outer-heaven-brief.py --agent "Creative Studio" --read THEMES/INDEX.md
2. python3 scripts/hive/grok-hive-tool.py --grok-agent "Creative Studio" --tool scorpion_register_outcome --params '{{"correlationId":"creative-check","jobType":"creative.research","status":"done","summary":"lane check"}}'
THEMES/* only — no CE money tools.""",
        "Security Reviewer": f"""{mission_block("Security Reviewer", "Security posture")}

1. python3 scripts/hive/grok-hive-tool.py --grok-agent "Security Reviewer" --tool scorpion_health
2. python3 scripts/hive/grok-hive-tool.py --grok-agent "Security Reviewer" --tool hitl_gate_status
3. curl -sS https://evenslouis.ca/scorpion/api/hive/golden-paths
Propose findings via hitl_propose_action — never edit secrets.""",
    }


LANE_AGENT: dict[str, str] = {
    "ops": "Big Boss",
    "business": "CE & Leads",
    "engineering": "Engineering Lead",
    "health": "Watchdog Ops",
    "hitl": "HITL Operator",
    "n8n": "n8n Automation",
    "research": "Web Intelligence Hunter",
    "knowledge": "Vault Librarian",
    "security": "Security Reviewer",
    "creative": "Creative Studio",
    "gtm": "ProofCheck GTM",
    "revenue": "Revenue Intel",
    "finance": "Scoreboard Keeper",
    "web": "Web Studio",
    "video": "Video Studio",
    "gaming": "Godot Engineer",
    "animation": "Animation Studio",
    "marketing": "Growth & SEO Lead",
    "sales": "Lead Ops",
    "delivery": "Client Delivery Lead",
}


def build_digest_mission() -> str:
    snap = fetch_status_snapshot()
    return f"""MISSION — Daily operator digest (Grok primary)

{SAFETY_PREAMBLE}

1. curl -sS https://evenslouis.ca/webhook/hive-operator-digest (or golden-paths if webhook unavailable)
2. python3 scripts/hive/grok-hive-tool.py --grok-agent "Big Boss" --tool scorpion_list_missions --params '{{"limit":20}}'
3. Read docs/hive/outer-heaven/WEEKLY_SCOREBOARD.md tail

{snap}

DONE_WHEN: One digest message. Links /pro · /n8n only if Tier 3."""


def build_event_mission(severity: str, lane: str, summary: str, correlation_id: str) -> tuple[str, str]:
    agent = LANE_AGENT.get(lane, "Big Boss")
    if severity == "CRITICAL":
        agent = "Big Boss"
    prompt = f"""OPERATOR EVENT — severity={severity} lane={lane} correlationId={correlation_id}

{SAFETY_PREAMBLE}

Summary: {summary}

Actions:
1. python3 scripts/hive/grok-hive-tool.py --grok-agent "{agent}" --tool scorpion_health
2. Verify live state with role-appropriate tools (see grok-hive-tool.py --list-tools)
3. If Tier 3 → link https://evenslouis.ca/pro or https://evenslouis.ca/n8n — never auto-approve

DONE_WHEN: Operator knows what happened and correlationId {correlation_id} is referenced."""
    return agent, prompt


def load_gateway() -> tuple[str, dict[str, str]]:
    conn = json.loads(CONN_PATH.read_text())
    return conn["baseUrl"].rstrip("/"), {
        "Authorization": f"Bearer {conn['token']}",
        "Content-Type": "application/json",
        **conn.get("headers", {}),
    }


def call(base: str, headers: dict, path: str, body: dict | None = None, retries: int = 5) -> dict:
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            data = None if body is None else json.dumps(body).encode()
            method = "POST" if body is not None else "GET"
            req = urllib.request.Request(base + path, data=data, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=90) as resp:
                raw = resp.read().decode()
                return json.loads(raw) if raw else {}
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as e:
            last_err = e
            time.sleep(2 * (attempt + 1))
    raise SystemExit(f"Gateway call failed {path}: {last_err}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--agent", help="Dispatch to one agent by name")
    parser.add_argument("--event", help="Dispatch event mission by severity (WARN|CRITICAL|INFO)")
    parser.add_argument("--lane", default="ops", help="Event lane")
    parser.add_argument("--summary", default="", help="Event summary for --event")
    parser.add_argument("--correlation-id", default="", help="correlationId for --event")
    parser.add_argument("--squad", help="Dispatch roster missions for squad id")
    parser.add_argument("--roster-agent", help="Dispatch mission for one roster agent (displayName or id)")
    parser.add_argument("--digest", action="store_true", help="Dispatch Big Boss daily digest mission")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    missions = build_missions()

    base, headers = load_gateway()
    health = call(base, headers, "/health")
    if not health.get("ok"):
        raise SystemExit("Gateway not healthy — keep Grok Bot open and signed in.")

    agents = call(base, headers, "/api/listAgents", {})
    by_name = {a["name"]: a["id"] for a in agents}

    if args.squad:
        squad_missions = missions_for_squad(args.squad)
        if not squad_missions:
            raise SystemExit(f"No roster agents for squad: {args.squad}")
        targets = list(squad_missions.items())
    elif args.roster_agent:
        mission = mission_for_roster_agent(args.roster_agent)
        if not mission:
            raise SystemExit(f"Unknown roster agent: {args.roster_agent}")
        name = args.roster_agent
        for row in load_roster():
            if row["displayName"] == args.roster_agent or row["id"] == args.roster_agent:
                name = row["displayName"]
                break
        targets = [(name, mission)]
    elif args.digest:
        targets = [("Big Boss", build_digest_mission())]
    elif args.event:
        cid = args.correlation_id or f"oh-{int(time.time())}"
        agent_name, prompt = build_event_mission(args.event.upper(), args.lane, args.summary or args.event, cid)
        targets = [(agent_name, prompt)]
    elif args.agent:
        if args.agent not in missions:
            raise SystemExit(f"Unknown agent: {args.agent}")
        targets = [(args.agent, missions[args.agent])]
    else:
        targets = list(missions.items())

    missing = [n for n, _ in targets if n not in by_name]
    if missing and not args.dry_run:
        hint = "run grokbot-setup-agents.py and/or grokbot-setup-roster.py first"
        raise SystemExit(f"Agents not found ({hint}): {missing}")
    if missing and args.dry_run:
        print(f"  (dry-run: not yet in gateway — {missing})")

    try:
        out = call(base, headers, "/api/setHostSettings", {"localToolPermission": "always"})
        perm = out.get("localToolPermission") if isinstance(out, dict) else "always"
        print(f"  localToolPermission → {perm}")
    except SystemExit:
        print("  (could not set localToolPermission via gateway — approve tools in Grok Bot if prompted)")

    for name, prompt in targets:
        agent_id = by_name.get(name)
        if args.dry_run:
            if agent_id:
                print(f"Would dispatch to {name} ({agent_id[:8]}…)")
            else:
                print(f"Would dispatch to {name} (not provisioned — run grokbot-setup-roster.py)")
            continue
        if not agent_id:
            print(f"  skip {name} — not in gateway")
            continue
        print(f"Dispatching → {name}…", flush=True)
        try:
            call(base, headers, "/api/sendPrompt", {"agentId": agent_id, "prompt": prompt})
            print("  ✓ queued")
        except urllib.error.HTTPError as e:
            print(f"  ✗ HTTP {e.code}: {e.read().decode()[:200]}")
        time.sleep(1)

    print("\nMissions dispatched. Open Grok Bot sidebar — agents will run on their computer.")
    print("Approve any local tool / SSH prompts in Grok Bot when asked.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
