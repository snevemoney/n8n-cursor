"""Live 2026-10-15 05:25: a 29-minute coding run ended FAILED because one read-only `git rev-parse --verify HEAD` in its
working copy timed out once (Mac briefly overloaded, disk ~96%); the same command took 13 ms afterwards.
Read-only git probes retry once after a timeout; writing commands never retry."""
import importlib.util
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("at_retry", Path(__file__).with_name("agent_tools.py"))
A = importlib.util.module_from_spec(spec)
sys.modules["at_retry"] = A
spec.loader.exec_module(A)


class GitRetry(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = Path(self.tmp.name)
        (self.repo / ".git").mkdir()
        self.meta = mock.patch.object(A, "_code_git_metadata", return_value={})
        self.meta.start()

    def tearDown(self):
        self.meta.stop(); self.tmp.cleanup()

    def test_read_only_probe_retries_once(self):
        ok = subprocess.CompletedProcess([], 0, "abc\n", "")
        with mock.patch.object(A.subprocess, "run", side_effect=[subprocess.TimeoutExpired("git", 30), ok]) as run:
            got = A._git(self.repo, "rev-parse", "--verify", "HEAD")
        self.assertEqual(got.stdout, "abc\n"); self.assertEqual(run.call_count, 2)

    def test_writing_command_never_retries(self):
        with mock.patch.object(A.subprocess, "run", side_effect=subprocess.TimeoutExpired("git", 30)) as run:
            with self.assertRaises(subprocess.TimeoutExpired):
                A._git(self.repo, "commit", "-m", "x")
        self.assertEqual(run.call_count, 1)


if __name__ == "__main__":
    unittest.main()
