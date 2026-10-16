"""skills — Jarvis's read-only skill hand (CANDIDATE).

ops: list (names + one-line descriptions from SKILL.md frontmatter), read (one skill's text, capped 16 KB).
A skill is read only by a name found in the listing, so ../ and absolute paths are refused.
"""
from __future__ import annotations

import os
import re
import sys
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
    # Same capabilities as the other platforms (Evens 2026-10-15): the Hive shared skill library every desk uses,
    # other agents' skill folders, and every installed Claude plugin's skills.
    candidates += [repo / "docs" / "hive" / "outer-heaven" / "CONTENT" / "os" / "shared" / "skills",
                   home / ".agents" / "skills", home / ".grok" / "skills", home / ".grok-shared" / "skills",
                   home / ".gemini" / "skills", home / ".config" / "opencode" / "skills"]
    plugins = home / ".claude" / "plugins"
    if plugins.is_dir():
        for pattern in ("*/skills", "*/*/skills", "*/*/*/skills", "*/*/*/*/skills"):
            candidates += sorted(plugins.glob(pattern))[:200]
    seen, out = set(), []
    for root in candidates:
        if root.is_dir() and root.resolve() not in seen:
            seen.add(root.resolve()); out.append(root)
    return out


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
    out = {}
    for m in _FIELD.finditer(block):
        val = m.group(2).strip("\"'")
        if val in (">", ">-", "|", "|-", ">+", "|+"):  # YAML block scalar: join the indented lines that follow
            rest = block[m.end():].splitlines()[1:]
            val = " ".join(l.strip() for l in __import__("itertools").takewhile(lambda l: l.startswith((" ", "\t")), rest))
        out[m.group(1)] = val
    return out


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
        query=str((args or {}).get('query') or '')[:200]
        terms=set(re.findall(r'[\w-]{3,}',query.casefold()))
        if terms:
            def score(row):
                name=row['name'].casefold();description=row['description'].casefold()
                return sum(3*(term in name)+(term in description) for term in terms)
            skills=sorted((row for row in skills if score(row)),key=lambda row:(-score(row),row['name']))
        names = [s["name"] for s in skills]
        sp = (f"I have {len(names)} skills, for example: " + ", ".join(names[:MAX_SPOKEN]) + "."
              if names else "No installed skills matched those terms." if query else "I found no skills in my skill folders.")
        return {"ok": True, "op": op, "skills": skills, "spoken": sp,
                "inventory_total":len(found),"query":query}
    if op == "read":
        name = str((args or {}).get("name") or "").strip()
        if name == "#first" and found:
            name = sorted(found)[0]
        canonical = resolve_name(found,name)
        hit = found.get(canonical)
        if hit is None:
            return {"ok": False, "op": op, "error": "unknown skill", "spoken": "I can't read that: I have no skill by that name."}
        name=canonical
        try:
            with open(hit[0], "rb") as fh:
                data = fh.read(MAX_BYTES + 1)
        except OSError:
            return {"ok": False, "op": op, "error": "unreadable", "spoken": "I can't read that: the skill file can't be opened."}
        text = data[:MAX_BYTES].decode("utf-8", "ignore")
        step = first_step(text)
        return {"ok": True, "op": op, "name": name, "text": text, "truncated": len(data) > MAX_BYTES, "first_step": step,
                "spoken": f"The {name} skill: {hit[1] or 'no description'}."
                          + (f" Its first step: {step}" if step else " It lists no numbered steps.")}
    if op == "run":
        if (args or {}).get("all"):
            return run_all(found, str((args or {}).get("name") or ""))
        return run_step(found, str((args or {}).get("name") or ""), int((args or {}).get("step") or 1))
    return {"ok": False, "op": op, "error": "unknown op", "spoken": "I can't read that: unknown skills op."}


_NUMBERED = re.compile(r"^\s*(\d+)[.)]\s*(.{4,300})$", re.M)
_CMD = re.compile(r"`([^`]{2,160})`")


