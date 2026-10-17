"""repo_map — a ranked map of a code repository for Jarvis (canvas "repomap"): which files define which functions and
classes, ranked by how often each name is used across the repo. Read-only; orientation before editing, not a framework.
"""
from __future__ import annotations

import re
from collections import Counter, defaultdict
from pathlib import Path

DEFS = {
    ".py": re.compile(r"^\s*(?:async\s+)?(?:def|class)\s+([A-Za-z_]\w*)", re.M),
    ".js": re.compile(r"^\s*(?:export\s+)?(?:async\s+)?(?:function\s+([A-Za-z_$][\w$]*)|class\s+([A-Za-z_$][\w$]*)|const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\()", re.M),
    ".swift": re.compile(r"^\s*(?:public\s+|private\s+|final\s+)*(?:func|class|struct|enum)\s+([A-Za-z_]\w*)", re.M),
}
DEFS[".ts"] = DEFS[".tsx"] = DEFS[".mjs"] = DEFS[".cjs"] = DEFS[".js"]
SKIP = {".git", "node_modules", "venv", ".venv", "__pycache__", "dist", "build", ".next", "vendor"}
MAX_FILES = 4000
WORD = re.compile(r"[A-Za-z_$][\w$]*")
TEST_FILE = re.compile(r"(?:^|/)(?:tests?/|test_[^/]*$|[^/]*_test\.\w+$|[^/]*\.(?:test|spec)\.\w+$)")
DISTINCT = re.compile(r"[a-z0-9]_[a-z]|[a-z][A-Z]|^[A-Z][a-z]")  # multi-word or a class name; one plain word clashes with builtins
GENERIC = {"value", "result", "items", "error", "status", "update", "render", "check", "write", "start", "close", "apply",
           "build", "parse", "handle", "string", "number", "object", "action", "state", "label", "event", "index", "props"}


def build(root: Path, focus: str = "", top: int = 40) -> dict:
    root = Path(root).expanduser()
    files = []
    for p in root.rglob("*"):
        if len(files) >= MAX_FILES:
            break
        if p.is_file() and p.suffix in DEFS and not any(part in SKIP for part in p.relative_to(root).parts):
            if not focus or focus.lower() in str(p.relative_to(root)).lower():
                files.append(p)
    defs: dict[str, list[str]] = defaultdict(list)
    spread: Counter = Counter()   # in how many files a name appears: real use across the repo, not repetition
    for p in files:
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        rel = str(p.relative_to(root))
        if not TEST_FILE.search(rel):
            for m in DEFS[p.suffix].finditer(text):
                name = next((g for g in m.groups() if g), None)
                if name and len(name) > 4 and name.lower() not in GENERIC and not name.startswith("test") and DISTINCT.search(name):
                    defs[name].append(rel)
        spread.update(set(WORD.findall(text)))
    ranked = sorted(defs, key=lambda n: -(spread[n] - len(set(defs[n]))))[:top]
    by_file: dict[str, list[str]] = defaultdict(list)
    for n in ranked:
        by_file[defs[n][0]].append(f"{n} ({spread[n] - len(set(defs[n]))})")
    return {"files": len(files), "symbols": len(defs), "by_file": dict(by_file)}


def answer(path: str, focus: str = "", top: int = 40) -> dict:
    root = Path(path or ".").expanduser()
    if not root.is_dir():
        return {"ok": False, "text": f"No folder at {path}."}
    m = build(root, focus, top)
    lines = [f"{f}: " + ", ".join(v) for f, v in sorted(m["by_file"].items(), key=lambda kv: -len(kv[1]))]
    return {"ok": True, "text": f"{m['files']} code files, {m['symbols']} functions/classes; most used (files that use it):\n" + "\n".join(lines)}
