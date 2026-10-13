"""code_run (FINISH-LIST rank 11): run a small Python snippet + its test in a throwaway sandbox.

macOS sandbox-exec profile: no network, writes only inside a fresh temp dir. 10 s wall cap.
Isolated interpreter (-I), minimal env (no keys). Returns pass/fail + capped stdout/stderr.
"""
from __future__ import annotations

import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

TIME_CAP = 10
OUT_CAP = 4000
SANDBOX = shutil.which("sandbox-exec")


def _profile(tmp: str) -> str:
    return (
        "(version 1)(allow default)(deny network*)"
        "(deny file-write*)"
        f'(allow file-write* (subpath "{tmp}") (subpath "/private{tmp}") (literal "/dev/null") (literal "/dev/tty"))'
    )


def _cap(text: str) -> str:
    text = text or ""
    return text if len(text) <= OUT_CAP else text[:OUT_CAP] + "…"


def run(args: dict | None = None) -> dict:
    args = args or {}
    code = str(args.get("code") or "")
    test = str(args.get("test") or "")
    if not code.strip():
        return {"ok": True, "ran": False, "passed": False, "timed_out": False, "stdout": "", "stderr": "",
                "spoken": "I can run Python in a sandbox, but this ask has no code in it. Paste the code (and a test) and I'll run it."}
    tmp = os.path.realpath(tempfile.mkdtemp(prefix="jarvis-code-"))
    try:
        (Path(tmp) / "main.py").write_text(code + ("\n\n" + test if test else "") + "\n", encoding="utf-8")
        cmd = [sys.executable, "-I", "main.py"]
        if SANDBOX:
            cmd = [SANDBOX, "-p", _profile(tmp)] + cmd
        env = {"PATH": "/usr/bin:/bin", "HOME": tmp, "TMPDIR": tmp, "PYTHONDONTWRITEBYTECODE": "1"}
        t0 = time.monotonic()
        try:
            r = subprocess.run(cmd, cwd=tmp, env=env, capture_output=True, text=True, timeout=TIME_CAP)
            rc, out, err, timed = r.returncode, r.stdout, r.stderr, False
        except subprocess.TimeoutExpired as exc:
            rc, out, err, timed = -9, (exc.stdout or b"").decode("utf-8", "replace") if isinstance(exc.stdout, bytes) else (exc.stdout or ""), "", True
        ms = int((time.monotonic() - t0) * 1000)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    passed = rc == 0 and not timed
    if timed:
        sp = f"The code ran past the {TIME_CAP} second cap, so I stopped it. It did not pass."
    elif passed:
        sp = "It ran in the sandbox and passed" + (" its test." if test else ".") + (f" Output: {out.strip()[:200]}" if out.strip() else "")
    else:
        last = (err.strip().splitlines() or ["no error text"])[-1][:200]
        sp = f"It ran in the sandbox and failed: {last}"
    return {"ok": True, "ran": True, "passed": passed, "timed_out": timed, "rc": rc, "ms": ms,
            "stdout": _cap(out), "stderr": _cap(err), "sandboxed": bool(SANDBOX), "spoken": sp}


_FENCE = re.compile(r"```(?:python|py)?\s*\n(.*?)```", re.S | re.I)
_INLINE = re.compile(r"\brun\s+this\s+python\s*:\s*(.+)$", re.I | re.S)


def args_from_utterance(u: str) -> dict:
    s = u or ""
    m = _FENCE.search(s) or _INLINE.search(s)
    return {"code": m.group(1).strip()} if m else {}


def log_meta(got: dict) -> dict:
    g = got or {}
    return {"ok": bool(g.get("ok")), "ran": bool(g.get("ran")), "passed": bool(g.get("passed")),
            "timed_out": bool(g.get("timed_out")), "ms": g.get("ms")}
