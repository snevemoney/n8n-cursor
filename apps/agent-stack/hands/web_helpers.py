"""Canvas webhelpers: versioned Safari step lists Jarvis learned from a task, tested, then reused.

A helper is procedure reuse, not new power: every replayed step goes through the same gate as a direct safari call,
and a run only counts when the page shows the expected text afterwards. A helper is "candidate" until one run passes.
"""
from __future__ import annotations
import json
import re
import time
from pathlib import Path

NAME_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,47}$")
STEP_ACTIONS = {"navigate", "new_tab", "click", "double_click", "hover", "type", "select", "check", "key", "scroll",
                "wait_for", "read", "back", "forward", "reload", "snapshot"}


def _dir(root: Path, name: str) -> Path:
    if not NAME_RE.match(name or ""):
        raise ValueError("helper name: lowercase letters, digits and dashes")
    return root / name


def _versions(d: Path) -> list:
    return sorted(int(p.stem[1:]) for p in d.glob("v*.json") if p.stem[1:].isdigit())


def latest(root: Path, name: str) -> dict | None:
    d = _dir(root, name)
    vs = _versions(d) if d.exists() else []
    return json.loads((d / f"v{vs[-1]}.json").read_text()) if vs else None


def save(root: Path, name: str, steps: list, expect: str, about: str = "") -> dict:
    if not isinstance(steps, list) or not steps or not all(isinstance(s, dict) for s in steps):
        raise ValueError("steps: a list of safari actions")
    bad = [s.get("action") for s in steps if s.get("action") not in STEP_ACTIONS]
    if bad:
        raise ValueError(f"steps may only use {', '.join(sorted(STEP_ACTIONS))}; not {bad}")
    if any("ref" in s for s in steps):
        raise ValueError("use label=<visible text> instead of ref=N; numbers change on every page load")
    if not str(expect or "").strip():
        raise ValueError("expect: the text the page must show when the helper worked")
    prev = latest(root, name)
    if prev and prev["steps"] == steps and prev["expect"] == expect:
        return prev  # nothing new: no version bump
    d = _dir(root, name)
    d.mkdir(parents=True, exist_ok=True)
    v = (prev["version"] + 1) if prev else 1
    row = {"name": name, "version": v, "about": about, "steps": steps, "expect": expect,
           "status": "candidate", "runs": 0, "passes": 0, "saved_at": time.strftime("%Y-%m-%d %H:%M")}
    (d / f"v{v}.json").write_text(json.dumps(row, indent=1))
    return row


def _fill(value, vars_: dict):
    if isinstance(value, str):
        return re.sub(r"\{(\w+)\}", lambda m: str(vars_.get(m.group(1), m.group(0))), value)
    return value


def run(root: Path, name: str, vars_: dict, safari, gate) -> dict:
    """safari(step)->{'text'}; gate(step)->'' to go, or the reason it needs Evens. Returns {'ok', 'text'}."""
    h = latest(root, name)
    if not h:
        return {"ok": False, "text": f"no helper named {name}"}
    vars_ = vars_ or {}
    for i, raw in enumerate(h["steps"], 1):
        step = {k: _fill(v, vars_) for k, v in raw.items()}
        missing = re.findall(r"\{(\w+)\}", json.dumps(step))
        if missing:
            return {"ok": False, "text": f"helper {name} needs vars: {', '.join(sorted(set(missing)))}"}
        label = step.pop("label", None)
        if label:
            safari({"action": "snapshot"})  # numbers the page's elements so find can return them
            found = json.loads(safari({"action": "find", "text": label}).get("text") or "{}").get("elements") or []
            if not found:
                return {"ok": False, "text": f"helper {name} v{h['version']} step {i}: no element labelled {label!r} on the page"}
            step["ref"] = found[0][0]
        held = gate(step)
        if held:
            return {"ok": False, "text": f"helper {name} stopped before step {i}: {held}. Do that step with safari so Evens "
                                         "can approve it, then finish the rest by hand."}
        safari(step)
    page = safari({"action": "read"}).get("text") or ""
    ok = h["expect"].lower() in page.lower()
    h = {**h, "runs": h["runs"] + 1, "passes": h["passes"] + ok, "status": "proven" if ok or h["status"] == "proven" else "candidate"}
    (_dir(root, name) / f"v{h['version']}.json").write_text(json.dumps(h, indent=1))
    return {"ok": ok, "text": f"helper {name} v{h['version']}: " + (f"worked, the page shows {h['expect']!r}" if ok else
            f"ran, but the page does not show {h['expect']!r}; check the page and fix the helper") + f"\n{page[:1500]}"}


def listing(root: Path) -> str:
    rows = [latest(root, d.name) for d in sorted(root.glob("*")) if d.is_dir()] if root.exists() else []
    return "\n".join(f"{h['name']} v{h['version']} ({h['status']}, {h['passes']}/{h['runs']} runs passed): {h['about']}"
                     for h in rows if h) or "no web helpers yet"
