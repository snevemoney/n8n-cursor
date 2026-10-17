"""Evens 10-15 ("What repos do you have installed", asked 3x): Jarvis said only jarvis-main though ~/tools holds ~30
cloned repos. Repos two levels down are listed; worktrees (.git file), hidden and Library folders are not."""
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


class RepoDepth(unittest.TestCase):
    def test_nested_repos_listed_worktrees_skipped(self):
        with tempfile.TemporaryDirectory() as t:
            home = Path(t)
            for d in ["jarvis-main", "tools/ECC", "tools/context7", "projects/clipengine", ".codex/memories", "Library/x/y"]:
                (home / d / ".git").mkdir(parents=True)
            (home / "jarvis-cowork/claude-a").mkdir(parents=True)
            (home / "jarvis-cowork/claude-a/.git").write_text("gitdir: elsewhere")
            with mock.patch.object(W, "open_access", return_value=True):
                out = W.run({"op": "repos"}, roots=[home])
        self.assertEqual(sorted(Path(n).name for n in out["names"]), ["ECC", "clipengine", "context7", "jarvis-main"])
        self.assertIn("4", out["spoken"])

    def test_slow_walk_answers_partial(self):
        with tempfile.TemporaryDirectory() as t:
            (Path(t) / "a" / ".git").mkdir(parents=True)
            with mock.patch.object(W, "open_access", return_value=True), mock.patch.object(W, "REPO_BUDGET_S", -1):
                out = W.run({"op": "repos"}, roots=[Path(t)])
        self.assertIn("partial", out["spoken"])

    def test_root_slash_is_not_walked(self):
        with mock.patch.object(W, "_repos_under", side_effect=lambda r, d, dl=None: []) as walk, \
                mock.patch.object(W, "open_access", return_value=True):
            W.run({"op": "repos"}, roots=[Path("/"), Path.home()])
        self.assertNotIn(Path("/"), [c.args[0] for c in walk.call_args_list])

    def test_a_hanging_folder_cannot_hold_the_answer(self):
        # live 18:2x: one folder blocked for minutes; the per-folder budget check never ran (163 s, 1 repo)
        import time as _t
        real = W._repos_under
        def slow(root, depth, deadline=float("inf")):
            if root.name == "hang":
                _t.sleep(5); return []
            return real(root, depth, deadline)
        with tempfile.TemporaryDirectory() as t:
            home = Path(t); (home / "a" / ".git").mkdir(parents=True); (home / "hang").mkdir()
            with mock.patch.object(W, "_repos_under", side_effect=slow), mock.patch.object(W, "REPO_BUDGET_S", 1.0), \
                    mock.patch.object(W, "open_access", return_value=True):
                t0 = _t.monotonic(); out = W.run({"op": "repos"}, roots=[home / "a", home / "hang"]); took = _t.monotonic() - t0
        self.assertLess(took, 2.5); self.assertIn("a", [Path(n).name for n in out["names"]]); self.assertIn("partial", out["spoken"])


if __name__ == "__main__":
    unittest.main()
