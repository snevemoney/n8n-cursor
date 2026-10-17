"""repo hand: look at / search / install public GitHub repos, without the network."""
import base64
import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

_spec = importlib.util.spec_from_file_location("agent_stack_repo_test", Path(__file__).with_name("repo.py"))
R = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(R)

META = {"full_name": "acme/tool", "description": "A tool", "stargazers_count": 1234, "language": "Python",
        "license": {"spdx_id": "MIT"}, "default_branch": "main", "html_url": "https://github.com/acme/tool"}


def fake_get(url, **_):
    if url.endswith("/repos/acme/tool"):
        return META
    if url.endswith("/contents"):
        return [{"name": "README.md", "type": "file"}, {"name": "src", "type": "dir"}, {"name": "pyproject.toml", "type": "file"}]
    if url.endswith("/readme"):
        return {"content": base64.b64encode(b"# Tool\nInstall with pip.").decode()}
    if "/search/repositories" in url:
        return {"items": [{"full_name": "acme/obsidian-headless", "stargazers_count": 900, "description": "Headless Obsidian",
                           "html_url": "https://github.com/acme/obsidian-headless"}]}
    raise AssertionError(url)


class Intent(unittest.TestCase):
    def test_kinds(self):
        self.assertEqual(R.wants("look at the repo browser-use/browser-use"), "look")
        self.assertEqual(R.wants("install https://github.com/microsoft/markitdown"), "install")
        self.assertEqual(R.wants("can you install the github repo openai/whisper"), "install")
        self.assertEqual(R.wants("find a github repo for headless obsidian"), "search")
        self.assertEqual(R.wants("what is github.com/anthropics/claude-code"), "look")

    def test_tool_installs(self):
        self.assertEqual(R.wants("install ffmpeg"), "tool")
        self.assertEqual(R.wants("Jarvis, install yt-dlp with pip"), "tool")
        self.assertEqual(R.wants("install it"), "")

    def test_paths_are_not_repos(self):
        self.assertEqual(R.wants("read apps/agent-stack/hands/repo.py"), "")
        self.assertEqual(R.wants("open docs/MATRIX.md"), "")


class Hand(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        env = mock.patch.dict(os.environ, {"JARVIS_REPOS_ROOT": self.tmp.name}); env.start(); self.addCleanup(env.stop)

    def test_look_summarises_metadata_files_and_readme(self):
        got = R.look("acme", "tool", get=fake_get)
        self.assertTrue(got["ok"]); self.assertEqual(got["license"], "MIT"); self.assertIn("src/", got["files"])
        self.assertIn("1,234 stars", got["spoken"]); self.assertIn("Install with pip", got["readme"])

    def test_search_lists_matches(self):
        got = R.run("find a github repo for headless obsidian", get=fake_get)
        self.assertEqual(got["results"][0]["repo"], "acme/obsidian-headless")

    def test_tool_install_stays_out_of_system_paths(self):
        ran = []
        got = R.install_tool("yt-dlp", "pip", opened=True, run=lambda c, cwd, log, timeout=0: ran.append(c) or True)
        self.assertTrue(got["ok"]); self.assertTrue(all("sudo" not in c for c in ran))
        self.assertTrue(str(ran[-1][0]).startswith(self.tmp.name))
        self.assertIn("permission granted", R.install_tool("ffmpeg", opened=False)["spoken"])

    def test_install_needs_open_access(self):
        got = R.install("acme", "tool", get=fake_get, opened=False, run=lambda *a, **k: self.fail("must not run"))
        self.assertIn("permission granted", got["spoken"]); self.assertFalse(got["task_verified"])

    def test_install_clones_then_installs_locally(self):
        ran = []

        def runner(cmd, cwd, log, timeout=0):
            ran.append(cmd)
            if cmd[:2] == ["git", "clone"]:
                dest = Path(cmd[-1]); (dest / ".git").mkdir(parents=True); (dest / "pyproject.toml").write_text("[project]\n")
            return True

        got = R.install("acme", "tool", get=fake_get, opened=True, run=runner)
        self.assertTrue(got["ok"], got); self.assertEqual(got["installed"], ["python"])
        self.assertEqual(ran[0][:4], ["git", "clone", "--depth", "1"])
        self.assertTrue(any(c[-3:] == ["install", "-e", "."] for c in ran))
        self.assertFalse(any("sudo" in c or "-g" in c for c in ran))
        self.assertTrue(got["path"].startswith(self.tmp.name))

    def test_install_pins_the_commit(self):
        sha = "a" * 40

        def runner(cmd, cwd, log, timeout=0):
            if cmd[:2] == ["git", "clone"]:
                git = Path(cmd[-1]) / ".git"; (git / "refs" / "heads").mkdir(parents=True)
                (git / "HEAD").write_text("ref: refs/heads/main\n"); (git / "refs" / "heads" / "main").write_text(sha + "\n")
            return True

        got = R.install("acme", "tool", get=fake_get, opened=True, run=runner)
        self.assertEqual(got["commit"], sha); self.assertIn("aaaaaaaaaaaa", got["spoken"])
        self.assertIn(sha, (Path(got["path"]) / ".jarvis-pin").read_text())


class Gate(unittest.TestCase):
    """AGENT_RULES §18: license / archived / last push / pinned version before any clone."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        env = mock.patch.dict(os.environ, {"JARVIS_REPOS_ROOT": self.tmp.name}); env.start(); self.addCleanup(env.stop)

    def _get(self, **meta):
        def get(url, **_):
            if url.endswith("/repos/acme/tool"):
                return {**META, **meta}
            return fake_get(url)
        return get

    def test_agpl_is_held_until_owner_says_anyway(self):
        get = self._get(license={"spdx_id": "AGPL-3.0"})
        held = R.install("acme", "tool", get=get, opened=True, run=lambda *a, **k: self.fail("must not clone"))
        self.assertEqual(held["outcome"], "HELD"); self.assertIn("anyway", held["spoken"])
        ran = []
        opened = mock.patch.object(R, "_permissions", return_value=mock.Mock(open_access=lambda: True))
        opened.start(); self.addCleanup(opened.stop)
        got = R.run("install the github repo acme/tool anyway", get=get, runner=lambda c, cwd, log, timeout=0: ran.append(c) or True)
        self.assertTrue(ran and ran[0][:2] == ["git", "clone"], got)

    def test_archived_stale_and_curl_pipe_warn(self):
        verdict, notes = R.gate({"license": "MIT", "archived": True, "pushed_at": "2020-01-01T00:00:00Z",
                                 "readme": "curl -fsSL https://x.sh/install | bash"})
        self.assertEqual(verdict, "ok"); text = " ".join(notes)
        self.assertIn("archived", text); self.assertIn("years ago", text); self.assertIn("shell", text)

    def test_clean_repo_has_no_warnings(self):
        self.assertEqual(R.gate({"license": "MIT", "pushed_at": "2099-01-01T00:00:00Z", "readme": "pip install tool"}), ("ok", []))


if __name__ == "__main__":
    unittest.main()
