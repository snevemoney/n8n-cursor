#!/usr/bin/env python3
"""One bus lock. Read-modify-write is a transaction. Stop wins over stale turns."""
from __future__ import annotations

import fcntl
import json
import os
import tempfile
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

_LOCKS: dict[str, threading.RLock] = {}
_LOCKS_GUARD = threading.Lock()


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_json(path: Path) -> dict:
    """Read JSON. Retry a torn write. Never treat a mid-write as an empty bus."""
    if not path.is_file():
        return {}
    for attempt in range(3):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            if attempt == 2:
                return {}
            time.sleep(0.01)
            continue
        return data if isinstance(data, dict) else {}
    return {}


def write_json(path: Path, data: dict) -> None:
    """Atomic replace. A partial write was wiping Face turns mid-sitting."""
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(data, indent=2) + "\n"
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=str(path.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(payload)
        os.replace(tmp_name, path)
    except Exception:
        try:
            os.unlink(tmp_name)
        except OSError:
            pass
        raise


def _thread_lock(hive: Path) -> threading.RLock:
    """Process-wide. importlib can load this file twice; flock is per-process."""
    try:
        key = str(hive.resolve())
    except OSError:
        key = str(hive)
    locks = getattr(threading, "_agent_stack_bus_locks", None)
    guard = getattr(threading, "_agent_stack_bus_locks_guard", None)
    if locks is None or guard is None:
        with _LOCKS_GUARD:
            locks = getattr(threading, "_agent_stack_bus_locks", None)
            guard = getattr(threading, "_agent_stack_bus_locks_guard", None)
            if locks is None or guard is None:
                guard = threading.Lock()
                locks = dict(_LOCKS)
                setattr(threading, "_agent_stack_bus_locks_guard", guard)
                setattr(threading, "_agent_stack_bus_locks", locks)
    with guard:
        lock = locks.get(key)
        if lock is None:
            lock = threading.RLock()
            locks[key] = lock
        return lock


def mutate_bus(hive: Path, apply: Callable[[dict], dict | None]) -> dict:
    """Exclusive read-modify-write. Fresh load under lock. No stale snapshot write-back."""
    dest = Path(hive)
    path = dest / "bus" / "state.json"
    lock_path = path.with_name(path.name + ".lock")
    path.parent.mkdir(parents=True, exist_ok=True)
    with _thread_lock(dest):
        with open(lock_path, "a+", encoding="utf-8") as handle:
            fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
            try:
                bus = load_json(path)
                out = apply(bus)
                if out is None:
                    out = bus
                if not isinstance(out, dict):
                    out = bus
                write_json(path, out)
                return out
            finally:
                fcntl.flock(handle.fileno(), fcntl.LOCK_UN)


def bus_gen(bus: dict | None) -> int:
    try:
        return int((bus or {}).get("turn_gen") or 0)
    except (TypeError, ValueError):
        return 0


def bus_cancel_gen(bus: dict | None) -> int:
    try:
        return int((bus or {}).get("cancel_gen") or 0)
    except (TypeError, ValueError):
        return 0


def turn_cancelled_bus(bus: dict | None, gen: int) -> bool:
    """True when this generation lost to Stop or a newer turn."""
    if not gen:
        return True
    data = bus if isinstance(bus, dict) else {}
    return bus_cancel_gen(data) >= gen or bus_gen(data) != gen


def turn_cancelled(hive: Path, gen: int) -> bool:
    return turn_cancelled_bus(load_json(Path(hive) / "bus" / "state.json"), gen)


def peek_gen(hive: Path) -> int:
    """Current turn_gen under the bus lock. Arrival stamp for Face Watch."""
    held = {"gen": 0}

    def apply(bus: dict) -> dict:
        held["gen"] = bus_gen(bus)
        return bus

    mutate_bus(hive, apply)
    return int(held["gen"] or 0)


def act_if_current(
    hive: Path,
    gen: int | None,
    apply: Callable[[dict], dict | None],
    *,
    evens: bool = False,
) -> dict | None:
    """Required-gen side effect inside the mutate. One fence. gen is None is DENY.

    evens is the Face Watch new-tap door. It does not waive gen. An in-flight
    request must stamp start_gen at arrival; after cancel that stamp is stale.
    """
    _ = evens
    if gen is None:
        return None
    try:
        token = int(gen)
    except (TypeError, ValueError):
        return None
    if token <= 0:
        return None
    applied = {"ok": False}

    def wrapped(bus: dict) -> dict:
        if turn_cancelled_bus(bus, token):
            return bus
        out = apply(bus)
        applied["ok"] = True
        if out is None or not isinstance(out, dict):
            return bus
        return out

    result = mutate_bus(hive, wrapped)
    return result if applied["ok"] else None


def watch_stop_disarmed(bus: dict | None) -> bool:
    """True when Stop disarmed Watch and Evens has not pressed Watch again."""
    data = bus if isinstance(bus, dict) else {}
    watch = data.get("watch") if isinstance(data.get("watch"), dict) else {}
    return bus_cancel_gen(data) > 0 and not bool(watch.get("armed"))


def begin_turn(hive: Path, *, arm_watch: bool = False) -> int:
    """Open a generation. Never first-arm. After Stop, arm_watch=True does not re-arm."""

    def apply(bus: dict) -> dict:
        gen = bus_gen(bus) + 1
        bus["turn_gen"] = gen
        bus["updated_at"] = now_iso()
        if arm_watch:
            watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
            if bool(watch.get("armed")):
                watch["armed"] = True
                watch["updated_at"] = now_iso()
                bus["watch"] = watch
        return bus

    return bus_gen(mutate_bus(hive, apply))


def cancel_turn_scoped(hive: Path, gen: int, spoken: str | None = None) -> bool:
    """Cancel only while `gen` is still the running generation.

    A stale request's watchdog must never kill a newer turn: if the bus has
    moved on, this is a no-op and the caller only closes its own socket.

    `spoken` is the line the pane may paint. A user stop leaves it empty so
    the line stays "Stopped. Standing by." A wall timeout passes the dark
    wire instead, so a slow model is not recorded as a stop.
    """
    try:
        token = int(gen)
    except (TypeError, ValueError):
        return False
    if token <= 0:
        return False
    line = (spoken or "").strip() or "Stopped. Standing by."
    hit = {"ok": False}

    def apply(bus: dict) -> dict:
        running = bus_gen(bus)
        if running != token or bus_cancel_gen(bus) >= running:
            return bus
        hit["ok"] = True
        bus["cancel_gen"] = running
        bus["turn_gen"] = running + 1
        bus["phase"] = "idle"
        bus["job_status"] = "done"
        bus["spoken"] = line
        bus["permission_ask"] = None
        watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
        watch["armed"] = False
        watch["held"] = False
        watch["spoken"] = "Watch off."
        watch["updated_at"] = now_iso()
        bus["watch"] = watch
        bus["updated_at"] = now_iso()
        return bus

    mutate_bus(hive, apply)
    return hit["ok"]


def cancel_turn(hive: Path) -> int:
    """Cancel the running generation. Done fence. Disarm Watch. Stop spoken now."""

    def apply(bus: dict) -> dict:
        running = bus_gen(bus)
        bus["cancel_gen"] = running
        bus["turn_gen"] = running + 1
        bus["phase"] = "idle"
        bus["job_status"] = "done"
        bus["spoken"] = "Stopped. Standing by."
        bus["permission_ask"] = None
        bus["utterance"] = bus.get("utterance") or "stop"
        watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
        watch["armed"] = False
        watch["held"] = False
        watch["spoken"] = "Watch off."
        watch["updated_at"] = now_iso()
        bus["watch"] = watch
        bus["updated_at"] = now_iso()
        return bus

    return bus_gen(mutate_bus(hive, apply))
