#!/usr/bin/env python3
"""Eyes (camera still), Watch (screen), and file drop on the existing face. Local only."""
from __future__ import annotations

import base64
import importlib.util
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
STACK = HERE.parent
ROOT = HERE.parents[2]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
EYES_NAME = "eyes.jpg"
DROP_MAX = 20 * 1024 * 1024
IMAGE_SUFFIX = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
TEXT_SUFFIX = {".txt", ".md", ".markdown", ".csv", ".json", ".html", ".htm"}
TEXT_CAP = 4000
DATA_URL_RE = re.compile(
    r"^data:(image/(?:jpeg|jpg|png|webp));base64,(.+)$",
    re.I | re.S,
)
MAX_BYTES = 1_500_000


def _load_see():
    path = STACK / "hands" / "see.py"
    spec = importlib.util.spec_from_file_location("agent_stack_see_senses", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    # Read the current implementation directly; timestamp bytecode can match
    # an older same-size edit within the same second.
    exec(compile(path.read_bytes(), str(path), "exec"), mod.__dict__)
    return mod


def _see_stamp() -> tuple:
    paths = (STACK / "hands" / "see.py", STACK / "hands" / "watch_frame.py")
    return tuple(hashlib.sha256(path.read_bytes()).hexdigest() for path in paths)


SEE = _load_see()
_SEE_STAMP = _see_stamp()


def see():
    """Refresh the existing observer when its implementation changes."""
    global SEE, _SEE_STAMP
    stamp = _see_stamp()
    if stamp != _SEE_STAMP:
        loaded = _load_see()
        if not callable(getattr(loaded, "snapshot", None)):
            raise RuntimeError("Watch observer has no snapshot entrypoint")
        SEE = loaded
        _SEE_STAMP = stamp
    return SEE


def _bus_io():
    existing = sys.modules.get("agent_stack_bus_io")
    if existing is not None and hasattr(existing, "mutate_bus"):
        return existing
    path = STACK / "memory" / "bus_io.py"
    spec = importlib.util.spec_from_file_location("agent_stack_bus_io", path)
    if spec is None or spec.loader is None:
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


BUS_IO = _bus_io()


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_json(path: Path) -> dict:
    if BUS_IO is not None and hasattr(BUS_IO, "load_json"):
        return BUS_IO.load_json(path)
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
    if BUS_IO is not None and hasattr(BUS_IO, "write_json"):
        BUS_IO.write_json(path, data)
        return
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


def mutate_bus(hive: Path, apply) -> dict:
    if BUS_IO is not None and hasattr(BUS_IO, "mutate_bus"):
        return BUS_IO.mutate_bus(hive, apply)
    path = hive / "bus" / "state.json"
    bus = load_json(path)
    out = apply(bus)
    if out is None:
        out = bus
    write_json(path, out if isinstance(out, dict) else bus)
    return out if isinstance(out, dict) else bus


def act_if_current(hive: Path, gen: int | None, apply, *, evens: bool = False):
    if BUS_IO is not None and hasattr(BUS_IO, "act_if_current"):
        return BUS_IO.act_if_current(hive, gen, apply, evens=evens)
    return None


def peek_gen(hive: Path) -> int:
    if BUS_IO is not None and hasattr(BUS_IO, "peek_gen"):
        return int(BUS_IO.peek_gen(hive))
    return 0


def _denied(wire: str) -> dict:
    return {"ok": False, "wire": wire, "spoken": "Stopped. Standing by.", "cancelled": True, "armed": False}


def _write_bus_sense(hive: Path, key: str, payload: dict, *, gen: int | None = None) -> dict | None:
    def apply(bus: dict) -> dict:
        bus[key] = payload
        bus["updated_at"] = now_iso()
        return bus

    return act_if_current(hive, gen, apply)


def eyes_are_live(eyes: dict | None) -> bool:
    """Pixels on disk are not live. active:false drops the still from the mouth."""
    if not isinstance(eyes, dict):
        return False
    if eyes.get("active") is False:
        return False
    return bool(eyes.get("path") or eyes.get("active"))


def _decode_image(image: str) -> tuple[bytes, str]:
    raw = (image or "").strip()
    if not raw:
        return b"", ""
    match = DATA_URL_RE.match(raw)
    if match:
        mime = match.group(1).lower().replace("image/jpg", "image/jpeg")
        blob = match.group(2)
    else:
        mime = "image/jpeg"
        blob = raw
    try:
        data = base64.b64decode(blob, validate=False)
    except (ValueError, TypeError):
        return b"", ""
    return data, mime


BEFORE_SAVE_EYES = None


def _eyes_stay_active(was: dict | None) -> bool:
    row = was if isinstance(was, dict) else {}
    return False if row.get("active") is False else True


def save_eyes(image: str, *, hive: Path | None = None, gen: int | None = None) -> dict:
    """Accept one browser still. Write hive/bus/eyes.jpg. Do not publish."""
    dest_hive = hive if hive is not None else HIVE
    if act_if_current(dest_hive, gen, lambda bus: bus) is None:
        return _denied("eyes")
    if os.environ.get("AGENT_STACK_DRY_EYES") == "1":
        hook = BEFORE_SAVE_EYES
        if hook is not None:
            hook()
        held: dict = {}

        def apply_dry(bus: dict) -> dict:
            was = bus.get("eyes") if isinstance(bus.get("eyes"), dict) else {}
            payload = {
                "ok": True,
                "dry": True,
                "active": _eyes_stay_active(was),
                "wire": "eyes",
                "spoken": "Eyes dry. Camera still not written.",
                "captured_at": now_iso(),
            }
            bus["eyes"] = payload
            bus["updated_at"] = now_iso()
            held["payload"] = payload
            return bus

        if act_if_current(dest_hive, gen, apply_dry) is None:
            return _denied("eyes")
        return held.get("payload") or _denied("eyes")
    data, mime = _decode_image(image)
    if not data:
        return {"ok": False, "wire": "eyes", "spoken": "UNKNOWN. Eyes still was empty."}
    if len(data) > MAX_BYTES:
        return {"ok": False, "wire": "eyes", "spoken": "UNKNOWN. Eyes still is too large."}
    suffix = ".png" if "png" in mime else ".webp" if "webp" in mime else ".jpg"
    dest = dest_hive / "bus" / (EYES_NAME if suffix == ".jpg" else f"eyes{suffix}")
    written = {"ok": False}
    hook = BEFORE_SAVE_EYES
    if hook is not None:
        hook()

    def apply(bus: dict) -> dict:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        written["ok"] = True
        was = bus.get("eyes") if isinstance(bus.get("eyes"), dict) else {}
        payload = {
            "ok": True,
            "active": _eyes_stay_active(was),
            "wire": "eyes",
            "path": str(dest),
            "bytes": dest.stat().st_size,
            "mime": mime,
            "captured_at": now_iso(),
            "spoken": "Eyes still is on disk. Local only.",
        }
        bus["eyes"] = payload
        bus["updated_at"] = now_iso()
        written["payload"] = payload
        return bus

    if act_if_current(dest_hive, gen, apply) is None or not written.get("ok"):
        return _denied("eyes")
    return written.get("payload") or _denied("eyes")


def _plain_text(path: Path) -> str:
    """Read a small text drop. Never execute. Skip binaries."""
    try:
        raw = path.read_bytes()
    except OSError:
        return ""
    if not raw or b"\x00" in raw[:2048]:
        return ""
    return raw.decode("utf-8", errors="replace").strip()[:TEXT_CAP]


def _pdf_first_page(path: Path) -> str:
    try:
        proc = subprocess.run(
            ["pdftotext", "-f", "1", "-l", "1", "-q", str(path), "-"],
            capture_output=True,
            text=True,
            timeout=5,
        )
    except (OSError, subprocess.TimeoutExpired):
        return ""
    if proc.returncode != 0:
        return ""
    return (proc.stdout or "").strip()[:4000]


def _scrub_secret_values(text: str) -> str:
    try:
        spec = importlib.util.spec_from_file_location("agent_stack_workspace_read_drop", Path(__file__).resolve().parents[1] / "hands" / "workspace_read.py")
        mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
        return mod.scrub_text(text)
    except Exception:  # noqa: BLE001 - if the scrubber can't load, keep nothing rather than raw keys
        return ""


def _secret_drop(src: Path) -> bool:
    """Secret stores never go on the bus: the shared permissions check, by the given and the resolved path."""
    try:
        spec = importlib.util.spec_from_file_location("agent_stack_permissions_drop", Path(__file__).resolve().parents[1] / "hands" / "permissions.py")
        perm = importlib.util.module_from_spec(spec); spec.loader.exec_module(perm)
        return bool(perm.is_secret_path(str(src)) or perm.is_secret_path(str(src.resolve())))
    except Exception:  # noqa: BLE001 — if the check cannot run, refuse rather than read blind
        return True


def save_drop(paths: list, *, hive: Path | None = None, gen: int | None = None) -> dict:
    """Store a dropped file on the bus. Never execute. Never open."""
    dest_hive = hive if hive is not None else HIVE
    if act_if_current(dest_hive, gen, lambda bus: bus) is None:
        return _denied("drop")
    names = [str(p or "").strip() for p in (paths or []) if str(p or "").strip()]
    if not names:
        return {"ok": False, "wire": "drop", "spoken": "UNKNOWN. No file on that drop."}
    src = Path(names[0]).expanduser()
    if not src.is_file():
        return {"ok": False, "wire": "drop", "spoken": "UNKNOWN. That drop is not a file on disk."}
    secret_drop = _secret_drop(src)  # Evens 10-16: flag, never stop (it was refused here)
    try:
        size = src.stat().st_size
    except OSError:
        return {"ok": False, "wire": "drop", "spoken": "UNKNOWN. That drop could not be read."}
    if size > DROP_MAX:
        return {
            "ok": False,
            "wire": "drop",
            "spoken": "UNKNOWN. That file is over 20MB. I will not take it.",
        }
    suffix = src.suffix.lower()
    mime = "application/octet-stream"
    dest_path = str(src.resolve())
    text = ""
    still = ""
    if suffix in IMAGE_SUFFIX:
        mime = "image/png" if suffix == ".png" else "image/webp" if suffix == ".webp" else "image/jpeg"
        folder = dest_hive / "bus" / "drop"
        folder.mkdir(parents=True, exist_ok=True)
        dest = folder / src.name
        shutil.copy2(src, dest)
        dest_path = str(dest)
        still = dest_path
    elif suffix == ".pdf":
        mime = "application/pdf"
        text = _pdf_first_page(src)
    elif suffix in TEXT_SUFFIX:
        mime = {
            ".txt": "text/plain",
            ".md": "text/markdown",
            ".markdown": "text/markdown",
            ".json": "application/json",
            ".html": "text/html",
            ".htm": "text/html",
            ".csv": "text/csv",
        }[suffix]
        text = _plain_text(src)
    if secret_drop and text:
        text = _scrub_secret_values(text)  # the values stay masked on the bus and in model context
    payload = {
        "ok": True,
        "wire": "drop",
        "name": src.name,
        "path": dest_path,
        "bytes": size,
        "mime": mime,
        "text": text,
        "still": still,
        "captured_at": now_iso(),
        "spoken": ("Heads up, this file holds secrets (keys or passwords); their values stay masked. " if secret_drop else "")
                  + f"I have {src.name} on the bus. Same conversation.",
    }
    def apply(bus: dict) -> dict:
        turns = bus.get("turns") if isinstance(bus.get("turns"), list) else []
        turns = [row for row in turns if isinstance(row, dict)]
        turns.append({"user": f"[dropped {src.name}]", "jarvis": payload["spoken"]})
        bus["drop"] = payload
        bus["turns"] = turns[-8:]
        bus["updated_at"] = now_iso()
        return bus

    if act_if_current(dest_hive, gen, apply) is None:
        return _denied("drop")
    return payload


def set_watch_arm(
    armed: bool,
    *,
    hive: Path | None = None,
    gen: int | None = None,
    evens: bool = False,
) -> dict:
    dest_hive = hive if hive is not None else HIVE
    spoken = (
        "Watch is on. Switch to the app you want me to use, then tell me."
        if armed
        else "Watch off."
    )

    def apply(bus: dict) -> dict:
        watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
        if armed and not evens and not bool(watch.get("armed")):
            return bus
        watch["armed"] = bool(armed)
        watch["held"] = bool(armed) and (bool(evens) or bool(watch.get("held")))
        watch["updated_at"] = now_iso()
        if armed:
            watch["spoken"] = spoken
        else:
            watch["held"] = False
            watch["spoken"] = "Watch off."
        bus["watch"] = watch
        bus["updated_at"] = now_iso()
        return bus

    bus = act_if_current(dest_hive, gen, apply, evens=evens)
    if bus is None:
        return _denied("watch")
    watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
    actually = bool(watch.get("armed"))
    return {
        "ok": True,
        "wire": "watch",
        "armed": actually,
        "spoken": watch.get("spoken") or ("Watch is on." if actually else spoken),
    }


def set_eyes_active(active: bool, *, hive: Path | None = None, gen: int | None = None) -> dict:
    dest_hive = hive if hive is not None else HIVE
    spoken = "Eyes still is on disk. Local only." if active else "Eyes off."

    def apply(bus: dict) -> dict:
        eyes = bus.get("eyes") if isinstance(bus.get("eyes"), dict) else {}
        eyes["active"] = bool(active)
        eyes["updated_at"] = now_iso()
        eyes["spoken"] = spoken
        bus["eyes"] = eyes
        bus["updated_at"] = now_iso()
        return bus

    bus = act_if_current(dest_hive, gen, apply)
    if bus is None:
        return _denied("eyes")
    return {"ok": True, "wire": "eyes", "active": bool(active), "spoken": spoken}


def set_watch_allow(
    app: str,
    *,
    always: bool = False,
    hive: Path | None = None,
    gen: int | None = None,
) -> dict:
    dest_hive = hive if hive is not None else HIVE
    try:
        from hands.watch_frame import normalize_watch_app
    except ImportError:
        path = Path(__file__).resolve().parent.parent / "hands" / "watch_frame.py"
        spec = importlib.util.spec_from_file_location("agent_stack_watch_allow", path)
        normalize_watch_app = None
        if spec is not None and spec.loader is not None:
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            normalize_watch_app = getattr(mod, "normalize_watch_app", None)
    key = normalize_watch_app(app) if normalize_watch_app else str(app or "").strip().lower()
    held: dict = {}

    def apply(bus: dict) -> dict:
        watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
        bucket = "allow" if always else "session_allow"
        rows = [str(item) for item in (watch.get(bucket) if isinstance(watch.get(bucket), list) else [])]
        if key and key not in [str(item).strip().lower() for item in rows]:
            rows.append(str(app or key).strip()[:80] or key)
        watch[bucket] = rows
        watch.pop("pending", None)
        watch["updated_at"] = now_iso()
        bus["watch"] = watch
        bus["updated_at"] = now_iso()
        held.clear()
        held.update(watch)
        return bus

    if act_if_current(dest_hive, gen, apply) is None:
        return _denied("watch")
    return {"ok": True, "wire": "watch", "allow": held.get("allow") or [], "session_allow": held.get("session_allow") or []}


def watch_is_armed(bus: dict) -> bool:
    watch = bus.get("watch") if isinstance(bus, dict) and isinstance(bus.get("watch"), dict) else {}
    return bool(watch.get("armed"))


def vision_stills(bus: dict) -> list[Path]:
    """Local image paths the mouth may attach. Missing files are skipped."""
    if not isinstance(bus, dict):
        return []
    out: list[Path] = []
    seen: set[str] = set()
    eyes = bus.get("eyes") if isinstance(bus.get("eyes"), dict) else {}
    watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
    drop = bus.get("drop") if isinstance(bus.get("drop"), dict) else {}
    screen = watch.get("screen") if isinstance(watch.get("screen"), dict) else {}
    eyes_path = eyes.get("path") if eyes_are_live(eyes) else ""
    screen_path = screen.get("path") if watch_is_armed(bus) else ""
    for raw in (eyes_path, screen_path, drop.get("still") or ""):
        text = str(raw or "").strip()
        if not text or text in seen:
            continue
        path = Path(text)
        if path.is_file() and path.suffix.lower() in IMAGE_SUFFIX:
            seen.add(text)
            out.append(path)
    return out


def _resolve_armed(was: dict, arm: bool | None) -> bool:
    if arm is True:
        return True
    if arm is False:
        return False
    return bool(was.get("armed"))


def run_watch(
    *,
    hive: Path | None = None,
    grab: bool = True,
    arm: bool | None = None,
    gen: int | None = None,
    evens: bool = False,
) -> dict:
    """Safari front + optional screencapture. Prove gen before snapshot. Arm only Evens."""
    dest_hive = hive if hive is not None else HIVE
    token = gen
    if act_if_current(dest_hive, token, lambda bus: bus, evens=evens) is None:
        return _denied("watch")
    if arm is False:
        return set_watch_arm(False, hive=dest_hive, gen=token)
    dry = os.environ.get("AGENT_STACK_DRY_WATCH") == "1"
    safari: dict = {}
    screen: dict = {}
    frame = ""
    state: dict = {}
    if dry:
        ok = True
        spoken = "Watch dry. Screen not grabbed."
        try:
            from hands.watch_frame import stamp_dry
        except ImportError:
            path = Path(__file__).resolve().parent.parent / "hands" / "watch_frame.py"
            spec = importlib.util.spec_from_file_location("agent_stack_watch_frame_sense", path)
            stamp_dry = None
            if spec is not None and spec.loader is not None:
                mod = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(mod)
                stamp_dry = getattr(mod, "stamp_dry", None)
        if stamp_dry is not None:
            row = stamp_dry()
            frame = str(row.get("frame_id") or "")
            state = row.get("state") if isinstance(row.get("state"), dict) else {}
            screen = {"path": "", "bytes": 0, "frame_id": frame, "state": state, "dry": True}
    else:
        if act_if_current(dest_hive, token, lambda bus: bus, evens=evens) is None:
            return _denied("watch")
        try:
            observer = see()
        except (OSError, ImportError, SyntaxError, RuntimeError):
            # Source failure must not silently fall back to the old observer.
            snap = {"ok": False, "frame_id": "", "state": {}, "screen": {},
                    "spoken": "The current screen observer couldn't load. No action frame is available."}
        else:
            snap = observer.snapshot(hive=dest_hive, grab=bool(grab))
        snap = snap if isinstance(snap, dict) else {}
        safari = snap.get("safari") if isinstance(snap.get("safari"), dict) else {}
        screen = snap.get("screen") if isinstance(snap.get("screen"), dict) else {}
        spoken = str(snap.get("spoken") or "I grabbed the screen.")
        ok = bool(snap.get("ok"))
        frame = str(snap.get("frame_id") or screen.get("frame_id") or "")
        state = snap.get("state") if isinstance(snap.get("state"), dict) else {}
        if screen:
            screen = {**screen, "frame_id": frame, "state": state}
    held: dict = {}

    def apply(bus: dict) -> dict:
        was = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
        resolved = _resolve_armed(was, arm)
        if arm is True and evens:
            resolved = True
        elif arm is True and not evens:
            resolved = bool(was.get("armed"))
        payload = {
            "ok": ok,
            "wire": "watch",
            "armed": resolved,
            "held": bool(was.get("held")) if arm is None else (bool(resolved) and (bool(evens) or bool(was.get("held")))),
            "spoken": spoken,
            "captured_at": now_iso(),
            "frame_id": frame,
            "state": state,
        }
        # Observation replaces the frame, not action history. Use the latest
        # ledger under the bus lock, including receipts arriving during capture.
        if isinstance(was.get("ledger"), dict):
            payload["ledger"] = dict(was["ledger"])
        if isinstance(was.get("allow"), list):
            payload["allow"] = list(was.get("allow") or [])
        if isinstance(was.get("session_allow"), list):
            payload["session_allow"] = list(was.get("session_allow") or [])
        if isinstance(was.get("pending"), dict):
            payload["pending"] = dict(was.get("pending") or {})
        if dry:
            payload["dry"] = True
            payload["safari"] = {
                "title": str(safari.get("title") or ""),
                "url": str(safari.get("url") or ""),
            }
            payload["screen"] = screen or {"path": "", "bytes": 0, "frame_id": frame, "state": state, "dry": True}
        else:
            payload["safari"] = {
                "title": str(safari.get("title") or ""),
                "url": str(safari.get("url") or ""),
            }
            payload["screen"] = {
                "path": str(screen.get("path") or ""),
                "bytes": screen.get("bytes") or 0,
                "frame_id": frame,
                "state": state,
            }
        bus["watch"] = payload
        bus["updated_at"] = now_iso()
        held.clear()
        held.update(payload)
        return bus

    out = act_if_current(dest_hive, token, apply, evens=evens)
    if out is None:
        return _denied("watch")
    return held or _denied("watch")


def pack_senses(bus: dict) -> str:
    """Context lines for the existing pipeline pack. Paths only. No publish."""
    if not isinstance(bus, dict):
        return ""
    lines: list[str] = []
    eyes = bus.get("eyes") if isinstance(bus.get("eyes"), dict) else {}
    watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
    if eyes_are_live(eyes) and eyes.get("path"):
        lines.append("Eyes (camera on this Mac, local only):")
        lines.append(f"Camera still: {eyes['path']}")
        lines.append("Look at that image. That is what the camera sees.")
        if eyes.get("captured_at"):
            lines.append(f"Eyes captured_at: {eyes['captured_at']}")
        lines.append("")
    if watch:
        safari = watch.get("safari") if isinstance(watch.get("safari"), dict) else {}
        screen = watch.get("screen") if isinstance(watch.get("screen"), dict) else {}
        lines.append("Watch (screen on this Mac, local only):")
        if safari.get("title") or safari.get("url"):
            lines.append(f"Safari title: {safari.get('title') or 'none'}")
            lines.append(f"Safari url: {safari.get('url') or 'none'}")
        if screen.get("path"):
            lines.append(f"Evens's screen image: {screen['path']}")
            lines.append("Look at that image. That is what he is seeing.")
        elif watch.get("spoken"):
            lines.append(str(watch.get("spoken")))
        if watch.get("captured_at"):
            lines.append(f"Watch captured_at: {watch['captured_at']}")
        if watch.get("frame_id") or (screen.get("frame_id")):
            lines.append(f"Watch frame_id: {watch.get('frame_id') or screen.get('frame_id')}")
        if watch.get("armed"):
            lines.append("Watch is armed. Computer use is live.")
        lines.append("")
    drop = bus.get("drop") if isinstance(bus.get("drop"), dict) else {}
    if drop.get("path") or drop.get("name"):
        lines.append("Dropped file (bus only, not executed):")
        lines.append(f"Name: {drop.get('name') or 'file'}")
        lines.append(f"Path: {drop.get('path') or 'none'}")
        if drop.get("text"):
            lines.append(str(drop.get("text"))[:800])
        lines.append("")
    return "\n".join(lines)
