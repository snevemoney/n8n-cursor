"""Score30 2026-10-15 16:57: with JARVIS_READ_ROOTS=/ (Evens-approved read-anywhere), 'Read the first line of README.md
in your repo' said not found and 'what repo and branch' said not a git repo: the env var replaced the running repo as
root 1. It must add folders; the running repo stays first."""
import importlib.util
import os
import sys
import unittest
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("wr_env_roots", Path(__file__).with_name("workspace_read.py"))
W = importlib.util.module_from_spec(spec)
sys.modules["wr_env_roots"] = W
spec.loader.exec_module(W)
RUNNING = Path(__file__).resolve().parents[3]


class EnvRootsAdd(unittest.TestCase):
    def test_slash_adds_after_running_repo(self):
        with mock.patch.dict(os.environ, {"JARVIS_READ_ROOTS": "/"}):
            roots = W._base_roots()
        self.assertEqual(roots[0], RUNNING)
        self.assertIn(Path("/"), roots)

    def test_relative_readme_resolves_in_running_repo(self):
        with mock.patch.dict(os.environ, {"JARVIS_READ_ROOTS": "/"}):
            path, err = W._resolve("README.md", W._roots(None))
        self.assertEqual(path, RUNNING / "README.md", err)


if __name__ == "__main__":
    unittest.main()
