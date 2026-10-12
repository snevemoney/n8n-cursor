#!/usr/bin/env python3
"""One Watch stroke: bind ticket, surroundings ledger, HID. Not a harvest."""
from __future__ import annotations

import hashlib
import importlib.util
import inspect
import json
import os
import re
from pathlib import Path

HARD_LABEL = re.compile(
    r"\b("
    r"send|pay|deploy|book|publish|checkout|buy now|place order|"
    r"confirm purchase|submit payment|transfer|blue button"
    r")\b",
    re.I,
)
HARD_SPOKEN = (
    "Proposal only. I will not send, pay, deploy, book, or publish. "
    "That hard step stays with you."
)
STOPPED = "Stopped. Standing by."
NO_STAMP = "UNKNOWN. Watch has no frame stamp. I did not click."
STALE = "Frame moved. I looked again."
LEDGERED = "Already acted on this screen. I will not double-send."
UNCHANGED = "Screen did not change. I will not confirm the click."
NO_POST_OBSERVATION = "Action sent, but the post-action observation is unavailable. Outcome unverified."
WATCH_OFF = "Watch is off. Tap Watch or say Watch first."
SELF_APPS = frozenset({"jarvisorb", "jarvis orb", "jarvis-widget"})
ALLOW_ALWAYS_RE = re.compile(r"^\s*(?:always\s+allow|allow\s+always)\s*[.!?]?\s*$", re.I)
ALLOW_ONCE_RE = re.compile(r"^\s*allow(?:\s+it)?\s*[.!?]?\s*$", re.I)
ALLOW_CANCEL_RE = re.compile(r"^\s*cancel\s*[.!?]?\s*$", re.I)


def surrounding_state(safari: dict | None, app: str = "", window: str = "") -> dict:
    tab = safari if isinstance(safari, dict) else {}
    return {
        "app": str(app or tab.get("app") or "").strip()[:80],
        "window": str(window or tab.get("window") or tab.get("title") or "").strip()[:120],
        "title": str(tab.get("title") or "").strip()[:120],
        "url": str(tab.get("url") or "").strip()[:240],
    }


def frame_id_from_bytes(data: bytes, state: dict | None = None) -> str:
    raw = data if data else b""
    blob = json.dumps(state or {}, sort_keys=True, ensure_ascii=True).encode("utf-8")
    return hashlib.sha256(raw + b"\0" + blob).hexdigest()[:16]


def stamp_see(path: Path, *, safari: dict | None = None, app: str = "", window: str = "", focus: dict | None = None, text_binding: dict | None = None) -> dict:
    dest = Path(path)
    data = dest.read_bytes() if dest.is_file() else b""
    state = surrounding_state(safari, app, window)
    if isinstance(focus, dict):
        state["focus"] = dict(focus)
    if isinstance(text_binding, dict):
        state["text_binding"] = {**text_binding, "selection": dict(text_binding.get("selection") or {})}
    frame = frame_id_from_bytes(data, state)
    return {"frame_id": frame, "path": str(dest), "bytes": len(data), "state": state}


def stamp_dry(*, seed: str | None = None, safari: dict | None = None, app: str = "", window: str = "") -> dict:
    mark = (seed or os.environ.get("AGENT_STACK_DRY_FRAME") or "dry").strip() or "dry"
    state = surrounding_state(safari, app, window)
    frame = frame_id_from_bytes(mark.encode("utf-8"), state)
    return {"frame_id": frame, "path": "", "bytes": 0, "state": state, "dry": True}


def snap_frame(snap: dict | None) -> dict:
    row = snap if isinstance(snap, dict) else {}
    screen = row.get("screen") if isinstance(row.get("screen"), dict) else {}
    safari = row.get("safari") if isinstance(row.get("safari"), dict) else {}
    state = row.get("state") if isinstance(row.get("state"), dict) else surrounding_state(safari)
    frame = str(row.get("frame_id") or screen.get("frame_id") or "").strip()
    return {"frame_id": frame, "state": state, "path": str(screen.get("path") or row.get("path") or "")}


