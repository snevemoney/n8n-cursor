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
import time
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


def _words():
    import importlib.util, sys
    name = "agent_stack_workspace_words"
    if name not in sys.modules:
        spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name("workspace_words.py"))
        mod = importlib.util.module_from_spec(spec); sys.modules[name] = mod; spec.loader.exec_module(mod)
    return sys.modules[name]


def _git(d: Path, *args: str) -> tuple[int, str]:
    try:
        r = subprocess.run(["git", "-C", str(d), *args], capture_output=True, text=True, timeout=5)
        return r.returncode, r.stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        return 1, ""


def fingerprint(path):
    stat = Path(path).stat()
    return {'mtime_ns': stat.st_mtime_ns, 'size': stat.st_size, 'device': stat.st_dev, 'inode': stat.st_ino}


def scrub_text(text):
    import importlib.util, sys
    name = 'agent_stack_workspace_document_scrub'
    if name not in sys.modules:
        spec = importlib.util.spec_from_file_location(name, Path(__file__).parents[1] / 'memory/document_context.py')
        module = importlib.util.module_from_spec(spec); sys.modules[name] = module; spec.loader.exec_module(module)
    return sys.modules[name].scrub_text(text)[0]


REQUEST_PATH_RE = re.compile(
    r"^(?:jarvis[, ]+)?(?:(?:can|could|would) you )?(?:please )?"
    r"(?:read|open|show|cat|list|inspect)\s+(?:me\s+)?(?:the\s+)?"
    r"(?:(?:file|folder|directory)\s+)?(.+?)\s*$", re.I)


def requested_path(utterance):
    """Only a literal path from the user's utterance can extend this one read.

    Model-produced arguments cannot expand the allowed roots. No configuration,
    persistent permission or OS grant is changed.
    """
    match = REQUEST_PATH_RE.fullmatch(utterance or '')
    if not match:
        return None
    raw = match.group(1)
    if raw.startswith(('"', "'")) and raw[-1:] == raw[:1]:
        raw = raw[1:-1]
    if '\n' in raw or '\r' in raw:
        return None
    if not (raw.startswith('/') or raw.startswith('~/')):
        alias = re.fullmatch(r"(?:my\s+)?(downloads|desktop|documents)(?:\s+folder)?[.!?]?", raw, re.I)
        if not alias:
            return None
        return Path.home() / alias.group(1).capitalize()
    return Path(raw).expanduser()


def run_requested(args, utterance, roots=None):
    if DOCUMENT_FIND_RE.search(utterance or '') and re.search(r'\b(?:on|across|in)\s+(?:my|this)\s+(?:mac|computer|pc)\b', utterance or '', re.I):
        # User-requested discovery only; never adds persistent read permissions.
        home = Path.home()
        search_roots = [home / name for name in ('Downloads', 'Documents', 'Desktop') if (home / name).is_dir()] + [home]
        selected_args = args_from_utterance(utterance)
        selected_args['scope_label'] = 'your Mac home folder'
        return run(selected_args, roots=search_roots)
    selected = requested_path(utterance)
    if selected is None:
        return run(args, roots=roots)
    # Exact target only: authorizing one file never authorizes its neighbours.
    # _resolve still denies secret paths both before and after symlink resolution.
    try:
        selected_root = selected.resolve(strict=True)
    except (OSError, RuntimeError):
        return _deny('the requested path was not found', 'read')
    selected_args = {'op': 'ls' if selected_root.is_dir() else 'read', 'path': str(selected)}
    return run(selected_args, roots=[selected_root])


# File-type discovery reads directory entries only, never document contents.
DOCUMENT_FIND_RE = re.compile(r"^(?:jarvis[, ]+)?(?:(?:can|could|would) you )?(?:please )?(?:find|locate|list|search|show)\b.{0,100}\b(?:books?|ebooks?|epubs?|pdfs?)\b", re.I)
FIND_MAX_ENTRIES = 100000
FIND_MAX_RESULTS = 2000
FIND_SECONDS = 5.0


