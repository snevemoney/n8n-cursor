"""Live 2026-10-15: 'What repos do you have installed' -> 'Local repos: jarvis-main.' while access was closed, as if
that were every repo on the Mac. Closed answers say where they looked and how to widen it."""
import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("wr_repos", Path(__file__).with_name("workspace_read.py"))
W = importlib.util.module_from_spec(spec)
sys.modules["wr_repos"] = W
spec.loader.exec_module(W)


class ReposListing(unittest.TestCase):
    def _root(self, tmp):
        r = Path(tmp).resolve()
        (r / "jarvis-main" / ".git").mkdir(parents=True)
        return r

    def test_closed_answer_names_scope_and_grant(self):
        with tempfile.TemporaryDirectory() as t, mock.patch.object(W, "open_access", return_value=False):
            got = W.run({"op": "repos"}, roots=[self._root(t)])
        self.assertIn("jarvis-main", got["spoken"])
        self.assertIn("permission granted", got["spoken"])

    def test_open_answer_has_no_grant_hint(self):
        with tempfile.TemporaryDirectory() as t, mock.patch.object(W, "open_access", return_value=True):
            got = W.run({"op": "repos"}, roots=[self._root(t)])
        self.assertNotIn("permission granted", got["spoken"])


if __name__ == "__main__":
    unittest.main()
