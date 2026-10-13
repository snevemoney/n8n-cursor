#!/usr/bin/env python3
"""launchd starts Face with no PYTHONPATH. A `from hands.x import y` works in a shell and crashes there."""
from __future__ import annotations

import ast
import os
import socket
import subprocess
import sys
import tempfile
import time
import unittest
import urllib.request
from pathlib import Path

STACK = Path(__file__).resolve().parents[1]
PACKAGES = ("hands", "brain", "memory", "mouth", "face")


def _bare_env(**extra: str) -> dict:
    # What launchd gives the job: HOME and a plain PATH. No PYTHONPATH, no venv.
    env = {"HOME": tempfile.mkdtemp(prefix="jarvis-launchd-home-"), "PATH": "/usr/bin:/bin:/usr/sbin:/sbin"}
    env.update(extra)
    return env


class LaunchdStartTest(unittest.TestCase):
    def test_no_package_style_imports_of_stack_folders(self) -> None:
        bad = []
        for pkg in PACKAGES:
            for path in (STACK / pkg).glob("*.py"):
                tree = ast.parse(path.read_text(encoding="utf-8"))
                # A package-style import with an `except ImportError` path-load fallback is launchd-safe.
                guarded = {id(n) for t in ast.walk(tree) if isinstance(t, ast.Try)
                           and any(isinstance(h.type, ast.Name) and h.type.id in ("ImportError", "ModuleNotFoundError")
                                   for h in t.handlers)
                           for b in t.body for n in ast.walk(b)}
                for node in ast.walk(tree):
                    if id(node) in guarded:
                        continue
                    if isinstance(node, ast.ImportFrom) and (node.module or "").split(".")[0] in PACKAGES and node.level == 0:
                        bad.append(f"{path.relative_to(STACK)}:{node.lineno} from {node.module}")
                    if isinstance(node, ast.Import):
                        bad += [f"{path.relative_to(STACK)}:{node.lineno} import {a.name}" for a in node.names
                                if a.name.split(".")[0] in PACKAGES]
        self.assertEqual(bad, [])

    def test_no_hands_module_shadows_a_stack_package(self) -> None:
        self.assertFalse((STACK / "hands" / "memory.py").exists())

    def test_pipeline_and_craft_load_without_pythonpath(self) -> None:
        code = (
            "import importlib.util, sys\n"
            "spec = importlib.util.spec_from_file_location('pl', sys.argv[1])\n"
            "m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)\n"
            "print(m.CRAFT._LIST_METHOD)\n"
        )
        out = subprocess.run([sys.executable, "-c", code, str(STACK / "brain" / "pipeline.py")], cwd="/",
                             env=_bare_env(AGENT_STACK_DRY_TTS="1", JARVIS_TURN_LOG="0"),
                             capture_output=True, text=True, timeout=60)
        self.assertEqual(out.returncode, 0, out.stderr[-2000:])
        self.assertIn("tools/list", out.stdout)

    def test_face_serves_healthz_without_pythonpath(self) -> None:
        with socket.socket() as s:
            s.bind(("127.0.0.1", 0))
            port = s.getsockname()[1]
        env = _bare_env(AGENT_STACK_FACE_PORT=str(port), AGENT_STACK_DRY_TTS="1", JARVIS_TURN_LOG="0")
        proc = subprocess.Popen([sys.executable, "face/serve.py"], cwd=STACK, env=env,
                                stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
        try:
            ok = False
            for _ in range(60):
                if proc.poll() is not None:
                    break
                try:
                    with urllib.request.urlopen(f"http://127.0.0.1:{port}/healthz", timeout=1) as res:
                        ok = res.status == 200
                        break
                except OSError:
                    time.sleep(0.5)
            self.assertTrue(ok, f"Face did not serve healthz without PYTHONPATH (exit {proc.poll()})")
            self.assertIsNone(proc.poll())
        finally:
            proc.terminate()
            try:
                _, err = proc.communicate(timeout=10)
            except subprocess.TimeoutExpired:
                proc.kill()
                err = ""
        self.assertNotIn("ModuleNotFoundError", err or "")


if __name__ == "__main__":
    unittest.main()
