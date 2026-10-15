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
# Open access ("permission granted"): only real secret files stay refused; a name that merely contains
# "token", "secret" or "credential" (tokenomics.pdf, secret-sauce-notes.md) becomes readable.
STRICT_SECRET_NAME = re.compile(
    r"(^\.env(\..*)?$|^id_(rsa|dsa|ecdsa|ed25519)(\.pub)?$|\.(pem|key|p12|pfx|keystore|kdbx|keychain(-db)?)$|"
    r"^\.netrc$|^\.npmrc$|^\.pypirc$|^credentials(\.json)?$|^client_secret.*\.json$|^\.git-credentials$|"
    # security review 2026-10-15 (H7): real secret files whose names a plain list missed
    r"\.env$|^secrets?(\.[a-z0-9]+)?$|(api[_-]?keys?|access[_-]?keys?)|(^|[_.-])tokens?([_.-]|$)|"
    r"^passwords?(\.[a-z0-9]+)?$|credentials|^\.pgpass$|cookies\.sqlite$|^login\.keychain)", re.I)
OPEN_MAX_BYTES = 200000
OPEN_MAX_NAMES = 500


def open_access() -> bool:
    import importlib.util, sys
    name = "agent_stack_permissions"
    if name not in sys.modules:
        spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name("permissions.py"))
        module = importlib.util.module_from_spec(spec); sys.modules[name] = module; spec.loader.exec_module(module)
    try:
        return bool(sys.modules[name].open_access())
    except Exception:  # noqa: BLE001
        return False


def _secret_name(name: str) -> bool:
    return bool((STRICT_SECRET_NAME if open_access() else SECRET_NAME).search(name or ""))


def _home_dot_path(p: Path) -> bool:
    """~/.config, ~/.docker, ~/.claude, ~/.zsh_history, ~/.mcp.json … hold tokens and agent config; ~/Library holds
    cookies and keychains. Dot folders inside projects (repo/.github) are not this."""
    try:
        rel = p.relative_to(Path.home().resolve())
    except ValueError:
        return False
    return bool(rel.parts) and (rel.parts[0].startswith(".") or rel.parts[0] == "Library")


def _max_bytes() -> int:
    return OPEN_MAX_BYTES if open_access() else MAX_BYTES


def _max_names() -> int:
    return OPEN_MAX_NAMES if open_access() else MAX_NAMES


def default_roots() -> list[Path]:
    base = _base_roots()
    if not open_access():
        return base
    home = Path.home()
    extra = [home] + ([Path("/Volumes")] if Path("/Volumes").is_dir() else [])
    return base + [r for r in extra if r not in base]


def _base_roots() -> list[Path]:
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
    spoken = f"I can't read that: {msg}."
    if msg in ("outside the allowed folders", "no allowed folder") and not open_access():
        spoken += ' Say "permission granted" and I will open up your folders.'
    return {"ok": False, "op": op, "error": msg, "spoken": spoken}


def _resolve(raw: str, roots: list[Path]) -> tuple[Path | None, str]:
    if not raw:
        return (roots[0] if roots else None), ""
    p = Path(str(raw)).expanduser()
    if not p.is_absolute():
        if not roots:
            return None, "no allowed folder"
        p = roots[0] / p
    parts = p.parts
    if any(SECRET_DIR.__contains__(x) for x in parts) or _secret_name(p.name):
        return None, "that looks like a secret"
    try:
        real = p.resolve(strict=True)
    except (OSError, RuntimeError):
        return None, "not found"
    if any(x in SECRET_DIR for x in real.parts) or _secret_name(real.name) or _home_dot_path(real):
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
    # A compound request is not one literal target. Leave its tool-selected
    # targets under the existing roots instead of treating prose as a filename
    # or repeatedly forcing every next hand back to the first requested file.
    candidate = Path(raw).expanduser()
    try:
        literal_exists = candidate.exists()
    except OSError:
        literal_exists = False
    if not literal_exists:
        first = _FILE.match(raw)
        if first and raw[first.end():].strip():
            return None
        if re.search(r"\s(?:/|~/)", raw):
            return None
    return candidate


