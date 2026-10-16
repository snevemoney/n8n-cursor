"""repo — look at, search and install public GitHub repos (Evens 2026-10-15: "like Cursor or Claude Code would").

look:    owner/repo or a github.com URL -> description, stars, license, default branch, top-level files, README excerpt.
search:  "find a github repo for X" -> top public matches.
install: shallow clone into ~/jarvis-repos/<owner>__<repo>, then the project's own dependency install, kept local to the
         clone (.venv for Python, node_modules for Node). Never sudo, never a global install. Needs open access
         ("permission granted"), because installing runs the project's own setup code.
Network reads use the public GitHub API; GITHUB_TOKEN/GH_TOKEN is used if set (names only, never echoed).
"""
from __future__ import annotations

import base64
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://api.github.com"
INSTALL_ROOT_ENV = "JARVIS_REPOS_ROOT"
README_CHARS = 1800
STEP_TIMEOUT = 600

_NAME = r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})"
_REPO = r"[A-Za-z0-9._-]{1,100}"
URL_RE = re.compile(rf"(?:https?://)?(?:www\.)?github\.com/({_NAME})/({_REPO}?)(?:\.git)?(?=[/#?\s]|$)", re.I)
SLUG_RE = re.compile(rf"(?<![\w./~-])({_NAME})/({_REPO})(?![\w/])")
INSTALL_RE = re.compile(r"\b(?:install|clone|set\s*up|setup|download)\b", re.I)
LOOK_RE = re.compile(r"\b(?:look\s+(?:at|into|up)|check\s+out|read|open|show\s+me|inspect|explore|review|what(?:'s|\s+is)\s+(?:in\s+)?|tell\s+me\s+about|summari[sz]e)\b", re.I)
REPO_WORD_RE = re.compile(r"\b(?:github|repo|repos|repository|repositories)\b", re.I)
TOOL_RE = re.compile(r"^(?:jarvis[, ]+)?(?:(?:can|could|would)\s+you\s+)?(?:please\s+)?install\s+(?:the\s+)?(?:tool\s+|package\s+|cli\s+)?"
                     r"([A-Za-z0-9][A-Za-z0-9@._/+-]{0,80})(?:\s+(?:with|using|via|from)\s+(brew|homebrew|pip|pipx|npm|cargo))?\s*(?:for\s+me|please|now)?[.!?]*$", re.I)
TOOL_MANAGERS = {"brew": "brew", "homebrew": "brew", "pip": "pip", "pipx": "pipx", "npm": "npm", "cargo": "cargo"}
SEARCH_RE = re.compile(r"\b(?:find|search(?:\s+for)?|look\s+for|any)\s+(?:me\s+)?(?:a\s+|some\s+|the\s+best\s+|good\s+)?(?:public\s+)?(?:github\s+)?(?:repos?|repository|repositories|projects?\s+on\s+github)\s+(?:for|about|that|on|to|with)\s+(.{2,120}?)[.?!]*$", re.I)


def _permissions():
    name = "agent_stack_permissions"
    if name not in sys.modules:
        spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name("permissions.py"))
        mod = importlib.util.module_from_spec(spec); sys.modules[name] = mod; spec.loader.exec_module(mod)
    return sys.modules[name]


def install_root() -> Path:
    raw = (os.environ.get(INSTALL_ROOT_ENV) or "").strip()
    return Path(raw).expanduser() if raw else Path.home() / "jarvis-repos"


def parse_spec(text: str) -> tuple[str, str] | None:
    m = URL_RE.search(text or "")
    if m:
        return m.group(1), m.group(2).removesuffix(".git")
    if not REPO_WORD_RE.search(text or "") and not INSTALL_RE.search(text or ""):
        return None  # a bare "a/b" in prose is a path, not a repo
    m = SLUG_RE.search(text or "")
    if m and not m.group(1).lower() in {"apps", "src", "docs", "users", "home", "hands", "brain", "face"}:
        return m.group(1), m.group(2).removesuffix(".git")
    return None


def wants(utterance: str) -> str:
    """'install' | 'look' | 'search' | 'tool' | '' for an owner utterance."""
    u = utterance or ""
    if SEARCH_RE.search(u) and not URL_RE.search(u):
        return "search"
    spec = parse_spec(u)
    if not spec:
        t = TOOL_RE.match(u.strip())
        return "tool" if (t and "/" not in t.group(1) and not REPO_WORD_RE.search(t.group(1))
                          and t.group(1).lower() not in {"it", "this", "that", "them", "these", "those", "everything", "something"}) else ""
    if INSTALL_RE.search(u):
        return "install"
    if LOOK_RE.search(u) or REPO_WORD_RE.search(u) or URL_RE.search(u):
        return "look"
    return ""


