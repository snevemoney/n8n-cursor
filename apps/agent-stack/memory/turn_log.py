"""Per-turn JSONL log. One line per finished turn. Ids, counts and names only; no prompt or reply text.

Path: JARVIS_TURN_LOG (a file path; "0"/"off" disables). Default <repo>/logs/jarvis-turns.jsonl,
the same gitignored logs/ dir the Face keeper writes to.
"""
from __future__ import annotations

import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DEFAULT_PATH = ROOT / "logs" / "jarvis-turns.jsonl"
_LOCK = threading.Lock()
_BOOT_ID = os.urandom(6).hex()  # one per Face process: gens restart at each boot, so (boot_id, gen) names a turn
_REV: list = []


def release_rev() -> str | None:
    """The git short rev the running code came from (read once, no subprocess): which build produced this row."""
    if not _REV:
        rev = None
        try:
            git = ROOT / ".git"
            head = (git / "HEAD").read_text(encoding="utf-8").strip()
            if head.startswith("ref: "):
                ref = head[5:]
                p = git / ref
                if p.is_file():
                    rev = p.read_text(encoding="utf-8").strip()
                else:
                    for line in (git / "packed-refs").read_text(encoding="utf-8").splitlines():
                        if line.endswith(" " + ref):
                            rev = line.split()[0]
            else:
                rev = head
        except OSError:
            rev = None
        _REV.append(rev[:12] if rev else None)
    return _REV[0]


def log_path() -> Path | None:
    raw = (os.environ.get("JARVIS_TURN_LOG") or "").strip()
    if raw.lower() in {"0", "off", "false", "no"}:
        return None
    if raw:
        return Path(raw).expanduser()
    if _under_tests():  # tests never write Evens's real log; they get a per-process temp file
        import tempfile
        return Path(tempfile.gettempdir()) / f"jarvis-turns-test-{os.getpid()}.jsonl"
    return DEFAULT_PATH


def _under_tests() -> bool:
    import sys
    return "_pytest" in sys.modules or "unittest" in sys.modules


_CHEAP_RE = __import__("re").compile(r"mini|flash|haiku|small|nano|lite|8b|7b|3b", __import__("re").I)


def cost_bucket(model: str | None) -> str:
    """Rank 17 shadow cost bucket: free (no model), cheap (small model), frontier (big model)."""
    if not model:
        return "free"
    return "cheap" if _CHEAP_RE.search(str(model)) else "frontier"


def build_row(*, started: float, ended: float, events: list[dict], talk: dict | None, inject: dict | None,
              first_ms: int | None = None) -> dict:
    tools: list[str] = []
    for ev in events:
        verb = str(ev.get("verb") or "")
        if verb and verb not in tools and verb != "think":
            tools.append(verb)
    final = events[-1] if events else {}
    meta = final.get("hand_loop_meta") if isinstance(final.get("hand_loop_meta"), dict) else {}
    talk = talk if isinstance(talk, dict) and float(talk.get("t") or 0) >= started else {}
    inject = inject if isinstance(inject, dict) and float(inject.get("t") or 0) >= started else {}
    return {
        "ts": datetime.fromtimestamp(ended, timezone.utc).isoformat().replace("+00:00", "Z"),
        "model": talk.get("model") or None,
        "primary_model": talk.get("primary") or None,
        "fallback": bool(talk.get("fallback")),
        "latency_ms": int((ended - started) * 1000),
        "talk_latency_ms": talk.get("latency_ms"),
        # Loop on_it: time to the first spoken chunk, and the tool's own time (numbers only, never text).
        "first_chunk_ms": int(first_ms) if first_ms is not None else None,
        "tool_ms": next((int(ev["tool_ms"]) for ev in reversed(events) if isinstance(ev.get("tool_ms"), (int, float))), None),
        "est_tokens_in": talk.get("est_tokens_in"),
        "est_tokens_out": talk.get("est_tokens_out"),
        # OpenRouter's own usage report for this turn (tokens + billed USD); None = not metered, never estimated.
        "usage_tokens_in": (talk.get("usage") or {}).get("tokens_in"),
        "usage_tokens_out": (talk.get("usage") or {}).get("tokens_out"),
        "usage_cost_usd": (talk.get("usage") or {}).get("cost_usd"),
        "usage_gen_id": (talk.get("usage") or {}).get("gen_id") or None,
        "injected_context": list(talk.get("injected") or inject.get("files") or []),
        # Privacy audit 2026-10-16: names only. Vault note headings are note content, so they are not logged.
        "retrieved": [
            {"file": str(r.get("file") or "")}
            for r in (talk.get("retrieved") or []) if isinstance(r, dict)
        ],
        "tools": tools,
        # Mac review 2026-10-16: one row per hand the turn ran (name, ok, fixed failure code), not only the last verb.
        "hands": [{"tool": str(st.get("tool") or ""), "ok": bool(st.get("ok")), "error_class": st.get("error_class")}
                  for st in (meta.get("steps") or []) if isinstance(st, dict)][:12] or None,
        "stop_reason": meta.get("stop_reason"),
        "error_class": final.get("error_class"),
        "task_verified": final.get("task_verified") if isinstance(final.get("task_verified"), bool) else None,
        "boot_id": _BOOT_ID,
        "rev": release_rev(),
        "verb": final.get("verb"),
        "ok": bool(final.get("ok", True)),
        "outcome": final.get("outcome"),
        "gen": final.get("gen"),
        "finish_reason": talk.get("finish_reason") or None,
        # Soft-deadline resume: counts/ages only (stored, used, said_chars, parts, age_s), never text.
        "cost_bucket": cost_bucket(talk.get("model")),
        # Rank 17 roadblock row: verb + outcome only when the turn failed or was UNKNOWN.
        "roadblock": ({"verb": final.get("verb"), "outcome": final.get("outcome")}
                      if (not bool(final.get("ok", True)) or str(final.get("outcome") or "").upper() == "UNKNOWN") else None),
        "resume": {k: v for k, v in (talk.get("resume") or {}).items() if k in {"stored", "used", "said_chars", "parts", "age_s"}} or None,
    }


def append(row: dict, path: Path | None = None) -> Path | None:
    dest = path or log_path()
    if dest is None:
        return None
    try:
        dest.parent.mkdir(parents=True, exist_ok=True)
        try:
            if dest.stat().st_size > 20 * 1024 * 1024:  # one previous file kept; no unbounded growth (audit 2026-10-16)
                os.replace(dest, dest.with_name(dest.name + ".1"))
        except OSError:
            pass
        with _LOCK, dest.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
    except OSError:
        return None
    return dest
