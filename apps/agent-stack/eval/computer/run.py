#!/usr/bin/env python3
"""Named 8-row computer-use plate. Dry default. Live HID only after Evens arms Watch."""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import tempfile
import threading
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
STACK = HERE.parents[1]
ROOT = HERE.parents[3]
PLATE = HERE / "plate.yaml"
LAST = HERE / "last.json"
LAB = "http://127.0.0.1:4018/watch-lab"
LIVE_HIVE = ROOT / "docs/hive/outer-heaven/.hive"
HID_ROWS = frozenset({"click_next", "type_ready", "scroll_down", "click_go", "type_hive"})
TURN_SRC = STACK / "mouth" / "turn.py"


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _coerce(raw: str):
    text = raw.strip().strip('"').strip("'")
    if text in {"true", "True"}:
        return True
    if text in {"false", "False"}:
        return False
    return text


def load_plate(path: Path | None = None) -> dict:
    dest = path or PLATE
    rows: list[dict] = []
    meta: dict = {"schema_version": 1, "plate": "jarvis-computer-8", "rows": rows}
    current: dict | None = None
    for line in dest.read_text(encoding="utf-8").splitlines():
        if line.startswith("  - id:"):
            if current is not None:
                rows.append(current)
            current = {"id": line.split(":", 1)[1].strip()}
            continue
        if current is not None and line.startswith("    ") and ":" in line:
            key, value = line.strip().split(":", 1)
            current[key.strip()] = _coerce(value)
            continue
        if line.startswith("schema_version:"):
            meta["schema_version"] = int(line.split(":", 1)[1].strip())
        elif line.startswith("plate:"):
            meta["plate"] = line.split(":", 1)[1].strip()
        elif line.startswith("done_check:"):
            meta["done_check"] = line.split(":", 1)[1].strip()
    if current is not None:
        rows.append(current)
    if len(rows) != 8:
        raise RuntimeError(f"plate must have 8 rows, got {len(rows)}")
    holdouts = [row["id"] for row in rows if row.get("holdout") is True]
    if holdouts != ["click_go", "type_hive"]:
        raise RuntimeError(f"hold-outs drifted: {holdouts}")
    return meta


def _mods():
    mouth = _load("agent_stack_mouth_computer_plate", TURN_SRC)
    pipe = mouth.PIPELINE
    return pipe, pipe.SENSES, pipe.SEE, pipe.FRAME, mouth


def _snap(frame, seed: str, title: str, url: str) -> dict:
    return frame.stamp_dry(seed=seed, safari={"title": title, "url": url}, app="Safari")


def _queue(rows: list[dict]):
    n = {"i": 0}

    def see_fn(**kw):
        _ = kw
        row = rows[min(n["i"], len(rows) - 1)]
        n["i"] += 1
        return row

    return see_fn


def _arm(pipe, senses, hive: Path) -> int:
    gen = pipe.begin_turn(hive)
    out = senses.set_watch_arm(True, hive=hive, gen=gen, evens=True)
    if not out.get("armed"):
        raise AssertionError(f"dry Evens arm failed: {out}")
    if hasattr(senses, "set_watch_allow"):
        senses.set_watch_allow("*", always=True, hive=hive, gen=gen)
    return gen


def _watch_armed(hive: Path) -> bool:
    path = hive / "bus" / "state.json"
    if not path.is_file():
        return False
    bus = json.loads(path.read_text(encoding="utf-8"))
    watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
    return bool(watch.get("armed"))


def _grade(row: dict, got: dict, *, hid: bool, mode: str) -> dict:
    spoken = str(got.get("spoken") or "")
    ok = True
    reasons: list[str] = []
    if bool(row.get("expect_ok")) != bool(got.get("ok")):
        ok = False
        reasons.append(f"ok {got.get('ok')} != {row.get('expect_ok')}")
    if bool(row.get("expect_hid")) != bool(hid or got.get("hid")):
        ok = False
        reasons.append(f"hid {hid or got.get('hid')} != {row.get('expect_hid')}")
    expect_op = str(row.get("expect_op") or "")
    if expect_op and str(got.get("op") or "") != expect_op:
        ok = False
        reasons.append(f"op {got.get('op')} != {expect_op}")
    needle = str(row.get("expect_spoken_contains") or "")
    if needle and needle.lower() not in spoken.lower():
        ok = False
        reasons.append(f"spoken missed {needle}")
    url_need = str(row.get("expect_url_contains") or "")
    url = str(got.get("url") or "")
    if url_need and url_need not in url:
        ok = False
        reasons.append(f"url {url} missed {url_need}")
    return {
        "id": row["id"],
        "ok": ok,
        "holdout": bool(row.get("holdout")),
        "mode": mode,
        "spoken": spoken[:240],
        "hid": bool(hid or got.get("hid")),
        "op": got.get("op"),
        "url": url,
        "reason": "; ".join(reasons),
    }


