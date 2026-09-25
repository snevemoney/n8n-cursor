#!/usr/bin/env python3
"""Eyes: perception only.

Reads Safari UI, and a screen frame when asked, through the existing
hands/see.py tool. Returns that evidence. Does not open, click, type,
scroll, or arm a plate.
"""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

WIRE = "eyes"
TOOL = "see"
OBSERVE_COMMANDS = frozenset({"observe", "ui", "screen", "snapshot"})


def load_see():
    path = Path(__file__).resolve().with_name("see.py")
    spec = importlib.util.spec_from_file_location("agent_stack_see_for_eyes", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def refuse(verb: str) -> dict:
    return {
        "ok": False,
        "wire": WIRE,
        "role": "perception",
        "acted": False,
        "tool": TOOL,
        "verb": (verb or "").strip().lower(),
        "evidence": [],
        "spoken": "Eyes observe. This verb is refused.",
    }


def _front_evidence(front: dict) -> dict:
    return {
        "kind": "ui",
        "source": "safari_front",
        "ok": bool(front.get("ok")),
        "open": bool(front.get("open")),
        "title": str(front.get("title") or ""),
        "url": str(front.get("url") or ""),
        "spoken": str(front.get("spoken") or ""),
    }


def _tabs_evidence(tabs: dict) -> dict:
    rows = tabs.get("tabs") if isinstance(tabs.get("tabs"), list) else []
    return {
        "kind": "ui",
        "source": "safari_tabs",
        "ok": bool(tabs.get("ok")),
        "tabs": [str(row) for row in rows][:8],
        "spoken": str(tabs.get("spoken") or ""),
    }


def _screen_evidence(screen: dict) -> dict:
    raw_bytes = screen.get("bytes")
    return {
        "kind": "screen",
        "source": "grab_screen",
        "ok": bool(screen.get("ok")),
        "path": str(screen.get("path") or ""),
        "bytes": raw_bytes if isinstance(raw_bytes, int) else 0,
        "spoken": str(screen.get("spoken") or ""),
    }


def observe(see, *, hive: Path, screen: bool = False) -> dict:
    """Return UI evidence. Add a screen frame only when screen is true."""
    front = see.safari_front()
    tabs = see.safari_tabs()
    front = front if isinstance(front, dict) else {}
    tabs = tabs if isinstance(tabs, dict) else {}
    evidence = [_front_evidence(front), _tabs_evidence(tabs)]
    screen_ok = True
    if screen:
        shot = see.grab_screen(hive)
        shot = shot if isinstance(shot, dict) else {}
        evidence.append(_screen_evidence(shot))
        screen_ok = bool(shot.get("ok"))
    spoken = " ".join(row["spoken"] for row in evidence if row.get("spoken")).strip()
    return {
        "ok": bool(front.get("ok")) and bool(tabs.get("ok")) and screen_ok,
        "wire": WIRE,
        "role": "perception",
        "acted": False,
        "tool": TOOL,
        "verb": "screen" if screen else "observe",
        "evidence": evidence,
        "spoken": spoken,
    }


def _split_cli(argv: list[str]) -> tuple[str, list[str], str]:
    raw = list(argv)
    hive = ""
    if "--hive" in raw:
        index = raw.index("--hive")
        if index + 1 < len(raw):
            hive = raw[index + 1]
            del raw[index : index + 2]
        else:
            del raw[index:]
    cmd = raw[0].strip().lower() if raw else "observe"
    extra = [part for part in raw[1:] if part != "--"]
    return cmd, extra, hive


def main(argv: list[str] | None = None) -> int:
    raw = list(sys.argv[1:] if argv is None else argv)
    cmd, extra, hive_arg = _split_cli(raw)
    if cmd not in OBSERVE_COMMANDS:
        print(json.dumps(refuse(cmd), indent=2))
        return 2
    if extra:
        print(json.dumps(refuse(extra[0].strip().lower()), indent=2))
        return 2
    see = load_see()
    hive = Path(hive_arg) if hive_arg else see.HIVE
    out = observe(see, hive=hive, screen=cmd in {"screen", "snapshot"})
    print(json.dumps(out, indent=2))
    return 0 if out.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
