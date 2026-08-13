#!/usr/bin/env python3
"""Delete retired Grok agents after OS migration to 17 core agents.

Probes /api/deleteAgent; writes checklist if API unavailable.

Usage:
  python3 scripts/hive/grokbot-delete-retired-agents.py --dry-run
  python3 scripts/hive/grokbot-delete-retired-agents.py --delete
  python3 scripts/hive/grokbot-delete-retired-agents.py --write-checklist
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

_conn_dir = Path(__file__).resolve().parent
_cfg_spec = importlib.util.spec_from_file_location(
    "os_agents_config", _conn_dir / "os_agents_config.py"
)
_cfg = importlib.util.module_from_spec(_cfg_spec)
assert _cfg_spec.loader is not None
_cfg_spec.loader.exec_module(_cfg)

CONN_PATH = Path.home() / ".grokbot/local-exec-daemon-connection.json"
CHECKLIST = Path(__file__).resolve().parents[2] / "docs/hive/outer-heaven/AGENT_DELETE_CHECKLIST.md"
KEEP = set(_cfg.CORE_AGENT_NAMES)


def load_gateway() -> tuple[str, dict[str, str]]:
    if not CONN_PATH.exists():
        raise SystemExit(f"Missing {CONN_PATH}")
    conn = json.loads(CONN_PATH.read_text())
    base = conn["baseUrl"].rstrip("/")
    headers = {
        "Authorization": f"Bearer {conn['token']}",
        "Content-Type": "application/json",
        **conn.get("headers", {}),
    }
    return base, headers


def call(base: str, headers: dict, path: str, body: dict) -> tuple[int, dict | list | None]:
    req = urllib.request.Request(
        base + path,
        data=json.dumps(body).encode(),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode()[:500]}


def list_agents(base: str, headers: dict) -> list[dict]:
    _, result = call(base, headers, "/api/listAgents", {})
    return result if isinstance(result, list) else []


def delete_agent(base: str, headers: dict, agent_id: str) -> tuple[bool, str]:
    for path in ("/api/deleteAgent", "/api/removeAgent"):
        status, result = call(base, headers, path, {"id": agent_id})
        if status == 200:
            return True, path
    err = result.get("error", str(result)) if isinstance(result, dict) else str(result)
    return False, err


def write_checklist(to_delete: list[str], api_ok: bool) -> None:
    lines = [
        "# Agent delete checklist — EVENS AI OS migration",
        "",
        f"**Keep (17 core):** {', '.join(_cfg.CORE_AGENT_NAMES)}",
        "",
        f"**Delete manually in Grok UI** ({len(to_delete)} agents):",
        "",
    ]
    for name in sorted(to_delete):
        fused = next(
            (r["fusedInto"] for r in _cfg.RETIRED_AGENTS if r["name"] == name),
            _cfg.RENAME_MAP.get(name, "?"),
        )
        lines.append(f"- [ ] `{name}` → fused into **{fused}**")
    lines.extend(
        [
            "",
            f"Delete API probe: {'OK' if api_ok else 'NOT AVAILABLE — manual delete required'}",
            "",
            "After delete: `bash scripts/hive/grokbot-verify-agents.sh`",
        ]
    )
    CHECKLIST.parent.mkdir(parents=True, exist_ok=True)
    CHECKLIST.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {CHECKLIST}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--delete", action="store_true")
    ap.add_argument("--write-checklist", action="store_true")
    ap.add_argument("--probe-only", action="store_true")
    args = ap.parse_args()

    retired_names = {r["name"] for r in _cfg.RETIRED_AGENTS}
    rename_old = set(_cfg.RENAME_MAP.keys())
    to_delete_names = retired_names | rename_old

    if args.write_checklist and not CONN_PATH.exists():
        write_checklist(sorted(to_delete_names), False)
        return 0

    base, headers = load_gateway()
    agents = list_agents(base, headers)
    by_name = {a["name"]: a for a in agents}

    candidates = [name for name in by_name if name not in KEEP]
    print(f"Grok agents: {len(agents)} total, {len(candidates)} candidates for deletion")

    api_ok = False
    if candidates:
        test_id = by_name[candidates[0]]["id"]
        ok, msg = delete_agent(base, headers, test_id) if args.probe_only else (False, "probe skipped")
        if args.probe_only:
            api_ok = ok
            print(f"deleteAgent probe: {'OK' if ok else 'FAIL'} ({msg})")
            if not ok:
                write_checklist(candidates, False)
            return 0 if ok else 1

    if args.dry_run or not args.delete:
        for name in sorted(candidates):
            print(f"  would delete: {name}")
        if args.write_checklist or not args.delete:
            write_checklist(candidates, api_ok)
        return 0

    deleted = 0
    failed: list[str] = []
    for name in sorted(candidates):
        ok, msg = delete_agent(base, headers, by_name[name]["id"])
        if ok:
            print(f"  deleted {name}")
            deleted += 1
        else:
            print(f"  FAIL {name}: {msg}")
            failed.append(name)

    if failed:
        write_checklist(failed, deleted > 0)
    print(f"Done: deleted={deleted} failed={len(failed)}")
    return 0 if not failed else 1


if __name__ == "__main__":
    raise SystemExit(main())
