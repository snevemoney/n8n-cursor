"""Canvas startupcheck + sig_z93 (tool preflight): can Jarvis actually work right now, not just "is the Face up".

Read-only checks, each GREEN / AMBER / RED with one plain line: model budget (OpenRouter balance, read with the key
by name, never printed), the free local model, the Mac permissions the agent driver needs, and free disk.
"""
from __future__ import annotations
import json
import os
import shutil
import subprocess
import urllib.request
from pathlib import Path

CUA = Path.home() / "tools/cua-driver/cua-driver-rs-0.33.4-darwin-arm64/cua-driver"
LOW_USD = 1.0
LOW_DISK_GB = 15


def credit(fetch=None) -> tuple[str, str]:
    key = os.environ.get("OPENROUTER_API_KEY", "")
    if not key:
        return "RED", "No OpenRouter key is set, so only the free local model can answer."
    try:
        if fetch:
            d = fetch()
        else:
            req = urllib.request.Request("https://openrouter.ai/api/v1/credits", headers={"Authorization": f"Bearer {key}"})
            with urllib.request.urlopen(req, timeout=15) as r:
                d = json.load(r).get("data") or {}
        left = float(d.get("total_credits") or 0) - float(d.get("total_usage") or 0)
    except (OSError, ValueError, TypeError) as exc:
        return "AMBER", f"Could not read the OpenRouter balance ({type(exc).__name__})."
    if left <= 0:
        return "RED", f"OpenRouter is out of credit ({left:+.2f} dollars): real jobs fall to the free local model."
    if left < LOW_USD:
        return "AMBER", f"OpenRouter has {left:.2f} dollars left; long jobs may stop."
    return "GREEN", f"OpenRouter has {left:.2f} dollars left."


def local_model(fetch=None) -> tuple[str, str]:
    try:
        if fetch:
            names = fetch()
        else:
            with urllib.request.urlopen("http://127.0.0.1:11434/api/tags", timeout=3) as r:
                names = [m.get("name") for m in json.load(r).get("models", [])]
    except (OSError, ValueError):
        return "AMBER", "The free local model is not running (Ollama is off)."
    return ("GREEN", f"The free local model is ready ({', '.join(names[:2])}).") if names else \
        ("AMBER", "Ollama is running but has no model installed.")


def permissions(run=None) -> tuple[str, str]:
    try:
        out = run() if run else subprocess.run([str(CUA), "call", "check_permissions", "{}"], capture_output=True,
                                               text=True, timeout=20).stdout
        d = json.loads(out[out.index("{"):])
    except (OSError, ValueError, subprocess.SubprocessError):
        return "AMBER", "Could not ask the agent driver about Mac permissions."
    missing = [n for n, k in (("Accessibility", "accessibility"), ("Screen Recording", "screen_recording")) if not d.get(k)]
    return ("GREEN", "Accessibility and Screen Recording are granted.") if not missing else \
        ("RED", f"{' and '.join(missing)} not granted to the agent driver; only Evens can grant it in System Settings.")


def disk() -> tuple[str, str]:
    free = shutil.disk_usage(str(Path.home())).free / 1e9
    return ("GREEN" if free >= LOW_DISK_GB else "AMBER"), f"{free:.0f} GB free on the Mac."


def routes(probe=None) -> tuple[str, str]:
    """X02: every place the code says a thing lives still exists."""
    if probe is None:
        import importlib.util
        spec = importlib.util.spec_from_file_location("route_probes_rd", Path(__file__).with_name("route_probes.py"))
        rp = importlib.util.module_from_spec(spec); spec.loader.exec_module(rp)
        probe = rp.probe
    broken, all_ = probe()
    return ("GREEN", f"All {len(all_)} places my code points to exist.") if not broken else \
        ("AMBER", f"{len(broken)} of {len(all_)} places my code points to are missing: {', '.join(broken[:4])}.")


BUS = Path(__file__).resolve().parents[3] / "docs/hive/outer-heaven/.hive/bus/state.json"
SENSE_COST = {"watch": "paid vision", "eyes": "paid vision", "focus": "free, local"}


def senses(bus: dict | None = None) -> tuple[str, str]:
    """Z55: each sense is its own switch; say which are on and what each costs while on."""
    if bus is None:
        try:
            bus = json.loads(BUS.read_text())
        except (OSError, ValueError):
            return "AMBER", "Could not read the sense switches."
    on = [k for k in SENSE_COST if isinstance(bus.get(k), dict) and (bus[k].get("armed") or bus[k].get("active"))]
    off = [k for k in SENSE_COST if k not in on]
    line = (f"On: {', '.join(f'{k} ({SENSE_COST[k]})' for k in on)}. " if on else "") + (f"Off: {', '.join(off)}." if off else "")
    return "GREEN", line.strip()


def report(**fakes) -> dict:
    rows = {"budget": credit(fakes.get("credit")), "local model": local_model(fakes.get("models")),
            "permissions": permissions(fakes.get("perms")), "disk": disk(), "routes": routes(fakes.get("routes")),
            "senses": senses(fakes.get("bus"))}
    worst = "RED" if any(s == "RED" for s, _ in rows.values()) else "AMBER" if any(s == "AMBER" for s, _ in rows.values()) else "GREEN"
    bad = [line for s, line in rows.values() if s != "GREEN"]
    spoken = "Everything I need to work is ready." if worst == "GREEN" else " ".join(bad)
    return {"state": worst, "rows": {k: {"state": s, "line": l} for k, (s, l) in rows.items()}, "spoken": spoken}
