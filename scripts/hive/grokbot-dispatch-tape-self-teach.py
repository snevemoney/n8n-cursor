#!/usr/bin/env python3
"""Send tape-self-teach to each of the 17 Grok desks as a separate prompt.

Each agent reads the 18 full.txt files through its own job-card lens and
writes ONLY docs/hive/outer-heaven/CONTENT/job-cards/takes/{slug}.md.

Usage:
  python3 scripts/hive/grokbot-dispatch-tape-self-teach.py
  python3 scripts/hive/grokbot-dispatch-tape-self-teach.py --dry-run
  python3 scripts/hive/grokbot-dispatch-tape-self-teach.py --agent "Forge"
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

CONN_PATH = Path.home() / ".grokbot/local-exec-daemon-connection.json"
REPO = Path(__file__).resolve().parents[2]
TAKES = REPO / "docs/hive/outer-heaven/CONTENT/job-cards/takes"

_mission_spec = importlib.util.spec_from_file_location(
    "tape_self_teach_mission", Path(__file__).resolve().parent / "tape-self-teach-mission.py"
)
_mission_mod = importlib.util.module_from_spec(_mission_spec)
assert _mission_spec.loader is not None
_mission_spec.loader.exec_module(_mission_mod)
CORRELATION = _mission_mod.CORRELATION
AGENTS = _mission_mod.AGENTS
mission = _mission_mod.mission
targets = _mission_mod.targets


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
    ap = argparse.ArgumentParser(description="Dispatch independent tape-self-teach to 17 Grok agents")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--agent", help="Dispatch to one core agent by name")
    args = ap.parse_args()

    desk_targets = targets(args.agent)

    base, headers = load_gateway()
    health = call(base, headers, "/health")
    if not health.get("ok"):
        raise SystemExit("Gateway not healthy — keep Grok Bot open and signed in.")
    print(
        f"  gateway ok  isBusy={health.get('isBusy')}  "
        f"awaitingApproval={health.get('busyOnlyAwaitingApproval')}"
    )

    agents = call(base, headers, "/api/listAgents", {})
    if not isinstance(agents, list):
        raise SystemExit("listAgents did not return a list")
    by_name = {a["name"]: a["id"] for a in agents if isinstance(a, dict) and a.get("name")}

    missing = [n for n, _ in desk_targets if n not in by_name]
    if missing and not args.dry_run:
        raise SystemExit(f"Agents not in gateway: {missing}")

    try:
        out = call(base, headers, "/api/setHostSettings", {"localToolPermission": "always"})
        perm = out.get("localToolPermission") if isinstance(out, dict) else "always"
        print(f"  localToolPermission → {perm}")
    except SystemExit:
        print("  (could not set localToolPermission — approve tools in Grok Bot if prompted)")

    queued = 0
    for name, slug in desk_targets:
        prompt = mission(name, slug)
        agent_id = by_name.get(name)
        if args.dry_run:
            print(f"Would dispatch → {name}  ({len(prompt.split())} words)  → takes/{slug}.md")
            continue
        if not agent_id:
            print(f"  skip {name} — not in gateway")
            continue
        print(f"Dispatching → {name}…", flush=True)
        try:
            call(base, headers, "/api/sendPrompt", {"agentId": agent_id, "prompt": prompt})
            print("  ✓ queued")
            queued += 1
        except SystemExit as exc:
            print(f"  ✗ {exc}")
        time.sleep(1)

    if args.dry_run:
        print(f"\nDry run: {len(desk_targets)} unique missions. No prompts sent.")
        return 0
    print(f"\nQueued {queued}/{len(desk_targets)} independent tape-self-teach missions ({CORRELATION}).")
    print("Open Grok Bot — each desk runs its own walk and writes takes/{slug}.md.")
    print("Approve local-tool prompts if Grok Bot asks. Hard step (send/pay/deploy) stays HITL.")
    return 0 if queued == len(desk_targets) else 1


if __name__ == "__main__":
    sys.exit(main())
