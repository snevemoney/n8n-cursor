"""Concurrency audit 2026-10-16: Stop from any copy of online.py kills a Cursor process started by another copy,
children included (the pipeline, the mouth and the Face each load their own copy)."""
import importlib.util
import os
import subprocess
import sys
import time
import unittest
from pathlib import Path

STACK = Path(__file__).resolve().parents[1]


def _copy(name):
    spec = importlib.util.spec_from_file_location(name, STACK / "brain" / "online.py")
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod


@unittest.skipUnless(hasattr(os, "killpg"), "process groups")
class CursorCancelRegistry(unittest.TestCase):
    def test_cancel_from_another_copy_kills_the_whole_group(self):
        a, b = _copy("agent_stack_online_copy_a"), _copy("agent_stack_online_copy_b")
        proc = subprocess.Popen([sys.executable, "-c", "import subprocess,time; subprocess.Popen(['sleep','30']); time.sleep(30)"],
                                start_new_session=True)
        seq = a._register(proc)
        try:
            time.sleep(0.3)
            self.assertTrue(b.cancel_cursor())
            proc.wait(timeout=5)
            self.assertTrue(a._cancelled_since(seq))
            deadline, live = time.time() + 3, ["?"]
            while live and time.time() < deadline:  # SIGKILL is asynchronous; a killed orphan may linger as a zombie
                rows = subprocess.run(["ps", "-o", "pid=,stat=", "-g", str(proc.pid)], capture_output=True, text=True).stdout
                live = [r for r in rows.splitlines() if r.split() and not r.split()[-1].startswith("Z")]
                time.sleep(0.1)
            self.assertEqual(live, [])  # the grandchild died with the group
        finally:
            a._unregister(proc)
            if proc.poll() is None:
                proc.kill()


if __name__ == "__main__":
    unittest.main()
