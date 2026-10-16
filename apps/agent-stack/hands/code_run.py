"""code_run (FINISH-LIST rank 11): run a small Python snippet + its test in a throwaway sandbox.

macOS sandbox-exec profile: no network, no reads of $HOME (or any /Users, /Volumes) except the fresh scratch
dir, writes only inside that scratch dir. No sandbox-exec -> refused, never run bare. 10 s wall cap; on
timeout the whole process group is killed. System interpreter (-I, never the venv under $HOME), minimal env.
"""
from __future__ import annotations

import os
import re
import signal
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

TIME_CAP = 10
OUT_CAP = 4000
SANDBOX = shutil.which("sandbox-exec")


def _interpreter() -> str:
    # The sandbox denies $HOME, so the venv python under it cannot even start. Use a system interpreter.
    home = os.path.realpath(os.path.expanduser("~"))
    for cand in (os.environ.get("JARVIS_CODE_RUN_PYTHON") or "", "/usr/bin/python3", "/opt/homebrew/bin/python3",
                 "/usr/local/bin/python3", sys.executable):
        if cand and os.path.exists(cand) and not os.path.realpath(cand).startswith(home + os.sep):
            return cand
    return ""


def _q(path: str) -> str:
    return path.replace("\\", "\\\\").replace('"', '\\"')


def _profile(tmp: str) -> str:
    home = os.path.realpath(os.path.expanduser("~"))
    deny_read = "".join(f'(subpath "{_q(p)}")' for p in sorted({home, "/Users", "/Volumes"}))
    scratch = f'(subpath "{_q(tmp)}") (subpath "/private{_q(tmp)}")'
    return (
        "(version 1)(allow default)(deny network*)"
        f"(deny file-read* {deny_read})"
        f"(allow file-read* {scratch})"
        "(deny file-write*)"
        f'(allow file-write* {scratch} (literal "/dev/null") (literal "/dev/tty"))'
    )


def _cap(text: str) -> str:
    text = text or ""
    return text if len(text) <= OUT_CAP else text[:OUT_CAP] + "…"


def run(args: dict | None = None) -> dict:
    args = args or {}
    code = str(args.get("code") or "")
    test = str(args.get("test") or "")
    if not code.strip():
        return {"ok": False, "ran": False, "passed": False, "timed_out": False, "stdout": "", "stderr": "",
                "spoken": "I can run Python in a sandbox, but this ask has no code in it. Paste the code (and a test) to run it."}
    py = _interpreter()
    if not SANDBOX or not py:
        why = "sandbox-exec is missing" if not SANDBOX else "no system Python outside your home folder"
        return {"ok": False, "ran": False, "passed": False, "timed_out": False, "stdout": "", "stderr": "",
                "sandboxed": False, "spoken": f"I won't run code here: {why}, so I can't sandbox it. Nothing ran."}
    tmp = os.path.realpath(tempfile.mkdtemp(prefix="jarvis-code-"))
    try:
        (Path(tmp) / "main.py").write_text(code + ("\n\n" + test if test else "") + "\n", encoding="utf-8")
        cmd = [SANDBOX, "-p", _profile(tmp), py, "-I", "main.py"]
        env = {"PATH": "/usr/bin:/bin", "HOME": tmp, "TMPDIR": tmp, "PYTHONDONTWRITEBYTECODE": "1"}
        t0 = time.monotonic()
        proc = subprocess.Popen(cmd, cwd=tmp, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                text=True, start_new_session=True)
        try:
            out, err = proc.communicate(timeout=TIME_CAP)
            rc, timed = proc.returncode, False
        except subprocess.TimeoutExpired:
            try:
                os.killpg(proc.pid, signal.SIGKILL)  # the whole group: a forked child must not outlive the cap
            except ProcessLookupError:
                pass
            out, err = proc.communicate()
            rc, timed = -9, True  # keep whatever it printed before the cap (honesty audit 2026-10-16)
        ms = int((time.monotonic() - t0) * 1000)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    passed = rc == 0 and not timed
    if timed:
        tail = (err or out or "").strip()[-200:]
        sp = f"The code ran past the {TIME_CAP} second cap, so I stopped it. It did not pass." + (f" Last output: {tail}" if tail else "")
    elif passed:
        sp = "It ran in the sandbox and passed" + (" its test." if test else ".") + (f" Output: {out.strip()[:200]}" if out.strip() else "")
    else:
        last = (err.strip().splitlines() or ["no error text"])[-1][:200]
        sp = f"It ran in the sandbox and failed: {last}" + (f" It printed: {out.strip()[:160]}" if out.strip() else "")
    # ok means the code ran and passed; a failed or timed-out run is not a finished task.
    return {"ok": passed, "ran": True, "passed": passed, "timed_out": timed, "rc": rc, "ms": ms,
            "stdout": _cap(out), "stderr": _cap(err), "sandboxed": True, "spoken": sp}


_FENCE = re.compile(r"```(?:python|py)?\s*\n(.*?)```", re.S | re.I)
_INLINE = re.compile(r"\brun\s+this\s+python\b[^:\n]{0,40}:\s*(.+)$", re.I | re.S)


def args_from_utterance(u: str) -> dict:
    s = u or ""
    m = _FENCE.search(s) or _INLINE.search(s)
    return {"code": m.group(1).strip()} if m else {}


def log_meta(got: dict) -> dict:
    g = got or {}
    return {"ok": bool(g.get("ok")), "ran": bool(g.get("ran")), "passed": bool(g.get("passed")),
            "timed_out": bool(g.get("timed_out")), "ms": g.get("ms")}
