#!/usr/bin/env python3
"""Felt-loop + Obsidian gold probe. Writes a dated row. Does not send."""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
REPORT = ROOT / "docs/hive/outer-heaven/CONTENT/os/reports/felt-loop.md"
GOLD = HERE / "gold_vault.json"
HOST = "127.0.0.1"
PORT = 4018
HONEST_EMPTY = "I don't have that on disk."
TALK_DARK = "The talk wire is dark this turn."

FELT_ASKS = (
    {"id": "sky", "utterance": "Why is the sky blue?", "kind": "general"},
    {"id": "why", "utterance": "Why?", "kind": "follow"},
    {"id": "calendar", "utterance": "can you see my calendar", "kind": "calendar"},
    {"id": "eyes", "utterance": "What do you currently see", "kind": "eyes"},
    {"id": "files", "utterance": "find my OPERATOR_MEMORY.md on disk", "kind": "files"},
    {"id": "next", "utterance": "What should we work on next?", "kind": "mystuff"},
    {"id": "ping", "utterance": "ping", "kind": "talk"},
    {"id": "stop", "utterance": "stop", "kind": "stop"},
)

EVIDENCE_BASELINE = {
    "label": "2026-09-13 evidence (pre-slice)",
    "felt": [
        {"id": "next", "outcome": "TIMEOUT", "brain_ms": 50530, "tts_ms": None, "note": "What should we work on next hung 50s"},
        {"id": "calendar", "outcome": "STUB", "brain_ms": None, "tts_ms": None, "note": "Calendar is live. 17 calendars. Name a day."},
        {"id": "eyes", "outcome": "RECAP", "brain_ms": None, "tts_ms": None, "note": "recap of chat topics, not the screen"},
        {"id": "tts", "outcome": "SLOW", "brain_ms": None, "tts_ms": 25802, "note": "kokoro TimeoutError 25.8s"},
        {"id": "sse", "outcome": "HANG", "brain_ms": None, "tts_ms": None, "note": "Bite3 SSE 0 bytes for 25+ min"},
    ],
    "gold": {"pass": 0, "fail": 0, "stale": 0, "skip": 8, "note": "not run — baseline from bus log"},
}