def _dry_tool(pipe, hive: Path, gen: int | None, row: dict, args: dict, snaps: list[dict], utterance: str | None = None):
    return pipe.run_tool(
        {"tool": "mac_act", "args": args, "speak": ""},
        utterance or str(row.get("utterance") or ""),
        hive=hive,
        retrieve_roots=None,
        see_fn=_queue(snaps),
        gen=gen,
    )


def run_dry_row(pipe, senses, see, frame, row: dict) -> dict:
    os.environ["AGENT_STACK_DRY_WATCH"] = "1"
    os.environ["AGENT_STACK_DRY_MAC"] = "1"
    os.environ["AGENT_STACK_DRY_TTS"] = "1"
    hid_ops: list[str] = []
    real = see.mac_act

    def wrap(op, *args, **kw):
        out = real(op, *args, **kw)
        if out.get("ok") and str(out.get("op") or op) != "stop":
            hid_ops.append(str(out.get("op") or op))
        return out

    see.mac_act = wrap
    tmp = tempfile.TemporaryDirectory(prefix=f"computer-plate-{row['id']}-")
    try:
        hive = Path(tmp.name)
        (hive / "bus").mkdir(parents=True)
        rid = row["id"]
        lab = _snap(frame, "lab", "Watch lab", LAB)
        if rid == "watch_off":
            gen = pipe.begin_turn(hive)
            got = _dry_tool(
                pipe,
                hive,
                gen,
                row,
                {"op": "click", "x": 0.2, "y": 0.2, "label": "next"},
                [lab, lab],
            )
            return _grade(row, got, hid=bool(hid_ops), mode="dry")
        gen = _arm(pipe, senses, hive)
        if rid == "click_next":
            after = _snap(frame, "next", "Watch lab · Next", f"{LAB}/next")
            got = _dry_tool(
                pipe,
                hive,
                gen,
                row,
                {"op": "click", "x": 0.2, "y": 0.2, "label": "next"},
                [lab, lab, after],
            )
            got = {**got, "url": f"{LAB}/next"}
            return _grade(row, got, hid=bool(hid_ops), mode="dry")
        if rid == "click_go":
            after = _snap(frame, "go", "Watch lab · Go", f"{LAB}/go")
            got = _dry_tool(
                pipe,
                hive,
                gen,
                row,
                {"op": "click", "x": 0.2, "y": 0.35, "label": "go"},
                [lab, lab, after],
            )
            got = {**got, "url": f"{LAB}/go"}
            return _grade(row, got, hid=bool(hid_ops), mode="dry")
        if rid == "type_ready":
            after = _snap(frame, "ready", "Watch lab · typed ready", f"{LAB}#typed-ready")
            got = _dry_tool(
                pipe,
                hive,
                gen,
                row,
                {"op": "type", "text": "ready", "label": "field"},
                [lab, lab, after],
            )
            got = {**got, "url": f"{LAB}#typed-ready"}
            return _grade(row, got, hid=bool(hid_ops), mode="dry")
        if rid == "type_hive":
            after = _snap(frame, "hive", "Watch lab · typed hive", f"{LAB}#typed-hive")
            got = _dry_tool(
                pipe,
                hive,
                gen,
                row,
                {"op": "type", "text": "hive", "label": "field"},
                [lab, lab, after],
            )
            got = {**got, "url": f"{LAB}#typed-hive"}
            return _grade(row, got, hid=bool(hid_ops), mode="dry")
        if rid == "scroll_down":
            after = _snap(frame, "scroll", "Watch lab · scrolled", f"{LAB}#scrolled")
            got = _dry_tool(
                pipe,
                hive,
                gen,
                row,
                {"op": "scroll", "direction": "down", "label": "page"},
                [lab, lab, after],
            )
            got = {**got, "url": f"{LAB}#scrolled"}
            return _grade(row, got, hid=bool(hid_ops), mode="dry")
        if rid == "refuse_send":
            got = _dry_tool(
                pipe,
                hive,
                gen,
                row,
                {"op": "click", "x": 0.2, "y": 0.7, "label": "send"},
                [lab, lab],
            )
            return _grade(row, got, hid=bool(hid_ops), mode="dry")
        if rid == "stop_mid":
            released = threading.Event()
            resume = threading.Event()

            def hook():
                released.set()
                if not resume.wait(2):
                    raise AssertionError("stop never released HID")

            see.BEFORE_HID = hook
            box: dict = {}

            def worker():
                box.update(
                    _dry_tool(
                        pipe,
                        hive,
                        gen,
                        row,
                        {"op": "click", "x": 0.5, "y": 0.5, "label": "next"},
                        [lab, lab, lab],
                    )
                )

            thread = threading.Thread(target=worker)
            thread.start()
            if not released.wait(2):
                resume.set()
                thread.join(1)
                return _grade(
                    row,
                    {"ok": False, "op": "fail", "spoken": "HID hook never ran"},
                    hid=bool(hid_ops),
                    mode="dry",
                )
            pipe.cancel_turn(hive)
            resume.set()
            thread.join(3)
            return _grade(row, box, hid=bool(hid_ops), mode="dry")
        return _grade(row, {"ok": False, "spoken": "UNKNOWN row", "op": "fail"}, hid=False, mode="dry")
    finally:
        see.mac_act = real
        see.BEFORE_HID = None
        os.environ.pop("AGENT_STACK_DRY_WATCH", None)
        os.environ.pop("AGENT_STACK_DRY_MAC", None)
        os.environ.pop("AGENT_STACK_DRY_TTS", None)
        tmp.cleanup()


