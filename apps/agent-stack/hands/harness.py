"""Harness layers around the operator loop, the parts Claude Code / Codex / OpenClaude have and the loop lacked
(Evens 2026-10-16: "focus on the whole harness ... if you fix the harness, everything else will work").

- context_view: what the model sees each step. Only the newest screenshots ride along (live 10-16: one Spotify job
  resent all 13 screenshots, 4.7 MB, on every step), and old long tool outputs are clipped. History on disk is untouched.
- cache marks: the fixed prefix (tools + system) is marked cacheable, so each step pays for it once (signal Z111).
- meter: billed cost and tokens per job from OpenRouter usage, with a per-job ceiling (Z14, Z35).
- procedures: a finished job leaves a short "how it was done" note; a new job with a similar goal starts from it,
  so a lesson learned on screen (the web page wanted a login, the Mac app worked) is not learned again (X15, Z11).
"""
from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path

KEEP_IMAGES = 3
KEEP_RECENT = 12           # the newest messages are never clipped
OLD_TOOL_CHARS = 1500
JOB_COST_CAP = float(os.environ.get("JARVIS_JOB_COST_CAP") or 1.5)
PROC_FILE = "operator-procedures.jsonl"
PROC_KEEP = 400
WORD = re.compile(r"[a-z0-9']{3,}")
STOP = {"the", "and", "for", "with", "that", "this", "please", "can", "you", "open", "my", "then", "now", "jarvis"}


def context_view(messages: list, keep_images: int = KEEP_IMAGES) -> list:
    """A lighter copy for the model: older screenshots become a note, old long tool results are clipped, the
    system prompt is marked cacheable."""
    image_at = [i for i, m in enumerate(messages) if isinstance(m.get("content"), list)
                and any(p.get("type") == "image_url" for p in m["content"] if isinstance(p, dict))]
    drop = set(image_at[:-keep_images]) if keep_images else set(image_at)
    recent = len(messages) - KEEP_RECENT
    out = []
    for i, m in enumerate(messages):
        if i in drop:
            out.append({"role": m["role"], "content": "[an earlier screenshot, no longer shown]"})
        elif m.get("role") == "tool" and i < recent and len(str(m.get("content") or "")) > OLD_TOOL_CHARS:
            out.append({**m, "content": str(m["content"])[:OLD_TOOL_CHARS] + " [earlier output clipped]"})
        elif m.get("role") == "system" and i == 0 and isinstance(m.get("content"), str):
            out.append({"role": "system", "content": [{"type": "text", "text": m["content"],
                                                        "cache_control": {"type": "ephemeral"}}]})
        else:
            out.append(m)
    return out


def add_usage(state: dict, usage: dict | None) -> dict:
    """New state with this call's billed cost and tokens added."""
    if not isinstance(usage, dict):
        return state
    return {**state,
            "cost_usd": round(float(state.get("cost_usd") or 0) + float(usage.get("cost") or 0), 5),
            "tokens_in": int(state.get("tokens_in") or 0) + int(usage.get("prompt_tokens") or 0),
            "tokens_out": int(state.get("tokens_out") or 0) + int(usage.get("completion_tokens") or 0)}


def over_cap(state: dict, cap: float = JOB_COST_CAP) -> bool:
    return float(state.get("cost_usd") or 0) >= cap


def _words(text: str) -> set:
    return {w for w in WORD.findall(str(text).lower()) if w not in STOP}


def _path(trace_rows: list) -> list:
    """The actions that changed something, in order, short: the recipe, not the log."""
    steps = []
    for r in trace_rows:
        if r.get("event") != "tool" or r.get("tool") in ("say", "done", "ask_owner"):
            continue
        a = r.get("args") or {}
        if r.get("tool") == "computer" and a.get("action") in ("screenshot", "wait", "cursor_position"):
            continue
        key = a.get("command") or a.get("target") or a.get("action") or a.get("tool") or a.get("path") or a.get("query") or ""
        bad = str(r.get("result") or "").startswith(("error", "needs Evens", "refused", "exit 1", "browser error"))
        steps.append(f"{r['tool']} {str(key)[:80]}" + (" (failed)" if bad else ""))
    return steps[-14:]


def remember(hive: Path, goal: str, summary: str, trace_rows: list, model: str = "") -> None:
    """Append one procedure note for a finished job (bounded file)."""
    f = Path(hive) / PROC_FILE
    row = {"at": time.time(), "goal": goal[:300], "summary": summary[:600], "path": _path(trace_rows), "model": model}
    rows = [l for l in (f.read_text().splitlines() if f.exists() else []) if l.strip()][-(PROC_KEEP - 1):]
    f.write_text("\n".join(rows + [json.dumps(row)]) + "\n")


def recall(hive: Path, goal: str, k: int = 2, min_overlap: int = 2) -> list:
    """The k most similar past procedures (shared words in the goal), newest wins ties."""
    f = Path(hive) / PROC_FILE
    if not f.exists():
        return []
    want = _words(goal)
    scored = []
    for i, line in enumerate(f.read_text().splitlines()):
        try:
            row = json.loads(line)
        except ValueError:
            continue
        n = len(want & _words(row.get("goal", "")))
        if n >= min_overlap or (n and n == len(want)):
            scored.append((n, i, row))
    return [r for _, _, r in sorted(scored, key=lambda t: (t[0], t[1]), reverse=True)[:k]]


def recall_text(hive: Path, goal: str) -> str:
    rows = recall(hive, goal)
    if not rows:
        return ""
    parts = [f"- Asked: {r['goal']}\n  Outcome: {r['summary']}\n  What worked: {'; '.join(r.get('path') or []) or 'n/a'}"
             for r in rows]
    return ("\n\nYou did similar jobs before (use what worked, skip what failed; still check the screen):\n"
            + "\n".join(parts))
