"""Private durable memory hand. Logs contain metadata only."""
from __future__ import annotations

import json
import os
import re
import tempfile
from pathlib import Path

INTENT_RE = re.compile(
    r"^\s*(?:(?:can|could|would)\s+you\s+)?(?:please\s+)?(?:remember|forget|recall)\b|"
    r"^\s*what\s+do\s+you\s+remember\b", re.I)


def default_path() -> Path:
    return Path.home() / ".grok-private" / "jarvis-memory.json"


def args_from_utterance(utterance: str) -> dict:
    s = (utterance or "").strip()
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
        if not INTENT_RE.search(utterance) or re.match(r"^\s*(?:please\s+)?forget\s+(?:it|that)\s*[,.!?]?(?:\s+(?:stop|cancel|never mind)\b.*)?$", utterance, re.I):
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