def same_state(left: dict | None, right: dict | None) -> bool:
    a = left if isinstance(left, dict) else {}
    b = right if isinstance(right, dict) else {}
    # App flickers when Cursor/Orb steals focus during think. The work tab is title/url.
    keys = ("window", "title", "url")
    return all(str(a.get(k) or "") == str(b.get(k) or "") for k in keys)


def same_binding(left: dict | None, right: dict | None) -> bool:
    """A fresh click must keep its foreground app and capture coordinates.

    Pixel jitter remains separate from binding identity; changed pixels alone
    are not a semantic postcondition or proof of a successful action.
    """
    a = left if isinstance(left, dict) else {}
    b = right if isinstance(right, dict) else {}
    return (same_state(a, b)
            and str(a.get("app") or "") == str(b.get("app") or "")
            and a.get("frame_bounds") == b.get("frame_bounds")
            and a.get("focus") == b.get("focus")
            and a.get("text_binding") == b.get("text_binding"))


def normalize_watch_app(name: str) -> str:
    return str(name or "").strip().lower()


def watch_app_is_self(name: str) -> bool:
    return normalize_watch_app(name) in SELF_APPS


def watch_app_allowed(watch: dict | None, app: str) -> bool:
    row = watch if isinstance(watch, dict) else {}
    key = normalize_watch_app(app)
    if watch_app_is_self(key) or not key:
        return False
    always = row.get("allow") if isinstance(row.get("allow"), list) else []
    session = row.get("session_allow") if isinstance(row.get("session_allow"), list) else []
    names = [normalize_watch_app(item) for item in (*always, *session)]
    return "*" in names or key in names


def watch_allow_verb(utterance: str) -> str:
    heard = (utterance or "").strip()
    if ALLOW_ALWAYS_RE.match(heard):
        return "always"
    if ALLOW_ONCE_RE.match(heard):
        return "allow"
    if ALLOW_CANCEL_RE.match(heard):
        return "cancel"
    return ""


def allow_ask(app: str) -> str:
    name = str(app or "that app").strip() or "that app"
    return f"Allow Jarvis to use {name}? Say allow, always allow, or cancel."


def wants_safari_focus(state: dict | None) -> bool:
    row = state if isinstance(state, dict) else {}
    app = str(row.get("app") or "").strip().lower()
    url = str(row.get("url") or "")
    if "safari" in app:
        return True
    return "watch-lab" in url or "127.0.0.1:4018" in url


def ledger_key(state: dict | None, action: str, target: str) -> str:
    blob = {
        "state": surrounding_state(
            state if isinstance(state, dict) else {},
            str((state or {}).get("app") or "") if isinstance(state, dict) else "",
            str((state or {}).get("window") or "") if isinstance(state, dict) else "",
        ),
        "action": str(action or "").strip().lower(),
        "target": str(target or "").strip()[:120],
    }
    return hashlib.sha256(json.dumps(blob, sort_keys=True, ensure_ascii=True).encode("utf-8")).hexdigest()[:24]


def action_target(args: dict | None) -> tuple[str, str]:
    row = args if isinstance(args, dict) else {}
    op = str(row.get("op") or "click").strip().lower() or "click"
    if op == "type":
        return op, "text-sha256:" + hashlib.sha256(str(row.get("text") or "").encode("utf-8")).hexdigest()
    if op == "scroll":
        return op, str(row.get("direction") or "down")
    label = str(
        row.get("label")
        or row.get("target")
        or row.get("name")
        or row.get("control")
        or row.get("speak")
        or ""
    ).strip()[:120]
    return op, label


def command_fingerprint(action: dict | None) -> str:
    """Identity of emitted input, excluding model prose and display labels."""
    row = action if isinstance(action, dict) else {}
    op = str(row.get("op") or "click").strip().lower()
    body = {"op": op}
    def number(value, default=None):
        if value is None:
            return default
        try:
            return float(value)
        except (TypeError, ValueError):
            return str(value)
    if op == "type":
        body["text_sha256"] = hashlib.sha256(str(row.get("text") or "").encode("utf-8")).hexdigest()
    elif op == "scroll":
        body["direction"] = str(row.get("direction") or "down").strip().lower()
    elif op == "click":
        body.update(x=number(row.get("x"), .5), y=number(row.get("y"), .5))
        bounds = row.get("_bound_frame_bounds")
        body["frame_bounds"] = {k: number(bounds.get(k)) for k in ("x", "y", "w", "h")} if isinstance(bounds, dict) else None
    return hashlib.sha256(json.dumps(body, sort_keys=True, ensure_ascii=True).encode("utf-8")).hexdigest()