def resolve_name(found, name):
    """Resolve only an unambiguous installed name or directory alias; never a path."""
    if not name or '/' in name or '\\' in name or name in {'.','..'}:
        return None
    if name in found:
        return name
    normal=lambda value: re.sub(r'[\s_-]+',' ',str(value).casefold()).strip()
    key=normal(name)
    matches=[n for n,(path,_) in found.items() if key in {normal(n),normal(path.parent.name)}]
    return matches[0] if len(matches)==1 else None


def _agent_tools():
    import importlib.util as _u
    key = "agent_stack_agent_tools"
    if key not in sys.modules:
        spec = _u.spec_from_file_location(key, STACK / "hands" / "agent_tools.py")
        mod = _u.module_from_spec(spec); sys.modules[key] = mod; spec.loader.exec_module(mod)
    return sys.modules[key]


def run_step(found: dict, name: str, step: int = 1) -> dict[str, Any]:
    """Execute one numbered step of a skill. Only a backticked command on the read-only CLI allowlist
    (agent_tools.op_cli: git log/diff/status..., gh view/list...) is ever run; anything else is held, not run."""
    canonical=resolve_name(found,name)
    hit = found.get(canonical)
    if hit is None:
        return {"ok": False, "op": "run", "verified": False, "spoken": "I can't run that: I have no skill by that name."}
    name=canonical
    body = re.sub(r"\A---.*?\n---\s*\n", "", hit[0].read_text(errors="ignore")[:MAX_BYTES], flags=re.S)
    steps = {int(n): t.strip() for n, t in reversed(_NUMBERED.findall(body))}
    text = steps.get(step)
    if not text:
        return {"ok": False, "op": "run", "name": name, "verified": False, "spoken": f"The {name} skill has no step {step}."}
    cmds = _CMD.findall(text)
    if not cmds:
        return {"ok": False, "op": "run", "name": name, "step": step, "step_text": text, "verified": False,
                "spoken": f"Step {step} of {name} is \"{text[:160]}\". It has no command I can run, so nothing was run."}
    # Mac review 2026-10-16: only the first command of a step ran. Every command runs in order; the first that cannot
    # run (shell syntax, not on the read-only list) or exits non-zero stops the step, and the receipt says which.
    import shlex
    ran, outs = [], []
    for cmd in (c.strip() for c in cmds[:6]):
        if re.search(r"[<>|;&$]", cmd):
            return {"ok": False, "op": "run", "name": name, "step": step, "command": cmd, "ran": ran, "verified": False,
                    "output": "\n".join(outs),
                    "spoken": f"Step {step} of {name} is `{cmd}`; it has a placeholder or shell syntax, so I didn't run it."
                              + (f" Already ran: {', '.join(ran)}." if ran else "")}
        try:
            argv = shlex.split(cmd)
        except ValueError:
            argv = []
        got = _agent_tools().op_cli(argv, closed=True)  # skill files are third-party text: the read-only list only
        if got.get("gated") or not got.get("ok"):
            return {"ok": False, "op": "run", "name": name, "step": step, "command": cmd, "ran": ran, "verified": False,
                    "gated": bool(got.get("gated")), "output": "\n".join(outs), "exit": got.get("exit"),
                    "spoken": f"Step {step} of {name} is `{cmd}`. Not run: {got.get('spoken')}"}
        ran.append(cmd)
        outs.append(str(got.get("output") or "").strip())
        if got.get("exit") not in (0, None):
            break
    out = "\n".join(o for o in outs if o)
    exit_code = got.get("exit")
    cmd_line = "`, `".join(ran)
    return {"ok": True, "op": "run", "name": name, "step": step, "command": ran[-1], "commands": ran, "verified": exit_code == 0,
            "exit": exit_code, "output": out,
            "spoken": f"Ran step {step} of the {name} skill: `{cmd_line}` (exit {exit_code}). Output: " + (out[:700] or "(empty)")}