def _folder_contents_requested(utterance, literal):
    """A mentioned/listed folder is not automatically a content-read request."""
    line=str(utterance or '')
    selected=line.replace(literal,' SELECTED_FOLDER ')
    if re.search(r"\b(?:do\s+not|don't|never|avoid|ignore|exclude|skip|except|without)\b[^.!?;\n]{0,200}SELECTED_FOLDER",selected,re.I):
        return False
    if re.search(r"\b(?:do\s+not|don't|never)\s+(?:read|open|inspect|review|analy[sz]e)\b[^.!?;\n]{0,100}\b(?:files?|contents?|records?)\b",line,re.I):
        return False
    if re.search(r"\b(?:names?[- ]only|list(?:ing)?[- ]only|only\s+(?:list|show)|(?:list|show)\s+(?:just|only)\s+(?:the\s+)?names?)\b",line,re.I):
        return False
    verbs=r"(?:read|inspect|review|analy[sz]e|research|examine|study)"
    return bool(re.search(r"(?:^|[.!?;]\s+)(?:(?:please|can you|could you|would you)\s+)?"+verbs+r"\b",line,re.I)
                or re.search(r"\bI\s+(?:want|need|ask)\s+you\s+to\s+"+verbs+r"\b",line,re.I))


def selected_folder_receipt(utterance, result):
    """Host captures a successful actual listing explicitly selected by the owner."""
    if not isinstance(result, dict) or not result.get('ok') or result.get('op') != 'ls':
        return None
    names = result.get('names')
    if not isinstance(names, list) or len(names)>_max_names() or any(not isinstance(n,str) or Path(n).name != n or n in {'.','..'} for n in names):
        return None
    try:
        actual=Path(result['path']).resolve(strict=True)
        candidates=re.findall(r"[\"']((?:/|~/)[^\"']+)[\"']|(?<![\w:/~])((?:/|~/)[^\s\"'<>]+)",str(utterance or ''))
        for quoted,plain in candidates:
            raw=quoted or plain
            if not _folder_contents_requested(utterance,raw):continue
            path=Path(raw).expanduser()
            if not path.exists():path=Path(raw.rstrip(',;.!?')).expanduser()
            if path.is_symlink() or not path.is_dir() or path.resolve(strict=True)!=actual:continue
            if any(part in SECRET_DIR for part in path.parts) or _secret_name(path.name):continue
            observed=result.get('fingerprint')
            current=fingerprint(actual)
            if observed is None or current!=observed:return None
            return {'path':str(actual),'literal_path':str(path),'fingerprint':current,'names':list(names),'more':bool(result.get('more'))}
    except (OSError,RuntimeError,KeyError,TypeError):
        return None
    return None


def run_selected_child(args, receipt):
    """One same-turn host-authorized direct child; no persistent roots are added."""
    if not isinstance(receipt,dict) or args.get('op')!='read':return None
    try:
        folder=Path(receipt['path']);literal=Path(receipt['literal_path'])
        if (literal.is_symlink() or literal.resolve(strict=True)!=folder or not folder.is_dir()
                or fingerprint(folder)!=receipt['fingerprint']):return _deny('selected folder changed','read')
        requested=Path(str(args.get('path') or '')).expanduser()
        target=requested if requested.is_absolute() else folder/requested
        if target.parent!=folder or target.parent.resolve(strict=True)!=folder or target.name not in receipt['names']:
            return _deny('file was not in the selected folder listing','read')
        if target.is_symlink() or not target.is_file():return _deny('selected child is not a regular file','read')
        actual=target.resolve(strict=True)
        if actual.parent!=folder:return _deny('outside the selected folder','read')
        result=run({'op':'read','path':str(actual)},roots=[folder])
        if fingerprint(folder)!=receipt['fingerprint'] or literal.resolve(strict=True)!=folder:
            return _deny('selected folder changed during the read','read')
        return result
    except (OSError,RuntimeError,KeyError,TypeError):
        return _deny('selected folder is unavailable','read')


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
FILE_FIND_RE = re.compile(r"^(?:jarvis[, ]+)?(?:(?:can|could|would) you )?(?:please )?(?:find|locate|search for|look for)\s+"
                          r"(?:my\s+|the\s+|a\s+|any\s+)?(?:files?|documents?|docs?|notes?|folders?)\s+(?:about|named|called|with|containing|matching|for)\s+"
                          r"[\"']?(.{1,80}?)[\"']?(?:\s+(?:in|from|on)\s+(?:my\s+)?(?:downloads|desktop|documents|mac|computer))?[.?!]*$", re.I)