def is_hard_watch(utterance: str = "", action: dict | None = None) -> bool:
    row = action if isinstance(action, dict) else {}
    texts = (
        utterance,
        row.get("label"),
        row.get("target"),
        row.get("name"),
        row.get("control"),
        row.get("speak"),
        row.get("text"),
    )
    return any(HARD_LABEL.search(str(item or "")) for item in texts)


def _bus_io():
    path = Path(__file__).resolve().parent.parent / "memory" / "bus_io.py"
    spec = importlib.util.spec_from_file_location("agent_stack_bus_io_watch", path)
    if spec is None or spec.loader is None:
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _see():
    path = Path(__file__).resolve().parent / "see.py"
    spec = importlib.util.spec_from_file_location("agent_stack_see_watch", path)
    if spec is None or spec.loader is None:
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _act(hive: Path, gen: int | None, apply):
    io = _bus_io()
    if io is None or not hasattr(io, "act_if_current"):
        return None
    return io.act_if_current(hive, gen, apply)


def _watch_ledger(bus: dict) -> dict:
    watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
    led = watch.get("ledger")
    return led if isinstance(led, dict) else {}


def _call_perceive(perceive, hive: Path, gen: int | None) -> dict:
    if perceive is None:
        return {}
    signature = inspect.signature(perceive)
    for kwargs in ({"hive": hive, "gen": gen}, {}):
        try:
            signature.bind(**kwargs)
        except TypeError:
            continue
        out = perceive(**kwargs)
        return out if isinstance(out, dict) else {}
    raise TypeError("Watch observer has no supported signature")


def _default_hid(action: dict, hive: Path | None, gen: int | None) -> dict:
    hand = _see()
    if hand is None or not hasattr(hand, "mac_act"):
        return {"ok": False, "wire": "mac_act", "spoken": "UNKNOWN. Watch has no hand."}
    return hand.mac_act(
        str(action.get("op") or "click"),
        x=action.get("x"),
        y=action.get("y"),
        text=str(action.get("text") or ""),
        direction=str(action.get("direction") or "down"),
        frame_bounds=action.get("_bound_frame_bounds"),
        hive=hive,
        gen=gen,
    )


def _call_hid(hid_fn, action: dict, hive: Path, gen: int | None) -> dict:
    fn = hid_fn if hid_fn is not None else _default_hid
    # Select compatibility before execution: an internal TypeError is not a retry.
    signature = inspect.signature(fn)
    for args, kwargs in (((action,), {"hive": hive, "gen": gen}), ((action,), {}), ((), {})):
        try:
            signature.bind(*args, **kwargs)
        except TypeError:
            continue
        out = fn(*args, **kwargs)
        return out if isinstance(out, dict) else {}
    raise TypeError("Watch HID driver has no supported signature")


def _result(
    *,
    ok: bool,
    spoken: str,
    op: str,
    hid: bool = False,
    stale: bool = False,
    ledger: bool = False,
    denied: bool = False,
) -> dict:
    return {
        "ok": ok,
        "spoken": spoken,
        "op": op,
        "hid": hid,
        "stale": stale,
        "ledger": ledger,
        "denied": denied,
        "wires": ["mac_act"],
    }


def expected_inserted_value(state, text):
    if not isinstance(state, dict) or not isinstance(state.get("value"), str):
        return None
    selection = state.get("selection")
    if not isinstance(selection, dict):
        return None
    start, count = selection.get("location"), selection.get("length")
    if type(start) is not int or type(count) is not int or start < 0 or count < 0:
        return None
    try:
        encoded = state["value"].encode("utf-16-le")
        if (start + count) * 2 > len(encoded):
            return None
        return (encoded[:start * 2] + str(text).encode("utf-16-le")
                + encoded[(start + count) * 2:]).decode("utf-16-le")
    except UnicodeError:
        return None