def _load_retrieve():
    path = HERE.parent / "memory" / "retrieve.py"
    spec = importlib.util.spec_from_file_location("probe_retrieve", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def resolve_roots() -> list[Path]:
    return list(_load_retrieve().resolve_roots())


def load_gold() -> dict:
    return json.loads(GOLD.read_text(encoding="utf-8"))


def find_locator(locator: str, roots: list[Path]) -> Path | None:
    rel = (locator or "").strip()
    if not rel:
        return None
    for root in roots:
        path = Path(root) / rel
        if path.is_file():
            return path
    return None


def validate_gold_row(row: dict, roots: list[Path]) -> str:
    """ok | GOLD_STALE | skip."""
    if row.get("expect") != "gold":
        return "skip"
    path = find_locator(str(row.get("locator") or ""), roots)
    if path is None:
        return "GOLD_STALE"
    needle = str(row.get("must_contain") or "")
    try:
        body = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return "GOLD_STALE"
    if needle and needle not in body:
        return "GOLD_STALE"
    return "ok"


def _cite_paths(cites) -> str:
    bits: list[str] = []
    if not isinstance(cites, list):
        return ""
    for row in cites:
        if isinstance(row, dict):
            bits.append(str(row.get("path") or ""))
        else:
            bits.append(str(row))
    return " ".join(bits).replace("\\", "/")


def grade_gold(row: dict, out: dict, roots: list[Path]) -> str:
    check = validate_gold_row(row, roots)
    if check != "ok":
        return check
    spoken = str((out or {}).get("spoken") or "")
    cites = _cite_paths((out or {}).get("cites"))
    locator = str(row.get("locator") or "")
    needle = str(row.get("must_contain") or "")
    if TALK_DARK in spoken or str((out or {}).get("outcome") or "") == "WIRE_FAILURE":
        return "FAIL"
    def _fold(text: str) -> str:
        return re.sub(r"[^a-z0-9]+", " ", (text or "").lower()).strip()

    if needle and _fold(needle) not in _fold(spoken):
        return "FAIL"
    name = Path(locator).name.lower()
    if name and name not in cites.lower() and locator.lower() not in cites.lower():
        return "FAIL"
    return "PASS"


def grade_honest(out: dict) -> str:
    spoken = str((out or {}).get("spoken") or "")
    body = spoken.replace("Sir.", "").replace("sir.", "").strip()
    if HONEST_EMPTY.lower() in body.lower() and "quantum-turtle" not in body.lower() and "purple-zeppelin" not in body.lower():
        if len(body) < 80:
            return "PASS"
    return "FAIL"


def grade_general(out: dict) -> str:
    spoken = str((out or {}).get("spoken") or "")
    outcome = str((out or {}).get("outcome") or (out or {}).get("status") or "")
    cites = _cite_paths((out or {}).get("cites"))
    if outcome == "WIRE_FAILURE" or TALK_DARK in spoken:
        return "FAIL"
    if HONEST_EMPTY.lower() in spoken.lower():
        return "FAIL"
    if cites.strip():
        return "FAIL"
    if outcome and outcome != "MODEL_TALK":
        return "FAIL"
    if len(spoken.strip()) < 8:
        return "FAIL"
    return "PASS"


def _post_json(path: str, payload: dict, timeout: float) -> tuple[dict, int]:
    req = urllib.request.Request(
        f"http://{HOST}:{PORT}{path}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    t0 = time.monotonic()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            raw = res.read()
            ms = int((time.monotonic() - t0) * 1000)
            try:
                data = json.loads(raw.decode("utf-8"))
            except json.JSONDecodeError:
                data = {"ok": False, "spoken": raw[:200].decode("utf-8", "replace"), "outcome": "BAD_JSON"}
            if isinstance(data, dict):
                data.setdefault("_ms", ms)
            return data if isinstance(data, dict) else {"ok": False, "_ms": ms}, ms
    except Exception as exc:  # noqa: BLE001 — probe records the miss
        ms = int((time.monotonic() - t0) * 1000)
        return {"ok": False, "outcome": type(exc).__name__, "spoken": str(exc)[:200], "_ms": ms}, ms


def post_turn(utterance: str, timeout: float = 28.0) -> tuple[dict, int]:
    return _post_json("/api/turn", {"utterance": utterance, "approved": False, "stream": False}, timeout)


def post_tts(text: str, gen: int | None, timeout: float = 16.0) -> dict:
    """Voice pass = real audio bytes, not elapsed time. Failures keep detail."""
    if not text:
        return {"ok": False, "skipped": True}
    payload: dict = {"text": text}
    if gen is not None:
        payload["gen"] = gen
    req = urllib.request.Request(
        f"http://{HOST}:{PORT}/api/tts",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    t0 = time.monotonic()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            body = res.read()
            ms = int((time.monotonic() - t0) * 1000)
            ctype = str(res.headers.get("Content-Type") or "")
            ok = (
                int(res.status) == 200
                and len(body) > 44
                and (body[:4] == b"RIFF" or ctype.startswith("audio/"))
            )
            return {
                "ok": ok,
                "ms": ms,
                "status": int(res.status),
                "bytes": len(body),
                "ctype": ctype,
            }
    except Exception as exc:  # noqa: BLE001 — the probe records the miss
        ms = int((time.monotonic() - t0) * 1000)
        return {
            "ok": False,
            "ms": ms,
            "status": None,
            "bytes": 0,
            "error": f"{type(exc).__name__}: {exc}"[:120],
        }


def bus_gen() -> int | None:
    try:
        with urllib.request.urlopen(f"http://{HOST}:{PORT}/api/bus", timeout=3) as res:
            data = json.loads(res.read().decode("utf-8"))
    except Exception:
        return None
    gen = data.get("turn_gen")
    return int(gen) if isinstance(gen, int) else None


def run_felt() -> list[dict]:
    rows: list[dict] = []
    for ask in FELT_ASKS:
        out, brain_ms = post_turn(ask["utterance"])
        spoken = str(out.get("spoken") or "")
        tts: dict | None = None
        if ask["kind"] != "stop" and spoken and TALK_DARK not in spoken:
            tts = post_tts(spoken, bus_gen())
        outcome = out.get("outcome") or out.get("status") or out.get("brain")
        if ask["kind"] == "eyes" and "eyes are off" in spoken.lower():
            # The honest off-line. Vision-with-frame stays UNPROVEN here.
            outcome = "EYES_OFF_LINE"
        rows.append(
            {
                "id": ask["id"],
                "utterance": ask["utterance"],
                "outcome": outcome,
                "brain": out.get("brain"),
                "brain_ms": brain_ms,
                "tts_ok": None if tts is None else bool(tts.get("ok")),
                "tts_ms": None if tts is None else tts.get("ms"),
                "tts_bytes": None if tts is None else tts.get("bytes"),
                "tts_error": None if tts is None else (tts.get("error") or (None if tts.get("ok") else f"status={tts.get('status')}")),
                "spoken": spoken[:180],
            }
        )
    return rows


def run_gold(roots: list[Path]) -> list[dict]:
    spec = load_gold()
    rows: list[dict] = []
    for item in spec.get("items") or []:
        expect = str(item.get("expect") or "")
        if expect == "gold":
            gate = validate_gold_row(item, roots)
            if gate != "ok":
                rows.append({"id": item.get("id"), "grade": gate, "expect": expect})
                continue
        out, brain_ms = post_turn(str(item.get("prompt") or ""))
        if expect == "gold":
            grade = grade_gold(item, out, roots)
        elif expect == "honest_empty":
            grade = grade_honest(out)
        else:
            grade = grade_general(out)
        rows.append(
            {
                "id": item.get("id"),
                "grade": grade,
                "expect": expect,
                "brain_ms": brain_ms,
                "outcome": out.get("outcome"),
                "spoken": str(out.get("spoken") or "")[:160],
                "cites": _cite_paths(out.get("cites")),
            }
        )
    return rows


def gold_summary(rows: list[dict]) -> dict:
    """Three suites, three numbers. Never one mixed 12/12."""
    counts = {"PASS": 0, "FAIL": 0, "GOLD_STALE": 0, "skip": 0}
    for row in rows:
        key = str(row.get("grade") or "skip")
        counts[key] = counts.get(key, 0) + 1

    def bucket(expect: str) -> dict:
        sub = [r for r in rows if str(r.get("expect") or "") == expect]
        return {
            "pass": sum(1 for r in sub if r.get("grade") == "PASS"),
            "n": len(sub),
        }

    return {
        "pass": counts.get("PASS", 0),
        "fail": counts.get("FAIL", 0),
        "stale": counts.get("GOLD_STALE", 0),
        "skip": counts.get("skip", 0),
        "n": len(rows),
        "gold": bucket("gold"),
        "honest": bucket("honest_empty"),
        "general": bucket("general"),
    }


def format_row(label: str, felt: list[dict], gold: dict, roots: list[Path]) -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    root_bits = []
    for path in roots:
        name = str(path)
        if "My_Billion_Dollar_Vault" in name:
            root_bits.append("live_vault")
        elif "docs/hive/outer-heaven" in name:
            root_bits.append("repo_oh")
        else:
            root_bits.append(Path(name).name)
    felt_bits = []
    for row in felt:
        bit = f"{row.get('id')}={row.get('outcome') or row.get('grade')}"
        if row.get("brain_ms") is not None:
            bit += f" {row['brain_ms']}ms"
        if row.get("tts_ok") is True:
            bit += f" tts={row.get('tts_ms')}ms/{row.get('tts_bytes')}B"
        elif row.get("tts_ok") is False:
            bit += f" tts=FAIL({row.get('tts_error') or 'no audio'})"
        elif row.get("tts_ms") is not None:
            bit += f" tts={row['tts_ms']}ms"
        felt_bits.append(bit)
    buckets = ""
    if isinstance(gold.get("gold"), dict):
        g, h, c = gold["gold"], gold.get("honest") or {}, gold.get("general") or {}
        buckets = (
            f"gold {g.get('pass', 0)}/{g.get('n', 0)} · "
            f"neg-controls {h.get('pass', 0)}/{h.get('n', 0)} honest · "
            f"general {c.get('pass', 0)}/{c.get('n', 0)} clean · "
        )
    else:
        buckets = f"gold {gold.get('pass', 0)}/{max(gold.get('n', 0) - gold.get('skip', 0), 0)} · "
    gold_line = (
        f"{buckets}"
        f"fail {gold.get('fail', 0)} · stale {gold.get('stale', 0)} · "
        f"roots: {'+'.join(root_bits) or 'none'}"
    )
    return (
        f"## {label} — {stamp}\n\n"
        f"- Felt: {'; '.join(felt_bits) or '(none)'}\n"
        f"- Vault: {gold_line}\n"
        f"- {gold.get('note') or ''}\n"
    )


def append_report(block: str) -> None:
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    prev = REPORT.read_text(encoding="utf-8") if REPORT.is_file() else "# Felt loop\n\nNumber, not vibe.\n\n"
    if block.strip() not in prev:
        REPORT.write_text(prev.rstrip() + "\n\n" + block.strip() + "\n", encoding="utf-8")


def write_evidence_baseline() -> str:
    roots = []
    try:
        roots = resolve_roots()
    except Exception:
        roots = []
    block = format_row(
        EVIDENCE_BASELINE["label"],
        EVIDENCE_BASELINE["felt"],
        EVIDENCE_BASELINE["gold"],
        roots,
    )
    append_report(block)
    return block


def main() -> int:
    ap = argparse.ArgumentParser(description="Felt-loop + vault gold probe")
    ap.add_argument("--evidence", action="store_true", help="write the pre-slice evidence row only")
    ap.add_argument("--felt", action="store_true")
    ap.add_argument("--gold", action="store_true")
    ap.add_argument("--label", default="probe")
    args = ap.parse_args()
    if args.evidence or (not args.felt and not args.gold):
        print(write_evidence_baseline())
        if not args.felt and not args.gold:
            roots = resolve_roots()
            print("roots:")
            for path in roots:
                print(" ", path)
            spec = load_gold()
            stale = 0
            for item in spec.get("items") or []:
                if item.get("expect") != "gold":
                    continue
                gate = validate_gold_row(item, roots)
                print(f"  locator {item.get('id')}: {gate} {item.get('locator')}")
                if gate == "GOLD_STALE":
                    stale += 1
            if stale:
                return 2
            return 0
    roots = resolve_roots()
    print("roots:")
    for path in roots:
        print(" ", path)
    felt: list[dict] = run_felt() if args.felt else []
    gold_rows: list[dict] = run_gold(roots) if args.gold else []
    gold = gold_summary(gold_rows) if gold_rows else {"pass": 0, "fail": 0, "stale": 0, "skip": 0, "n": 0}
    block = format_row(args.label, felt, gold, roots)
    append_report(block)
    print(block)
    print(json.dumps({"felt": felt, "gold": gold_rows}, indent=2)[:4000])
    return 1 if gold.get("fail") else 0


if __name__ == "__main__":
    raise SystemExit(main())
