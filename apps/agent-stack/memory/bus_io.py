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


class CorruptBus(ValueError):
    """The bus file exists but is not readable JSON (concurrency audit 2026-10-16)."""


def _load_strict(path: Path) -> dict:
    if not path.is_file():
        return {}
    for attempt in range(3):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):  # ValueError covers JSONDecodeError and UnicodeDecodeError
            if attempt == 2:
                raise CorruptBus(str(path))
            time.sleep(0.01)
            continue
        return data if isinstance(data, dict) else {}
    raise CorruptBus(str(path))


def load_json(path: Path) -> dict:
    """Read JSON. Retry a torn write. Never treat a mid-write as an empty bus; unreadable reads as {} for readers."""
    try:
        return _load_strict(path)
    except CorruptBus:
        return {}


def _quarantine(path: Path) -> None:
    """Keep the unreadable file for diagnosis instead of overwriting it with {} (which wiped turns and cancel_gen)."""
    try:
        os.replace(path, path.with_name(f"{path.name}.corrupt-{int(time.time())}"))
    except OSError:
        pass


def write_json(path: Path, data: dict) -> None:
    """Atomic replace. A partial write was wiping Face turns mid-sitting."""
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(data, indent=2) + "\n"
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=str(path.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())  # a crash between write and replace must not leave an empty bus
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
                try:
                    bus = _load_strict(path)
                except CorruptBus:
                    _quarantine(path)
                    bus = {}
                before = json.dumps(bus, sort_keys=True, default=str)
                out = apply(bus)
                if out is None:
                    out = bus
                if not isinstance(out, dict):
                    out = bus
                if not path.is_file() or json.dumps(out, sort_keys=True, default=str) != before:
                    write_json(path, out)  # an unchanged bus is not rewritten (peeks rewrote it every 0.2s)
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


def commit_response(hive: Path, gen: int | None, apply, *, terminal: bool) -> dict | None:
    """One terminal response owner per generation, under the existing bus lock.

    This fences response writers only. Mic/watch observations retain their
    existing act_if_current door and cannot reopen terminal delivery.
    """
    accepted = {"ok": False}

    def commit(bus: dict) -> dict:
        if bus.get("terminal_response_gen") == gen:
            return bus
        target = dict(bus)
        if terminal:
            for key in ("task_verified", "task_verified_gen", "browser_mission_id", "browser_mission_result"):
                target.pop(key, None)
        out = apply(target)
        if not isinstance(out, dict):
            return bus
        if terminal:
            out["terminal_response_gen"] = int(gen)
        accepted["ok"] = True
        return out

    result = act_if_current(hive, gen, commit)
    return result if accepted["ok"] else None


def watch_stop_disarmed(bus: dict | None) -> bool:
    """True when Stop disarmed Watch and Evens has not pressed Watch again."""
    data = bus if isinstance(bus, dict) else {}
    watch = data.get("watch") if isinstance(data.get("watch"), dict) else {}
    return bus_cancel_gen(data) > 0 and not bool(watch.get("armed"))


def begin_turn(hive: Path, *, arm_watch: bool = False) -> int:
    """Open a generation. Never first-arm. After Stop, arm_watch=True does not re-arm."""

    opener = threading.get_ident()

    def apply(bus: dict) -> dict:
        gen = bus_gen(bus) + 1
        bus["turn_gen"] = gen
        # Concurrency audit 2026-10-16: the Face guessed its own gen as arrival+1, so with two requests in flight the
        # wall cancelled nothing and a timed-out worker ran on. Record which thread opened each gen (last 32).
        owners = bus.get("gen_threads") if isinstance(bus.get("gen_threads"), dict) else {}
        owners[str(gen)] = [os.getpid(), opener]
        bus["gen_threads"] = dict(list(owners.items())[-32:])
        # An earlier tool's receipt is not evidence for the newly opened turn.
        bus.pop("execution", None)
        bus.pop("execution_gen", None)
        bus.pop("task_verified", None)
        bus.pop("task_verified_gen", None)
        bus.pop("agent_task_progress", None)
        bus["updated_at"] = now_iso()
        if arm_watch:
            watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
            if bool(watch.get("armed")):
                watch["armed"] = True
                watch["updated_at"] = now_iso()
                bus["watch"] = watch
        return bus

    return bus_gen(mutate_bus(hive, apply))


