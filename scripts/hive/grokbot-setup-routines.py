#!/usr/bin/env python3
"""Provision Grok agent routines from grok-agent-routines.json.

Usage:
  python3 scripts/hive/grokbot-setup-routines.py --dry-run --all
  python3 scripts/hive/grokbot-setup-routines.py --core --force-update
  python3 scripts/hive/grokbot-setup-routines.py --wave 1
  python3 scripts/hive/grokbot-setup-routines.py --agent "Watchdog Ops"
  python3 scripts/hive/grokbot-setup-routines.py --engine launchd --dispatch
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

_conn_dir = Path(__file__).resolve().parent
_setup_spec = importlib.util.spec_from_file_location(
    "grokbot_setup_agents", _conn_dir / "grokbot-setup-agents.py"
)
_setup_mod = importlib.util.module_from_spec(_setup_spec)
assert _setup_spec.loader is not None
_setup_spec.loader.exec_module(_setup_mod)

_presets_spec = importlib.util.spec_from_file_location(
    "grok_schedule_presets", _conn_dir / "grok-schedule-presets.py"
)
_presets_mod = importlib.util.module_from_spec(_presets_spec)
assert _presets_spec.loader is not None
_presets_spec.loader.exec_module(_presets_mod)

load_gateway = _setup_mod.load_gateway
call = _setup_mod.call
load_automation_registry = _setup_mod.load_automation_registry
save_automation_registry = _setup_mod.save_automation_registry
automation_key = _setup_mod.automation_key
AUTOMATION_REGISTRY = _setup_mod.AUTOMATION_REGISTRY

ROUTINES_PATH = _conn_dir / "grok-agent-routines.json"
TRIGGER_ROUTINES_PATH = _conn_dir / "grok-trigger-routines.json"
LAUNCHD_MANIFEST = Path.home() / ".grokbot/grok-launchd-routines.json"


def load_routines() -> dict:
    if not ROUTINES_PATH.is_file():
        raise SystemExit(f"Missing {ROUTINES_PATH} — run build-grok-agent-routines.py --write")
    return json.loads(ROUTINES_PATH.read_text(encoding="utf-8"))


def spec_hash(spec: dict) -> str:
    payload = json.dumps(spec, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()[:16]


def list_agent_automations(base: str, headers: dict, agent_id: str) -> list[dict]:
    rows: list[dict] = []
    for path, body in (
        ("/api/listAgentAutomations", {"id": agent_id}),
        ("/api/listAgentAutomations", {"agentId": agent_id}),
    ):
        try:
            _, result = call(base, headers, "POST", path, body)
            if isinstance(result, list):
                rows.extend([r for r in result if isinstance(r, dict)])
            elif isinstance(result, dict):
                for key in ("automations", "items"):
                    for r in result.get(key) or []:
                        if isinstance(r, dict):
                            rows.append(r)
        except SystemExit:
            continue
    return rows


def delete_automation(base: str, headers: dict, agent_id: str, auto_id: str) -> bool:
    for path, body in (
        ("/api/deleteAgentAutomation", {"id": agent_id, "automationId": auto_id}),
        ("/api/deleteAgentAutomation", {"agentId": agent_id, "automationId": auto_id}),
        ("/api/deleteAgentAutomation", {"id": agent_id, "name": auto_id}),
    ):
        try:
            call(base, headers, "POST", path, body)
            return True
        except SystemExit:
            continue
    return False


def load_trigger_routines() -> dict:
    if not TRIGGER_ROUTINES_PATH.is_file():
        return {"triggers": []}
    return json.loads(TRIGGER_ROUTINES_PATH.read_text(encoding="utf-8"))


def build_spec(row: dict) -> dict | None:
    routine = row.get("routine")
    if not routine or not routine.get("enabled", True):
        return None
    explicit_trigger = routine.get("trigger")
    if explicit_trigger and explicit_trigger.get("type") != "cron":
        return {
            "name": routine["name"],
            "prompt": routine["prompt"].strip(),
            "enabled": True,
            "trigger": explicit_trigger,
        }
    schedule = routine["schedule"]
    if _presets_mod.is_launchd_preset(schedule):
        return None
    cron = _presets_mod.preset_to_cron(schedule)
    if not cron:
        return None
    return {
        "name": routine["name"],
        "prompt": routine["prompt"].strip(),
        "enabled": True,
        "trigger": {"type": "cron", "schedule": cron},
    }


def build_trigger_spec(entry: dict) -> dict | None:
    if not entry.get("enabled", True):
        return None
    trigger = entry.get("trigger")
    if not trigger or trigger.get("type") == "cron":
        return None
    return {
        "name": entry["name"],
        "prompt": entry["prompt"].strip(),
        "enabled": True,
        "trigger": trigger,
    }


def filter_rows(
    data: dict,
    *,
    core: bool,
    wave: int | None,
    agent_name: str | None,
    all_agents: bool,
    engine: str | None,
) -> list[dict]:
    rows = data["agents"]
    if agent_name:
        return [r for r in rows if r["displayName"] == agent_name or r.get("id") == agent_name]
    out = rows
    if core:
        out = [r for r in out if r.get("core")]
    elif wave is not None:
        out = [r for r in out if r.get("status") == f"wave{wave}"]
    elif not all_agents:
        out = [r for r in out if r.get("core")]
    if engine == "launchd":
        out = [
            r
            for r in out
            if r.get("routine")
            and _presets_mod.is_launchd_preset(r["routine"]["schedule"])
        ]
    elif engine == "cron":
        out = [
            r
            for r in out
            if r.get("routine")
            and not _presets_mod.is_launchd_preset(r["routine"]["schedule"])
        ]
    return out


def save_launchd_manifest(rows: list[dict]) -> None:
    manifest = []
    for row in rows:
        routine = row.get("routine")
        if not routine:
            continue
        if not _presets_mod.is_launchd_preset(routine["schedule"]):
            continue
        resolved = _presets_mod.resolve_preset(routine["schedule"])
        manifest.append(
            {
                "displayName": row["displayName"],
                "name": routine["name"],
                "schedule": routine["schedule"],
                "launchd": resolved.get("launchd"),
                "promptPreview": routine["prompt"][:120],
            }
        )
    LAUNCHD_MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    LAUNCHD_MANIFEST.write_text(json.dumps({"routines": manifest}, indent=2) + "\n", encoding="utf-8")


def dispatch_launchd_rows(rows: list[dict]) -> None:
    for row in rows:
        name = row["displayName"]
        routine = row["routine"]
        if not routine:
            continue
        print(f"  launchd dispatch → {name} ({routine['name']})")
        try:
            import subprocess

            subprocess.run(
                [
                    sys.executable,
                    str(_conn_dir / "grokbot-dispatch-missions.py"),
                    "--roster-agent" if not row.get("core") else "--agent",
                    name,
                ],
                check=False,
                timeout=120,
            )
        except Exception as exc:
            print(f"    skip dispatch: {exc}")


def provision_trigger_routines(
    *,
    base: str,
    headers: dict,
    by_name: dict,
    dry_run: bool,
    force_update: bool,
) -> tuple[int, int, int]:
    """Provision event-trigger routines from grok-trigger-routines.json."""
    data = load_trigger_routines()
    entries = [e for e in data.get("triggers", []) if build_trigger_spec(e)]
    if dry_run:
        print(f"Trigger routines: {len(entries)} enabled")
        for entry in entries:
            spec = build_trigger_spec(entry)
            assert spec
            print(f"  [trigger:{spec['trigger']['type']}] {entry['agent']} — {entry['name']}")
        return 0, 0, 0

    registry = load_automation_registry()
    created = updated = skipped = 0
    for entry in entries:
        name = entry["agent"]
        agent = by_name.get(name)
        if not agent:
            print(f"  skip trigger — agent not in gateway: {name}")
            skipped += 1
            continue
        agent_id = agent["id"]
        spec = build_trigger_spec(entry)
        if not spec:
            continue
        auto_name = spec["name"]
        key = automation_key(agent_id, auto_name)
        existing = list_agent_automations(base, headers, agent_id)
        by_auto_name = {a.get("name"): a for a in existing if a.get("name")}

        if auto_name in by_auto_name and force_update:
            old = by_auto_name[auto_name]
            auto_id = old.get("id") or old.get("automationId") or auto_name
            if delete_automation(base, headers, agent_id, str(auto_id)):
                print(f"  deleted old trigger: {auto_name} → {name}")
            registry.discard(key)

        if auto_name in by_auto_name and not force_update:
            if key not in registry:
                registry.add(key)
            print(f"  trigger exists: {auto_name} → {name}")
            skipped += 1
            continue

        try:
            call(base, headers, "POST", "/api/createAgentAutomation", {"id": agent_id, "spec": spec})
            registry.add(key)
            created += 1
            print(f"  trigger created: {auto_name} → {name}")
        except SystemExit as exc:
            print(f"  trigger failed {name}: {exc}")
            skipped += 1

    save_automation_registry(registry)
    return created, updated, skipped


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--core", action="store_true")
    ap.add_argument("--all", action="store_true", dest="all_agents")
    ap.add_argument("--wave", type=int, choices=[1, 2, 3])
    ap.add_argument("--agent")
    ap.add_argument("--triggers", action="store_true", help="Provision grok-trigger-routines.json event triggers")
    ap.add_argument("--force-update", action="store_true")
    ap.add_argument("--engine", choices=["cron", "launchd"])
    ap.add_argument("--dispatch", action="store_true", help="Dispatch launchd-gated routines now")
    args = ap.parse_args()

    if args.triggers and args.dry_run:
        provision_trigger_routines(base="", headers={}, by_name={}, dry_run=True, force_update=False)
        return 0

    data = load_routines()
    selected = filter_rows(
        data,
        core=args.core,
        wave=args.wave,
        agent_name=args.agent,
        all_agents=args.all_agents,
        engine=args.engine if args.dispatch else None,
    )

    launchd_rows = [r for r in selected if r.get("routine") and _presets_mod.is_launchd_preset(r["routine"]["schedule"])]
    cron_rows = [r for r in selected if build_spec(r)]

    if args.dispatch and args.engine == "launchd":
        dispatch_launchd_rows(launchd_rows)
        return 0

    save_launchd_manifest([r for r in data["agents"] if r.get("routine")])

    if args.dry_run:
        print(f"Routines: {len(selected)} selected, {len(cron_rows)} cron, {len(launchd_rows)} launchd")
        for row in cron_rows:
            spec = build_spec(row)
            assert spec
            trig = spec["trigger"]
            if trig.get("type") == "cron":
                print(f"  [cron] {row['displayName']} — {row['routine']['schedule']} → {trig['schedule']}")
            else:
                print(f"  [{trig.get('type')}] {row['displayName']} — {row['routine']['name']}")
        for row in launchd_rows:
            print(f"  [launchd] {row['displayName']} — {row['routine']['schedule']}")
        if args.triggers:
            provision_trigger_routines(base="", headers={}, by_name={}, dry_run=True, force_update=False)
        return 0

    base, headers = load_gateway()
    _, health = call(base, headers, "GET", "/health")
    print(f"Gateway OK pid={health.get('pid')}")

    _, existing_agents = call(base, headers, "POST", "/api/listAgents", {})
    by_name = {a["name"]: a for a in existing_agents}

    registry = load_automation_registry()
    created = updated = skipped = 0

    for row in cron_rows:
        name = row["displayName"]
        agent = by_name.get(name)
        if not agent:
            print(f"  skip — agent not in gateway: {name}")
            skipped += 1
            continue
        agent_id = agent["id"]
        spec = build_spec(row)
        if not spec:
            continue
        auto_name = spec["name"]
        key = automation_key(agent_id, auto_name)
        existing = list_agent_automations(base, headers, agent_id)
        by_auto_name = {a.get("name"): a for a in existing if a.get("name")}

        if auto_name in by_auto_name and args.force_update:
            old = by_auto_name[auto_name]
            auto_id = old.get("id") or old.get("automationId") or auto_name
            deleted = delete_automation(base, headers, agent_id, str(auto_id))
            if deleted:
                print(f"  deleted old automation: {auto_name} → {name}")
            registry.discard(key)

        if auto_name in by_auto_name and not args.force_update:
            if key not in registry:
                registry.add(key)
            print(f"  exists: {auto_name} → {name}")
            skipped += 1
            continue

        try:
            call(base, headers, "POST", "/api/createAgentAutomation", {"id": agent_id, "spec": spec})
            registry.add(key)
            if auto_name in by_auto_name:
                updated += 1
                print(f"  updated: {auto_name} → {name}")
            else:
                created += 1
                print(f"  created: {auto_name} → {name}")
        except SystemExit as exc:
            print(f"  failed {name}: {exc}")
            skipped += 1

    save_automation_registry(registry)
    print(f"\nDone. created={created} updated={updated} skipped={skipped} launchd={len(launchd_rows)}")

    if args.triggers:
        tc, tu, ts = provision_trigger_routines(
            base=base,
            headers=headers,
            by_name=by_name,
            dry_run=False,
            force_update=args.force_update,
        )
        print(f"Triggers. created={tc} updated={tu} skipped={ts}")

    print(f"Launchd manifest: {LAUNCHD_MANIFEST}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