def run_all(found: dict, name: str, max_steps: int = 12) -> dict[str, Any]:
    """Run a skill's numbered steps in order. Stops at the first step that has no runnable command, is held or fails;
    the receipt lists the steps done and the one it stopped on, so nothing is reported as finished that was not."""
    hit = found.get(name) if name and "/" not in name and "\\" not in name and name not in (".", "..") else None
    if hit is None:
        return {"ok": False, "op": "run", "verified": False, "spoken": "I can't run that: I have no skill by that name."}
    body = re.sub(r"\A---.*?\n---\s*\n", "", hit[0].read_text(errors="ignore")[:MAX_BYTES], flags=re.S)
    numbers = sorted({int(n) for n, _ in _NUMBERED.findall(body)})[:max_steps]
    if not numbers:
        return {"ok": False, "op": "run", "name": name, "verified": False, "spoken": f"The {name} skill lists no numbered steps."}
    done, last = [], {}
    for n in numbers:
        last = run_step(found, name, n)
        if not last.get("ok") or not last.get("verified"):
            return {**last, "steps_done": done, "stopped_at": n, "steps_total": len(numbers), "verified": False,
                    "ok": False,
                    "spoken": (f"Ran {len(done)} of {len(numbers)} steps of {name}; stopped at step {n}. " if done else "")
                              + str(last.get("spoken") or "")}
        done.append(n)
    return {**last, "steps_done": done, "steps_total": len(numbers), "verified": True, "ok": True,
            "spoken": f"Ran all {len(numbers)} steps of the {name} skill. Last: " + str(last.get("spoken") or "")}


_READ = re.compile(r"\b(?:read|open|show)\s+(?:me\s+)?(?:the\s+)?([\w][\w .\-]{0,100}?)\s+skill\b"
                   r"|\b(?:run|show|check)\s+(?:me\s+)?(?:the\s+)?([\w.\-]+)\s+workflow\b", re.I)


_FIRST = re.compile(r"\b(?:read|open|show)\b.{0,20}\b(?:the\s+)?first\s+(?:one|skill)\b", re.I)
_STEP = re.compile(r"^\s*(?:1[.)]|step\s*1\b[:.)]?|-\s+\[?\s?\]?)\s*(.{4,240})$", re.I | re.M)


def first_step(text: str) -> str:
    body = re.sub(r"\A---.*?\n---\s*\n", "", text or "", flags=re.S)
    m = _STEP.search(body)
    return m.group(1).strip().rstrip(".") + "." if m else ""


_RUN = re.compile(r"\brun\b(?:\s+(?:the\s+)?(?:(first|1st|second|2nd|third|3rd)|step\s+(\d+))\s*(?:step)?\s+of)?"
                  r"(?:\s+(?:all(?:\s+the)?\s+steps|every\s+step)\s+of)?\s+(?:the\s+|my\s+)?(?:whole\s+|entire\s+)?([\w.\-]+)\s+skill\b", re.I)
_ALL = re.compile(r"\b(?:all(?:\s+the)?\s+steps|every\s+step|whole|entire|end\s+to\s+end|all\s+of\s+it)\b", re.I)
_ORD = {"first": 1, "1st": 1, "second": 2, "2nd": 2, "third": 3, "3rd": 3}


def args_from_utterance(u: str) -> dict:
    # Inventory requests are discovery, not an invented skill named "local".
    # Preserve the requested first operation rather than matching a later clause.
    if re.match(r'^\s*(?:please\s+)?list\b',u or '',re.I) and re.search(r'\bskills\b',u or '',re.I):
        return {'op':'list'}
    r = _RUN.search(u or "")
    if r:
        if not (r.group(1) or r.group(2)) and _ALL.search(u or ""):
            return {"op": "run", "name": r.group(3), "all": True}
        return {"op": "run", "name": r.group(3), "step": int(r.group(2) or _ORD.get((r.group(1) or "first").lower(), 1))}
    if _FIRST.search(u or ""):
        return {"op": "read", "name": "#first"}
    m = _READ.search(u or "")
    return {"op": "read", "name": m.group(1) or m.group(2)} if m else {"op": "list"}


def log_meta(result: dict) -> dict:
    """Metadata only: op, ok, counts. Never skill text."""
    r = result or {}
    return {"op": r.get("op"), "ok": bool(r.get("ok")), "skills": len(r.get("skills") or []), "ran": r.get("op") == "run" and bool(r.get("verified")),
            "chars": len(str(r.get("text") or "")), "truncated": bool(r.get("truncated"))}