def _find_documents(args, rs):
    suffixes = args.get("extensions") or [".epub", ".pdf"]
    if not isinstance(suffixes, list) or not suffixes or any(x not in (".epub", ".pdf") for x in suffixes):
        return _deny("document search supports EPUB and PDF", "find")
    if not rs:
        return _deny("no allowed folders", "find")
    raw = str(args.get("path") or "")
    if raw:
        root, err = _resolve(raw, rs)
        if root is None:
            return _deny(err, "find")
        scan_roots = [root]
    else:
        scan_roots = sorted(rs, key=lambda r: (r.name not in {'Downloads', 'Documents', 'Desktop'}, str(r)))
    found, seen, errors, count = [], set(), [], 0
    complete = True
    deadline = time.monotonic() + FIND_SECONDS
    for root in scan_roots:
        if not root.is_dir():
            errors.append(f"{root.name}: unavailable")
            continue
        def onerror(exc):
            errors.append(f"{Path(exc.filename or root).name}: inaccessible")
        for directory, dirs, files in os.walk(root, followlinks=False, onerror=onerror):
            dirs[:] = sorted((d for d in dirs if not d.startswith(".") and not SECRET_NAME.search(d) and not (Path(directory) / d).is_symlink()), key=lambda d: (d not in {'Downloads', 'Documents', 'Desktop', 'Books'}, d))
            count += len(dirs) + len(files)
            if count > FIND_MAX_ENTRIES or time.monotonic() >= deadline:
                complete = False
                break
            for name in sorted(files):
                if time.monotonic() >= deadline:
                    complete = False
                    break
                if Path(name).suffix.lower() not in suffixes or SECRET_NAME.search(name):
                    continue
                path = Path(directory) / name
                if path.is_symlink():
                    continue
                resolved, _ = _resolve(str(path), rs)
                if resolved is None or not resolved.is_file() or str(resolved) in seen:
                    continue
                seen.add(str(resolved)); found.append(str(resolved))
                if len(found) >= FIND_MAX_RESULTS:
                    complete = False
                    break
            if not complete:
                break
        if not complete:
            break
    complete = complete and not errors
    found.sort(key=str.casefold)
    scope = args.get('scope_label') or ("the requested allowed folder" if raw else "my currently allowed folders")
    spoken = f"Found {len(found)} EPUB/PDF documents in {scope}. "
    if found:
        spoken += "Candidates: " + "; ".join(found[:12]) + ". "
        if len(found) > 12:
            spoken += f"The inventory contains all {len(found)} paths; only the first 12 are spoken. "
    spoken += "PDFs may be articles or other documents, so these are not all confirmed books. "
    spoken += "This is not a whole-Mac search."
    if not complete:
        spoken += " The inventory is incomplete: some folders were inaccessible or the search limit was reached."
    return {"ok": True, "op": "find", "files": found, "count": len(found), "complete": complete,
            "scope": [str(r) for r in scan_roots], "errors": errors, "spoken": spoken}