# "books about AI", "pdfs on machine learning", "books related to marketing"
TOPIC_RE = re.compile(r"\b(?:about|on|related\s+to|regarding|covering)\s+(?!my\s+(?:mac|computer|pc)\b)(.{1,60}?)"
                      r"(?=\s+(?:on|in|from|across)\s+(?:my|this|the)\s+(?:mac|computer|pc|downloads|desktop|documents|drive)\b|[.?!]*$)", re.I)
TOPIC_SYNONYMS = {
    "ai": ["ai", "artificial", "intelligence", "machine", "learning", "ml", "llm", "llms", "gpt", "neural", "deep", "agents", "agentic"],
    "artificial intelligence": ["ai", "artificial", "intelligence", "machine", "learning", "llm", "neural"],
    "machine learning": ["machine", "learning", "ml", "ai", "neural", "deep"],
}


def topic_words(topic: str) -> list[str]:
    t = re.sub(r"\s+", " ", str(topic or "").lower()).strip()
    if t in TOPIC_SYNONYMS:
        return TOPIC_SYNONYMS[t]
    return [w for w in re.findall(r"[a-z0-9]+", t) if w not in {"the", "a", "an", "of", "and", "or", "books", "book", "pdfs", "pdf"}]


def _name_tokens(name: str) -> set[str]:
    stem = Path(name).stem
    stem = re.sub(r"([a-z])([A-Z])", r"\1 \2", stem)  # MachineLearning -> Machine Learning
    return set(re.findall(r"[a-z0-9]+", stem.lower()))


FIND_MAX_ENTRIES = 100000
FIND_MAX_RESULTS = 2000
FIND_SECONDS = 5.0


