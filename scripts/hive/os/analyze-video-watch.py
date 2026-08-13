#!/usr/bin/env python3
"""Video watch output ingestion — merge frames + transcript into synchronized timeline (spec §38)."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
FIXTURE = Path(__file__).resolve().parent / "fixtures" / "video-watch-sample.json"


def parse_ts(ts: str) -> float:
    """Parse MM:SS or HH:MM:SS to seconds."""
    parts = ts.strip().split(":")
    if len(parts) == 2:
        return int(parts[0]) * 60 + float(parts[1])
    if len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    return float(ts)


def format_ts(seconds: float) -> str:
    m, s = divmod(int(seconds), 60)
    return f"{m:02d}:{s:02d}"


def validate_watch_input(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if "transcript" not in data and "frames" not in data:
        errors.append("watch output must include transcript and/or frames")
    return errors


def build_beats(watch: dict[str, Any]) -> list[dict[str, Any]]:
    """Merge frames and transcript segments into chronological beats."""
    frames = watch.get("frames") or []
    segments = watch.get("transcript") or []
    sampling = watch.get("sampling_interval_sec", 5)

    events: list[tuple[float, str, dict[str, Any]]] = []
    for fr in frames:
        t = parse_ts(str(fr.get("timestamp", "00:00")))
        events.append((t, "frame", fr))
    for seg in segments:
        t = parse_ts(str(seg.get("start", seg.get("timestamp", "00:00"))))
        events.append((t, "transcript", seg))

    events.sort(key=lambda x: x[0])
    beats: list[dict[str, Any]] = []
    prev_on_screen: list[str] = []
    window_start = 0.0
    window_end = sampling
    on_screen: list[str] = []
    spoken_parts: list[str] = []
    changed: list[str] = []

    def flush(end_t: float) -> None:
        nonlocal window_start, on_screen, spoken_parts, changed, prev_on_screen
        if not on_screen and not spoken_parts:
            return
        ch = list(changed)
        if on_screen != prev_on_screen and on_screen:
            ch.append("visual change")
        beats.append(
            {
                "timestamp": {"start": format_ts(window_start), "end": format_ts(end_t)},
                "on_screen": list(on_screen),
                "spoken": " ".join(spoken_parts).strip(),
                "changed_since_last_beat": ch or ["segment boundary"],
            }
        )
        prev_on_screen = list(on_screen)
        spoken_parts = []
        changed = []

    for t, kind, payload in events:
        if kind == "frame":
            desc = payload.get("description") or payload.get("on_screen") or str(payload.get("caption", ""))
            if isinstance(desc, list):
                on_screen = desc
            elif desc:
                on_screen = [desc]
        else:
            text = payload.get("text") or payload.get("spoken") or ""
            if text:
                spoken_parts.append(text)
        if t >= window_end:
            flush(t)
            window_start = t
            window_end = t + sampling

    if on_screen or spoken_parts:
        flush(window_end)

    if not beats and segments:
        for seg in segments:
            start = str(seg.get("start", "00:00"))
            end = str(seg.get("end", start))
            beats.append(
                {
                    "timestamp": {"start": start, "end": end},
                    "on_screen": [],
                    "spoken": seg.get("text", ""),
                    "changed_since_last_beat": ["transcript-only beat"],
                }
            )
    return beats


def analyze_structure(beats: list[dict[str, Any]]) -> dict[str, Any]:
    if not beats:
        return {"open": "GAP: no beats", "hold_development": "", "turns": [], "close": ""}
    open_b = beats[0]
    close_b = beats[-1]
    return {
        "open": f"OBSERVED: First beat {open_b['timestamp']['start']}-{open_b['timestamp']['end']}: {open_b.get('spoken', '')[:120]}",
        "hold_development": f"OBSERVED: {len(beats)} beats total",
        "turns": [],
        "close": f"OBSERVED: Final beat {close_b['timestamp']['start']}-{close_b['timestamp']['end']}",
    }


def top_observations(beats: list[dict[str, Any]]) -> list[dict[str, Any]]:
    obs: list[dict[str, Any]] = []
    if beats:
        b0 = beats[0]
        obs.append(
            {
                "observation": f"Opening segment: {b0.get('spoken', b0.get('on_screen', [''])[0] if b0.get('on_screen') else '')[:100]}",
                "timestamps": [f"{b0['timestamp']['start']}-{b0['timestamp']['end']}"],
            }
        )
    if len(beats) > 2:
        mid = beats[len(beats) // 2]
        obs.append(
            {
                "observation": f"Mid-video shift: {mid.get('spoken', '')[:100]}",
                "timestamps": [f"{mid['timestamp']['start']}-{mid['timestamp']['end']}"],
            }
        )
    if len(beats) > 1:
        bl = beats[-1]
        obs.append(
            {
                "observation": f"Close: {bl.get('spoken', '')[:100]}",
                "timestamps": [f"{bl['timestamp']['start']}-{bl['timestamp']['end']}"],
            }
        )
    while len(obs) < 3:
        obs.append({"observation": "GAP: insufficient beats for third observation", "timestamps": ["00:00"]})
    return obs[:3]


def analyze(watch: dict[str, Any]) -> dict[str, Any]:
    beats = build_beats(watch)
    sampling = watch.get("sampling_interval_sec", 5)
    limitations = [
        f"Frames sampled every {sampling}s — rapid cuts may be undercounted",
        "Transcript timing may not perfectly align with visual timestamps",
    ]
    if not watch.get("frames"):
        limitations.append("No frame data — transcript-only analysis")
    return {
        "video_id": watch.get("video_id", "unknown"),
        "video_url": watch.get("video_url", ""),
        "sampling_limitations": limitations,
        "timeline": beats,
        "structure": analyze_structure(beats),
        "observed": [b.get("spoken", "")[:200] for b in beats[:5] if b.get("spoken")],
        "inferences": [],
        "gaps": [lim for lim in limitations if "GAP" in lim or "may" in lim.lower()],
        "top_observations": top_observations(beats),
    }


def self_test() -> int:
    FIXTURE.parent.mkdir(parents=True, exist_ok=True)
    sample = {
        "video_id": "test123",
        "video_url": "https://youtube.com/watch?v=test123",
        "sampling_interval_sec": 5,
        "frames": [
            {"timestamp": "00:00", "description": "Presenter full-screen with title text"},
            {"timestamp": "00:07", "description": "Cursor IDE settings page visible"},
        ],
        "transcript": [
            {"start": "00:00", "end": "00:07", "text": "I spent 30 days testing this workflow."},
            {"start": "00:07", "end": "00:15", "text": "Open Cursor settings and click Rules."},
        ],
    }
    FIXTURE.write_text(json.dumps(sample, indent=2) + "\n", encoding="utf-8")
    result = analyze(sample)
    if len(result["timeline"]) < 1:
        print("FAIL: expected beats")
        return 1
    if len(result["top_observations"]) != 3:
        print("FAIL: expected 3 top observations")
        return 1
    print("analyze-video-watch self-test: OK")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", type=Path, help="Watch output JSON")
    ap.add_argument("--output", type=Path, help="Write analysis JSON")
    ap.add_argument("--validate", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    if not args.input:
        ap.print_help()
        return 1

    watch = json.loads(args.input.read_text(encoding="utf-8"))
    errs = validate_watch_input(watch)
    if errs:
        for e in errs:
            print(f"FAIL: {e}")
        return 1

    result = analyze(watch)
    if args.validate:
        if len(result["top_observations"]) != 3:
            print("FAIL: top_observations must have exactly 3 entries")
            return 1
        print("OK")
        return 0

    out = json.dumps(result, indent=2) + "\n"
    if args.output:
        args.output.write_text(out, encoding="utf-8")
        print(f"Wrote {args.output}")
    else:
        print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
