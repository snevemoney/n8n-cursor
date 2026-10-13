"""Workbench hand: real repo work in an allowed workspace, like Claude Code / Codex / Cursor.

One ask -> new branch (never main) -> builder model writes code + test -> files written in the workspace ->
tests run in the code_run sandbox (no network, no $HOME reads) -> commit on that branch only if they pass.
Never pushes, never merges, never touches main. Every step goes through hands/permissions.decide and is logged.
Default workspace: the scratch repo ~/jarvis-scratch (JARVIS_SCRATCH_ROOTS), created with git init if missing.
"""
from __future__ import annotations

import importlib.util
import re
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
WANT_RE = re.compile(r"\b(?:scratch\s+repo|(?:on|in)\s+a\s+(?:new\s+)?branch)\b.{0,160}\b(?:commit|tests?)\b"
                     r"|\b(?:commit|tests?)\b.{0,160}\b(?:scratch\s+repo|on\s+a\s+(?:new\s+)?branch)\b", re.I | re.S)
MODE_RE = re.compile(r"\b(turn|switch|set)\s+(on|off)\s+auto[- ]?accept(?:\s+edits)?\b|\bauto[- ]?accept(?:\s+edits)?\s+(on|off)\b", re.I)


def _mod(name: str):
    key = f"agent_stack_{name}"
    if key not in sys.modules:
        spec = importlib.util.spec_from_file_location(key, HERE / f"{name}.py")
        mod = importlib.util.module_from_spec(spec)
        sys.modules[key] = mod
        spec.loader.exec_module(mod)
    return sys.modules[key]


def PERM():
    return _mod("permissions")


def wants_workbench(u: str) -> bool:
    return bool(WANT_RE.search(u or ""))


def wants_mode(u: str) -> bool:
    return bool(MODE_RE.search(u or ""))


def set_mode(u: str) -> dict:
    m = MODE_RE.search(u or "")
    on = ((m.group(2) or m.group(3) or "").lower() == "on") if m else False
    PERM().set_auto_accept(on)
    return {"ok": True, "auto_accept_edits": on,
            "spoken": ("Auto-accept edits is on: I'll edit files in your allowed workspaces and run authored code in the "
                       "sandbox without asking. Sends, spend, deletes outside scratch, merges, pushes, deploys and secrets "
                       "still need your confirm.") if on else
                      "Auto-accept edits is off: outside the scratch repo, edits and authored code wait for your confirm."}


def _git(repo: Path, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True, timeout=30)


def ensure_repo(repo: Path) -> None:
    repo.mkdir(parents=True, exist_ok=True)
    if not (repo / ".git").exists():
        _git(repo, "init", "-q", "-b", "main")
        (repo / "README.md").write_text("# jarvis-scratch\nJarvis's scratch repo. Branches only; nothing is pushed.\n")
        _git(repo, "add", "README.md")
        _git(repo, "-c", "user.name=Jarvis", "-c", "user.email=jarvis@localhost", "commit", "-q", "-m", "scratch: init")


def _slug(u: str) -> str:
    words = [w for w in re.findall(r"[a-z0-9]+", (u or "").lower()) if w not in {"in", "my", "on", "a", "new", "the", "and",
             "with", "it", "run", "commit", "scratch", "repo", "branch", "add", "tests", "test", "function"}]
    return "-".join(words[:4]) or "task"


def run(utterance: str, *, chat=None) -> dict:
    P = PERM()
    repo = P.scratch_roots()[0]
    steps: list[str] = []
    ensure_repo(repo)
    branch = f"jarvis/{_slug(utterance)}-{time.strftime('%H%M%S')}"
    if P.decide("git_branch", branch) != "allow":
        P.log_action("git_branch", branch, "confirm")
        return {"ok": False, "spoken": f"Branch {branch} needs your confirm. Nothing changed."}
    _git(repo, "checkout", "-q", "main")
    made = _git(repo, "checkout", "-q", "-b", branch)
    P.log_action("git_branch", f"{repo.name}:{branch}", "allow", rc=made.returncode)
    if made.returncode != 0:
        return {"ok": False, "spoken": f"I couldn't create branch {branch} in {repo.name}. Nothing else ran."}
    steps.append(f"made branch {branch}")
    ca = _mod("code_author")
    talk = chat or ca.CHAT
    text = talk(ca.BUILDER, "Write Python for this request. Reply with exactly two fenced python blocks: first the module "
                            "code, then a short test using plain assert statements that calls the code directly (no imports "
                            "of the module, no I/O, no network).\nRequest: " + utterance)
    blocks = ca._FENCE.findall(text or "")
    if len(blocks) < 2 and chat is None:
        text = talk(ca.critic_for(ca.BUILDER), "Reply with exactly two fenced python blocks (code, then plain-assert test) for: "
                    + utterance)
        blocks = ca._FENCE.findall(text or "")
    if len(blocks) < 2:
        _git(repo, "checkout", "-q", "main"); _git(repo, "branch", "-q", "-D", branch)
        P.log_action("author", branch, "fail")
        return {"ok": False, "spoken": "The builder model gave no code and test this turn, so I removed the empty branch. Nothing was committed."}
    code, test = blocks[0].strip(), blocks[1].strip()
    name = (re.search(r"^\s*def\s+(\w+)", code, re.M) or re.search(r"(\w+)", code)).group(1)
    files = {f"{name}.py": code + "\n", f"test_{name}.py": f"from {name} import *  # noqa: F403\n\n" + test + "\n"}
    for rel, body in files.items():
        dest = repo / rel
        if P.decide("edit", str(dest)) != "allow":
            P.log_action("edit", str(dest), "confirm")
            return {"ok": False, "spoken": f"Writing {rel} needs your confirm. I stopped on branch {branch}."}
        dest.write_text(body, encoding="utf-8")
        P.log_action("edit", f"{repo.name}/{rel}", "allow", bytes=len(body))
    steps.append(f"wrote {name}.py and test_{name}.py")
    got = _mod("code_run").run({"code": code, "test": test})
    P.log_action("run_sandbox", f"{repo.name}/test_{name}.py", "allow", passed=bool(got.get("passed")))
    if not got.get("passed"):
        steps.append("tests failed in the sandbox")
        return {"ok": True, "branch": branch, "committed": False, "passed": False,
                "spoken": f"In {repo.name}: " + "; ".join(steps) + f". {got.get('spoken')} I did not commit."}
    steps.append("tests passed in the sandbox")
    _git(repo, "add", *files)
    c = _git(repo, "-c", "user.name=Jarvis", "-c", "user.email=jarvis@localhost", "commit", "-q", "-m",
             f"jarvis: {name} with test ({utterance[:60]})")
    sha = _git(repo, "rev-parse", "--short", "HEAD").stdout.strip()
    P.log_action("git_commit", f"{repo.name}:{branch}", "allow", rc=c.returncode, sha=sha)
    if c.returncode != 0:
        return {"ok": False, "spoken": f"In {repo.name}: " + "; ".join(steps) + ". The commit failed, so nothing is committed."}
    steps.append(f"committed {sha} on {branch}")
    return {"ok": True, "branch": branch, "committed": True, "passed": True, "sha": sha, "repo": str(repo),
            "spoken": f"Done in {repo.name}: " + "; ".join(steps) + ". Not pushed; main is untouched."}


def log_meta(got: dict) -> dict:
    return {"ok": bool(got.get("ok")), "committed": bool(got.get("committed")), "passed": bool(got.get("passed"))}
