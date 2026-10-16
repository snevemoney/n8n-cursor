"""Evens 2026-10-15 10:25: open by default, but still ask before sends/posts, spending, deletes, merges/pushes and
revealing secrets. The shell path must honour those five stops (it bypasses workspace_read's secret rules)."""
import importlib.util
import unittest
from pathlib import Path
from unittest import mock

spec = importlib.util.spec_from_file_location("kept_stops_pipeline", Path(__file__).with_name("pipeline.py"))
P = importlib.util.module_from_spec(spec)
spec.loader.exec_module(P)
HOME = str(Path.home())


def armed(argv):
    with mock.patch.object(P, "_open_access", return_value=True):
        return P._needs_confirm("agent_tools", {"op": "cli", "argv": argv}, "do it") is not None


class KeptStops(unittest.TestCase):
    def test_reading_secrets_through_the_shell_runs(self):  # Evens 10-16: flag, never stop
        for argv in (["cat", f"{HOME}/.ssh/id_rsa"], ["cat", ".env"], ["cat", f"{HOME}/.config/gh/hosts.yml"],
                     ["head", f"{HOME}/.aws/credentials"], ["less", "secrets.yaml"], ["cat", "~/.netrc"]):
            self.assertFalse(armed(argv), argv)

    def test_sends_and_posts_ask(self):
        for argv in (["gh", "issue", "create", "-t", "x"], ["gh", "pr", "create"], ["gh", "gist", "create", "f"],
                     ["osascript", "-e", 'tell app "Messages" to send "hi"'], ["mail", "-s", "x", "a@b.c"],
                     ["sendmail", "a@b.c"], ["curl", "-X", "POST", "https://example.com"]):
            self.assertTrue(armed(argv), argv)

    def test_deletes_ask(self):
        for argv in (["rmdir", "old"], ["trash", "f"], ["find", ".", "-name", "*.log", "-delete"], ["unlink", "f"], ["shred", "f"]):
            self.assertTrue(armed(argv), argv)

    def test_everyday_shell_runs_without_asking(self):
        for argv in (["ls", "-la"], ["cat", "README.md"], ["python3", "--version"], ["git", "status"],
                     ["grep", "-r", "token budget", "notes"], ["curl", "-s", "https://example.com"], ["brew", "list"]):
            self.assertFalse(armed(argv), argv)


if __name__ == "__main__":
    unittest.main()