def text_state_fingerprint(state):
    if expected_inserted_value(state, "") is None:
        return None
    return {"value_sha256": hashlib.sha256(state["value"].encode("utf-8")).hexdigest(),
            "selection": dict(state["selection"])}


def commit_watch_stroke(
    hive: Path,
    gen: int | None,
    derived: dict | None,
    action: dict | None,
    *,
    perceive,
    hid_fn=None,
    utterance: str = "",
) -> dict:
    """One door. Missing stamp denies. Ledger is surroundings. HID is last."""
    held: dict = {}

    def prove(bus: dict) -> dict:
        watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
        held["armed"] = bool(watch.get("armed"))
        held["ledger"] = dict(_watch_ledger(bus))
        return bus

    if _act(hive, gen, prove) is None:
        return _result(ok=False, spoken=STOPPED, op="stop", denied=True)
    if not held.get("armed"):
        return _result(ok=False, spoken=WATCH_OFF, op="deny", denied=True)
    bound = snap_frame(derived)
    if not isinstance(derived, dict) or derived.get("ok") is False or not bound.get("frame_id"):
        return _result(ok=False, spoken=NO_STAMP, op="deny", denied=True)
    args = action if isinstance(action, dict) else {}
    if is_hard_watch(utterance, args):
        return _result(ok=False, spoken=HARD_SPOKEN, op="hard", denied=True)
    if _act(hive, gen, lambda bus: bus) is None:
        return _result(ok=False, spoken=STOPPED, op="stop", denied=True)
    observed_fresh = _call_perceive(perceive, hive, gen)
    fresh = snap_frame(observed_fresh)
    if not isinstance(observed_fresh, dict) or observed_fresh.get("ok") is False or not fresh.get("frame_id"):
        return _result(ok=False, spoken=NO_STAMP, op="deny", denied=True)
    # Retain the derived foreground and capture geometry at the HID boundary.
    if (not same_binding(fresh.get("state"), bound.get("state"))
            or fresh.get("frame_id") != bound.get("frame_id")):
        return _result(ok=False, spoken=STALE, op="stale", stale=True)
    name, target = action_target(args)
    key = ledger_key(bound.get("state"), name, target)
    # Retain reservations/receipts written before full-text identity existed.
    # Their truncated identity cannot prove a safe replay after this upgrade.
    legacy_key = ledger_key(bound.get("state"), name, str(args.get("text") or "")[:80]) if name == "type" else ""
    action_identity = {"operation": name, "ledger_key": key, "generation": gen}
    if name == "type":
        action_identity["expected_text_sha256"] = hashlib.sha256(str(args.get("text") or "").encode("utf-8")).hexdigest()
    seen: dict = {}

    def read_led(bus: dict) -> dict:
        watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
        seen["armed"] = bool(watch.get("armed"))
        seen["allowed"] = watch_app_allowed(watch, str((bound.get("state") or {}).get("app") or ""))
        seen["hit"] = key in _watch_ledger(bus) or legacy_key in _watch_ledger(bus)
        return bus

    if _act(hive, gen, read_led) is None:
        return _result(ok=False, spoken=STOPPED, op="stop", denied=True)
    if not seen.get("armed"):
        return _result(ok=False, spoken=WATCH_OFF, op="deny", denied=True)
    if not seen.get("allowed"):
        return _result(ok=False, spoken=allow_ask(str((bound.get("state") or {}).get("app") or "")), op="deny", denied=True)
    if seen.get("hit"):
        return _result(ok=False, spoken=LEDGERED, op="ledger", ledger=True)
    if wants_safari_focus(bound.get("state")) and os.environ.get("AGENT_STACK_DRY_WATCH") != "1":
        hand = _see()
        focus = getattr(hand, "safari_activate", None) if hand is not None else None
        if callable(focus):
            brought = focus()
            if isinstance(brought, dict) and not brought.get("ok"):
                return _result(
                    ok=False,
                    spoken=str(brought.get("spoken") or "Watch could not bring Safari forward."),
                    op="deny",
                    denied=True,
                )
    text_reader = None
    expected_value = None
    if name == "type" and os.environ.get("AGENT_STACK_DRY_WATCH") != "1":
        hand = _see()
        text_reader = getattr(hand, "read_focused_text", None) if hand is not None else None
        try:
            before_text = text_reader((bound.get("state") or {}).get("focus")) if callable(text_reader) else None
        except Exception:
            before_text = None
        observed_binding = (bound.get("state") or {}).get("text_binding")
        if observed_binding is None:
            return _result(ok=False, spoken="The observation has no text-field state. I need to look again before typing.", op="stale", stale=True)
        current_text_binding = text_state_fingerprint(before_text)
        if current_text_binding is None:
            return _result(ok=False, spoken="I couldn't read a valid field selection. Nothing was typed.", op="deny", denied=True)
        if current_text_binding != observed_binding:
            return _result(ok=False, spoken="The field value or selection changed. I need to look again before typing.", op="stale", stale=True)
        expected_value = expected_inserted_value(before_text, str(args.get("text") or ""))
        if expected_value is None:
            return _result(ok=False, spoken="I couldn't read this field and its selection. I need a verifiable text target before typing.", op="deny", denied=True)
    geometry = (bound.get("state") or {}).get("frame_bounds")
    bound_args = {**args, "_bound_frame_bounds": dict(geometry) if isinstance(geometry, dict) else None}
    command_sha256 = command_fingerprint(bound_args)
    action_identity["command_sha256"] = command_sha256
    reservation = {"command_sha256": command_sha256, "transition": False, "execution_uncertain": True, "phase": "reserved", "gen": gen,
                   "app": str((bound.get("state") or {}).get("app") or ""),
                   "focus": dict((bound.get("state") or {}).get("focus") or {}),
                   "text_binding": (bound.get("state") or {}).get("text_binding")}
    claimed = {"ok": False}
    def claim_led(bus: dict) -> dict:
        watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
        led = dict(_watch_ledger(bus))
        # Permission is current bus state, not authority retained from the
        # earlier model-selection turn. Bind it atomically with the action claim.
        if not watch.get("armed"):
            claimed["denied"] = WATCH_OFF
            return bus
        if not watch_app_allowed(watch, str((bound.get("state") or {}).get("app") or "")):
            claimed["denied"] = allow_ask(str((bound.get("state") or {}).get("app") or ""))
            return bus
        if key in led or legacy_key in led:
            return bus
        led[key] = dict(reservation)
        watch["ledger"] = led
        bus["watch"] = watch
        claimed["ok"] = True
        return bus
    if _act(hive, gen, claim_led) is None:
        return _result(ok=False, spoken=STOPPED, op="stop", denied=True)
    if claimed.get("denied"):
        return _result(ok=False, spoken=claimed["denied"], op="deny", denied=True)
    if not claimed["ok"]:
        return _result(ok=False, spoken=LEDGERED, op="ledger", ledger=True)
    try:
        # Geometry and command identity came from the verified observation.
        posted = _call_hid(hid_fn, bound_args, hive, gen)
    except Exception as exc:
        # The driver may have emitted before failing. Do not infer no action or replay.
        error_type = type(exc).__name__
        def retain_uncertain(bus: dict) -> dict:
            watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
            led = dict(_watch_ledger(bus))
            led[key] = {"transition": False, "hid_error_type": error_type, "execution_uncertain": True}
            watch["ledger"] = led
            bus["watch"] = watch
            return bus
        if _act(hive, gen, retain_uncertain) is None:
            return _result(ok=False, spoken=STOPPED, op="stop", denied=True)
        result = _result(
            ok=False,
            spoken="Driver failed. Action may have been sent. Outcome unverified; I will not repeat it.",
            op="verify",
            ledger=True,
        )
        result["execution_uncertain"] = True
        return result
    if not posted.get("ok") and posted.get("execution_uncertain"):
        # Reservation must survive a possibly emitted action: replay is unsafe.
        result = _result(ok=False, spoken=str(posted.get("spoken") or
            "Action may have been sent. Outcome unverified; I will not repeat it."),
            op="verify", ledger=True)
        result["execution_uncertain"] = True
        return result
    if not posted.get("ok"):
        # Preserve the existing retry contract for a driver-reported non-emission.
        def release_led(bus: dict) -> dict:
            watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
            led = dict(_watch_ledger(bus))
            if led.get(key) == reservation:
                del led[key]
            watch["ledger"] = led
            bus["watch"] = watch
            return bus
        _act(hive, gen, release_led)
        return _result(
            ok=False,
            spoken=str(posted.get("spoken") or STOPPED),
            op=str(posted.get("op") or "fail"),
            hid=False,
        )
    if _act(hive, gen, lambda bus: bus) is None:
        return _result(ok=False, spoken=STOPPED, op="stop", hid=True, denied=True)
    observation_error_type = ""
    try:
        observed = _call_perceive(perceive, hive, gen)
    except Exception as exc:
        # HID already ran: retain its receipt even when the observer fails.
        observed = {"ok": False}
        observation_error_type = type(exc).__name__
    post = snap_frame(observed)
    post_valid = bool(post.get("frame_id")) and observed.get("ok") is not False
    moved = post_valid and not same_state(post.get("state"), bound.get("state"))
    verification = {"scope": "observed_transition" if moved else "post_action_observation",
                    "task_verified": False, "before_frame_id": bound.get("frame_id"),
                    "after_frame_id": post.get("frame_id"),
                    "post_observation_available": post_valid, "transition_observed": bool(moved)}
    if expected_value is not None:
        try:
            after_text = text_reader((bound.get("state") or {}).get("focus"))
        except Exception as exc:
            after_text = None
            verification["field_observation_error_type"] = type(exc).__name__
        actual_value = after_text.get("value") if isinstance(after_text, dict) else None
        matched = isinstance(actual_value, str) and actual_value == expected_value
        verification.update(scope="field_value", postcondition_verified=matched,
            expected_value_sha256=hashlib.sha256(expected_value.encode("utf-8")).hexdigest(),
            observed_value_sha256=hashlib.sha256(actual_value.encode("utf-8")).hexdigest() if isinstance(actual_value, str) else "")
    stamped = {"ok": False}

    def write_led(bus: dict) -> dict:
        watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
        led = dict(_watch_ledger(bus))
        led[key] = {"transition": bool(moved), "action": dict(action_identity), "verification": dict(verification)}
        if observation_error_type:
            led[key]["observation_error_type"] = observation_error_type
        watch["ledger"] = led
        bus["watch"] = watch
        stamped["ok"] = True
        return bus

    if _act(hive, gen, write_led) is None or not stamped.get("ok"):
        return _result(ok=False, spoken=STOPPED, op="stop", hid=True, denied=True)
    receipt = {"action": action_identity, "verification": verification, "task_verified": False}
    if expected_value is not None:
        verified = post_valid and verification.get("postcondition_verified") is True
        line = "I entered the text and checked the field value." if verified else "Text entry was sent, but the field value didn't verify. I will not repeat it."
        return {**_result(ok=bool(verified), spoken=line,
            op="type" if verified else "verify", hid=True, ledger=True), **receipt}
    if not post_valid:
        line = NO_POST_OBSERVATION
        if name == "type":
            line = "I sent the text, but couldn't read the field afterward. Its contents are still unverified."
        elif name == "scroll":
            line = "I sent the scroll input, but couldn't observe the page afterward. Its position is still unverified."
        return {**_result(ok=False, spoken=line, op="verify", hid=True, ledger=True), **receipt}
    if not moved:
        line = UNCHANGED
        if name == "type":
            line = "I sent the text, but haven't confirmed what's in the field."
        elif name == "scroll":
            line = "I sent the scroll input, but haven't confirmed the page position."
        return {**_result(ok=False, spoken=line, op="verify", hid=True, ledger=True), **receipt}
    return {
        **_result(
            ok=True,
            spoken="Action sent and a screen transition observed. The requested task is not yet verified.",
            op=name,
            hid=True,
            ledger=True,
        ),
        **receipt,
    }