def _get(url: str, *, accept: str = "application/vnd.github+json", timeout: float = 15.0):
    headers = {"Accept": accept, "User-Agent": "jarvis-repo-hand", "X-GitHub-Api-Version": "2022-11-28"}
    token = (os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN") or "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8", "replace"))


def _fail(op: str, why: str) -> dict:
    return {"ok": False, "op": op, "tool": "repo", "spoken": why, "task_verified": False}


def look(owner: str, name: str, *, get=_get) -> dict:
    slug = f"{owner}/{name}"
    try:
        meta = get(f"{API}/repos/{slug}")
    except urllib.error.HTTPError as exc:
        return _fail("look", f"GitHub says {slug} is {'not found or private' if exc.code == 404 else f'unavailable (HTTP {exc.code})'}.")
    except (urllib.error.URLError, TimeoutError, ValueError) as exc:
        return _fail("look", f"I couldn't reach GitHub for {slug} ({type(exc).__name__}).")
    files: list[str] = []
    try:
        tree = get(f"{API}/repos/{slug}/contents")
        files = [f"{x.get('name')}{'/' if x.get('type') == 'dir' else ''}" for x in tree if isinstance(x, dict)][:40]
    except Exception:  # noqa: BLE001 — the listing is a bonus; metadata already answered
        pass
    readme = ""
    try:
        got = get(f"{API}/repos/{slug}/readme")
        readme = base64.b64decode(got.get("content") or "").decode("utf-8", "replace")
    except Exception:  # noqa: BLE001
        pass
    lic = ((meta.get("license") or {}).get("spdx_id") or "no license file") if isinstance(meta, dict) else "unknown"
    desc = str(meta.get("description") or "no description").strip()
    stars = int(meta.get("stargazers_count") or 0)
    lang = meta.get("language") or "mixed"
    head = re.sub(r"\s+", " ", re.sub(r"[#>*`\[\]()!|_-]+", " ", readme)).strip()[:300]
    spoken = (f"{slug}: {desc}. {stars:,} stars, mostly {lang}, license {lic}, default branch {meta.get('default_branch') or 'main'}."
              + (f" Top level: {', '.join(files[:12])}." if files else "")
              + (f" README starts: {head}" if head else " No README."))
    return {"ok": True, "op": "look", "tool": "repo", "repo": slug, "url": meta.get("html_url") or f"https://github.com/{slug}",
            "description": desc, "stars": stars, "license": lic, "language": lang, "files": files,
            "readme": readme[:README_CHARS], "readme_truncated": len(readme) > README_CHARS,
            "archived": bool(meta.get("archived")), "pushed_at": meta.get("pushed_at") or "", "spoken": spoken, "task_verified": True, "cites": [meta.get("html_url") or ""]}


def search(query: str, *, get=_get, limit: int = 5) -> dict:
    q = urllib.parse.quote(query.strip())
    try:
        got = get(f"{API}/search/repositories?q={q}&sort=stars&order=desc&per_page={limit}")
    except Exception as exc:  # noqa: BLE001
        return _fail("search", f"GitHub search failed ({type(exc).__name__}).")
    items = [i for i in (got.get("items") or []) if isinstance(i, dict)][:limit]
    if not items:
        return {"ok": True, "op": "search", "tool": "repo", "results": [], "task_verified": True,
                "spoken": f"GitHub has no public repos matching {query}."}
    rows = [{"repo": i.get("full_name"), "stars": int(i.get("stargazers_count") or 0), "description": (i.get("description") or "")[:140],
             "url": i.get("html_url")} for i in items]
    spoken = "Top GitHub matches: " + "; ".join(f"{r['repo']} ({r['stars']:,} stars) — {r['description'] or 'no description'}" for r in rows) + "."
    return {"ok": True, "op": "search", "tool": "repo", "results": rows, "spoken": spoken, "task_verified": True,
            "cites": [r["url"] for r in rows if r["url"]]}


def _run(cmd: list[str], cwd: Path, log: list[str], timeout: int = STEP_TIMEOUT) -> bool:
    log.append("$ " + " ".join(cmd))
    try:
        cp = subprocess.run(cmd, cwd=str(cwd), capture_output=True, text=True, timeout=timeout,
                            env={**os.environ, "GIT_TERMINAL_PROMPT": "0", "PIP_DISABLE_PIP_VERSION_CHECK": "1"})
    except FileNotFoundError:
        log.append(f"{cmd[0]}: not installed on this Mac")
        return False
    except subprocess.TimeoutExpired:
        log.append(f"timed out after {timeout}s")
        return False
    tail = (cp.stdout + cp.stderr).strip().splitlines()[-15:]
    log.extend(tail)
    log.append(f"exit {cp.returncode}")
    return cp.returncode == 0


def plan_install(path: Path) -> list[tuple[str, list[list[str]]]]:
    """Local, non-global install steps for what the clone actually contains."""
    steps: list[tuple[str, list[list[str]]]] = []
    py = None
    if (path / "pyproject.toml").is_file() or (path / "setup.py").is_file() or (path / "requirements.txt").is_file():
        venv_py = str(path / ".venv" / "bin" / "python")
        py = [[sys.executable or "python3", "-m", "venv", ".venv"]]
        if (path / "requirements.txt").is_file():
            py.append([venv_py, "-m", "pip", "install", "-r", "requirements.txt"])
        if (path / "pyproject.toml").is_file() or (path / "setup.py").is_file():
            py.append([venv_py, "-m", "pip", "install", "-e", "."])
        steps.append(("python", py))
    if (path / "package.json").is_file():
        if (path / "pnpm-lock.yaml").is_file() and shutil.which("pnpm"):
            steps.append(("node", [["pnpm", "install"]]))
        elif (path / "yarn.lock").is_file() and shutil.which("yarn"):
            steps.append(("node", [["yarn", "install"]]))
        else:
            steps.append(("node", [["npm", "install"]]))
    if (path / "Cargo.toml").is_file():
        steps.append(("rust", [["cargo", "build", "--release"]]))
    if (path / "go.mod").is_file():
        steps.append(("go", [["go", "build", "./..."]]))
    if (path / "Package.swift").is_file():
        steps.append(("swift", [["swift", "build"]]))
    return steps


def _years_since(iso: str, now=None) -> float | None:
    import datetime as _dt
    try:
        then = _dt.datetime.fromisoformat(str(iso).replace("Z", "+00:00"))
    except ValueError:
        return None
    now = now or _dt.datetime.now(_dt.timezone.utc)
    return (now - then).days / 365.25


def gate(info: dict, *, now=None) -> tuple[str, list[str]]:
    """AGENT_RULES §18 repo gate before any clone: ('hold', why) or ('ok', warnings).

    Holds copyleft network licenses (AGPL) until the owner says to install anyway. Warns on archived,
    stale (no push in 2+ years), missing license, and README install steps that pipe a download into a shell
    (those are never run by this hand)."""
    lic = str(info.get("license") or "")
    if "AGPL" in lic.upper():
        return "hold", [f"its license is {lic}, which the Hive rules hold before install"]
    warn: list[str] = []
    if info.get("archived"):
        warn.append("it is archived, so nobody maintains it")
    age = _years_since(info.get("pushed_at") or "", now) if info.get("pushed_at") else None
    if age is not None and age >= 2:
        warn.append(f"the last push was about {int(age)} years ago")
    if not lic or lic in ("no license file", "NOASSERTION", "unknown"):
        warn.append("it has no clear license")
    if CURL_PIPE_RE.search(info.get("readme") or ""):
        warn.append("its README pipes a download straight into a shell; I did not run that")
    return "ok", warn


CURL_PIPE_RE = re.compile(r"\b(?:curl|wget)\b[^\n|]{0,200}\|\s*(?:sudo\s+)?(?:ba|z)?sh\b", re.I)
FORCE_RE = re.compile(r"\b(?:anyway|regardless|override|even\s+though|despite)\b", re.I)


def _head_sha(dest: Path) -> str:
    """The checked-out commit, read from .git without running git (pins what was installed)."""
    git = dest / ".git"
    try:
        head = (git / "HEAD").read_text(encoding="utf-8").strip()
    except OSError:
        return ""
    if not head.startswith("ref:"):
        return head[:40]
    ref = head.split(None, 1)[1].strip()
    try:
        return (git / ref).read_text(encoding="utf-8").strip()[:40]
    except OSError:
        pass
    try:
        for line in (git / "packed-refs").read_text(encoding="utf-8").splitlines():
            if line.endswith(" " + ref):
                return line.split()[0][:40]
    except OSError:
        pass
    return ""


def install(owner: str, name: str, *, run=_run, get=_get, opened=None, force: bool = False) -> dict:
    slug = f"{owner}/{name}"
    opened = _permissions().open_access() if opened is None else opened
    if not opened:
        return {"ok": True, "op": "install", "tool": "repo", "repo": slug, "task_verified": False, "outcome": "NEEDS_ACTION_DETAILS",
                "spoken": f"Installing {slug} runs its own setup code on your Mac. Say \"permission granted\" and I'll clone and install it."}
    info = look(owner, name, get=get)
    if not info.get("ok"):
        return {**info, "op": "install"}
    verdict, notes = gate(info)
    if verdict == "hold" and not force:
        return {"ok": True, "op": "install", "tool": "repo", "repo": slug, "task_verified": False, "outcome": "HELD",
                "license": info.get("license"),
                "spoken": f"I held {slug}: {notes[0]}. Say \"install {slug} anyway\" if you still want it."}
    root = install_root(); root.mkdir(parents=True, exist_ok=True)
    dest = root / f"{owner}__{name}"
    log: list[str] = []
    if (dest / ".git").is_dir():
        fresh = run(["git", "pull", "--ff-only"], dest, log)
    else:
        fresh = run(["git", "clone", "--depth", "1", f"https://github.com/{slug}.git", str(dest)], root, log)
    if not fresh or not dest.is_dir():
        (root / f"{owner}__{name}.install.log").write_text("\n".join(log), encoding="utf-8")
        return _fail("install", f"I couldn't clone {slug}: {log[-2] if len(log) > 1 else 'git failed'}.")
    done, failed = [], []
    for kind, cmds in plan_install(dest):
        ok = all(run(c, dest, log) for c in cmds)
        (done if ok else failed).append(kind)
    (dest / ".jarvis-install.log").write_text("\n".join(log), encoding="utf-8")
    how = ("Installed " + ", ".join(done) + " dependencies locally." if done else "Nothing to build: no Python, Node, Rust, Go or Swift project files.")
    if failed:
        how += " These steps failed: " + ", ".join(failed) + f"; the log is in {dest / '.jarvis-install.log'}."
    lic = info.get("license") or "no license file"
    sha = _head_sha(dest)
    if sha:
        (dest / ".jarvis-pin").write_text(f"{slug} {sha}\n", encoding="utf-8")
    spoken = (f"Cloned {slug} to {dest}" + (f" at commit {sha[:12]}" if sha else "") + f". {how} License: {lic}."
              + (" Heads up: " + "; ".join(notes) + "." if notes else "")
              + (" The README has its own usage steps; ask me to read them." if info.get("readme") else ""))
    return {"ok": not failed, "op": "install", "tool": "repo", "repo": slug, "path": str(dest), "installed": done, "failed": failed,
            "license": lic, "commit": sha, "warnings": notes, "spoken": spoken,
            "task_verified": bool(done) and not failed, "cites": [str(dest)]}


def install_tool(name: str, manager: str = "", *, run=_run, opened=None, which=shutil.which) -> dict:
    """A CLI/package, kept out of system paths: brew as you would, pip/npm into ~/jarvis-repos/.tools."""
    opened = _permissions().open_access() if opened is None else opened
    if not opened:
        return {"ok": True, "op": "tool", "tool": "repo", "task_verified": False, "outcome": "NEEDS_ACTION_DETAILS",
                "spoken": f"Installing {name} changes your Mac. Say \"permission granted\" and I'll install it."}
    tools = install_root() / ".tools"; tools.mkdir(parents=True, exist_ok=True)
    mgr = TOOL_MANAGERS.get((manager or "").lower(), "")
    if not mgr:
        mgr = "brew" if which("brew") else ("pipx" if which("pipx") else ("npm" if which("npm") else "pip"))
    log: list[str] = []
    if mgr == "brew":
        ok = run(["brew", "install", name], tools, log)
    elif mgr == "pipx":
        ok = run(["pipx", "install", name], tools, log)
    elif mgr == "npm":
        ok = run(["npm", "install", "--prefix", str(tools / "node"), name], tools, log)
    elif mgr == "cargo":
        ok = run(["cargo", "install", "--root", str(tools / "cargo"), name], tools, log)
    else:
        venv_py = tools / "py" / "bin" / "python"
        ok = (venv_py.is_file() or run([sys.executable or "python3", "-m", "venv", str(tools / "py")], tools, log)) \
            and run([str(venv_py), "-m", "pip", "install", name], tools, log)
    (tools / f"{re.sub(r'[^A-Za-z0-9._-]', '_', name)}.install.log").write_text("\n".join(log), encoding="utf-8")
    where = {"npm": tools / "node" / "node_modules" / ".bin", "cargo": tools / "cargo" / "bin", "pip": tools / "py" / "bin"}.get(mgr)
    tail = next((l for l in reversed(log) if l and not l.startswith("exit")), "")
    spoken = (f"Installed {name} with {mgr}." + (f" It lives in {where}." if where else "")) if ok else \
             f"{mgr} could not install {name}: {tail[:160]}"
    return {"ok": ok, "op": "tool", "tool": "repo", "package": name, "manager": mgr, "spoken": spoken, "task_verified": ok}


def run(utterance: str, *, get=_get, runner=_run) -> dict:
    kind = wants(utterance)
    if kind == "tool":
        t = TOOL_RE.match((utterance or "").strip())
        return install_tool(t.group(1), t.group(2) or "", run=runner)
    if kind == "search":
        return search(SEARCH_RE.search(utterance).group(1), get=get)
    spec = parse_spec(utterance)
    if not spec:
        return _fail("look", "Tell me the repo as owner/name or paste its GitHub link.")
    if kind == "install":
        return install(*spec, run=runner, get=get, force=bool(FORCE_RE.search(utterance or "")))
    return look(*spec, get=get)
