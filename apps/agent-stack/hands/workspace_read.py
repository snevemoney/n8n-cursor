"""workspace_read — Jarvis's one read-only file hand (CANDIDATE).

ops: read (file text, capped), ls (names only, <=50), git (branch + HEAD), repos (git dirs in roots).
Refuses secrets (.env, keys, .grok-private, .ssh) and anything outside the allowed roots,
including ../ and symlink escapes (paths are fully resolved before the root test).
Nothing here changes files or git state. log_meta() keeps metadata only (no text, no home paths).
"""
from __future__ import annotations

import os
import re
import subprocess
from pathlib import Path
from typing import Any

MAX_BYTES = 12000
MAX_NAMES = 50
SECRET_NAME = re.compile(
    r"(^\.env(\..*)?$|^id_(rsa|dsa|ecdsa|ed25519)(\.pub)?$|\.(pem|key|p12|pfx|keystore|kdbx)$|"
    r"^\.netrc$|^\.npmrc$|^\.pypirc$|credential|secret|token)", re.I)
SECRET_DIR = {".grok-private", ".ssh", ".gnupg", ".aws", ".git"}


def default_roots() -> list[Path]:
    env = os.environ.get("JARVIS_READ_ROOTS", "")
    if env:
        return [Path(p).expanduser() for p in env.split(os.pathsep) if p.strip()]
    home = Path.home()
    # The running working tree comes first, so "what branch/head" reports the code that is actually serving
    # (fix: :4019 ran from ~/jarvis-honesty but answered with ~/jarvis-main's head).
    running = Path(__file__).resolve().parents[3]
    out = [running] if (running / ".git").exists() else []
    return out + [r for r in (home / "jarvis-main", home / "Downloads", home / "code") if r != running]


def _roots(roots) -> list[Path]:
    out = []
    for r in roots if roots is not None else default_roots():
        try:
            out.append(Path(r).expanduser().resolve())
        except OSError:
            continue
    return out


def _deny(msg: str, op: str) -> dict[str, Any]:
    return {"ok": False, "op": op, "error": msg, "spoken": f"I can't read that: {msg}."}


def _resolve(raw: str, roots: list[Path]) -> tuple[Path | None, str]:
    if not raw:
        return (roots[0] if roots else None), ""
    p = Path(str(raw)).expanduser()
    if not p.is_absolute():
        if not roots:
            return None, "no allowed folder"
        p = roots[0] / p
    parts = p.parts
    if any(SECRET_DIR.__contains__(x) for x in parts) or SECRET_NAME.search(p.name):
        return None, "that looks like a secret"
    try:
        real = p.resolve(strict=True)
    except (OSError, RuntimeError):
        return None, "not found"
    if any(x in SECRET_DIR for x in real.parts) or SECRET_NAME.search(real.name):
        return None, "that looks like a secret"
    if not any(real == r or r in real.parents for r in roots):
        return None, "outside the allowed folders"
    return real, ""


def _git(d: Path, *args: str) -> tuple[int, str]:
    try:
        r = subprocess.run(["git", "-C", str(d), *args], capture_output=True, text=True, timeout=5)
        return r.returncode, r.stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        return 1, ""


def run(args: dict, roots=None) -> dict[str, Any]:
    op = str((args or {}).get("op") or "read")
    rs = _roots(roots)
    if op == "repos":
        names = []
        for r in rs:
            if (r / ".git").exists():
                names.append(r.name)
            try:
                for c in sorted(r.iterdir()):
                    if c.is_dir() and (c / ".git").exists():
                        names.append(c.name)
            except OSError:
                continue
        names = names[:MAX_NAMES]
        sp = ("Local repos: " + ", ".join(names) + ".") if names else "I found no git repos in my allowed folders."
        return {"ok": True, "op": op, "names": names, "spoken": sp}
    path, err = _resolve(str((args or {}).get("path") or ""), rs)
    if path is None:
        return _deny(err or "not found", op)
    if op == "read":
        if not path.is_file():
            return _deny("not a file", op)
        try:
            with open(path, "rb") as fh:
                data = fh.read(MAX_BYTES + 1)
        except PermissionError:
            return _deny(f"macOS has not given me access to {path.name} yet", op)
        except OSError:
            return _deny("that file can't be opened", op)
        truncated = len(data) > MAX_BYTES
        text = data[:MAX_BYTES].decode("utf-8", "replace")
        first = text.splitlines()[0] if text else ""
        return {"ok": True, "op": op, "path": str(path), "text": text, "truncated": truncated,
                "spoken": f"The first line of {path.name} is: {first}" if first else f"{path.name} is empty."}
    if op == "ls":
        if not path.is_dir():
            return _deny("not a folder", op)
        try:
            allnames = sorted(n.name for n in path.iterdir() if not n.name.startswith(".") and not SECRET_NAME.search(n.name))
        except PermissionError:
            return _deny(f"macOS has not given me access to {path.name} yet (System Settings > Privacy & Security > Files and Folders)", op)
        except OSError:
            return _deny("that folder can't be listed", op)
        names = allnames[:MAX_NAMES]
        more = len(allnames) > MAX_NAMES
        sp = f"{path.name} has {len(allnames)} items" + (": " + ", ".join(names[:10]) if names else "") + ("…" if len(allnames) > 10 else ".")
        return {"ok": True, "op": op, "path": str(path), "names": names, "more": more, "spoken": sp}
    if op == "git":
        d = path if path.is_dir() else path.parent
        rc, top = _git(d, "rev-parse", "--show-toplevel")
        if rc != 0:
            return _deny("not a git repo", op)
        _, head = _git(d, "rev-parse", "--short=9", "HEAD")
        rc, br = _git(d, "symbolic-ref", "-q", "--short", "HEAD")
        branch = br if rc == 0 and br else "detached"
        repo = Path(top).name
        where = "detached at" if branch == "detached" else f"on branch {branch} at"
        return {"ok": True, "op": op, "repo": repo, "branch": branch, "head": head,
                "spoken": f"I'm in {repo}, {where} {head}."}
    return _deny("unknown op", op)


_FILE = re.compile(r"\b([\w.\-/~]+\.(?:md|txt|py|json|toml|ya?ml|sh|js|ts|cfg|ini))\b", re.I)


def args_from_utterance(u: str) -> dict:
    s = u or ""
    if re.search(r"\b(repo|branch|head)\b", s, re.I) and not _FILE.search(s) and not re.search(r"\brepos\b", s, re.I):
        return {"op": "git", "path": ""}
    if re.search(r"\brepos\b|\brepositories\b", s, re.I):
        return {"op": "repos"}
    m = re.search(r"\b(downloads|desktop|documents)\b", s, re.I)
    if re.search(r"\b(list|files|folder|ls)\b", s, re.I) and m:
        return {"op": "ls", "path": str(Path.home() / m.group(1).capitalize())}
    f = _FILE.search(s)
    if f:
        return {"op": "read", "path": f.group(1)}
    return {"op": "ls", "path": ""}


def log_meta(result: dict) -> dict:
    """Metadata only: op, ok, file suffix, sizes. Never text, names or paths."""
    r = result or {}
    p = str(r.get("path") or "")
    return {"op": r.get("op"), "ok": bool(r.get("ok")), "suffix": Path(p).suffix if p else "",
            "chars": len(str(r.get("text") or "")), "names": len(r.get("names") or []),
            "truncated": bool(r.get("truncated"))}
