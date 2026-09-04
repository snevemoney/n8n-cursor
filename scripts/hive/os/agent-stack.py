#!/usr/bin/env python3
"""Adopt the existing agentic OS. Do not create a second home.

Port of the jaredrhod/fullstack-agent *pattern* (AGPL upstream, not vendored):
  interview once → path configs → file signal bus → optional mouth/face later.

This upgrades internal-host-os. One brain = Obsidian vault + this git repo.
Execute hosts = Cursor + Grok. Claude Code / second vault / ~/my-agent = refuse.

WAKE: adopt sitting · mouth/face later sittings
HOST: local files only
DONE-CHECK: --self-test exits 0 (adopt + validate + bus cycle in a temp hive)
CAP: never writes CLAUDE.md · never clones upstream · never starts mic/face
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
OS_DIR = ROOT / "docs/hive/outer-heaven/CONTENT/os"
DEFAULT_STACK = HIVE / "agent-stack.json"
DEFAULT_BUS = HIVE / "bus" / "state.json"
PHASES = ("idle", "listen", "think", "speak")
JOB_STATUSES = ("working", "yellow", "done")
PERMISSION_MODES = ("ask", "bypassPermissions")
PIECES = ("memory", "wizard", "mouth", "face", "hands")


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _import_vault_config():
    import importlib.util

    path = Path(__file__).resolve().parent / "vault-config.py"
    spec = importlib.util.spec_from_file_location("hive_vault_config", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def resolve_vault() -> dict:
    return _import_vault_config().resolve_vault()


def default_stack(vault: dict | None = None, *, hive: Path = HIVE) -> dict:
    handle = vault if vault is not None else resolve_vault()
    return {
        "schema_version": 1,
        "kind": "agentic-os",
        "name": "hive",
        "operator": "Evens",
        "hosts": ["cursor", "grok"],
        "permission_mode": "ask",
        "vault": {
            "ok": bool(handle.get("ok")),
            "source": handle.get("source"),
            "path": handle.get("path"),
            "oh": handle.get("oh"),
            "kind": handle.get("kind"),
        },
        "repo": str(ROOT),
        "bus_path": str((hive / "bus" / "state.json").resolve()),
        "jobs_path": str((OS_DIR / "jobs.json").resolve()),
        "state_path": str((hive / "state.json").resolve()),
        "os_surface": "apps/portfolio/public/obsidianOS",
        "session_brief": "docs/hive/outer-heaven/CONTENT/os/sessions/BRIEF-2026-08-14-to-2026-09-04.md",
        "session_index": "docs/hive/outer-heaven/CONTENT/os/sessions/INDEX.md",
        "pieces": {
            "memory": "adopted",
            "wizard": "wired",
            "mouth": "wired",
            "face": "wired",
            "hands": "wired",
        },
        "never": [
            "claude-code",
            "second-vault",
            "second-home",
            "live-/",
            "vendor-agpl-clone",
        ],
        "updated_at": now_iso(),
    }


def default_bus() -> dict:
    return {
        "schema_version": 1,
        "phase": "idle",
        "job_status": "done",
        "utterance": "",
        "permission_ask": None,
        "hands_armed": False,
        "updated_at": now_iso(),
    }


def _atomic_write(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), prefix=".agent-stack-", suffix=".json")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(json.dumps(data, indent=2) + "\n")
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def load_json(path: Path) -> dict:
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def validate(stack: dict, bus: dict) -> list[str]:
    errors: list[str] = []
    if stack.get("kind") != "agentic-os":
        errors.append("kind must be agentic-os (this is the hive OS, not a sidecar)")
    if stack.get("permission_mode") not in PERMISSION_MODES:
        errors.append("permission_mode missing or invalid")
    if stack.get("permission_mode") != "ask":
        errors.append("sitting-1 default is ask (auto-approve stays off)")
    hosts = stack.get("hosts") or []
    if "cursor" not in hosts or "grok" not in hosts:
        errors.append("hosts must include cursor and grok")
    if "claude" in [str(h).lower() for h in hosts]:
        errors.append("claude is not an execute host")
    vault = stack.get("vault") if isinstance(stack.get("vault"), dict) else {}
    if not vault.get("path"):
        errors.append("vault.path missing — adopt refused to invent a second home")
    pieces = stack.get("pieces") if isinstance(stack.get("pieces"), dict) else {}
    if pieces.get("memory") != "adopted":
        errors.append("memory must be adopted (existing vault), never created")
    if pieces.get("wizard") != "wired":
        errors.append("wizard must be wired this sitting")
    for parked in ("mouth", "face", "hands"):
        if pieces.get(parked) not in ("parked", "wired"):
            errors.append(f"pieces.{parked} missing")
    never = set(stack.get("never") or [])
    for lock in ("claude-code", "second-vault", "second-home"):
        if lock not in never:
            errors.append(f"never[] missing {lock}")
    if bus.get("phase") not in PHASES:
        errors.append("bus.phase must be idle|listen|think|speak")
    if bus.get("job_status") not in JOB_STATUSES:
        errors.append("bus.job_status must be working|yellow|done")
    if "hands_armed" in bus and not isinstance(bus.get("hands_armed"), bool):
        errors.append("bus.hands_armed must be a bool when set")
    return errors


def adopt(*, hive: Path = HIVE, vault: dict | None = None) -> dict:
    """Write stack + idle bus. Never creates CLAUDE.md or a ~/my-agent home."""
    stack_path = hive / "agent-stack.json"
    bus_path = hive / "bus" / "state.json"
    stack = default_stack(vault, hive=hive)
    stack["bus_path"] = str(bus_path.resolve())
    stack["state_path"] = str((hive / "state.json").resolve())
    bus = load_json(bus_path) or default_bus()
    if bus.get("phase") not in PHASES:
        bus = default_bus()
    errors = validate(stack, bus)
    if errors:
        return {"ok": False, "errors": errors, "stack_path": str(stack_path)}
    _atomic_write(stack_path, stack)
    _atomic_write(bus_path, bus)
    return {
        "ok": True,
        "stack_path": str(stack_path),
        "bus_path": str(bus_path),
        "vault": stack["vault"],
        "pieces": stack["pieces"],
        "second_home": False,
    }


def bus_write(
    *,
    phase: str | None = None,
    job_status: str | None = None,
    utterance: str | None = None,
    permission_ask: str | None = None,
    hands_armed: bool | None = None,
    hive: Path = HIVE,
) -> dict:
    bus_path = hive / "bus" / "state.json"
    bus = load_json(bus_path) or default_bus()
    if phase is not None:
        if phase not in PHASES:
            return {"ok": False, "error": f"phase must be one of {PHASES}"}
        bus["phase"] = phase
    if job_status is not None:
        if job_status not in JOB_STATUSES:
            return {"ok": False, "error": f"job_status must be one of {JOB_STATUSES}"}
        bus["job_status"] = job_status
    if utterance is not None:
        bus["utterance"] = utterance
    if permission_ask is not None:
        bus["permission_ask"] = permission_ask or None
    if hands_armed is not None:
        bus["hands_armed"] = bool(hands_armed)
    bus["updated_at"] = now_iso()
    stack = load_json(hive / "agent-stack.json")
    errors = validate(stack, bus) if stack else []
    if stack and errors:
        return {"ok": False, "errors": errors}
    _atomic_write(bus_path, bus)
    return {"ok": True, "bus": bus, "bus_path": str(bus_path)}


def cmd_validate(hive: Path = HIVE) -> dict:
    stack = load_json(hive / "agent-stack.json")
    bus = load_json(hive / "bus" / "state.json")
    if not stack:
        return {"ok": False, "errors": ["agent-stack.json missing — run adopt"]}
    if not bus:
        return {"ok": False, "errors": ["bus/state.json missing — run adopt"]}
    errors = validate(stack, bus)
    return {"ok": not errors, "errors": errors, "stack": stack, "bus": bus}


def self_test() -> dict:
    with tempfile.TemporaryDirectory(prefix="agent-stack-") as tmp:
        hive = Path(tmp)
        vault = {
            "ok": True,
            "source": "local",
            "path": "/Users/evenslouis/Documents/My_Billion_Dollar_Vault",
            "oh": "/Users/evenslouis/Documents/My_Billion_Dollar_Vault/00_Outer_Heaven",
            "kind": "live-vault",
        }
        adopted = adopt(hive=hive, vault=vault)
        if not adopted.get("ok"):
            return {"ok": False, "errors": adopted.get("errors") or ["adopt failed"]}
        if (hive / "CLAUDE.md").exists() or (hive / "my-agent").exists():
            return {"ok": False, "errors": ["second home was written"]}
        wrote = bus_write(phase="think", job_status="working", utterance="dry-run", hive=hive)
        if not wrote.get("ok"):
            return {"ok": False, "errors": wrote.get("errors") or [wrote.get("error")]}
        checked = cmd_validate(hive=hive)
        if not checked.get("ok"):
            return {"ok": False, "errors": checked.get("errors")}
        if checked["bus"]["phase"] != "think":
            return {"ok": False, "errors": ["bus phase did not persist"]}
        return {
            "ok": True,
            "errors": [],
            "adopted": True,
            "second_home": False,
            "bus_phase": checked["bus"]["phase"],
        }


def main() -> int:
    ap = argparse.ArgumentParser(description="Adopt the hive agentic OS (fullstack-agent pattern port)")
    ap.add_argument("--hive", type=Path, default=HIVE, help="Hive dir (default docs/hive/outer-heaven/.hive)")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("adopt", help="Write agent-stack.json + idle bus against the existing vault")
    sub.add_parser("validate", help="Validate adopted stack + bus")
    sub.add_parser("bus-read", help="Print the bus")
    bw = sub.add_parser("bus-write", help="Update bus phase / job / utterance")
    bw.add_argument("--phase", choices=PHASES)
    bw.add_argument("--job-status", choices=JOB_STATUSES)
    bw.add_argument("--utterance", default=None)
    bw.add_argument("--permission-ask", default=None)
    bw.add_argument("--hands-armed", choices=("true", "false"), default=None)
    sub.add_parser("self-test", help="Temp-dir adopt + bus cycle")
    args = ap.parse_args()
    hive: Path = args.hive
    if args.cmd == "adopt":
        out = adopt(hive=hive)
        print(json.dumps(out, indent=2))
        return 0 if out.get("ok") else 2
    if args.cmd == "validate":
        out = cmd_validate(hive=hive)
        print(json.dumps({k: out[k] for k in out if k != "stack"}, indent=2))
        return 0 if out.get("ok") else 2
    if args.cmd == "bus-read":
        print(json.dumps(load_json(hive / "bus" / "state.json") or default_bus(), indent=2))
        return 0
    if args.cmd == "bus-write":
        out = bus_write(
            phase=args.phase,
            job_status=args.job_status,
            utterance=args.utterance,
            permission_ask=args.permission_ask,
            hands_armed=None if args.hands_armed is None else args.hands_armed == "true",
            hive=hive,
        )
        print(json.dumps(out, indent=2))
        return 0 if out.get("ok") else 2
    out = self_test()
    print(json.dumps(out, indent=2))
    return 0 if out.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