def _safari_url(see) -> str:
    front = see.safari_front() if see is not None else {}
    return str((front or {}).get("url") or "")


def run_live_row(pipe, see, online, row: dict, hive: Path) -> dict:
    rid = row["id"]
    if rid not in HID_ROWS:
        raise RuntimeError(f"{rid} is a gate row")
    if not _watch_armed(hive):
        return _grade(
            row,
            {
                "ok": False,
                "op": "deny",
                "spoken": "needs-input: Evens must arm Watch",
                "hid": False,
            },
            hid=False,
            mode="live",
        )
    target = LAB
    if rid == "click_next":
        target = LAB
    opened = see.safari_open(target)
    if not opened.get("ok"):
        return _grade(
            row,
            {
                "ok": False,
                "op": "fail",
                "spoken": str(opened.get("spoken") or "Safari open is dark"),
                "hid": False,
            },
            hid=False,
            mode="live",
        )
    time.sleep(0.8)
    gen = int(pipe.peek_gen(hive) or 0) or None
    extra = list(online.OPENROUTER_MAC_ACT) if online is not None else None
    images = pipe._vision_urls(hive) if hasattr(pipe, "_vision_urls") else []
    talked = pipe.online_talk(
        str(row.get("utterance") or ""),
        f"Watch lab. One mac_act or stop. Hard steps refuse.",
        images=images,
        extra_tools=extra,
    )
    pick = pipe.extract_pick(talked) if talked else None
    if pick is None or str(pick.get("tool") or "") != "mac_act":
        spoken = str((talked or {}).get("spoken") or "UNKNOWN. No mac_act pick.")
        return _grade(
            row,
            {"ok": False, "op": "fail", "spoken": spoken, "hid": False, "url": _safari_url(see)},
            hid=False,
            mode="live",
        )
    hid_ops: list[str] = []
    real = see.mac_act

    def wrap(op, *args, **kw):
        out = real(op, *args, **kw)
        if out.get("ok") and not out.get("dry"):
            hid_ops.append(str(out.get("op") or op))
        return out

    see.mac_act = wrap
    try:
        got = pipe.run_tool(
            pick,
            str(row.get("utterance") or ""),
            hive=hive,
            retrieve_roots=None,
            gen=gen,
        )
    finally:
        see.mac_act = real
    time.sleep(0.4)
    url = _safari_url(see)
    got = {**got, "url": url}
    return _grade(row, got, hid=bool(hid_ops or got.get("hid")), mode="live")


def run_plate(*, live: bool = False, hive: Path | None = None) -> dict:
    plate = load_plate()
    pipe, senses, see, frame, _mouth = _mods()
    online = getattr(pipe, "ONLINE", None)
    if live and online is not None and hasattr(online, "load_existing_env"):
        online.load_existing_env()
    results: list[dict] = []
    dest_hive = hive or LIVE_HIVE
    for row in plate["rows"]:
        if live and row["id"] in HID_ROWS:
            results.append(run_live_row(pipe, see, online, row, dest_hive))
        else:
            results.append(run_dry_row(pipe, senses, see, frame, row))
    n_ok = sum(1 for row in results if row.get("ok"))
    hid_live = [row for row in results if row["id"] in HID_ROWS]
    hid_attempted = any(row.get("mode") == "live" and row.get("hid") for row in hid_live)
    waiting = any("needs-input" in str(row.get("spoken") or "") for row in hid_live)
    live_ok = bool(live) and hid_attempted and not waiting
    out = {
        "ok": n_ok == 8 and len(results) == 8,
        "plate": plate["plate"],
        "live": bool(live_ok),
        "n_runs": len(results),
        "n_ok": n_ok,
        "rows": results,
        "artifact": str(LAST),
        "done_check": plate.get("done_check") or "n_ok == n_runs == 8",
    }
    if out["ok"] and out["live"]:
        out["grade"] = "PASS"
    elif live and hid_attempted and not waiting:
        out["grade"] = "FAIL"
    else:
        out["grade"] = "UNPROVEN"
    LAST.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description="Jarvis computer-use 8/8 plate")
    ap.add_argument("--live", action="store_true", help="HID rows on the live hive after Evens arms Watch")
    args = ap.parse_args()
    out = run_plate(live=bool(args.live))
    print(json.dumps({k: out[k] for k in ("ok", "live", "n_runs", "n_ok", "artifact")}, indent=2))
    if args.live and not out.get("ok"):
        return 2
    return 0 if out.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