def run(args: dict, roots=None) -> dict[str, Any]:
    op = str((args or {}).get("op") or "read")
    rs = _roots(roots)
    if op == "find":
        return _find_documents(args or {}, rs)
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
        before = fingerprint(path)
        import importlib.util, sys
        name = 'agent_stack_document_read'
        if name not in sys.modules:
            spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name('document_read.py'))
            module = importlib.util.module_from_spec(spec); sys.modules[name] = module; spec.loader.exec_module(module)
        reader = sys.modules[name]
        if path.suffix.lower() in reader.FORMATS:
            converted = reader.read(path, MAX_BYTES)
            if not converted['ok']:
                return _deny(converted['error'], op)
            text, truncated = scrub_text(converted['text']), converted['truncated']
            if fingerprint(path) != before:
                return _deny('the source changed while it was being read; read it again', op)
            return {'ok': True, 'op': op, 'path': str(path), 'text': text, 'truncated': truncated,
                    'fingerprint': before,
                    'reader': 'markitdown',
                    'spoken': f"Read text from {path.name}: {text[:600]}" + (' This is a partial extract.' if truncated else '')}
        try:
            with open(path, "rb") as fh:
                data = fh.read(MAX_BYTES + 1)
        except PermissionError:
            return _deny(f"macOS has not given me access to {path.name} yet", op)
        except OSError:
            return _deny("that file can't be opened", op)
        truncated = len(data) > MAX_BYTES
        if fingerprint(path) != before:
            return _deny('the source changed while it was being read; read it again', op)
        if b'\x00' in data:
            return _deny('this is a binary file, not readable text', op)
        text = scrub_text(data[:MAX_BYTES].decode("utf-8", "replace"))
        first = text.splitlines()[0] if text else ""
        return {"ok": True, "op": op, "path": str(path), "text": text, "truncated": truncated,
                'fingerprint': before,
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
    if op == "status":
        d = path if path.is_dir() else path.parent
        rc, top = _git(d, "rev-parse", "--show-toplevel")
        if rc != 0:
            return _deny("not a git repo", op)
        rc, out = _git(Path(top), "status", "--porcelain")
        if rc != 0:
            return _deny("git status failed", op)
        lines = [ln for ln in out.splitlines() if ln.strip()]
        untracked = sum(1 for ln in lines if ln.startswith("??"))
        changed = len(lines) - untracked
        repo = Path(top).name
        sp = _words().status_spoken(repo, changed, untracked)
        return {"ok": True, "op": op, "repo": repo, "changed": changed, "untracked": untracked, "spoken": sp}
    return _deny("unknown op", op)


_FILE = re.compile(r"\b([\w.\-/~]+\.(?:md|txt|py|json|toml|ya?ml|sh|js|ts|cfg|ini|pdf|epub|docx|pptx|xlsx|csv|odt))\b", re.I)
# Secret-looking file asks still go through _resolve, which refuses them (SECRET_NAME / SECRET_DIR).
_SECRET_ASK = re.compile(r"(?<![\w/])(~?/?(?:[\w.\-]+/)*(?:\.env(?:\.[\w-]+)?|id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?|\.netrc|\.npmrc|\.pypirc)"
                         r"|~?/?(?:[\w.\-]+/)*\.(?:ssh|grok-private|gnupg|aws)(?:/[\w.\-]+)*)", re.I)
_FOLDER = re.compile(r"\b(?:in|from|inside)\s+(?:my\s+|the\s+)?(downloads|desktop|documents)\b", re.I)


def args_from_utterance(u: str) -> dict:
    s = u or ""
    selected = requested_path(s)
    if selected is not None:
        return {'op': 'auto', 'path': str(selected)}
    if DOCUMENT_FIND_RE.search(s):
        suffixes = ([".epub"] if re.search(r"\bepubs?\b", s, re.I) else []) + ([".pdf"] if re.search(r"\bpdfs?\b", s, re.I) else [])
        folder = _FOLDER.search(s)
        return {"op": "find", "extensions": suffixes or [".epub", ".pdf"],
                "path": str(Path.home() / folder.group(1).capitalize()) if folder else ""}
    if _words().STATUS_ASK.search(s) and not _FILE.search(s):
        return {"op": "status", "path": ""}
    sec = _SECRET_ASK.search(s)
    if sec and re.search(r"\b(read|open|show|cat|print|display|what'?s in)\b", s, re.I):
        return {"op": "read", "path": sec.group(1)}
    if re.search(r"\b(repo|branch|head)\b", s, re.I) and not _FILE.search(s) and not re.search(r"\brepos\b", s, re.I):
        return {"op": "git", "path": ""}
    if re.search(r"\brepos\b|\brepositories\b", s, re.I):
        return {"op": "repos"}
    m = re.search(r"\b(downloads|desktop|documents)\b", s, re.I)
    if re.search(r"\b(list|files|folder|ls)\b", s, re.I) and m:
        return {"op": "ls", "path": str(Path.home() / m.group(1).capitalize())}
    f = _FILE.search(s)
    if f:
        fold = _FOLDER.search(s)
        if fold and "/" not in f.group(1):
            return {"op": "read", "path": str(Path.home() / fold.group(1).capitalize() / f.group(1))}
        return {"op": "read", "path": f.group(1)}
    return {"op": "ls", "path": ""}


def log_meta(result: dict) -> dict:
    """Metadata only: op, ok, file suffix, sizes. Never text, names or paths."""
    r = result or {}
    p = str(r.get("path") or "")
    return {"op": r.get("op"), "ok": bool(r.get("ok")), "suffix": Path(p).suffix if p else "",
            "chars": len(str(r.get("text") or "")), "names": len(r.get("names") or []),
            "truncated": bool(r.get("truncated"))}