def _find_documents(args, rs):
    query = str(args.get("name") or "").strip().lower()
    topic = topic_words(args.get("topic") or "")
    anytype = open_access() and (bool(query) or args.get("extensions") == [])
    suffixes = args.get("extensions") or [".epub", ".pdf"]
    if anytype:
        suffixes = [str(x).lower() for x in (args.get("extensions") or [])]
    elif query:
        return _deny('searching any file by name needs open access; say "permission granted"', "find")
    elif not isinstance(suffixes, list) or not suffixes or any(x not in (".epub", ".pdf") for x in suffixes):
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
            dirs[:] = sorted((d for d in dirs if not d.startswith(".") and not _secret_name(d) and not (Path(directory) / d).is_symlink()), key=lambda d: (d not in {'Downloads', 'Documents', 'Desktop', 'Books'}, d))
            count += len(dirs) + len(files)
            if count > FIND_MAX_ENTRIES or time.monotonic() >= deadline:
                complete = False
                break
            for name in sorted(files):
                if time.monotonic() >= deadline:
                    complete = False
                    break
                if (suffixes and Path(name).suffix.lower() not in suffixes) or _secret_name(name):
                    continue
                if query and not all(w in name.lower() for w in query.split()):
                    continue
                if topic and not (_name_tokens(name) & set(topic)):
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
    kind = ("files matching " + repr(query)) if query else ("files" if anytype else "EPUB/PDF documents")
    if topic:
        kind += f" about {args.get('topic')} (matched by title)"
    spoken = f"Found {len(found)} {kind} in {scope}. "
    if found:
        spoken += "Candidates: " + "; ".join(found[:12]) + ". "
        if len(found) > 12:
            spoken += f"The inventory contains all {len(found)} paths; only the first 12 are spoken. "
    if not anytype:
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
        names = names[:_max_names()]
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
            converted = reader.read(path, _max_bytes())
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
                limit = _max_bytes()
                data = fh.read(limit + 1)
        except PermissionError:
            return _deny(f"macOS has not given me access to {path.name} yet", op)
        except OSError:
            return _deny("that file can't be opened", op)
        truncated = len(data) > limit
        if fingerprint(path) != before:
            return _deny('the source changed while it was being read; read it again', op)
        if b'\x00' in data:
            return _deny('this is a binary file, not readable text', op)
        text = scrub_text(data[:limit].decode("utf-8", "replace"))
        first = text.splitlines()[0] if text else ""
        return {"ok": True, "op": op, "path": str(path), "text": text, "truncated": truncated,
                'fingerprint': before,
                "spoken": f"The first line of {path.name} is: {first}" if first else f"{path.name} is empty."}
    if op == "ls":
        if not path.is_dir():
            return _deny("not a folder", op)
        before = fingerprint(path)
        try:
            allnames = sorted(n.name for n in path.iterdir() if not n.name.startswith(".") and not _secret_name(n.name))
        except PermissionError:
            return _deny(f"macOS has not given me access to {path.name} yet (System Settings > Privacy & Security > Files and Folders)", op)
        except OSError:
            return _deny("that folder can't be listed", op)
        names = allnames[:_max_names()]
        more = len(allnames) > _max_names()
        sp = f"{path.name} has {len(allnames)} items" + (": " + ", ".join(names[:10]) if names else "") + ("…" if len(allnames) > 10 else ".")
        if fingerprint(path) != before:
            return _deny('folder changed during listing', op)
        return {"ok": True, "op": op, "path": str(path), "names": names, "more": more, "spoken": sp,
                "fingerprint": before}
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


_FILE = re.compile(r"(?<![\w.\-/~])([\w.\-/~]+\.(?:md|txt|py|json|toml|ya?ml|sh|js|ts|cfg|ini|pdf|epub|docx|pptx|xlsx|csv|odt))\b", re.I)
# Secret-looking file asks still go through _resolve, which refuses them (SECRET_NAME / SECRET_DIR).
_SECRET_ASK = re.compile(r"(?<![\w/])(~?/?(?:[\w.\-]+/)*(?:\.env(?:\.[\w-]+)?|id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?|\.netrc|\.npmrc|\.pypirc)"
                         r"|~?/?(?:[\w.\-]+/)*\.(?:ssh|grok-private|gnupg|aws)(?:/[\w.\-]+)*)", re.I)
_FOLDER = re.compile(r"\b(?:in|from|inside)\s+(?:my\s+|the\s+)?(downloads|desktop|documents)\b", re.I)


def args_from_utterance(u: str) -> dict:
    s = u or ""
    selected = requested_path(s)
    if selected is not None:
        return {'op': 'auto', 'path': str(selected)}
    named = FILE_FIND_RE.search(s)
    if named and open_access():
        folder = _FOLDER.search(s)
        return {"op": "find", "extensions": [], "name": named.group(1).strip(" .?!\"'"),
                "path": str(Path.home() / folder.group(1).capitalize()) if folder else ""}
    if DOCUMENT_FIND_RE.search(s):
        suffixes = ([".epub"] if re.search(r"\bepubs?\b", s, re.I) else []) + ([".pdf"] if re.search(r"\bpdfs?\b", s, re.I) else [])
        folder = _FOLDER.search(s)
        topic = TOPIC_RE.search(s)
        return {"op": "find", "extensions": suffixes or [".epub", ".pdf"],
                "path": str(Path.home() / folder.group(1).capitalize()) if folder else "",
                **({"topic": topic.group(1).strip(" .?!\"'")} if topic else {})}
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
