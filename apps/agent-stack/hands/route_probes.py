"""Canvas sig_x02 (route probes): every place Jarvis's code says a thing lives must still exist.

The routes are the module-level Path constants in the hands Jarvis runs (vault, inbox, chat history, Ops Watch, loop
kit, ...). A constant that points nowhere is how the vault move broke reads silently; this names it instead.
Optional routes (made on first use) are listed so they are not reported as broken.
"""
from __future__ import annotations
import importlib.util
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODULES = ("operator.py", "loop_runner.py", "readiness.py", "frontier.py", "cost_card.py")
MADE_ON_FIRST_USE = {"INPUT_LOCK", "COST_PAGE", "DAILY", "WEB_HELPERS", "CONFIG_LOG", "METER", "CACHE"}


def routes(modules=MODULES) -> dict:
    found = {}
    home = str(Path.home())
    for name in modules:
        spec = importlib.util.spec_from_file_location(f"route_probe_{Path(name).stem}", HERE / name)
        mod = importlib.util.module_from_spec(spec)
        try:
            spec.loader.exec_module(mod)
        except Exception as exc:  # noqa: BLE001 - a module that will not load is itself a broken route
            found[f"{name} (does not load)"] = (None, type(exc).__name__)
            continue
        for k, v in vars(mod).items():
            if k.isupper() and isinstance(v, Path) and str(v).startswith(home) and k not in MADE_ON_FIRST_USE:
                found[f"{Path(name).stem}.{k}"] = (v, "ok" if v.exists() else "missing")
    return found


def probe(modules=MODULES) -> tuple[list, list]:
    rows = routes(modules)
    broken = sorted(k for k, (_, st) in rows.items() if st != "ok")
    return broken, sorted(rows)
