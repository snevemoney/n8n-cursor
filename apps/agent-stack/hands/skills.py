"""skills — Jarvis's read-only skill hand (CANDIDATE).

ops: list (names + one-line descriptions from SKILL.md frontmatter), read (one skill's text, capped 16 KB).
A skill is read only by a name found in the listing, so ../ and absolute paths are refused.
"""
from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

MAX_BYTES = 16384
MAX_SPOKEN = 15
STACK = Path(__file__).resolve().parent.parent
_FIELD = re.compile(r"^(name|description):\s*(.+?)\s*$", re.M)


def default_roots() -> list[Path]:
    env = os.environ.get("JARVIS_SKILL_ROOTS", "")
    if env:
        return [Path(p).expanduser() for p in env.split(os.pathsep) if p.strip()]
    home = Path.home()
    repo = STACK.parent.parent
    candidates = [home / ".claude" / "skills", home / ".codex" / "skills", home / ".cursor" / "skills-cursor"]
    candidates += [base / suffix for base in (repo, STACK)
                   for suffix in ("skills", ".claude/skills", ".codex/skills", ".cursor/skills", ".cursor/skills-cursor")]
    return [root for root in candidates if root.is_dir()]


def _frontmatter(path: Path) -> dict[str, str]:
    try:
        with open(path, "rb") as fh:
            head = fh.read(4096).decode("utf-8", "replace")
    except OSError:
        return {}
    lines = head.splitlines()
    if not lines or lines[0] != "---" or "---" not in lines[1:]:
        return {}
    block = "\n".join(lines[1:lines.index("---", 1)])
    return {m.group(1): m.group(2).strip("\"'") for m in _FIELD.finditer(block)}


def _scan(roots) -> dict[str, tuple[Path, str]]:
    found: dict[str, tuple[Path, str]] = {}
    for root in roots if roots is not None else default_roots():
        try:
            dirs = sorted(Path(root).expanduser().iterdir())
        except OSError:
            continue
        for d in dirs:
            md = d / "SKILL.md"
            if not md.is_file():
                continue
            fm = _frontmatter(md)
            name = fm.get("name", "")
            if name and "/" not in name and "\\" not in name and name not in (".", ".."):
                found.setdefault(name, (md, fm.get("description", "")))
    return found


def run(args: dict, roots=None) -> dict[str, Any]:
    op = str((args or {}).get("op") or "list")
    found = _scan(roots)
    if op == "list":
        skills = [{"name": n, "description": d} for n, (_, d) in sorted(found.items())]
        names = [s["name"] for s in skills]
        sp = (f"I have {len(names)} skills, for example: " + ", ".join(names[:MAX_SPOKEN]) + "."
              if names else "I found no skills in my skill folders.")
        return {"ok": True, "op": op, "skills": skills, "spoken": sp}
    if op == "read":
        name = str((args or {}).get("name") or "").strip()
        hit = found.get(name) if "/" not in name and "\\" not in name and name not in (".", "..") else None
        if hit is None:
            return {"ok": False, "op": op, "error": "unknown skill", "spoken": "I can't read that: I have no skill by that name."}
        try:
            with open(hit[0], "rb") as fh:
                data = fh.read(MAX_BYTES + 1)
        except OSError:
            return {"ok": False, "op": op, "error": "unreadable", "spoken": "I can't read that: the skill file can't be opened."}
        text = data[:MAX_BYTES].decode("utf-8", "ignore")
        return {"ok": True, "op": op, "name": name, "text": text, "truncated": len(data) > MAX_BYTES,
                "spoken": f"The {name} skill: {hit[1] or 'no description'}."}
    return {"ok": False, "op": op, "error": "unknown op", "spoken": "I can't read that: unknown skills op."}


_READ = re.compile(r"\b(?:read|open|show)\s+(?:me\s+)?(?:the\s+)?([\w.\-]+)\s+skill\b"
                   r"|\b(?:run|show|check)\s+(?:me\s+)?(?:the\s+)?([\w.\-]+)\s+workflow\b", re.I)


def args_from_utterance(u: str) -> dict:
    m = _READ.search(u or "")
    return {"op": "read", "name": m.group(1) or m.group(2)} if m else {"op": "list"}


def log_meta(result: dict) -> dict:
    """Metadata only: op, ok, counts. Never skill text."""
    r = result or {}
    return {"op": r.get("op"), "ok": bool(r.get("ok")), "skills": len(r.get("skills") or []),
            "chars": len(str(r.get("text") or "")), "truncated": bool(r.get("truncated"))}