def gen_for_thread(hive: Path, ident: int | None, after: int = 0) -> int | None:
    """The first generation this process's thread `ident` opened after gen `after` (the request's arrival), or None."""
    if not ident:
        return None
    owners = load_json(Path(hive) / "bus" / "state.json").get("gen_threads") or {}
    mine = [int(g) for g, who in owners.items()
            if isinstance(who, list) and who == [os.getpid(), ident] and str(g).isdigit() and int(g) > int(after)]
    return min(mine) if mine else None


DARK_LINE = "The talk wire is dark this turn."
CLIENT_DISCONNECTED = "Client disconnected. Turn cancelled."


def produced_model_line(text: str) -> bool:
    """A sentence already stored for this generation. Not the dark wire, not a lone Sir."""
    body = " ".join((text or "").split())
    if not body or body in {DARK_LINE, CLIENT_DISCONNECTED}:
        return False
    if body.lower() in {"sir.", "sir", "sir,"}:
        return False
    return True


def cancel_turn_scoped(
    hive: Path,
    gen: int,
    spoken: str | None = None,
    request: str | None = None,
) -> bool:
    """Cancel only while `gen` is still the running generation.

    A stale request's watchdog must never kill a newer turn: if the bus has
    moved on, this is a no-op and the caller only closes its own socket.

    `spoken` is the line the pane may paint. A user stop leaves it empty so
    the line stays "Stopped. Standing by." A wall timeout passes the dark
    wire instead, so a slow model is not recorded as a stop.

    A dark wall does not replace a model sentence this same request already
    published. `request` is that utterance. When it matches the bus, the
    published line stays and this returns False.

    The fence stays on this generation. `begin_turn` already opened it.
    Advancing `turn_gen` here would leave the bus on a generation with no
    archive block. `cancel_gen` is what stops a late writer.
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
        asked = (request or "").strip()
        if (
            line in {DARK_LINE, CLIENT_DISCONNECTED}
            and asked
            and str(bus.get("utterance") or "").strip() == asked
            and produced_model_line(str(bus.get("spoken") or ""))
        ):
            return bus
        hit["ok"] = True
        bus["cancel_gen"] = running
        # Cancellation is this generation's terminal delivery, not the prior
        # turn's status. The same lock fences late completion writers.
        bus["terminal_response_gen"] = running
        bus["response_ok"] = line == "Stopped. Standing by."
        bus["response_ok_gen"] = running
        # A cancel is never task proof. Drop stale verified flags so a later
        # poll cannot read "done" from a cancelled generation.
        bus.pop("task_verified", None)
        bus.pop("task_verified_gen", None)
        bus.pop("agent_task_progress", None)
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
        bus.pop("task_verified", None)
        bus.pop("task_verified_gen", None)
        bus.pop("agent_task_progress", None)
        watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
        watch["armed"] = False
        watch["held"] = False
        watch["spoken"] = "Watch off."
        watch["updated_at"] = now_iso()
        bus["watch"] = watch
        bus["updated_at"] = now_iso()
        return bus

    return bus_gen(mutate_bus(hive, apply))


def commit_mission_response(hive: Path, mission_id: str, completion_id: str, apply) -> dict | None:
    """Canonical terminal owner for queued background results, under the bus lock.

    Reserve a fresh delivery generation only while conversation is idle. This
    does not overwrite an active or already committed conversation generation.
    The mission completion ID is deduplicated independently from turn IDs.
    """
    accepted = {"ok": False}
    def commit(bus: dict) -> dict:
        delivered = dict(bus.get("mission_terminal_commits") or {})
        if mission_id in delivered or bus.get("job_status") == "working" or bus.get("mission_delivery_pending"):
            return bus
        if bus.get("phase") not in {None, "idle", "speak", "listen"}:
            return bus
        gen = bus_gen(bus) + 1
        out = apply(dict(bus), gen)
        if not isinstance(out, dict):
            return bus
        out["turn_gen"] = gen
        out["terminal_response_gen"] = gen
        delivered[mission_id] = {"completion_id": completion_id, "gen": gen}
        out["mission_terminal_commits"] = delivered
        out["mission_delivery_pending"] = {"mission_id": mission_id, "gen": gen, "spoken": out.get("spoken", ""), "verified": bool(out.get("task_verified"))}
        accepted["ok"] = True
        return out
    result = mutate_bus(hive, commit)
    return result if accepted["ok"] else None


def acknowledge_mission_response(hive: Path, mission_id: str, gen: int) -> dict:
    def ack(bus):
        pending = bus.get("mission_delivery_pending") or {}
        if pending.get("mission_id") == mission_id and pending.get("gen") == gen:
            bus.pop("mission_delivery_pending", None)
        return bus
    return mutate_bus(hive, ack)
