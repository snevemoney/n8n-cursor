"""Private durable memory hand. Logs contain metadata only."""
from __future__ import annotations

import json
import os
import re
import tempfile
from pathlib import Path

# "note that ..." / "don't forget that ..." / "keep in mind that ..." are remember, not a model chat (route matrix 2026-10-16).
REMEMBER_SYN_RE = re.compile(r"^(\s*(?:(?:can|could|would)\s+you\s+)?(?:please\s+)?)(?:make\s+a\s+note\s+that|note\s+that|"
                             r"don'?t\s+forget(?:\s+that)?|do\s+not\s+forget(?:\s+that)?|keep\s+in\s+mind\s+that)\b", re.I)


# Owner canvas Z38 inbox capture: "capture this idea: X" / "add this to my inbox: X" / "jot down X" store X.
CAPTURE_RE = re.compile(r"^(\s*(?:(?:can|could|would)\s+you\s+)?(?:please\s+)?)(?:capture|save)\s+(?:this|the|an|my)\s+(?:idea|thought|note)\s*:?\s+"
                        r"|^(\s*(?:(?:can|could|would)\s+you\s+)?(?:please\s+)?)add\s+(?:this|that)\s+to\s+my\s+(?:jarvis\s+)?inbox\s*:?\s+"
                        r"|^(\s*(?:(?:can|could|would)\s+you\s+)?(?:please\s+)?)jot\s+(?:this\s+)?down\s*:?\s+(?:that\s+)?", re.I)


def _canon(utterance: str) -> str:
    u = CAPTURE_RE.sub(lambda m: (m.group(1) or m.group(2) or m.group(3) or "") + "remember that ", utterance or "", count=1)
    return REMEMBER_SYN_RE.sub(lambda m: m.group(1) + "remember that", u, count=1)


INTENT_RE = re.compile(
    r"^\s*(?:(?:can|could|would)\s+you\s+)?(?:please\s+)?(?:make\s+a\s+note\s+that|note\s+that|don'?t\s+forget|do\s+not\s+forget|"
    r"keep\s+in\s+mind\s+that)\b|"
    r"^\s*(?:(?:can|could|would)\s+you\s+)?(?:please\s+)?(?:remember|forget|recall)\b|"
    r"^\s*what\s+do\s+you\s+remember\b", re.I)


def default_path() -> Path:
    return Path.home() / ".grok-private" / "jarvis-memory.json"


def args_from_utterance(utterance: str) -> dict:
    s = _canon((utterance or "").strip())
    m = re.match(r"^\s*(?:(?:can|could|would)\s+you\s+)?(?:please\s+)?(remember|forget|recall)\b\s*(.*)", s, re.I)
    if not m:
        return {"op": "recall"}
    op, text = m.group(1).lower(), m.group(2).strip()
    if op == "remember":
        text = re.sub(r"^that\s+", "", text, flags=re.I)
    elif op == "forget":
        text = re.sub(r"^the\s+", "", text, flags=re.I)
    return {"op": op, "text": text.rstrip(".!?")}


def _write(path: Path, items: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix=".memory-", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as out:
            os.fchmod(out.fileno(), 0o600)
            json.dump(items, out, ensure_ascii=False)
            out.flush()
            os.fsync(out.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def run(args: dict, *, utterance: str | None = None) -> dict:
    """Execute memory operations; user-facing callers supply the original utterance.

    Routing to this hand is not authority to persist a request. When the original
    utterance is available, its explicit memory command determines both operation
    and literal content, never the model's inferred or expanded arguments. The
    arguments-only form remains for existing trusted programmatic callers.
    """
    args = args or {}
    if utterance is not None:
        if not INTENT_RE.search(_canon(utterance)) or re.match(r"^\s*(?:please\s+)?forget\s+(?:it|that)\s*[,.!?]?(?:\s+(?:stop|cancel|never mind)\b.*)?$", utterance, re.I):
            result = {"op": str(args.get("op") or "recall"), "ok": False,
                      "count": 0, "spoken": "You didn't ask me to remember, recall, or forget anything."}
            result["log"] = {key: result[key] for key in ("op", "ok", "count")}
            return result
        args = args_from_utterance(utterance)
    op = str(args.get("op") or "recall")
    text = str(args.get("text") or "").strip()
    count = 0
    try:
        if op not in {"remember", "recall", "forget"} or (op != "recall" and not text):
            raise ValueError("invalid request")
        path = Path(os.environ.get("JARVIS_MEMORY_FILE") or default_path()).expanduser()
        try:
            items = json.loads(path.read_text(encoding="utf-8"))
        except FileNotFoundError:
            items = []
        if not isinstance(items, list) or any(not isinstance(item, str) for item in items):
            raise ValueError("invalid store")
        if op == "remember":
            items.append(text)
            _write(path, items)
            count, spoken = 1, "I'll remember that."
        elif op == "forget":
            kept = [item for item in items if text.casefold() not in item.casefold()]
            count = len(items) - len(kept)
            _write(path, kept)
            spoken = f"Forgot {count} memories."
        else:
            items = [item for item in items if text.casefold() in item.casefold()]
            count = len(items)
            spoken = "I remember: " + "; ".join(items) if items else "I have no matching memories."
        result = {"op": op, "ok": True, "count": count, "spoken": spoken}
        if op == "recall":
            result["items"] = items
    except (OSError, ValueError, TypeError):
        result = {"op": op, "ok": False, "count": 0, "spoken": "I couldn't access memory safely."}
    result["log"] = {key: result[key] for key in ("op", "ok", "count")}
    return result
